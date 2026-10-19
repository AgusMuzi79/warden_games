// pantallas.js — Pantallas que se dibujan encima del tablero
//
// Qué hace: dibuja en el canvas las pantallas que tapan la partida. Por
// ahora es la de selección de bando (dos tarjetas: Usuarios y Programas de
// Clu); en la Fase 3c se suman acá las pantallas de fin (victoria y derrota).
// Solo dibuja y responde "qué hay en este punto": el estado (qué tarjeta
// está elegida, si el canvas tiene foco) lo lleva juego.js.
//
// Los colores salen de obtenerColores() (variables.css) y las
// transparencias se arman con conAlfa(). No hay colores escritos acá.

import { conAlfa, enRect, prefiereMenosMovimiento } from './utiles.js';
import { ANCHO, ALTO, RADIO_FICHA, PADDING_FICHA, BANDOS, ORDEN_BANDOS } from './config.js';
import { texto } from './dibujo.js';

// ---------------------------------------------------------------
// Selección de bando
// ---------------------------------------------------------------

/**
 * Bando cuya tarjeta está bajo el punto (x, y), o null si no hay ninguna.
 * @param {number} x coordenada lógica (0 a 1200)
 * @param {number} y coordenada lógica (0 a 760)
 * @returns {string | null} 'usuarios', 'clu' o null
 */
export function bandoEn(x, y) {
  return ORDEN_BANDOS.find((clave) => enRect(x, y, BANDOS[clave].tarjeta)) || null;
}

/**
 * Dibuja la ficha grande de una tarjeta, girando despacio (más rápido si la
 * tarjeta está elegida). Con movimiento reducido queda quieta.
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLCanvasElement} imagen una de recursos.fichas
 * @param {number} x centro
 * @param {number} y centro
 * @param {number} radio radio de la ficha en px
 * @param {string} color color del brillo
 * @param {boolean} elegida
 * @param {number} t tiempo actual en ms
 */
function dibujarFichaGrande(ctx, imagen, x, y, radio, color, elegida, t) {
  // La imagen trae un margen para el brillo: se agranda en la misma proporción.
  const lado = radio * 2 * ((RADIO_FICHA + PADDING_FICHA) / RADIO_FICHA);
  const velocidad = elegida ? 0.0012 : 0.0004;
  ctx.save();
  ctx.translate(x, y);
  if (!prefiereMenosMovimiento()) ctx.rotate(t * velocidad);
  ctx.shadowColor = color;
  ctx.shadowBlur = elegida ? 40 : 20;
  ctx.drawImage(imagen, -lado / 2, -lado / 2, lado, lado);
  ctx.restore();
}

/**
 * Tamaño de letra (en px) para que un título entre en un ancho dado:
 * arranca en el tamaño máximo y achica de a 1 px hasta que entra.
 * Orbitron es ancha y "PROGRAMAS DE CLU" no entra a 22 px en la tarjeta.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} cadena
 * @param {string} familia fuente, por ejemplo fuentes.titulo
 * @param {number} maximo tamaño de partida
 * @param {number} anchoMaximo ancho disponible en px
 * @returns {number}
 */
function tamanoQueEntra(ctx, cadena, familia, maximo, anchoMaximo) {
  ctx.save();
  // Mismo espaciado que usa el título (2 px), para medir lo que se va a ver.
  if ('letterSpacing' in ctx) ctx.letterSpacing = '2px';
  let tamano = maximo;
  ctx.font = '700 ' + tamano + 'px ' + familia;
  while (tamano > 12 && ctx.measureText(cadena).width > anchoMaximo) {
    tamano--;
    ctx.font = '700 ' + tamano + 'px ' + familia;
  }
  ctx.restore();
  return tamano;
}

/**
 * Anillo de foco de teclado alrededor de una tarjeta (igual que el cursor
 * del tablero: claro y con brillo).
 * @param {CanvasRenderingContext2D} ctx
 * @param {{x: number, y: number, w: number, h: number}} caja la tarjeta
 * @param {Record<string, string>} colores
 */
function dibujarFocoTarjeta(ctx, caja, colores) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(caja.x - 8, caja.y - 8, caja.w + 16, caja.h + 16, 14);
  ctx.strokeStyle = colores.textoClaro;
  ctx.lineWidth = 3;
  ctx.shadowColor = colores.acento;
  ctx.shadowBlur = 12;
  ctx.stroke();
  ctx.restore();
}

