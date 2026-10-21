// pantallaVictoria.js — Pantalla de victoria "SISTEMA RESTAURADO"
//
// Qué hace: dibuja la pantalla que aparece al ganar: ondas que salen del último
// nodo, el nodo latiendo encima del velo, el título que se revela con un
// barrido desde el centro, y después el motivo, las estadísticas y el botón.
// Solo dibuja: los datos de cómo terminó la partida llegan en el objeto "fin"
// (ver finComun.js) y el controlador se los pasa a la vista.
//
// Los colores salen de obtenerColores() (variables.css) y las
// transparencias se arman con conAlfa(). No hay colores escritos acá.

import { conAlfa, clamp, easeOut, prefiereMenosMovimiento } from '../utiles.js';
import { ANCHO, ALTO } from '../config.js';
import { texto, dibujarScanlines, dibujarFicha, centroDeCelda } from './dibujo.js';
import {
  motivoDe, alturaTituloVictoria, cajaBotonFin, lineaEstadisticas, dibujarBotonFin,
} from './finComun.js';

/**
 * Pantalla de victoria "SISTEMA RESTAURADO": ondas cyan que salen del
 * último nodo, el nodo latiendo encima del velo, el título que se revela
 * con un barrido desde el centro, y después el motivo, las estadísticas y
 * el botón, que aparecen de a poco. Con movimiento reducido se ve todo
 * quieto desde el primer cuadro.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} recursos lo que devuelve prepararRecursos()
 * @param {Record<string, string>} colores
 * @param {{titulo: string, ui: string}} fuentes
 * @param {object} fin el objeto de la pantalla de fin
 * @param {{t: number, imagen: HTMLCanvasElement, encendido: boolean, conFoco: boolean}} estado
 *   imagen es la ficha del bando con la que se dibuja el nodo ganador
 */
export function dibujarVictoria(ctx, recursos, colores, fuentes, fin, { t, imagen, encendido, conFoco }) {
  const quieto = prefiereMenosMovimiento();
  const pasado = quieto ? Infinity : t - fin.mostradoEn;
  ctx.fillStyle = conAlfa(colores.fondo, 0.7 * clamp(pasado / 500));
  ctx.fillRect(0, 0, ANCHO, ALTO);

  // Tres ondas que se agrandan desde el último nodo y se apagan.
  const nodo = centroDeCelda(fin.ultima.fila, fin.ultima.col);
  if (!quieto) {
    ctx.save();
    ctx.strokeStyle = colores.acento;
    ctx.shadowColor = colores.acento;
    ctx.shadowBlur = 12;
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const avance = (pasado / 1600 + i / 3) % 1;
      ctx.globalAlpha = (1 - avance) * 0.6;
      ctx.beginPath();
      ctx.arc(nodo.x, nodo.y, 40 + avance * 460, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
  const pulso = quieto ? 0 : (Math.sin(t * 0.004) + 1) / 2;
  dibujarFicha(ctx, imagen, nodo.x, nodo.y, 1.1 + 0.06 * pulso);

  // Título revelado con un barrido desde el centro hacia los lados.
  const centroX = ANCHO / 2;
  const y = alturaTituloVictoria(fin);
  const revelado = easeOut(clamp((pasado - 200) / 700));
  const mitad = (ANCHO / 2) * revelado;
  ctx.save();
  ctx.beginPath();
  ctx.rect(centroX - mitad, y - 80, mitad * 2, 110);
  ctx.clip();
  texto(ctx, 'SISTEMA RESTAURADO', centroX, y, {
    fuente: '700 58px ' + fuentes.titulo, color: colores.textoClaro, alinear: 'center', espaciado: 6, brillo: colores.acento, desenfoque: 26,
  });
  ctx.restore();
  if (revelado < 1) {
    // Los dos bordes del barrido, como líneas de luz.
    ctx.save();
    ctx.fillStyle = colores.textoClaro;
    ctx.shadowColor = colores.acento;
    ctx.shadowBlur = 18;
    ctx.fillRect(centroX - mitad - 1, y - 80, 2, 110);
    ctx.fillRect(centroX + mitad - 1, y - 80, 2, 110);
    ctx.restore();
  }

  // El resto aparece cuando el barrido está terminando.
  ctx.save();
  ctx.globalAlpha = clamp((pasado - 700) / 400);
  texto(ctx, motivoDe(fin).etiqueta, centroX, y + 54, {
    fuente: '600 20px ' + fuentes.ui, color: colores.acento, alinear: 'center', espaciado: 6,
  });
  texto(ctx, lineaEstadisticas(fin), centroX, y + 92, {
    fuente: '700 16px ' + fuentes.ui, color: colores.textoTenue, alinear: 'center', espaciado: 2,
  });
  dibujarBotonFin(ctx, cajaBotonFin(fin), colores, fuentes, { encendido, conFoco });
  ctx.restore();

  dibujarScanlines(ctx, recursos);
}
