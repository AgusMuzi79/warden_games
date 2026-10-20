// finComun.js — Lo que comparten las pantallas de victoria y de derrota
//
// Qué hace: guarda el texto de cada motivo de fin, el botón "JUGAR DE NUEVO"
// (su rectángulo, cómo se dibuja y cómo saber si el mouse está encima), la
// línea de estadísticas y el aviso para lectores de pantalla.
// Por qué aparte: victoria y derrota usan las mismas piezas; así no se repiten
// ni una importa a la otra. Las pantallas en sí están en pantallaVictoria.js y
// pantallaDerrota.js, y pantallaFin.js elige cuál mostrar.
//
// Los colores salen de obtenerColores() (variables.css) y las
// transparencias se arman con conAlfa(). No hay colores escritos acá.

import { conAlfa, enRect, formatearTiempo } from '../utiles.js';
import { ANCHO, ALTO } from '../config.js';
import { texto } from './dibujo.js';

// ---------------------------------------------------------------
// Datos y piezas compartidas por las pantallas de fin
// ---------------------------------------------------------------
//
// PegController arma un objeto "fin" (con los datos del modelo) cuando se muestra la pantalla:
// { resultado, motivo, tiempoMs, movimientos, nodos, ultima, mostradoEn }
//   resultado: 'ganado' | 'perdido'
//   motivo: 'central' | 'un-nodo' | 'sin-saltos' | 'tiempo' (ver MOTIVOS)
//   ultima: casilla del nodo que quedó solo ({fila, col}), o null si se perdió
//   mostradoEn: instante (ms) en que apareció la pantalla; de ahí salen las animaciones

// Cómo se dice cada motivo: etiqueta va en el canvas (mayúsculas, como el
// prototipo) y frase en el aviso para lectores de pantalla.
export const MOTIVOS = {
  central: { etiqueta: 'NODO CENTRAL  ·  CONEXIÓN PERFECTA', frase: 'Quedó un solo nodo, en el centro (conexión perfecta),' },
  'un-nodo': { etiqueta: 'UN SOLO NODO ACTIVO', frase: 'Quedó un solo nodo' },
  'sin-saltos': { etiqueta: 'NO QUEDAN SALTOS VÁLIDOS', frase: 'No quedan saltos válidos.' },
  tiempo: { etiqueta: 'SE TERMINÓ EL TIEMPO', frase: 'Se terminó el tiempo.' },
};

const TEXTO_BOTON_FIN = 'JUGAR DE NUEVO';
const ANCHO_BOTON_FIN = 260;
const ALTO_BOTON_FIN = 48;

/**
 * Altura (y) del título de la victoria. El bloque de texto va debajo del
 * nodo ganador, o arriba si el nodo quedó en la mitad de abajo, para no taparlo.
 * @param {{ultima: {fila: number, col: number}}} fin
 * @returns {number}
 */
export function alturaTituloVictoria(fin) {
  return fin.ultima.fila >= 4 ? 150 : 520;
}

/**
 * Rectángulo del botón "JUGAR DE NUEVO" de la pantalla de fin.
 * @param {{resultado: string, ultima: {fila: number, col: number} | null}} fin
 * @returns {{x: number, y: number, w: number, h: number}}
 */
export function cajaBotonFin(fin) {
  const y = fin.resultado === 'ganado' ? alturaTituloVictoria(fin) + 118 : ALTO / 2 + 118;
  return { x: ANCHO / 2 - ANCHO_BOTON_FIN / 2, y, w: ANCHO_BOTON_FIN, h: ALTO_BOTON_FIN };
}

/**
 * Indica si el punto (x, y) cae sobre el botón "JUGAR DE NUEVO".
 * @param {number} x coordenada lógica (0 a 1200)
 * @param {number} y coordenada lógica (0 a 760)
 * @param {object} fin el objeto de la pantalla de fin
 * @returns {boolean}
 */
export function botonFinEn(x, y, fin) {
  return enRect(x, y, cajaBotonFin(fin));
}

/**
 * Tiempo jugado en mm:ss, redondeado para abajo. formatearTiempo()
 * redondea para arriba (es el criterio de la cuenta regresiva del HUD);
 * así el tiempo usado más el que marca el HUD suman el límite.
 * @param {number} ms
 * @returns {string}
 */
function tiempoUsado(ms) {
  return formatearTiempo(Math.floor(ms / 1000) * 1000);
}

/**
 * Texto para la región en vivo cuando aparece la pantalla de fin: el
 * resultado, el motivo, el tiempo, los movimientos y cómo jugar de nuevo.
 * @param {object} fin el objeto de la pantalla de fin
 * @returns {string}
 */
export function avisoDeFin(fin) {
  const tiempo = tiempoUsado(fin.tiempoMs);
  const movimientos = fin.movimientos + (fin.movimientos === 1 ? ' movimiento' : ' movimientos');
  const cierre = ' Apretá Enter para jugar de nuevo.';
  const frase = MOTIVOS[fin.motivo].frase;
  if (fin.resultado === 'ganado') {
    return 'Sistema restaurado. ' + frase + ' en ' + tiempo + ' y ' + movimientos + '.' + cierre;
  }
  return 'Sistema corrupto. ' + frase + ' Quedaron ' + fin.nodos + ' nodos, en ' + tiempo
    + ' y ' + movimientos + '.' + cierre;
}

/**
 * Línea de estadísticas: tiempo usado, movimientos y nodos que quedaron.
 * @param {object} fin
 * @returns {string}
 */
export function lineaEstadisticas(fin) {
  return 'TIEMPO ' + tiempoUsado(fin.tiempoMs) + '  ·  MOVIMIENTOS ' + fin.movimientos
    + '  ·  NODOS ' + fin.nodos;
}

/**
 * Botón "JUGAR DE NUEVO" dibujado en el canvas: borde cyan con brillo, que
 * se rellena un poco más con el mouse encima. Con foco de teclado suma el
 * mismo anillo claro que el cursor del tablero.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{x: number, y: number, w: number, h: number}} caja
 * @param {Record<string, string>} colores
 * @param {{ui: string}} fuentes
 * @param {{encendido: boolean, conFoco: boolean}} estado
 */
export function dibujarBotonFin(ctx, caja, colores, fuentes, { encendido, conFoco }) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(caja.x, caja.y, caja.w, caja.h, 6);
  ctx.fillStyle = conAlfa(colores.acento, encendido ? 0.22 : 0.08);
  ctx.fill();
  ctx.strokeStyle = colores.acento;
  ctx.lineWidth = 1.5;
  ctx.shadowColor = colores.acento;
  ctx.shadowBlur = encendido ? 16 : 6;
  ctx.stroke();
  ctx.restore();
  if (conFoco) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(caja.x - 6, caja.y - 6, caja.w + 12, caja.h + 12, 10);
    ctx.strokeStyle = colores.textoClaro;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }
  texto(ctx, TEXTO_BOTON_FIN, caja.x + caja.w / 2, caja.y + 30, {
    fuente: '600 15px ' + fuentes.ui, color: colores.textoClaro, alinear: 'center', espaciado: 3,
  });
}
