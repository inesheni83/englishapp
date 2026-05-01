import { verifySupabaseJWT, unauthorizedResponse } from './_lib/auth.js';
import { checkRateLimit, rateLimitedResponse } from './_lib/rateLimit.js';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
  }

  // 1. Auth: require a valid Supabase JWT
  const auth = await verifySupabaseJWT(req.headers.get('authorization'));
  if (!auth) {
    return unauthorizedResponse('Missing or invalid authentication token');
  }

  // 2. Rate limit per user
  const rl = await checkRateLimit(auth.userId, 'gemini');
  if (!rl.ok) {
    return rateLimitedResponse(rl);
  }

  // 3. Forward to Gemini
  try {
    const body = await req.json();
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API Key is missing' }), { status: 500 });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
