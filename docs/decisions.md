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
- **Motor compartido de agentes (2026-11-08).** Un solo motor mueve la intro de la home y "Agentes en vivo". Un guion (`Scene`, `src/showcase/types.ts`) es una lista de eventos con tiempo en segundos, agente, acción, objetivo y clave de mensaje; un único reloj (pausable) sincroniza cursores, flujo del orquestador, registro y cambios en la página. Escenas: `src/showcase/scenes/home.ts` y `src/demos/<slug>/showcase/timeline.ts`. Añadir o retocar una escena no toca la lógica.
- Los cambios en la página son solo `transform`, `opacity` y pintura (colores); los textos se escriben ocultando letras ya presentes (spans con opacidad), así que nunca hay saltos de layout. Todo lo que el motor toca se guarda y se restaura al terminar, saltar o repetir.
- Errores a propósito (3–5 por escena) declarados en el guion: transformaciones (desborde, desalineado, proporción, solape), pintura (contraste) o texto (errata, idioma equivocado resuelto en build con la otra traducción). Se quedan visibles hasta la revisión; QA los marca con un barrido y el agente dueño los corrige con su cursor.
- **Intro de la home:** el contenido real está en el HTML inicial. Un script inline en `<head>` decide antes del primer pintado si mostrar la puerta (`html[data-intro="gate"]`): no con `prefers-reduced-motion`, bots, enlaces profundos (`?demo=`, `#hash`) ni si ya se vio en la sesión (`sessionStorage`, con try/catch). Si el módulo no llega a ejecutarse, un temporizador de 4 s quita la puerta. El motor se carga con `import()` en reposo o al pulsar "Empezar". Se eligió `sessionStorage` (no `localStorage`) para que en cada reunión, en una pestaña nueva, la intro vuelva a salir; siempre queda el botón "Ver la intro otra vez".
- Lighthouse mide la puerta tal cual la ve un visitante nuevo (no se excluye por user agent): home 100/100/100/100, LCP 1,1 s.

## Rediseño de Brinco (2026-11-08)
- De neo-brutalista (bordes negros gruesos, sombras duras, amarillo, pegatinas giradas) a **"obsidiana y alabastro de precisión"**: arriba obsidiana `#0B0C10`, catálogo zinc/alabastro con tarjetas blancas, un solo acento bermellón `#FF3B1D`. Se conservan todas las mecánicas (ticker, header con búsqueda y carrito, ruleta, flash con cuenta atrás y barras de stock, catálogo infinito con filtros, toasts con pausa). Sistema completo en `src/demos/brinco/DESIGN.md`.
- **Texto sobre el bermellón en obsidiana, no en blanco:** blanco sobre `#FF3B1D` da 3,6:1 (no pasa AA en texto normal); obsidiana da 5,9:1. Los precios sobre blanco usan `#D42A0E` (5,1:1).
- **Fuentes:** Inter (UI) + JetBrains Mono (precios, descuentos, cuenta atrás, contadores, cupón, etiquetas del dial) por la Fonts API con Fontsource, no por Google Fonts: autoalojadas, sin CSS externo que bloquee el render. Solo Inter se precarga (LCP = h1). Mono solo para datos, nunca para etiquetas (antipatrón global).
- **Chips de filtro con radio de 8 px**, no píldoras (antipatrón global "pill buttons").
- **Hover sin animar `box-shadow` ni `background-color`:** el tinte y la sombra más profunda viven en un `::after` cuya opacidad se anima. Así solo se animan `transform`, `opacity` y `filter`.
- **Fondos de producto:** `BG` en `catalog.ts` pasa de 10 pasteles a 10 neutros fríos casi idénticos; el sprite se recoloreó a grafito/aluminio con un detalle bermellón y trazo 2,6 (antes 3,5).
- **Inter en pesos estáticos (400/500/600/700), no variable:** la página precarga solo el 700 del h1 (24 KB) en lugar del archivo variable (72 KB). Con el variable más la itálica precargada por error, el LCP simulado en 4G subía a 2,6 s.
- Medido: Lighthouse móvil 100/100/100/100, LCP 1,1 s, CLS 0.

