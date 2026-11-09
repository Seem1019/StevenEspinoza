# Portafolio de Steven Espinoza

Sitio para enseñar a clientes potenciales (tiendas online, restaurantes, marcas premium y empresas SaaS o de servicios) qué soluciones web puede construir Steven. Tiene cuatro demos con identidad propia y un showcase de "agentes en vivo" que arma una demo por capas delante del cliente.

- **Rápido de cargar**: objetivo PageSpeed móvil ≥ 90 en todas las páginas.
- **Fluido**: navegación sin recargas (Astro `ClientRouter`), carrito, filtros, reservas y contacto dentro de la misma página, con URL compartible y botón "atrás" que cierra en vez de salir.
- **Bilingüe**: `/es/` y `/en/`.

## Ver en local
```bash
npm ci --ignore-scripts
npm run dev          # http://localhost:4321/steven-espinoza/
```
Versión de producción:
```bash
npm run build
npm run preview      # http://localhost:4321/steven-espinoza/
```

## Datos personales
Todo sale de [`src/data/profile.ts`](src/data/profile.ts): web, QR del contacto y vCard. Lo que falta está marcado con `TODO_` (ubicación, foto, enlace de agenda).

## Demos
| Demo | Sector | Qué enseña |
|---|---|---|
| Brinco | E-commerce de descuentos | Catálogo de 240 productos sin paginación, ruleta de bonos, cupones, ventas flash, carrito y checkout simulado en un panel |
| Lumbre | Restaurante | Recorrido por el local con el scroll (entrada → barra → cocina → mesa), menú y reserva sin salir |
| Isola | Marca premium | Auriculares en 3D que giran y se despiezan con el scroll |
| Turnio | SaaS / servicios | Landing de conversión: propuesta de valor, prueba social de ejemplo, precios, FAQ, CTA |
| Tesela Studio | Servicios profesionales | Estudio de producto con IA, estilo editorial de galería: hero fijo guiado por el scroll, casos en diálogo, proceso en paneles apilados, tema oscuro y brief en la página |

Marcas, productos y datos de las demos son ficticios.

## Calidad
```bash
npm run build && npm run test:e2e   # navegación sin recargas, estado en URL, QR, showcase offline
npm run screenshots                 # capturas 390 px y 1440 px
npm run lighthouse                  # Lighthouse móvil → reports/lighthouse/summary.md
```

## Publicar (GitHub Pages)
1. Crear el repositorio en GitHub (por ejemplo `Seem1019/steven-espinoza`) y subir la rama `main`.
2. En *Settings → Pages*, elegir **Source: GitHub Actions**.
3. Cada push a `main` ejecuta [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), que calcula `site` y `base` automáticamente.

URL esperada: `https://seem1019.github.io/steven-espinoza/`.

## Publicado
**https://seem1019.github.io/StevenEspinoza/** (repo `Seem1019/StevenEspinoza`, GitHub Pages con Actions; cada push a `main` despliega).

## PageSpeed Insights (después de publicar)
```bash
npm run psi            # o: npm run psi -- https://seem1019.github.io/StevenEspinoza/es/
```
Sin `PSI_API_KEY` la API de PageSpeed suele responder 429 (cuota). Mismo motor en local contra la URL pública:
```bash
LH_BASE=https://seem1019.github.io/StevenEspinoza/ npm run lighthouse   # → reports/lighthouse-public/summary.md
```

### Resultados sobre la URL pública (Lighthouse 13.6 móvil, 2026-11-08)
| Page | Perf | A11y | BP | SEO | LCP | CLS | TBT | FCP | Meets target |
|---|---|---|---|---|---|---|---|---|---|
| es/ | 99 | 100 | 100 | 100 | 1.2 s | 0 | 90 ms | 1.2 s | yes |
| en/ | 100 | 100 | 100 | 100 | 1.1 s | 0.012 | 90 ms | 1.1 s | yes |
| es/showcase/ | 100 | 100 | 100 | 100 | 1.1 s | 0.001 | 0 ms | 1.1 s | yes |
| es/demos/brinco/ | 100 | 100 | 100 | 100 | 1.0 s | 0 | 0 ms | 1.0 s | yes |
| es/demos/lumbre/ | 99 | 100 | 100 | 100 | 0.9 s | 0 | 90 ms | 0.9 s | yes |
| es/demos/isola/ | 100 | 100 | 100 | 100 | 1.0 s | 0 | 0 ms | 1.0 s | yes |
| es/demos/turnio/ | 100 | 100 | 100 | 100 | 0.9 s | 0 | 50 ms | 0.9 s | yes |

Resultados en `reports/psi.md`. Un sitio nuevo no tiene datos de campo (CrUX) durante semanas: PageSpeed lo evalúa con los datos de laboratorio, y eso es lo normal.

### Resultados de laboratorio en local (Lighthouse 13.6 móvil, 2026-11-08)
| Page | Perf | A11y | BP | SEO | LCP | CLS | TBT | FCP | Meets target |
|---|---|---|---|---|---|---|---|---|---|
| es/ | 100 | 100 | 100 | 100 | 1.1 s | 0 | 10 ms | 1.1 s | yes |
| en/ | 100 | 100 | 100 | 100 | 1.1 s | 0 | 0 ms | 1.1 s | yes |
| es/showcase/ | 100 | 100 | 100 | 100 | 1.1 s | 0 | 0 ms | 1.1 s | yes |
| en/showcase/ | 100 | 100 | 100 | 100 | 1.1 s | 0 | 0 ms | 1.1 s | yes |
| es/demos/brinco/ | 100 | 100 | 100 | 100 | 1.1 s | 0 | 0 ms | 1.1 s | yes |
| en/demos/brinco/ | 100 | 100 | 100 | 100 | 1.1 s | 0 | 0 ms | 1.1 s | yes |
| es/demos/lumbre/ | 100 | 100 | 100 | 100 | 1.1 s | 0 | 0 ms | 1.1 s | yes |
| es/demos/isola/ | 100 | 100 | 100 | 100 | 0.9 s | 0 | 20 ms | 0.9 s | yes |
| es/demos/turnio/ | 100 | 100 | 100 | 100 | 1.1 s | 0 | 0 ms | 1.1 s | yes |
| en/demos/turnio/ | 100 | 100 | 100 | 100 | 0.9 s | 0 | 0 ms | 0.9 s | yes |
| es/demos/tesela/ | 100 | 100 | 100 | 100 | 1.1 s | 0.003 | 60 ms | 1.1 s | yes | ← 2026-11-09

### Resultados en PageSpeed Insights (URL pública)
_Pendiente de la primera publicación: `npm run psi` los guarda en `reports/psi.md`._

## Para agentes y desarrolladores
- [`CLAUDE.md`](CLAUDE.md): stack, comandos, convenciones y reglas.
- [`DESIGN.md`](DESIGN.md) y `src/demos/*/DESIGN.md`: sistemas de diseño.
- [`docs/`](docs): investigación, decisiones, contrato de las demos, créditos.
- `.claude/skills/`: `new-client-demo`, `scroll-animation-patterns`, `no-reload-navigation`, `landing-page-design` (tercero, MIT).
