// Minimal RPC schema for 20260923000000_ai_usage_limits.sql.
export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: {
      voka_subscription_access: {
        Args: { p_action: string; p_user_id: string; p_snapshot?: unknown; p_force?: boolean };
        Returns: unknown;
      };
      voka_voice_control: {
        Args: { p_action: string; p_user_id?: string; p_lease_id?: string; p_call_id?: string };
        Returns: unknown;
      };
      claim_voka_ai_request: {
        Args: { p_user_id: string; p_kind: string };
        Returns: { allowed: boolean; reason?: string; retryAfter?: number };
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
