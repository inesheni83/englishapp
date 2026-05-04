// Centralised mapping from caught errors (thrown by callers of authFetch + Gemini)
// to user-facing English messages. Keep these strings short and actionable.
//
// Convention used by callers:
//   - throw new Error('RATE_LIMIT')   when res.status === 429
//   - throw new Error('API_ERROR_xxx') for other non-OK responses
//   - throw new Error('PARSE_ERROR')  when JSON.parse fails on the LLM output
//   - any other Error is treated as generic.

const FALLBACK = "Something went wrong. Please try again.";

const MESSAGES = {
  RATE_LIMIT: "Too many requests. Please wait 30–60 seconds before trying again.",
  PARSE_ERROR: "We could not read the AI response. Please try again.",
  NETWORK: "Network error. Check your connection and retry.",
};

export function describeApiError(err) {
  if (!err) return FALLBACK;
  const code = typeof err === 'string' ? err : err.message;
  if (!code) return FALLBACK;
  if (MESSAGES[code]) return MESSAGES[code];
  if (code.startsWith('API_ERROR_')) {
    const status = code.slice('API_ERROR_'.length);
    return `Server error (${status}). Please try again in a moment.`;
  }
  if (/Failed to fetch|NetworkError|network/i.test(code)) {
    return MESSAGES.NETWORK;
  }
  return FALLBACK;
}
