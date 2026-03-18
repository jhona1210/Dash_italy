/**
 * map.js — UHI Causal Dashboard
 * Leaflet.js — Multi-variable map (LST, NDVI, Impermeabilidad, Pop_Density)
 * Dataset: assets/data/milan_data.geojson  |  25,540 Point features
 * Uses L.canvas() renderer + setStyle() for instant layer updates.
 */

/* ═══════════════════════════════════════════════════════
   State
═══════════════════════════════════════════════════════ */
let mapInstance         = null;
let geojsonLayer        = null;
let municipiLayer       = null;
let legendControl       = null;
let mapInitialized      = false;
let currentVariable     = 'LST_Celsius';
let _highlightedMuni    = null;
let _selectedMuniFeature = null;   // last clicked municipality feature
let _milanBounds        = null;    // initial full-city bounds (for reset)

/* ═══════════════════════════════════════════════════════
   Variable Configuration
═══════════════════════════════════════════════════════ */
const VAR_CONFIG = {
  LST_Celsius: {
    label: 'LST — Surface Temperature',
    unit:  '°C',
    format: v => parseFloat(v).toFixed(2) + ' °C',
    colorFn: (v) => {
      v = parseFloat(v);
      if (v < 35) return '#66BB6A';
      if (v < 40) return '#FDD835';
      if (v < 45) return '#FB8C00';
      if (v < 50) return '#D32F2F';
      return              '#424242';
    },
    legend: [
      { label: '< 35°C  · Cool / Vegetation', color: '#66BB6A' },
      { label: '35–40°C · Neutral urban',      color: '#FDD835' },
      { label: '40–45°C · Urban heat',         color: '#FB8C00' },
      { label: '45–50°C · Extreme heat',       color: '#D32F2F' },
      { label: '> 50°C  · Critical surfaces',  color: '#424242' },
    ],
  },

  NDVI: {
    label: 'NDVI — Vegetation Index',
    unit:  '',
    format: v => parseFloat(v).toFixed(3),
    colorFn: (v) => {
      v = parseFloat(v);
      if (v < 0.1) return '#F5F5DC';   // bare / imperv.
      if (v < 0.2) return '#FDD835';   // very sparse
      if (v < 0.35) return '#A5D6A7';  // sparse
      if (v < 0.55) return '#4CAF50';  // moderate
      if (v < 0.7)  return '#388E3C';  // dense
      return               '#1B5E20';  // very dense
    },
    legend: [
      { label: '< 0.10  · Impervious / Bare',  color: '#F5F5DC' },
      { label: '0.10–0.20 · Very sparse veg.', color: '#FDD835' },
      { label: '0.20–0.35 · Sparse',           color: '#A5D6A7' },
      { label: '0.35–0.55 · Moderate',         color: '#4CAF50' },
      { label: '0.55–0.70 · Dense',            color: '#388E3C' },
      { label: '> 0.70   · Very dense',        color: '#1B5E20' },
    ],
  },

  Impermeabilidad: {
    label: 'Impermeability — Sealed soil',
    unit:  '%',
    format: v => (parseFloat(v) * 100).toFixed(1) + '%',
    colorFn: (v) => {
      v = parseFloat(v);
      if (v < 0.1)  return '#66BB6A';  // permeable (veg.)
      if (v < 0.25) return '#FDD835';
      if (v < 0.45) return '#FB8C00';
      if (v < 0.65) return '#9E9E9E';
      return               '#424242';  // fully sealed
    },
    legend: [
      { label: '< 10%   · Permeable (veg.)',    color: '#66BB6A' },
      { label: '10–25%  · Low sealing',         color: '#FDD835' },
      { label: '25–45%  · Moderate',            color: '#FB8C00' },
      { label: '45–65%  · High sealing',        color: '#9E9E9E' },
      { label: '> 65%   · Fully sealed',        color: '#424242' },
    ],
  },

  Pop_Density: {
    label: 'Population Density',
    unit:  'inh/km²',
    format: v => parseFloat(v).toFixed(0) + ' inh/km²',
    colorFn: (v) => {
      v = parseFloat(v);
      if (v < 5)   return '#212121';   // depopulated
      if (v < 20)  return '#455A64';
      if (v < 50)  return '#7986CB';
      if (v < 92)  return '#9575CD';   // ~p95
      return              '#CE93D8';   // high density
    },
    legend: [
      { label: '< 5     · Depopulated',   color: '#212121' },
      { label: '5–20    · Very low',      color: '#455A64' },
      { label: '20–50   · Low',          color: '#7986CB' },
      { label: '50–90   · Medium',       color: '#9575CD' },
      { label: '> 90    · High density', color: '#CE93D8' },
    ],
  },

  NDBI: {
    label: 'NDBI — Built-up Index',
    unit:  '',
    format: v => parseFloat(v).toFixed(3),
    colorFn: (v) => {
      v = parseFloat(v);
      if (v < -0.1) return '#A5D6A7';
      if (v < 0.1)  return '#E0E0E0';
      if (v < 0.3)  return '#9E9E9E';
      return               '#424242';
    },
    legend: [
      { label: '< -0.1 · Vegetation / Water', color: '#A5D6A7' },
      { label: '(-0.1, 0.1) · Sparse Built',  color: '#E0E0E0' },
      { label: '0.1-0.3 · Built-up',          color: '#9E9E9E' },
      { label: '> 0.3 · High density built', color: '#424242' },
    ],
  },

  NDWI: {
    label: 'NDWI — Water Index',
    unit:  '',
    format: v => parseFloat(v).toFixed(3),
    colorFn: (v) => {
      v = parseFloat(v);
      if (v < -0.3) return '#FDD835';
      if (v < 0.0)  return '#4CAF50';
      return               '#1976D2';
    },
    legend: [
      { label: '< -0.3 · Dry surfaces', color: '#FDD835' },
      { label: '(-0.3, 0) · Vegetation', color: '#4CAF50' },
      { label: '> 0 · Water content',    color: '#1976D2' },
    ],
  },

  BSI: {
    label: 'BSI — Bare Soil Index',
    unit:  '',
    format: v => parseFloat(v).toFixed(3),
    colorFn: (v) => {
      v = parseFloat(v);
      if (v < 0) return '#4CAF50';
      if (v < 0.05) return '#D7CCC8';
      return '#8D6E63';
    },
    legend: [
      { label: '< 0 · Vegetation',     color: '#4CAF50' },
      { label: '0-0.05 · Sparse soil', color: '#D7CCC8' },
      { label: '> 0.05 · Bare soil',   color: '#8D6E63' },
    ],
  },

  Albedo: {
    label: 'Albedo — Reflectivity',
    unit:  '',
    format: v => parseFloat(v).toFixed(3),
    colorFn: (v) => {
      v = parseFloat(v);
      if (v < 0.1)  return '#212121';
      if (v < 0.2)  return '#616161';
      if (v < 0.3)  return '#BDBDBD';
      return               '#EEEEEE';
    },
    legend: [
      { label: '< 0.1 · Low (Asphalt)',  color: '#212121' },
      { label: '0.1-0.2 · Medium',       color: '#616161' },
      { label: '0.2-0.3 · High',         color: '#BDBDBD' },
      { label: '> 0.3 · Very High',      color: '#EEEEEE' },
    ],
  },

  SVF: {
    label: 'SVF — Sky View Factor',
    unit:  '',
    format: v => parseFloat(v).toFixed(3),
    colorFn: (v) => {
      v = parseFloat(v);
      if (v < 0.5) return '#424242';
      if (v < 0.8) return '#9E9E9E';
      return              '#E0E0E0';
    },
    legend: [
      { label: '< 0.5 · Obstructed',    color: '#424242' },
      { label: '0.5-0.8 · Partial',     color: '#9E9E9E' },
      { label: '> 0.8 · Open sky',      color: '#E0E0E0' },
    ],
  },

  FAR: {
    label: 'FAR — Floor Area Ratio',
    unit:  '',
    format: v => parseFloat(v).toFixed(2),
    colorFn: (v) => {
      v = parseFloat(v);
      if (v < 1)  return '#F5F5F5';
      if (v < 3)  return '#BDBDBD';
      if (v < 6)  return '#757575';
      return              '#212121';
    },
    legend: [
      { label: '< 1 · Low density',     color: '#F5F5F5' },
      { label: '1-3 · Medium density',  color: '#BDBDBD' },
      { label: '3-6 · High density',    color: '#757575' },
      { label: '> 6 · Extremely dense', color: '#212121' },
    ],
  },

  Soil_Moisture: {
    label: 'Soil Moisture',
    unit:  '',
    format: v => parseFloat(v).toFixed(3),
    colorFn: (v) => {
      v = parseFloat(v);
      if (v < 0.2) return '#D7CCC8';
      if (v < 0.3) return '#81C784';
      return              '#1976D2';
    },
    legend: [
      { label: '< 0.2 · Dry',    color: '#D7CCC8' },
      { label: '0.2-0.3 · Moise', color: '#81C784' },
      { label: '> 0.3 · Wet',    color: '#1976D2' },
    ],
  },

  Wind_Speed: {
    label: 'Wind Speed',
    unit:  'm/s',
    format: v => parseFloat(v).toFixed(2) + ' m/s',
    colorFn: (v) => {
      v = parseFloat(v);
      if (v < 1) return '#90A4AE';
      if (v < 2) return '#4FC3F7';
      return            '#0288D1';
    },
    legend: [
      { label: '< 1 m/s · Low',    color: '#90A4AE' },
      { label: '1-2 m/s · Medium', color: '#4FC3F7' },
      { label: '> 2 m/s · High',   color: '#0288D1' },
    ],
  },
};

