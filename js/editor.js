const SELLER_WA = '50230801909';

import { EVENTS, encode } from './codec.js';
import { THEMES, FONTS, ORNAMENTS } from './themes.js';
import { render } from './render.js';
import { isPremium } from './premium.js';

const COUNTRIES = [
  ['502', 'GT +502'], ['52', 'MX +52'], ['503', 'SV +503'], ['504', 'HN +504'], ['505', 'NI +505'],
  ['506', 'CR +506'], ['507', 'PA +507'], ['57', 'CO +57'], ['1', 'US +1'],
];
const DRAFT = 'convite:draft';
const TEXT_FIELDS = ['h', 's', 'd', 'l', 'a', 'm', 'x', 'c', 'g', 'wn', 'k', 'f', 'n', 'b', 'o', 'gl', 'y', 'z', 'u', 'p', 'q'];
const MAX_GUESTS = 300;
// Digits required after the country code.
const WA_DIGITS = { 502: 8, 503: 8, 504: 8, 505: 8, 506: 8, 507: 8, 52: 10, 57: 10, 1: 10 };
const SAMPLES = {
  cumple: { h: 'Diego Alejandro', l: 'Salón Jardín Las Flores', a: '6a avenida 12-30, zona 10, Ciudad de Guatemala', x: 'Ven a celebrar conmigo. ¡Habrá pastel, música y muchas sorpresas!', c: 'Casual', g: 'Lluvia de sobres' },
  xv: { h: 'Valeria Sofía', l: 'Salón Los Arcos', a: '12 calle 4-25, zona 15, Ciudad de Guatemala', x: 'Será una noche inolvidable y quiero compartirla contigo.', c: 'Formal, tonos pastel', g: 'Lluvia de sobres', f: 'Mis padres: Ana Gómez y Luis López · Padrinos: Carmen y José Pérez' },
  boda: { h: 'María José & Carlos Andrés', l: 'Iglesia de San Francisco', a: '6a avenida y 13 calle, zona 1, Ciudad de Guatemala', x: 'Con alegría te invitamos a compartir el día más especial de nuestras vidas.', c: 'Formal', g: 'Lluvia de sobres', f: 'Nuestros padres: Ana Gómez y Luis López · Rosa Morales y Mario Castillo', n: 'Hacienda San Jerónimo', b: 'Km 24 carretera a El Salvador, Santa Catarina Pinula', o: '19:00' },
  baby: { h: 'Familia Hernández', l: 'Casa de la abuela Marta', a: '3a calle 5-10, zona 2, Mixco', x: 'Estamos esperando a nuestro pequeño tesoro y queremos celebrarlo contigo.', g: 'Pañales y ropita, talla recién nacido' },
  revelacion: { h: 'Andrea y Pablo', l: 'Salón Villa Linda', a: '10a avenida 8-45, zona 14, Ciudad de Guatemala', x: '¿Será niño o niña? Ven a descubrirlo con nosotros.', c: 'Rosa o azul, como tu corazón te diga' },
  bautizo: { h: 'Mateo Sebastián', l: 'Parroquia Santa Cruz del Quiché', a: '4a calle 2-18, zona 1, Santa Cruz del Quiché', x: 'Comparte con nosotros este día tan especial en la vida de nuestro hijo.', c: 'Ropa clara', f: 'Padres: Lucía Ramírez y Jorge Méndez · Padrinos: Elena y Raúl Ajú' },
  comunion: { h: 'Camila Fernanda', l: 'Iglesia La Merced', a: '5a avenida 11-70, zona 1, Antigua Guatemala', x: 'Acompáñame a recibir a Jesús por primera vez.', c: 'Blanco', f: 'Mis padres: Sandra y Héctor Orellana · Mi madrina: Tía Patricia' },
  graduacion: { h: 'Javier Estuardo', l: 'Salón Real Plaza', a: '7a avenida 20-35, zona 9, Ciudad de Guatemala', x: 'Después de tanto esfuerzo, llegó el momento de celebrar. ¡Te espero!', c: 'Semiformal' },
  aniversario: { h: 'Rosa y Armando', l: 'Restaurante El Mirador', a: '2a avenida 3-50, zona 4, Quetzaltenango', x: 'Veinticinco años juntos. Celebremos con quienes más queremos.', c: 'Elegante' },
  otro: { h: 'Familia Barrios', l: 'Casa Club Los Pinos', a: '8a calle 1-20, zona 16, Ciudad de Guatemala', x: 'Será un gusto contar con tu compañía.' },
};

