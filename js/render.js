import { EVENTS } from './codec.js';
import { themeById, loadThemeFonts, FONTS, ORNAMENTS } from './themes.js';

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

// Directions: a confirmed pin ("lat,lng") gives Waze and Maps the exact spot; an address alone is searched;
// a venue name alone gets no button (it would send guests to the wrong place).
function navButtons(name, address, pin, mapsUrl) {
  const box = el('div', 'inv-nav');
  if (pin) {
    box.append(link('inv-btn inv-btn--waze', 'Ir con Waze', `https://waze.com/ul?ll=${pin}&navigate=yes`),
      link('inv-btn', 'Google Maps', 'https://www.google.com/maps/search/?api=1&query=' + pin));
  } else if (address) {
    box.append(link('inv-btn inv-btn--waze', 'Ir con Waze', 'https://waze.com/ul?navigate=yes&q=' + encodeURIComponent([address, name].filter(Boolean).join(', '))),
      link('inv-btn', 'Google Maps', mapsUrl || mapsSearch(name, address)));
  } else if (mapsUrl) {
    box.append(link('inv-btn', 'Ver ubicación', mapsUrl));
  }
  return box.children.length ? box : null;
}

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

// ---------- premium customizer: user accent color, title font, ornament ----------
const hex2rgb = (h) => (h.length === 3 ? [...h].map((c) => c + c) : h.match(/../g)).map((x) => parseInt(x, 16));
const rgb2hex = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
const lum = (c) => {
  const [r, g, b] = c.map((v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
// Push `c` toward black (light bg) or white (dark bg) until it reaches `min` contrast: any picked color stays readable.
function readable(c, bg, min) {
  const to = lum(bg) > 0.4 ? [0, 0, 0] : [255, 255, 255];
  for (let t = 0; t <= 1; t += 0.05) { const m = mix(c, to, t); if (contrast(m, bg) >= min) return m; }
  return to;
}
function themeBg(node) {
  const v = getComputedStyle(node).getPropertyValue('--bg').trim();
  const m = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  return m ? hex2rgb(m[1]) : [255, 255, 255];
}

// CSS variables to set on the card and its envelope (both carry data-theme).
function customVars(data, node) {
  const vars = {};
  if (data.y) {
    const c = hex2rgb(data.y), bg = themeBg(node), white = [255, 255, 255], dark = [26, 26, 26];
    let btn = c, on = '#fff';
    if (contrast(c, white) < 4.5) {
      if (contrast(c, dark) >= 4.5) on = '#1a1a1a';
      else btn = readable(c, white, 4.5);
    }
    Object.assign(vars, {
      '--accent': '#' + data.y, '--accent-d': rgb2hex(readable(c, mix(bg, c, 0.1), 4.5)),
      '--btn': rgb2hex(btn), '--on-accent': on,
      '--line': `#${data.y}73`, '--cell-bd': `#${data.y}73`,
      '--title-color': rgb2hex(readable(c, bg, 3)), '--day-color': rgb2hex(readable(c, bg, 3)),
      '--env-flap': rgb2hex(mix(c, bg, 0.7)),
    });
  }
  const font = FONTS.find((f) => f.id === data.z);
  if (font) {
    loadThemeFonts(font);
    Object.assign(vars, { '--f-display': font.css, '--tw': font.w });
    if (font.script) Object.assign(vars, { '--f-msg': 'var(--f-body)', '--msg-style': 'normal' });
  }
  return vars;
}
const applyVars = (node, vars) => { for (const [k, v] of Object.entries(vars)) node.style.setProperty(k, v); };

function countdown(date, animate) {
  const box = el('div', 'inv-countdown');
  const units = [['días', 86400e3], ['horas', 3600e3], ['min', 60e3], ['seg', 1e3]];
  const cells = units.map(([label]) => {
    const c = el('div', 'inv-cd-cell');
    const n = el('span', 'inv-cd-num', '0');
    c.append(n, el('span', 'inv-cd-label', label));
    box.append(c);
    return n;
  });
  const tick = (first) => {
    let left = Math.max(0, date - Date.now());
    units.forEach(([, ms], i) => {
      const v = String(Math.floor(left / ms)); left %= ms;
      const n = cells[i];
      if (n.textContent === v) return; // only touch cells whose value changed
      n.textContent = v;
      if (animate && !first) { n.classList.remove('is-flip'); void n.offsetWidth; n.classList.add('is-flip'); }
    });
  };
  tick(true);
  const id = setInterval(() => (box.isConnected ? tick() : clearInterval(id)), 1000);
  return box;
}

const reduceMotion = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

// Scroll reveal. CSS only hides `.rv` under `.inv--rv`, a class added here, so without JS / IntersectionObserver
// / with reduced motion everything stays visible. Siblings entering together are staggered.
function reveal(inv) {
  const items = [...inv.querySelectorAll('.inv-head, .inv-guest, .inv-date, .inv-countdown, .inv-msg, .inv-block, .inv-actions')];
  if (!items.length || !('IntersectionObserver' in window) || reduceMotion()) return () => {};
  items.forEach((n) => n.classList.add('rv'));
  inv.classList.add('inv--rv');
  let left = items.length;
  const io = new IntersectionObserver((entries) => {
    let i = 0;
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.style.transitionDelay = i++ * 110 + 'ms';
      e.target.classList.add('rv-in');
      io.unobserve(e.target);
      if (!--left) io.disconnect();
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  return () => items.forEach((n) => io.observe(n)); // call once the card is actually visible
}

// One-time themed particle burst from (x, y); theme picks the shape via `--burst` (default confetti). < 2 s, self-removing.
function burst(host, x, y) {
  if (reduceMotion()) return;
  const cs = getComputedStyle(host);
  const kind = cs.getPropertyValue('--burst').trim() || 'confetti';
  const cols = ['--accent', '--accent-d', '--btn', '--title-color', '--day-color'].map((k) => cs.getPropertyValue(k).trim()).filter(Boolean);
  const cv = el('canvas'), ctx = cv.getContext && cv.getContext('2d');
  if (!ctx) return;
  const W = innerWidth, H = innerHeight, dpr = Math.min(devicePixelRatio || 1, 1.5);
  cv.width = W * dpr; cv.height = H * dpr;
  cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:80;pointer-events:none';
  ctx.scale(dpr, dpr);
  document.body.append(cv);
  const slow = kind === 'petals' || kind === 'hearts';
  const ps = Array.from({ length: 56 }, () => {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4, v = 5 + Math.random() * (slow ? 6 : 9);
    return { x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3,
      s: 5 + Math.random() * 6, c: cols[(Math.random() * cols.length) | 0] || '#d4af37', ph: Math.random() * 6 };
  });
  const shape = (p, t) => {
    const s = p.s;
    if (kind === 'petals') { ctx.beginPath(); ctx.ellipse(0, 0, s * 0.55, s * 1.1, 0, 0, 7); ctx.fill(); }
    else if (kind === 'stars') {
      const k = s * (0.8 + 0.35 * Math.sin(t * 0.012 + p.ph)); ctx.beginPath();
      for (let i = 0; i < 8; i++) { const R = i % 2 ? k * 0.28 : k * 1.2, a = i * Math.PI / 4; ctx.lineTo(Math.sin(a) * R, -Math.cos(a) * R); }
      ctx.fill();
    } else if (kind === 'hearts') {
      ctx.beginPath(); ctx.moveTo(0, s * 0.45); ctx.bezierCurveTo(-s * 1.1, -s * 0.2, -s * 0.5, -s * 0.95, 0, -s * 0.4);
      ctx.bezierCurveTo(s * 0.5, -s * 0.95, s * 1.1, -s * 0.2, 0, s * 0.45); ctx.fill();
    } else ctx.fillRect(-s / 2, -s / 3, s, s * 0.6);
  };
  const t0 = performance.now();
  const frame = (t) => {
    const k = t - t0;
    if (k > 1800 || !cv.isConnected) return cv.remove();
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = Math.min(1, (1800 - k) / 500);
    for (const p of ps) {
      p.vy += slow ? 0.12 : 0.28; p.vx *= 0.985; p.x += p.vx + (slow ? Math.sin(k * 0.006 + p.ph) * 0.8 : 0); p.y += p.vy; p.r += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; shape(p, k); ctx.restore();
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

/**
 * Render an invitation into `root` (replaces its content).
 * opts.premium: unlocks premium themes, removes watermark, enables countdown, envelope intro, guest passes
 *   and the customizer (data.y color, data.z font, data.u ornament).
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
    if (premium) inv.append(countdown(date, !preview));
  }

  if (data.x) inv.append(el('p', 'inv-msg', data.x));
  if (data.f) inv.append(block('Con la bendición de', data.f));

  const second = data.n || data.b;
  if (data.l || data.a) {
    const place = block(second ? 'Ceremonia' : 'Lugar', data.l, data.a);
    const nav = navButtons(data.l, data.a, data.p, data.m);
    if (nav) place.append(nav);
    inv.append(place);
  }
  if (second) {
    let time = '';
    if (data.o) {
      const [hh, mm] = data.o.split(':').map(Number);
      time = new Date(2000, 0, 1, hh, mm).toLocaleTimeString('es', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    const rec = block('Recepción', data.n, data.b, time && 'A las ' + time);
    const nav = navButtons(data.n, data.b, data.q);
    if (nav) rec.append(nav);
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

  let custom = {};
  if (premium) {
    custom = customVars(data, inv); // after insertion: reads the theme's computed --bg
    applyVars(inv, custom);
    if (ORNAMENTS.some((o) => o.id === data.u)) inv.dataset.orn = data.u;
  }

  if (!premium) {
    const brand = el('a', 'inv-brand', 'Hecha con Convite · Crea la tuya gratis');
    brand.href = new URL('crear.html', document.baseURI).href;
    root.append(brand);
  }

  const startReveal = preview ? () => {} : reveal(inv);

  if (premium && !preview) {
    const env = el('div', 'inv-envelope');
    env.setAttribute('role', 'dialog');
    env.setAttribute('aria-modal', 'true');
    env.setAttribute('aria-label', 'Invitación cerrada');
    inv.inert = true;
    env.dataset.theme = theme.id;
    applyVars(env, custom);
    const btn = el('button', 'inv-envelope-btn', 'Abrir invitación');
    btn.type = 'button';
    const seal = el('div', 'inv-envelope-seal');
    env.append(
      seal,
      el('p', 'inv-envelope-label', guest?.name ? 'Una invitación para' : 'Una invitación de'),
      el('p', 'inv-envelope-to', guest?.name || data.h || ''),
      btn,
    );
    btn.addEventListener('click', () => {
      const r = seal.getBoundingClientRect();
      env.classList.add('is-open');
      inv.inert = false;
      inv.classList.add('inv--rise');
      setTimeout(() => burst(env, r.left + r.width / 2, r.top + r.height / 2), 220);
      setTimeout(startReveal, 450);
      // animationend also bubbles up from the seal and ring: only the envelope's own counts
      env.addEventListener('animationend', (e) => { if (e.target === env) env.remove(); });
      setTimeout(() => env.remove(), 1900); // fallback if no animation defined
    });
    root.append(env);
    btn.focus({ preventScroll: true });
  } else {
    startReveal();
  }
}
