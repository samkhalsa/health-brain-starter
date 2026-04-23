export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  opts: { retries?: number; baseMs?: number; shouldRetry?: (err: unknown) => boolean } = {}
): Promise<T> {
  const { retries = 3, baseMs = 1000, shouldRetry = () => true } = opts;
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt === retries || !shouldRetry(err)) break;
      const wait = baseMs * Math.pow(attempt + 1, 2); // 1s, 4s, 9s
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw lastErr;
}