const $ = (id) => document.getElementById(id);
const mk = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

const st = { e: 'xv', t: 'clasico', cc: '502', unlocked: false, link: '' };
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

$('z').append(...FONTS.map((f) => new Option(f.name, f.id)));
$('u').append(...ORNAMENTS.map((o) => new Option(o.name, o.id)));

// Exclusive (hidden) designs only show up when the seller sends crear.html?t=<id>.
const qt = new URLSearchParams(location.search).get('t');
const themesBox = $('themes');
for (const th of THEMES.filter((t) => !t.hidden || t.id === qt)) {
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
const customized = () => $('ycus').checked || !!$('z').value || !!$('u').value;
const needsCode = () => themeIsPremium() || customized();

function data() {
  const w = $('wn').value.replace(/\D/g, '').replace(/^0+/, '');
  const o = { t: st.t, e: st.e, w: w ? st.cc + w : '' };
  for (const k of ['h', 's', 'd', 'l', 'a', 'm', 'x', 'c', 'g', 'f', 'p']) o[k] = $(k).value;
  if ($('rec').checked) for (const k of ['n', 'b', 'o', 'q']) o[k] = $(k).value;
  if ($('ycus').checked) o.y = $('y').value.slice(1);
  o.z = $('z').value; o.u = $('u').value;
  if (st.unlocked) o.k = $('k').value.trim().toUpperCase();
  // People paste maps.app.goo.gl/... or http://...: codec only keeps https links.
  if (o.m) o.m = o.m.trim().replace(/^http:\/\//i, 'https://').replace(/^(?!https:\/\/)/i, 'https://');
  return o;
}

function sync() {
  for (const b of eventsBox.children) b.setAttribute('aria-checked', b.dataset.id === st.e);
  for (const b of themesBox.children) {
    b.setAttribute('aria-checked', b.dataset.id === st.t);
    b.classList.toggle('is-locked', THEMES.find((t) => t.id === b.dataset.id).premium && !st.unlocked);
  }
  $('cc').value = st.cc;
  $('y-box').hidden = !$('ycus').checked;
  pinUi('p', 'a'); pinUi('q', 'b');
  $('buy').hidden = true;
  $('warn').hidden = true;
  $('result').hidden = true;
  clearErrs();
  refresh();
}

// Preview + draft only (used while typing in the guest list, which lives inside the result block).
function refresh() {
  $('rec-box').hidden = !$('rec').checked;
  // Preview shows a premium theme even without a code; the code gate is at "Generar".
  // With a valid code and the result visible, the first listed guest personalizes the preview.
  const guest = st.unlocked && !$('result').hidden ? guestLines()[0] : null;
  render($('preview'), data(), { premium: st.unlocked || !!needsCode(), preview: true, guest });
  const d = { e: st.e, t: st.t, cc: st.cc, rec: $('rec').checked, ycus: $('ycus').checked };
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

// ---------- validation ----------
function setErr(k, msg) {
  $('err-' + k).textContent = msg;
  $(k).setAttribute('aria-invalid', msg ? 'true' : 'false');
}
function clearErrs() { for (const k of ['h', 'd', 'wn']) setErr(k, ''); }

function validate() {
  clearErrs();
  const bad = [];
  if (!$('h').value.trim()) { setErr('h', 'Escribe el nombre de quien celebra.'); bad.push('h'); }
  if (!$('d').value) { setErr('d', 'Elige la fecha y hora del evento.'); bad.push('d'); }
  const w = $('wn').value.replace(/\D/g, '').replace(/^0+/, '');
  const need = WA_DIGITS[st.cc];
  if (w && need && w.length !== need) {
    setErr('wn', `Para este país el número debe tener ${need} dígitos, sin el código de país. Escribiste ${w.length}.`);
    bad.push('wn');
  }
  return bad;
}

function softWarnings() {
  const w = [];
  if (!$('wn').value.replace(/\D/g, '')) w.push('Sin WhatsApp tus invitados no podrán confirmar.');
  const d = new Date($('d').value);
  if (!isNaN(d) && d < new Date()) w.push('La fecha ya pasó. ¿Seguro que es la correcta?');
  return w;
}

// ---------- events ----------
$('form').addEventListener('input', (e) => {
  if (e.target.id === 'k') { st.unlocked = false; $('code-msg').textContent = ''; }
  if (e.target.id === 'cc') st.cc = e.target.value;
  if (e.target.closest('#result')) { refresh(); return; }
  sync();
});
$('apply').onclick = () => applyCode();
$('k').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); applyCode(); } });

