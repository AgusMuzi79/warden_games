// carousel.js — Banner "Destacados" de la Home: carrusel coverflow.
// Depende de api.js (obtenerJuegos) y de #banner (.banner__escena, .banner__dots).
//
// Todas las cards viven superpuestas en el centro de .banner__escena. Cada
// una se posiciona con un transform 3D calculado según su "distancia" a la
// card activa (offset = índice - índice activo): la activa queda de frente
// y sin girar; las de los costados se corren, se achican, giran en Y y se
// mandan para atrás en Z, como si se alejaran hacia el fondo.

const escena = document.querySelector('.banner__escena');
const dotsContenedor = document.querySelector('.banner__dots');
const banner = document.getElementById('banner');

const DURACION_AUTOPLAY_MS = 6000;
const CANTIDAD_DESTACADOS = 5;

// Cuánto se corre cada card según su distancia (offset) a la activa.
const PERSPECTIVE_PX = 1400;  // va en el transform de cada card, no en un ancestro (ver DECISIONES.md)
const PASO_X_PORCENTAJE = 60; // desplazamiento horizontal por posición
const PASO_Z_PX = 160;        // cuánto se manda para atrás en Z por posición
const ROTACION_GRADOS = 35;   // cuánto gira en Y cada card corrida
const ACHIQUE_POR_POSICION = 0.14; // cuánto se achica por cada posición de distancia
const OPACIDAD_MINIMA = 0.35;
const MAX_VISIBLES = 2; // cuántas cards se ven de cada lado antes de esconderse

const prefiereMovimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Si la API falla, destacamos estos juegos reales igual.
const DESTACADOS_DE_RESPALDO = [
  { name: 'The Witcher 3: Wild Hunt', background_image: 'https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg', rating: 4.64 },
  { name: 'Portal 2', background_image: 'https://media.rawg.io/media/games/2ba/2bac0e87cf45e5b508f227d281c9252a.jpg', rating: 4.58 },
  { name: 'Grand Theft Auto V', background_image: 'https://media.rawg.io/media/games/20a/20aa03a10cda45239fe22d035c0ebe64.jpg', rating: 4.47 },
  { name: 'Counter-Strike: Global Offensive', background_image: 'https://media.rawg.io/media/games/736/73619bd336c894d6941d926bfd563946.jpg', rating: 3.57 },
  { name: 'Tomb Raider (2013)', background_image: 'https://media.rawg.io/media/games/021/021c4e21a1824d2526f925eff6324653.jpg', rating: 4.06 },
];

let slides = [];
let dots = [];
let indiceActivo = 0;
let timerAutoplay = null;

function elegirDestacados(juegos) {
  return [...juegos].sort((a, b) => b.rating - a.rating).slice(0, CANTIDAD_DESTACADOS);
}

// Distancia más corta a la card activa, considerando el ciclo (si hay 5
// cards y la activa es la 0, la card 4 está a distancia -1, no -4).
function offsetCircular(index) {
  const total = slides.length;
  let offset = index - indiceActivo;
  if (offset > total / 2) offset -= total;
  if (offset < -total / 2) offset += total;
  return offset;
}

function actualizarPosiciones() {
  slides.forEach((slide, index) => {
    const offset = offsetCircular(index);
    const distancia = Math.abs(offset);
    const direccion = Math.sign(offset);

    slide.classList.toggle('banner__slide--activo', offset === 0);

    if (distancia > MAX_VISIBLES) {
      slide.style.opacity = '0';
      slide.style.zIndex = '0';
      slide.style.pointerEvents = 'none';
      return;
    }

    slide.style.pointerEvents = 'auto';

    const escala = 1 - distancia * ACHIQUE_POR_POSICION;
    const opacidad = distancia === 0 ? 1 : Math.max(OPACIDAD_MINIMA, 1 - distancia * 0.35);

    slide.style.transform = `
      perspective(${PERSPECTIVE_PX}px)
      translateX(${offset * PASO_X_PORCENTAJE}%)
      translateZ(${-distancia * PASO_Z_PX}px)
      rotateY(${-direccion * ROTACION_GRADOS}deg)
      scale(${escala})
    `;
    slide.style.opacity = String(opacidad);
    slide.style.zIndex = String(100 - distancia);
  });
}

function crearSlide(juego, index) {
  const slide = document.createElement('div');
  slide.className = 'banner__slide';
  slide.style.backgroundImage = `url("${juego.background_image}")`;
  slide.addEventListener('click', () => irA(index));

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

  dots[indiceActivo].classList.remove('banner__dot--activo');
  dots[indiceActivo].setAttribute('aria-current', 'false');

  indiceActivo = index;
  actualizarPosiciones();

  dots[indiceActivo].classList.add('banner__dot--activo');
  dots[indiceActivo].setAttribute('aria-current', 'true');

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

  escena.innerHTML = '';
  dotsContenedor.innerHTML = '';
  indiceActivo = 0;

  slides = destacados.map((juego, i) => crearSlide(juego, i));
  dots = destacados.map((_, i) => crearDot(i, i === 0));

  slides.forEach((slide) => escena.append(slide));
  dots.forEach((dot) => dotsContenedor.append(dot));

  actualizarPosiciones();
  iniciarAutoplay();
}

obtenerJuegos()
  .then(renderizarBanner)
  .catch(() => renderizarBanner(DESTACADOS_DE_RESPALDO));
