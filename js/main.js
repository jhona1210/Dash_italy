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

  // Para Slide 7 (layout results scrollable), hacemos que nav-footer sea position:fixed
  const navFooter = document.querySelector('.nav-footer');
  if (navFooter) {
    if (slide.key === 'results') {
      navFooter.classList.add('nav-footer--sticky');
      // Aseguramos que el main wrapper permita visualizarse encima del slide scrollable
      navFooter.style.position = 'fixed';
      navFooter.style.bottom = '24px';
      navFooter.style.right = '32px';
      navFooter.style.left = 'auto';
      navFooter.style.zIndex = '1000';
    } else {
      navFooter.classList.remove('nav-footer--sticky');
      navFooter.style.position = '';
      navFooter.style.bottom = '';
      navFooter.style.right = '';
      navFooter.style.left = '';
      navFooter.style.zIndex = '';
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
  initChartsForSlide(slideConf.key);
  if (slideConf.hasMap) {
    setTimeout(initMap, 150);
  }
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
