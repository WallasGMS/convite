const SELLER_WA = '50200000000'; // TODO: número del vendedor

import { EVENTS, encode } from './codec.js';
import { THEMES } from './themes.js';
import { render } from './render.js';
import { isPremium } from './premium.js';

const COUNTRIES = [
  ['502', 'GT +502'], ['52', 'MX +52'], ['503', 'SV +503'], ['504', 'HN +504'], ['505', 'NI +505'],
  ['506', 'CR +506'], ['507', 'PA +507'], ['57', 'CO +57'], ['1', 'US +1'],
];
const DRAFT = 'convite:draft';
const TEXT_FIELDS = ['h', 's', 'd', 'l', 'a', 'm', 'x', 'c', 'g', 'wn', 'k'];

const $ = (id) => document.getElementById(id);
const mk = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

const st = { e: 'xv', t: 'clasico', cc: '502', unlocked: false };
let prevSub = '';

// ---------- controls ----------
$('cc').append(...COUNTRIES.map(([v, l]) => new Option(l, v)));

const eventsBox = $('events');
for (const [id, ev] of Object.entries(EVENTS)) {
  const b = mk('button', 'ed-event', ev.label);
  b.type = 'button'; b.dataset.id = id; b.setAttribute('role', 'radio');
  b.onclick = () => setEvent(id);
  eventsBox.append(b);
}

const themesBox = $('themes');
for (const th of THEMES) {
  const b = mk('button', 'ed-theme');
  b.type = 'button'; b.dataset.id = th.id; b.setAttribute('role', 'radio');
  const thumb = mk('div', 'ed-thumb');
  thumb.setAttribute('aria-hidden', 'true');
  const mini = mk('div', 'ed-thumb-in');
  render(mini, { t: th.id, e: 'xv', h: 'Ana' }, { premium: true, preview: true });
  mini.querySelectorAll('a').forEach((a) => a.removeAttribute('href')); // thumbnails must not be tabbable
  thumb.append(mini);
  const name = mk('span', 'ed-theme-name', th.name);
  if (th.premium) b.append(thumb, name, mk('span', 'ed-lock', 'Premium'));
  else b.append(thumb, name);
  b.onclick = () => { st.t = th.id; sync(); };
  themesBox.append(b);
}

// ---------- state ----------
function setEvent(id) {
  const sub = $('s');
  if (!sub.value || sub.value === prevSub) sub.value = EVENTS[id].sub;
  st.e = id;
  prevSub = EVENTS[id].sub;
  sync();
}

const themeIsPremium = () => THEMES.find((t) => t.id === st.t)?.premium;

function data() {
  const w = $('wn').value.replace(/\D/g, '').replace(/^0+/, '');
  const o = { t: st.t, e: st.e, w: w ? st.cc + w : '' };
  for (const k of ['h', 's', 'd', 'l', 'a', 'm', 'x', 'c', 'g']) o[k] = $(k).value;
  if (st.unlocked) o.k = $('k').value;
  return o;
}

function sync() {
  for (const b of eventsBox.children) b.setAttribute('aria-checked', b.dataset.id === st.e);
  for (const b of themesBox.children) {
    b.setAttribute('aria-checked', b.dataset.id === st.t);
    b.classList.toggle('is-locked', THEMES.find((t) => t.id === b.dataset.id).premium && !st.unlocked);
  }
  $('cc').value = st.cc;
  $('buy').hidden = true;
  $('result').hidden = true;
  $('err').textContent = '';
  // Preview shows a premium theme even without a code; the code gate is at "Generar".
  render($('preview'), data(), { premium: st.unlocked || !!themeIsPremium(), preview: true });
  const d = { ...st, unlocked: undefined };
  for (const k of TEXT_FIELDS) d[k] = $(k).value;
  try { localStorage.setItem(DRAFT, JSON.stringify(d)); } catch { /* private mode: no draft */ }
}

async function applyCode(quiet) {
  const code = $('k').value.trim();
  const msg = $('code-msg');
  st.unlocked = await isPremium(code);
  msg.className = 'ed-msg' + (st.unlocked ? ' ed-msg--ok' : '');
  msg.textContent = st.unlocked
    ? '✓ Código válido. Todos los diseños están desbloqueados.'
    : (code && !quiet ? 'Ese código no es válido. Revisa que esté completo, con guiones.' : '');
  sync();
}

// ---------- events ----------
$('form').addEventListener('input', (e) => {
  if (e.target.id === 'k') { st.unlocked = false; $('code-msg').textContent = ''; }
  if (e.target.id === 'cc') st.cc = e.target.value;
  sync();
});
$('apply').onclick = () => applyCode();
$('k').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); applyCode(); } });

$('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const err = $('err');
  if (!$('h').value.trim()) { err.textContent = 'Escribe el nombre de quien celebra.'; $('h').focus(); return; }
  if (!$('d').value) { err.textContent = 'Elige la fecha y hora del evento.'; $('d').focus(); return; }
  if (themeIsPremium() && !st.unlocked) {
    $('buy-wa').href = `https://wa.me/${SELLER_WA}?text=` + encodeURIComponent(
      `¡Hola! Quiero un código premium de Convite para mi invitación (diseño ${THEMES.find((t) => t.id === st.t).name}).`);
    $('buy').hidden = false; $('result').hidden = true;
    $('buy').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  $('buy').hidden = true;
  const link = new URL('i.html#' + await encode(data()), location.href).href;
  $('link').value = link;
  $('open').href = link;
  $('share-wa').href = 'https://wa.me/?text=' + encodeURIComponent(`Te invito a mi celebración. Abre tu invitación aquí: ${link}`);
  $('share').hidden = !navigator.share;
  $('result').hidden = false;
  $('result').scrollIntoView({ behavior: 'smooth', block: 'center' });
});

$('copy').onclick = async () => {
  const b = $('copy');
  try { await navigator.clipboard.writeText($('link').value); }
  catch { $('link').select(); document.execCommand('copy'); }
  b.textContent = 'Enlace copiado';
  setTimeout(() => (b.textContent = 'Copiar enlace'), 2000);
};
$('share').onclick = () => navigator.share({ title: 'Mi invitación', url: $('link').value }).catch(() => {});

// ---------- init: draft, then ?e= ----------
try {
  const d = JSON.parse(localStorage.getItem(DRAFT) || 'null');
  if (d) {
    if (EVENTS[d.e]) st.e = d.e;
    if (THEMES.some((t) => t.id === d.t)) st.t = d.t;
    if (COUNTRIES.some((c) => c[0] === d.cc)) st.cc = d.cc;
    for (const k of TEXT_FIELDS) if (typeof d[k] === 'string') $(k).value = d[k];
  }
} catch { /* corrupt draft: start clean */ }

prevSub = EVENTS[st.e].sub; // a subtitle the user edited stays; the untouched default follows the event
const qe = new URLSearchParams(location.search).get('e');
setEvent(qe && EVENTS[qe] ? qe : st.e);
if ($('k').value) applyCode(true);