/* ═══════════════════════════════════════════════════════
   Municipality context data (9 Municipi di Milano)
═══════════════════════════════════════════════════════ */
const MUNICIPI_DATA = {
  1: {
    nombre: 'Centro Storico',
    info: 'Dominant features: Monuments and Luxury. Museum district, historic palaces, and the most expensive fashion boutiques in the world (Quadrilatero della Moda). Everything is stone, marble, and architecture from the 18th and 19th centuries.',
    tags: ['🏛 Heritage', '💎 Luxury', '🗿 History'],
  },
  2: {
    nombre: 'Stazione Centrale · NoLo',
    info: 'Dominant features: Movement and Multiculturalism. The imposing fascist architecture of the Central Station, ethnic hotels and restaurants. In NoLo, artists\' studios and vibrant young nightlife.',
    tags: ['🚉 Station', '🌍 Multicultural', '🎨 Art'],
  },
  3: {
    nombre: 'Città Studi · Lambrate',
    info: 'Dominant features: University life and Industrial Design. Science faculties, libraries, and students. In Lambrate, industrial warehouses converted into design lofts and headquarters of the Milan Design Week.',
    tags: ['🎓 University', '🏭 Industrial', '✏️ Design'],
  },
  4: {
    nombre: 'Vittoria · Forlanini',
    info: 'Dominant features: Logistics and Middle-class Residences. Transit area towards Linate. Home to the Fruit and Vegetable Market (one of the largest in Europe) and the immense Forlanini Park.',
    tags: ['✈️ Linate', '🌿 Park', '🏠 Residential'],
  },
  5: {
    nombre: 'Vigentino · Chiaravalle',
    info: 'Dominant features: Modern Art and Countryside. Total contrast: the Fondazione Prada (ultra-modern) and, to the south, rice fields, ancient farms (cascine), and the Chiaravalle Abbey.',
    tags: ['🖼 Fondaz. Prada', '🌾 Agriculture', '⛪ History'],
  },
  6: {
    nombre: 'Barona · Lorenteggio',
    info: 'Dominant features: Canals and Interior Design. The famous Navigli full of bars and nightlife. In Via Tortona, fashion showrooms and photography studios in former factories.',
    tags: ['🚣 Navigli', '🍸 Nightlife', '👗 Fashion'],
  },
  7: {
    nombre: 'Baggio · San Siro',
    info: 'Dominant features: Sports and Giant Parks. The San Siro Stadium, the "Temple of Football". It is the area with the most vegetation: the Boscoincittà, a real forest within the city.',
    tags: ['⚽ San Siro', '🌲 Boscoincittà', '🏡 Green'],
  },
  8: {
    nombre: 'Fiera · Gallaratese · CityLife',
    info: 'Dominant features: Futuristic Architecture and Shopping Malls. The Milan of the future. Skyscrapers by Zaha Hadid, Arata Isozaki, and Daniel Libeskind, and an open-air luxury shopping center.',
    tags: ['🏗 Skyscrapers', '🛍 CityLife', '🚀 Futurism'],
  },
  9: {
    nombre: 'Isola · Bicocca',
    info: 'Dominant features: Skyscrapers and Business Centers. In Isola, the Vertical Forest and Porta Nuova. Further north, Bicocca: glass office buildings and the second largest university in Milan.',
    tags: ['🌳 Bosco Verticale', '🏢 Porta Nuova', '🎓 Bicocca'],
  },
};

