# Decisiones

Decisiones tomadas con valores por defecto razonables para no frenar. Cámbialas aquí si cambian.

## Navegación: `ClientRouter` de Astro (no view transitions nativas)
- Las transiciones nativas entre documentos no funcionan completas en Firefox (parcial desde 144) y Speculation Rules solo existe en Chromium: en Firefox se vería una recarga normal. El requisito es "casi nunca ver una recarga", también al cambiar de idioma.
- `ClientRouter` da navegación suave en todos los navegadores, el evento `load` no se repite (verificable en Playwright), y su peso es pequeño.
- Coste aceptado: todos los scripts se inicializan en `astro:page-load` y se limpian en `astro:before-swap` (documentado en CLAUDE.md y en la skill `no-reload-navigation`).
- Prefetch: `prefetchAll: true`, `defaultStrategy: 'hover'`; tarjetas de demos y CTA principales con `data-astro-prefetch="viewport"`. No se usa `experimental.clientPrerender` (con ClientRouter el prerender del navegador no aporta).

## Rutas e idiomas
- Rutas `/es/...` y `/en/...` con los mismos segmentos en ambos idiomas (cambiar de idioma = cambiar el prefijo). `/` detecta el idioma del navegador y redirige (con enlaces de respaldo).
- `trailingSlash: 'always'`, `build.format: 'directory'` (compatible con GitHub Pages).
- Textos: `src/i18n/<lang>/<namespace>.json`. Un namespace por demo para que varias personas/agentes trabajen sin conflictos.

## Base de GitHub Pages
- `site` y `base` salen de variables de entorno `SITE_URL` y `BASE_PATH`, que el workflow toma de `actions/configure-pages`. Valor local por defecto: `https://seem1019.github.io` + `/steven-espinoza` (nombre de esta carpeta). Si el repo se llama distinto, no hay que tocar nada: el workflow lo resuelve.

## QR de contacto
- El QR contiene la **vCard completa** (no una URL): funciona sin conexión y antes del despliegue, y la cámara del móvil ofrece "Añadir contacto" directamente. Al lado, botón para descargar la `.vcf` (endpoint estático `/steven-espinoza.vcf`).

## Datos de contacto
- Solo los datos dados por Steven. Lo que falta queda como `TODO_*` visible en `src/data/profile.ts` (foto, ciudad, URL de agenda). WhatsApp se deriva del teléfono dado.

## Fuentes
- Fonts API de Astro con proveedor Fontsource: self-hosting, subset `latin`, `font-display: swap`, precarga solo de la fuente del LCP de cada vista. Cada demo carga solo sus fuentes.

## 3D (demo premium)
- three.js directo con un modelo procedimental (primitivas, sin .glb ni texturas), al estilo de la salida de img2threejs. Se carga con `import()` dinámico solo cuando la sección 3D se acerca al viewport. El hero/LCP es texto + un póster estático. Con reduced-motion: rotación desactivada, vista despiezada fija.

## Imágenes
- Sin fotos de personas ni marcas. Productos y escenas como ilustraciones SVG/CSS generadas en el proyecto (cero derechos de terceros, peso mínimo). Si en el futuro se usan fotos, irán por `astro:assets` en AVIF/WebP y con atribución en `docs/credits.md`.

## Showcase de agentes
- Las demos se "construyen" dentro de la página del showcase con una miniatura propia de cada demo (`BuildPreview.astro`), no con iframes: así funciona sin conexión una vez cargada y no hay segunda carga.
- Cada demo declara su guion en `src/demos/<slug>/showcase/timeline.ts`. El motor (`src/showcase/engine.ts`) no conoce ninguna demo.

## Marcas inventadas
- E-commerce **Brinco**, restaurante **Lumbre**, tienda premium (audio) **Isola**, SaaS de agendas **Turnio**. Nombres de ficción; si alguno coincide con una empresa real, cámbialo en `src/data/demos.ts` y en los JSON de i18n.

## Skills de terceros
- `landing-page-design` instalada (solo markdown). `scroll-world` e `img2threejs` **no** instaladas porque ejecutan herramientas externas / de pago. Pendiente de Steven.
