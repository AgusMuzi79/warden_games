// dibujo.js — Dibujo estático del Peg: fondo, placa del tablero y fichas
//
// Qué hace: arma una sola vez, en canvas fuera de pantalla, el fondo y la
// placa en forma de cruz (con su grilla, las trazas de circuito y los
// huecos), prepara las imágenes de las fichas con su brillo, y después
// ofrece funciones para pintar todo eso en el canvas del juego.
// Por qué pre-renderizar: la placa tiene muchas líneas y sombras; dibujarla
// en cada cuadro sería lento. Se dibuja una vez y en cada cuadro solo se
// copia la imagen ya armada con drawImage.
//
// Los colores salen de obtenerColores() (variables.css); las
// transparencias se arman con conAlfa(). No hay colores escritos acá.

import { crearCanvas, cargarImagen, mulberry32, conAlfa, prefiereMenosMovimiento } from './utiles.js';
import {
  ANCHO, ALTO, TAMANO_TABLERO, TABLERO_X, CELDA, OFFSET,
  RADIO_FICHA, RADIO_HUECO, PADDING_FICHA, FICHAS, SEPARACION_SCANLINES, obtenerDpr,
} from './config.js';
import { Tablero } from './tablero.js';

const VUELTA = Math.PI * 2;
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
 * Vértices del contorno de la cruz, agrandado `margen` píxeles hacia afuera.
 * @param {number} margen
 * @returns {{x: number, y: number}[]}
 */
function puntosCruz(margen) {
  const a = OFFSET + 2 * CELDA - margen;
  const b = OFFSET + 5 * CELDA + margen;
  const min = OFFSET - margen;
  const max = OFFSET + 7 * CELDA + margen;
  const pares = [[a, min], [b, min], [b, a], [max, a], [max, b], [b, b],
    [b, max], [a, max], [a, b], [min, b], [min, a], [a, a]];
  return pares.map(([x, y]) => ({ x, y }));
}

/**
 * Traza un polígono con las esquinas cortadas en diagonal (chaflán de k px).
 * @param {CanvasRenderingContext2D} ctx
 * @param {{x: number, y: number}[]} puntos
 * @param {number} k
 */
function trazarChaflan(ctx, puntos, k) {
  const n = puntos.length;
  // Punto que está a k píxeles de p, yendo hacia q.
  const haciaQ = (p, q) => {
    const largo = Math.hypot(q.x - p.x, q.y - p.y);
    return { x: p.x + ((q.x - p.x) / largo) * k, y: p.y + ((q.y - p.y) / largo) * k };
  };
  ctx.beginPath();
  puntos.forEach((p, i) => {
    const desde = haciaQ(p, puntos[(i - 1 + n) % n]);
    const hasta = haciaQ(p, puntos[(i + 1) % n]);
    if (i === 0) ctx.moveTo(desde.x, desde.y);
    else ctx.lineTo(desde.x, desde.y);
    ctx.lineTo(hasta.x, hasta.y);
  });
  ctx.closePath();
}

/**
 * Grilla tenue de fondo dentro de la placa (cada cuarto de celda).
 * @param {CanvasRenderingContext2D} ctx
 * @param {Record<string, string>} colores
 */
function dibujarGrilla(ctx, colores) {
  ctx.strokeStyle = conAlfa(colores.acento, 0.05);
  ctx.lineWidth = 1;
  for (let v = OFFSET; v <= OFFSET + 7 * CELDA; v += CELDA / 4) {
    ctx.beginPath(); ctx.moveTo(v, 0); ctx.lineTo(v, TAMANO_TABLERO); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, v); ctx.lineTo(TAMANO_TABLERO, v); ctx.stroke();
  }
}

/**
 * Trazas de circuito: caminos que giran de a 45° con un círculo en cada punta.
 * Usan mulberry32 con semilla fija, así salen iguales en cada carga.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Record<string, string>} colores
 */
function dibujarTrazas(ctx, colores) {
  const azar = mulberry32(24);
  // Las 8 direcciones, en orden horario empezando por la derecha.
  const DIRECCIONES = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
  ctx.save();
  ctx.strokeStyle = conAlfa(colores.acento, 0.32);
  ctx.lineWidth = 1.4;
  ctx.lineJoin = 'round';
  ctx.shadowColor = conAlfa(colores.acento, 0.6);
  ctx.shadowBlur = 6;
  for (let i = 0; i < 60; i++) {
    let x = OFFSET + Math.round(azar() * 7) * CELDA;
    let y = OFFSET + Math.round(azar() * 14) * (CELDA / 2);
    const inicioX = x;
    const inicioY = y;
    let dir = Math.floor(azar() * 4) * 2; // arranca horizontal o vertical
    ctx.beginPath();
    ctx.moveTo(x, y);
    const tramos = 2 + Math.floor(azar() * 3);
    for (let t = 0; t < tramos; t++) {
      const largo = (0.3 + azar() * 0.9) * CELDA;
      const [dx, dy] = DIRECCIONES[dir];
      // En diagonal se divide por raíz de 2 para que el tramo mida lo mismo.
      const ajuste = dx && dy ? Math.SQRT1_2 : 1;
      x += dx * largo * ajuste;
      y += dy * largo * ajuste;
      ctx.lineTo(x, y);
      dir = (dir + (azar() < 0.5 ? 1 : 7)) % 8; // gira 45° a un lado o al otro
    }
    ctx.stroke();
    for (const [px, py] of [[inicioX, inicioY], [x, y]]) {
      ctx.beginPath(); ctx.arc(px, py, 3, 0, VUELTA); ctx.stroke();
    }
  }
  ctx.restore();
}

