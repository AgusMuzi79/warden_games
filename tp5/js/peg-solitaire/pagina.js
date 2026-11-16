// pagina.js — Lo de la página del Peg (juego.html) que no es el juego
//
// Qué hace:
//   1. Le pasa las 4 capturas del Peg a la galería animada.
//   2. Abre y cierra el diálogo de ayuda (botón "?" o tecla F1), y pausa
//      la partida mientras está abierto.
// El juego en sí (modelo, vista y controlador) vive en las carpetas models/,
// views/ y controllers/; el punto de entrada es main.js, que es el único
// script que carga juego.html y llama a iniciarPagina() de acá.
//
// Es un módulo (type="module" en el HTML). Los módulos se ejecutan diferidos,
// como un script con defer, y en el orden en que aparecen en el documento.
// Como js/galeria.js (script clásico con defer) está antes en el HTML, cuando
// este archivo corre ya existe iniciarGaleria(), que es global porque
// galeria.js la declara con function fuera de todo bloque.
// Un módulo trae 'use strict' de forma implícita y no expone nada global.
//
// No importa nada del juego: para pausar y reanudar la partida mientras la
// ayuda está abierta usa las dos funciones que le pasa main.js.

// ---------------------------------------------------------------
// Galería
// ---------------------------------------------------------------

// Las 4 capturas del Peg (en assets/img/), en el orden en que se vive una
// partida. Si alguna no carga, la galería sigue girando igual (galeria.js).
const FOTOS_GALERIA_PEG = [
  { src: 'assets/img/peg-seleccion.jpg', alt: 'Pantalla para elegir bando: Usuarios, con nodos cyan, o Programas de Clu, con nodos naranja.' },
  { src: 'assets/img/peg-partida.jpg', alt: 'Partida en curso, con un nodo levantado y los fantasmas de destino en los huecos donde se puede soltar.' },
  { src: 'assets/img/peg-victoria.jpg', alt: 'Pantalla de victoria "Sistema restaurado", con un único nodo activo en el circuito.' },
  { src: 'assets/img/peg-derrota.jpg', alt: 'Pantalla de derrota "Sistema corrupto", sin saltos válidos o sin tiempo.' },
];

/**
 * Prepara la página: arma la galería y guarda cómo pausar y reanudar la
 * partida para cuando se abra y se cierre la ayuda.
 * @param {{pausar: () => void, reanudar: () => void}} partida
 */
export function iniciarPagina(partida) {
  acciones = partida;
  iniciarGaleria(FOTOS_GALERIA_PEG);
}

// Qué hacer con la partida al abrir y cerrar la ayuda. Hasta que main.js
// llame a iniciarPagina() no hace nada.
let acciones = { pausar() {}, reanudar() {} };

// ---------------------------------------------------------------
// Diálogo de ayuda
// ---------------------------------------------------------------

const botonAyuda = document.getElementById('btn-peg-ayuda');
const dialogoAyuda = document.getElementById('peg-ayuda');
const cuerpoAyuda = document.getElementById('peg-ayuda-cuerpo');
const botonCerrarAyuda = document.getElementById('peg-ayuda-cerrar');
const seccionAyuda = document.querySelector('.ayuda');

/**
 * Llena el cuerpo del diálogo con una copia de la Ayuda de la página.
 * Copia (cloneNode(true) = el elemento con todo lo que tiene adentro) cada
 * desplegable <details> y la lista de atajos. Así el texto de las
 * instrucciones se escribe una sola vez, en el HTML de la sección Ayuda.
 * replaceChildren() borra lo de antes y pone lo nuevo, para que abrir el
 * diálogo varias veces no duplique el contenido.
 */
function llenarAyuda() {
  const partes = seccionAyuda.querySelectorAll('.ayuda__item, .ayuda__atajos');
  const copias = Array.from(partes, (parte) => parte.cloneNode(true));
  cuerpoAyuda.replaceChildren(...copias);
}

/**
 * Abre el diálogo de ayuda como modal, si no está abierto ya.
 * showModal() hace que el navegador atrape el foco adentro, oscurezca el
 * fondo (::backdrop) y lo cierre con Esc, sin código extra.
 */
function abrirAyuda() {
  if (dialogoAyuda.open) return;
  llenarAyuda();
  dialogoAyuda.showModal();
  // Mientras se lee la ayuda, el reloj no corre. Con el modal abierto el
  // resto de la página queda inerte: el canvas no recibe foco ni teclas,
  // así que las teclas del juego no hacen nada hasta cerrarla.
  acciones.pausar();
}

/**
 * Cierra el diálogo de ayuda. Se usa desde el botón "X" y desde el click
 * en el fondo oscuro; Esc lo cierra el navegador solo.
 */
function cerrarAyuda() {
  dialogoAyuda.close();
}

/**
 * Atajo de teclado: F1 abre la ayuda.
 * preventDefault() evita que el navegador abra su propia ayuda (en Chrome y
 * Edge, F1 abre una pestaña de soporte).
 * @param {KeyboardEvent} evento - la tecla apretada.
 */
function manejarTeclado(evento) {
  if (evento.key !== 'F1') return;
  evento.preventDefault();
  abrirAyuda();
}

botonAyuda.addEventListener('click', abrirAyuda);
botonCerrarAyuda.addEventListener('click', cerrarAyuda);
document.addEventListener('keydown', manejarTeclado);

// Con showModal(), un click en el fondo oscuro llega con el propio <dialog>
// como target (el fondo no es otro elemento). Un click adentro de la caja
// tiene como target algún hijo, así que no lo cierra. Mismo criterio que el
// modal de pago (compras.js).
dialogoAyuda.addEventListener('click', (evento) => {
  if (evento.target === dialogoAyuda) cerrarAyuda();
});

// 'close' salta siempre que el diálogo se cierra (X, fondo o Esc). El foco
// vuelve al botón "?", también si se abrió con F1 desde otro lugar: así
// quien usa teclado sabe dónde quedó. También se reanuda la partida.
dialogoAyuda.addEventListener('close', () => {
  acciones.reanudar();
  botonAyuda.focus();
});
