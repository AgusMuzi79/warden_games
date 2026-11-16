// spawner.js — Dónde y cómo aparece el próximo par edificio + cartel
//
// Funciones puras (no tocan el DOM): reciben el estado del spawner y
// devuelven números. Así se pueden probar sin navegador y se explican
// por separado de la vista.
//
// Reglas (ver docs/prompt-tp5-runner.md, "Obstáculos"):
// - separación horizontal al azar entre separacionMin y separacionMax;
// - el hueco arranca en huecoInicial y baja huecoBaja px por obstáculo
//   pasado, sin bajar de huecoMin;
// - el centro del hueco es al azar, pero no se aleja más de saltoMaxCentro
//   del anterior (siempre se puede llegar) y nunca deja el cartel o el
//   edificio más chicos que sus márgenes.

import { JUEGO, OBSTACULO } from './config.js';

/**
 * Estado inicial del spawner.
 * @param {() => number} [azar] generador entre 0 y 1 (Math.random por defecto;
 *   las pruebas pasan uno fijo para que el resultado sea repetible)
 * @returns {{ ultimoCentro: number|null, azar: () => number }}
 */
export function crearSpawner(azar = Math.random) {
  return { ultimoCentro: null, azar };
}

/**
 * Alto del hueco según cuántos obstáculos se pasaron.
 * @param {{ huecoInicial: number, huecoBaja: number, huecoMin: number }} modo
 * @param {number} pasados
 * @returns {number}
 */
export function altoHueco(modo, pasados) {
  return Math.max(modo.huecoMin, modo.huecoInicial - modo.huecoBaja * pasados);
}

/**
 * Calcula el próximo par y actualiza ultimoCentro.
 * @param {{ ultimoCentro: number|null, azar: () => number }} spawner
 * @param {object} modo uno de MODOS
 * @param {number} pasados obstáculos que la moto ya pasó
 * @returns {{ hueco: number, centro: number, separacion: number }}
 */
export function siguientePar(spawner, modo, pasados) {
  const hueco = altoHueco(modo, pasados);

  // Límites del centro para que arriba quede al menos margenArriba de
  // cartel y abajo al menos margenAbajo de edificio.
  const minimo = JUEGO.techo + OBSTACULO.margenArriba + hueco / 2;
  const maximo = JUEGO.suelo - OBSTACULO.margenAbajo - hueco / 2;

  // El primero sale cerca del medio; los siguientes, a no más de
  // saltoMaxCentro del anterior.
  const referencia = spawner.ultimoCentro ?? (minimo + maximo) / 2;
  const desde = Math.max(minimo, referencia - OBSTACULO.saltoMaxCentro);
  const hasta = Math.min(maximo, referencia + OBSTACULO.saltoMaxCentro);
  const centro = entre(desde, hasta, spawner.azar);

  spawner.ultimoCentro = centro;
  const separacion = entre(OBSTACULO.separacionMin, OBSTACULO.separacionMax, spawner.azar);
  return { hueco, centro, separacion };
}

/**
 * Elige un elemento de una lista al azar.
 * @template T
 * @param {T[]} lista
 * @param {() => number} azar
 * @returns {T}
 */
export function elegir(lista, azar) {
  return lista[Math.floor(azar() * lista.length)];
}

/**
 * Número al azar entre dos valores.
 * @param {number} desde
 * @param {number} hasta
 * @param {() => number} azar
 * @returns {number}
 */
export function entre(desde, hasta, azar) {
  return desde + azar() * (hasta - desde);
}