/* ═══════════════════════════════════════════════════════
   Inject dark popup / tooltip styles (once) - LIGHT MODE updated
═══════════════════════════════════════════════════════ */
function injectPopupStyles() {
  if (document.getElementById('lst-popup-styles')) return;
  const s = document.createElement('style');
  s.id = 'lst-popup-styles';
  s.textContent = `
    .lst-popup .leaflet-popup-content-wrapper {
      background: rgba(10,12,14,0.92);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.5);
      padding: 0;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    .lst-popup .leaflet-popup-content { margin: 14px 16px; font-family: 'Inter', sans-serif; color: #FFFFFF; }
    .lst-popup .leaflet-popup-tip { background: rgba(10,12,14,0.92); }
    .lst-popup .leaflet-popup-close-button {
      color: rgba(255,255,255,0.5) !important;
      top: 6px; right: 8px;
    }
    .lst-popup .leaflet-popup-close-button:hover { color: #FFF !important; }
    .lst-tooltip {
      background: rgba(10,12,14,0.85) !important;
      border: 1px solid rgba(255,255,255,0.1) !important;
      color: #FFF !important;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10.5px;
      border-radius: 6px !important;
      padding: 4px 9px !important;
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
    }
  `;
  document.head.appendChild(s);
}

/* ═══════════════════════════════════════════════════════
   Popup builder — highlights active variable in bold
═══════════════════════════════════════════════════════ */
function buildPopup(p) {
  const cfg = VAR_CONFIG[currentVariable];
  const get = (key, fallback = '—') => {
    let v = p[key];
    if (v === undefined || v === null) return fallback;
    return typeof v === 'string' ? parseFloat(v) : v;
  };

  const lst  = get('LST_Celsius');
  const ndvi = get('NDVI');
  const imp  = get('Impermeabilidad');
  const pop  = get('Pop_Density');
  const alb  = get('Albedo');
  const ws   = get('Wind_Speed');

  // New categorical USO_DUSAF logic
  const usoRaw = p.USO_DUSAF || 'Unknown';
  const usoMap = {
    'Uso_Urbano_Artificial': '🏙 Urban / Artificial',
    'Uso_Agricola':         '🌾 Agriculture',
    'Uso_Bosques_Naturaleza': '🌳 Forest / Nature',
    'Uso_Agua':             '💧 Water',
    'Uso_Humedales':        '🌿 Wetlands',
  };
  const uso = usoMap[usoRaw] || usoRaw.replace('Uso_', '').replace(/_/g, ' ');

  const row = (label, value, varKey, fmtFn, accent) => {
    const isActive = varKey === currentVariable;
    const color    = isActive ? (accent || '#FFF') : 'rgba(255,255,255,0.5)';
    const weight   = isActive ? '700' : '400';
    const display  = typeof value === 'number' && !isNaN(value) ? fmtFn(value) : value;
    return `
      <span style="color:rgba(255,255,255,0.45);font-size:10.5px">${label}</span>
      <span style="color:${color};font-weight:${weight};font-size:${isActive ? '12px' : '11px'}">${display}</span>`;
  };

  const lstColor = typeof lst === 'number' && !isNaN(lst) ? VAR_CONFIG.LST_Celsius.colorFn(lst) : '#FFF';

  return `
    <div style="font-family:'Inter',sans-serif;min-width:210px;color:#FFF">
      <div style="font-weight:700;font-size:13px;margin-bottom:10px;color:#FFF;
                  border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:7px">
        📍 Point data
      </div>
      <div style="display:grid;grid-template-columns:auto 1fr;gap:5px 14px;
                  font-family:'JetBrains Mono',monospace;align-items:center">
        ${row('LST',            lst,  'LST_Celsius',    v => v.toFixed(2)+' °C', lstColor)}
        ${row('NDVI',           ndvi, 'NDVI',           v => v.toFixed(3), '#81C784')}
        ${row('Impermeab.',     imp,  'Impermeabilidad', v => (v*100).toFixed(1)+'%', '#FFB74D')}
        ${row('Pop. density',   pop,  'Pop_Density',    v => v.toFixed(0)+' inh/km²', '#BA68C8')}
        ${row('Albedo',         alb,  'Albedo',         v => v.toFixed(3), '#EEEEEE')}
        ${row('Wind Speed',     ws,   'Wind_Speed',     v => v.toFixed(2)+' m/s', '#0288D1')}
        <span style="color:rgba(255,255,255,0.45);font-size:10.5px">Land use</span>
        <span style="color:#FFF;font-size:11px">${uso}</span>
      </div>
    </div>`;
}

