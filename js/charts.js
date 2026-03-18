/**
 * charts.js — UHI Causal Dashboard
 * Inicializadores de Chart.js y D3.js para cada slide.
 * Usa lazy-init: cada función se llama SOLO cuando el slide se activa.
 * Depende de: slides.js (UHI_DATA)
 */

// Registro de instancias para no re-renderizar
const ChartInstances = {};

// Paleta compartida (sync con CSS vars)
const COLOR = {
  vegLight:    '#66BB6A',
  vegDark:     '#2E7D32',
  heatUrban:   '#FB8C00',
  heatExtreme: '#D32F2F',
  neutral:     '#FDD835',
  urban:       '#424242',
  white:       '#ffffff',
  gridLine:    'rgba(255,255,255,0.06)',
  axisColor:   'rgba(255,255,255,0.35)',
};

// Opciones base compartidas
function baseOptions(overrides = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 800, easing: 'easeOutQuart' },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(20,25,30,0.92)',
        titleColor: COLOR.white,
        bodyColor: 'rgba(255,255,255,0.7)',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      },
      ...overrides.plugins,
    },
    scales: {
      x: {
        grid: { color: COLOR.gridLine },
        ticks: { color: COLOR.axisColor, font: { size: 11, family: "'JetBrains Mono', monospace" } },
        ...overrides.xScale,
      },
      y: {
        grid: { color: COLOR.gridLine },
        ticks: { color: COLOR.axisColor, font: { size: 11, family: "'JetBrains Mono', monospace" } },
        ...overrides.yScale,
      },
    },
    ...overrides,
  };
}

/* ══════════════════════════════════════════════════
   SLIDE 3 — Serie temporal LST
══════════════════════════════════════════════════ */
function initLSTTimeseries() {
  if (ChartInstances['lst-ts']) return;
  const canvas = document.getElementById('chart-lst-timeseries');
  if (!canvas) return;

  ChartInstances['lst-ts'] = new Chart(canvas, {
    type: 'line',
    data: {
      labels: UHI_DATA.years,
      datasets: [
        {
          label: 'Urban',
          data: UHI_DATA.lstUrban,
          borderColor: COLOR.heatExtreme,
          backgroundColor: 'rgba(211,47,47,0.12)',
          borderWidth: 2.5,
          pointRadius: 5,
          pointBackgroundColor: COLOR.heatExtreme,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          fill: false,
          tension: 0.35,
        },
        {
          label: 'Agricultural',
          data: UHI_DATA.lstAgriculture,
          borderColor: COLOR.neutral,
          backgroundColor: 'rgba(253,216,53,0.08)',
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: COLOR.neutral,
          pointBorderColor: '#fff',
          pointBorderWidth: 1.5,
          fill: false,
          tension: 0.35,
        },
        {
          label: 'Forests',
          data: UHI_DATA.lstForest,
          borderColor: COLOR.vegLight,
          backgroundColor: 'rgba(102,187,106,0.12)',
          borderWidth: 2.5,
          pointRadius: 5,
          pointBackgroundColor: COLOR.vegLight,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          fill: false,
          tension: 0.35,
        },
        {
          label: 'Water',
          data: UHI_DATA.lstWater,
          borderColor: '#42A5F5',
          backgroundColor: 'rgba(66,165,245,0.08)',
          borderWidth: 1.5,
          pointRadius: 3,
          pointBackgroundColor: '#42A5F5',
          fill: false,
          tension: 0.35,
          borderDash: [4, 3],
        },
      ],
    },
    options: baseOptions({
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            color: 'rgba(255,255,255,0.6)',
            font: { size: 11, family: "'Inter', sans-serif" },
            boxWidth: 14, usePointStyle: true, pointStyleWidth: 10,
          },
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)} °C`,
          },
        },
      },
      yScale: { min: 34, max: 52, title: { display: true, text: 'LST (°C)', color: COLOR.axisColor, font: { size: 11 } } },
      xScale: { title: { display: true, text: 'Year', color: COLOR.axisColor, font: { size: 11 } } },
    }),
  });
}

/* ──── SLIDE 3 — Distribución NDVI ─────────────── */
function initNDVIDist() {
  if (ChartInstances['ndvi-dist']) return;
  const canvas = document.getElementById('chart-ndvi-dist');
  if (!canvas) return;

  ChartInstances['ndvi-dist'] = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: UHI_DATA.ndviBins.map(b => b.toFixed(1)),
      datasets: [
        {
          label: 'Urban',
          data: UHI_DATA.ndviUrban,
          backgroundColor: 'rgba(211,47,47,0.55)',
          borderColor: COLOR.heatExtreme,
          borderWidth: 1,
          borderRadius: 3,
        },
        {
          label: 'Forests',
          data: UHI_DATA.ndviForest,
          backgroundColor: 'rgba(102,187,106,0.55)',
          borderColor: COLOR.vegLight,
          borderWidth: 1,
          borderRadius: 3,
        },
      ],
    },
    options: baseOptions({
      plugins: {
        legend: {
          display: true, position: 'top', align: 'end',
          labels: { color: 'rgba(255,255,255,0.6)', font: { size: 10 }, boxWidth: 12 },
        },
        tooltip: {
          callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()} px` },
        },
      },
      xScale: { title: { display: true, text: 'NDVI', color: COLOR.axisColor, font: { size: 11 } } },
      yScale: { title: { display: true, text: 'No. pixels', color: COLOR.axisColor, font: { size: 11 } } },
    }),
  });
}

