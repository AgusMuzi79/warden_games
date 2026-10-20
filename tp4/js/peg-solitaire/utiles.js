// utiles.js — Funciones chicas que usan varios módulos del Peg
//
// Qué hace: junta cálculos sueltos (limitar un número, suavizar una
// animación, pasar milisegundos a mm:ss) y algunos ayudantes del navegador
// (crear un canvas fuera de pantalla, cargar una imagen, leer un token CSS).
// Por qué un archivo aparte: así cada módulo del juego importa solo lo que
// necesita y no se repite el mismo código en dos lugares.
//
// Las funciones que tocan el navegador (document, window) solo lo hacen
// cuando se las llama. Por eso este archivo se puede importar desde Node
// para probar la lógica sin un navegador.

/**
 * Limita un valor al rango [minimo, maximo].
 * @param {number} valor
 * @param {number} [minimo=0]
 * @param {number} [maximo=1]
 * @returns {number}
 */
export function clamp(valor, minimo = 0, maximo = 1) {
  return Math.max(minimo, Math.min(maximo, valor));
}

/**
 * Curva de suavizado: arranca rápido y frena al final.
 * @param {number} t avance de la animación, de 0 a 1
 * @returns {number}
 */
export function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Pasa milisegundos a texto mm:ss. Redondea para arriba, como un reloj
 * de cuenta regresiva: con 0,4 s restantes todavía muestra 00:01.
 * @param {number} ms
 * @returns {string}
 */
export function formatearTiempo(ms) {
  const segundos = Math.max(0, Math.ceil(ms / 1000));
  const minutos = String(Math.floor(segundos / 60)).padStart(2, '0');
  const resto = String(segundos % 60).padStart(2, '0');
  return minutos + ':' + resto;
}

/**
 * Indica si el punto (x, y) cae dentro de un rectángulo { x, y, w, h }.
 * @param {number} x
 * @param {number} y
 * @param {{x: number, y: number, w: number, h: number}} rect
 * @returns {boolean}
 */
export function enRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

/**
 * Crea un canvas fuera de pantalla, multiplicado por el DPR para que se vea
 * nítido en pantallas de alta densidad. Se dibuja en él con medidas lógicas
 * (ancho x alto) porque el contexto ya viene escalado.
 * @param {number} ancho ancho lógico en px
 * @param {number} alto alto lógico en px
 * @param {number} dpr densidad de píxeles a usar
 * @returns {{canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D}}
 */
export function crearCanvas(ancho, alto, dpr) {
  const canvas = document.createElement('canvas');
  canvas.width = ancho * dpr;
  canvas.height = alto * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { canvas, ctx };
}

/**
 * Carga una imagen desde una ruta y resuelve la promesa cuando está lista.
 * @param {string} src
 * @returns {Promise<HTMLImageElement>}
 */
export function cargarImagen(src) {
  return new Promise((resolve, reject) => {
    const imagen = new Image();
    imagen.onload = () => resolve(imagen);
    imagen.onerror = () => reject(new Error('No se pudo cargar ' + src));
    imagen.src = src;
  });
}

/**
 * Generador de números pseudoaleatorios con semilla (algoritmo mulberry32).
 * Con la misma semilla da siempre la misma secuencia, así los dibujos
 * "al azar" del tablero salen iguales en cada carga.
 * @param {number} semilla
 * @returns {() => number} función que devuelve un número entre 0 y 1
 */
export function mulberry32(semilla) {
  return function () {
    semilla |= 0;
    semilla = (semilla + 0x6D2B79F5) | 0;
    let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Lee el valor de un token CSS definido en :root (variables.css).
 * En el canvas no se puede usar var(), por eso se lee desde JS.
 * @param {string} nombre por ejemplo '--acento'
 * @returns {string}
 */
export function leerToken(nombre) {
  return getComputedStyle(document.documentElement).getPropertyValue(nombre).trim();
}

/**
 * Convierte un color hex (#RRGGBB) en rgba() con la transparencia dada.
 * @param {string} hex
 * @param {number} alfa de 0 a 1
 * @returns {string}
 */
export function conAlfa(hex, alfa) {
  const limpio = hex.replace('#', '');
  const r = parseInt(limpio.slice(0, 2), 16);
  const g = parseInt(limpio.slice(2, 4), 16);
  const b = parseInt(limpio.slice(4, 6), 16);
  return 'rgba(' + r + ',' + g + ',' + b + ',' + alfa + ')';
}

/**
 * Indica si la persona pidió menos movimiento en su sistema
 * (prefers-reduced-motion). Sin navegador devuelve false.
 * @returns {boolean}
 */
export function prefiereMenosMovimiento() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