/* ═══════════════════════════════════════════════════════
   Legend builder/destroyer
═══════════════════════════════════════════════════════ */
function buildLegend(map, varKey) {
  if (legendControl) { map.removeControl(legendControl); legendControl = null; }

  const cfg  = VAR_CONFIG[varKey];
  legendControl = L.control({ position: 'bottomright' });
  legendControl.onAdd = () => {
    const div = L.DomUtil.create('div', 'lst-legend');
    div.style.cssText = `
      background: rgba(10,12,14,0.88);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px; padding: 12px 16px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10.5px; color: rgba(255,255,255,0.6);
      min-width: 190px;
    `;
    div.innerHTML =
      `<b style="color:#FFF;font-size:11px;display:block;margin-bottom:8px;letter-spacing:1px">${cfg.label}</b>` +
      cfg.legend.map(s =>
        `<div style="display:flex;align-items:center;gap:8px;margin:4px 0">
           <span style="width:12px;height:12px;border-radius:50%;background:${s.color};
                        display:inline-block;flex-shrink:0;box-shadow:0 0 6px ${s.color}44"></span>
           ${s.label}
         </div>`
      ).join('');
    return div;
  };
  legendControl.addTo(map);
}

/* ═══════════════════════════════════════════════════════
   Core: updateMapLayer — uses setStyle (no GeoJSON reload)
═══════════════════════════════════════════════════════ */
function updateMapLayer(varKey) {
  if (!geojsonLayer) return;

  /* ── 'none' → hide all points, remove legend ─────── */
  if (varKey === 'none') {
    currentVariable = 'none';
    geojsonLayer.eachLayer(layer => layer.setStyle({ fillOpacity: 0, opacity: 0 }));
    if (legendControl) { mapInstance.removeControl(legendControl); legendControl = null; }
    return;
  }

  if (!VAR_CONFIG[varKey]) return;
  currentVariable = varKey;

  const cfg = VAR_CONFIG[varKey];

  // Re-style every existing circle marker (instant, no network)
  geojsonLayer.eachLayer(layer => {
    let v = layer.feature?.properties?.[varKey];
    if (v === undefined || v === null) return;
    v = parseFloat(v);
    if (isNaN(v)) return;

    layer.setStyle({
      fillColor:   cfg.colorFn(v),
      fillOpacity: 0.82,
    });
    // Re-bind tooltip with new value
    layer.unbindTooltip();
    layer.bindTooltip(`${cfg.format(v)}`, {
      className: 'lst-tooltip',
      direction: 'top',
      offset:    [0, -6],
      sticky:    true,
    });
  });

  // Rebuild legend
  buildLegend(mapInstance, varKey);

  // Update selector UI to reflect active state
  const sel = document.getElementById('map-var-select');
  if (sel && sel.value !== varKey) sel.value = varKey;

  // Refresh municipality panel metric for the new variable
  refreshPanelForCurrentVariable();

  // Ensure boundaries stay on top
  if (municipiLayer && mapInstance.hasLayer(municipiLayer)) {
    municipiLayer.bringToFront();
  }
}

