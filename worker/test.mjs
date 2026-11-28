// node worker/test.mjs — the Worker against an in-memory KV.
import assert from 'node:assert/strict';
import worker from './index.js';
import { encode } from '../js/codec.js';

const store = new Map();
const env = { KV: {
  get: async (k, t) => (store.has(k) ? (t === 'json' ? JSON.parse(store.get(k)) : store.get(k)) : null),
  put: async (k, v) => void store.set(k, v),
} };
const call = (method, path, body) => worker.fetch(new Request('https://x.dev' + path, { method, body: body && JSON.stringify(body) }), env);

const h1 = await encode({ h: 'Ana', k: 'CNV-AAAA-BBBB' });
const h2 = await encode({ h: 'Otra', k: 'cnv-aaaa-bbbb' });

let r = await call('POST', '/api/links', { h: h1 });
assert.equal(r.status, 200);
const { id, key } = await r.json();

r = await call('GET', '/' + id + '?para=Ana');
assert.equal(r.status, 302);
assert.equal(r.headers.get('location'), 'https://wallasgms.github.io/convite/i.html?para=Ana#' + h1);

assert.equal((await call('POST', '/api/links', { h: h2 })).status, 409, 'same code, another invitation');
assert.equal((await call('PUT', '/api/links/' + id, { h: h2, key: 'wrong' })).status, 403);
assert.equal((await call('PUT', '/api/links/' + id, { h: h2, key })).status, 200, 'owner edits keep the code');
assert.equal((await (await call('GET', '/api/links/' + id)).json()).h, h2);
assert.equal((await call('POST', '/api/links', { h: 'no-es-invitacion' })).status, 400);
assert.equal((await call('POST', '/api/links', { h: await encode({ h: 'Gratis' }) })).status, 200, 'free invitations need no code');
assert.equal((await call('GET', '/nada99')).headers.get('location'), 'https://wallasgms.github.io/convite/');
console.log('ok · worker');
