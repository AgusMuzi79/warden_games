// pantallaFin.js — Elige qué pantalla de fin mostrar
//
// Qué hace: según el resultado de la partida dibuja la pantalla de victoria o
// la de derrota. También reexporta lo que el resto del juego necesita de las
// pantallas de fin (el aviso para lectores de pantalla y el hit-test del
// botón), así PegView importa de un solo lugar.

import { dibujarVictoria } from './pantallaVictoria.js';
import { dibujarDerrota } from './pantallaDerrota.js';

export { avisoDeFin, botonFinEn } from './finComun.js';

/**
 * Pantalla de fin: elige la de victoria o la de derrota según el resultado.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} recursos lo que devuelve prepararRecursos()
 * @param {Record<string, string>} colores lo que devuelve obtenerColores()
 * @param {{titulo: string, ui: string}} fuentes lo que devuelve obtenerFuentes()
 * @param {object} fin el objeto de la pantalla de fin (ver arriba)
 * @param {{t: number, dpr: number, imagen: HTMLCanvasElement, encendido: boolean, conFoco: boolean}} estado
 *   encendido: el mouse está sobre el botón; conFoco: el canvas tiene foco de teclado
 */
export function dibujarFin(ctx, recursos, colores, fuentes, fin, estado) {
  if (fin.resultado === 'ganado') dibujarVictoria(ctx, recursos, colores, fuentes, fin, estado);
  else dibujarDerrota(ctx, recursos, colores, fuentes, fin, estado);
}
