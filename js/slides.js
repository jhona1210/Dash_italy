/**
 * slides.js — UHI Causal Dashboard
 * Define el contenido, configuración visual y layout de cada slide.
 * Importado antes de main.js — expone la variable global SLIDES.
 */

const SLIDES = [
  // ── 1. Hook ──────────────────────────────────────────────
  {
    id: 1,
    key: 'hook',
    title: 'The Same Region. A Different Temperature.',
    subtitle: 'Urban Heat Islands · Milán',
    btnLabel: 'Discover the phenomenon',
    btnTheme: 'theme--veg-light',
    progressColor: 'linear-gradient(90deg, #66BB6A, #FDD835)',
    eyebrow: 'Urban Heat Islands · Causal Inference · Milán',
    layout: 'hook',
    chartInit: null,
    hasMap: false,
  },

  // ── 2. Fenómeno UHI ──────────────────────────────────────
  {
    id: 2,
    key: 'phenomenon',
    title: '¿Qué es una Isla de Calor Urbano?',
    subtitle: 'El fenómeno',
    btnLabel: 'See the evidence',
    btnTheme: 'theme--heat-urban',
    progressColor: 'linear-gradient(90deg, #FB8C00, #FDD835)',
    eyebrow: 'El Fenómeno',
    layout: 'split',
    chartInit: null,
    hasMap: false,
  },

  // ── 3. Evidencia / LST Map ─────────────────────────────────
  {
    id: 3,
    key: 'evidence',
    title: 'Exploring the Urban Heat Island in Milan',
    subtitle: 'Land Surface Temperature',
    btnLabel: 'See the impact',
    btnTheme: 'theme--heat-urban',
    progressColor: 'linear-gradient(90deg, #FDD835, #FB8C00)',
    eyebrow: 'Milan · Land Surface Temperature',
    layout: 'lst-map',
    chartInit: null,
    hasMap: true,                      // ← Leaflet LST map inicializa aquí
  },

  // ── 4. ¿Por qué importa? ─────────────────────────────────
  {
    id: 4,
    key: 'impact',
    title: '¿Por qué importa más allá de la temperatura?',
    subtitle: 'Impacto',
    btnLabel: 'Nuestra pregunta',
    btnTheme: 'theme--heat-extreme',
    progressColor: 'linear-gradient(90deg, #FB8C00, #D32F2F)',
    eyebrow: 'Impacto',
    layout: 'grid',
    chartInit: null,
    hasMap: false,
  },

  // ── 5. Nuestra pregunta ───────────────────────────────────
  {
    id: 5,
    key: 'question',
    title: '¿Cuál es el efecto causal del NDVI sobre la LST?',
    subtitle: 'Pregunta de investigación',
    btnLabel: 'Ver metodología',
    btnTheme: 'theme--neutral',
    progressColor: 'linear-gradient(90deg, #D32F2F, #FDD835)',
    eyebrow: 'Pregunta de investigación',
    layout: 'centered',
    chartInit: null,
    hasMap: false,
  },

  // ── 6. Metodología GPS-IPW ───────────────────────────────
  {
    id: 6,
    key: 'methodology',
    title: 'Generalized Propensity Score (GPS-IPW)',
    subtitle: 'Metodología',
    btnLabel: 'Ver resultados',
    btnTheme: 'theme--neutral',
    progressColor: 'linear-gradient(90deg, #FDD835, #66BB6A)',
    eyebrow: 'Metodología',
    layout: 'split-reverse',
    // El DAG D3 se inicializa con ID especial
    chartInit: ['dag-d3-container'],
    hasMap: false,
  },

  // ── 7. Resultados ────────────────────────────────────────
  {
    id: 7,
    key: 'results',
    title: 'Efecto causal del verde urbano',
    subtitle: 'Resultados',
    btnLabel: 'Recomendaciones',
    btnTheme: 'theme--veg-light',
    progressColor: 'linear-gradient(90deg, #66BB6A, #2E7D32)',
    eyebrow: 'Resultados',
    layout: 'results',
    chartInit: ['slide7_external'],
    hasMap: false,
  },

  // ── 8. Recomendaciones ────────────────────────────────────
  {
    id: 8,
    key: 'policy',
    title: '¿Dónde y cómo intervenir?',
    subtitle: 'Recomendaciones de política',
    btnLabel: 'Reiniciar',             // botón final
    btnTheme: 'theme--veg-dark',
    progressColor: 'linear-gradient(90deg, #2E7D32, #1B5E20)',
    eyebrow: 'Recomendaciones de política',
    layout: 'policy',
    chartInit: ['chart-marginal'],
    hasMap: false,
  },
];

// Datos estáticos reutilizables por charts.js
const UHI_DATA = {
  // Serie temporal LST por uso del suelo (años 2021-2025)
  years: ['2021', '2022', '2023', '2024', '2025'],
  lstUrban: [45.1, 47.8, 46.5, 48.2, 47.3],
  lstAgriculture: [42.0, 43.8, 42.9, 44.1, 43.5],
  lstForest: [38.2, 39.5, 38.8, 39.9, 38.6],
  lstWater: [36.5, 37.8, 37.1, 37.5, 36.9],

  // Distribución NDVI por zona (bins 0–1)
  ndviBins: [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
  ndviUrban: [820, 3100, 4200, 3800, 1900, 950, 420, 180, 55, 10],
  ndviForest: [5, 15, 45, 190, 480, 920, 1450, 2100, 1850, 720],

  // ADRF — grilla NDVI → LST causal
  ndviGrid: Array.from({ length: 89 }, (_, i) => +(i / 100).toFixed(2)),
  adrf(x) {
    if (x < 0.08) return 47.8 - x * 14;
    if (x < 0.22) return 46.7 - (x - 0.08) * 17;
    if (x < 0.50) return 44.3 - (x - 0.22) * 9.5;
    return 41.6 - (x - 0.50) * 8.2;
  },
  marginal(x) {
    const h = 0.005;
    return (this.adrf(x + h) - this.adrf(x - h)) / (2 * h);
  },

  // Love plot — confusores
  confounders: [
    'Building height', 'NTL', 'Pop. density',
    'Dist. roads', 'Elevation', 'Dist. agua',
    'Latitude', 'Longitude', 'Uso urbano', 'Uso bosques'
  ],
  rObs: [0.42, 0.39, 0.16, 0.16, 0.03, 0.06, 0.15, 0.03, 0.52, 0.29],
  rIPW: [0.07, 0.06, 0.04, 0.04, 0.03, 0.04, 0.05, 0.03, 0.08, 0.07],
};
