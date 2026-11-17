// runner-pagina.js: la parte "de página web" de runner.html (la galería).
// El juego en sí vive en js/runner/. Acá solo se le pasa a js/galeria.js
// (motor genérico, cargado antes) la lista de capturas de Neon Rider.

// Las 4 capturas (en assets/img/), en el orden en que se vive una partida.
// Son de 1920x1080 (16:9), la proporción de la galería. Si alguna no carga,
// la galería sigue girando igual (galeria.js).
const FOTOS_GALERIA_RUNNER = [
  { src: 'assets/img/inicio.jpg', alt: 'Pantalla de inicio de Neon Rider: elegís el modo Fácil, Normal o Difícil sobre la ciudad de fondo.' },
  { src: 'assets/img/partida-en-juego.jpg', alt: 'Partida en curso: la moto vuela entre un edificio y un cartel colgante, con el puntaje y las vidas arriba.' },
  { src: 'assets/img/victoria.jpg', alt: 'Pantalla de victoria al llegar a la meta, con el puntaje final.' },
  { src: 'assets/img/game-over.jpg', alt: 'Pantalla de Game over con la moto destruida y las opciones para seguir jugando o volver al inicio.' },
];

iniciarGaleria(FOTOS_GALERIA_RUNNER);

// ---------------------------------------------------------------
// Diálogo de ayuda (mismo comportamiento que el del Peg)
// ---------------------------------------------------------------

const botonAyuda = document.getElementById('btn-runner-ayuda');
const dialogoAyuda = document.getElementById('runner-ayuda');
const cuerpoAyuda = document.getElementById('runner-ayuda-cuerpo');
const botonCerrarAyuda = document.getElementById('runner-ayuda-cerrar');
const seccionAyuda = document.querySelector('.ayuda');

/** Copia los desplegables y los atajos de la sección Ayuda al diálogo. */
function llenarAyuda() {
  const partes = seccionAyuda.querySelectorAll('.ayuda__item, .ayuda__atajos');
  cuerpoAyuda.replaceChildren(...Array.from(partes, (parte) => parte.cloneNode(true)));
}

/** Abre el diálogo como modal y pausa la partida (evento que escucha main.js). */
function abrirAyuda() {
  if (dialogoAyuda.open) return;
  llenarAyuda();
  dialogoAyuda.showModal();
  document.dispatchEvent(new CustomEvent('runner:pausar'));
}

botonAyuda.addEventListener('click', abrirAyuda);
botonCerrarAyuda.addEventListener('click', () => dialogoAyuda.close());

// F1 abre la ayuda; preventDefault evita la ayuda propia del navegador.
document.addEventListener('keydown', (evento) => {
  if (evento.key !== 'F1') return;
  evento.preventDefault();
  abrirAyuda();
});

// Un click en el fondo oscuro tiene al propio <dialog> como target.
dialogoAyuda.addEventListener('click', (evento) => {
  if (evento.target === dialogoAyuda) dialogoAyuda.close();
});

// Al cerrarse (X, fondo o Esc) el foco vuelve al botón "?".
dialogoAyuda.addEventListener('close', () => botonAyuda.focus());
