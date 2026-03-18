/**
 * main.js — UHI Causal Dashboard
 * State machine de navegación para los 8 slides.
 * Depende de: slides.js, charts.js, map.js
 */

/* ══════════════════════════════════════════════════
   Estado global
══════════════════════════════════════════════════ */
let currentSlide = 0;
const TOTAL = SLIDES.length;  // 8

/* ══════════════════════════════════════════════════
   Referencias DOM (cacheadas al init)
══════════════════════════════════════════════════ */
let elProgressBar, elDots, elCurrent, elBtnNext, elBtnText, elBtnIcon,
    elTitlePreview, elBtnRestart;

/* ══════════════════════════════════════════════════
   Generar dots de navegación
══════════════════════════════════════════════════ */
function buildDots() {
  elDots.innerHTML = '';
  SLIDES.forEach((slide, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' dot--active' : '');
    dot.setAttribute('aria-label', `Ir al slide ${i + 1}: ${slide.title}`);
    dot.addEventListener('click', () => navigateTo(i));
    elDots.appendChild(dot);
  });
}

/* ══════════════════════════════════════════════════
   Actualizar UI según slide activo
══════════════════════════════════════════════════ */
function updateUI(index) {
  const slide = SLIDES[index];

  // Progress bar
  const pct = ((index + 1) / TOTAL) * 100;
  elProgressBar.style.width = `${pct}%`;
  elProgressBar.style.background = slide.progressColor;

  // Contador
  elCurrent.textContent = String(index + 1).padStart(2, '0');

  // Dots
  document.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('dot--active', i === index);
  });

  // Botón siguiente
  const isLast = index === TOTAL - 1;
  elBtnText.textContent = isLast ? 'Restart' : slide.btnLabel;

  // Remover todas las clases temáticas y asignar la correcta
  elBtnNext.className = `btn-next ${slide.btnTheme}`;

  // Para Slide 7 (methodology scrollable) y Slide 8 (results scrollable), hacemos que nav-footer sea position:fixed
  const navFooter = document.querySelector('.nav-footer');
  if (navFooter) {
    if (slide.key === 'results' || slide.key === 'methodology') {
      navFooter.classList.add('nav-footer--sticky');
      navFooter.style.position = 'fixed';
      navFooter.style.bottom = '24px';
      navFooter.style.right = '32px';
      navFooter.style.left = 'auto';
      navFooter.style.zIndex = '1000';
      navFooter.style.background = 'rgba(10,12,16,0.85)';
      navFooter.style.backdropFilter = 'blur(12px)';
      navFooter.style.borderRadius = '50px';
      navFooter.style.padding = '0 8px 0 24px';
      navFooter.style.height = '56px';
      navFooter.style.borderTop = 'none';
      navFooter.style.border = '1px solid rgba(255,255,255,0.1)';
      navFooter.style.boxShadow = '0 8px 32px rgba(0,0,0,0.5)';
      navFooter.style.width = 'auto';
    } else {
      navFooter.classList.remove('nav-footer--sticky');
      navFooter.style.position = '';
      navFooter.style.bottom = '';
      navFooter.style.right = '';
      navFooter.style.left = '';
      navFooter.style.zIndex = '';
      navFooter.style.background = '';
      navFooter.style.backdropFilter = '';
      navFooter.style.borderRadius = '';
      navFooter.style.padding = '';
      navFooter.style.height = '';
      navFooter.style.borderTop = '';
      navFooter.style.border = '';
      navFooter.style.boxShadow = '';
      navFooter.style.width = '';
    }
  }

  // Icono del botón
  if (isLast) {
    elBtnIcon.setAttribute('data-lucide', 'rotate-ccw');
  } else {
    elBtnIcon.setAttribute('data-lucide', 'arrow-right');
  }
  lucide.createIcons({ nodes: [elBtnIcon] });

  // Preview del siguiente slide
  if (!isLast) {
    elTitlePreview.textContent = `Next: ${SLIDES[index + 1].subtitle}`;
  } else {
    elTitlePreview.textContent = 'End of narrative · Milan UHI 2021–2025';
  }

  // Animar contador
  elCurrent.style.transform = 'translateY(-6px)';
  elCurrent.style.opacity = '0';
  requestAnimationFrame(() => {
    elCurrent.style.transition = 'all 0.25s ease';
    elCurrent.style.transform = 'translateY(0)';
    elCurrent.style.opacity = '1';
  });
}