/**
 * Hueco del tablero: un halo oscuro que tapa las trazas, el fondo hundido
 * (degradé) y un aro con brillo.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{x: number, y: number}} centro
 * @param {Record<string, string>} colores
 */
function dibujarHueco(ctx, { x, y }, colores) {
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, RADIO_HUECO + 7, 0, VUELTA);
  ctx.fillStyle = colores.descargado;
  ctx.fill();
  ctx.strokeStyle = conAlfa(colores.acento, 0.15);
  ctx.lineWidth = 1;
  ctx.stroke();

  const degrade = ctx.createRadialGradient(x, y - 4, 2, x, y, RADIO_HUECO);
  degrade.addColorStop(0, colores.descargado);
  degrade.addColorStop(1, colores.placaBorde);
  ctx.beginPath(); ctx.arc(x, y, RADIO_HUECO, 0, VUELTA);
  ctx.fillStyle = degrade;
  ctx.fill();
  ctx.strokeStyle = conAlfa(colores.acento, 0.5);
  ctx.lineWidth = 1.5;
  ctx.shadowColor = colores.acento;
  ctx.shadowBlur = 8;
  ctx.stroke();
  ctx.restore();
}

/**
 * Arma la placa completa (vacía, sin fichas) en un canvas fuera de pantalla.
 * @param {Record<string, string>} colores
 * @param {number} dpr
 * @returns {HTMLCanvasElement}
 */
function crearPlaca(colores, dpr) {
  const { canvas, ctx } = crearCanvas(TAMANO_TABLERO, TAMANO_TABLERO, dpr);
  const exterior = puntosCruz(16);
  const interior = puntosCruz(6);

  // Placa base con brillo alrededor.
  trazarChaflan(ctx, exterior, 18);
  const degrade = ctx.createLinearGradient(0, 0, 0, TAMANO_TABLERO);
  degrade.addColorStop(0, colores.placa);
  degrade.addColorStop(1, colores.descargado);
  ctx.fillStyle = degrade;
  ctx.shadowColor = conAlfa(colores.acento, 0.35);
  ctx.shadowBlur = 40;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Grilla y trazas, recortadas al borde interior de la placa.
  ctx.save();
  trazarChaflan(ctx, interior, 12);
  ctx.clip();
  dibujarGrilla(ctx, colores);
  dibujarTrazas(ctx, colores);
  ctx.restore();

  // Borde exterior con brillo y bisel interior más fino.
  ctx.save();
  trazarChaflan(ctx, exterior, 18);
  ctx.strokeStyle = colores.acento;
  ctx.lineWidth = 2.5;
  ctx.shadowColor = colores.acento;
  ctx.shadowBlur = 16;
  ctx.stroke();
  ctx.restore();
  ctx.save();
  trazarChaflan(ctx, interior, 12);
  ctx.strokeStyle = conAlfa(colores.acento, 0.45);
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  for (let fila = 0; fila < 7; fila++) {
    for (let col = 0; col < 7; col++) {
      if (Tablero.esCeldaValida(fila, col)) dibujarHueco(ctx, centroLocal(fila, col), colores);
    }
  }
  return canvas;
}

/**
 * Arma el fondo del canvas completo: el violeta del sitio con una luz
 * suave en el centro.
 * @param {Record<string, string>} colores
 * @param {number} dpr
 * @returns {HTMLCanvasElement}
 */
function crearFondo(colores, dpr) {
  const { canvas, ctx } = crearCanvas(ANCHO, ALTO, dpr);
  ctx.fillStyle = colores.fondo;
  ctx.fillRect(0, 0, ANCHO, ALTO);
  const luz = ctx.createRadialGradient(ANCHO / 2, ALTO / 2, 100, ANCHO / 2, ALTO / 2, ANCHO * 0.6);
  luz.addColorStop(0, conAlfa(colores.textoTenue, 0.08));
  luz.addColorStop(1, conAlfa(colores.textoTenue, 0));
  ctx.fillStyle = luz;
  ctx.fillRect(0, 0, ANCHO, ALTO);
  return canvas;
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
 * Arma todo lo que se dibuja una sola vez: fondo, placa, scanlines y las tres fichas.
 * @param {Record<string, string>} colores lo que devuelve obtenerColores()
 * @returns {Promise<{fondo: HTMLCanvasElement, placa: HTMLCanvasElement, scanlines: HTMLCanvasElement, fichas: Record<string, HTMLCanvasElement>}>}
 */
export async function prepararRecursos(colores) {
  const dpr = obtenerDpr();
  const [naranja, cyan, blanca] = await Promise.all([
    crearImagenFicha(FICHAS.naranja, colores.activo, dpr),
    crearImagenFicha(FICHAS.cyan, colores.acento, dpr),
    crearImagenFicha(FICHAS.blanca, colores.destino, dpr),
  ]);
  return {
    fondo: crearFondo(colores, dpr),
    placa: crearPlaca(colores, dpr),
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
 * Pinta el fondo ya armado sobre todo el canvas.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{fondo: HTMLCanvasElement}} recursos
 */
export function dibujarFondo(ctx, recursos) {
  ctx.drawImage(recursos.fondo, 0, 0, ANCHO, ALTO);
}

/**
 * Pinta la placa ya armada, centrada entre los dos paneles del HUD.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{placa: HTMLCanvasElement}} recursos
 */
export function dibujarTablero(ctx, recursos) {
  ctx.drawImage(recursos.placa, TABLERO_X, 0, TAMANO_TABLERO, TAMANO_TABLERO);
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
 * @param {import('./tablero.js').Tablero} tablero
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
