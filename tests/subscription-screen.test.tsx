import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import PlusScreen from '@/app/plus';
import type { PlusState, PurchaseOutcome } from '@/features/subscription/types';
jest.mock('@/global.css', () => ({}));

const mockRouter = { replace: jest.fn(), push: jest.fn() };
let mockUser = { id: 'account-a', is_anonymous: false };
const mockLoad = jest.fn<() => Promise<PlusState>>();
const mockPurchase = jest.fn<() => Promise<PurchaseOutcome>>();
const mockRestore = jest.fn<() => Promise<PurchaseOutcome>>();
const mockRefresh = jest.fn<() => Promise<PlusState>>();
jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useFocusEffect: (fn: () => void) =>
    jest.requireActual<typeof import('react')>('react').useEffect(fn, [fn]),
}));
jest.mock('expo-linking', () => ({ openURL: jest.fn() }));
jest.mock('@expo/vector-icons', () => ({ MaterialCommunityIcons: () => null }));
jest.mock('@/features/auth/use-auth-session', () => ({
  useAuthSession: () => ({ loading: false, session: { user: mockUser } }),
}));
jest.mock('@/components/voka-ui', () => {
  const { Text, View } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    AppScreen: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    Eyebrow: ({ children }: { children: React.ReactNode }) => <Text>{children}</Text>,
    HeaderBack: () => null,
  };
});
jest.mock('@/features/subscription/billing', () => ({
  loadVokaPlus: (...args: []) => mockLoad(...args),
  purchaseVokaPlus: () => mockPurchase(),
  restoreVokaPlus: () => mockRestore(),
  fetchPlusAccess: () => mockRefresh(),
  subscriptionManagementUrl: () => 'https://play.google.com/store/account/subscriptions',
}));
const state: PlusState = {
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
  expiresAt: null,
  store: null,
  willRenew: true,
  billingIssue: false,
  fresh: true,
  voiceRemaining: 15,
  assessmentRemaining: 25,
  resetsAt: '',
  canPurchase: true,
  canRestore: true,
  storeEntitled: false,
  price: 'Rs 999',
  managementUrl: 'https://play.google.com/store/account/subscriptions',
};
beforeEach(() => {
  jest.clearAllMocks();
  mockUser = { id: 'account-a', is_anonymous: false };
  mockLoad.mockResolvedValue(state);
  mockRefresh.mockResolvedValue(state);
  mockPurchase.mockResolvedValue('cancelled');
  mockRestore.mockResolvedValue('not-found');
});
describe('subscription screen feedback', () => {
  it('shows price, renewal period and a finite daily allowance before purchase', async () => {
    const screen = await render(<PlusScreen />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Subscribe · Rs 999/month' })).toBeEnabled(),
    );
    expect(screen.getByText('15 live session starts per day, up to 5 minutes each')).toBeTruthy();
    expect(screen.queryByText(/Unlimited/)).toBeNull();
  });
  it('shows honest coming-soon feedback with checkout disabled before launch', async () => {
    mockLoad.mockResolvedValue({
      ...state,
      config: { ...state.config, enabled: false, salesEnabled: false },
      canPurchase: false,
      canRestore: false,
      price: undefined,
    });
    const screen = await render(<PlusScreen />);
    await waitFor(() => expect(screen.getByText('Coming soon')).toBeTruthy());
    expect(screen.getByRole('button', { name: 'Not available yet' })).toBeDisabled();
    expect(screen.queryByText('Restore purchases')).toBeNull();
  });
  it('shows pending payment without a success claim or another purchase button', async () => {
    mockPurchase.mockResolvedValue('pending');
    const screen = await render(<PlusScreen />);
    await waitFor(() => expect(screen.getByText('Subscribe · Rs 999/month')).toBeTruthy());
    await fireEvent.press(screen.getByText('Subscribe · Rs 999/month'));
    await waitFor(() => expect(screen.getByText(/waiting for payment approval/)).toBeTruthy());
    expect(screen.queryByText('You’re on Plus.')).toBeNull();
    expect(screen.queryByText('Subscribe · Rs 999/month')).toBeNull();
    expect(screen.getByText('Refresh status')).toBeTruthy();
  });
  it('reports cancellation and empty restore outcomes explicitly', async () => {
    const screen = await render(<PlusScreen />);
    await waitFor(() => expect(screen.getByText('Subscribe · Rs 999/month')).toBeTruthy());
    await fireEvent.press(screen.getByText('Subscribe · Rs 999/month'));
    await waitFor(() => expect(screen.getByText(/Purchase cancelled/)).toBeTruthy());
    await fireEvent.press(screen.getByText('Restore purchases'));
    await waitFor(() => expect(screen.getByText(/No active subscription was found/)).toBeTruthy());
  });
  it('redirects guests and never loads their store identity', async () => {
    mockUser.is_anonymous = true;
    await render(<PlusScreen />);
    expect(mockRouter.replace).toHaveBeenCalledWith('/auth?mode=sign-up');
    expect(mockLoad).not.toHaveBeenCalled();
  });
  it('clears a previous account entitlement before another account finishes loading', async () => {
    mockLoad.mockResolvedValue({ ...state, isPlus: true, expiresAt: '2026-10-24T12:00:00Z' });
    const screen = await render(<PlusScreen />);
    await waitFor(() => expect(screen.getByText('You’re on Plus.')).toBeTruthy());
    mockUser = { id: 'account-b', is_anonymous: false };
    let finish!: (next: PlusState) => void;
    mockLoad.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    await screen.rerender(<PlusScreen />);
    expect(screen.queryByText('You’re on Plus.')).toBeNull();
    await act(async () => finish(state));
    expect(screen.getByText('Subscribe · Rs 999/month')).toBeTruthy();
  });
});