/* ══════════════════════════════════════════════════
   Navegación principal
══════════════════════════════════════════════════ */
function navigateTo(nextIndex, direction = 'forward') {
  if (nextIndex === currentSlide) return;
  if (nextIndex < 0 || nextIndex >= TOTAL) return;

  const prevSlide = document.getElementById(`slide-${currentSlide + 1}`);
  const nextSlide = document.getElementById(`slide-${nextIndex + 1}`);

  if (!prevSlide || !nextSlide) return;

  // Salida del slide actual
  prevSlide.classList.remove('slide--active');
  prevSlide.classList.add('slide--exit-up');

  // Limpiar clase de salida tras animación
  setTimeout(() => {
    prevSlide.classList.remove('slide--exit-up');
  }, 550);

  // Entrada del nuevo slide
  nextSlide.classList.add('slide--active');

  currentSlide = nextIndex;
  updateUI(currentSlide);

  // Lazy init de charts y mapa
  const slideConf = SLIDES[currentSlide];

  // Evaluar funciones de inicialización específicas del slide
  if (slideConf.chartInit && Array.isArray(slideConf.chartInit)) {
    slideConf.chartInit.forEach(fName => {
      if (typeof window[fName] === 'function') {
        window[fName]();
      }
    });
  }

  initChartsForSlide(slideConf.key);
  if (slideConf.hasMap) {
    setTimeout(initMap, 150);
  }
}

/* ══════════════════════════════════════════════════
   Slide 3: Data Dictionary Logic
══════════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════
   Slide 8: Results Dashboard Logic
   ══════════════════════════════════════════════════ */
let adrfChart_res, balChart_res, balOn_res = false;

