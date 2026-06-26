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

  // ADRF — curva NDVI → LST causal CORREGIDA (Fase 6: GPS sin lat/lon + sigma homocedastica)
  // Fuente: F6_ADRF_tabla.csv (GAM ponderado, IC95 bootstrap espacial). Soporte [0.13, 0.82].
  // Lookup table de la curva real (cada ~0.02 NDVI) + interpolacion lineal.
  adrfLUT: [
    [0.129,44.36],[0.149,44.62],[0.169,44.60],[0.189,44.38],[0.209,44.02],[0.229,43.57],
    [0.249,43.08],[0.269,42.60],[0.289,42.19],[0.309,41.90],[0.329,41.77],[0.349,41.73],
    [0.369,41.74],[0.389,41.74],[0.409,41.67],[0.429,41.50],[0.449,41.28],[0.469,41.06],
    [0.489,40.86],[0.509,40.73],[0.529,40.66],[0.549,40.59],[0.569,40.50],[0.589,40.34],
    [0.609,40.08],[0.629,39.74],[0.649,39.33],[0.669,38.88],[0.689,38.41],[0.709,37.94],
    [0.729,37.46],[0.749,36.96],[0.769,36.44],[0.789,35.89],[0.809,35.30],[0.822,34.92]
  ],
  ndviGrid: Array.from({ length: 89 }, (_, i) => +(i / 100).toFixed(2)),
  adrf(x) {
    // Interpolacion lineal sobre la curva real corregida (clamp en los extremos del soporte)
    const L = this.adrfLUT;
    if (x <= L[0][0]) return L[0][1];
    if (x >= L[L.length - 1][0]) return L[L.length - 1][1];
    for (let i = 1; i < L.length; i++) {
      if (x <= L[i][0]) {
        const [x0, y0] = L[i - 1], [x1, y1] = L[i];
        return y0 + (y1 - y0) * (x - x0) / (x1 - x0);
      }
    }
    return L[L.length - 1][1];
  },
  marginal(x) {
    // Efecto marginal local (dLST por +0.1 NDVI) = derivada de la curva corregida
    return +(this.adrf(x + 0.05) - this.adrf(x - 0.05)).toFixed(3);
  },

  // Love plot — back-door set CORREGIDO (Fase 3/5): 7 confusores, |corr| crudo vs |corr| ponderado IPW
  confounders: [
    'Impermeability', 'Building density (FAR)', 'Land use: Agriculture',
    'Land use: Forest/Nature', 'Land use: Wetlands', 'Elevation', 'Wind Speed'
  ],
  rObs: [0.807, 0.725, 0.535, 0.216, 0.001, 0.261, 0.344],
  rIPW: [0.023, 0.011, 0.170, 0.152, 0.000, 0.082, 0.095],
};
