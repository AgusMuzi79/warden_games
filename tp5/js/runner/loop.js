// loop.js — El único requestAnimationFrame del juego
//
// En cada cuadro calcula cuánto tiempo pasó desde el anterior (dt, en
// segundos) y se lo pasa a la función del juego, que primero actualiza el
// estado y después lo dibuja. Todo lo que se mueve multiplica su velocidad
// (px/s) por dt: así el juego va igual de rápido a 60 o a 144 Hz.

import { JUEGO } from './config.js';

/**
 * Crea el loop. No arranca solo: hay que llamar a iniciar().
 * @param {(dt: number) => void} paso función que actualiza y dibuja un cuadro
 * @returns {{ iniciar: () => void, detener: () => void }}
 */
export function crearLoop(paso) {
  let pedido = null;    // id del requestAnimationFrame pendiente
  let anterior = null;  // timestamp del cuadro anterior (ms)

  /**
   * Un cuadro. El navegador pasa el timestamp en ms.
   * @param {number} ahora
   */
  function cuadro(ahora) {
    // El primer cuadro después de iniciar no tiene anterior: dt = 0.
    // El tope (dtMax) evita que, al volver de otra pestaña o de un
    // tirón, la moto avance tanto en un solo paso que atraviese un
    // obstáculo sin chocarlo.
    const dt = anterior === null ? 0 : Math.min((ahora - anterior) / 1000, JUEGO.dtMax);
    anterior = ahora;
    paso(dt);
    pedido = requestAnimationFrame(cuadro);
  }

  return {
    /** Arranca (o reanuda) el loop. Si ya estaba corriendo, no hace nada. */
    iniciar() {
      if (pedido !== null) return;
      anterior = null;
      pedido = requestAnimationFrame(cuadro);
    },
    /** Frena el loop (pausa, fin de partida). */
    detener() {
      if (pedido === null) return;
      cancelAnimationFrame(pedido);
      pedido = null;
    },
  };
}