## Demo Tesela Studio (2026-11-09)
- **Encargo de Steven:** un estudio de producto con IA (sector "servicios profesionales") con el estilo editorial de un estudio real que le gustó. Se toma el **tipo de producto y el sistema de diseño** (paleta casi monocroma, Fraunces 350, Hanken Grotesk, Space Grotesk, Space Mono, cápsula de cristal, sombra ambiental única, radios 15/22/64, tema oscuro, scroll-driven), nunca el nombre, el logo ni los textos: marca, casos, ilustraciones y copy son nuestros (regla `no-real-brands`). Nombre inventado **Tesela Studio** (una tesela es la pieza de un mosaico: encaja con los cubos isométricos).
- **Excepciones a los antipatrones globales, solo en esta demo y por petición expresa:** fondo gris frío casi blanco `#F8F8F9` (no crema), una frase en cursiva en el h1, etiquetas Space Mono en chips y la cápsula de navegación con `backdrop-filter`. Siguen prohibidos: píldoras (botones de 15 px), negrita, degradados, colores nuevos y más de una sombra.
- **Ilustraciones isométricas generadas en build** (`src/demos/tesela/iso.ts`): cubos en SVG con las caras rellenas por variables CSS, así el tema oscuro las recolorea sin otro archivo. Cero imágenes y cero JS para dibujarlas.
- **Fraunces compartida:** Lumbre y Tesela usan el mismo archivo variable. Con dos entradas en `astro.config.mjs` la Fonts API deduplica el archivo y la segunda familia pierde su precarga, así que hay una sola familia `--font-fraunces` (normal + itálica) y cada página precarga solo la normal (`preload={[{ cssVariable, weight, style: 'normal' }]}`; `BaseLayout` acepta ahora `style`).
- **`animation-timeline` a través de `var()`:** el minificador de CSS mete `animation-timeline` dentro del shorthand `animation` y Chrome descarta la declaración entera. Tesela usa `--tl-*` con `var()`. Mismo arreglo aplicado el 2026-11-09 a Turnio (`--t-tl`), Isola (`--isola-tl`) y a las reglas de Lumbre que aún no lo tenían (pista de la entrada, barra de progreso y cabecera, `--lb-tl-world`): hasta entonces no animaban en producción. Al activarse, la cabecera de Lumbre queda transparente sobre las escenas y se vuelve sólida al salir de ellas, como preveía su CSS.
- **Proceso en paneles apilados** solo desde 900 px: en móvil un panel puede medir más que la pantalla y quedaría tapado, así que allí es una lista normal.
- **Óleos de dominio público (2026-11-09, segunda pasada).** Steven la veía "mediocre en espectacularidad": faltaban las pinturas al óleo que contrastan con el fondo frío y más movimiento. No se usan las imágenes del estudio de referencia (tienen derechos): cinco obras CC0 del Met Open Access (Van Gogh, Cézanne, Rousseau, Turner), con cartela de museo en cada una y créditos en `docs/credits.md`. Se eligió esto frente a generar imágenes con IA: pincelada real, licencia limpia y encaja con la idea de galería.
- **Hero con telón:** el track del hero pasa a 330 svh. Los cubos encajan, el titular se va y una ventana redondeada con el Van Gogh sube como un telón (`clip-path` animado con el scroll), la pintura se asienta desde `scale(1.28)` y aparece la ficha "Cada pieza encaja antes de salir.". En el fallback y con movimiento reducido la ventana no existe (el hero queda estático). La imagen no se descarga hasta el primer scroll (atributos `data-srcset`): en la carga está recortada al 100 % y Lighthouse no hace scroll, así que no compite con el LCP.
- **Fichas de operación** sobre cada pintura del proceso, como en la referencia: filas que pasan de "en cola" a "procesando" (spinner) y a "hecho" (check verde). Es una secuencia temporal (no de scroll) que arranca cuando el panel está al 50 % en pantalla y se repite al volver; sin JS o con movimiento reducido se ve el estado final. Se añade un verde semántico (`--ok`, `--ok-tint`) solo para el estado "hecho".
- **Tema:** sigue a `prefers-color-scheme`; el botón guarda la elección en `localStorage` (con try/catch, conveniencia por visitante).
- Medido: Lighthouse móvil 100/100/100/100, LCP 1,1 s, CLS ≤ 0,003.

## Marcas inventadas
- E-commerce **Brinco**, restaurante **Lumbre**, tienda premium (audio) **Isola**, SaaS de agendas **Turnio**, estudio de producto con IA **Tesela Studio**. Nombres de ficción; si alguno coincide con una empresa real, cámbialo en `src/data/demos.ts` y en los JSON de i18n.

## Skills de terceros
- `landing-page-design` instalada (solo markdown). `scroll-world` e `img2threejs` **no** instaladas porque ejecutan herramientas externas / de pago. Pendiente de Steven.

## Hallazgos durante la construcción
- **Orden de listeners de `popstate`:** en `window` los listeners se ejecutan en orden de registro aunque sean de captura. El router de Astro se registra antes que cualquier módulo de página, así que la intercepción de "atrás" para dialogs vive en un script inline en `<head>` antes de `<ClientRouter />` (ver `BaseLayout.astro` y `url-state.ts`). Verificado: cerrar un dialog con "atrás" hace 0 swaps.
- **Catálogo sin CLS:** los lotes automáticos (hasta 144 productos) tienen su hueco reservado desde el inicio con tarjetas "fantasma" del mismo tamaño que se sustituyen en su sitio. CLS medido con scroll muy rápido: 0,69 → 0,011 (escritorio) y 0 (móvil).
- **Puertos:** `npm run dev` y `npm run preview` usan 4321; los tests y `npm run lighthouse` levantan su propio preview en 4330 para no chocar con el dev server.
- **Chunk de three.js** (~137 KB gz) supera el aviso por defecto de Vite; se sube `chunkSizeWarningLimit` a 600 KB porque es una importación diferida que nunca se carga en la carga inicial.