/* ══════════════════════════════════════════════════
   SLIDE 7 — ADRF causal (Dose-Response)
══════════════════════════════════════════════════ */
function initADRF() {
  if (ChartInstances['adrf']) return;
  const canvas = document.getElementById('chart-adrf');
  if (!canvas) return;

  const g    = UHI_DATA.ndviGrid;
  const aVal = g.map(x => UHI_DATA.adrf(x));
  const ciLo = aVal.map((v, i) => v - (g[i] < 0.12 ? 2.2 : 0.85));
  const ciHi = aVal.map((v, i) => v + (g[i] < 0.12 ? 2.2 : 0.85));

  ChartInstances['adrf'] = new Chart(canvas, {
    type: 'line',
    data: {
      datasets: [
        {
          label: 'IC 95% hi',
          data: g.map((x, i) => ({ x, y: ciHi[i] })),
          borderWidth: 0, pointRadius: 0,
          fill: '+1',
          backgroundColor: 'rgba(102,187,106,0.12)',
          tension: 0.4,
        },
        {
          label: 'IC 95% lo',
          data: g.map((x, i) => ({ x, y: ciLo[i] })),
          borderWidth: 0, pointRadius: 0,
          fill: false, tension: 0.4,
        },
        {
          label: 'Causal ADRF',
          data: g.map((x, i) => ({ x, y: aVal[i] })),
          borderColor: COLOR.vegLight,
          borderWidth: 2.5,
          pointRadius: 0,
          fill: false,
          tension: 0.4,
        },
      ],
    },
    options: baseOptions({
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ctx.parsed.y != null ? ` LST: ${ctx.parsed.y.toFixed(1)} °C` : '',
          },
        },
      },
      xScale: { type: 'linear', min: 0, max: 0.88, title: { display: true, text: 'NDVI', color: COLOR.axisColor, font: { size: 10 } } },
      yScale: { min: 33, max: 52, title: { display: true, text: 'LST (°C)', color: COLOR.axisColor, font: { size: 10 } } },
    }),
  });
}

