// Convite API (Cloudflare Worker + KV): short invitation links and one invitation per premium code.
// KV: "l:<id>" -> {h, key, t}   the invitation hash; `key` is the owner's secret to update it
//     "c:<CODE>" -> <id>         the invitation a premium code belongs to
// GET /<id> redirects to the static site (i.html#<hash>), keeping ?para=&pases= for guest links.
const SITE = 'https://wallasgms.github.io/convite/';
const DEMO = 'CNV-DEMO-GALERIA';
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS', 'Access-Control-Allow-Headers': 'content-type' };
const ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'; // no 0/O, 1/l/I: easy to read aloud

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...CORS, 'content-type': 'application/json' } });
const rand = (n) => [...crypto.getRandomValues(new Uint8Array(n))].map((b) => ABC[b % ABC.length]).join('');

// Same format as js/codec.js: base64url(deflate-raw(JSON)). Anything else is rejected.
async function payload(h) {
  if (typeof h !== 'string' || h.length > 8000 || !/^[\w-]+$/.test(h)) return null;
  try {
    const u8 = Uint8Array.from(atob(h.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
    const o = JSON.parse(await new Response(new Blob([u8]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text());
    return o && typeof o === 'object' && !Array.isArray(o) ? o : null;
  } catch { return null; }
}

// A premium code may live in one invitation only (its own edits are fine).
async function claim(env, p, id) {
  const code = typeof p.k === 'string' ? p.k.trim().toUpperCase() : '';
  if (!code || code === DEMO) return true;
  const owner = await env.KV.get('c:' + code);
  if (owner && owner !== id) return false;
  if (!owner) await env.KV.put('c:' + code, id);
  return true;
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const [, a, b, c] = url.pathname.split('/');
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    if (a === 'api' && b === 'links') {
      if (req.method === 'GET' && c) {
        const rec = await env.KV.get('l:' + c, 'json');
        return rec ? json({ id: c, h: rec.h }) : json({ error: 'not_found' }, 404);
      }
      const body = await req.json().catch(() => ({}));
      const p = await payload(body.h);
      if (!p) return json({ error: 'bad_invitation' }, 400);
      if (req.method === 'POST' && !c) {
        let id = rand(7);
        while (await env.KV.get('l:' + id)) id = rand(7);
        if (!(await claim(env, p, id))) return json({ error: 'code_used' }, 409);
        const key = rand(24);
        await env.KV.put('l:' + id, JSON.stringify({ h: body.h, key, t: Date.now() }));
        return json({ id, key });
      }
      if (req.method === 'PUT' && c) {
        const rec = await env.KV.get('l:' + c, 'json');
        if (!rec) return json({ error: 'not_found' }, 404);
        if (rec.key !== body.key) return json({ error: 'forbidden' }, 403);
        if (!(await claim(env, p, c))) return json({ error: 'code_used' }, 409);
        await env.KV.put('l:' + c, JSON.stringify({ ...rec, h: body.h, t: Date.now() }));
        return json({ id: c });
      }
      return json({ error: 'method' }, 405);
    }

    if (req.method === 'GET' && a && !b && /^[A-Za-z0-9]{4,12}$/.test(a)) {
      const rec = await env.KV.get('l:' + a, 'json');
      if (rec) return Response.redirect(SITE + 'i.html' + url.search + '#' + rec.h, 302);
    }
    return Response.redirect(SITE, 302);
  },
};
