import { supabase } from '../supabaseClient.js';

// Wrapper around fetch that automatically attaches the current Supabase JWT
// as Authorization: Bearer <token>. All calls to /api/* must use this helper
// so that the Edge Functions can authenticate the request.
export async function authFetch(url, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = new Headers(options.headers || {});
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }
  return fetch(url, { ...options, headers });
}
