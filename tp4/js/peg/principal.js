// principal.js — Punto de entrada del juego: prepara todo y arranca
//
// Qué hace: espera las fuentes, lee los colores de variables.css, arma las
// imágenes (fondo, placa, fichas), ajusta la resolución del canvas a la
// pantalla, crea el Juego y le conecta los eventos del canvas y del botón
// Reiniciar. El juego arranca en la selección de bando: el reloj recién
// corre cuando se elige uno.
// Lo importa pagina.js (así se carga una sola vez) y usa pausarJuego() y
// reanudarJuego() al abrir y cerrar la ayuda.

import { ANCHO, ALTO, obtenerDpr, obtenerColores, obtenerFuentes } from './config.js';
import { prepararRecursos } from './dibujo.js';
import { cargarFuentes } from './hud.js';
import { Juego } from './juego.js';

const canvas = document.getElementById('peg-canvas');
const estado = document.getElementById('peg-estado');
const botonReiniciar = document.getElementById('btn-peg-reiniciar');

let juego = null;
let pausaPedida = false;  // la ayuda se abrió antes de que el juego estuviera listo

/**
 * Escribe un aviso en la región en vivo (role="status"). Se vacía primero
 * y se escribe un instante después: así el lector de pantalla repite un
 * aviso aunque sea igual al anterior.
 * @param {string} texto
 */
function avisar(texto) {
  estado.textContent = '';
  setTimeout(() => { estado.textContent = texto; }, 50);
}

/**
 * Espera la fuente de los títulos (Orbitron), con el mismo tope de 1,5 s
 * que cargarFuentes() para no trabar el juego si la red está lenta.
 * @param {{titulo: string}} fuentes
 * @returns {Promise<void>}
 */
async function cargarFuenteTitulo(fuentes) {
  const carga = document.fonts.load('700 52px ' + fuentes.titulo).catch(() => {});
  await Promise.race([carga, new Promise((listo) => setTimeout(listo, 1500))]);
}

/**
 * Pausa la partida (la llama pagina.js al abrir la ayuda).
 */
export function pausarJuego() {
  pausaPedida = true;
  if (juego) juego.pausar();
}

/**
 * Reanuda la partida (la llama pagina.js al cerrar la ayuda).
 */
export function reanudarJuego() {
  pausaPedida = false;
  if (juego) juego.reanudar();
}

/**
 * Prepara los recursos, crea el Juego y le conecta los eventos.
 */
async function arrancar() {
  const fuentes = obtenerFuentes();
  await Promise.all([cargarFuentes(fuentes), cargarFuenteTitulo(fuentes)]);
  const colores = obtenerColores();
  const recursos = await prepararRecursos(colores);

  // Solo los atributos: el tamaño en pantalla lo decide el CSS.
  const dpr = obtenerDpr();
  canvas.width = ANCHO * dpr;
  canvas.height = ALTO * dpr;

  juego = new Juego(canvas, recursos, colores, fuentes, { avisar });
  canvas.addEventListener('pointerdown', (evento) => juego.alPresionar(evento));
  canvas.addEventListener('pointermove', (evento) => juego.alMover(evento));
  canvas.addEventListener('pointerup', () => juego.alSoltar());
  canvas.addEventListener('pointercancel', () => juego.alCancelar());
  canvas.addEventListener('keydown', (evento) => juego.alTeclear(evento));
  canvas.addEventListener('focus', () => juego.alEnfocar(true));
  canvas.addEventListener('blur', () => juego.alEnfocar(false));
  botonReiniciar.addEventListener('click', () => juego.reiniciar());

  juego.iniciar();
  if (pausaPedida) juego.pausar();
}

arrancar().catch((error) => {
  // Sin imágenes no hay juego: el aviso se hace visible (sale de .sr-only).
  console.error(error);
  estado.classList.remove('sr-only');
  estado.classList.add('peg__error');
  estado.textContent = 'No se pudo cargar el tablero. Recargá la página para intentar de nuevo.';
});
