// pantallaDerrota.js — Pantalla de derrota "SISTEMA CORRUPTO"
//
// Qué hace: dibuja la pantalla que aparece al perder (sin saltos válidos o sin
// tiempo): el canvas se rompe en franjas, aparecen barras de colores, el
// título tiembla y abajo van el motivo, las estadísticas y el botón.
// Solo dibuja: los datos de cómo terminó la partida llegan en el objeto "fin"
// (ver finComun.js) y el controlador se los pasa a la vista.
//
// Los colores salen de obtenerColores() (variables.css) y las
// transparencias se arman con conAlfa(). No hay colores escritos acá.

import { conAlfa, clamp, prefiereMenosMovimiento } from '../utiles.js';
import { ANCHO, ALTO } from '../config.js';
import { texto, dibujarScanlines } from './dibujo.js';
import { dibujarTextoGlitch, dibujarBarrasGlitch } from './glitch.js';
import { MOTIVOS, cajaBotonFin, lineaEstadisticas, dibujarBotonFin } from './finComun.js';

// Barras de colores de la derrota. Se sortean de nuevo cada 90 ms (no en
// cada cuadro), así se ven como un parpadeo y no como ruido.
const barrasGlitch = { en: -Infinity, lista: [] };

/**
 * Efecto de pantalla rota de la derrota: franjas del propio canvas corridas
 * de lado y barras de colores. Es fuerte al principio y después vuelve en
 * ráfagas cortas.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Record<string, string>} colores
 * @param {number} t tiempo actual en ms
 * @param {boolean} fuerte si es un momento de ráfaga
 * @param {number} dpr densidad de píxeles del canvas
 */
function dibujarRotura(ctx, colores, t, fuerte, dpr) {
  // Copia pedazos del canvas sobre sí mismo. La fuente se mide en píxeles
  // reales (por eso el dpr) y el destino en medidas lógicas.
  const franjas = fuerte ? 9 : 2;
  for (let i = 0; i < franjas; i++) {
    const y = Math.random() * ALTO;
    const alto = 4 + Math.random() * (fuerte ? 40 : 12);
    const corrimiento = (Math.random() - 0.5) * (fuerte ? 90 : 24);
    ctx.drawImage(ctx.canvas, 0, y * dpr, ANCHO * dpr, alto * dpr, corrimiento, y, ANCHO, alto);
  }

  dibujarBarrasGlitch(ctx, barrasGlitch, t, colores, {
    cada: 90, cantidad: fuerte ? 14 : 6, x: 0, ancho: ANCHO, altoMax: 10, alfa: 0.7,
  });
}

/**
 * Pantalla de derrota "SISTEMA CORRUPTO": el canvas se rompe en franjas,
 * aparecen barras de colores, el título tiembla y abajo van el motivo
 * (en una caja), las estadísticas y el botón. Con movimiento reducido se
 * ve quieta desde el primer cuadro.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} recursos lo que devuelve prepararRecursos()
 * @param {Record<string, string>} colores
 * @param {{titulo: string, ui: string}} fuentes
 * @param {object} fin el objeto de la pantalla de fin
 * @param {{t: number, dpr: number, encendido: boolean, conFoco: boolean}} estado
 */
export function dibujarDerrota(ctx, recursos, colores, fuentes, fin, { t, dpr, encendido, conFoco }) {
  const quieto = prefiereMenosMovimiento();
  const pasado = t - fin.mostradoEn;
  const fuerte = !quieto && (pasado < 600 || pasado % 1800 < 140);
  if (!quieto) dibujarRotura(ctx, colores, t, fuerte, dpr);

  // Velo que oscurece en medio segundo (de golpe con movimiento reducido).
  ctx.fillStyle = conAlfa(colores.descargado, 0.62 * (quieto ? 1 : clamp(pasado / 500)));
  ctx.fillRect(0, 0, ANCHO, ALTO);

  const centroX = ANCHO / 2;
  // Título con aberración cromática (ver glitch.js); quieto con movimiento reducido.
  const corrimiento = fuerte ? 9 : 2.5;
  dibujarTextoGlitch(ctx, 'SISTEMA CORRUPTO', centroX, ALTO / 2 - 40, colores, {
    fuente: '700 62px ' + fuentes.titulo,
    corrimiento,
    temblor: quieto ? 0 : corrimiento,
    brillo: colores.activo,
  });

  // Caja con el motivo, del ancho del texto.
  const etiqueta = MOTIVOS[fin.motivo].etiqueta;
  const fuenteMotivo = '600 20px ' + fuentes.ui;
  ctx.save();
  ctx.font = fuenteMotivo;
  if ('letterSpacing' in ctx) ctx.letterSpacing = '6px';
  const anchoCaja = ctx.measureText(etiqueta).width + 56;
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(centroX - anchoCaja / 2, ALTO / 2 + 6, anchoCaja, 50, 6);
  ctx.fillStyle = conAlfa(colores.descargado, 0.85);
  ctx.fill();
  ctx.strokeStyle = conAlfa(colores.activo, 0.7);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
  // El +3 compensa el espaciado que queda después de la última letra.
  texto(ctx, etiqueta, centroX + 3, ALTO / 2 + 38, {
    fuente: fuenteMotivo, color: colores.textoClaro, alinear: 'center', espaciado: 6,
  });

  texto(ctx, lineaEstadisticas(fin), centroX, ALTO / 2 + 92, {
    fuente: '700 16px ' + fuentes.ui, color: colores.textoTenue, alinear: 'center', espaciado: 2,
  });
  dibujarBotonFin(ctx, cajaBotonFin(fin), colores, fuentes, { encendido, conFoco });

  dibujarScanlines(ctx, recursos);
}
