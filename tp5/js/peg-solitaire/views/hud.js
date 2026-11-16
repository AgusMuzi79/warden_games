// hud.js — Paneles de datos a los costados del tablero
//
// Qué hace: escribe en el canvas el tiempo que queda (con una barra), los
// movimientos hechos, las fichas que quedan y los saltos disponibles.
// Solo dibuja: los números se los pasa quien lo llama.
// Por qué no está el botón Reiniciar: va a ser un <button> real del HTML
// (se puede usar con teclado y lector de pantalla), no un dibujo.

import { clamp, conAlfa, formatearTiempo, prefiereMenosMovimiento } from '../utiles.js';
import { ANCHO } from '../config.js';
import { texto } from './dibujo.js';

const MARGEN = 36;            // distancia de los paneles al borde del canvas
const ANCHO_BARRA = 148;
const AVISO_MS = 30 * 1000;   // con menos de 30 s el tiempo se pinta de naranja

/**
 * Espera a que carguen las fuentes del canvas (Roboto Flex del HUD y
 * Orbitron de los títulos), con un tope de 1,5 s para no trabar el juego si
 * la red está lenta.
 * @param {{titulo: string, ui: string}} fuentes
 * @returns {Promise<void>}
 */
export async function cargarFuentes(fuentes) {
  const cargas = Promise.all([
    document.fonts.load('600 13px ' + fuentes.ui),
    document.fonts.load('700 42px ' + fuentes.ui),
    document.fonts.load('700 52px ' + fuentes.titulo),
  ]).catch(() => {});
  await Promise.race([cargas, new Promise((listo) => setTimeout(listo, 1500))]);
}

/**
 * Dibuja un dato: etiqueta chica arriba y el valor grande, con brillo, abajo.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} etiqueta
 * @param {string} valor
 * @param {number} x
 * @param {number} y
 * @param {string} alinear 'left' o 'right'
 * @param {string} color
 * @param {Record<string, string>} colores
 * @param {{ui: string}} fuentes
 */
function dibujarDato(ctx, etiqueta, valor, x, y, alinear, color, colores, fuentes) {
  texto(ctx, etiqueta, x, y, { fuente: '600 13px ' + fuentes.ui, color: colores.textoTenue, alinear, espaciado: 3 });
  texto(ctx, valor, x, y + 50, { fuente: '700 42px ' + fuentes.ui, color, alinear, brillo: color, desenfoque: 16 });
}

/**
 * Dibuja los dos paneles del HUD.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{restanteMs: number, limiteMs: number, movimientos: number, fichas: number, saltos: number, t?: number}} datos
 *   t es el tiempo actual en ms, para el parpadeo del aviso
 * @param {Record<string, string>} colores lo que devuelve obtenerColores()
 * @param {{titulo: string, ui: string}} fuentes lo que devuelve obtenerFuentes()
 */
export function dibujarHud(ctx, datos, colores, fuentes) {
  const izquierda = MARGEN;
  const derecha = ANCHO - MARGEN;
  const urgente = datos.restanteMs < AVISO_MS;
  const colorTiempo = urgente ? colores.activo : colores.acento;

  // Con poco tiempo, el reloj parpadea. Sin movimiento, solo cambia de color.
  let opacidad = 1;
  if (urgente && !prefiereMenosMovimiento()) {
    opacidad = 0.55 + 0.45 * Math.abs(Math.sin((datos.t || 0) * 0.006));
  }
  ctx.save();
  ctx.globalAlpha = opacidad;
  dibujarDato(ctx, 'TIEMPO', formatearTiempo(datos.restanteMs), izquierda, 70, 'left', colorTiempo, colores, fuentes);
  ctx.restore();

  // Barra del tiempo restante: fondo tenue y relleno proporcional.
  const proporcion = clamp(datos.restanteMs / datos.limiteMs);
  ctx.fillStyle = conAlfa(colores.textoTenue, 0.18);
  ctx.fillRect(izquierda, 140, ANCHO_BARRA, 3);
  ctx.save();
  ctx.fillStyle = colorTiempo;
  ctx.shadowColor = colorTiempo;
  ctx.shadowBlur = 8;
  ctx.fillRect(izquierda, 140, ANCHO_BARRA * proporcion, 3);
  ctx.restore();

  dibujarDato(ctx, 'MOVIMIENTOS', String(datos.movimientos), izquierda, 200, 'left', colores.acento, colores, fuentes);
  dibujarDato(ctx, 'NODOS ACTIVOS', String(datos.fichas), derecha, 70, 'right', colores.activo, colores, fuentes);
  dibujarDato(ctx, 'SALTOS DISPONIBLES', String(datos.saltos), derecha, 200, 'right', colores.acento, colores, fuentes);
}
