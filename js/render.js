import { EVENTS } from './codec.js';
import { themeById } from './themes.js';

// Data comes from a URL anyone can craft: build DOM with textContent only, never innerHTML.
function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

function block(title, ...lines) {
  const s = el('section', 'inv-block');
  s.append(el('h2', 'inv-block-title', title));
  for (const l of lines) if (l) s.append(el('p', 'inv-block-text', l));
  return s;
}

function icsFile(data, date) {
  const pad = (n) => String(n).padStart(2, '0');
  const fmt = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const end = new Date(date.getTime() + 4 * 3600e3);
  const esc = (s = '') => s.replace(/[\\,;]/g, (c) => '\\' + c).replace(/\n/g, '\\n');
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Convite//ES', 'BEGIN:VEVENT',
    `UID:${Date.now()}@convite`, `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(date)}`, `DTEND:${fmt(end)}`,
    `SUMMARY:${esc([data.s, data.h].filter(Boolean).join(' - '))}`,
    `LOCATION:${esc([data.l, data.a].filter(Boolean).join(', '))}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  return URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
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
 * opts.premium: unlocks premium themes, removes watermark, enables countdown + envelope intro.
 * opts.preview: editor preview (no envelope intro, links still work).
 */
export function render(root, data, { premium = false, preview = false } = {}) {
  const ev = EVENTS[data.e] || EVENTS.otro;
  const theme = themeById(data.t);
  const themeId = theme.premium && !premium ? 'clasico' : theme.id;
  const date = data.d ? new Date(data.d) : null;

  const inv = el('article', 'inv');
  inv.dataset.theme = themeId;
  inv.dataset.event = data.e || 'otro';
  inv.append(el('div', 'inv-deco inv-deco--top'));

  const head = el('header', 'inv-head');
  head.append(el('p', 'inv-kicker', ev.kicker), el('h1', 'inv-title', data.h || 'Tu nombre aquí'), el('p', 'inv-sub', data.s || ev.sub));
  inv.append(head);

  if (date && !isNaN(date)) {
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

  if (data.l || data.a) {
    const place = block('Lugar', data.l, data.a);
    const maps = data.m || 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent([data.l, data.a].filter(Boolean).join(', '));
    const a = el('a', 'inv-btn', 'Ver ubicación');
    a.href = maps; a.target = '_blank'; a.rel = 'noopener';
    place.append(a);
    inv.append(place);
  }
  if (data.c) inv.append(block('Código de vestimenta', data.c));
  if (data.g) inv.append(block('Mesa de regalos', data.g));

  const actions = el('div', 'inv-actions');
  if (data.w) {
    const msg = `¡Hola! Confirmo mi asistencia a ${[data.s || ev.sub, data.h].filter(Boolean).join(' de ')}.\nNombre: \nPersonas: `;
    const a = el('a', 'inv-btn inv-btn--primary', 'Confirmar asistencia');
    a.href = `https://wa.me/${data.w}?text=${encodeURIComponent(msg)}`;
    a.target = '_blank'; a.rel = 'noopener';
    actions.append(a);
  }
  if (date && !isNaN(date)) {
    const a = el('a', 'inv-btn', 'Agregar al calendario');
    a.href = icsFile(data, date);
    a.download = 'evento.ics';
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
    env.dataset.theme = themeId;
    const btn = el('button', 'inv-envelope-btn', 'Abrir invitación');
    btn.type = 'button';
    env.append(el('div', 'inv-envelope-seal'), el('p', 'inv-envelope-to', data.h || ''), btn);
    btn.addEventListener('click', () => {
      env.classList.add('is-open');
      env.addEventListener('animationend', () => env.remove(), { once: true });
      setTimeout(() => env.remove(), 1500); // fallback if no animation defined
    });
    root.append(env);
  }
}
