import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { PlusAccess } from '@/features/subscription/types';

let mockUser = 'account-a';
let mockGuest = false;
const mockPurchases = {
  isConfigured: jest.fn<() => Promise<boolean>>(),
  getAppUserID: jest.fn<() => Promise<string>>(),
  setLogLevel: jest.fn<() => Promise<void>>(),
  configure: jest.fn(),
  logIn: jest.fn<() => Promise<void>>(),
  getCustomerInfo: jest.fn<() => Promise<unknown>>(),
  getOfferings: jest.fn<() => Promise<unknown>>(),
  purchaseSubscriptionOption: jest.fn<() => Promise<unknown>>(),
  purchasePackage: jest.fn<() => Promise<unknown>>(),
  restorePurchases: jest.fn<() => Promise<unknown>>(),
};
jest.mock('react-native', () => ({ Platform: { OS: 'android' } }));
jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: mockPurchases,
  LOG_LEVEL: { ERROR: 'ERROR' },
  PURCHASES_ERROR_CODE: { PURCHASE_CANCELLED_ERROR: '1', PAYMENT_PENDING_ERROR: '20' },
}));
jest.mock('@/features/auth/supabase', () => ({
  supabase: {
    auth: {
      getSession: async () => ({
        data: {
          session: { access_token: 'synthetic', user: { id: mockUser, is_anonymous: mockGuest } },
        },
      }),
    },
  },
  getSupabaseAnonKey: () => 'synthetic-public',
  getSupabaseFunctionUrl: () => 'https://voka.test/functions/v1/realtime-session',
}));

const emptyInfo = { entitlements: { active: {} } };
const activeInfo = { entitlements: { active: { voka_plus: { isActive: true } } } };
const option = {
  isBasePlan: true,
  isPrepaid: false,
  storeProductId: 'voka_plus:monthly',
  fullPricePhase: { price: { formatted: 'Rs 999' } },
};
const pkg = {
  packageType: 'MONTHLY',
  product: {
    identifier: 'voka_plus:monthly',
    subscriptionPeriod: 'P1M',
    subscriptionOptions: [option],
  },
};
const access: PlusAccess = {
  config: {
    enabled: true,
    salesEnabled: true,
    environment: 'PRODUCTION',
    androidProduct: 'voka_plus:monthly',
    iosProduct: '',
    voiceDaily: 15,
    assessmentDaily: 25,
  },
  isPlus: false,
  fresh: true,
  expiresAt: null,
  store: null,
  willRenew: false,
  billingIssue: false,
  voiceRemaining: 15,
  assessmentRemaining: 25,
  resetsAt: '2026-09-25T00:00:00Z',
};
let billing: typeof import('@/features/subscription/billing');
let fetchMock: ReturnType<typeof jest.fn<typeof fetch>>;
beforeEach(() => {
  jest.clearAllMocks();
  mockUser = 'account-a';
  mockGuest = false;
  process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY = 'goog_synthetic';
  mockPurchases.setLogLevel.mockResolvedValue(undefined);
  mockPurchases.isConfigured.mockResolvedValue(false);
  mockPurchases.getAppUserID.mockResolvedValue('previous-account');
  mockPurchases.logIn.mockResolvedValue(undefined);
  mockPurchases.getCustomerInfo.mockResolvedValue(emptyInfo);
  mockPurchases.getOfferings.mockResolvedValue({ current: { availablePackages: [pkg] } });
  mockPurchases.purchaseSubscriptionOption.mockResolvedValue({ customerInfo: activeInfo });
  mockPurchases.restorePurchases.mockResolvedValue(emptyInfo);
  fetchMock = jest
    .fn<typeof fetch>()
    .mockImplementation(async () => new Response(JSON.stringify(access), { status: 200 }));
  globalThis.fetch = fetchMock;
  jest.isolateModules(() => {
    billing = jest.requireActual('@/features/subscription/billing');
  });
});

