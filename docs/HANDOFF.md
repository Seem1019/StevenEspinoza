# Handoff — estado del proyecto para el siguiente agente

> Se carga automáticamente vía `@docs/HANDOFF.md` en `CLAUDE.md`. Las reglas estables están en `CLAUDE.md`; este archivo es el **estado vivo**: actualízalo al terminar cada sesión (qué cambió, qué queda, fecha).

**Última actualización:** 2026-11-08 · **Rama:** `main` · **Último trabajo:** rediseño visual de Brinco ("obsidiana y alabastro de precisión"), ver `docs/decisions.md` → "Rediseño de Brinco" · **Árbol de trabajo:** limpio · **Remoto:** `origin` = `Seem1019/StevenEspinoza` (público) · **Publicado:** https://seem1019.github.io/StevenEspinoza/

---

## 1. Contexto en 30 segundos
- **Qué es:** el portafolio de ventas de Steven Espinoza (Máster en Ingeniería de Software). Lo abre en vivo en reuniones con clientes potenciales: tiendas online, restaurantes, marcas premium y SaaS/servicios.
- **Stack:** Astro 7.4.7 estático → GitHub Pages con Actions. `ClientRouter` para navegar sin recargas, i18n `/es/` y `/en/`, three.js diferido, Playwright y Lighthouse 13.
- **Prioridades del cliente, en este orden:**
  1. Que cada demo convenza en 10 s.
  2. PageSpeed móvil ≥ 90.
  3. Nunca una recarga visible, una pestaña nueva o una paginación clásica.
- **Steven quiere velocidad.** No preguntes lo que se resuelva con un valor por defecto razonable; anota la decisión en `docs/decisions.md`.

## 2. Qué está hecho (verificado)
| Pieza | Estado | Dónde |
|---|---|---|
| Home + galería (detalle en `<dialog>` con `?demo=`) | ✅ | `src/pages/[lang]/index.astro` |
| Contacto: QR con la vCard completa + descarga `.vcf` | ✅ | `src/components/site/ContactDialog.astro`, `src/pages/steven-espinoza.vcf.ts` |
| Navegación sin recarga + estado en URL + "atrás" cierra la UI | ✅ | `src/scripts/url-state.ts`, `src/layouts/BaseLayout.astro` |
| **Brinco**: e-commerce de descuentos, 240 productos, ruleta (dial de precisión), carrito, checkout simulado. Rediseño 2026-11-08: obsidiana + alabastro, acento bermellón, Inter + JetBrains Mono | ✅ | `src/demos/brinco/` |
| **Lumbre**: restaurante "scroll-world" (entrada → barra → cocina → mesa), menú, reserva | ✅ | `src/demos/lumbre/` |
| **Isola**: auriculares premium, three.js procedural que gira y se despieza con el scroll | ✅ | `src/demos/isola/` |
| **Turnio**: landing SaaS (precios mensual/anual, tour, FAQ, alta) | ✅ | `src/demos/turnio/` |
| Motor de agentes compartido: cursores con nombre, flujo del orquestador, errores a propósito + revisión de QA | ✅ | `src/showcase/` (engine, flow, types), `src/components/site/AgentFlow.astro` |
| Intro de la home: puerta "Empezar" → los agentes construyen la home real (≈39 s), "Ver la intro otra vez" | ✅ | `src/showcase/scenes/home.ts`, `src/showcase/intro.ts`, `src/pages/[lang]/index.astro` |
| Showcase "agentes en vivo": 4 guiones de ≈37 s con 3 errores cada uno, empezar/pausar/saltar/repetir | ✅ | `src/pages/[lang]/showcase/`, `src/demos/<slug>/showcase/timeline.ts` |
| Memoria para agentes: CLAUDE.md, DESIGN.md (global + uno por demo), reglas, skills | ✅ | `.claude/rules/`, `.claude/skills/` |
| Workflow de despliegue en Pages | ✅ (sin ejecutar) | `.github/workflows/deploy.yml` |

