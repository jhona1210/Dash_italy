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
    btnLabel: 'See the variables',
    btnTheme: 'theme--heat-urban',
    progressColor: 'linear-gradient(90deg, #FB8C00, #FDD835)',
    eyebrow: 'El Fenómeno',
    layout: 'split',
    chartInit: null,
    hasMap: false,
  },

  // ── 3. Data Dictionary & Variables ────────────────────────
  {
    id: 3,
    key: 'variables',
    title: 'The Building Blocks: Our Variables',
    subtitle: 'Data Dictionary',
    btnLabel: 'See the evidence',
    btnTheme: 'theme--neutral',
    progressColor: 'linear-gradient(90deg, #FDD835, #FFEE58)',
    eyebrow: 'Data Dictionary & Variables',
    layout: 'variables',
    chartInit: null,
    hasMap: false,
  },

  // ── 4. Evidencia / LST Map ─────────────────────────────────
  {
    id: 4,
    key: 'evidence',
    title: 'Exploring the Urban Heat Island in Milan',
    subtitle: 'Land Surface Temperature',
    btnLabel: 'See the impact',
    btnTheme: 'theme--heat-urban',
    progressColor: 'linear-gradient(90deg, #FFEE58, #FB8C00)',
    eyebrow: 'Milan · Land Surface Temperature',
    layout: 'lst-map',
    chartInit: null,
    hasMap: true,                      // ← Leaflet LST map inicializa aquí
  },

  // ── 5. ¿Por qué importa? ─────────────────────────────────
  {
    id: 5,
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

  // ── 6. Our Question ───────────────────────────────────
  {
    id: 6,
    key: 'question',
    title: 'What is the causal effect of NDVI on LST?',
    subtitle: 'Research Question',
    btnLabel: 'See Methodology',
    btnTheme: 'theme--neutral',
    progressColor: 'linear-gradient(90deg, #D32F2F, #FDD835)',
    eyebrow: 'Research Question',
    layout: 'centered',
    chartInit: null,
    hasMap: false,
  },

  // ── 7. GPS-IPW Methodology ───────────────────────────────
  {
    id: 7,
    key: 'methodology',
    title: 'Generalized Propensity Score (GPS-IPW)',
    subtitle: 'Methodology',
    btnLabel: 'See results',
    btnTheme: 'theme--neutral',
    progressColor: 'linear-gradient(90deg, #FDD835, #66BB6A)',
    eyebrow: 'Methodology',
    layout: 'split-reverse',
    // The D3 DAG is initialized with a special ID
    chartInit: ['dag-d3-container'],
    hasMap: false,
  },

  // ── 8. Results (FINAL SLIDE) ────────────────────────────
  {
    id: 8,
    key: 'results',
    title: 'Causal Effect of Urban Greenery',
    subtitle: 'Results',
    btnLabel: 'Restart',
    btnTheme: 'theme--veg-dark',
    progressColor: 'linear-gradient(90deg, #66BB6A, #1B5E20)',
    eyebrow: 'Results',
    layout: 'results',
    chartInit: ['initResultsDashboard'],
    hasMap: false,
  },
];

