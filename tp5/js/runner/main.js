// main.js — Punto de entrada de Neon Rider
//
// Es el único script del juego que carga runner.html (type="module"):
// importa el resto. Pasa los tamaños de config.js al CSS, precarga las
// imágenes, muestra las pantallas (carga, inicio, pausa, victoria, derrota)
// y conecta la entrada con el juego. La lógica de cada cuadro está en
// game.js.

import { JUEGO, IMAGENES, MODOS } from './config.js';
import { precargar } from './preload.js';
import { conectarEntrada } from './input.js';
import { crearJuego } from './game.js';

const areaJuego = document.getElementById('game');
const estadoLector = document.getElementById('game-status');
const porcentajeCarga = document.getElementById('loading-percent');

const pantallas = {
  carga: document.getElementById('screen-loading'),
  inicio: document.getElementById('screen-start'),
  pausa: document.getElementById('screen-pause'),
  victoria: document.getElementById('screen-win'),
  derrota: document.getElementById('screen-lose'),
};

// Los tamaños del área de juego se escriben una sola vez como variables
// CSS: así runner.css y la lógica usan los mismos números de config.js.
areaJuego.style.setProperty('--ancho', `${JUEGO.ancho}px`);
areaJuego.style.setProperty('--alto', `${JUEGO.alto}px`);
areaJuego.style.setProperty('--suelo', `${JUEGO.suelo}px`);
areaJuego.style.setProperty('--alto-suelo', `${JUEGO.alto - JUEGO.suelo}px`);

const juego = crearJuego({
  juego: areaJuego,
  jugador: areaJuego.querySelector('.player'),
  hitboxJugador: areaJuego.querySelector('.hitbox--player'),
}, mostrarFin);

/**
 * Muestra una pantalla y oculta las demás. null las oculta todas.
 * El foco pasa al primer botón, para seguir con el teclado.
 * @param {string|null} nombre clave de `pantallas`
 */
function mostrarPantalla(nombre) {
  for (const [clave, pantalla] of Object.entries(pantallas)) {
    if (pantalla) pantalla.hidden = clave !== nombre;
  }
  const boton = nombre ? pantallas[nombre]?.querySelector('button') : null;
  if (boton) boton.focus();
}

/**
 * Arranca una partida y le pasa el foco al área de juego.
 * @param {string} claveModo
 */
function jugar(claveModo) {
  mostrarPantalla(null);
  juego.iniciarPartida(claveModo);
  areaJuego.focus();
  anunciar(`Partida en modo ${MODOS[claveModo].nombre}. Espacio para subir.`);
}

/**
 * Pantalla de victoria o derrota (la llama game.js al terminar).
 * @param {'victoria' | 'derrota'} resultado
 * @param {number} puntaje
 */
function mostrarFin(resultado, puntaje) {
  const pantalla = pantallas[resultado];
  pantalla.querySelector('.screen__score').textContent = puntaje;
  mostrarPantalla(resultado);
  anunciar(resultado === 'victoria' ? `Ganaste con ${puntaje} puntos.` : `Perdiste con ${puntaje} puntos.`);
}

/** Pausa y muestra la pantalla de pausa (si había partida). */
function pausar() {
  if (juego.pausar()) mostrarPantalla('pausa');
}

/** Sale de la pausa. */
function reanudar() {
  mostrarPantalla(null);
  juego.reanudar();
  areaJuego.focus();
}

/** Vuelve al selector de modo. */
function irAlMenu() {
  juego.abandonar();
  mostrarPantalla('inicio');
}

/**
 * Texto para lectores de pantalla (el juego en sí es visual).
 * @param {string} texto
 */
function anunciar(texto) {
  estadoLector.textContent = texto;
}

// Botones de las pantallas: data-mode elige el modo, data-action el resto.
areaJuego.addEventListener('click', (evento) => {
  const boton = evento.target.closest('button');
  if (!boton) return;
  if (boton.dataset.mode) jugar(boton.dataset.mode);
  else if (boton.dataset.action === 'resume') reanudar();
  else if (boton.dataset.action === 'retry') jugar(juego.modo);
  else if (boton.dataset.action === 'menu') irAlMenu();
});

conectarEntrada(areaJuego, {
  impulsar: () => juego.impulsar(),
  alternarPausa: () => {
    if (juego.fase === 'pausa') reanudar();
    else pausar();
  },
  alternarDebug: () => juego.alternarDebug(),
  pausar,
});

// Precarga: hasta que no llegan todas las imágenes no se puede elegir modo.
mostrarPantalla('carga');
precargar(IMAGENES, (porcentaje) => {
  porcentajeCarga.textContent = porcentaje;
}).then((fallidas) => {
  if (fallidas.length) console.warn('No se pudieron cargar:', fallidas);
  mostrarPantalla('inicio');
});