function initResultsDashboard() {
  const slide8 = document.getElementById('slide-8');
  if (!slide8) return;
  slide8.scrollTop = 0;

  const adrf_model = (x) => UHI_DATA.adrf(x);
  const marg_model = (x) => UHI_DATA.marginal(x);
  const ciLo = (x) => adrf_model(x) - 0.75; // Real CI band from notebook approx
  const ciHi = (x) => adrf_model(x) + 0.75;

  const N = 100;
  const grid = Array.from({ length: N }, (_, i) => 0.05 + i * (0.787 - 0.05) / (N - 1));

  const ndviCtx = (v) => {
    if (v < 0.18) return 'asphalt / bare soil';
    if (v < 0.35) return 'mixed urban area';
    if (v < 0.50) return 'sparse vegetation';
    if (v < 0.65) return 'urban park';
    return 'forest / dense green';
  };

  const updateSim = () => {
    const slA = document.getElementById('sl-a');
    const slB = document.getElementById('sl-b');
    if (!slA || !slB) return;

    const a = parseInt(slA.value) / 100;
    const b = parseInt(slB.value) / 100;

    const elVa = document.getElementById('va');
    const elVb = document.getElementById('vb');
    if (elVa) elVa.textContent = a.toFixed(2);
    if (elVb) elVb.textContent = b.toFixed(2);

    const elCtxA = document.getElementById('ctx-a');
    const elCtxB = document.getElementById('ctx-b');
    if (elCtxA) elCtxA.textContent = ndviCtx(a);
    if (elCtxB) elCtxB.textContent = ndviCtx(b);

    const lA = adrf_model(a), lB = adrf_model(b), d = lB - lA;
    const cool = d <= 0;
    const sign = d <= 0 ? '−' : '+', abs = Math.abs(d).toFixed(1);
    
    const eb = document.getElementById('ebox');
    if (eb) {
      eb.className = 'effect-panel ' + (cool ? 'cool' : 'warm');
      const elLabel = document.getElementById('ep-label');
      const elBig = document.getElementById('ep-big');
      const elDesc = document.getElementById('ep-desc');
      if (elLabel) {
        elLabel.textContent = cool ? 'Causal cooling effect' : 'Causal warming effect';
        elLabel.style.color = cool ? 'var(--veg-dark)' : '#993C1D';
      }
      if (elBig) {
        elBig.textContent = sign + abs + '°C';
        elBig.style.color = cool ? 'var(--veg-dark)' : '#993C1D';
      }
      if (elDesc) {
        elDesc.textContent = `NDVI ${a.toFixed(2)} → ${b.toFixed(2)}`;
        elDesc.style.color = cool ? 'var(--veg-light, #66BB6A)' : '#D85A30';
      }
      
      const elLstA = document.getElementById('lst-a');
      const elLstB = document.getElementById('lst-b');
      const elIc = document.getElementById('lst-ic');
      const elMarg = document.getElementById('marg-b');
      
      if (elLstA) elLstA.textContent = lA.toFixed(1) + '°C';
      if (elLstB) elLstB.textContent = lB.toFixed(1) + '°C';
      if (elIc) elIc.textContent = `[${(d - 0.75).toFixed(1)}, ${(d + 0.75).toFixed(1)}]°C`;
      if (elMarg) elMarg.textContent = marg_model(b).toFixed(1) + '°C / 0.1 NDVI';
    }

    // ── Intervention Equivalents (using ForestaMi verified data) ──
    // Density: ~1,000 plants/ha (ForestaMi standard, April 2024 press conference)
    // Area: delta_ndvi * 1,800 ha (calibrated to Milan's 181 km² urban footprint,
    //       assuming ~20% greening potential per Politecnico di Milano / ForestaMi mapping)
    const area = Math.round(Math.abs(b - a) * 1800);
    const trees = area * 1000;
    const pct_forestami = Math.round((trees / 3000000) * 100);
    const elArea = document.getElementById('eq-area');
    const elTrees = document.getElementById('eq-trees');
    const elPct = document.getElementById('eq-pct');
    if (elArea) elArea.textContent = '~' + area.toLocaleString() + ' ha';
    if (elTrees) elTrees.textContent = '~' + trees.toLocaleString();
    if (elPct) elPct.textContent = pct_forestami + '% of 3M target';

    if (adrfChart_res) {
      adrfChart_res.data.datasets[3].data = [{ x: a, y: adrf_model(a) }];
      adrfChart_res.data.datasets[4].data = [{ x: b, y: adrf_model(b) }];
      adrfChart_res.data.datasets[5].data = [{ x: a, y: adrf_model(a) }, { x: b, y: adrf_model(b) }];
      adrfChart_res.update('none');
    }
  };

  const toggleBal = () => {
    balOn_res = !balOn_res;
    const btn = document.getElementById('bal-toggle');
    if (btn) btn.classList.toggle('on', balOn_res);
    
    const narr = document.getElementById('bal-narr');
    const rAntes = UHI_DATA.rObs;
    const rDesp  = UHI_DATA.rIPW;

    if (balOn_res) {
      if (narr) narr.textContent = 'GPS-IPW achieved balance: 9/9 confounders below ASMD 0.10. Average ASMD dropped from 0.373 to 0.051 (86% improvement). The pseudo-population allows estimating the net causal effect of NDVI.';
      if (balChart_res) {
        balChart_res.data.datasets[0].data = rDesp;
        balChart_res.data.datasets[0].backgroundColor = rDesp.map(v => v > .10 ? '#D32F2F' : '#66BB6A');
      }
    } else {
      if (narr) narr.textContent = 'In the observational world, NDVI is strongly correlated with urban confounders. Green areas are systematically less dense and less paved — the correlation is not causal.';
      if (balChart_res) {
        balChart_res.data.datasets[0].data = rAntes;
        balChart_res.data.datasets[0].backgroundColor = rAntes.map(v => v > .10 ? '#D32F2F' : '#66BB6A');
      }
    }
    if (balChart_res) balChart_res.update();
  };

  const initCharts = () => {
    const ctxA = document.getElementById('adrf-chart');
    if (ctxA && !adrfChart_res) {
      adrfChart_res = new Chart(ctxA, {
        type: 'line',
        data: {
          datasets: [
            { data: grid.map(x => ({ x, y: ciHi(x) })), borderWidth: 0, pointRadius: 0, fill: '+1', backgroundColor: 'rgba(102,187,106,0.1)', tension: .4 },
            { data: grid.map(x => ({ x, y: ciLo(x) })), borderWidth: 0, pointRadius: 0, fill: false, tension: .4 },
            { label: 'ADRF', data: grid.map(x => ({ x, y: adrf_model(x) })), borderColor: '#66BB6A', borderWidth: 2.5, pointRadius: 0, fill: false, tension: .4 },
            { data: [{ x: .20, y: adrf_model(.20) }], type: 'scatter', pointRadius: 8, pointBackgroundColor: '#7986CB', pointBorderColor: '#fff', pointBorderWidth: 2 },
            { data: [{ x: .55, y: adrf_model(.55) }], type: 'scatter', pointRadius: 8, pointBackgroundColor: '#66BB6A', pointBorderColor: '#fff', pointBorderWidth: 2 },
            { data: [{ x: .20, y: adrf_model(.20) }, { x: .55, y: adrf_model(.55) }], borderColor: 'rgba(121,134,203,0.3)', borderDash: [5, 4], borderWidth: 1.5, pointRadius: 0, fill: false }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { type: 'linear', min: .05, max: .8, ticks: { color: '#999', font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
            y: { min: 38, max: 48, ticks: { color: '#999', font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.05)' } }
          }
        }
      });
    }

    const ctxB = document.getElementById('bal-chart');
    if (ctxB && !balChart_res) {
      balChart_res = new Chart(ctxB, {
        type: 'bar',
        data: {
          labels: UHI_DATA.confounders,
          datasets: [{
            label: '|ASMD|',
            data: UHI_DATA.rObs,
            backgroundColor: UHI_DATA.rObs.map(v => v > .10 ? '#D32F2F' : '#66BB6A'),
            borderRadius: 4
          }]
        },
        options: {
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { min: 0, max: .7, ticks: { color: '#999', font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
            y: { ticks: { color: '#444', font: { size: 11, weight: '600' } }, grid: { display: false } }
          }
        }
      });
    }
  };

  const initSubNav = () => {
    const dotsWrap = document.getElementById('results-nav-dots');
    const subSlides = document.querySelectorAll('.results-sub-slide');
    if (!dotsWrap || subSlides.length === 0) return;

    dotsWrap.innerHTML = '';
    const labels = ['Balance', 'Simulator', 'Thermal Regimes'];
    subSlides.forEach((s, i) => {
      const dot = document.createElement('div');
      dot.className = 'nav-dot' + (i === 0 ? ' active' : '');
      dot.title = labels[i];
      dot.onclick = () => {
        s.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
      dotsWrap.appendChild(dot);
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = Array.from(subSlides).indexOf(entry.target);
          document.querySelectorAll('.results-nav .nav-dot').forEach((d, i) => {
            d.classList.toggle('active', i === idx);
          });
        }
      });
    }, { threshold: 0.5, root: slide8 });
    subSlides.forEach(s => observer.observe(s));
  };

  document.getElementById('sl-a')?.addEventListener('input', updateSim);
  document.getElementById('sl-b')?.addEventListener('input', updateSim);
  document.getElementById('bal-toggle')?.addEventListener('click', toggleBal);

  initCharts();
  initSubNav();
  updateSim();
}

function initVariableSlide() {
  const buttons = document.querySelectorAll('.var-btn');
  const infoPlaceholder = document.querySelector('.var-info-placeholder');
  const infoContent = document.getElementById('var-info-content');
  const infoTitle = document.getElementById('var-info-title');
  const infoDesc = document.getElementById('var-info-desc');
  const infoCategory = document.getElementById('var-info-category');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const varKey = btn.getAttribute('data-var');
      const data = VAR_DICTIONARY[varKey];

      if (!data) return;

      // Actualizar UI activa
      buttons.forEach(b => b.classList.remove('var-btn--active'));
      btn.classList.add('var-btn--active');

      // Mostrar contenido
      if (infoPlaceholder) infoPlaceholder.classList.add('hidden');
      if (infoContent) infoContent.classList.remove('hidden');

      if (infoTitle) infoTitle.textContent = data.title;
      if (infoDesc) infoDesc.textContent = data.desc;
      if (infoCategory) infoCategory.textContent = data.category;
      
      // Animación sutil
      infoContent.style.opacity = '0';
      infoContent.style.transform = 'translateY(10px)';
      requestAnimationFrame(() => {
        infoContent.style.transition = 'all 0.3s ease';
        infoContent.style.opacity = '1';
        infoContent.style.transform = 'translateY(0)';
      });
    });
  });
}

