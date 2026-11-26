// Run: node tools/test_core.mjs  — checks codec round-trip, sanitizing, and premium hash format.
import assert from 'node:assert';
import { encode, decode, normalize } from '../js/codec.js';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const data = { t: 'xv-rosa', e: 'xv', h: 'Sofía López', s: 'Mis XV años', d: '2026-12-20T19:00', l: 'Salón Real', a: 'Zona 10, Guatemala', w: '+502 1234-5678', x: 'Te espero ✨' };
const back = await decode(await encode(data));
assert.equal(back.h, 'Sofía López');
assert.equal(back.w, '50212345678');
assert.equal(back.x, 'Te espero ✨');
// untrusted input is cleaned
const bad = normalize({ h: 'x'.repeat(999), m: 'javascript:alert(1)', e: 'hack', d: 'nope', evil: 1 });
assert.equal(bad.h.length, 60);
assert.ok(!('m' in bad) && !('e' in bad) && !('d' in bad) && !('evil' in bad));
// first code in csv must hash into js/codes.js
const code = readFileSync(new URL('../private/codes.csv', import.meta.url), 'utf8').split('\n')[1].split(',')[0];
const h = createHash('sha256').update('convite:' + code).digest('hex');
assert.ok(readFileSync(new URL('../js/codes.js', import.meta.url), 'utf8').includes(h));
console.log('ok, link length for full invite:', (await encode(data)).length);
