// main.js — Punto de entrada del Peg: crea el modelo y la vista y los conecta
//
// Qué hace: es el único script que carga juego.html. Crea el modelo
// (PegModel), espera las fuentes, lee los colores de variables.css, arma las
// imágenes (fondo, placa, fichas), crea la vista (PegView) y la conecta con
// el modelo. También prepara lo de la página que no es el juego (galería y
// ayuda, en pagina.js).
// El juego arranca en la selección de bando: el reloj recién corre cuando se
// elige uno.
//
// Después de armar todo, el controlador (PegController) se encarga del loop
// de dibujo y de reaccionar al mouse y al teclado.

import { obtenerColores, obtenerFuentes } from './config.js';
import { PegModel } from './models/PegModel.js';
import { PegView } from './views/PegView.js';
import { PegController } from './controllers/PegController.js';
import { prepararRecursos } from './views/dibujo.js';
import { cargarFuentes } from './views/hud.js';
import { iniciarPagina } from './pagina.js';

const canvas = document.getElementById('peg-canvas');
const estado = document.getElementById('peg-estado');
const botonReiniciar = document.getElementById('btn-peg-reiniciar');
const botonHackear = document.getElementById('btn-peg-hackear');

// El modelo no depende de ninguna imagen, así que se crea al instante. La
// ayuda puede abrirse antes de que termine de cargar el resto: pausar el
// modelo ya funciona y la pausa se respeta cuando se elija bando.
const modelo = new PegModel();
let controlador = null;  // se crea cuando terminan de cargar las imágenes
iniciarPagina({
  pausar: () => (controlador ? controlador.pausar() : modelo.pausar()),
  reanudar: () => (controlador ? controlador.reanudar() : modelo.reanudar()),
});

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
 * Prepara los recursos, crea la vista y el controlador, y arranca el juego.
 */
async function arrancar() {
  const fuentes = obtenerFuentes();
  await Promise.all([cargarFuentes(fuentes), cargarFuenteTitulo(fuentes)]);
  const colores = obtenerColores();
  const recursos = await prepararRecursos(colores);
  const vista = new PegView(canvas, recursos, colores, fuentes, estado);

  controlador = new PegController(modelo, vista, botonReiniciar, botonHackear);
  controlador.iniciar();
}

arrancar().catch((error) => {
  // Sin imágenes no hay juego: el aviso se hace visible (sale de .sr-only).
  console.error(error);
  estado.classList.remove('sr-only');
  estado.classList.add('peg__error');
  estado.textContent = 'No se pudo cargar el tablero. Recargá la página para intentar de nuevo.';
});
