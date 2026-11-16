// carrusel-fila.js: comportamiento de las filas de juegos (categorías,
// Recomendados, Mis juegos). Suma arrastre con mouse (el scroll táctil ya
// funciona nativo) y flechas que avanzan o retroceden una "página" de cards.
//
// Expone activarCarrusel(pista, flechaIzquierda, flechaDerecha), que llama
// home.js por cada fila que arma. La pista es .carrusel__pista, con
// overflow-x y scroll-snap en home.css.

// Nombre distinto al de carousel.js a propósito: los scripts no usan
// type="module" (comparten un mismo scope global), así que declarar la
// misma constante en dos archivos tira un SyntaxError apenas carga el
// segundo — y con eso, ni siquiera se llega a definir activarCarrusel().
const prefiereMovimientoReducidoFilas = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function activarCarrusel(pista, flechaIzquierda, flechaDerecha) {
  // Estado del arrastre: seMovio distingue un arrastre de un click simple.
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
    // Con menos de 5px se lo trata como click, no como arrastre.
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
  // Va en fase de captura (el `true`) para cortar el click antes de que llegue
  // al link de la card.
  pista.addEventListener('click', (evento) => {
    if (seMovio) evento.stopPropagation();
  }, true);

  // Deshabilita cada flecha al llegar a su punta. El -1 absorbe los
  // decimales de scrollLeft en pantallas con zoom.
  function actualizarFlechas() {
    const finalDeScroll = pista.scrollWidth - pista.clientWidth;
    flechaIzquierda.disabled = pista.scrollLeft <= 0;
    flechaDerecha.disabled = pista.scrollLeft >= finalDeScroll - 1;
  }

  // Cada click mueve el 90% del ancho visible, para que asome un poco de la
  // card anterior. El scroll animado es JS, así que el @media de CSS no lo
  // alcanza: hay que chequear prefers-reduced-motion acá.
  const comportamiento = prefiereMovimientoReducidoFilas ? 'auto' : 'smooth';

  flechaIzquierda.addEventListener('click', () => {
    pista.scrollBy({ left: -pista.clientWidth * 0.9, behavior: comportamiento });
  });

  flechaDerecha.addEventListener('click', () => {
    pista.scrollBy({ left: pista.clientWidth * 0.9, behavior: comportamiento });
  });

  // buscador.js dispara un evento "scroll" a mano cuando filtra, para que las
  // flechas se actualicen con el nuevo ancho de la fila.
  pista.addEventListener('scroll', actualizarFlechas);
  actualizarFlechas();
}
