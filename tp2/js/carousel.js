// carousel.js: banner "Destacados" de la Home, un carrusel tipo coverflow.
//
// Depende de:
//   - api.js: obtenerJuegos().
//   - carrito.js: crearBadge() (etiqueta Gratis, precio o Nuevo).
//   - En el HTML: #banner, .banner__escena, .banner__dots y el overlay
//     #loading (se observa para arrancar el autoplay).
// No expone funciones globales. Ojo con los nombres de las constantes de nivel
// superior: al no haber módulos, no pueden repetirse en otro script.
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
// Con 5 destacados, la distancia máxima posible es 2. Ahí es donde el lado
// "más corto" puede cambiar de dirección en un solo paso (ver DECISIONES.md).
// Si esa distancia se ve, el cambio de lado se nota como un salto brusco.
// Con MAX_VISIBLES en 1 esa distancia queda siempre oculta y el salto no se ve.
const MAX_VISIBLES = 1;

const prefiereMovimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Solo con un puntero que puede hacer hover (mouse, trackpad) existe la pausa
// por hover. En touch no hay hover, así que el autoplay no arranca, igual que
// con prefers-reduced-motion. Sin esto, el banner cambiaría solo cada 6
// segundos sin forma de pausarlo (WCAG 2.2 SC 2.2.2). En touch se navega con
// los dots o tocando las cards de los costados (ver DECISIONES.md, "Autoplay
// que se pausa con hover o foco, sin botón de pausa").
const puedePausarConHover = window.matchMedia('(hover: hover)').matches;

// Nuestro propio juego: no viene de la API (esa trae juegos de terceros
// para el catálogo), así que va hardcodeado y siempre primero, sin pelear
// por rating contra el resto.
const NEON_CIRCUIT = {
  name: 'Neon Circuit',
  background_image: 'assets/img/portada-tronpeg-1616x1320.png',
};

// Si la API falla, destacamos estos juegos reales igual.
const DESTACADOS_DE_RESPALDO = [
  { id: 101, name: 'The Witcher 3: Wild Hunt', background_image: 'https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg', rating: 4.64 },
  { id: 102, name: 'Portal 2', background_image: 'https://media.rawg.io/media/games/2ba/2bac0e87cf45e5b508f227d281c9252a.jpg', rating: 4.58 },
  { id: 103, name: 'Grand Theft Auto V', background_image: 'https://media.rawg.io/media/games/20a/20aa03a10cda45239fe22d035c0ebe64.jpg', rating: 4.47 },
  { id: 104, name: 'Counter-Strike: Global Offensive', background_image: 'https://media.rawg.io/media/games/736/73619bd336c894d6941d926bfd563946.jpg', rating: 3.57 },
  { id: 105, name: 'Tomb Raider (2013)', background_image: 'https://media.rawg.io/media/games/021/021c4e21a1824d2526f925eff6324653.jpg', rating: 4.06 },
];

// Estado del carrusel. slides y dots van en paralelo: el índice i de uno
// corresponde al i del otro.
let slides = [];
let dots = [];
let indiceActivo = 0;
let timerAutoplay = null;

// Neon Circuit siempre primero (así arranca como card activa) y después los
// mejor puntuados de la API.
function elegirDestacados(juegos) {
  const otros = [...juegos]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, CANTIDAD_DESTACADOS - 1);
  return [NEON_CIRCUIT, ...otros];
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

// Recalcula el transform de todas las cards según el índice activo. Las que
// quedan a más de MAX_VISIBLES de distancia se ocultan y no reciben clicks.
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
    slide.style.transform = `
      perspective(${PERSPECTIVE_PX}px)
      translateX(${offset * PASO_X_PORCENTAJE}%)
      translateZ(${-distancia * PASO_Z_PX}px)
      rotateY(${-direccion * ROTACION_GRADOS}deg)
      scale(${escala})
    `;
    slide.style.opacity = '1';
    slide.style.zIndex = String(100 - distancia);
  });
}