// Fills only empty fields, so nothing the user typed is overwritten.
$('sample').onclick = () => {
  const smp = SAMPLES[st.e];
  for (const [k, v] of Object.entries(smp)) {
    if ('nbo'.includes(k)) continue;
    if (!$(k).value.trim()) $(k).value = v;
  }
  if (!$('d').value) {
    const d = new Date(Date.now() + 60 * 864e5);
    const p = (n) => String(n).padStart(2, '0');
    $('d').value = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T18:00`;
  }
  if (smp.n && !$('rec').checked && !$('n').value && !$('b').value && !$('o').value) {
    $('rec').checked = true;
    for (const k of ['n', 'b', 'o']) $(k).value = smp[k];
  }
  if (['f', 'c', 'g', 'm'].some((k) => $(k).value)) $('more').open = true;
  sync();
};

$('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  $('warn').hidden = true;
  const bad = validate();
  if (bad.length) { $(bad[0]).focus(); return; }
  if ($('k').value.trim() && !st.unlocked) await applyCode();
  if (needsCode() && !st.unlocked) {
    $('buy-title').textContent = themeIsPremium() ? 'Este diseño es premium' : 'Personalizar color, letra y adorno es premium';
    $('buy-wa').href = `https://wa.me/${SELLER_WA}?text=` + encodeURIComponent(
      `¡Hola! Quiero un código premium de Convite para mi invitación (diseño ${THEMES.find((t) => t.id === st.t).name}).`);
    $('buy').hidden = false; $('result').hidden = true;
    $('buy').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  $('buy').hidden = true;
  const soft = softWarnings();
  if (soft.length) {
    $('warn-text').textContent = soft.join(' ');
    $('warn').hidden = false;
    $('warn').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  generate();
});
$('force').onclick = () => { $('warn').hidden = true; generate(); };

