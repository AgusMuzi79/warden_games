// collision.js — Choques con cajas alineadas a los ejes (AABB)
//
// Cada cosa que choca tiene una "hitbox": un rectángulo más chico que el
// dibujo (así un roce con un borde transparente del PNG no cuenta). Dos
// rectángulos se tocan si se superponen en x Y en y. Funciones puras: no
// leen el DOM, solo números del estado.

/**
 * @typedef {{ x: number, y: number, ancho: number, alto: number }} Caja
 */

/**
 * ¿Se superponen dos cajas?
 * @param {Caja} a
 * @param {Caja} b
 * @returns {boolean}
 */
export function seTocan(a, b) {
  return a.x < b.x + b.ancho
    && a.x + a.ancho > b.x
    && a.y < b.y + b.alto
    && a.y + a.alto > b.y;
}

/**
 * Pasa una hitbox relativa a una entidad (dx, dy) a coordenadas del juego.
 * @param {number} x posición de la entidad
 * @param {number} y
 * @param {{ dx: number, dy: number, ancho: number, alto: number }} hitbox
 * @returns {Caja}
 */
export function cajaEnMundo(x, y, hitbox) {
  return { x: x + hitbox.dx, y: y + hitbox.dy, ancho: hitbox.ancho, alto: hitbox.alto };
}

/**
 * Crea el div que dibuja una hitbox en modo debug (tecla H). Se posiciona
 * una sola vez, relativo a su entidad: después se mueve con ella.
 * @param {{ dx: number, dy: number, ancho: number, alto: number }} hitbox
 * @returns {HTMLDivElement}
 */
export function crearVistaHitbox(hitbox) {
  const elemento = document.createElement('div');
  elemento.className = 'hitbox';
  elemento.style.width = `${hitbox.ancho}px`;
  elemento.style.height = `${hitbox.alto}px`;
  elemento.style.transform = `translate3d(${hitbox.dx}px, ${hitbox.dy}px, 0)`;
  return elemento;
}
