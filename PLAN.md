# Convite: plan de trabajo para agentes

## Qué es
Invitaciones digitales (XV años, bodas, baby shower, cumpleaños, bautizos, graduaciones) que se
comparten por WhatsApp. El invitado abre el link, ve la invitación y confirma asistencia por WhatsApp.

- **Sin servidor.** Todos los datos van dentro del link (`i.html#<datos comprimidos>`). Hosting gratis, escala infinita.
- **Crecimiento viral.** Cada invitación gratis lleva “Hecha con Convite · Crea la tuya gratis”. 1 cliente = 50-200 invitados que lo ven.
- **Cobro.** Gratis: 4 temas + marca de agua. Premium (Q35 / USD 4.99 por invitación): 12 temas, sin marca,
  cuenta regresiva, sobre animado al abrir. Se desbloquea con un código `CNV-XXXX-XXXX`.
- **Día 1:** el dueño vende códigos a mano (transferencia / WhatsApp) o cobra Q75 por hacer la invitación él mismo.
- **Pasarela de pago:** al final (Lemon Squeezy o Gumroad, que pagan a PayPal y funcionan desde Guatemala).

## Reglas para TODOS los agentes
1. HTML/CSS/JS puros, ES modules, **sin build, sin npm, sin frameworks**. Rutas **relativas** siempre (se publica en un subdirectorio).
2. Todo el texto visible en **español neutro latino**, cálido, sin anglicismos innecesarios.
3. Los datos de la invitación vienen del URL = **no confiables**: nunca `innerHTML` con datos. Usar `textContent`.
4. Mobile first (el 90% abrirá desde WhatsApp en el celular). Probar a 375px.
5. Antes de diseñar: cargar la skill `frontend-design` y `anti-ui-slop`. Nada de degradados morado-azul genéricos, nada de emojis como íconos de UI.
6. Imágenes: **no** fotos realistas. Decoraciones en SVG/CSS dibujadas a mano (ramas, globos, estrellas, confeti).
7. Solo tocar los archivos que te asignan. Si necesitas algo de otro archivo, dilo en tu reporte.

## Contratos (ya hechos, NO modificar)
| Archivo | Qué expone |
|---|---|
| `js/codec.js` | `EVENTS` (tipos de evento), `normalize(obj)`, `encode(obj)→Promise<string>`, `decode(str)→Promise<obj>` |
| `js/themes.js` | `THEMES` [{id,name,premium}], `themeById(id)` |
| `js/render.js` | `render(rootEl, data, {premium, preview})` |
| `js/premium.js` | `isPremium(code)→Promise<bool>` |
| `i.html` | Visor de invitación |
| `tools/gen_codes.py` | Genera códigos premium (`private/` nunca se publica) |

Datos de una invitación (claves cortas para links cortos):
`t` tema, `e` evento, `h` nombre(s) protagonista, `s` subtítulo, `d` fecha `YYYY-MM-DDTHH:MM`,
`l` lugar, `a` dirección, `m` link de Google Maps (https), `x` mensaje, `c` vestimenta,
`g` mesa de regalos, `w` WhatsApp del anfitrión (solo dígitos con código de país, ej. 50212345678), `k` código premium.

Marcado que produce `render()` (para estilos):
```
.inv[data-theme][data-event]
  .inv-deco.inv-deco--top
  header.inv-head > .inv-kicker, h1.inv-title, .inv-sub
  .inv-date > .inv-weekday, .inv-day, .inv-month, .inv-time
  .inv-countdown > .inv-cd-cell > .inv-cd-num, .inv-cd-label      (solo premium)
  p.inv-msg
  section.inv-block > h2.inv-block-title, p.inv-block-text, a.inv-btn
  .inv-actions > a.inv-btn.inv-btn--primary, a.inv-btn
  .inv-deco.inv-deco--bottom
a.inv-brand                                   (marca de agua, solo gratis, hermano de .inv)
.inv-envelope[data-theme] > .inv-envelope-seal, .inv-envelope-to, button.inv-envelope-btn
   al hacer clic recibe .is-open → debe tener una animation que termine (luego se elimina)
.inv-error                                    (link inválido)
body.inv-page > main.inv-root
```