// Diccionario de datos para el Slide 3
const VAR_DICTIONARY = {
  // Category 1
  municipio_id: {
    title: 'municipio_id',
    category: 'Identification & Location',
    desc: 'District/neighborhood code of Milan. Obtained by rasterizing municipality polygons so every pixel knows its administrative zone.'
  },
  coords: {
    title: 'longitude & latitude',
    category: 'Identification & Location',
    desc: 'Exact geographic coordinates for the center of each 30x30m pixel, generated via Google Earth Engine (GEE).'
  },
  geometry: {
    title: 'geometry',
    category: 'Identification & Location',
    desc: 'Spatial point object allowing GIS software to recognize the dataset as a map.'
  },
  uso_dusaf: {
    title: 'USO_DUSAF',
    category: 'Identification & Location',
    desc: "Official land use category (Urban, Agricultural, Forest). Obtained through a spatial join with Lombardy's DUSAF map."
  },

  // Category 2
  ndvi: {
    title: 'NDVI (Vegetation)',
    category: "Satellite Indices (Earth's Signature)",
    desc: 'Measures plant health by comparing red and near-infrared light.'
  },
  ndbi: {
    title: 'NDBI (Urbanization)',
    category: "Satellite Indices (Earth's Signature)",
    desc: 'Highlights built-up areas (concrete/asphalt); the inverse of NDVI.'
  },
  ndwi: {
    title: 'NDWI (Water)',
    category: "Satellite Indices (Earth's Signature)",
    desc: 'Detects moisture/water bodies; differentiates wet vs. dry soil.'
  },
  bsi: {
    title: 'BSI (Bare Soil)',
    category: "Satellite Indices (Earth's Signature)",
    desc: 'Identifies areas without buildings or plants (vacant lots).'
  },
  albedo: {
    title: 'Albedo',
    category: "Satellite Indices (Earth's Signature)",
    desc: 'Measures solar energy reflection. Low values (asphalt) absorb heat; high values reflect it.'
  },

  // Category 3
  lst: {
    title: 'LST_Celsius',
    category: 'The Target Variable (Heat)',
    desc: 'Land Surface Temperature. Collected via Landsat thermal sensors. This is our "effect" or target variable.'
  },

  // Category 4
  dist_water: {
    title: 'Dist_Water_m',
    category: 'Environment & Climate',
    desc: 'Distance to the nearest water body (rivers, lakes, canals).'
  },
  dist_road: {
    title: 'Dist_Road_m',
    category: 'Environment & Climate',
    desc: 'Distance to the nearest major road to measure traffic-related heat.'
  },
  elevation: {
    title: 'Elevation',
    category: 'Environment & Climate',
    desc: 'Height above sea level (NASA SRTM data).'
  },
  soil_moisture: {
    title: 'Soil_Moisture',
    category: 'Environment & Climate',
    desc: 'Water content in the topsoil (ERA5-Land data).'
  },
  wind_speed: {
    title: 'Wind_Speed',
    category: 'Environment & Climate',
    desc: 'Average summer wind speed; helps determine heat dispersal.'
  },

  // Category 5
  ntl: {
    title: 'NTL (Nighttime Lights)',
    category: 'Urban & Human Factors',
    desc: 'Intensity of city lights at night; proxy for economic activity.'
  },
  building_height: {
    title: 'Building_Height',
    category: 'Urban & Human Factors',
    desc: 'Average building height per pixel (GHSL database).'
  },
  impermeabilidad: {
    title: 'Impermeabilidad',
    category: 'Urban & Human Factors',
    desc: 'Percentage of sealed soil (concrete/asphalt).'
  },
  far: {
    title: 'FAR (Floor Area Ratio)',
    category: 'Urban & Human Factors',
    desc: 'Building density; relationship between built area and land area.'
  },
  pop_density: {
    title: 'Pop_Density',
    category: 'Urban & Human Factors',
    desc: 'Number of people living in the area (WorldPop 100m grids).'
  }
};

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

  // ADRF — grilla NDVI → LST causal (calibrated to LinearGAM from modelo_final.ipynb)
  // Key calibration points from notebook: n_splines=10
  //   NDVI 0.3 → LST ≈ 42.35 | 0.4 → 41.84 | 0.5 → 41.81 | 0.6 → 41.35
  ndviGrid: Array.from({ length: 89 }, (_, i) => +(i / 100).toFixed(2)),
  adrf(x) {
    // Piecewise linear interpolation calibrated to real GAM spline
    if (x < 0.05) return 43.0;                          // extrapolation
    if (x < 0.12) return 43.0 - (x - 0.05) * 4.79;    // bare soil: -0.335°C per 0.1
    if (x < 0.20) return 42.664 - (x - 0.12) * 11.26;  // sparse veg: -0.901°C per 0.1
    if (x < 0.323) return 42.16 - (x - 0.20) * 3.08;   // moderate veg: -0.308°C per 0.1
    if (x < 0.50) return 41.78 - (x - 0.323) * 3.42;   // dense veg: -0.342°C per 0.1
    if (x < 0.80) return 41.17 - (x - 0.50) * 15.27;   // parks/forest: -1.527°C per 0.1
    return 36.59;                                        // extrapolation cap
  },
  marginal(x) {
    // Marginal effect °C per 0.1 NDVI, from notebook thermal regime table
    if (x < 0.12) return -0.335;    // Bare soil / almost bare
    if (x < 0.20) return -0.901;    // Sparse vegetation
    if (x < 0.323) return -0.308;   // Moderate vegetation
    if (x < 0.50) return -0.342;    // Dense vegetation
    return -1.527;                  // Parks / urban forest
  },

  // Love plot — confounders (Real Correlations from modelo_final.ipynb)
  confounders: [
    'Impermeability', 'Building density (FAR)', 'Nighttime Lights',
    'Dist. to Roads', 'Wind Speed', 'Elevation',
    'Latitude', 'Longitude', 'Distance to Water'
  ],
  rObs: [0.714, 0.642, 0.587, 0.401, 0.307, 0.241, 0.237, 0.198, 0.033],
  rIPW: [0.075, 0.076, 0.082, 0.066, 0.042, 0.047, 0.046, 0.011, 0.014],
};
