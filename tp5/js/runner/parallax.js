// parallax.js — Las 4 capas del fondo
//
// Cada capa avanza a velocidadMundo x factor: lo lejano (cielo) despacio y
// lo cercano (suelo) rápido. El suelo tiene factor 1, o sea, la misma
// velocidad que los obstáculos. Como todas salen de la misma velocidad del
// mundo, cuando un drone la ralentiza, el fondo entero frena en proporción.
//
// Cada capa es un div más ancho que el área de juego con el fondo repetido
// en horizontal. Se corre hacia la izquierda y, cuando avanzó un tile
// entero, vuelve a 0: como el dibujo se repite, el salto no se ve.

import { CAPAS } from './config.js';

/**
 * Crea el parallax sobre los elementos .layer (en orden 1..4).
 * @param {HTMLElement[]} elementos
 * @returns {{ actualizar: (velocidadMundo: number, dt: number) => void, dibujar: () => void, reiniciar: () => void }}
 */
export function crearParallax(elementos) {
  const desplazamientos = CAPAS.map(() => 0);  // px recorridos por cada capa

  // El ancho del tile se pasa al CSS una sola vez (el CSS lo usa para el
  // tamaño del fondo y el ancho de la capa).
  elementos.forEach((elemento, i) => {
    elemento.style.setProperty('--tile', `${CAPAS[i].anchoTile}px`);
  });

  return {
    /**
     * Avanza cada capa según su factor.
     * @param {number} velocidadMundo px/s actuales (ya ralentizada si corresponde)
     * @param {number} dt segundos
     */
    actualizar(velocidadMundo, dt) {
      CAPAS.forEach((capa, i) => {
        // El resto (%) lo mantiene entre 0 y un tile: el número no crece
        // para siempre y el salto de vuelta a 0 coincide con la repetición.
        desplazamientos[i] = (desplazamientos[i] + velocidadMundo * capa.factor * dt) % capa.anchoTile;
      });
    },

    /** Escribe el transform de cada capa (px enteros: el pixel art no se ve borroso). */
    dibujar() {
      elementos.forEach((elemento, i) => {
        elemento.style.transform = `translate3d(${-Math.round(desplazamientos[i])}px, 0, 0)`;
      });
    },

    /** Vuelve todas las capas a 0 (partida nueva). */
    reiniciar() {
      desplazamientos.fill(0);
    },
  };
}