// Arma una card del banner: imagen de fondo, etiquetas arriba a la izquierda,
// nombre abajo y un link a pantalla completa (a juego.html o a la ficha).
function crearSlide(juego, index) {
  const slide = document.createElement('div');
  slide.className = 'banner__slide';
  slide.style.backgroundImage = `url("${juego.background_image}")`;
  slide.addEventListener('click', () => irA(index));

  const etiqueta = document.createElement('span');
  etiqueta.className = 'banner__etiqueta';
  etiqueta.textContent = 'Destacado';

  const etiquetas = document.createElement('div');
  etiquetas.className = 'banner__etiquetas';
  etiquetas.append(etiqueta);

  // Neon Circuit no viene de la API: no tiene id real para esDePago() y
  // esNuevo() ni puede estar en "comprados", así que no lleva badge de
  // Gratis, precio o Nuevo. Ya tiene su propia acción ("Jugar").
  if (juego !== NEON_CIRCUIT) {
    const badge = crearBadge(juego);
    if (badge) etiquetas.append(badge);
  }

  const nombre = document.createElement('p');
  nombre.className = 'banner__nombre';
  nombre.textContent = juego.name;

  slide.append(etiquetas, nombre);

  // Es nuestro propio juego: además de poder saltar a esta card como al
  // resto de los destacados, tiene una acción real (ir a jugar). Solo se ve y
  // recibe foco cuando la card está activa (ver home.css).
  if (juego === NEON_CIRCUIT) {
    const jugar = document.createElement('a');
    jugar.className = 'banner__jugar';
    jugar.href = 'juego.html';
    jugar.setAttribute('aria-label', 'Jugar a Neon Circuit');
    // Evita que el click también dispare el irA(index) del slide: no
    // cambiaría nada (ya está activa), pero no hace falta que compita.
    jugar.addEventListener('click', (evento) => evento.stopPropagation());

    const icono = document.createElement('i');
    icono.className = 'ph ph-play';
    icono.setAttribute('aria-hidden', 'true');

    jugar.append(icono);
    slide.append(jugar);
  }

  // Cualquier juego que no sea Neon Circuit: clickear la card activa lleva a
  // su ficha (producto.html). Reemplaza al agregar-al-carrito directo que
  // tenía este banner antes (ver DECISIONES.md, "Ficha de producto", etapa 3).
  // Neon Circuit tiene su propio link ("Jugar", arriba).
  if (juego !== NEON_CIRCUIT) {
    const ver = document.createElement('a');
    ver.className = 'banner__ver';
    ver.href = `producto.html?id=${juego.id}`;
    ver.setAttribute('aria-label', `Ver ${juego.name}`);
    // Evita que el click también dispare el irA(index) del slide: no
    // cambiaría nada (ya está activa), pero no hace falta que compita.
    ver.addEventListener('click', (evento) => evento.stopPropagation());
    slide.append(ver);
  }

  return slide;
}

// Un dot por card. aria-current marca cuál es la activa para el lector de
// pantalla.
function crearDot(index, esActivo) {
  const dot = document.createElement('button');
  dot.type = 'button';
  dot.className = 'banner__dot' + (esActivo ? ' banner__dot--activo' : '');
  dot.setAttribute('aria-label', `Ir al destacado ${index + 1}`);
  dot.setAttribute('aria-current', String(esActivo));
  dot.addEventListener('click', () => irA(index));
  return dot;
}

// Cambia la card activa: mueve las clases y aria-current de los dots y
// reposiciona las cards. Si ya es la activa no hace nada.
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
  if (!puedePausarConHover || prefiereMovimientoReducido || slides.length < 2) return;

  timerAutoplay = setTimeout(siguiente, DURACION_AUTOPLAY_MS);
}

function pausarAutoplay() {
  clearTimeout(timerAutoplay);
}

// Arma el primer timer y engancha la pausa. Los listeners se agregan una sola
// vez (esta función se llama una vez por carga de página).
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

// El autoplay arranca recién cuando termina el loading simulado de la Home.
// Si arrancara apenas responde la API (que tarda menos de 5 segundos), el
// primer destacado (Neon Circuit, nuestro juego) pasaría detrás del overlay y
// el usuario lo vería menos de un segundo. No se toca loading.js: acá solo se
// observa el atributo hidden del overlay (ver DECISIONES.md, "Neon Circuit
// accesible en touch y visible después del loading (T04)").
function iniciarAutoplayDespuesDeLaCarga() {
  const overlayCarga = document.getElementById('loading');

  if (!overlayCarga || overlayCarga.hidden) {
    iniciarAutoplay();
    return;
  }

  const observador = new MutationObserver(() => {
    if (overlayCarga.hidden) {
      observador.disconnect();
      iniciarAutoplay();
    }
  });
  observador.observe(overlayCarga, { attributes: true, attributeFilter: ['hidden'] });
}

// Punto de entrada: crea cards y dots, las posiciona y arranca el autoplay.
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
  iniciarAutoplayDespuesDeLaCarga();
}

// Si la API falla, se usan los destacados de respaldo.
obtenerJuegos()
  .then(renderizarBanner)
  .catch(() => renderizarBanner(DESTACADOS_DE_RESPALDO));