/* ──── SLIDE 7 — Love Plot ──────────────────────── */
function initLovePlot() {
  if (ChartInstances['loveplot']) return;
  const canvas = document.getElementById('chart-loveplot');
  if (!canvas) return;

  const { confounders, rObs, rIPW } = UHI_DATA;

  ChartInstances['loveplot'] = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: confounders,
      datasets: [
        {
          label: 'Observational',
          data: rObs,
          backgroundColor: rObs.map(v => v > 0.10 ? 'rgba(211,47,47,0.65)' : 'rgba(102,187,106,0.55)'),
          borderColor:      rObs.map(v => v > 0.10 ? COLOR.heatExtreme     : COLOR.vegLight),
          borderWidth: 1,
          borderRadius: 3,
        },
        {
          label: 'GPS-IPW',
          data: rIPW,
          backgroundColor: 'rgba(102,187,106,0.35)',
          borderColor: COLOR.vegLight,
          borderWidth: 1,
          borderRadius: 3,
          hidden: true,
          borderDash: [3, 2],
        },
      ],
    },
    options: {
      ...baseOptions({
        plugins: {
          legend: {
            display: true, position: 'top',
            labels: { color: 'rgba(255,255,255,0.6)', font: { size: 10 }, boxWidth: 12 },
          },
          tooltip: {
            callbacks: { label: ctx => ` |r| = ${ctx.parsed.x.toFixed(3)}` },
          },
        },
      }),
      indexAxis: 'y',
      scales: {
        x: {
          min: 0, max: 0.6,
          grid: { color: COLOR.gridLine },
          ticks: { color: COLOR.axisColor, font: { size: 9 } },
          title: { display: true, text: '|Correlation|', color: COLOR.axisColor, font: { size: 10 } },
        },
        y: {
          grid: { display: false },
          ticks: { color: COLOR.axisColor, font: { size: 9 } },
        },
      },
    },
  });
}

