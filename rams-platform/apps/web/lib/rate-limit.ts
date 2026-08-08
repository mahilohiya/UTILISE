const attempts = new Map<string, { count: number; resetAt: number }>();

const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000;

export async function checkRateLimit(key: string): Promise<boolean> {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const { Ratelimit } = await import("@upstash/ratelimit");
      const { Redis } = await import("@upstash/redis");
      const ratelimit = new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(5, "15 m"),
      });
      const { success } = await ratelimit.limit(`login_${key}`);
      return success;
    } catch {
      // fall through to in-memory limiter
    }
  }

  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_ATTEMPTS) return false;
  entry.count += 1;
  return true;
}