async function generate() {
  const link = new URL('i.html#' + await encode(data()), location.href).href;
  st.link = link;
  $('link').value = link;
  $('open').href = link;
  $('share-wa').href = 'https://wa.me/?text=' + encodeURIComponent(`Te invito a mi celebración. Abre tu invitación aquí: ${link}`);
  $('share').hidden = !navigator.share;
  $('guests-lock').hidden = st.unlocked;
  $('guests-on').hidden = !st.unlocked;
  $('guests-buy').href = `https://wa.me/${SELLER_WA}?text=` + encodeURIComponent(
    '¡Hola! Quiero un código premium de Convite para crear pases personalizados por invitado.');
  $('glist').replaceChildren(); $('gcopy').hidden = true; $('gmsg').textContent = '';
  $('result').hidden = false;
  refresh();
  $('result').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ---------- map pin for Waze / Google Maps ----------
// Leaflet + OpenStreetMap: free, no API key. Loaded only when someone opens the map.
const CENTER = { 502: [14.6349, -90.5069], 503: [13.6929, -89.2182], 504: [14.0723, -87.1921], 505: [12.1364, -86.2514],
  506: [9.9281, -84.0907], 507: [8.9824, -79.5199], 52: [19.4326, -99.1332], 57: [4.711, -74.0721], 1: [38.9072, -77.0369] };
const ISO = { 502: 'gt', 503: 'sv', 504: 'hn', 505: 'ni', 506: 'cr', 507: 'pa', 52: 'mx', 57: 'co', 1: 'us' };
const LEAFLET = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet';
let map, marker, pinFor;

function pinUi(k, addr) {
  const set = !!$(k).value;
  $('pin-' + k).textContent = set ? 'Cambiar el punto en el mapa' : 'Marcar en el mapa para Waze';
  $('pin-' + k + '-clear').hidden = !set;
  const msg = $('pin-' + k + '-msg');
  msg.className = 'ed-msg' + (set ? ' ed-msg--ok' : '');
  msg.textContent = set ? '✓ Ubicación confirmada: tus invitados tendrán botones de Waze y Google Maps.'
    : $(addr).value.trim() ? 'Marca el punto en el mapa para que Waze lleve a tus invitados a la entrada exacta.' : '';
}

function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  const css = document.createElement('link');
  Object.assign(css, { rel: 'stylesheet', href: LEAFLET + '.css', integrity: 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=', crossOrigin: '' });
  document.head.append(css);
  return new Promise((resolve, reject) => {
    const js = document.createElement('script');
    Object.assign(js, { src: LEAFLET + '.js', integrity: 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=', crossOrigin: '' });
    js.onload = () => resolve(window.L); js.onerror = reject;
    document.head.append(js);
  });
}

// ponytail: public Nominatim (1 request/s, button-triggered only). Swap for a paid geocoder if volume grows.
async function geocode(q) {
  if (!q.trim()) return null;
  const u = 'https://nominatim.openstreetmap.org/search?' + new URLSearchParams({ format: 'jsonv2', limit: '1', 'accept-language': 'es', countrycodes: ISO[st.cc] || '', q });
  try { const [hit] = await (await fetch(u)).json(); return hit ? [+hit.lat, +hit.lon] : null; } catch { return null; }
}

const mapMsg = (t) => { $('map-msg').textContent = t; };
function placePin(ll, zoom) { marker.setLatLng(ll); map.setView(ll, zoom ?? Math.max(map.getZoom(), 17)); }

async function openMap(k) {
  pinFor = k;
  const [addr, name] = k === 'p' ? ['a', 'l'] : ['b', 'n'];
  $('map-q').value = [$(addr).value, $(name).value].map((v) => v.trim()).filter(Boolean).join(', ');
  mapMsg('Cargando mapa…');
  $('map-dlg').showModal();
  let L;
  try { L = await loadLeaflet(); } catch { mapMsg('No se pudo cargar el mapa. Revisa tu conexión e inténtalo otra vez.'); return; }
  if (!map) {
    map = L.map('map', { zoomControl: true }).setView(CENTER[st.cc] || CENTER[502], 12);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map);
    const icon = L.divIcon({ className: 'ed-pin-icon', iconSize: [36, 46], iconAnchor: [18, 44],
      html: '<svg viewBox="0 0 24 30" width="36" height="46" aria-hidden="true"><path d="M12 0C5.4 0 0 5.2 0 11.7 0 20.4 12 30 12 30s12-9.6 12-18.3C24 5.2 18.6 0 12 0z" fill="#d6336c"/><circle cx="12" cy="11.5" r="4.6" fill="#fff"/></svg>' });
    marker = L.marker(map.getCenter(), { draggable: true, icon, keyboard: true, title: 'Lugar del evento' }).addTo(map);
    map.on('click', (e) => marker.setLatLng(e.latlng));
  }
  map.invalidateSize();
  const saved = $(k).value;
  if (saved) { placePin(saved.split(',').map(Number), 17); mapMsg(''); return; }
  await findOnMap();
}

async function findOnMap() {
  mapMsg('Buscando…');
  const q = $('map-q').value;
  const hit = await geocode(q) || await geocode(q.split(',').slice(-2).join(','));
  if (hit) { placePin(hit, 17); mapMsg('Revisa que el pin esté en la entrada. Si no, toca el lugar correcto o arrastra el pin.'); }
  else { placePin(CENTER[st.cc] || CENTER[502], 12); mapMsg('No encontramos esa dirección exacta. Acerca el mapa y toca el lugar del evento.'); }
}

document.querySelectorAll('[data-pin]').forEach((b) => { b.onclick = () => openMap(b.dataset.pin); });
document.querySelectorAll('[data-clear]').forEach((b) => { b.onclick = () => { $(b.dataset.clear).value = ''; sync(); }; });
$('map-find').onclick = findOnMap;
$('map-q').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); findOnMap(); } });
$('map-cancel').onclick = () => $('map-dlg').close();
$('map-ok').onclick = () => {
  if (!marker) return;
  const { lat, lng } = marker.getLatLng();
  $(pinFor).value = `${lat.toFixed(6)},${lng.toFixed(6)}`;
  $('map-dlg').close();
  sync();
};
$('map-me').onclick = () => {
  if (!navigator.geolocation) { mapMsg('Tu navegador no permite usar tu ubicación.'); return; }
  mapMsg('Buscando tu ubicación…');
  navigator.geolocation.getCurrentPosition(
    (p) => { placePin([p.coords.latitude, p.coords.longitude], 18); mapMsg('Listo. Ajusta el pin si hace falta.'); },
    () => mapMsg('No pudimos obtener tu ubicación. Toca el lugar en el mapa.'),
    { enableHighAccuracy: true, timeout: 10000 });
};

