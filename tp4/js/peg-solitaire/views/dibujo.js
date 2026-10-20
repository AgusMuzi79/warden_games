// dibujo.js — Dibujo estático del Peg: tablero vacío, scanlines y fichas
//
// Qué hace: carga la imagen del tablero vacío (fondo + placa en cruz con
// sus 33 huecos, assets/img/tablero-peg.jpg), prepara las imágenes de las
// fichas con su brillo y las scanlines, y después ofrece funciones para
// pintar todo eso en el canvas del juego.
// Por qué una imagen: el enunciado pide mostrar un tablero vacío como
// imagen de fondo. En cada cuadro solo se copia con drawImage, debajo de
// las fichas.
//
// Los colores de las fichas y las scanlines salen de obtenerColores()
// (variables.css); las transparencias se arman con conAlfa(). Los del
// tablero vienen fijos en la imagen.

import { crearCanvas, cargarImagen, conAlfa, prefiereMenosMovimiento } from '../utiles.js';
import {
  ANCHO, ALTO, TAMANO_TABLERO, TABLERO_X, CELDA, OFFSET,
  RADIO_FICHA, PADDING_FICHA, FICHAS, IMAGEN_TABLERO, SEPARACION_SCANLINES, obtenerDpr,
} from '../config.js';

// Lado de la imagen de una ficha, con el espacio extra para el brillo.
const LADO_FICHA = (RADIO_FICHA + PADDING_FICHA) * 2;

/**
 * Centro de una celda en coordenadas del tablero (sin correrlo hacia el HUD).
 * @param {number} fila
 * @param {number} col
 * @returns {{x: number, y: number}}
 */
function centroLocal(fila, col) {
  return { x: OFFSET + col * CELDA + CELDA / 2, y: OFFSET + fila * CELDA + CELDA / 2 };
}

/**
 * Centro de una celda en coordenadas del canvas completo (1200x760).
 * @param {number} fila
 * @param {number} col
 * @returns {{x: number, y: number}}
 */
export function centroDeCelda(fila, col) {
  const punto = centroLocal(fila, col);
  return { x: punto.x + TABLERO_X, y: punto.y };
}

/**
 * Escribe un texto con fuente, color, alineación, espaciado entre letras y
 * brillo opcional. Junta el estilo en un lugar para no repetirlo.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} cadena
 * @param {number} x
 * @param {number} y
 * @param {{fuente: string, color: string, alinear?: string, espaciado?: number, brillo?: string|null, desenfoque?: number}} opciones
 */
export function texto(ctx, cadena, x, y, { fuente, color, alinear = 'left', espaciado = 0, brillo = null, desenfoque = 14 }) {
  ctx.save();
  ctx.font = fuente;
  ctx.fillStyle = color;
  ctx.textAlign = alinear;
  ctx.textBaseline = 'alphabetic';
  // letterSpacing es nuevo: si el navegador no lo tiene, se escribe sin espaciado.
  if ('letterSpacing' in ctx) ctx.letterSpacing = espaciado + 'px';
  if (brillo) {
    ctx.shadowColor = brillo;
    ctx.shadowBlur = desenfoque;
  }
  ctx.fillText(cadena, x, y);
  ctx.restore();
}

/**
 * Arma las scanlines: líneas horizontales finas y oscuras sobre todo el
 * canvas, como una pantalla vieja. Son quietas, así que no molestan a
 * quien prefiere menos movimiento.
 * @param {Record<string, string>} colores
 * @param {number} dpr
 * @returns {HTMLCanvasElement}
 */
function crearScanlines(colores, dpr) {
  const { canvas, ctx } = crearCanvas(ANCHO, ALTO, dpr);
  ctx.fillStyle = conAlfa(colores.descargado, 0.22);
  for (let y = 0; y < ALTO; y += SEPARACION_SCANLINES) ctx.fillRect(0, y, ANCHO, 1);
  return canvas;
}

/**
 * Prepara la imagen de una ficha: carga el PNG y le suma un brillo del
 * color dado. Devuelve el canvas directo (drawImage lo acepta igual que
 * una imagen); pasarlo por toDataURL fallaría al abrir con file://.
 * @param {string} ruta
 * @param {string} colorBrillo
 * @param {number} dpr
 * @returns {Promise<HTMLCanvasElement>}
 */
async function crearImagenFicha(ruta, colorBrillo, dpr) {
  const imagen = await cargarImagen(ruta);
  const centro = LADO_FICHA / 2;
  const { canvas, ctx } = crearCanvas(LADO_FICHA, LADO_FICHA, dpr);
  ctx.shadowColor = colorBrillo;
  ctx.shadowBlur = 14;
  ctx.drawImage(imagen, centro - RADIO_FICHA, centro - RADIO_FICHA, RADIO_FICHA * 2, RADIO_FICHA * 2);
  return canvas;
}

/**
 * Carga y arma todo lo que se prepara una sola vez: la imagen del tablero
 * vacío, las scanlines y las tres fichas.
 * @param {Record<string, string>} colores lo que devuelve obtenerColores()
 * @returns {Promise<{tablero: HTMLImageElement, scanlines: HTMLCanvasElement, fichas: Record<string, HTMLCanvasElement>}>}
 */
