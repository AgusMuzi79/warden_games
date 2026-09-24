// carousel.js — Banner "Destacados" de la Home
// Depende de api.js (obtenerJuegos) y de #banner (.banner__pista, .banner__dots).
//
// Los slides van uno al lado del otro dentro de .banner__pista (un flex que
// se desliza con transform). Cada slide tiene un clip-path que le corta el
// borde izquierdo en diagonal y se superpone al anterior (margin-left
// negativo), así el que viene "atrás" asoma por ese corte todo el tiempo,
// no solo durante el cambio.

const pista = document.querySelector('.banner__pista');
const dotsContenedor = document.querySelector('.banner__dots');
const banner = document.getElementById('banner');

const DURACION_AUTOPLAY_MS = 6000;
const CANTIDAD_DESTACADOS = 4;

// Ancho de cada slide y cuánto se solapan con el anterior, en % del viewport.
const ANCHO_SLIDE = 82;
const SOLAPE = 14;
const PASO = ANCHO_SLIDE - SOLAPE; // cuánto se corre la pista por cada slide

const prefiereMovimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Si la API falla, destacamos estos juegos reales igual.
const DESTACADOS_DE_RESPALDO = [
  { name: 'The Witcher 3: Wild Hunt', background_image: 'https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg', rating: 4.64 },
  { name: 'Portal 2', background_image: 'https://media.rawg.io/media/games/2ba/2bac0e87cf45e5b508f227d281c9252a.jpg', rating: 4.58 },
  { name: 'Grand Theft Auto V', background_image: 'https://media.rawg.io/media/games/20a/20aa03a10cda45239fe22d035c0ebe64.jpg', rating: 4.47 },
  { name: 'Counter-Strike: Global Offensive', background_image: 'https://media.rawg.io/media/games/736/73619bd336c894d6941d926bfd563946.jpg', rating: 3.57 },
];

let slides = [];
let dots = [];
let indiceActivo = 0;
let timerAutoplay = null;

function elegirDestacados(juegos) {
  return [...juegos].sort((a, b) => b.rating - a.rating).slice(0, CANTIDAD_DESTACADOS);
}

function crearSlide(juego, esPrimero) {
  const slide = document.createElement('div');
  slide.className = 'banner__slide';
  slide.style.backgroundImage = `url("${juego.background_image}")`;
  if (esPrimero) slide.classList.add('banner__slide--primero');

  const etiqueta = document.createElement('span');
  etiqueta.className = 'banner__etiqueta';
  etiqueta.textContent = 'Destacado';

  const nombre = document.createElement('p');
  nombre.className = 'banner__nombre';
  nombre.textContent = juego.name;

  slide.append(etiqueta, nombre);
  return slide;
}

function crearDot(index, esActivo) {
  const dot = document.createElement('button');
  dot.type = 'button';
  dot.className = 'banner__dot' + (esActivo ? ' banner__dot--activo' : '');
  dot.setAttribute('aria-label', `Ir al destacado ${index + 1}`);
  dot.setAttribute('aria-current', String(esActivo));
  dot.addEventListener('click', () => irA(index));
  return dot;
}

function irA(index) {
  if (index === indiceActivo) return;

  slides[indiceActivo].classList.remove('banner__slide--activo');
  dots[indiceActivo].classList.remove('banner__dot--activo');
  dots[indiceActivo].setAttribute('aria-current', 'false');

  indiceActivo = index;

  slides[indiceActivo].classList.add('banner__slide--activo');
  dots[indiceActivo].classList.add('banner__dot--activo');
  dots[indiceActivo].setAttribute('aria-current', 'true');

  pista.style.transform = `translateX(-${indiceActivo * PASO}%)`;

  // Cualquier cambio (manual o automático) reinicia la cuenta del autoplay.
  programarSiguiente();
}

function siguiente() {
  irA((indiceActivo + 1) % slides.length);
}

// setTimeout que se reprograma solo: pausar es cancelarlo, reanudar es
// armar uno nuevo de cero (sin flag de "pausado" ni ambigüedad de en qué
// punto del ciclo anterior había quedado).
function programarSiguiente() {
  clearTimeout(timerAutoplay);
  if (prefiereMovimientoReducido || slides.length < 2) return;

  timerAutoplay = setTimeout(siguiente, DURACION_AUTOPLAY_MS);
}

function pausarAutoplay() {
  clearTimeout(timerAutoplay);
}

function iniciarAutoplay() {
  programarSiguiente();

  // Se pausa con hover o con foco de teclado (sin botón de pausa visible):
  // así alguien que navega con teclado también puede pararlo, llegando a
  // los dots con Tab.
  banner.addEventListener('pointerenter', pausarAutoplay);
  banner.addEventListener('pointerleave', programarSiguiente);
  banner.addEventListener('focusin', pausarAutoplay);
  banner.addEventListener('focusout', programarSiguiente);
}

function renderizarBanner(juegos) {
  const destacados = elegirDestacados(juegos);

  pista.innerHTML = '';
  dotsContenedor.innerHTML = '';
  indiceActivo = 0;
  pista.style.transform = 'translateX(0%)';

  slides = destacados.map((juego, i) => crearSlide(juego, i === 0));
  dots = destacados.map((_, i) => crearDot(i, i === 0));

  slides[0].classList.add('banner__slide--activo');

  slides.forEach((slide) => pista.append(slide));
  dots.forEach((dot) => dotsContenedor.append(dot));

  iniciarAutoplay();
}

obtenerJuegos()
  .then(renderizarBanner)
  .catch(() => renderizarBanner(DESTACADOS_DE_RESPALDO));
