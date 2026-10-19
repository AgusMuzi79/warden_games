// config.js — Medidas, tiempos, rutas, colores y fuentes del Peg
//
// Qué hace: junta en un solo lugar los números fijos del juego (tamaño del
// canvas, de la grilla, de las fichas), los tiempos de las animaciones y
// las rutas de las imágenes. Los colores y las fuentes no se escriben acá:
// se leen de variables.css, que es la fuente de verdad del sitio.
// Por qué: si hay que ajustar una medida se cambia un número en un archivo,
// sin buscarlo por todo el código.

import { leerToken } from './utiles.js';

// Tamaño lógico del canvas completo (el HUD va a los costados del tablero).
export const ANCHO = 1200;
export const ALTO = 760;

// El tablero es un cuadrado centrado en el canvas.
export const TAMANO_TABLERO = 760;
export const TABLERO_X = (ANCHO - TAMANO_TABLERO) / 2;

// Grilla de 7x7 celdas, centrada dentro del tablero.
export const CELDA = 92;
export const OFFSET = (TAMANO_TABLERO - 7 * CELDA) / 2; // 58 px

export const RADIO_FICHA = 33;
export const RADIO_HUECO = 22;
// Espacio extra alrededor de la imagen de la ficha para que entre el brillo.
export const PADDING_FICHA = 18;

// Límite de la partida: 5 minutos.
export const TIEMPO_LIMITE_MS = 5 * 60 * 1000;

// Duraciones de las animaciones, en milisegundos.
export const DURACION_VUELTA_MS = 220;   // la ficha vuelve a su casilla si el soltado no vale
export const DURACION_RECHAZO_MS = 300;  // la ficha sin movimientos tiembla
export const DURACION_TEMBLOR_MS = 200;  // el tablero tiembla al comer una ficha
export const DURACION_ESTELA_MS = 1400;  // lo que tarda en apagarse la estela
export const DEMORA_FIN_MS = 700;        // espera antes de mostrar el fin
export const DURACION_ONDA_MS = 500;     // onda expansiva de la ficha comida

// Efectos de la ficha comida (ver efectos.js).
export const CHISPAS_POR_EXPLOSION = 38;
export const FUERZA_TEMBLOR = 8;         // cuántos px se corre el tablero, como máximo
export const SEPARACION_SCANLINES = 3;   // una línea oscura cada 3 px

// Imágenes de las fichas. Son relativas al documento (juego.html).
export const FICHAS = {
  naranja: 'assets/img/ficha-naranja.png',
  cyan: 'assets/img/ficha-cyan.png',
  blanca: 'assets/img/ficha-blanca.png',
};

// Bandos (como en Tron: Legacy, cyan son los Usuarios y naranja el ejército
// de Clu). Cada bando dice qué imagen usan sus fichas normales, cuál la
// ficha levantada (y los fantasmas de destino), con qué color de
// obtenerColores() se dibuja su tarjeta y dónde va esa tarjeta en la
// pantalla de selección (coordenadas lógicas de 1200x760).
// titulo se escribe en el canvas; nombre es el que se lee en los avisos.
export const BANDOS = {
  usuarios: {
    titulo: 'USUARIOS',
    nombre: 'Usuarios',
    lema: 'Luchá por los usuarios',
    ficha: 'cyan',
    fichaLevantada: 'blanca',
    color: 'acento',
    tarjeta: { x: ANCHO / 2 - 330, y: 210, w: 300, h: 360 },
  },
  clu: {
    titulo: 'PROGRAMAS DE CLU',
    nombre: 'Programas de Clu',
    lema: 'La perfección del sistema',
    ficha: 'naranja',
    fichaLevantada: 'cyan',
    color: 'activo',
    tarjeta: { x: ANCHO / 2 + 30, y: 210, w: 300, h: 360 },
  },
};

// Orden de las tarjetas de izquierda a derecha (lo usan las flechas del teclado).
export const ORDEN_BANDOS = ['usuarios', 'clu'];

/**
 * Densidad de píxeles de la pantalla, con un tope de 2 (más no se nota y
 * gasta memoria). Se calcula al llamarla, así el módulo carga sin navegador.
 * @returns {number}
 */
export function obtenerDpr() {
  if (typeof window === 'undefined') return 1;
  return Math.min(window.devicePixelRatio || 1, 2);
}

/**
 * Lee de variables.css los colores que usa el canvas.
 * @returns {Record<string, string>}
 */
export function obtenerColores() {
  return {
    acento: leerToken('--acento'),
    fondo: leerToken('--fondo'),
    destino: leerToken('--tablero-destino'),
    textoClaro: leerToken('--acento-c3'),
    activo: leerToken('--tablero-activo'),
    descargado: leerToken('--tablero-descargado'),
    textoTenue: leerToken('--texto-tenue'),
    placa: leerToken('--placa'),
    placaBorde: leerToken('--placa-borde'),
  };
}

/**
 * Lee de variables.css las fuentes: Orbitron para títulos y Roboto Flex
 * para todo lo demás (textos, números del HUD).
 * @returns {{titulo: string, ui: string}}
 */
export function obtenerFuentes() {
  return {
    titulo: leerToken('--font-display'),
    ui: leerToken('--font-ui'),
  };
}