/**
 * Dibuja la tarjeta de un bando: fondo, borde de su color, ficha grande,
 * nombre y lema. La elegida se enciende y muestra "ENTRAR AL GRID".
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} clave 'usuarios' o 'clu'
 * @param {{fichas: Record<string, HTMLCanvasElement>}} recursos
 * @param {Record<string, string>} colores
 * @param {{titulo: string, ui: string}} fuentes
 * @param {boolean} elegida
 * @param {number} t tiempo actual en ms
 */
function dibujarTarjeta(ctx, clave, recursos, colores, fuentes, elegida, t) {
  const bando = BANDOS[clave];
  const caja = bando.tarjeta;
  const color = colores[bando.color];
  const centroX = caja.x + caja.w / 2;

  // Fondo y borde con brillo.
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(caja.x, caja.y, caja.w, caja.h, 10);
  ctx.fillStyle = conAlfa(colores.placa, elegida ? 0.95 : 0.85);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = elegida ? 2.5 : 1.2;
  ctx.globalAlpha = elegida ? 1 : 0.6;
  ctx.shadowColor = color;
  ctx.shadowBlur = elegida ? 30 : 8;
  ctx.stroke();
  ctx.restore();

  const radio = elegida ? 82 : 74;
  dibujarFichaGrande(ctx, recursos.fichas[bando.ficha], centroX, caja.y + 130, radio, color, elegida, t);

  const tamano = tamanoQueEntra(ctx, bando.titulo, fuentes.titulo, 22, caja.w - 32);
  texto(ctx, bando.titulo, centroX, caja.y + 270, {
    fuente: '700 ' + tamano + 'px ' + fuentes.titulo, color, alinear: 'center', espaciado: 2, brillo: color, desenfoque: elegida ? 18 : 6,
  });
  texto(ctx, bando.lema, centroX, caja.y + 304, {
    fuente: '400 15px ' + fuentes.ui, color: colores.textoTenue, alinear: 'center',
  });
  if (elegida) {
    // El texto late suave; con movimiento reducido queda fijo.
    const pulso = prefiereMenosMovimiento() ? 1 : 0.6 + 0.4 * Math.abs(Math.sin(t * 0.004));
    ctx.save();
    ctx.globalAlpha = pulso;
    texto(ctx, 'ENTRAR AL GRID', centroX, caja.y + 338, {
      fuente: '600 12px ' + fuentes.ui, color: colores.textoClaro, alinear: 'center', espaciado: 3,
    });
    ctx.restore();
  }
}

/**
 * Pantalla de selección de bando: velo sobre el tablero, título, una
 * bajada con la regla del juego, las dos tarjetas y cómo elegir.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{fichas: Record<string, HTMLCanvasElement>}} recursos lo que devuelve prepararRecursos()
 * @param {Record<string, string>} colores lo que devuelve obtenerColores()
 * @param {{titulo: string, ui: string}} fuentes lo que devuelve obtenerFuentes()
 * @param {{elegido: string, t: number, conFoco: boolean}} estado
 *   elegido es la tarjeta encendida; conFoco, si el canvas tiene foco de teclado
 */
export function dibujarSeleccion(ctx, recursos, colores, fuentes, { elegido, t, conFoco }) {
  ctx.fillStyle = conAlfa(colores.descargado, 0.78);
  ctx.fillRect(0, 0, ANCHO, ALTO);

  texto(ctx, 'ELEGÍ TU BANDO', ANCHO / 2, 140, {
    fuente: '700 44px ' + fuentes.titulo, color: colores.textoClaro, alinear: 'center', espaciado: 6, brillo: colores.destino, desenfoque: 20,
  });
  texto(ctx, 'Saltá una ficha sobre otra para descargarla. Ganás si queda un solo nodo activo.', ANCHO / 2, 176, {
    fuente: '400 16px ' + fuentes.ui, color: colores.textoTenue, alinear: 'center',
  });

  ORDEN_BANDOS.forEach((clave) => {
    dibujarTarjeta(ctx, clave, recursos, colores, fuentes, clave === elegido, t);
  });
  if (conFoco) dibujarFocoTarjeta(ctx, BANDOS[elegido].tarjeta, colores);

  texto(ctx, 'Hacé click en una tarjeta, o usá las flechas y Enter.', ANCHO / 2, 620, {
    fuente: '400 15px ' + fuentes.ui, color: colores.textoTenue, alinear: 'center',
  });
}

// ---------------------------------------------------------------
// Pantallas de fin (Fase 3c)
// ---------------------------------------------------------------
