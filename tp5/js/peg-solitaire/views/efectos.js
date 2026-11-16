// efectos.js — Efectos visuales del Peg: explosión y temblor
//
// Qué hace: guarda y dibuja los efectos que duran un rato y después se
// apagan solos:
//   - la explosión de la ficha comida: chispas, un destello, una onda que se
//     expande y la ficha que se infla y desaparece;
//   - el temblor del tablero al comer una ficha.
// Por qué una clase aparte: PegView solo avisa "explotó acá", y esta clase se encarga de recordar cada efecto, dibujarlo
// y borrarlo cuando termina.
//
// Movimiento reducido: si la persona prefiere menos movimiento
// (prefers-reduced-motion), no se crea ningún efecto y el tablero no tiembla.
// El juego funciona igual, solo sin animaciones.
//
// Los colores llegan desde PegView (salen de obtenerColores()); acá solo se
// aclaran o se les pone transparencia.

import { conAlfa, easeOut, clamp, prefiereMenosMovimiento } from '../utiles.js';
import {
  DURACION_TEMBLOR_MS, DURACION_ONDA_MS,
  CHISPAS_POR_EXPLOSION, FUERZA_TEMBLOR,
} from '../config.js';
import { dibujarFicha } from './dibujo.js';

const VUELTA = Math.PI * 2;

/**
 * Aclara un color hex (#RRGGBB) mezclándolo con blanco.
 * @param {string} hex
 * @param {number} cantidad de 0 (igual) a 1 (blanco)
 * @returns {string} el color nuevo, también en hex
 */
function aclarar(hex, cantidad) {
  const limpio = hex.replace('#', '');
  let resultado = '#';
  for (let i = 0; i < 6; i += 2) {
    const canal = parseInt(limpio.slice(i, i + 2), 16);
    const mezcla = Math.round(canal + (255 - canal) * cantidad);
    resultado += mezcla.toString(16).padStart(2, '0');
  }
  return resultado;
}

/**
 * Efectos visuales pasajeros del Peg (explosión, onda y temblor):
 * los guarda, los dibuja y los borra cuando terminan.
 */
export class Efectos {
  /**
   * Arranca sin ningún efecto activo.
   */
  constructor() {
    this.limpiar();
  }

  /**
   * Borra todos los efectos (al reiniciar o al elegir bando).
   */
  limpiar() {
    this.chispas = [];        // { x, y, inicio, angulo, velocidad, vida, largo, grosor, color }
    this.ondas = [];          // { x, y, inicio, color, claro, imagen }
    this.temblorHasta = 0;    // hasta cuándo tiembla el tablero
  }

  /**
   * Explosión de la ficha comida: chispas, onda, destello y temblor.
   * @param {number} x centro de la casilla comida
   * @param {number} y
   * @param {string} color color del bando, en hex
   * @param {HTMLCanvasElement} imagen ficha comida (se infla y desaparece)
   * @param {number} t tiempo actual en ms
   */
  explotar(x, y, color, imagen, t) {
    if (prefiereMenosMovimiento()) return;
    const claro = aclarar(color, 0.75);
    for (let i = 0; i < CHISPAS_POR_EXPLOSION; i++) {
      this.chispas.push({
        x, y, inicio: t,
        angulo: Math.random() * VUELTA,
        velocidad: 0.25 + Math.random() * 0.5, // px por ms
        vida: 450 + Math.random() * 400,
        largo: 8 + Math.random() * 16,
        grosor: 1.5 + Math.random() * 1.5,
        // 3 de cada 4 chispas tienen el color del bando; el resto, uno más claro.
        color: Math.random() < 0.75 ? color : claro,
      });
    }
    this.ondas.push({ x, y, inicio: t, color, claro, imagen });
    this.temblar(t);
  }