/* ═══════════════════════════════════════════════════════
   Update stat badges (min/max) in the slide header
═══════════════════════════════════════════════════════ */
function updateLSTBadges(min, max) {
  const minEl = document.getElementById('lst-min-val');
  const maxEl = document.getElementById('lst-max-val');
  if (minEl) minEl.textContent = min.toFixed(1) + '°C';
  if (maxEl) maxEl.textContent = max.toFixed(1) + '°C';
}

/* ═══════════════════════════════════════════════════════
   Main init
═══════════════════════════════════════════════════════ */
function initMap() {
  if (mapInitialized) { setTimeout(() => mapInstance?.invalidateSize(), 200); return; }

  const container = document.getElementById('map-container');
  if (!container || typeof L === 'undefined') {
    console.warn('[map.js] Leaflet or #map-container not available');
    return;
  }

  const overlay = container.querySelector('.map-overlay-label');
  if (overlay) overlay.style.display = 'none';

  injectPopupStyles();

  /* ── Create map ─────────────────────────────────────── */
  mapInstance = L.map('map-container', {
    center:           [45.4642, 9.1900],
    zoom:             11,
    zoomControl:      false,
    attributionControl: false,
    preferCanvas:     true, // forces circleMarkers to render on <canvas>
    // no specific renderer here, Leaflet will auto-create canvas for points and SVG for polygons.
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd', maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
  }).addTo(mapInstance);

  L.control.zoom({ position: 'topright' }).addTo(mapInstance);
  L.control.attribution({ position: 'bottomleft', prefix: false })
    .addAttribution('<span style="font-size:9px;opacity:0.4">© CARTO · OSM · Landsat 8</span>')
    .addTo(mapInstance);

  buildLegend(mapInstance, currentVariable);

  /* ── Bind selector events ───────────────────────────── */
  const sel = document.getElementById('map-var-select');
  if (sel) {
    sel.value = currentVariable;
    sel.addEventListener('change', e => updateMapLayer(e.target.value));
  }

  const muniToggle = document.getElementById('map-muni-toggle');
  if (muniToggle) {
    muniToggle.addEventListener('change', e => {
      const showMuni = e.target.checked;
      if (showMuni) {
        if (municipiLayer && !mapInstance.hasLayer(municipiLayer)) {
          municipiLayer.addTo(mapInstance);
          if (municipiLayer.bringToFront) municipiLayer.bringToFront();
        } else if (!municipiLayer) {
          loadMunicipiLayer(mapInstance); // load if not loaded yet
        }
      } else {
        if (municipiLayer && mapInstance.hasLayer(municipiLayer)) {
          mapInstance.removeLayer(municipiLayer);
        }
        // Force hide reset btn & info panel
        _hideResetBtn();
        const panel = document.getElementById('info-municipio');
        if (panel) panel.classList.remove('info-municipio--visible');
        _highlightedMuni = null;
        _selectedMuniFeature = null;
      }
    });
  }

  /* ── Fullscreen Toggle ──────────────────────────────── */
  const fullscreenBtn = document.getElementById('map-fullscreen-btn');
  const mapContainer = document.getElementById('map-container');
  const mapWrapper = document.querySelector('.map-wrapper');

  if (fullscreenBtn && mapContainer && mapWrapper) {
    fullscreenBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
      
      if (!isFullscreen) {
        // Expandimos el mapWrapper para mantener controles UI dentro de pantalla completa,
        // pero le daremos max-width y max-height para obligar redimensionamiento.
        const targetElement = mapWrapper;
        if (targetElement.requestFullscreen) {
          targetElement.requestFullscreen().catch(err => console.warn(err));
        } else if (targetElement.webkitRequestFullscreen) {
          targetElement.webkitRequestFullscreen();
        } else if (targetElement.mozRequestFullScreen) {
          targetElement.mozRequestFullScreen();
        } else if (targetElement.msRequestFullscreen) {
          targetElement.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    };

    const handleFSChange = () => {
      const isFs = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
      if (isFs) {
        fullscreenBtn.setAttribute('title', 'Exit fullscreen');
        fullscreenBtn.setAttribute('aria-label', 'Exit fullscreen');
        fullscreenBtn.innerHTML = '<i data-lucide="minimize"></i>';
      } else {
        fullscreenBtn.setAttribute('title', 'Fullscreen');
        fullscreenBtn.setAttribute('aria-label', 'Fullscreen');
        fullscreenBtn.innerHTML = '<i data-lucide="maximize"></i>';
      }
      if (window.lucide) window.lucide.createIcons({ root: fullscreenBtn });
      setTimeout(() => { if (mapInstance) mapInstance.invalidateSize(); }, 200);
    };

    document.addEventListener('fullscreenchange', handleFSChange);
    document.addEventListener('webkitfullscreenchange', handleFSChange);
    document.addEventListener('mozfullscreenchange', handleFSChange);
    document.addEventListener('MSFullscreenChange', handleFSChange);
  }

  /* ── Loading indicator ──────────────────────────────── */
  const loadingEl = document.createElement('div');
  loadingEl.id = 'map-loading';
  loadingEl.style.cssText = `
    position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
    font-family:'Inter',sans-serif;font-size:12px;color:rgba(255,255,255,0.4);
    background:rgba(10,12,14,0.7);z-index:500;pointer-events:none;`;
  loadingEl.innerHTML = `<div style="text-align:center">
    <div style="font-size:28px;margin-bottom:10px">🗺</div>
    Loading 129,680 data points…
  </div>`;
  container.style.position = 'relative';
  container.appendChild(loadingEl);

  /* ── Fetch GeoJSON ──────────────────────────────────── */
  fetch('assets/data/milan_sample_20k_2.geojson')
    .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    .then(data => {
      loadingEl.remove();

      const cfg = VAR_CONFIG[currentVariable];

      /* Compute LST min/max for badges */
      let minLST = Infinity, maxLST = -Infinity;
      data.features.forEach(f => {
        let v = f.properties?.LST_Celsius;
        if (v !== undefined && v !== null) {
          v = parseFloat(v);
          if (!isNaN(v)) {
            if (v < minLST) minLST = v;
            if (v > maxLST) maxLST = v;
          }
        }
      });
      if (isFinite(minLST)) updateLSTBadges(minLST, maxLST);

      /* Render layer */
      geojsonLayer = L.geoJSON(data, {
        pointToLayer: (feature, latlng) => {
          let v = feature.properties?.[currentVariable] ?? 40;
          v = parseFloat(v);
          if (isNaN(v)) v = 40;
          return L.circleMarker(latlng, {
            radius:      4,
            fillColor:   cfg.colorFn(v),
            color:       'transparent',
            fillOpacity: 0.82,
            weight:      0,
          });
        },
        onEachFeature: (feature, lyr) => {
          lyr.bindPopup(() => buildPopup(feature.properties), {
            className: 'lst-popup',
            maxWidth:  260,
          });
          let v = feature.properties?.[currentVariable];
          if (v !== undefined && v !== null) {
            v = parseFloat(v);
            if (!isNaN(v)) {
              lyr.bindTooltip(cfg.format(v), {
                className: 'lst-tooltip',
                direction: 'top',
                offset:    [0, -6],
                sticky:    true,
              });
            }
          }
        },
      }).addTo(mapInstance);

      try {
        const b = geojsonLayer.getBounds();
        mapInstance.fitBounds(b, { padding: [20, 20] });
        _milanBounds = b;   // save for Reset Zoom
      } catch(e) {}

      // Load municipality boundary overlay on top
      loadMunicipiLayer(mapInstance);

      mapInitialized = true;
      setTimeout(() => mapInstance.invalidateSize(), 300);
    })
    .catch(err => {
      console.error('[map.js] GeoJSON load failed:', err);
      loadingEl.innerHTML = `<div style="text-align:center">
        <div style="font-size:20px;margin-bottom:8px">⚠️</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.35)">
          GeoJSON not found<br/>
          <span style="font-size:9px;font-family:monospace">assets/data/milan_data.geojson</span>
        </div>
      </div>`;
      _loadFallbackDemoPoints();
      mapInitialized = true;
    });
}

/* ═══════════════════════════════════════════════════════
   Fallback demo (if GeoJSON unavailable)
═══════════════════════════════════════════════════════ */
function _loadFallbackDemoPoints() {
  const DEMO = [
    { name: 'Centro Storico', lat: 45.4654, lng: 9.1859, LST_Celsius: 51.2, NDVI: 0.12, Impermeabilidad: 0.92, Pop_Density: 120 },
    { name: 'Parco Sempione', lat: 45.4714, lng: 9.1689, LST_Celsius: 38.1, NDVI: 0.58, Impermeabilidad: 0.10, Pop_Density: 2 },
    { name: 'Bicocca',        lat: 45.5100, lng: 9.2088, LST_Celsius: 44.3, NDVI: 0.32, Impermeabilidad: 0.52, Pop_Density: 45 },
    { name: 'Parco Lambro',   lat: 45.4920, lng: 9.2440, LST_Celsius: 37.5, NDVI: 0.62, Impermeabilidad: 0.08, Pop_Density: 1 },
    { name: 'Quarto Oggiaro', lat: 45.5062, lng: 9.1459, LST_Celsius: 50.5, NDVI: 0.15, Impermeabilidad: 0.88, Pop_Density: 95 },
  ];
  const cfg = VAR_CONFIG[currentVariable];
  geojsonLayer = L.geoJSON({
    type: 'FeatureCollection',
    features: DEMO.map(d => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [d.lng, d.lat] },
      properties: d,
    })),
  }, {
    pointToLayer: (f, ll) => {
      const v = f.properties[currentVariable] ?? 40;
      return L.circleMarker(ll, {
        radius: 20, fillColor: cfg.colorFn(v),
        color: 'rgba(255,255,255,0.2)', weight: 1,
        fillOpacity: 0.72,
      });
    },
    onEachFeature: (f, lyr) => {
      lyr.bindPopup(() => buildPopup(f.properties), { className: 'lst-popup', maxWidth: 260 });
      lyr.bindTooltip(f.properties.name, { className: 'lst-tooltip', direction: 'top' });
    },
  }).addTo(mapInstance);
  updateLSTBadges(37.5, 51.8);
  document.getElementById('map-loading')?.remove();
}

