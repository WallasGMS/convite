// Theme catalog. Visuals live in css/invite.css under [data-theme="<id>"].
// `fonts` is the Google Fonts css2 query for that theme only, so an invitation loads 2 families, not 18.
export const THEMES = [
  { id: 'clasico',     name: 'Clásico',   premium: false, fonts: 'family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Jost:wght@300;400;500;600', ev: 'boda aniversario bautizo comunion graduacion' },
  { id: 'fiesta',      name: 'Fiesta',    premium: false, fonts: 'family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;800', ev: 'cumple xv otro' },
  { id: 'minimal',     name: 'Minimal',   premium: false, fonts: 'family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;700', ev: 'boda graduacion otro' },
  { id: 'cielo',       name: 'Cielo',     premium: false, fonts: 'family=Quicksand:wght@400;600;700', ev: 'baby bautizo' },
  { id: 'floral',      name: 'Floral',    premium: true,  fonts: 'family=Playfair+Display:ital,wght@0,500;0,700;1,500;1,700&family=Jost:wght@300;400;500;600', ev: 'boda xv aniversario' },
  { id: 'dorado',      name: 'Dorado',    premium: true,  fonts: 'family=Cinzel:wght@400;600;700&family=Jost:wght@300;400;500;600', ev: 'xv boda aniversario cumple' },
  { id: 'xv-rosa',     name: 'Rosa XV',   premium: true,  fonts: 'family=Great+Vibes&family=Josefin+Sans:wght@300;400;600', ev: 'xv' },
  { id: 'boda-salvia', name: 'Salvia',    premium: true,  fonts: 'family=Bodoni+Moda:ital,wght@0,400;0,600;1,400&family=Jost:wght@300;400;500;600', ev: 'boda' },
  { id: 'bebe-azul',   name: 'Bebé azul', premium: true,  fonts: 'family=Baloo+2:wght@500;700&family=Nunito:wght@400;600;800', ev: 'baby bautizo revelacion' },
  { id: 'bebe-rosa',   name: 'Bebé rosa', premium: true,  fonts: 'family=Pacifico&family=Nunito:wght@400;600;800', ev: 'baby bautizo revelacion' },
  { id: 'noche',       name: 'Noche',     premium: true,  fonts: 'family=Fraunces:ital,wght@0,400;0,600;1,400&family=Outfit:wght@300;400;600', ev: 'xv cumple graduacion' },
  { id: 'tropical',    name: 'Tropical',  premium: true,  fonts: 'family=Lilita+One&family=Poppins:wght@400;500;600', ev: 'cumple otro' },
  { id: 'globos',      name: 'Globos',     premium: false, fonts: 'family=Chewy&family=Nunito:wght@400;600;800', ev: 'cumple otro' },
  { id: 'deportivo',   name: 'Deportivo', premium: false, fonts: 'family=Bebas+Neue&family=Barlow:wght@400;500;600', ev: 'cumple' },
  { id: 'rustico',     name: 'Rústico',   premium: true,  fonts: 'family=Amatic+SC:wght@400;700&family=Lato:wght@400;700', ev: 'boda otro' },
  { id: 'boho',        name: 'Boho',      premium: true,  fonts: 'family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;700', ev: 'boda baby' },
  { id: 'vintage',     name: 'Vintage',   premium: true,  fonts: 'family=IM+Fell+English:ital@0;1&family=Crimson+Text:wght@400;600', ev: 'aniversario boda' },
  { id: 'negro-oro',   name: 'Negro y oro', premium: true, fonts: 'family=Poiret+One&family=Josefin+Sans:wght@300;400;600', ev: 'xv cumple graduacion aniversario' },
  { id: 'religioso',   name: 'Religioso', premium: true,  fonts: 'family=Marcellus&family=Lato:wght@300;400;700', ev: 'bautizo comunion' },
  { id: 'playa',       name: 'Playa',     premium: true,  fonts: 'family=Lobster&family=Mulish:wght@400;600;700', ev: 'cumple boda otro' },
  { id: 'mexicana',    name: 'Mexicana',  premium: true,  fonts: 'family=Chango&family=Nunito:wght@400;600;800', ev: 'cumple xv otro' },
  { id: 'princesa',    name: 'Princesa',  premium: true,  fonts: 'family=Playball&family=Quicksand:wght@400;600;700', ev: 'xv cumple' },
  { id: 'graduacion',  name: 'Graduación', premium: true, fonts: 'family=Old+Standard+TT:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@400;600', ev: 'graduacion' },
  { id: 'acuarela',    name: 'Acuarela',  premium: true,  fonts: 'family=Dancing+Script:wght@500;700&family=Karla:wght@400;500;700', ev: 'boda baby xv' },
  // Diseños con ilustración (img/deco), por evento
  { id: 'boda-elegante',   name: 'Boda elegante', premium: true, ev: 'boda aniversario', fonts: 'family=Pinyon+Script&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400' },
  { id: 'boda-jardin',     name: 'Jardín',        premium: true, ev: 'boda', fonts: 'family=Allura&family=Lora:ital,wght@0,400;0,600;1,400' },
  { id: 'boda-marino',     name: 'Marino y oro',  premium: true, ev: 'boda aniversario', fonts: 'family=Italiana&family=Montserrat:wght@300;400;600' },
  { id: 'cumple-heroe',    name: 'Superhéroe',    premium: true, ev: 'cumple', fonts: 'family=Bangers&family=Nunito:wght@400;600;800' },
  { id: 'cumple-elegante', name: 'Cumple elegante', premium: true, ev: 'cumple aniversario', fonts: 'family=Playfair+Display+SC:wght@400;700&family=Raleway:wght@300;400;600' },
  { id: 'cumple-cute',     name: 'Cute',          premium: true, ev: 'cumple baby', fonts: 'family=Sniglet:wght@400;800&family=Nunito:wght@400;600;800' },
  { id: 'grad-formal',     name: 'Graduación formal', premium: true, ev: 'graduacion', fonts: 'family=Playfair+Display:ital,wght@0,600;1,600&family=Lato:wght@300;400;700' },
  { id: 'grad-noche',      name: 'Gala de graduación', premium: true, ev: 'graduacion', fonts: 'family=Cormorant+SC:wght@500;700&family=Lato:wght@300;400;700' },
  { id: 'otaku-sakura',    name: 'Sakura',        premium: true, ev: 'cumple xv otro', fonts: 'family=Mochiy+Pop+One&family=Zen+Maru+Gothic:wght@400;500;700' },
  { id: 'otaku-manga',     name: 'Manga',         premium: true, ev: 'cumple otro', fonts: 'family=Dela+Gothic+One&family=M+PLUS+Rounded+1c:wght@400;500;800' },
  { id: 'otaku-kawaii',    name: 'Kawaii',        premium: true, ev: 'cumple xv otro', fonts: 'family=Mochiy+Pop+One&family=Zen+Maru+Gothic:wght@400;500;700' },
  { id: 'revelacion',      name: 'Revelación',    premium: true, ev: 'revelacion baby', fonts: 'family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600;800' },
  { id: 'aniversario',     name: 'Aniversario',   premium: true, ev: 'aniversario boda', fonts: 'family=Pinyon+Script&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400' },
];

