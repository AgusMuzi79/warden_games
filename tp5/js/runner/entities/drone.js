// drone.js — Drone enemigo
//
// Aparece entre dos pares y flota con un vaivén suave (una onda seno sobre
// su altura base). No hace daño: si la moto lo agarra, explota
// (.is-exploding) y ralentiza el mundo, lo que ayuda a pasar; eso lo
// decide game.js. Es chico para que cueste agarrarlo. Acá solo vive su
// estado y su dibujo.

import { DRONE } from '../config.js';
import { cajaEnMundo, crearVistaHitbox } from '../collision.js';

/**
 * Crea un drone.
 * @param {number} x
 * @param {number} yBase altura alrededor de la que flota
 * @returns {object}
 */
export function crearDrone(x, yBase) {
  const elemento = document.createElement('div');
  elemento.className = 'drone';
  elemento.style.width = `${DRONE.ancho}px`;
  elemento.style.height = `${DRONE.alto}px`;
  elemento.append(crearVistaHitbox(DRONE.hitbox));

  return {
    x,
    y: yBase,
    yBase,
    // Cada drone arranca en otro punto de la onda: no suben y bajan todos juntos.
    fase: Math.random() * Math.PI * 2,
    explotando: false,
    tiempoExplosion: 0,
    elemento,
  };
}

/**
 * Mueve el drone con el mundo y le aplica el vaivén.
 * @param {object} drone
 * @param {number} velocidad px/s del mundo
 * @param {number} dt
 */
export function actualizarDrone(drone, velocidad, dt) {
  drone.x -= velocidad * dt;
  drone.fase += 2 * Math.PI * DRONE.frecuencia * dt;
  drone.y = drone.yBase + Math.sin(drone.fase) * DRONE.amplitud;
  if (drone.explotando) drone.tiempoExplosion -= dt;
}

/**
 * Lo hace explotar: deja de chocar y se borra al terminar la animación.
 * @param {object} drone
 */
export function explotarDrone(drone) {
  drone.explotando = true;
  drone.tiempoExplosion = DRONE.duracionExplosion;
}

/**
 * Caja de colisión en coordenadas del juego.
 * @param {object} drone
 * @returns {{x: number, y: number, ancho: number, alto: number}}
 */
export function cajaDrone(drone) {
  return cajaEnMundo(drone.x, drone.y, DRONE.hitbox);
}

/**
 * Escribe posición y estado.
 * @param {object} drone
 */
export function dibujarDrone(drone) {
  drone.elemento.style.transform = `translate3d(${Math.round(drone.x)}px, ${Math.round(drone.y)}px, 0)`;
  drone.elemento.classList.toggle('is-exploding', drone.explotando);
}

/**
 * ¿Hay que borrarlo? (terminó de explotar o salió por la izquierda)
 * @param {object} drone
 * @returns {boolean}
 */
export function droneTerminado(drone) {
  return (drone.explotando && drone.tiempoExplosion <= 0) || drone.x + DRONE.ancho < 0;
}