/* ═══════════════════════════════════════════════════════
   Compute average of any variable for points inside bounds
═══════════════════════════════════════════════════════ */
function computeMuniAvg(bounds, varKey) {
  if (!geojsonLayer || varKey === 'none') return NaN;
  let sum = 0, count = 0;
  geojsonLayer.eachLayer(pt => {
    const ll = pt.getLatLng ? pt.getLatLng() : null;
    if (ll && bounds.contains(ll)) {
      let v = pt.feature?.properties?.[varKey];
      if (v !== undefined && v !== null) {
        v = parseFloat(v);
        if (!isNaN(v)) { sum += v; count++; }
      }
    }
  });
  return count > 0 ? sum / count : NaN;
}

/* ═══════════════════════════════════════════════════════
   Reset-zoom button helpers
═══════════════════════════════════════════════════════ */
function _showResetBtn() {
  let btn = document.getElementById('map-reset-zoom');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'map-reset-zoom';
    btn.className = 'map-reset-zoom-btn';
    btn.innerHTML = '🗺 View full Milan';
    btn.addEventListener('click', () => {
      // Reset zoom to full city
      if (mapInstance && _milanBounds) {
        mapInstance.flyToBounds(_milanBounds, { padding: [20, 20], duration: 0.8 });
      }
      // Reset highlighted municipality
      if (_highlightedMuni && municipiLayer) {
        municipiLayer.resetStyle(_highlightedMuni);
      }
      _highlightedMuni    = null;
      _selectedMuniFeature = null;
      // Hide panel
      const panel = document.getElementById('info-municipio');
      if (panel) panel.classList.remove('info-municipio--visible');
      _hideResetBtn();
    });
    // Inject into map wrapper
    const wrapper = document.querySelector('.map-wrapper');
    if (wrapper) wrapper.appendChild(btn);
  }
  btn.classList.add('map-reset-zoom-btn--visible');
}

