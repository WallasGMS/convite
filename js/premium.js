import { HASHES } from './codes.js';

// Public demo code for the landing gallery: unlocks premium when *viewing*, rejected by the editor.
export const DEMO = 'CNV-DEMO-GALERIA';

// ponytail: static hash list, a sold code can be reused by whoever sees it in a link.
// Fine for a Q35 product; move to Lemon Squeezy license API when volume justifies it.
export async function isPremium(code, { allowDemo = false } = {}) {
  if (!code) return false;
  const norm = code.trim().toUpperCase();
  if (norm === DEMO) return allowDemo;
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('convite:' + norm));
  const hex = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return HASHES.has(hex);
}
