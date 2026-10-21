// hackeo.js — Efecto visual de "Hackear Sistema"
//
// Qué hace: dibuja, durante DURACION_HACKEO_MS, el efecto que acompaña al
// botón "Hackear Sistema": las fichas que desaparecen se deshacen en
// fantasmas que tiemblan de lado a lado, una franja de luz barre el tablero
// de arriba abajo, aparecen barras de colores al azar y un cartel
// "SISTEMA HACKEADO" con aberración cromática (copias de color corridas) se
// enciende y se apaga.
// Solo dibuja: qué fichas se sacaron lo decide el modelo (PegModel.hackear) y
// quién arranca el efecto es PegView. Con movimiento reducido no se crea.
//
// Los colores salen de obtenerColores() (variables.css) y las
// transparencias se arman con conAlfa(). No hay colores escritos acá.

import { conAlfa, clamp, easeOut } from '../utiles.js';
import { ANCHO, ALTO, TABLERO_X, TAMANO_TABLERO } from '../config.js';
import { texto, dibujarFicha, centroDeCelda } from './dibujo.js';

const REPETIR_BARRAS_MS = 80;  // las barras se sortean de nuevo cada 80 ms: se ven como parpadeo, no como ruido

/**
 * Crea el estado de un hackeo recién disparado.
 * @param {{fila: number, col: number}[]} quitadas casillas de las fichas que desaparecieron
 * @param {number} t tiempo actual en ms
 * @returns {{inicio: number, quitadas: object[], barras: object[], barrasEn: number}}
 */
export function crearHackeo(quitadas, t) {
  return { inicio: t, quitadas, barras: [], barrasEn: -Infinity };
}

/**
 * Las fichas que se sacaron, como fantasmas que tiemblan y se apagan.
 * Se pintan dos veces con 'lighter' y corridas, para que parezcan partidas
 * en dos canales de color.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{quitadas: {fila: number, col: number}[]}} hackeo
 * @param {number} avance de 0 a 1
 * @param {HTMLCanvasElement} imagen ficha normal del bando
 */