/* ══════════════════════════════════════════════════
   SLIDE 8 — Rendimiento Marginal
══════════════════════════════════════════════════ */
function initMarginal() {
  if (ChartInstances['marginal']) return;
  const canvas = document.getElementById('chart-marginal');
  if (!canvas) return;

  const g    = UHI_DATA.ndviGrid;
  const mVal = g.map(x => UHI_DATA.marginal(x));

  ChartInstances['marginal'] = new Chart(canvas, {
    type: 'line',
    data: {
      datasets: [
        {
          label: 'dLST/dNDVI',
          data: g.map((x, i) => ({ x, y: Math.max(mVal[i], -22) })),
          borderColor: '#9C27B0',
          borderWidth: 2,
          pointRadius: 0,
          fill: {
            target: { value: 0 },
            above: 'rgba(211,47,47,0.1)',
            below: 'rgba(102,187,106,0.15)',
          },
          tension: 0.4,
        },
        {
          label: 'Zero',
          data: g.map(x => ({ x, y: 0 })),
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          pointRadius: 0,
          fill: false,
        },
      ],
    },
    options: baseOptions({
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y.toFixed(2)} °C/NDVI` } },
      },
      xScale: { type: 'linear', min: 0, max: 0.88, title: { display: true, text: 'NDVI', color: COLOR.axisColor, font: { size: 10 } } },
      yScale: { title: { display: true, text: 'dLST/dNDVI', color: COLOR.axisColor, font: { size: 10 } } },
    }),
  });
}

/* ══════════════════════════════════════════════════
   SLIDE 6 — DAG Causal con D3
══════════════════════════════════════════════════ */
function initDAG() {
  const svg = document.getElementById('dag-svg');
  if (!svg || svg.dataset.initialized) return;
  svg.dataset.initialized = 'true';

  const W = svg.parentElement.offsetWidth || 500;
  const H = 400;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  const s   = d3.select(svg);
  const mid = W / 2;

  // Nodos del DAG GPS
  const nodes = [
    { id: 'X',    label: 'Confounders\n(X)',       x: mid,     y: 60,  color: COLOR.heatUrban,  r: 38 },
    { id: 'GPS',  label: 'GPS\nf(T|X)',            x: mid-160, y: 180, color: COLOR.neutral,    r: 34 },
    { id: 'T',    label: 'NDVI\n(Treatment)',    x: mid-80,  y: 300, color: COLOR.vegLight,   r: 38 },
    { id: 'IPW',  label: 'Weights\nIPW',             x: mid+80,  y: 210, color: COLOR.neutral,    r: 30 },
    { id: 'Y',    label: 'LST °C\n(Outcome)',      x: mid+160, y: 320, color: '#EF9A9A',        r: 38 },
    { id: 'ADRF', label: 'Causal\nADRF',           x: mid+80,  y: 340, color: COLOR.vegDark,   r: 32 },
  ];

  // Aristas
  const links = [
    { s: 'X', t: 'GPS', label: 'estimates' },
    { s: 'X', t: 'T',   label: 'confounds' },
    { s: 'X', t: 'Y',   label: '' },
    { s: 'GPS', t: 'IPW', label: 'generates' },
    { s: 'T', t: 'Y',   label: 'causal\neffect', highlight: true },
    { s: 'IPW', t: 'ADRF', label: 'weights' },
    { s: 'T', t: 'ADRF', label: '' },
    { s: 'Y', t: 'ADRF', label: '' },
  ];

  // Defs — flecha
  const defs = s.append('defs');
  ['default', 'highlight'].forEach(type => {
    defs.append('marker')
      .attr('id', `arrow-${type}`)
      .attr('markerWidth', 8).attr('markerHeight', 8)
      .attr('refX', 6).attr('refY', 3)
      .attr('orient', 'auto')
      .append('path')
        .attr('d', 'M0,0 L0,6 L8,3 z')
        .attr('fill', type === 'highlight' ? COLOR.vegLight : 'rgba(255,255,255,0.3)');
  });

  // Helper para punto en borde del nodo (círculo)
  function edgePoint(nFrom, nTo, radius) {
    const dx = nTo.x - nFrom.x;
    const dy = nTo.y - nFrom.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    return { x: nFrom.x + dx / dist * radius, y: nFrom.y + dy / dist * radius };
  }

  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

  // Aristas
  links.forEach(l => {
    const nS = nodeMap[l.s], nT = nodeMap[l.t];
    const p1 = edgePoint(nS, nT, nS.r + 4);
    const p2 = edgePoint(nT, nS, nT.r + 4);

    s.append('line')
      .attr('x1', p1.x).attr('y1', p1.y)
      .attr('x2', p2.x).attr('y2', p2.y)
      .attr('stroke', l.highlight ? COLOR.vegLight : 'rgba(255,255,255,0.2)')
      .attr('stroke-width', l.highlight ? 2 : 1.2)
      .attr('stroke-dasharray', l.highlight ? '0' : '5,3')
      .attr('marker-end', `url(#arrow-${l.highlight ? 'highlight' : 'default'})`);

    if (l.label) {
      const mx = (p1.x + p2.x) / 2;
      const my = (p1.y + p2.y) / 2;
      s.append('text')
        .attr('x', mx).attr('y', my - 5)
        .attr('text-anchor', 'middle')
        .attr('font-size', '9px')
        .attr('fill', l.highlight ? COLOR.vegLight : 'rgba(255,255,255,0.3)')
        .attr('font-family', "'JetBrains Mono', monospace")
        .text(l.label);
    }
  });

  // Nodos
  const nodeG = s.selectAll('.dag-node-g')
    .data(nodes).enter()
    .append('g')
    .attr('class', 'dag-node-g')
    .attr('transform', d => `translate(${d.x},${d.y})`);

  nodeG.append('circle')
    .attr('r', d => d.r)
    .attr('fill', d => d.color + '22')
    .attr('stroke', d => d.color)
    .attr('stroke-width', 1.5);

  nodeG.each(function(d) {
    const lines = d.label.split('\n');
    const g = d3.select(this);
    lines.forEach((line, i) => {
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', `${(i - (lines.length - 1) / 2) * 14}px`)
        .attr('font-size', lines.length > 1 && i === 1 ? '9px' : '10px')
        .attr('font-weight', i === 0 ? '700' : '400')
        .attr('fill', i === 0 ? '#fff' : 'rgba(255,255,255,0.6)')
        .attr('font-family', "'Inter', sans-serif")
        .text(line);
    });
  });
}

/* ══════════════════════════════════════════════════
   Dispatcher — llamado por main.js
══════════════════════════════════════════════════ */
function initChartsForSlide(slideKey) {
  switch (slideKey) {
    case 'evidence':
      setTimeout(initLSTTimeseries, 80);
      setTimeout(initNDVIDist, 80);
      break;
    case 'methodology':
      setTimeout(initDAG, 80);
      break;
    case 'results':
      // El slide de resultados usa su propia lógica en index.html (slide7_external)
      break;
    case 'policy':
      setTimeout(initMarginal, 80);
      break;
  }
}