/* ══════════════════════════════════════════════════
   Animación del número gigante (Slide 1)
══════════════════════════════════════════════════ */
function animateCountUp() {
  const el = document.querySelector('.animate-count');
  if (!el) return;
  const target = parseInt(el.dataset.target || '8', 10);
  let current = 0;
  const duration = 1200;
  const step = duration / target;
  el.textContent = '0';

  const interval = setInterval(() => {
    current++;
    el.textContent = current;
    if (current >= target) clearInterval(interval);
  }, step);
}

/* ══════════════════════════════════════════════════
   Evento del botón Siguiente
══════════════════════════════════════════════════ */
function handleNext() {
  if (currentSlide === TOTAL - 1) {
    // Reiniciar al slide 1
    navigateTo(0);
  } else {
    navigateTo(currentSlide + 1);
  }
}

/* ══════════════════════════════════════════════════
   Navegación por teclado
══════════════════════════════════════════════════ */
function handleKeydown(e) {
  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowDown':
    case 'Space':
    case ' ':
      e.preventDefault();
      handleNext();
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
      e.preventDefault();
      if (currentSlide > 0) navigateTo(currentSlide - 1, 'backward');
      break;
    case 'Home':
      e.preventDefault();
      navigateTo(0);
      break;
    case 'End':
      e.preventDefault();
      navigateTo(TOTAL - 1);
      break;
  }
}