// ---------- guest links (premium) ----------
// One line per guest: "Familia Pérez, 4" (passes optional).
function guestLines() {
  const out = [];
  for (const line of $('gl').value.split('\n')) {
    const m = line.trim().match(/^(.*?)\s*[,;]\s*(\d+)$/);
    const name = (m ? m[1] : line.trim()).slice(0, 60);
    if (!name) continue;
    out.push({ name, passes: m ? Math.min(20, parseInt(m[2], 10)) : 0 });
  }
  return out;
}

const guestUrl = (g) => {
  const u = new URL(st.link);
  u.search = new URLSearchParams(g.passes ? { para: g.name, pases: g.passes } : { para: g.name });
  return u.href;
};

let guestLinks = [];
$('gmake').onclick = () => {
  const all = guestLines();
  guestLinks = all.slice(0, MAX_GUESTS).map((g) => ({ ...g, url: guestUrl(g) }));
  $('gmsg').textContent = !all.length ? 'Escribe al menos un invitado, uno por línea.'
    : all.length > MAX_GUESTS ? `Solo se crearon los primeros ${MAX_GUESTS} invitados.` : `${all.length} enlaces listos.`;
  $('gcopy').hidden = !all.length;
  $('glist').replaceChildren(...guestLinks.map((g) => {
    const li = mk('li', 'ed-gitem');
    const who = mk('span', 'ed-gname', g.name + (g.passes ? ` · ${g.passes} ${g.passes === 1 ? 'pase' : 'pases'}` : ''));
    const wa = mk('a', 'ed-btn', 'Enviar por WhatsApp');
    wa.target = '_blank'; wa.rel = 'noopener';
    wa.setAttribute('aria-label', 'Enviar por WhatsApp a ' + g.name);
    wa.href = 'https://wa.me/?text=' + encodeURIComponent(
      `¡Hola ${g.name}! Te invitamos a nuestra celebración. Aquí está tu invitación personalizada`
      + `${g.passes ? ` (válida para ${g.passes} ${g.passes === 1 ? 'persona' : 'personas'})` : ''}: ${g.url}`);
    li.append(who, wa);
    return li;
  }));
  refresh();
};

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); }
  catch { const t = mk('textarea'); t.value = text; document.body.append(t); t.select(); document.execCommand('copy'); t.remove(); }
}
$('gcopy').onclick = async () => {
  await copyText(guestLinks.map((g) => `${g.name}: ${g.url}`).join('\n'));
  $('gcopy').textContent = 'Enlaces copiados';
  setTimeout(() => ($('gcopy').textContent = 'Copiar todos'), 2000);
};

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
    if (THEMES.some((t) => t.id === d.t && (!t.hidden || t.id === qt))) st.t = d.t;
    if (COUNTRIES.some((c) => c[0] === d.cc)) st.cc = d.cc;
    for (const k of TEXT_FIELDS) if (typeof d[k] === 'string') $(k).value = d[k];
    $('rec').checked = d.rec === true;
    $('ycus').checked = d.ycus === true;
    if (!FONTS.some((f) => f.id === $('z').value)) $('z').value = '';
    if (!ORNAMENTS.some((o) => o.id === $('u').value)) $('u').value = '';
    if (['f', 'c', 'g', 'm'].some((k) => $(k).value)) $('more').open = true;
  }
} catch { /* corrupt draft: start clean */ }

prevSub = EVENTS[st.e].sub; // a subtitle the user edited stays; the untouched default follows the event
if (qt && THEMES.some((t) => t.id === qt)) st.t = qt;
const qe = new URLSearchParams(location.search).get('e');
setEvent(qe && EVENTS[qe] ? qe : st.e);
if ($('k').value) applyCode(true);
