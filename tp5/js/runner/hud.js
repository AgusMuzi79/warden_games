// hud.js — Puntaje, vidas, modo y progreso
//
// En Infinito no hay meta, así que la barra de progreso se oculta.
// Recibe datos del estado y los escribe en el HUD solo cuando cambian
// (guarda el último valor dibujado): así no se toca el DOM en cada cuadro
// si no hace falta.

import { JUEGO } from './config.js';

/**
 * Crea el HUD.
 * @param {HTMLElement} raiz .hud (adentro están #score, #lives, #mode y #progress)
 * @returns {{ dibujar: (datos: { puntaje: number, vidas: number, modo: string, conMeta: boolean }) => void }}
 */
export function crearHud(raiz) {
  const puntaje = raiz.querySelector('#score');
  const vidas = raiz.querySelector('#lives');
  const modo = raiz.querySelector('#mode');
  const progreso = raiz.querySelector('#progress');
  const barra = progreso.querySelector('.hud__progress-bar');
  progreso.setAttribute('aria-valuemax', JUEGO.puntajeObjetivo);

  // Últimos valores dibujados (null = todavía nada).
  const ultimo = { puntaje: null, vidas: null, modo: null, conMeta: null };

  return {
    /**
     * Actualiza lo que haya cambiado.
     * @param {{ puntaje: number, vidas: number, modo: string, conMeta: boolean }} datos
     */
    dibujar(datos) {
      if (datos.conMeta !== ultimo.conMeta) {
        ultimo.conMeta = datos.conMeta;
        progreso.hidden = !datos.conMeta;
      }
      if (datos.puntaje !== ultimo.puntaje) {
        ultimo.puntaje = datos.puntaje;
        puntaje.textContent = datos.puntaje;
        const avance = Math.min(1, datos.puntaje / JUEGO.puntajeObjetivo);
        barra.style.transform = `scaleX(${avance})`;
        progreso.setAttribute('aria-valuenow', Math.min(datos.puntaje, JUEGO.puntajeObjetivo));
      }
      if (datos.vidas !== ultimo.vidas) {
        ultimo.vidas = datos.vidas;
        dibujarVidas(vidas, datos.vidas);
      }
      if (datos.modo !== ultimo.modo) {
        ultimo.modo = datos.modo;
        modo.textContent = datos.modo;
      }
    },
  };
}

/**
 * Un corazón por vida; en Fácil (vidas infinitas), el símbolo ∞.
 * @param {HTMLElement} contenedor #lives
 * @param {number} cantidad
 */
function dibujarVidas(contenedor, cantidad) {
  if (cantidad === Infinity) {
    contenedor.innerHTML = '<span class="hud__vida hud__vida--infinita">∞</span>';
    contenedor.setAttribute('aria-label', 'Vidas: infinitas');
    return;
  }
  contenedor.innerHTML = '<i class="ph ph-heart hud__vida" aria-hidden="true"></i>'.repeat(cantidad);
  contenedor.setAttribute('aria-label', `Vidas: ${cantidad}`);
}
