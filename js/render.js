import { EVENTS } from './codec.js';
import { themeById, loadThemeFonts } from './themes.js';

// Data comes from a URL anyone can craft: build DOM with textContent only, never innerHTML.
function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

function link(cls, text, href) {
  const a = el('a', cls, text);
  a.href = href; a.target = '_blank'; a.rel = 'noopener';
  return a;
}

function block(title, ...lines) {
  const s = el('section', 'inv-block');
  s.append(el('h2', 'inv-block-title', title));
  for (const l of lines) if (l) s.append(el('p', 'inv-block-text', l));
  return s;
}

const mapsSearch = (...parts) =>
  'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(parts.filter(Boolean).join(', '));

const pad = (n) => String(n).padStart(2, '0');
const stamp = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
const isApple = () => /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);

// Apple devices open .ics natively; elsewhere (mostly Android here) Google Calendar is the reliable path.
function calendarLink(data, date) {
  const end = new Date(date.getTime() + 4 * 3600e3);
  const title = [data.s, data.h].filter(Boolean).join(' - ');
  const where = [data.l, data.a].filter(Boolean).join(', ');
  if (!isApple()) {
    const q = new URLSearchParams({ action: 'TEMPLATE', text: title, dates: `${stamp(date)}/${stamp(end)}`, location: where });
    return { href: 'https://calendar.google.com/calendar/render?' + q, download: null };
  }
  const esc = (s = '') => s.replace(/[\\,;]/g, (c) => '\\' + c).replace(/\n/g, '\\n');
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Convite//ES', 'BEGIN:VEVENT',
    `UID:${Date.now()}@convite`, `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(date)}`, `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(title)}`, `LOCATION:${esc(where)}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  return { href: URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })), download: 'evento.ics' };
}

function countdown(date) {
  const box = el('div', 'inv-countdown');
  const units = [['días', 86400e3], ['horas', 3600e3], ['min', 60e3], ['seg', 1e3]];
  const cells = units.map(([label]) => {
    const c = el('div', 'inv-cd-cell');
    const n = el('span', 'inv-cd-num', '0');
    c.append(n, el('span', 'inv-cd-label', label));
    box.append(c);
    return n;
  });
  const tick = () => {
    let left = Math.max(0, date - Date.now());
    units.forEach(([, ms], i) => { cells[i].textContent = Math.floor(left / ms); left %= ms; });
  };
  tick();
  const id = setInterval(() => (box.isConnected ? tick() : clearInterval(id)), 1000);
  return box;
}

/**
 * Render an invitation into `root` (replaces its content).
 * opts.premium: unlocks premium themes, removes watermark, enables countdown, envelope intro and guest passes.
 * opts.preview: editor preview (no envelope intro, links still work).
 * opts.guest: {name, passes} from guestFrom(location.search); shown only when premium.
 */
export function render(root, data, { premium = false, preview = false, guest = null } = {}) {
  const ev = EVENTS[data.e] || EVENTS.otro;
  const picked = themeById(data.t);
  const theme = picked.premium && !premium ? themeById('clasico') : picked;
  const date = data.d ? new Date(data.d) : null;
  const hasDate = date && !isNaN(date);
  if (!premium) guest = null;
  loadThemeFonts(theme);

  const inv = el('article', 'inv');
  inv.dataset.theme = theme.id;
  inv.dataset.event = data.e || 'otro';
  inv.append(el('div', 'inv-deco inv-deco--top'));

  const head = el('header', 'inv-head');
  head.append(el('p', 'inv-kicker', ev.kicker), el('h1', 'inv-title', data.h || 'Tu nombre aquí'), el('p', 'inv-sub', data.s || ev.sub));
  inv.append(head);

  if (guest) {
    const g = el('div', 'inv-guest');
    if (guest.name) g.append(el('p', 'inv-guest-name', guest.name));
    if (guest.passes) g.append(el('p', 'inv-guest-passes', `Pase válido para ${guest.passes} ${guest.passes === 1 ? 'persona' : 'personas'}`));
    inv.append(g);
  }

  if (hasDate) {
    const d = el('div', 'inv-date');
    d.append(
      el('span', 'inv-weekday', date.toLocaleDateString('es', { weekday: 'long' })),
      el('span', 'inv-day', String(date.getDate())),
      el('span', 'inv-month', date.toLocaleDateString('es', { month: 'long', year: 'numeric' })),
      el('span', 'inv-time', date.toLocaleTimeString('es', { hour: 'numeric', minute: '2-digit', hour12: true })),
    );
    inv.append(d);
    if (premium) inv.append(countdown(date));
  }

  if (data.x) inv.append(el('p', 'inv-msg', data.x));
  if (data.f) inv.append(block('Con la bendición de', data.f));

  const second = data.n || data.b;
  if (data.l || data.a) {
    const place = block(second ? 'Ceremonia' : 'Lugar', data.l, data.a);
    place.append(link('inv-btn', 'Ver ubicación', data.m || mapsSearch(data.l, data.a)));
    inv.append(place);
  }
  if (second) {
    let time = '';
    if (data.o) {
      const [hh, mm] = data.o.split(':').map(Number);
      time = new Date(2000, 0, 1, hh, mm).toLocaleTimeString('es', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    const rec = block('Recepción', data.n, data.b, time && 'A las ' + time);
    rec.append(link('inv-btn', 'Ver ubicación', mapsSearch(data.n, data.b)));
    inv.append(rec);
  }
  if (data.c) inv.append(block('Código de vestimenta', data.c));
  if (data.g) inv.append(block('Mesa de regalos', data.g));

  const actions = el('div', 'inv-actions');
  if (data.w) {
    const who = guest?.name || '';
    const msg = `¡Hola! Confirmo mi asistencia a ${[data.s || ev.sub, data.h].filter(Boolean).join(' de ')}.\n`
      + `Nombre: ${who}\n${guest?.passes ? `Pases: ${guest.passes}` : 'Personas: '}`;
    actions.append(link('inv-btn inv-btn--primary', 'Confirmar asistencia', `https://wa.me/${data.w}?text=${encodeURIComponent(msg)}`));
  }
  if (hasDate) {
    const cal = calendarLink(data, date);
    const a = link('inv-btn', 'Agregar al calendario', cal.href);
    if (cal.download) { a.download = cal.download; a.removeAttribute('target'); }
    actions.append(a);
  }
  if (actions.children.length) inv.append(actions);
  inv.append(el('div', 'inv-deco inv-deco--bottom'));

  root.replaceChildren(inv);

  if (!premium) {
    const brand = el('a', 'inv-brand', 'Hecha con Convite · Crea la tuya gratis');
    brand.href = new URL('crear.html', document.baseURI).href;
    root.append(brand);
  }

  if (premium && !preview) {
    const env = el('div', 'inv-envelope');
    env.setAttribute('role', 'dialog');
    env.setAttribute('aria-modal', 'true');
    env.setAttribute('aria-label', 'Invitación cerrada');
    inv.inert = true;
    env.dataset.theme = theme.id;
    const btn = el('button', 'inv-envelope-btn', 'Abrir invitación');
    btn.type = 'button';
    env.append(
      el('div', 'inv-envelope-seal'),
      el('p', 'inv-envelope-label', guest?.name ? 'Una invitación para' : 'Una invitación de'),
      el('p', 'inv-envelope-to', guest?.name || data.h || ''),
      btn,
    );
    btn.addEventListener('click', () => {
      env.classList.add('is-open');
      inv.inert = false;
      env.addEventListener('animationend', () => env.remove(), { once: true });
      setTimeout(() => env.remove(), 1500); // fallback if no animation defined
    });
    root.append(env);
    btn.focus({ preventScroll: true });
  }
}