// Exclusive designs sold one-off: same shape plus `hidden: true` (not listed in the editor unless crear.html?t=<id>).
// `ev`: events the design suits (codec EVENTS ids); the editor lists those first.

// Premium customizer. Title font override: `w` is the only weight the family ships (avoids fake bold).
export const FONTS = [
  { id: 'caligrafia', name: 'Caligrafía', css: "'Great Vibes', cursive",            fonts: 'family=Great+Vibes', w: 400, script: true },
  { id: 'romantica',  name: 'Romántica',  css: "'Parisienne', cursive",             fonts: 'family=Parisienne', w: 400, script: true },
  { id: 'clasica',    name: 'Clásica',    css: "'Playfair Display', Georgia, serif", fonts: 'family=Playfair+Display:ital,wght@0,600;1,600', w: 600 },
  { id: 'real',       name: 'Real',       css: "'Cinzel', Georgia, serif",           fonts: 'family=Cinzel:wght@600', w: 600 },
  { id: 'editorial',  name: 'Editorial',  css: "'Bodoni Moda', Georgia, serif",      fonts: 'family=Bodoni+Moda:wght@600', w: 600 },
  { id: 'moderna',    name: 'Moderna',    css: "'Poppins', system-ui, sans-serif",   fonts: 'family=Poppins:wght@600', w: 600 },
  { id: 'divertida',  name: 'Divertida',  css: "'Fredoka', system-ui, sans-serif",   fonts: 'family=Fredoka:wght@600', w: 600 },
  { id: 'retro',      name: 'Retro',      css: "'Abril Fatface', Georgia, serif",    fonts: 'family=Abril+Fatface', w: 400 },
];
// Ornaments replace the theme's top/bottom decoration; drawn as CSS masks painted with --accent (css/invite.css).
export const ORNAMENTS = [
  { id: 'flores', name: 'Flores' }, { id: 'hojas', name: 'Hojas' }, { id: 'estrellas', name: 'Estrellas' },
  { id: 'mariposas', name: 'Mariposas' }, { id: 'corazones', name: 'Corazones' }, { id: 'ninguno', name: 'Sin adorno' },
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
