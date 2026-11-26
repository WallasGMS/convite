# Mejoras futuras (listas para delegar)

Ordenadas por impacto en ventas. Cada una indica qué se necesita del dueño, archivos y criterio de "terminado".
Regla: no hacer ninguna hasta que haya **ventas reales** que la pidan (salvo 1 y 2, que son baratas).

## 1. Medir (antes que todo)
- **Qué:** saber cuántas personas abren el editor, generan links y abren invitaciones.
- **Dueño:** crear cuenta gratis en goatcounter.com (sin cookies, no requiere aviso de privacidad).
- **Archivos:** un `<script data-goatcounter=... async src="//gc.zgo.at/count.js">` en `index.html`, `crear.html`, `i.html`;
  en `editor.js` llamar `goatcounter.count({path:'generar', event:true})` al generar.
- **Terminado:** el panel muestra visitas y el evento "generar".

## 2. Dominio propio
- **Qué:** `convite.gt` o un `.com` corto. Da confianza al compartir por WhatsApp.
- **Dueño:** comprar dominio (Cloudflare Registrar o registro.gt para .gt).
- **Archivos:** `CNAME` en la raíz; cambiar `https://wallasgms.github.io/convite/` en canonical, og:image, sitemap.
- **Terminado:** el dominio abre el sitio con HTTPS.

## 3. Pago automático
Ver `COBROS.md` (Payhip con lista de códigos, o Lemon Squeezy + validación de licencias).

## 4. Fotos en la invitación (premium)
- **Qué:** 1 a 3 fotos (quinceañera, novios, bebé). Es lo más pedido en XV y bodas.
- **Cómo sin servidor propio:** subir con Cloudinary *unsigned upload preset* (gratis 25 GB) y guardar solo la URL en el link (`p` campo, solo https de res.cloudinary.com).
- **Dueño:** cuenta Cloudinary y un upload preset sin firma, limitado a imágenes ≤ 5 MB.
- **Archivos:** `codec.js` (campo `p` validado por dominio), `render.js` (bloque foto con `loading=lazy`), `editor.js` (input file + compresión en canvas a 1200 px), `invite.css`.
- **Terminado:** foto visible en celular de gama baja en < 2 s con 3G.

## 5. Lista de confirmados (premium)
- **Qué:** que el anfitrión vea quién confirmó sin contar mensajes de WhatsApp.
- **Cómo:** Supabase (tabla `rsvp` con `invite_id`, nombre, pases, insert público con RLS de solo inserción) o Google Forms prellenado.
- **Archivos:** `render.js` (formulario corto además del botón WhatsApp), página `panel.html?id=` protegida con una clave en el link del anfitrión.
- **Terminado:** 10 confirmaciones de prueba aparecen en el panel; un invitado no puede leer la lista.

## 6. Música de fondo (premium)
- **Qué:** canción al abrir el sobre (el clic del sobre permite autoplay).
- **Cómo:** catálogo propio de 10 pistas libres de derechos en `audio/` (no enlaces de YouTube: se rompen y tienen derechos).
- **Terminado:** suena al abrir, botón de silencio visible, < 1 MB por pista.

## 7. Vista previa personalizada al compartir
- **Qué:** que en WhatsApp la tarjeta muestre "Mis XV años · Sofía" en vez de un texto genérico.
- **Cómo:** necesita servidor: Cloudflare Worker gratis que lea el hash… el hash no llega al servidor, así que el link tendría que usar `?d=` en vez de `#`. Cambio de formato: hacerlo solo si las métricas muestran que importa.

## 8. Más mercados
- Precios en MXN/USD según país, textos con "ustedes"/"vos" neutros, páginas SEO por país ("invitación XV años México").
- Plantillas para negocios: inauguraciones, posadas navideñas, fiestas de empresa (cobrar más: Q75).

## 9. Más temas
- Cada tema nuevo: entrada en `themes.js` (con `fonts`), bloque `[data-theme]` en `invite.css`, y verlo en `tools/preview-themes.html`.
- Temporadas: Navidad/posada (diciembre), Día del Cariño (febrero), graduaciones (octubre-noviembre en Guatemala).
