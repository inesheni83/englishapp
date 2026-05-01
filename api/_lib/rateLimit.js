// Shared rate limiter using Upstash Redis REST API.
// Edge-compatible: no SDK, just fetch.
//
// Strategy: two sliding windows per user
//   - short window: PER_MINUTE_LIMIT requests / 60 sec
//   - long window:  PER_DAY_LIMIT requests / 24 hours
//
// If UPSTASH_REDIS_REST_URL is not configured, the limiter is disabled
// (fail-open) so local dev keeps working until the user finishes setup.

const PER_MINUTE_LIMIT = 10;
const PER_DAY_LIMIT = 200;

async function incrementWindow(key, windowSeconds) {
  // INCR + EXPIRE atomically via pipeline
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const res = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([
      ['INCR', key],
      ['EXPIRE', key, String(windowSeconds), 'NX'],
    ]),
  });
  if (!res.ok) throw new Error(`Upstash error ${res.status}`);
  const arr = await res.json();
  // arr is [{ result: <count> }, { result: 0|1 }]
  const count = arr?.[0]?.result;
  return typeof count === 'number' ? count : null;
}

export async function checkRateLimit(userId, route = 'gemini') {
  // If Upstash is not configured, allow (fail-open during dev).
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return { ok: true, skipped: true };
  }

  try {
    const minuteKey = `rl:${route}:${userId}:m`;
    const dayKey = `rl:${route}:${userId}:d`;

    const [minuteCount, dayCount] = await Promise.all([
      incrementWindow(minuteKey, 60),
      incrementWindow(dayKey, 86400),
    ]);

    if (minuteCount !== null && minuteCount > PER_MINUTE_LIMIT) {
      return { ok: false, reason: 'minute', retryAfter: 60 };
    }
    if (dayCount !== null && dayCount > PER_DAY_LIMIT) {
      return { ok: false, reason: 'day', retryAfter: 3600 };
    }
    return { ok: true };
  } catch (err) {
    // On Upstash error, fail-open but log. Better UX than 500-ing every request.
    console.error('Rate limit check failed:', err);
    return { ok: true, skipped: true, error: true };
  }
}

export function rateLimitedResponse(check) {
  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      reason: check.reason,
      retryAfter: check.retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(check.retryAfter || 60),
      },
    },
  );
}
