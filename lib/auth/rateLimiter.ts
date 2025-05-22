import { RateLimiterMemory } from "rate-limiter-flexible";

const rateLimiter = new RateLimiterMemory({
  points: 5, // 5 requests
  duration: 60, // per 60 seconds per IP
});

export async function consumeRateLimit(key: string) {
  try {
    await rateLimiter.consume(key);
    return true; // allowed
  } catch {
    return false; // blocked (too many requests)
  }
}
