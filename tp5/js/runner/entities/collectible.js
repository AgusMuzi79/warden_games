// collectible.js — Chip coleccionable y el "+3" flotante
//
// Aparece en el hueco de algunos pares. Al agarrarlo suma puntos (lo decide
// game.js), se marca .is-collected para la animación de recogida y aparece
// un texto "+3" que sube y se desvanece (lo anima el CSS).

import { COLECCIONABLE } from '../config.js';
import { cajaEnMundo, crearVistaHitbox } from '../collision.js';

/**
 * Crea un coleccionable.
 * @param {number} x
 * @param {number} y
 * @returns {object}
 */
export function crearColeccionable(x, y) {
  const elemento = document.createElement('div');
  elemento.className = 'collectible';
  elemento.style.width = `${COLECCIONABLE.lado}px`;
  elemento.style.height = `${COLECCIONABLE.lado}px`;

  // El dibujo va en un hijo: el CSS lo anima (giro o spritesheet) sin
  // pisar el translate3d que el JS escribe en .collectible.
  const sprite = document.createElement('div');
  sprite.className = 'collectible__sprite';
  elemento.append(sprite, crearVistaHitbox(COLECCIONABLE.hitbox));

  return { x, y, recogido: false, tiempoRecogida: 0, elemento };
}

/**
 * Mueve el coleccionable con el mundo.
 * @param {object} coleccionable
 * @param {number} velocidad
 * @param {number} dt
 */
export function actualizarColeccionable(coleccionable, velocidad, dt) {
  coleccionable.x -= velocidad * dt;
  if (coleccionable.recogido) coleccionable.tiempoRecogida -= dt;
}

/**
 * Lo marca como recogido: deja de chocar y se borra al terminar la animación.
 * @param {object} coleccionable
 */
export function recoger(coleccionable) {
  coleccionable.recogido = true;
  coleccionable.tiempoRecogida = COLECCIONABLE.duracionRecogida;
}

/**
 * Caja de colisión en coordenadas del juego.
 * @param {object} coleccionable
 * @returns {{x: number, y: number, ancho: number, alto: number}}
 */
export function cajaColeccionable(coleccionable) {
  return cajaEnMundo(coleccionable.x, coleccionable.y, COLECCIONABLE.hitbox);
}

/**
 * Escribe posición y estado.
 * @param {object} coleccionable
 */
export function dibujarColeccionable(coleccionable) {
  coleccionable.elemento.style.transform = `translate3d(${Math.round(coleccionable.x)}px, ${Math.round(coleccionable.y)}px, 0)`;
  coleccionable.elemento.classList.toggle('is-collected', coleccionable.recogido);
}

/**
 * ¿Hay que borrarlo? (terminó la recogida o salió por la izquierda)
 * @param {object} coleccionable
 * @returns {boolean}
 */
export function coleccionableTerminado(coleccionable) {
  return (coleccionable.recogido && coleccionable.tiempoRecogida <= 0)
    || coleccionable.x + COLECCIONABLE.lado < 0;
}

/**
 * Crea el texto flotante ("+3") donde se agarró el coleccionable. Queda
 * quieto en pantalla; el CSS lo hace subir y desvanecerse.
 * @param {number} x
 * @param {number} y
 * @param {string} texto
 * @returns {{ tiempo: number, elemento: HTMLDivElement }}
 */
export function crearTextoFlotante(x, y, texto) {
  const elemento = document.createElement('div');
  elemento.className = 'float-text';
  elemento.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
  const span = document.createElement('span');
  span.textContent = texto;
  elemento.append(span);
  return { tiempo: COLECCIONABLE.duracionTexto, elemento };
}
