// Run: node tools/test_core.mjs  — codec round-trip, sanitizing, guest params, old-phone fallback, premium hashes.
import assert from 'node:assert';
import { encode, decode, normalize, guestFrom, EVENTS } from '../js/codec.js';
import { THEMES } from '../js/themes.js';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';

const data = {
  t: 'xv-rosa', e: 'xv', h: 'Sofía López', s: 'Mis XV años', d: '2026-12-20T19:00', l: 'Iglesia San José', a: 'Zona 10, Guatemala',
  w: '+502 1234-5678', x: 'Te espero ✨', f: 'Mis padres Ana y Luis', n: 'Salón Real', b: 'Km 14', o: '20:30',
};
const enc = await encode(data);
const back = await decode(enc);
assert.equal(back.h, 'Sofía López');
assert.equal(back.w, '50212345678');
assert.equal(back.x, 'Te espero ✨');
assert.equal(back.f, 'Mis padres Ana y Luis');
assert.deepEqual([back.n, back.b, back.o], ['Salón Real', 'Km 14', '20:30']);
assert.match(enc, /^[A-Za-z0-9_-]+$/, 'hash must be URL-safe');

// untrusted input is cleaned
const bad = normalize({ h: 'x'.repeat(999), m: 'javascript:alert(1)', e: 'hack', d: 'nope', o: '25:99:00', evil: 1, w: 'abc', x: 42 });
assert.equal(bad.h.length, 60);
for (const k of ['m', 'e', 'd', 'o', 'evil', 'w', 'x']) assert.ok(!(k in bad), k + ' should be dropped');
// customizer: color must be 6 hex digits, font/ornament ids are length-limited strings
assert.equal(normalize({ y: '8E5BD0' }).y, '8E5BD0');
for (const y of ['#8e5bd0', 'red', 'zzzzzz', '8e5']) assert.ok(!('y' in normalize({ y })), 'bad color kept: ' + y);
assert.deepEqual([back.y, back.z, back.u], [undefined, undefined, undefined]);
// map pins for Waze: "lat,lng" only, in range
assert.equal(normalize({ p: '14.634900,-90.506900' }).p, '14.634900,-90.506900');
for (const p of ['91.1,10.1', '14.6,-190.5', '14,-90', 'javascript:1', '14.6,-90.5&x=1']) assert.ok(!('p' in normalize({ p })), 'bad pin kept: ' + p);
assert.deepEqual(normalize(null), {});
assert.deepEqual(normalize('str'), {});
await assert.rejects(decode('%%%'));          // garbage link -> error page, not a crash
await assert.rejects(decode(''));

// guests
assert.equal(guestFrom(''), null);
assert.deepEqual(guestFrom('?para=Familia%20P%C3%A9rez&pases=4'), { name: 'Familia Pérez', passes: 4 });
assert.equal(guestFrom('?pases=999').passes, 20);
assert.equal(guestFrom('?pases=-3&para=Ana').passes, 0);
assert.equal(guestFrom('?para=' + 'a'.repeat(200)).name.length, 60);

// old-phone fallback inflater decodes the same links
const fflate = createRequire(import.meta.url)('../js/vendor/fflate.min.js');
const raw = Uint8Array.from(Buffer.from(enc, 'base64url'));
assert.equal(JSON.parse(new TextDecoder().decode(fflate.inflateSync(raw))).h, 'Sofía López');

// catalog sanity
for (const id of Object.keys(EVENTS)) assert.ok(id.length <= 12, 'event id fits LIMITS.e: ' + id);
assert.equal(new Set(THEMES.map((t) => t.id)).size, THEMES.length);
const css = readFileSync(new URL('../css/invite.css', import.meta.url), 'utf8');
for (const t of THEMES) assert.ok(css.includes(`[data-theme="${t.id}"]`), 'missing CSS for theme ' + t.id);
assert.ok(!css.includes('@import'), 'fonts load per theme from themes.js, not a global @import');

// every code in csv hashes into js/codes.js
const codesJs = readFileSync(new URL('../js/codes.js', import.meta.url), 'utf8');
const codes = readFileSync(new URL('../private/codes.csv', import.meta.url), 'utf8').trim().split(/\r?\n/).slice(1).map((r) => r.split(',')[0]);
for (const c of codes) assert.ok(codesJs.includes(createHash('sha256').update('convite:' + c).digest('hex')), 'hash missing for ' + c);

// premium: real code works everywhere, demo code only when viewing, and no real code leaks into public pages
const { isPremium, DEMO } = await import('../js/premium.js');
assert.equal(await isPremium(' ' + codes[1].toLowerCase()), true);
assert.equal(await isPremium('CNV-FAKE-0000'), false);
assert.equal(await isPremium(DEMO), false);
assert.equal(await isPremium(DEMO, { allowDemo: true }), true);
const site = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
for (const m of site.matchAll(/i\.html[^#"]*#([A-Za-z0-9_-]+)/g)) {
  const k = (await decode(m[1])).k;
  assert.ok(!k || k === DEMO, 'index.html leaks a sellable code');
}

console.log(`ok · ${codes.length} códigos · link completo ${enc.length} caracteres`);
