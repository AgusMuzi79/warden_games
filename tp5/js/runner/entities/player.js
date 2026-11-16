// player.js — La moto: estado, física y dibujo
//
// La moto queda siempre en el mismo x; solo cambia su y. La gravedad la
// tira para abajo y cada impulso le pone una velocidad hacia arriba (como
// el aleteo de Flappy Bird). El estado vive en un objeto común; el DOM solo
// recibe el transform y las clases.

import { JUEGO, JUGADOR } from '../config.js';

/**
 * Crea el estado de la moto, centrada en vertical y quieta.
 * @returns {object}
 */
export function crearJugador() {
  return {
    x: JUGADOR.x,
    y: centroVertical(),
    vy: 0,              // velocidad vertical en px/s (positiva = hacia abajo)
    rotacion: 0,        // grados
    tiempoImpulso: 0,   // segundos que le quedan a .is-boost
    tiempoChoque: 0,    // segundos que le quedan a .is-hit
    tiempoInvulnerable: 0,
  };
}

/**
 * y que deja la moto centrada entre el techo y el suelo.
 * @returns {number}
 */
export function centroVertical() {
  return (JUEGO.techo + JUEGO.suelo - JUGADOR.alto) / 2;
}

/**
 * Impulso hacia arriba. Pisa la velocidad (no la suma): así cada pulsación
 * se siente igual, venga cayendo rápido o no.
 * @param {object} jugador
 */
export function impulsar(jugador) {
  jugador.vy = -JUGADOR.impulso;
  jugador.tiempoImpulso = JUGADOR.duracionImpulso;
}

/**
 * Física de un cuadro: gravedad, tope de caída, posición y rotación.
 * También descuenta los temporizadores de las clases de estado.
 * @param {object} jugador
 * @param {number} dt segundos
 */
export function actualizarJugador(jugador, dt) {
  jugador.vy = Math.min(jugador.vy + JUGADOR.gravedad * dt, JUGADOR.caidaMax);
  jugador.y += jugador.vy * dt;
  // Nariz arriba al subir (vy negativa) y abajo al caer, con límites.
  jugador.rotacion = limitar(jugador.vy * JUGADOR.gradosPorVelocidad, JUGADOR.rotacionMin, JUGADOR.rotacionMax);
  descontarTiempos(jugador, dt);
}

/**
 * Descuenta los temporizadores de estado (se usa también mientras explota,
 * cuando la física ya no corre).
 * @param {object} jugador
 * @param {number} dt
 */
export function descontarTiempos(jugador, dt) {
  jugador.tiempoImpulso = Math.max(0, jugador.tiempoImpulso - dt);
  jugador.tiempoChoque = Math.max(0, jugador.tiempoChoque - dt);
  jugador.tiempoInvulnerable = Math.max(0, jugador.tiempoInvulnerable - dt);
}

/**
 * Caja de colisión en coordenadas del juego. No tiene en cuenta la
 * rotación: la caja es chica justamente para que no haga falta.
 * @param {object} jugador
 * @returns {{x: number, y: number, ancho: number, alto: number}}
 */
export function cajaJugador(jugador) {
  return {
    x: jugador.x + JUGADOR.hitbox.dx,
    y: jugador.y + JUGADOR.hitbox.dy,
    ancho: JUGADOR.hitbox.ancho,
    alto: JUGADOR.hitbox.alto,
  };
}

/**
 * Prepara los elementos de la moto (tamaños fijos, una sola vez).
 * @param {HTMLElement} elemento .player
 * @param {HTMLElement} elementoHitbox .hitbox--player
 */
export function prepararVistaJugador(elemento, elementoHitbox) {
  elemento.style.width = `${JUGADOR.ancho}px`;
  elemento.style.height = `${JUGADOR.alto}px`;
  elementoHitbox.style.width = `${JUGADOR.hitbox.ancho}px`;
  elementoHitbox.style.height = `${JUGADOR.hitbox.alto}px`;
}

/**
 * Escribe el estado en el DOM: solo transform y clases.
 * @param {object} jugador
 * @param {HTMLElement} elemento .player
 * @param {HTMLElement} elementoHitbox .hitbox--player
 */
export function dibujarJugador(jugador, elemento, elementoHitbox) {
  elemento.style.transform = `translate3d(${jugador.x}px, ${jugador.y}px, 0) rotate(${jugador.rotacion}deg)`;
  elemento.classList.toggle('is-boost', jugador.tiempoImpulso > 0);
  elemento.classList.toggle('is-hit', jugador.tiempoChoque > 0);
  elemento.classList.toggle('is-invulnerable', jugador.tiempoInvulnerable > 0);
  const caja = cajaJugador(jugador);
  elementoHitbox.style.transform = `translate3d(${caja.x}px, ${caja.y}px, 0)`;
}

/**
 * Deja un número entre un mínimo y un máximo.
 * @param {number} valor
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function limitar(valor, min, max) {
  return Math.min(max, Math.max(min, valor));
}
