// glitch.js — Piezas del efecto "glitch" que comparten el hackeo y la derrota
//
// Qué hace: dibuja un texto con aberración cromática (una copia naranja y
// otra cyan corridas a los costados, y la clara encima) y barras de colores
// al azar que se sortean de nuevo cada tanto.
// Por qué aparte: el cartel "SISTEMA HACKEADO" (hackeo.js) y el título
// "SISTEMA CORRUPTO" (pantallaDerrota.js) usan el mismo efecto con otros
// tamaños y tiempos. Así está escrito una sola vez y cada uno pasa sus números.
//
// Los colores salen de obtenerColores() (variables.css) y las
// transparencias se arman con conAlfa(). No hay colores escritos acá.

import { conAlfa } from '../utiles.js';
import { ALTO } from '../config.js';
import { texto } from './dibujo.js';

/**
 * Texto con aberración cromática: una copia naranja y otra cyan corridas a
 * los costados (y un poco arriba o abajo, al azar), y la clara encima, con
 * brillo.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} cadena el texto
 * @param {number} x centro del texto
 * @param {number} y
 * @param {Record<string, string>} colores
 * @param {object} opciones
 * @param {string} opciones.fuente fuente del canvas (por ejemplo '700 56px Orbitron')
 * @param {number} opciones.corrimiento cuántos px se separan las copias a los costados
 * @param {number} opciones.temblor hasta cuántos px saltan las copias arriba o abajo (0: quietas)
 * @param {number} [opciones.alfa] opacidad de todo el texto, de 0 a 1
 * @param {string} opciones.brillo color del brillo de la copia clara
 */
export function dibujarTextoGlitch(ctx, cadena, x, y, colores, { fuente, corrimiento, temblor, alfa = 1, brillo }) {
  const azar = () => (Math.random() - 0.5) * temblor;
  ctx.save();
  // 'lighter' suma los colores donde las copias se pisan.
  ctx.globalCompositeOperation = 'lighter';
  texto(ctx, cadena, x - corrimiento, y + azar(), {
    fuente, color: conAlfa(colores.activo, 0.85 * alfa), alinear: 'center', espaciado: 6,
  });
  texto(ctx, cadena, x + corrimiento, y - azar(), {
    fuente, color: conAlfa(colores.acento, 0.85 * alfa), alinear: 'center', espaciado: 6,
  });
  ctx.restore();
  texto(ctx, cadena, x, y, {
    fuente, color: conAlfa(colores.textoClaro, alfa), alinear: 'center', espaciado: 6,
    brillo, desenfoque: 24,
  });
}

/**
 * Barras de colores al azar. Se sortean de nuevo cada `cada` ms (no en cada
 * cuadro), así se ven como un parpadeo y no como ruido.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{en: number, lista: object[]}} barras estado de las barras (se actualiza al sortear de nuevo)
 * @param {number} t tiempo actual en ms
 * @param {Record<string, string>} colores
 * @param {object} opciones
 * @param {number} opciones.cada cada cuántos ms se sortean de nuevo
 * @param {number} opciones.cantidad cuántas barras hay
 * @param {number} opciones.x borde izquierdo de la zona donde aparecen
 * @param {number} opciones.ancho ancho de esa zona (también el de las barras más largas)
 * @param {number} opciones.altoMax alto máximo extra de cada barra (mínimo 2 px)
 * @param {number} opciones.alfa opacidad de las barras
 */
export function dibujarBarrasGlitch(ctx, barras, t, colores, { cada, cantidad, x, ancho, altoMax, alfa }) {
  if (t - barras.en > cada) {
    barras.en = t;
    const tonos = [colores.activo, colores.acento, colores.destino];
    barras.lista = Array.from({ length: cantidad }, () => ({
      x: x + Math.random() * ancho,
      y: Math.random() * ALTO,
      w: 40 + Math.random() * (Math.random() < 0.15 ? ancho : 200),
      h: 2 + Math.random() * altoMax,
      color: tonos[Math.floor(Math.random() * tonos.length)],
    }));
  }
  ctx.save();
  ctx.globalAlpha = alfa;
  barras.lista.forEach((barra) => {
    ctx.fillStyle = barra.color;
    ctx.fillRect(barra.x, barra.y, barra.w, barra.h);
  });
  ctx.restore();
}
