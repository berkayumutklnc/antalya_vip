/**
 * Lightweight in-memory IP-based rate limiter.
 *
 * Limitations (documented honestly):
 *  - In-memory only: state is lost on deploy/restart and not shared
 *    across serverless instances or multiple pods.
 *  - Suitable for single-instance/dev/small-scale production.
 *  - For distributed rate limiting, swap the store implementation for
 *    Upstash Redis or Firestore counters.
 *
 * Usage:
 *   const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });
 *   // In a route handler:
 *   const ip = getClientIp(req);
 *   if (!limiter.check(ip)) {
 *     return NextResponse.json({ error: "Too many requests" }, { status: 429 });
 *   }
 */

// ---------------------------------------------------------------------------
// IP extraction
// ---------------------------------------------------------------------------

/**
 * Best-effort client IP from common headers.
 * Falls back to "unknown" — never returns an empty string.
 */
export function getClientIp(req: Request): string {
  const headers = req.headers;
  // Standard proxy headers (Vercel, Cloudflare, Firebase Hosting CDN, etc.)
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    // Take the left-most (original client) address
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }
  return headers.get("x-real-ip") ?? "unknown";
}

// ---------------------------------------------------------------------------
// Limiter
// ---------------------------------------------------------------------------

interface RateLimiterOptions {
  /** Sliding window size in milliseconds. */
  windowMs: number;
  /** Maximum requests per window per key. */
  max: number;
}

interface Entry {
  timestamps: number[];
}

export function createRateLimiter(opts: RateLimiterOptions) {
  const store = new Map<string, Entry>();

  // Periodic cleanup to avoid memory leaks (every 60 s)
  const CLEANUP_INTERVAL = 60_000;
  let lastCleanup = Date.now();

  function cleanup(now: number) {
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;
    const cutoff = now - opts.windowMs;
    for (const [key, entry] of store) {
      entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
      if (entry.timestamps.length === 0) store.delete(key);
    }
  }

  return {
    /**
     * Returns `true` if the request is within limits, `false` if rate-limited.
     */
    check(key: string): boolean {
      const now = Date.now();
      cleanup(now);

      const cutoff = now - opts.windowMs;
      let entry = store.get(key);
      if (!entry) {
        entry = { timestamps: [] };
        store.set(key, entry);
      }

      // Prune old timestamps for this key
      entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

      if (entry.timestamps.length >= opts.max) {
        return false; // over limit
      }

      entry.timestamps.push(now);
      return true;
    },
  };
}

// ---------------------------------------------------------------------------
// Per-endpoint limiters (shared across requests within the same instance)
// ---------------------------------------------------------------------------

/** Public reservation creation: 5 per minute per IP */
export const reservationCreateLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 5,
});

/** Public lookup: 15 per minute per IP */
export const publicLookupLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 15,
});

/** Public cancel request: 5 per minute per IP */
export const publicCancelLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 5,
});

/** Availability check: 30 per minute per IP */
export const availabilityLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 30,
});