function _hideResetBtn() {
  const btn = document.getElementById('map-reset-zoom');
  if (btn) btn.classList.remove('map-reset-zoom-btn--visible');
}

/* ═══════════════════════════════════════════════════════
   Municipality info panel — variable-aware
═══════════════════════════════════════════════════════ */
function showMunicipiPanel(feature, bounds) {
  const props   = feature.properties || {};
  const munId   = props.municipio_id || props.MUNICIPIO || props.municipio || props.NIL || props.ID ||
                  props.id || props.num || props.numero || null;
  const munNum  = munId ? parseInt(munId, 10) : null;
  const data    = MUNICIPI_DATA[munNum] || null;

  const panel  = document.getElementById('info-municipio');
  const numEl  = document.getElementById('info-mun-num');
  const nameEl = document.getElementById('info-mun-name');
  const descEl = document.getElementById('info-mun-desc');
  const tagsEl = document.getElementById('info-mun-tags');
  const lstEl  = document.getElementById('info-mun-lst');
  if (!panel) return;

  const displayName = data?.nombre ||
    props.NOME || props.nome || props.NAME || props.name ||
    (munNum ? `Municipality ${munNum}` : 'Selected zone');
  const displayNum = munNum ? String(munNum).padStart(2, '0') : '—';

  if (numEl)  numEl.textContent  = displayNum;
  if (nameEl) nameEl.textContent = displayName;
  if (descEl) descEl.textContent = data?.info || 'Zone of the municipality of Milan.';

  if (tagsEl) {
    tagsEl.innerHTML = data?.tags
      ? data.tags.map(t => `<span class="info-mun-tag">${t}</span>`).join('')
      : '';
  }

  // ── Variable-aware metric ──────────────────────────────
  _updatePanelMetric(bounds, lstEl, panel);

  panel.classList.add('info-municipio--visible');
}