describe('Voka Plus purchases', () => {
  it('reconciles a native SDK identity retained across a JavaScript reload', async () => {
    mockPurchases.isConfigured.mockResolvedValue(true);
    await billing.loadVokaPlus(mockUser);
    expect(mockPurchases.configure).not.toHaveBeenCalled();
    expect(mockPurchases.logIn).toHaveBeenCalledWith(mockUser);
  });
  it('shows store pricing and the configured monthly plan only', async () => {
    expect(await billing.loadVokaPlus(mockUser)).toMatchObject({
      price: 'Rs 999',
      canPurchase: true,
      isPlus: false,
    });
    expect(mockPurchases.configure).toHaveBeenCalledWith({
      apiKey: 'goog_synthetic',
      appUserID: mockUser,
    });
  });
  it('fails closed before launch and does not contact the SDK', async () => {
    fetchMock.mockImplementation(
      async () =>
        new Response(
          JSON.stringify({
            ...access,
            config: { ...access.config, enabled: false, salesEnabled: false },
          }),
        ),
    );
    expect(await billing.loadVokaPlus(mockUser)).toMatchObject({
      canPurchase: false,
      canRestore: false,
    });
    await expect(billing.purchaseVokaPlus(mockUser)).rejects.toThrow('not open');
    expect(mockPurchases.configure).not.toHaveBeenCalled();
  });
  it('rejects guests and mismatched Voka identities before store access', async () => {
    mockGuest = true;
    await expect(billing.purchaseVokaPlus(mockUser)).rejects.toThrow('Sign in');
    mockGuest = false;
    await expect(billing.purchaseVokaPlus('another-account')).rejects.toThrow('Sign in');
    expect(mockPurchases.configure).not.toHaveBeenCalled();
  });
  it('does not fall back to yearly or unrelated products', async () => {
    for (const invalid of [
      { ...pkg, packageType: 'ANNUAL' },
      { ...pkg, product: { ...pkg.product, identifier: 'wrong:monthly' } },
      { ...pkg, product: { ...pkg.product, subscriptionPeriod: 'P1Y' } },
    ]) {
      mockPurchases.getOfferings.mockResolvedValue({ current: { availablePackages: [invalid] } });
      expect((await billing.loadVokaPlus(mockUser)).canPurchase).toBe(false);
      await expect(billing.purchaseVokaPlus(mockUser)).rejects.toThrow('unavailable');
    }
    expect(mockPurchases.purchaseSubscriptionOption).not.toHaveBeenCalled();
  });
  it('does not grant paid access just because the SDK reports a purchase', async () => {
    expect(await billing.purchaseVokaPlus(mockUser)).toBe('confirming');
    expect(mockPurchases.purchaseSubscriptionOption).toHaveBeenCalledWith(option);
    expect(mockPurchases.purchasePackage).not.toHaveBeenCalled();
  });
  it('grants active UI status only after the backend confirms', async () => {
    fetchMock.mockImplementation(
      async (_url, init) =>
        new Response(
          JSON.stringify({ ...access, isPlus: JSON.parse(String(init?.body)).action === 'sync' }),
        ),
    );
    expect(await billing.purchaseVokaPlus(mockUser)).toBe('active');
  });
  it('distinguishes cancellation and pending payment without confirming access', async () => {
    mockPurchases.purchaseSubscriptionOption.mockRejectedValueOnce({ code: '1' });
    expect(await billing.purchaseVokaPlus(mockUser)).toBe('cancelled');
    mockPurchases.purchaseSubscriptionOption.mockRejectedValueOnce({ code: '20' });
    expect(await billing.purchaseVokaPlus(mockUser)).toBe('pending');
  });
  it('blocks synchronous duplicate purchases', async () => {
    const first = billing.purchaseVokaPlus(mockUser);
    await expect(billing.purchaseVokaPlus(mockUser)).rejects.toThrow('already in progress');
    await first;
    expect(mockPurchases.purchaseSubscriptionOption).toHaveBeenCalledTimes(1);
  });
  it('does not charge again when the store already has an active purchase', async () => {
    mockPurchases.getCustomerInfo.mockResolvedValue(activeInfo);
    expect(await billing.purchaseVokaPlus(mockUser)).toBe('confirming');
    expect(mockPurchases.purchaseSubscriptionOption).not.toHaveBeenCalled();
  });
  it('checks identity again after slow offering lookups', async () => {
    mockPurchases.getOfferings.mockImplementation(async () => {
      mockUser = 'account-b';
      return { current: { availablePackages: [pkg] } };
    });
    await expect(billing.purchaseVokaPlus('account-a')).rejects.toThrow('Sign in');
    expect(mockPurchases.purchaseSubscriptionOption).not.toHaveBeenCalled();
  });
  it('restores without starting another purchase and reports an empty restore', async () => {
    expect(await billing.restoreVokaPlus(mockUser)).toBe('not-found');
    mockPurchases.restorePurchases.mockResolvedValue(activeInfo);
    expect(await billing.restoreVokaPlus(mockUser)).toBe('confirming');
    expect(mockPurchases.purchaseSubscriptionOption).not.toHaveBeenCalled();
  });
  it('uses a safe store-management fallback and refuses Test Store keys in production', async () => {
    expect(billing.subscriptionManagementUrl('app_store')).toBe(
      'https://apps.apple.com/account/subscriptions',
    );
    expect(billing.subscriptionManagementUrl('https://attacker.test')).toBe(
      'https://play.google.com/store/account/subscriptions',
    );
    process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY = 'test_synthetic';
    await expect(billing.purchaseVokaPlus(mockUser)).rejects.toThrow('not available');
    expect(mockPurchases.configure).not.toHaveBeenCalled();
  });
});
