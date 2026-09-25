// carrusel-fila.js — Comportamiento de las filas de juegos (categorías,
// recomendados): arrastrar con mouse para desplazar (el scroll táctil en
// mobile ya funciona nativo, esto es la versión con mouse) y flechas para
// avanzar/retroceder de a una "página" de cards. home.js llama a
// activarCarrusel() por cada fila que arma.

// Nombre distinto al de carousel.js a propósito: los scripts no usan
// type="module" (comparten un mismo scope global), así que declarar la
// misma constante en dos archivos tira un SyntaxError apenas carga el
// segundo — y con eso, ni siquiera se llega a definir activarCarrusel().
const prefiereMovimientoReducidoFilas = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function activarCarrusel(pista, flechaIzquierda, flechaDerecha) {
  let arrastrando = false;
  let inicioX = 0;
  let scrollInicial = 0;
  let seMovio = false;

  pista.addEventListener('pointerdown', (evento) => {
    if (evento.pointerType !== 'mouse') return; // el touch ya scrollea nativo
    // Si el mouse-down arranca sobre un control (ej. "Agregar al carrito"),
    // no iniciar el arrastre: el preventDefault() de más abajo, necesario
    // para el arrastre, cancela también el click posterior sobre ese
    // control (así lo define la spec de Pointer Events), rompiéndolo.
    if (evento.target.closest('button, a')) return;
    arrastrando = true;
    seMovio = false;
    inicioX = evento.clientX;
    scrollInicial = pista.scrollLeft;
    pista.classList.add('carrusel__pista--arrastrando');
    pista.setPointerCapture(evento.pointerId);
    evento.preventDefault(); // evita el "fantasma" de arrastrar una imagen
  });

  pista.addEventListener('pointermove', (evento) => {
    if (!arrastrando) return;
    const delta = evento.clientX - inicioX;
    if (Math.abs(delta) > 5) seMovio = true;
    pista.scrollLeft = scrollInicial - delta;
  });

  function soltar() {
    arrastrando = false;
    pista.classList.remove('carrusel__pista--arrastrando');
  }

  pista.addEventListener('pointerup', soltar);
  pista.addEventListener('pointercancel', soltar);

  // Si hubo arrastre, que no dispare un click en la card de abajo al soltar.
  pista.addEventListener('click', (evento) => {
    if (seMovio) evento.stopPropagation();
  }, true);

  function actualizarFlechas() {
    const finalDeScroll = pista.scrollWidth - pista.clientWidth;
    flechaIzquierda.disabled = pista.scrollLeft <= 0;
    flechaDerecha.disabled = pista.scrollLeft >= finalDeScroll - 1;
  }

  const comportamiento = prefiereMovimientoReducidoFilas ? 'auto' : 'smooth';

  flechaIzquierda.addEventListener('click', () => {
    pista.scrollBy({ left: -pista.clientWidth * 0.9, behavior: comportamiento });
  });

  flechaDerecha.addEventListener('click', () => {
    pista.scrollBy({ left: pista.clientWidth * 0.9, behavior: comportamiento });
  });

  pista.addEventListener('scroll', actualizarFlechas);
  actualizarFlechas();
}
