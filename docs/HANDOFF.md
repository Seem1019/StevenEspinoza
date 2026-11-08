# Handoff — estado del proyecto para el siguiente agente

> Se carga automáticamente vía `@docs/HANDOFF.md` en `CLAUDE.md`. Las reglas estables están en `CLAUDE.md`; este archivo es el **estado vivo**: actualízalo al terminar cada sesión (qué cambió, qué queda, fecha).

**Última actualización:** 2026-11-08 · **Rama:** `main` · **Último commit:** `17d9b7a` · **Árbol de trabajo:** limpio · **Remoto:** ninguno (aún no publicado)

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
| **Brinco**: e-commerce de descuentos, 240 productos, ruleta, carrito, checkout simulado | ✅ | `src/demos/brinco/` |
| **Lumbre**: restaurante "scroll-world" (entrada → barra → cocina → mesa), menú, reserva | ✅ | `src/demos/lumbre/` |
| **Isola**: auriculares premium, three.js procedural que gira y se despieza con el scroll | ✅ | `src/demos/isola/` |
| **Turnio**: landing SaaS (precios mensual/anual, tour, FAQ, alta) | ✅ | `src/demos/turnio/` |
| Showcase "agentes en vivo" (simulación con guion, offline, saltar/repetir) | ✅ | `src/pages/[lang]/showcase/`, `src/showcase/` |
| Memoria para agentes: CLAUDE.md, DESIGN.md (global + uno por demo), reglas, skills | ✅ | `.claude/rules/`, `.claude/skills/` |
| Workflow de despliegue en Pages | ✅ (sin ejecutar) | `.github/workflows/deploy.yml` |

**Última verificación (2026-11-08):**
- `npm run build`: sin errores ni avisos.
- Playwright: **28/28** tests pasan.
- Lighthouse móvil sobre 10 páginas (home, showcase y cada demo, es/en): **100/100/100/100**, LCP 0,9–1,1 s, CLS 0, TBT ≤ 30 ms.
- Tabla completa en `README.md` y `reports/lighthouse/summary.md`.

## 3. Pendiente, por prioridad
1. **Publicar. Requiere el "sí" explícito de Steven, que aún no ha dado.** `gh` está autenticado como `Seem1019`; el repo no existe todavía. Comandos preparados:
   ```bash
   gh repo create Seem1019/steven-espinoza --public --source . --remote origin --push
   gh api -X POST repos/Seem1019/steven-espinoza/pages -f build_type=workflow
   ```
   - Debe ser público: Pages no funciona con repos privados en el plan gratuito.
   - URL esperada: `https://seem1019.github.io/steven-espinoza/`.
   - El workflow calcula `SITE_URL` y `BASE_PATH` solo.
2. **PageSpeed sobre la URL pública** (después del despliegue): `npm run psi` → `reports/psi.md`. Pega la tabla en la sección "Resultados en PageSpeed Insights" del README. Avisa a Steven de que un sitio nuevo no tiene datos de campo (CrUX) durante semanas y se evalúa con laboratorio; no es un fallo.
3. **Datos que faltan en `src/data/profile.ts`** (nunca inventarlos): `TODO_LOCATION`, `TODO_PHOTO`, `TODO_BOOKING_URL`.
4. **Decisión de Steven pendiente:** no se instalaron las skills `scroll-world` (usa CLIs de pago, unos 27 USD por cadena de video con IA) ni `img2threejs` (ejecuta tooling de Node y Python). Sus ideas ya están aplicadas sin ese coste.
5. **Detalles menores conocidos:**
   - Lumbre: la transición barra → cocina se ve como un fundido, no como avance de cámara (`src/demos/lumbre/styles/`).
   - Isola: en móvil, la sombra bajo el modelo se ve como una franja ancha (`src/demos/isola/three/scene.ts`).
   - Isola: su `BuildPreview` mide unos 2.420 px de alto (el contrato pide unos 2.200).
   - Brinco: la ruleta que se abre sola no crea entrada de historial, así que "atrás" no la cierra (Esc y su botón sí). Se arregla con `openUi` en lugar de `showModal` directo en `src/demos/brinco/client/app.ts`.

## 4. Trampas ya descubiertas (no las repitas)
- **`popstate` y `ClientRouter`:** en `window` los listeners se ejecutan en orden de registro aunque sean de captura. Por eso la intercepción de "atrás" vive en un script inline en `<head>` **antes** de `<ClientRouter />`, que llama a `window.__uiPopHandler` (definido en `url-state.ts`). No lo muevas ni lo quites.
- **Scripts de página:** siempre con `onPage()` (`src/scripts/lifecycle.ts`), que inicializa en `astro:page-load` y limpia en `astro:before-swap`. Nunca DOM a nivel de módulo.
- **Disparadores de UI:** siempre `<button>`, nunca `<a href="?x">`, porque el router lo trata como navegación.
- **Catálogo de Brinco:** el hueco de todos los lotes automáticos está reservado con tarjetas "fantasma" (`syncGhosts`). Sin eso, el CLS llegaba a 0,69.
- **`astro dev` es de una sola instancia por proyecto.** Si un dev server ya corre, el panel no puede arrancar otro: usa `npx astro dev stop`. El agente no tiene permiso para matar procesos por puerto.
- **Puertos:** dev y preview usan 4321; los tests y `npm run lighthouse` levantan su propio preview en **4330**.
- **Navegador para tests:** Playwright usa el Chrome del sistema (`channel: 'chrome'`). No descargues navegadores.
- **Dependencias:** instala con `npm ci --ignore-scripts`; ninguna necesita scripts de instalación.
- **Capturas en blanco:** las tarjetas de la galería usan `content-visibility: auto`. Una captura de un elemento fuera del viewport sale vacía; haz scroll antes de capturar.
- **Textos (i18n):** si es y en no tienen las mismas claves, el build falla a propósito. Todo texto visible va en `src/i18n/<lang>/<ns>.json`.
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
