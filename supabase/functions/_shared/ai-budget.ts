type BudgetClient = {
  rpc: (
    name: 'claim_voka_ai_request',
    args: { p_user_id: string; p_kind: string },
  ) => PromiseLike<{ data: unknown; error: unknown }>;
};
export type BudgetDecision =
  { allowed: true } | { allowed: false; status: 429 | 503; error: string; retryAfter: number };

export async function claimAiBudget(
  client: BudgetClient,
  userId: string,
  kind: 'voice' | 'assessment',
): Promise<BudgetDecision> {
  const unavailable: BudgetDecision = {
    allowed: false,
    status: 503,
    error: 'Practice is temporarily unavailable. Please try again shortly.',
    retryAfter: 30,
  };
  try {
    const { data, error } = await client.rpc('claim_voka_ai_request', {
      p_user_id: userId,
      p_kind: kind,
    });
    if (error || !data || typeof data !== 'object') return unavailable;
    const result = data as Record<string, unknown>;
    if (result.allowed === true) return { allowed: true };
    if (
      result.allowed !== false ||
      typeof result.retryAfter !== 'number' ||
      !Number.isFinite(result.retryAfter)
    )
      return unavailable;
    const retryAfter = Math.min(86400, Math.max(1, Math.ceil(result.retryAfter)));
    return {
      allowed: false,
      status: result.reason === 'verification' ? 503 : 429,
      retryAfter,
      error:
        result.reason === 'verification'
          ? 'Your subscription needs to be confirmed. Open Voka Plus and refresh status, then try again. You do not need to purchase again.'
          : result.reason === 'capacity'
            ? 'Live practice has reached its service capacity. Please try again later; offline lessons remain available.'
            : result.reason === 'daily'
              ? `Today’s ${kind === 'voice' ? 'live-practice' : 'assessment'} allowance has been reached. Try again after midnight UTC; offline lessons remain available.`
              : `Please wait ${retryAfter} seconds before trying again.`,
    };
  } catch {
    return unavailable;
  }
}

export async function readBoundedJson(request: Request, limit = 128_000): Promise<unknown> {
  return JSON.parse(await readBoundedText(request, limit));
}

export async function readBoundedText(request: Request, limit = 128_000): Promise<string> {
  if (!request.body) throw new Error('Missing request body.');
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > limit) {
        await reader.cancel();
        throw new Error('Request too large.');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const body = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.length;
  }
  return new TextDecoder('utf-8', { fatal: true }).decode(body);
}
