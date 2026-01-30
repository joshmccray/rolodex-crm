// Simple in-memory rate limiter
// For production, use Redis-based rate limiting

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const limits: Map<string, RateLimitEntry> = new Map();

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const defaultConfigs: Record<string, RateLimitConfig> = {
  spark_idx: { maxRequests: 1500, windowMs: 5 * 60 * 1000 }, // 5 minutes
  spark_vow: { maxRequests: 4000, windowMs: 5 * 60 * 1000 },
  rentcast: { maxRequests: 100, windowMs: 60 * 1000 }, // 1 minute
};

export function checkRateLimit(
  key: string,
  apiType: 'spark_idx' | 'spark_vow' | 'rentcast' = 'rentcast'
): { allowed: boolean; remaining: number; resetMs: number } {
  const config = defaultConfigs[apiType];
  const now = Date.now();
  const entry = limits.get(key);

  if (!entry || now - entry.windowStart >= config.windowMs) {
    // Start new window
    limits.set(key, { count: 1, windowStart: now });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetMs: config.windowMs,
    };
  }

  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetMs: config.windowMs - (now - entry.windowStart),
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetMs: config.windowMs - (now - entry.windowStart),
  };
}

export function incrementUsage(key: string): void {
  const entry = limits.get(key);
  if (entry) {
    entry.count++;
  }
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of limits.entries()) {
    // Remove entries older than 10 minutes
    if (now - entry.windowStart > 10 * 60 * 1000) {
      limits.delete(key);
    }
  }
}, 60 * 1000);
