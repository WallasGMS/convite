// Invitation data lives entirely in the URL hash: JSON -> deflate-raw -> base64url.
// No server, no database: every invitation is just a link.

export const EVENTS = {
  cumple:     { label: 'Cumpleaños',         sub: 'Mi cumpleaños',          kicker: 'Te invito a celebrar' },
  xv:         { label: 'XV años',            sub: 'Mis XV años',            kicker: 'Te invito a celebrar' },
  boda:       { label: 'Boda',               sub: 'Nuestra boda',           kicker: 'Nos casamos' },
  baby:       { label: 'Baby shower',        sub: 'Baby shower',            kicker: 'Te invitamos a nuestro' },
  revelacion: { label: 'Revelación',         sub: '¿Niño o niña?',          kicker: 'Te invitamos a descubrir' },
  bautizo:    { label: 'Bautizo',            sub: 'Mi bautizo',             kicker: 'Te invitamos a celebrar' },
  comunion:   { label: 'Primera comunión',   sub: 'Mi primera comunión',    kicker: 'Te invito a celebrar' },
  graduacion: { label: 'Graduación',         sub: 'Mi graduación',          kicker: 'Te invito a celebrar' },
  aniversario:{ label: 'Aniversario',        sub: 'Nuestro aniversario',    kicker: 'Celebremos juntos' },
  otro:       { label: 'Otro evento',        sub: 'Celebración',            kicker: 'Estás invitado(a) a' },
};

// field -> max length. Anything else in the payload is dropped.
// t theme, e event, h name(s), s subtitle, d date, l/a/m venue, x message, c dress code, g gifts,
// w host WhatsApp, k premium code, f parents/godparents line, n/b/o second venue (reception) name/address/time,
// y/z/u premium customizer: accent color (hex, no #), title font id, ornament id (unknown ids are ignored by render),
// p/q map pins "lat,lng" for the venue and the reception (Waze / Google Maps directions).
const LIMITS = { t: 20, e: 12, h: 60, s: 60, d: 16, l: 80, a: 160, m: 500, x: 400, c: 80, g: 200, w: 15, k: 24, f: 200, n: 80, b: 160, o: 5, y: 6, z: 12, u: 12, p: 24, q: 24 };

const validPin = (s) => {
  const m = /^(-?\d{1,2}\.\d{1,6}),(-?\d{1,3}\.\d{1,6})$/.exec(s);
  return !!m && Math.abs(m[1]) <= 90 && Math.abs(m[2]) <= 180;
};

export function normalize(raw) {
  const out = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const [key, max] of Object.entries(LIMITS)) {
    const v = raw[key];
    if (typeof v === 'string' && v.trim()) out[key] = v.trim().slice(0, max);
  }
  if (out.e && !EVENTS[out.e]) delete out.e;
  if (out.d && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(out.d)) delete out.d;
  if (out.o && !/^([01]\d|2[0-3]):[0-5]\d$/.test(out.o)) delete out.o;
  if (out.w) out.w = out.w.replace(/\D/g, '');
  if (!out.w) delete out.w;
  if (out.m && !/^https:\/\//i.test(out.m)) delete out.m;
  if (out.y && !/^[0-9a-f]{6}$/i.test(out.y)) delete out.y;
  for (const k of ['p', 'q']) if (out[k] && !validPin(out[k])) delete out[k];
  return out;
}

// Per-guest personalization travels in the query string (?para=...&pases=...) so one
// invitation hash can be shared with many guests. Untrusted, like the hash.
export function guestFrom(search) {
  const q = new URLSearchParams(search);
  const name = (q.get('para') || '').trim().slice(0, 60);
  const passes = Math.min(20, Math.max(0, parseInt(q.get('pases'), 10) || 0));
  return name || passes ? { name, passes } : null;
}

const b64enc = (u8) => btoa(String.fromCharCode(...u8)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64dec = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
const pipe = async (u8, stream) =>
  new Uint8Array(await new Response(new Blob([u8]).stream().pipeThrough(stream)).arrayBuffer());

// Older phones (iOS < 16.4, old Android WebViews) lack deflate-raw streams: load a 32 KB inflater only for them.
function loadFflate() {
  if (globalThis.fflate) return Promise.resolve(globalThis.fflate);
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = new URL('./vendor/fflate.min.js', import.meta.url).href;
    s.onload = () => resolve(globalThis.fflate);
    s.onerror = reject;
    document.head.append(s);
  });
}

async function inflate(u8) {
  try { return await pipe(u8, new DecompressionStream('deflate-raw')); }
  catch { return (await loadFflate()).inflateSync(u8); }
}

export async function encode(data) {
  const u8 = new TextEncoder().encode(JSON.stringify(normalize(data)));
  return b64enc(await pipe(u8, new CompressionStream('deflate-raw')));
}

export async function decode(str) {
  const u8 = await inflate(b64dec(str));
  return normalize(JSON.parse(new TextDecoder().decode(u8)));
}
