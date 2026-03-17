# UHI Causal Dashboard · Milán

Dashboard interactivo de inferencia causal sobre Islas de Calor Urbano (UHI) — GPS-IPW · LST ~ NDVI · Verano 2021–2025.

## Estructura

```
Dash_italy_html/
├── index.html               ← Shell HTML: 8 slides + imports
├── css/
│   ├── style.css            ← Variables, reset, layout, animaciones
│   └── components.css       ← Tarjetas, mapa, zonas de política
├── js/
│   ├── slides.js            ← Configuración de 8 slides + UHI_DATA
│   ├── charts.js            ← Chart.js (LST, NDVI, ADRF, Love Plot, Marginal) + D3 DAG
│   ├── map.js               ← Leaflet.js — mapa LST Milán
│   └── main.js              ← State machine de navegación
├── assets/
│   ├── images/              ← Tus imágenes (ver guía abajo)
│   └── data/                ← GeoJSON real (opcional)
└── README.md
```

## Cómo ejecutar

```bash
# Desde la carpeta del proyecto:
python3 -m http.server 8080
# Abrir: http://localhost:8080
```

> ⚠️ Necesita un servidor HTTP (no funciona con `file://`) por Leaflet y los imports.

## Navegación

| Acción | Resultado |
|--------|-----------|
| Clic en **Siguiente** | Avanza un slide |
| `→` / `↓` / `Space` | Avanza |
| `←` / `↑` | Retrocede |
| `Home` / `End` | Primer / Último slide |
| Puntos laterales | Salto directo |
| Swipe vertical (móvil) | Avanza / Retrocede |

## Slides

| # | Clave | Contenido |
|---|-------|-----------|
| 1 | `hook`        | Hook: +8°C stat animado |
| 2 | `phenomenon`  | Fenómeno UHI + fact cards |
| 3 | `evidence`    | Chart LST + distribución NDVI |
| 4 | `impact`      | Impactos salud, energía, equidad, bio |
| 5 | `question`    | Pregunta causal + DAG simple |
| 6 | `methodology` | GPS-IPW pasos + DAG D3 |
| 7 | `results`     | ADRF + Love Plot + Mapa Leaflet |
| 8 | `policy`      | Zonas prioritarias + marginal |

## Añadir imágenes reales

Coloca tus imágenes en `assets/images/` y sustituye los `div.img-placeholder` en `index.html`:

```html
<!-- Antes (placeholder): -->
<div class="img-placeholder img-placeholder--hero">...</div>

<!-- Después (imagen real): -->
<img src="assets/images/milan_aerial.jpg" alt="Vista aérea de Milán"
     class="img-placeholder img-placeholder--hero"
     style="object-fit:cover; border-radius:var(--r-lg);" />
```

### Imágenes sugeridas

| Placeholder | Slide | Descripción |
|-------------|-------|-------------|
| `milan_aerial.jpg` | 1 | Vista aérea de Milán (calor urbano) |
| `uhi_diagram.png`  | 2 | Diagrama campo vs. ciudad |
| `green_corridors.jpg` | 8 | Foto de parque/corredor verde |

## Añadir GeoJSON real (mapa)

En `js/map.js`, descomenta el bloque `// ── Cargar GeoJSON real ──` y coloca tu archivo en:

```
assets/data/milan_lst.geojson
```

Los campos esperados por el GeoJSON son:
- `properties.lst_mean` — temperatura media (°C)
- `properties.ndvi_mean` — NDVI medio [0–1]
- `properties.nome` — nombre del barrio/zona

## Añadir nuevos slides

1. Agrega un nuevo objeto en el array `SLIDES` de `js/slides.js`
2. Crea la sección `<section class="slide" id="slide-N">` en `index.html`
3. Si tiene gráfico, añade la función `initXxx()` en `js/charts.js` y el caso en `initChartsForSlide()`

## Librerías (CDN)

| Librería | Versión | Uso |
|----------|---------|-----|
| Chart.js | 4.4.1 | Gráficas LST, NDVI, ADRF, Love Plot |
| D3.js | 7 | DAG causal (slide 6) |
| Leaflet.js | 1.9.4 | Mapa interactivo Milán |
| Lucide | latest | Iconografía vectorial |
| Google Fonts | — | Inter + JetBrains Mono |
