// Invitation data lives entirely in the URL hash: JSON -> deflate-raw -> base64url.
// No server, no database: every invitation is just a link.

export const EVENTS = {
  cumple:     { label: 'Cumpleaños',      sub: 'Mi cumpleaños',          kicker: 'Te invito a celebrar' },
  xv:         { label: 'XV años',         sub: 'Mis XV años',            kicker: 'Te invito a celebrar' },
  boda:       { label: 'Boda',            sub: 'Nuestra boda',           kicker: 'Nos casamos' },
  baby:       { label: 'Baby shower',     sub: 'Baby shower',            kicker: 'Te invitamos a nuestro' },
  bautizo:    { label: 'Bautizo',         sub: 'Mi bautizo',             kicker: 'Te invitamos a celebrar' },
  graduacion: { label: 'Graduación',      sub: 'Mi graduación',          kicker: 'Te invito a celebrar' },
  otro:       { label: 'Otro evento',     sub: 'Celebración',            kicker: 'Estás invitado(a) a' },
};

// field -> max length. Anything else in the payload is dropped.
const LIMITS = { t: 20, e: 12, h: 60, s: 60, d: 16, l: 80, a: 160, m: 500, x: 400, c: 80, g: 200, w: 15, k: 24 };

export function normalize(raw) {
  const out = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const [key, max] of Object.entries(LIMITS)) {
    const v = raw[key];
    if (typeof v === 'string' && v.trim()) out[key] = v.trim().slice(0, max);
  }
  if (out.e && !EVENTS[out.e]) delete out.e;
  if (out.d && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(out.d)) delete out.d;
  if (out.w) out.w = out.w.replace(/\D/g, '') || undefined;
  if (!out.w) delete out.w;
  if (out.m && !/^https:\/\//i.test(out.m)) delete out.m;
  return out;
}

const b64enc = (u8) => btoa(String.fromCharCode(...u8)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64dec = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
const pipe = async (u8, stream) =>
  new Uint8Array(await new Response(new Blob([u8]).stream().pipeThrough(stream)).arrayBuffer());

export async function encode(data) {
  const u8 = new TextEncoder().encode(JSON.stringify(normalize(data)));
  return b64enc(await pipe(u8, new CompressionStream('deflate-raw')));
}

export async function decode(str) {
  const u8 = await pipe(b64dec(str), new DecompressionStream('deflate-raw'));
  return normalize(JSON.parse(new TextDecoder().decode(u8)));
}