**Última verificación (2026-11-08):**
- `npm run build`: sin errores ni avisos.
- Playwright: **33/33** pasan (+6 de capturas cronometradas que solo corren con `npm run screenshots:agents`).
- Lighthouse móvil (home es/en con la puerta de la intro, showcase y cada demo): **100/100/100/100**, LCP 0,9–1,4 s, CLS ≤ 0,012, TBT ≤ 10 ms.
- Capturas de la intro y de Brinco/Lumbre en 390 y 1440 px, en 15 momentos: `test-results/agents/` (no versionado).
- Tabla completa en `README.md` y `reports/lighthouse/summary.md`.

## 3. Pendiente, por prioridad
1. ✅ **Publicado (2026-11-08)** en https://seem1019.github.io/StevenEspinoza/ desde el repo ya existente `Seem1019/StevenEspinoza` (no `steven-espinoza`). Pages con build_type `workflow`; cada push a `main` despliega solo (el workflow calcula `SITE_URL` y `BASE_PATH`). En local la base sigue siendo `/steven-espinoza/`.
2. **PageSpeed sobre la URL pública:** la API de PSI devolvió 429 sin clave. Hecho con Lighthouse local contra la URL pública (`LH_BASE=… npm run lighthouse`): 99–100 en rendimiento y 100 en lo demás (tabla en `README.md`). Pendiente: repetir `npm run psi` con `PSI_API_KEY` o más tarde. Sin datos de campo (CrUX) durante semanas: normal en un sitio nuevo.
3. **Datos que faltan en `src/data/profile.ts`** (nunca inventarlos): `TODO_LOCATION`, `TODO_PHOTO`, `TODO_BOOKING_URL`.
4. **Decisión de Steven pendiente:** no se instalaron las skills `scroll-world` (usa CLIs de pago, unos 27 USD por cadena de video con IA) ni `img2threejs` (ejecuta tooling de Node y Python). Sus ideas ya están aplicadas sin ese coste.
5. **Detalles menores conocidos:**
   - Lumbre: la transición barra → cocina se ve como un fundido, no como avance de cámara (`src/demos/lumbre/styles/`).
   - Isola: en móvil, la sombra bajo el modelo se ve como una franja ancha (`src/demos/isola/three/scene.ts`).
   - Isola: su `BuildPreview` mide unos 2.420 px de alto (el contrato pide unos 2.200).
   - Brinco: la ruleta que se abre sola no crea entrada de historial, así que "atrás" no la cierra (Esc y su botón sí). Se arregla con `openUi` en lugar de `showModal` directo en `src/demos/brinco/client/app.ts`.

6. **Detalles conocidos del motor de agentes:**
   - En móvil el menú del header está oculto, así que el fallo "enlace en inglés" de la home no se ve ni se marca (QA marca 4 de 5). Está previsto: el motor ignora objetivos no renderizados.
   - A 1440×900 el panel flotante tapa media tarjeta de Turnio durante la construcción; se aparta cuando el foco cae debajo, pero no antes.
   - El CLS de la home (0,007–0,012) viene de la puerta inicial; no afecta a la nota.