  /**
   * Hace temblar el tablero un rato corto.
   * @param {number} t tiempo actual en ms
   */
  temblar(t) {
    if (prefiereMenosMovimiento()) return;
    this.temblorHasta = t + DURACION_TEMBLOR_MS;
  }

  /**
   * Cuánto hay que correr el tablero en este cuadro por el temblor. Se va
   * calmando hasta llegar a cero.
   * @param {number} t tiempo actual en ms
   * @returns {{x: number, y: number}}
   */
  desplazamiento(t) {
    if (t >= this.temblorHasta) return { x: 0, y: 0 };
    const fuerza = FUERZA_TEMBLOR * (this.temblorHasta - t) / DURACION_TEMBLOR_MS;
    return { x: (Math.random() - 0.5) * fuerza, y: (Math.random() - 0.5) * fuerza };
  }

  /**
   * Borra lo que ya terminó: chispas y ondas viejas.
   * @param {number} t tiempo actual en ms
   */
  actualizar(t) {
    this.chispas = this.chispas.filter((c) => t - c.inicio < c.vida);
    this.ondas = this.ondas.filter((o) => t - o.inicio < DURACION_ONDA_MS);
  }

  /**
   * Dibuja los efectos en el orden del prototipo: ondas y chispas.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} t tiempo actual en ms
   */
  dibujar(ctx, t) {
    this.dibujarOndas(ctx, t);
    this.dibujarChispas(ctx, t);
  }

  /**
   * Onda expansiva: la ficha comida se infla y desaparece, un destello en
   * el centro y un anillo que crece y se apaga.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} t
   */
  dibujarOndas(ctx, t) {
    for (const onda of this.ondas) {
      // Sin clamp: actualizar() ya borró las ondas terminadas y t sale del
      // mismo reloj que inicio (ver PegController.cuadro), así que el avance
      // queda entre 0 y 1.
      const avance = (t - onda.inicio) / DURACION_ONDA_MS;
      // La ficha usa el primer 40 % de la onda para inflarse y desaparecer.
      const avanceFicha = clamp(avance / 0.4);
      if (avanceFicha < 1) {
        dibujarFicha(ctx, onda.imagen, onda.x, onda.y, 1 + 0.4 * avanceFicha, 1 - avanceFicha);
      }
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const destello = ctx.createRadialGradient(onda.x, onda.y, 0, onda.x, onda.y, 50);
      destello.addColorStop(0, conAlfa(onda.claro, 0.9 * (1 - avance)));
      destello.addColorStop(1, conAlfa(onda.claro, 0));
      ctx.fillStyle = destello;
      ctx.beginPath();
      ctx.arc(onda.x, onda.y, 50, 0, VUELTA);
      ctx.fill();
      ctx.globalAlpha = 1 - avance;
      ctx.strokeStyle = onda.color;
      ctx.lineWidth = 3 * (1 - avance) + 0.5;
      ctx.beginPath();
      ctx.arc(onda.x, onda.y, 20 + easeOut(avance) * 60, 0, VUELTA);
      ctx.stroke();
      ctx.restore();
    }
  }

  /**
   * Chispas: cada una sale en línea recta, frena y se apaga.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} t
   */
  dibujarChispas(ctx, t) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (const chispa of this.chispas) {
      const edad = t - chispa.inicio;
      const avance = edad / chispa.vida;
      const distancia = chispa.velocidad * edad * (1 - 0.5 * avance); // va frenando
      const cola = Math.max(0, distancia - chispa.largo);
      const cos = Math.cos(chispa.angulo);
      const sen = Math.sin(chispa.angulo);
      ctx.globalAlpha = 1 - avance;
      ctx.strokeStyle = chispa.color;
      ctx.lineWidth = chispa.grosor;
      ctx.beginPath();
      ctx.moveTo(chispa.x + cos * cola, chispa.y + sen * cola);
      ctx.lineTo(chispa.x + cos * distancia, chispa.y + sen * distancia);
      ctx.stroke();
    }
    ctx.restore();
  }
}
