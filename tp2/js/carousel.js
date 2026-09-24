// carousel.js — Banner "Destacados" de la Home
// Depende de api.js (obtenerJuegos) y de #banner (.banner__viewport, .banner__dots).

const viewport = document.querySelector('.banner__viewport');
const dotsContenedor = document.querySelector('.banner__dots');
const banner = document.getElementById('banner');

const DURACION_AUTOPLAY_MS = 6000;
const CANTIDAD_DESTACADOS = 4;

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

// Cada vez que un slide entra, sube por encima de todos los anteriores.
// Así el que entra tapa al que estaba con su propio wipe, sin tener que
// esconder al anterior a mano ni coordinar dos animaciones a la vez.
let contadorZIndex = 1;

function elegirDestacados(juegos) {
  return [...juegos].sort((a, b) => b.rating - a.rating).slice(0, CANTIDAD_DESTACADOS);
}

function crearSlide(juego, id) {
  const slide = document.createElement('div');
  slide.id = id;
  slide.className = 'banner__slide';
  slide.style.backgroundImage = `url("${juego.background_image}")`;

  const etiqueta = document.createElement('span');
  etiqueta.className = 'banner__etiqueta';
  etiqueta.textContent = 'Destacado';

  const nombre = document.createElement('p');
  nombre.className = 'banner__nombre';
  nombre.textContent = juego.name;

  slide.append(etiqueta, nombre);
  return slide;
}

function crearDot(index, idSlide, esActivo) {
  const dot = document.createElement('button');
  dot.type = 'button';
  dot.className = 'banner__dot' + (esActivo ? ' banner__dot--activo' : '');
  dot.setAttribute('aria-label', `Ir al destacado ${index + 1}`);
  dot.setAttribute('aria-current', String(esActivo));
  dot.setAttribute('aria-controls', idSlide);
  dot.addEventListener('click', () => irA(index));
  return dot;
}

function irA(index) {
  if (index === indiceActivo) return;

  dots[indiceActivo].classList.remove('banner__dot--activo');
  dots[indiceActivo].setAttribute('aria-current', 'false');

  indiceActivo = index;

  const slide = slides[indiceActivo];
  slide.style.zIndex = ++contadorZIndex;
  // Reinicia la animación aunque el slide ya la haya jugado antes (ciclo).
  slide.classList.remove('banner__slide--activo');
  void slide.offsetWidth;
  slide.classList.add('banner__slide--activo');

  dots[indiceActivo].classList.add('banner__dot--activo');
  dots[indiceActivo].setAttribute('aria-current', 'true');

  // Cualquier cambio de slide (manual o automático) reinicia la cuenta,
  // para que clickear un dot no se sienta pisado por el autoplay al toque.
  programarSiguiente();
}

function siguiente() {
  irA((indiceActivo + 1) % slides.length);
}

// setTimeout que se reprograma solo, en vez de un setInterval con un flag
// de "pausado": así pausar es directamente cancelar el timer pendiente, y
// reanudar es arrancar uno nuevo de cero — sin ambigüedad de en qué punto
// del intervalo anterior había quedado.
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

  viewport.innerHTML = '';
  dotsContenedor.innerHTML = '';
  indiceActivo = 0;
  contadorZIndex = 1;

  slides = destacados.map((juego, i) => crearSlide(juego, `banner-slide-${i}`));
  dots = destacados.map((_, i) => crearDot(i, `banner-slide-${i}`, i === 0));

  slides.forEach((slide) => viewport.append(slide));
  dots.forEach((dot) => dotsContenedor.append(dot));

  // El primero también entra con el wipe, como "tada" de bienvenida.
  slides[0].style.zIndex = contadorZIndex;
  slides[0].classList.add('banner__slide--activo');

  iniciarAutoplay();
}

obtenerJuegos()
  .then(renderizarBanner)
  .catch(() => renderizarBanner(DESTACADOS_DE_RESPALDO));