/* ══════════════════════════════════════════════════
   Touch / swipe para móvil
══════════════════════════════════════════════════ */
let touchStartY = 0;
let touchStartX = 0;

function handleTouchStart(e) {
  touchStartY = e.touches[0].clientY;
  touchStartX = e.touches[0].clientX;
}

function handleTouchEnd(e) {
  const dy = touchStartY - e.changedTouches[0].clientY;
  const dx = touchStartX - e.changedTouches[0].clientX;

  // Solo si el swipe es principalmente vertical
  if (Math.abs(dy) < Math.abs(dx)) return;
  if (Math.abs(dy) < 50) return;    // umbral mínimo

  if (dy > 0 && currentSlide < TOTAL - 1) {
    navigateTo(currentSlide + 1);
  } else if (dy < 0 && currentSlide > 0) {
    navigateTo(currentSlide - 1, 'backward');
  }
}

/* ══════════════════════════════════════════════════
   Inicialización al cargar el DOM
══════════════════════════════════════════════════ */
function init() {
  // Cachear elementos
  elProgressBar  = document.getElementById('progress-bar');
  elDots         = document.getElementById('slide-dots');
  elCurrent      = document.getElementById('slide-current');
  elBtnNext      = document.getElementById('btn-next');
  elBtnText      = document.getElementById('btn-next-text');
  elBtnIcon      = elBtnNext.querySelector('.btn-icon');
  elTitlePreview = document.getElementById('slide-title-preview');
  elBtnRestart   = document.getElementById('btn-restart');

  // Total de slides en el DOM
  document.getElementById('slide-total').textContent =
    String(TOTAL).padStart(2, '0');

  // Construir dots
  buildDots();

  // Activar primer slide sin animación de salida
  const first = document.getElementById('slide-1');
  if (first) first.classList.add('slide--active');

  // UI inicial
  updateUI(0);

  // Animación del número de stat al inicio
  setTimeout(animateCountUp, 400);

  // Inicializar lógica de variables (Slide 3)
  initVariableSlide();

  // Lucide icons
  if (typeof lucide !== 'undefined') lucide.createIcons();

  // Event listeners
  elBtnNext.addEventListener('click', handleNext);

  if (elBtnRestart) {
    elBtnRestart.addEventListener('click', () => navigateTo(0));
  }

  document.addEventListener('keydown', handleKeydown);
  document.addEventListener('touchstart', handleTouchStart, { passive: true });
  document.addEventListener('touchend',   handleTouchEnd,   { passive: true });

  // Re-inicializar lucide tras cada navigate (para el icono del botón)
  // (ya lo hacemos en updateUI con createIcons)

  console.log(
    `%c UHI Causal Dashboard %c v1.0.0 `,
    'background:#2E7D32;color:#fff;padding:3px 6px;border-radius:4px 0 0 4px;font-weight:700',
    'background:#424242;color:#fff;padding:3px 6px;border-radius:0 4px 4px 0',
  );
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
