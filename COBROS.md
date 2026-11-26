# Cobros: cómo entra el dinero

## Fase 1: hoy (sin pasarela)
1. Pon tu número de WhatsApp (con código de país, solo dígitos, ej. `50212345678`) en:
   - `js/editor.js` línea 1 → `SELLER_WA`
   - `index.html` → botón "Te la hacemos" (busca `50200000000`)
2. El cliente te escribe → te paga por transferencia/depósito/Tigo Money → le mandas un código de `private/codes.csv`
   y anotas su nombre en la columna `vendido_a`. Plantilla en `VENTAS.md` sección 5.
3. Quedan 100 códigos. Para más: `python tools/gen_codes.py 50` y vuelve a publicar.

## Fase 2: pago automático (cuando haya ventas que lo justifiquen)
Opción recomendada: **Payhip** (funciona desde Guatemala, paga a PayPal, plan gratis con 5% de comisión).
1. Crea cuenta en payhip.com y conecta PayPal.
2. Producto digital "Código premium Convite", USD 4.99.
3. Activa *Software license keys* y sube la lista de códigos no vendidos de `private/codes.csv`
   (verifica en su panel que permita subir tus propias claves; si no, usa la opción de abajo).
4. Payhip entrega un código distinto a cada comprador por correo, automático.
5. Cambia el botón de compra del editor (`#buy-wa` en `crear.html` / `editor.js`) por el link de Payhip.

Alternativa si Payhip no permite subir claves: **Lemon Squeezy** genera sus propias licencias; habría que cambiar
`js/premium.js` para validarlas con su API de licencias (`/v1/licenses/validate`). Es un cambio de ~15 líneas.

## Límite conocido
Un código usado viaja dentro del link de la invitación: alguien que lo vea podría reutilizarlo.
A Q35 no compensa complicarlo. Si se vuelve un problema → validar licencias con Lemon Squeezy (arriba).