export async function prepararRecursos(colores) {
  const dpr = obtenerDpr();
  const [tablero, naranja, cyan, blanca] = await Promise.all([
    cargarImagen(IMAGEN_TABLERO),
    crearImagenFicha(FICHAS.naranja, colores.activo, dpr),
    crearImagenFicha(FICHAS.cyan, colores.acento, dpr),
    crearImagenFicha(FICHAS.blanca, colores.destino, dpr),
  ]);
  return {
    tablero,
    scanlines: crearScanlines(colores, dpr),
    fichas: { naranja, cyan, blanca },
  };
}

/**
 * Pinta las scanlines ya armadas encima de todo el canvas.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{scanlines: HTMLCanvasElement}} recursos
 */
export function dibujarScanlines(ctx, recursos) {
  ctx.drawImage(recursos.scanlines, 0, 0, ANCHO, ALTO);
}

/**
 * Pinta la imagen del tablero vacío entera, quieta, sobre todo el canvas.
 * Es el fondo: queda debajo de todo lo demás.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{tablero: HTMLImageElement}} recursos
 */
export function dibujarFondo(ctx, recursos) {
  ctx.drawImage(recursos.tablero, 0, 0, ANCHO, ALTO);
}

/**
 * Vuelve a pintar solo el cuadrado de la placa, recortado de la misma
 * imagen. Sin temblor cae justo encima del fondo y no cambia nada; con
 * temblor (ctx corrido unos px) se mueve la placa y el resto queda quieto.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{tablero: HTMLImageElement}} recursos
 */
export function dibujarTablero(ctx, recursos) {
  const imagen = recursos.tablero;
  // La imagen puede tener más píxeles que el canvas lógico (está al doble).
  const escala = imagen.naturalWidth / ANCHO;
  ctx.drawImage(
    imagen,
    TABLERO_X * escala, 0, TAMANO_TABLERO * escala, TAMANO_TABLERO * escala,
    TABLERO_X, 0, TAMANO_TABLERO, TAMANO_TABLERO,
  );
}

/**
 * Dibuja una ficha centrada en (x, y).
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLCanvasElement} imagen una de recursos.fichas
 * @param {number} x
 * @param {number} y
 * @param {number} [escala=1]
 * @param {number} [opacidad=1]
 */
export function dibujarFicha(ctx, imagen, x, y, escala = 1, opacidad = 1) {
  const lado = LADO_FICHA * escala;
  ctx.save();
  ctx.globalAlpha = opacidad;
  ctx.drawImage(imagen, x - lado / 2, y - lado / 2, lado, lado);
  ctx.restore();
}

/**
 * Dibuja todas las fichas del tablero. Las imágenes dependen del bando:
 * imagen para las fichas normales e imagenResaltada para la elegida. Si no
 * se pasan, quedan las de F2 (naranja y cyan).
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('../models/Tablero.js').Tablero} tablero
 * @param {{fichas: Record<string, HTMLCanvasElement>}} recursos
 * @param {{levantada?: {fila: number, col: number}|null, resaltada?: {fila: number, col: number}|null, imagen?: HTMLCanvasElement, imagenResaltada?: HTMLCanvasElement}} [opciones]
 */
export function dibujarFichas(ctx, tablero, recursos, {
  levantada = null, resaltada = null,
  imagen = recursos.fichas.naranja, imagenResaltada = recursos.fichas.cyan,
} = {}) {
  const esCelda = (celda, fila, col) => celda && celda.fila === fila && celda.col === col;
  tablero.recorrer((fila, col) => {
    if (tablero.grilla[fila][col] !== true) return;
    if (esCelda(levantada, fila, col)) return; // la dibuja quien la arrastra
    const imagenFicha = esCelda(resaltada, fila, col) ? imagenResaltada : imagen;
    const { x, y } = centroDeCelda(fila, col);
    dibujarFicha(ctx, imagenFicha, x, y);
  });
}

/**
 * Fantasma de destino: la ficha levantada del bando (por defecto, la cyan),
 * transparente, en una casilla donde se puede soltar. "Respira" (late
 * suave) salvo que se prefiera menos movimiento; encendido = la ficha
 * arrastrada está encima.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} fila
 * @param {number} col
 * @param {{fichas: Record<string, HTMLCanvasElement>}} recursos
 * @param {number} t tiempo actual en ms (por ejemplo, el de requestAnimationFrame)
 * @param {boolean} [encendido=false]
 * @param {HTMLCanvasElement} [imagen] imagen de la ficha; por defecto, la cyan
 */
export function dibujarFantasma(ctx, fila, col, recursos, t, encendido = false, imagen = recursos.fichas.cyan) {
  // pulso va de 0 a 1 y vuelve; quieto en el medio si no se quiere movimiento.
  const pulso = prefiereMenosMovimiento() ? 0.5 : (Math.sin(t * 0.005) + 1) / 2;
  const opacidad = encendido ? 0.85 : 0.3 + 0.25 * pulso;
  const escala = encendido ? 1.08 : 0.94 + 0.08 * pulso;
  const { x, y } = centroDeCelda(fila, col);
  dibujarFicha(ctx, imagen, x, y, escala, opacidad);
}