/* Updates just the metric row — called on variable change too */
function _updatePanelMetric(bounds, lstEl, panel) {
  if (!lstEl) lstEl = document.getElementById('info-mun-lst');
  if (!panel) panel = document.getElementById('info-municipio');
  if (!lstEl || !panel) return;

  const varKey = currentVariable === 'none' ? 'LST_Celsius' : currentVariable;
  const cfg    = VAR_CONFIG[varKey];
  const avg    = computeMuniAvg(bounds, varKey);

  if (typeof avg === 'number' && isFinite(avg)) {
    const color = cfg.colorFn(avg);
    lstEl.innerHTML = `
      <span class="info-mun-lst-label">Avg ${cfg.label.split(' — ')[0]} (zone)</span>
      <span class="info-mun-lst-val" style="color:${color}">${cfg.format(avg)}</span>`;
    panel.style.borderLeftColor = color;
    panel.style.borderLeftWidth = '3px';
  } else {
    lstEl.innerHTML = `<span class="info-mun-lst-label" style="opacity:0.4">No points in zone</span>`;
    panel.style.borderLeftColor = 'rgba(255,255,255,0.14)';
    panel.style.borderLeftWidth = '1px';
  }
}

/* Called from updateMapLayer when variable changes */
function refreshPanelForCurrentVariable() {
  if (!_selectedMuniFeature || !_highlightedMuni) return;
  const bounds = _highlightedMuni.getBounds();
  _updatePanelMetric(bounds, null, null);
}

/* ═══════════════════════════════════════════════════════
   Municipality polygon layer loader
═══════════════════════════════════════════════════════ */
function loadMunicipiLayer(map) {
  fetch('assets/data/municipi_label.geojson')
    .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    .then(data => {
      const BASE_STYLE  = {
        fillOpacity:  0,
        color:        '#000000',
        weight:       3,
        opacity:      0.85,
        dashArray:    '6, 6',
        dashOffset:   '0',
        interactive:  true,
      };
      const HOVER_STYLE = { color: '#000000', weight: 4.5, opacity: 1, dashArray: '6,6' };
      const SEL_STYLE   = { color: '#2E7D32', weight: 4.5, opacity: 1, dashArray: '6,6' };

      municipiLayer = L.geoJSON(data, {
        style: () => ({ ...BASE_STYLE }),

        // ── CRITICAL: make polygon FILL non-interactive so heat
        // ── points underneath remain clickable
        onEachFeature: (feature, layer) => {
          const p      = feature.properties || {};
          const munId  = p.MUNICIPIO || p.municipio || p.NIL || p.ID || p.id || p.num || p.numero;
          const munNum = munId ? parseInt(munId, 10) : null;
          const label  = MUNICIPI_DATA[munNum]?.nombre ||
            p.NOME || p.nome || p.NAME || p.name ||
            (munNum ? `Municipio ${munNum}` : 'Municipio');

          layer.bindTooltip(
            `<span style="font-family:'Inter',sans-serif;font-size:11.5px;font-weight:600;color:#FFF">${label}</span>`,
            { sticky: true, className: 'lst-tooltip', direction: 'top' }
          );

          layer.on('mouseover', () => {
            layer.setStyle(HOVER_STYLE);
            layer.bringToFront();
          });

          layer.on('mouseout', () => {
            if (_highlightedMuni !== layer) municipiLayer.resetStyle(layer);
          });

          layer.on('click', (e) => {
            // Stop propagation so the map doesn't zoom-in from native dblclick
            L.DomEvent.stopPropagation(e);

            // Deselect previous
            if (_highlightedMuni && _highlightedMuni !== layer) {
              municipiLayer.resetStyle(_highlightedMuni);
            }
            _highlightedMuni     = layer;
            _selectedMuniFeature = feature;
            layer.setStyle(SEL_STYLE);

            // ── Smooth zoom to municipality bounds ──────────
            const bounds = layer.getBounds();
            map.flyToBounds(bounds, { padding: [40, 40], duration: 0.9, maxZoom: 14 });

            // ── Show info panel (variable-aware) ────────────
            showMunicipiPanel(feature, bounds);

            // ── Show reset button ───────────────────────────
            _showResetBtn();
          });
        },
      });
      
      // Only add to map if toggle is actually ON
      const muniToggle = document.getElementById('map-muni-toggle');
      if (!muniToggle || muniToggle.checked) {
        municipiLayer.addTo(map);
        if (municipiLayer.bringToFront) municipiLayer.bringToFront();
      }

      console.log('[map.js] Municipi layer:', data.features?.length, 'polygons');
    })
    .catch(err => console.warn('[map.js] Municipi layer error:', err));
}

/* ═══════════════════════════════════════════════════════
   Public API
═══════════════════════════════════════════════════════ */
function invalidateMap() {
  if (mapInstance) mapInstance.invalidateSize();
}
