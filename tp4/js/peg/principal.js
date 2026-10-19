// principal.js — Punto de entrada del juego: prepara todo y arranca
//
// Qué hace: espera las fuentes, lee los colores de variables.css, arma las
// imágenes (fondo, placa, fichas), ajusta la resolución del canvas a la
// pantalla, crea el Juego (estado y dibujo, juego.js) y la Entrada (mouse y
// teclado, entrada.js), que engancha los eventos del canvas, y conecta el
// botón Reiniciar. El juego arranca en la selección de bando: el reloj
// recién corre cuando se elige uno.
// Lo importa pagina.js (así se carga una sola vez) y usa pausarJuego() y
// reanudarJuego() al abrir y cerrar la ayuda.

import { ANCHO, ALTO, obtenerDpr, obtenerColores, obtenerFuentes } from './config.js';
import { prepararRecursos } from './dibujo.js';
import { cargarFuentes } from './hud.js';
import { Juego } from './juego.js';
import { Entrada } from './entrada.js';

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
  // La Entrada traduce clicks y teclas del canvas a acciones del juego.
  new Entrada(juego).conectar();
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
