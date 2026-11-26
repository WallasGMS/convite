// Theme catalog. Visuals live in css/invite.css under [data-theme="<id>"].
// `fonts` is the Google Fonts css2 query for that theme only, so an invitation loads 2 families, not 18.
export const THEMES = [
  { id: 'clasico',     name: 'Clásico',   premium: false, fonts: 'family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Jost:wght@300;400;500;600' },
  { id: 'fiesta',      name: 'Fiesta',    premium: false, fonts: 'family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;800' },
  { id: 'minimal',     name: 'Minimal',   premium: false, fonts: 'family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;700' },
  { id: 'cielo',       name: 'Cielo',     premium: false, fonts: 'family=Quicksand:wght@400;600;700' },
  { id: 'floral',      name: 'Floral',    premium: true,  fonts: 'family=Playfair+Display:ital,wght@0,500;0,700;1,500;1,700&family=Jost:wght@300;400;500;600' },
  { id: 'dorado',      name: 'Dorado',    premium: true,  fonts: 'family=Cinzel:wght@400;600;700&family=Jost:wght@300;400;500;600' },
  { id: 'xv-rosa',     name: 'Rosa XV',   premium: true,  fonts: 'family=Great+Vibes&family=Josefin+Sans:wght@300;400;600' },
  { id: 'boda-salvia', name: 'Salvia',    premium: true,  fonts: 'family=Bodoni+Moda:ital,wght@0,400;0,600;1,400&family=Jost:wght@300;400;500;600' },
  { id: 'bebe-azul',   name: 'Bebé azul', premium: true,  fonts: 'family=Baloo+2:wght@500;700&family=Nunito:wght@400;600;800' },
  { id: 'bebe-rosa',   name: 'Bebé rosa', premium: true,  fonts: 'family=Pacifico&family=Nunito:wght@400;600;800' },
  { id: 'noche',       name: 'Noche',     premium: true,  fonts: 'family=Fraunces:ital,wght@0,400;0,600;1,400&family=Outfit:wght@300;400;600' },
  { id: 'tropical',    name: 'Tropical',  premium: true,  fonts: 'family=Lilita+One&family=Poppins:wght@400;500;600' },
];

export const themeById = (id) => THEMES.find((t) => t.id === id) || THEMES[0];

export function loadThemeFonts(theme) {
  const id = 'font-' + theme.id;
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?${theme.fonts}&display=swap`;
  document.head.append(link);
}
