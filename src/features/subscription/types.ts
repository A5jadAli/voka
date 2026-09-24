export type PlusAccess = {
  config: {
    enabled: boolean;
    salesEnabled: boolean;
    environment: 'PRODUCTION' | 'SANDBOX';
    androidProduct: string;
    iosProduct: string;
    voiceDaily: number;
    assessmentDaily: number;
  };
  isPlus: boolean;
  expiresAt: string | null;
  store: string | null;
  willRenew: boolean;
  billingIssue: boolean;
  fresh: boolean;
  voiceRemaining: number;
  assessmentRemaining: number;
  resetsAt: string;
};

export type PlusState = PlusAccess & {
  price?: string;
  canPurchase: boolean;
  canRestore: boolean;
  storeEntitled: boolean;
  managementUrl: string;
  storeError?: string;
};

export type PurchaseOutcome = 'active' | 'cancelled' | 'pending' | 'confirming' | 'not-found';