## 4. Trampas ya descubiertas (no las repitas)
- **Tests y la intro:** la home muestra la puerta en la primera visita. Los specs importan `test` de `tests/fixtures.ts`, que marca la intro como vista; para probarla usa `test.use({ intro: true })`.
- **SVG dentro de nodos de tamaño 0:** el reset global pone `svg { max-width: 100% }`; dentro de un cursor (contenedor de 0 px) el SVG desaparece. Por eso `.ag-cur__ptr` lleva `max-width: none`.
- **Panel del navegador de la app:** con la ventana en segundo plano no corre `requestAnimationFrame` y el motor parece congelado. Para ver la animación usa Playwright (`npm run screenshots:agents`).
- **Motor y estilos de las previews:** los `data-build` ya no animan `transform` en CSS (lo controla el motor). Si una animación `motion` de una preview usa `transform` en el mismo elemento que arrastra un guion, la animación gana: apunta el guion a un contenedor.
- **`popstate` y `ClientRouter`:** en `window` los listeners se ejecutan en orden de registro aunque sean de captura. Por eso la intercepción de "atrás" vive en un script inline en `<head>` **antes** de `<ClientRouter />`, que llama a `window.__uiPopHandler` (definido en `url-state.ts`). No lo muevas ni lo quites.
- **Scripts de página:** siempre con `onPage()` (`src/scripts/lifecycle.ts`), que inicializa en `astro:page-load` y limpia en `astro:before-swap`. Nunca DOM a nivel de módulo.
- **Disparadores de UI:** siempre `<button>`, nunca `<a href="?x">`, porque el router lo trata como navegación.
- **Catálogo de Brinco:** el hueco de todos los lotes automáticos está reservado con tarjetas "fantasma" (`syncGhosts`). Sin eso, el CLS llegaba a 0,69. El `IntersectionObserver` vigila la **primera tarjeta fantasma**, no el centinela del final: el centinela queda debajo de ~120 tarjetas vacías y solo disparaba cuando el usuario ya había bajado por todas ellas (arreglado 2026-11-08; test "loads ahead" en `tests/catalog.spec.ts`).
- **Fuentes y estilos:** sin `styles: ['normal']` la Fonts API genera y precarga también la itálica. A Brinco eso le costaba 78 KB extra en la ruta crítica y un LCP de 2,6 s. Para precargar un solo peso, configura pesos estáticos y pasa `preload={[{ cssVariable, weight }]}` a `BaseLayout`.
- **`astro dev` es de una sola instancia por proyecto.** Si un dev server ya corre, el panel no puede arrancar otro: usa `npx astro dev stop`. El agente no tiene permiso para matar procesos por puerto.
- **Puertos:** dev y preview usan 4321; los tests y `npm run lighthouse` levantan su propio preview en **4330**.
- **Navegador para tests:** Playwright usa el Chrome del sistema (`channel: 'chrome'`). No descargues navegadores.
- **Dependencias:** instala con `npm ci --ignore-scripts`; ninguna necesita scripts de instalación.
- **Capturas en blanco:** las tarjetas de la galería usan `content-visibility: auto`. Una captura de un elemento fuera del viewport sale vacía; haz scroll antes de capturar.
- **Textos (i18n):** si es y en no tienen las mismas claves, el build falla a propósito. Todo texto visible va en `src/i18n/<lang>/<ns>.json`.
- **Brinco y su acento:** texto sobre `#FF3B1D` siempre en obsidiana (blanco no llega a 4,5:1); precios sobre blanco en `#D42A0E`. Los hovers animan la opacidad de un `::after`, nunca `box-shadow` ni `background-color`.
- **Gradientes dentro de `<dialog>` cerrado:** Chrome no pinta un `url(#id)` cuyo `<defs>` está en un subárbol `display:none`. Por eso `Wheel.astro` genera ids únicos por instancia.
- **Tamaño de three.js:** el chunk pesa unos 137 KB gz y por eso se subió `chunkSizeWarningLimit`. Nunca debe cargarse antes del primer scroll; Lighthouse no hace scroll.

## 5. Cómo verificar antes de dar algo por terminado
```bash
npm run build
npm run test:e2e
npm run screenshots
npm run lighthouse
```
- **Build:** debe salir sin avisos.
- **Tests:** deben pasar 28/28 o más.
- **Capturas:** se guardan en `test-results/screenshots`; revísalas a 390 y 1440 px.
- **Lighthouse:** objetivo rendimiento ≥ 90, accesibilidad, buenas prácticas y SEO ≥ 95, LCP < 2,5 s, CLS < 0,1.

## 6. Qué necesita confirmación de Steven
- Crear el repo remoto, hacer `git push`, activar Pages o cambiar ajustes del repo, e instalar skills o dependencias que ejecuten scripts.
- Los commits locales son libres. Usa como autor `Steven Espinoza <steven.espinoza0604@gmail.com>` y termina el mensaje con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Prepara todo para que la confirmación sea un solo "sí".

## 7. Lectura recomendada según la tarea
- **Cualquier UI:** `DESIGN.md` (portafolio) o `src/demos/<slug>/DESIGN.md`.
- **Demo nueva:** skill `new-client-demo` y `docs/demo-contract.md`.
- **Navegación, dialogs y listas:** skill `no-reload-navigation`.
- **Animaciones con scroll:** skill `scroll-animation-patterns`.
- **Por qué se decidió algo:** `docs/decisions.md`. Investigación y fuentes: `docs/research.md`.
