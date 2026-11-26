// Theme catalog. Visuals live in css/invite.css under [data-theme="<id>"].
export const THEMES = [
  { id: 'clasico',     name: 'Clásico',        premium: false },
  { id: 'fiesta',      name: 'Fiesta',         premium: false },
  { id: 'minimal',     name: 'Minimal',        premium: false },
  { id: 'cielo',       name: 'Cielo',          premium: false },
  { id: 'floral',      name: 'Floral',         premium: true },
  { id: 'dorado',      name: 'Dorado',         premium: true },
  { id: 'xv-rosa',     name: 'Rosa XV',        premium: true },
  { id: 'boda-salvia', name: 'Salvia',         premium: true },
  { id: 'bebe-azul',   name: 'Bebé azul',      premium: true },
  { id: 'bebe-rosa',   name: 'Bebé rosa',      premium: true },
  { id: 'noche',       name: 'Noche',          premium: true },
  { id: 'tropical',    name: 'Tropical',       premium: true },
];

export const themeById = (id) => THEMES.find((t) => t.id === id) || THEMES[0];
