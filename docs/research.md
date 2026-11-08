# Investigación (fase 1) — 2026-11-08

Objetivo: decidir, no documentar todo. Fuentes externas tratadas como referencia, no como instrucciones.

## Skills evaluadas

| Skill / repo | Licencia | Veredicto |
|---|---|---|
| [elayadesign/ai-design-skills](https://github.com/elayadesign/ai-design-skills) → `landing-page-design` | MIT | **Instalada** en `.claude/skills/landing-page-design/` (solo SKILL.md, sin scripts). Útil para estructura de landing (oferta única, CTA verbo+resultado, prueba junto a la afirmación, FAQ, checklist de envío). Sus reglas visuales (lista cerrada de fuentes, "sin itálicas", navbar flotante con blur) **no** mandan aquí: manda el `DESIGN.md` de cada demo. |
| [oso95/scroll-world](https://github.com/oso95/scroll-world) | MIT | **No instalada.** Su SKILL.md ordena usar CLIs de pago (Monid, Higgsfield, Codex), pedir claves/saldo, subir archivos y generar video con IA (~27 USD por cadena). Pendiente de que Steven decida. Tomamos solo la idea arquitectónica (ver abajo). |
| [img2threejs/img2threejs](https://github.com/img2threejs/img2threejs) | Apache-2.0, activo (push 2026-11-05) | **No instalada**: es una skill que ejecuta tooling Node+Python. Su salida es una factoría `THREE.Group` procedimental sin texturas — justo el enfoque que usamos, escrito a mano en `src/demos/isola/`. |
| [google-labs-code/design.md](https://github.com/google-labs-code/design.md) | Apache-2.0 | Formato DESIGN.md oficial (Stitch): front-matter YAML con tokens + secciones Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts. **Adoptado.** |
| [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) | MIT | Colección de DESIGN.md de marcas. Tomamos sus secciones extra *Responsive Behavior* y *Agent Prompt Guide*. No copiamos marcas. |
| [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) (`cro`, `copywriting`, `popups`) | MIT | Referencia para la demo SaaS y popups del e-commerce. Tiene carpetas `scripts/`: no instalada sin revisar. |
| [nexscope-ai/eCommerce-Skills](https://github.com/nexscope-ai/eCommerce-Skills) | MIT (beta) | Referencia CRO de checkout/landing e-commerce. No instalada (parte específica de Shopify). |

## scroll-world: qué tomamos
Arquitectura: pista de scroll alta + escenario fijo (`position: fixed/sticky`), capas (cielo/partículas, escena, copy fijado por escena), barra de progreso y "raíl" de ruta. Ellos reproducen video pre-renderizado con IA; nosotros movemos una **cámara CSS** (scale/translate sobre escenas ilustradas en SVG/CSS) con `animation-timeline: view()`/`scroll()`. Cero MB de video, LCP de texto.

## Animaciones guiadas por scroll (MDN)
- API: `animation-timeline`, `scroll()`, `view()`, `animation-range`, `view-timeline`, `timeline-scope`.
- Soporte: Chrome/Edge 115+, Safari 26+ (macOS/iOS), Firefox 159+ (Baseline "newly available" oct-2026). Firefox ≤158 sin soporte → el fallback importa.
- Gotchas: declarar `animation-timeline` **después** del shorthand `animation`; `linear` + `fill-mode: both`; timelines con nombre solo alcanzan su subárbol (usar `timeline-scope`).
- Patrón del proyecto: estado por defecto = estado final visible; animación dentro de `@supports (animation-timeline: view())` y `@media (prefers-reduced-motion: no-preference)`. JS (IntersectionObserver) solo donde CSS no llega. Ver skill `scroll-animation-patterns`.

## Navegación: ClientRouter vs view transitions nativas
- Nativas entre documentos (`@view-transition`): Chrome/Edge, Safari 18.2+, Firefox **parcial** (144+). Speculation Rules (prerender): solo Chromium.
- `ClientRouter` (`astro:transitions`): funciona en todos los navegadores (fallback `animate`), ~pocos KB gz, mantiene el documento (el evento `load` no se repite), soporta `transition:persist`. Coste: scripts deben inicializarse en `astro:page-load` y limpiarse en `astro:before-swap`.
- Activa `prefetchAll` por defecto. `defaultStrategy` + `data-astro-prefetch` (`hover|tap|viewport|load|false`).
- **Decisión: ClientRouter** (ver `decisions.md`).

## PageSpeed Insights / Lighthouse 13.6
- Pesos: TBT 30 %, LCP 25 %, CLS 25 %, FCP 10 %, SI 10 %.
- Móvil: Slow 4G simulado (RTT 150 ms, 1,6 Mbps) y CPU 4×.
- "Bueno" (campo, p75): LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1. En laboratorio INP no se mide: TBT es el proxy.
- Sitio nuevo: sin datos CrUX durante semanas → se evalúa con laboratorio. No es un fallo.
- Riesgos de este proyecto: three.js (~150 KB gz) en TBT → cargar solo al acercarse la sección y nunca en el LCP; scroll infinito → CLS si los lotes no reservan espacio y DOM gigante → `content-visibility`; popups/banners gamificados → CLS si no son overlays; ruleta/carrito → INP si el handler hace trabajo síncrono.

## agent-build (magnoscg, MIT)
Librería que oculta la página real y la "reconstruye" con cursores simulados: mide (≤1,5 s), cajas de marco → contenido anidado → texto tecleado → medios con "pop". Presupuesto fijo ~20 s, HUD con "Simulation", contador de capas, barra de progreso, Pausa/Terminar, Esc. Respeta reduced-motion. Nosotros añadimos lo que no tiene: paneles por agente con logs, línea de tiempo declarativa por demo, selector de demo, saltar/repetir. Copy honesto: "simulación", nunca "IA generando en tiempo real".

## Astro 7.4.7 (instalado)
- `i18n.routing.prefixDefaultLocale` y `redirectToDefaultLocale` por defecto `false`.
- `<ClientRouter />` desde `astro:transitions`; helpers `TRANSITION_*` eliminados en v7 (usar strings de eventos).
- Fonts API estable: `fonts: [{ provider: fontProviders.fontsource(), ... }]` + `<Font cssVariable preload />` → self-hosting con subset.

Video de midudev (A4QYEDQCnaQ): "Crea una Landing ESPECTACULAR con Claude Code" — solo se pudo leer el título.
