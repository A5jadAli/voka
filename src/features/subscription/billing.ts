import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
  type CustomerInfo,
  type PurchasesPackage,
} from 'react-native-purchases';
import { getSupabaseAnonKey, getSupabaseFunctionUrl, supabase } from '@/features/auth/supabase';
import type { PlusAccess, PlusState, PurchaseOutcome } from './types';

export const VOKA_PLUS_ENTITLEMENT = 'voka_plus';
let configuredUserId: string | undefined;
let queue: Promise<unknown> = Promise.resolve();
let changingPurchase = false;

function apiKey() {
  if (Platform.OS === 'android') return process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY?.trim();
  if (Platform.OS === 'ios') return process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY?.trim();
  return undefined;
}
export const isVokaPlusConfigured = Boolean(apiKey());

async function requireUser(userId: string) {
  const result = await supabase?.auth.getSession();
  const session = result?.data.session;
  if (result?.error || !session || session.user.is_anonymous || session.user.id !== userId)
    throw new Error('Sign in to your Voka account before continuing.');
  return session;
}

// Serialize the complete operation, not just logIn: an account switch must not
// change the SDK identity while another account's purchase sheet is open.
function serial<T>(action: () => Promise<T>): Promise<T> {
  const next = queue.then(action, action);
  queue = next.catch(() => undefined);
  return next;
}

async function configure(userId: string) {
  await requireUser(userId);
  const key = apiKey();
  if (!key || !(Platform.OS === 'android' ? key.startsWith('goog_') : key.startsWith('appl_')))
    throw new Error('Store purchases are not available in this build.');
  if (!configuredUserId) {
    await Purchases.setLogLevel(LOG_LEVEL.ERROR);
    if (await Purchases.isConfigured()) {
      configuredUserId = await Purchases.getAppUserID();
    } else {
      Purchases.configure({ apiKey: key, appUserID: userId });
      configuredUserId = userId;
    }
  }
  if (configuredUserId !== userId) {
    await Purchases.logIn(userId);
    configuredUserId = userId;
  }
  await requireUser(userId);
}

export async function fetchPlusAccess(userId: string, force = false): Promise<PlusAccess> {
  const session = await requireUser(userId);
  const url = getSupabaseFunctionUrl()?.replace(/\/realtime-session$/, '/subscription-status');
  if (!url) throw new Error('Account services are not configured.');
  const response = await fetch(url, {
    method: 'POST',
    signal: AbortSignal.timeout(15_000),
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
      ...(getSupabaseAnonKey() ? { apikey: getSupabaseAnonKey()! } : {}),
    },
    body: JSON.stringify({ action: force ? 'sync' : 'status' }),
  });
  await requireUser(userId);
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? 'Your subscription could not be loaded.');
  if (
    !body.config ||
    typeof body.isPlus !== 'boolean' ||
    typeof body.config.salesEnabled !== 'boolean'
  )
    throw new Error('The subscription service returned an invalid response.');
  return body as PlusAccess;
}

export function subscriptionManagementUrl(store?: string | null) {
  return store === 'app_store' || (!store && Platform.OS === 'ios')
    ? 'https://apps.apple.com/account/subscriptions'
    : 'https://play.google.com/store/account/subscriptions';
}

function storeEntitled(info: CustomerInfo) {
  // Display/purchase-suppression hint only; this NEVER authorizes paid AI use.
  return Boolean(info.entitlements.active[VOKA_PLUS_ENTITLEMENT]?.isActive);
}

async function monthlyPackage(access: PlusAccess): Promise<PurchasesPackage | undefined> {
  const expected =
    Platform.OS === 'android' ? access.config.androidProduct : access.config.iosProduct;
  const offerings = await Purchases.getOfferings();
  return offerings.current?.availablePackages.find(
    (item) =>
      item.packageType === 'MONTHLY' &&
      item.product.identifier === expected &&
      item.product.subscriptionPeriod === 'P1M',
  );
}