## Tareas

### T1 · Temas visuales → `css/invite.css` (agente: sonnet)
- Estilos base de todo el marcado de arriba + los 12 temas `[data-theme="id"]` de `js/themes.js`.
- Cada tema: paleta propia, tipografía de Google Fonts (máx. 2 familias por tema, `@import` al inicio), decoración
  SVG inline como `background-image: url("data:image/svg+xml,...")` en `.inv-deco--top/--bottom`.
- Temas gratis decentes; premium claramente más bonitos (es lo que vende).
- Sobre animado (`.inv-envelope`) a pantalla completa con animación de apertura.
- `.inv-brand`: barra fija abajo, discreta pero visible.
- Respetar `prefers-reduced-motion`.
- Entregable verificable: `tools/preview-themes.html` que muestra los 12 temas lado a lado con datos de ejemplo
  (importa `render` y llama con `{premium:true, preview:true}`).

### T2 · Editor → `crear.html`, `js/editor.js`, `css/editor.css` (agente: sonnet)
- Formulario a la izquierda (arriba en móvil), vista previa en vivo a la derecha (abajo en móvil, dentro de un marco tipo teléfono).
- Paso 1: elegir tipo de evento (tarjetas grandes) → rellena subtítulo por defecto.
- Paso 2: datos (campos del contrato). WhatsApp: selector de país (GT +502 por defecto, MX, SV, HN, NI, CR, PA, CO, US) + número.
- Paso 3: elegir tema (miniaturas; premium con candado).
- Campo “Código premium” + botón “Aplicar”; con `isPremium()` válido se desbloquean temas y se muestra ✓.
  Si elige tema premium sin código: vista previa lo muestra igual, pero al generar link pide código y muestra cómo comprarlo
  (botón WhatsApp al vendedor con texto prellenado; el número del vendedor va en una constante `SELLER_WA` arriba de `editor.js`).
- Botón “Generar invitación” → `encode()` → link `i.html#...` absoluto → mostrar con: Copiar, Compartir por WhatsApp
  (`https://wa.me/?text=`), Abrir. Usar `navigator.share` si existe.
- Guardar borrador en `localStorage` en cada cambio y restaurarlo al volver.
- Soportar `crear.html?e=xv` para preseleccionar evento (lo usan las páginas SEO).

### T3 · Landing + SEO → `index.html`, `css/site.css`, `invitaciones/*.html`, `sitemap.xml`, `robots.txt`, `favicon.svg` (agente: sonnet)
- Landing que vende: titular claro, demo visual (iframe o captura de una invitación real vía `i.html#...`), cómo funciona en 3 pasos,
  precios (Gratis vs Premium Q35), preguntas frecuentes, CTA a `crear.html`.
- 6 páginas SEO en `invitaciones/`: `xv-anos.html`, `boda.html`, `baby-shower.html`, `cumpleanos.html`, `bautizo.html`, `graduacion.html`.
  Cada una con contenido útil (no relleno): ideas de texto para la invitación, qué incluir, CTA a `../crear.html?e=<evento>`.
  `<title>` y meta description orientados a búsquedas reales tipo “invitación digital XV años WhatsApp”.
- `og:image`: crear `og.svg` simple y convertirlo… NO: deja `og.png` pendiente y anótalo en el reporte.

### T4 · Kit de ventas → `VENTAS.md` (agente: haiku)
- Guion para vender el día 1: 10 mensajes para grupos de Facebook/WhatsApp de Guatemala, 5 guiones de TikTok/Reels (15-30 s),
  respuesta a objeciones, precios (Q35 autoservicio, Q75 “te la hago yo”), cómo entregar un código y marcarlo en `private/codes.csv`.
- Lista de 20 tipos de grupos/lugares donde publicar (sin inventar nombres de grupos específicos).

### T5 · Revisión (Opus)
Opus revisa cada entregable, prueba en navegador a 375px y 1280px, corrige o devuelve al agente.

### T6 · Publicación + pasarela (Opus, al final)
- GitHub Pages (repo público `convite`, sin `private/`).
- Pasarela: Lemon Squeezy/Gumroad → al pagar, el cliente recibe un código. Ver `COBROS.md`.
