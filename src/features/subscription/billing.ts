import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesError,
  type PurchasesPackage,
} from 'react-native-purchases';

export const VOKA_PLUS_ENTITLEMENT = 'voka_plus';

let configuredUserId: string | undefined;
let activePackage: PurchasesPackage | undefined;

function apiKey() {
  if (Platform.OS === 'android') return process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY?.trim();
  if (Platform.OS === 'ios') return process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY?.trim();
  return undefined;
}

export const isVokaPlusConfigured = Boolean(apiKey());

function isPlus(customerInfo: CustomerInfo) {
  return Boolean(customerInfo.entitlements.active[VOKA_PLUS_ENTITLEMENT]?.isActive);
}

async function configure(userId: string) {
  const key = apiKey();
  if (!key) {
    throw new Error('Voka Plus purchases are not configured for this build.');
  }
  if (!configuredUserId) {
    await Purchases.setLogLevel(LOG_LEVEL.ERROR);
    Purchases.configure({ apiKey: key, appUserID: userId });
    configuredUserId = userId;
  } else if (configuredUserId !== userId) {
    await Purchases.logIn(userId);
    configuredUserId = userId;
  }
}

export async function loadVokaPlus(userId: string) {
  await configure(userId);
  const [customerInfo, offerings] = await Promise.all([
    Purchases.getCustomerInfo(),
    Purchases.getOfferings(),
  ]);
  activePackage =
    offerings.current?.availablePackages.find((item) => item.packageType === 'MONTHLY') ??
    offerings.current?.availablePackages[0];
  return {
    isPlus: isPlus(customerInfo),
    managementUrl: customerInfo.managementURL,
    price: activePackage?.product.priceString,
  };
}

export async function purchaseVokaPlus(userId: string) {
  await configure(userId);
  if (!activePackage) await loadVokaPlus(userId);
  if (!activePackage) throw new Error('No Voka Plus store product is available in this build.');
  try {
    const { customerInfo } = await Purchases.purchasePackage(activePackage);
    return isPlus(customerInfo);
  } catch (reason) {
    if ((reason as PurchasesError | undefined)?.userCancelled) return false;
    throw reason;
  }
}

export async function restoreVokaPlus(userId: string) {
  await configure(userId);
  return isPlus(await Purchases.restorePurchases());
}