function dibujarFantasmas(ctx, hackeo, avance, imagen) {
  // Se apagan en el primer 60 % del efecto.
  const opacidad = Math.pow(1 - clamp(avance / 0.6), 1.5);
  if (opacidad <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  hackeo.quitadas.forEach(({ fila, col }) => {
    const { x, y } = centroDeCelda(fila, col);
    const corrimiento = (Math.random() - 0.5) * 22 * (0.4 + avance);
    dibujarFicha(ctx, imagen, x - corrimiento, y, 1, opacidad * 0.8);
    dibujarFicha(ctx, imagen, x + corrimiento, y + (Math.random() - 0.5) * 6, 1, opacidad);
  });
  ctx.restore();
}

/**
 * Franja de luz que baja por el tablero, con una línea brillante abajo.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} avance de 0 a 1
 * @param {Record<string, string>} colores
 */
function dibujarBarrido(ctx, avance, colores) {
  // Recorre todo el alto en el primer 70 % del efecto.
  const recorrido = clamp(avance / 0.7);
  if (recorrido >= 1) return;
  const y = easeOut(recorrido) * ALTO;
  const degradado = ctx.createLinearGradient(0, y - 90, 0, y);
  degradado.addColorStop(0, conAlfa(colores.acento, 0));
  degradado.addColorStop(1, conAlfa(colores.acento, 0.3));
  ctx.save();
  ctx.fillStyle = degradado;
  ctx.fillRect(TABLERO_X, y - 90, TAMANO_TABLERO, 90);
  ctx.fillStyle = colores.textoClaro;
  ctx.shadowColor = colores.acento;
  ctx.shadowBlur = 14;
  ctx.fillRect(TABLERO_X, y - 1, TAMANO_TABLERO, 2);
  ctx.restore();
}

/**
 * Barras de colores al azar sobre el tablero, que se apagan con el efecto.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{barras: object[], barrasEn: number}} hackeo (se actualiza al sortear de nuevo)
 * @param {number} avance de 0 a 1
 * @param {number} t tiempo actual en ms
 * @param {Record<string, string>} colores
 */
function dibujarBarras(ctx, hackeo, avance, t, colores) {
  if (t - hackeo.barrasEn > REPETIR_BARRAS_MS) {
    hackeo.barrasEn = t;
    const tonos = [colores.activo, colores.acento, colores.destino];
    hackeo.barras = Array.from({ length: 8 }, () => ({
      x: TABLERO_X + Math.random() * TAMANO_TABLERO,
      y: Math.random() * ALTO,
      w: 40 + Math.random() * (Math.random() < 0.15 ? TAMANO_TABLERO : 200),
      h: 2 + Math.random() * 8,
      color: tonos[Math.floor(Math.random() * tonos.length)],
    }));
  }
  ctx.save();
  ctx.globalAlpha = 0.6 * (1 - avance);
  hackeo.barras.forEach((barra) => {
    ctx.fillStyle = barra.color;
    ctx.fillRect(barra.x, barra.y, barra.w, barra.h);
  });
  ctx.restore();
}

/**
 * Cartel "SISTEMA HACKEADO" con aberración cromática: una copia naranja y
 * otra cyan corridas a los costados, y la clara encima. Se enciende rápido y
 * se apaga más despacio.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} avance de 0 a 1
 * @param {Record<string, string>} colores
 * @param {{titulo: string, ui: string}} fuentes
 */
function dibujarCartel(ctx, avance, colores, fuentes) {
  const alfa = clamp(Math.min(avance / 0.12, (1 - avance) / 0.35));
  if (alfa <= 0) return;
  const cadena = 'SISTEMA HACKEADO';
  const x = ANCHO / 2;
  const y = ALTO / 2;
  const fuente = '700 56px ' + fuentes.titulo;
  const corrimiento = 3 + Math.random() * 4 * (1 - avance);
  ctx.save();
  // 'lighter' suma los colores donde las copias se pisan.
  ctx.globalCompositeOperation = 'lighter';
  texto(ctx, cadena, x - corrimiento, y, {
    fuente, color: conAlfa(colores.activo, 0.85 * alfa), alinear: 'center', espaciado: 6,
  });
  texto(ctx, cadena, x + corrimiento, y - (Math.random() - 0.5) * 4, {
    fuente, color: conAlfa(colores.acento, 0.85 * alfa), alinear: 'center', espaciado: 6,
  });
  ctx.restore();
  texto(ctx, cadena, x, y, {
    fuente, color: conAlfa(colores.textoClaro, alfa), alinear: 'center', espaciado: 6,
    brillo: colores.acento, desenfoque: 24,
  });
  texto(ctx, 'ACCESO CONCEDIDO', x, y + 40, {
    fuente: '600 18px ' + fuentes.ui, color: conAlfa(colores.acento, alfa), alinear: 'center', espaciado: 6,
  });
}

/**
 * Dibuja un cuadro del efecto de hackeo: fantasmas, barrido, barras y cartel.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{inicio: number, quitadas: object[], barras: object[], barrasEn: number}} hackeo lo que devuelve crearHackeo()
 * @param {number} duracionMs cuánto dura el efecto completo
 * @param {number} t tiempo actual en ms
 * @param {Record<string, string>} colores lo que devuelve obtenerColores()
 * @param {{titulo: string, ui: string}} fuentes lo que devuelve obtenerFuentes()
 * @param {HTMLCanvasElement} imagen ficha normal del bando
 */
export function dibujarEfectoHackeo(ctx, hackeo, duracionMs, t, colores, fuentes, imagen) {
  // Sin clamp: PegView borra el efecto al llegar a su duración y t sale del
  // mismo reloj que inicio (ver PegController.cuadro), así que el avance
  // queda entre 0 y 1.
  const avance = (t - hackeo.inicio) / duracionMs;
  dibujarFantasmas(ctx, hackeo, avance, imagen);
  dibujarBarrido(ctx, avance, colores);
  dibujarBarras(ctx, hackeo, avance, t, colores);
  dibujarCartel(ctx, avance, colores, fuentes);
}