function monthlyPrice(pkg?: PurchasesPackage) {
  if (!pkg) return undefined;
  if (Platform.OS !== 'android') return pkg.product.priceString;
  const base = pkg.product.subscriptionOptions?.find(
    (option) =>
      option.isBasePlan && !option.isPrepaid && option.storeProductId === pkg.product.identifier,
  );
  return base?.fullPricePhase?.price.formatted;
}

export function loadVokaPlus(userId: string): Promise<PlusState> {
  return serial(async () => {
    const access = await fetchPlusAccess(userId);
    const state: PlusState = {
      ...access,
      canPurchase: false,
      canRestore: false,
      storeEntitled: false,
      managementUrl: subscriptionManagementUrl(access.store),
    };
    if (!access.config.enabled || !apiKey()) return state;
    try {
      await configure(userId);
      state.canRestore = true;
      const info = await Purchases.getCustomerInfo();
      state.storeEntitled = storeEntitled(info);
      if (!access.isPlus && !state.storeEntitled && access.config.salesEnabled) {
        const pkg = await monthlyPackage(access);
        state.price = monthlyPrice(pkg);
        state.canPurchase = Boolean(state.price);
        if (!state.canPurchase)
          state.storeError =
            'This plan is not available from your store yet. Please try again later.';
      }
    } catch {
      state.storeError = 'The store could not be reached. Check your connection and try again.';
    }
    await requireUser(userId);
    return state;
  });
}

async function confirm(userId: string): Promise<PurchaseOutcome> {
  try {
    return (await fetchPlusAccess(userId, true)).isPlus ? 'active' : 'confirming';
  } catch {
    await requireUser(userId);
    return 'confirming';
  }
}

function changePurchase(userId: string, action: () => Promise<PurchaseOutcome>) {
  if (changingPurchase)
    return Promise.reject(new Error('A purchase or restore is already in progress.'));
  changingPurchase = true;
  return serial(async () => {
    await requireUser(userId);
    return action();
  }).finally(() => {
    changingPurchase = false;
  });
}

export function purchaseVokaPlus(userId: string): Promise<PurchaseOutcome> {
  return changePurchase(userId, async () => {
    const access = await fetchPlusAccess(userId);
    if (access.isPlus) return 'active';
    if (!access.config.enabled || !access.config.salesEnabled)
      throw new Error('Voka Plus is not open for new subscriptions yet.');
    await configure(userId);
    if (storeEntitled(await Purchases.getCustomerInfo())) return confirm(userId);
    const pkg = await monthlyPackage(access);
    if (!pkg || !monthlyPrice(pkg))
      throw new Error('The monthly plan is unavailable. Please try again later.');
    await requireUser(userId);
    try {
      if (Platform.OS === 'android') {
        // Buy the displayed full-price base plan, never an arbitrary default offer.
        const option = pkg.product.subscriptionOptions!.find(
          (item) =>
            item.isBasePlan && !item.isPrepaid && item.storeProductId === pkg.product.identifier,
        )!;
        await Purchases.purchaseSubscriptionOption(option);
      } else await Purchases.purchasePackage(pkg);
    } catch (reason) {
      const error = reason as { code?: string; userCancelled?: boolean } | undefined;
      if (error?.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR || error?.userCancelled)
        return 'cancelled';
      if (error?.code === PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR) return 'pending';
      throw new Error(
        'The purchase could not be completed. Check your store account or try Restore purchases if you were charged.',
      );
    }
    await requireUser(userId);
    return confirm(userId);
  });
}

export function restoreVokaPlus(userId: string): Promise<PurchaseOutcome> {
  return changePurchase(userId, async () => {
    const access = await fetchPlusAccess(userId);
    if (!access.config.enabled) throw new Error('Subscriptions are not available yet.');
    await configure(userId);
    const info = await Purchases.restorePurchases();
    await requireUser(userId);
    const confirmed = await confirm(userId);
    if (confirmed === 'active') return confirmed;
    return storeEntitled(info) ? 'confirming' : 'not-found';
  });
}
