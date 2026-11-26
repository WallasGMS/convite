import { HASHES } from './codes.js';

// ponytail: static hash list, a sold code can be reused by whoever sees it in a link.
// Fine for a Q35 product; move to Lemon Squeezy license API when volume justifies it.
export async function isPremium(code) {
  if (!code) return false;
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('convite:' + code.trim().toUpperCase()));
  const hex = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return HASHES.has(hex);
}
