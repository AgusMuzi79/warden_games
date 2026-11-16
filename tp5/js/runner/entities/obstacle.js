// obstacle.js — Un par edificio (abajo) + cartel colgante (arriba)
//
// Entre los dos queda el hueco por el que pasa la moto. El par entero se
// mueve con un solo translate3d en x; las partes de adentro (edificio,
// estructura, cartel y hitboxes) se ubican una sola vez al crearlo.

import { JUEGO, OBSTACULO } from '../config.js';
import { crearVistaHitbox } from '../collision.js';

/**
 * Crea el estado y el DOM de un par.
 * @param {number} x borde izquierdo (coordenadas del juego)
 * @param {number} hueco alto del hueco
 * @param {number} centro y del centro del hueco
 * @param {{ src: string, ancho: number, alto: number }} edificio uno de OBSTACULO.edificios
 * @param {{ src: string, frames: number, frameAncho: number, alto: number, escala: number }} cartel
 * @returns {object}
 */
export function crearObstaculo(x, hueco, centro, edificio, cartel) {
  const ancho = edificio.ancho;
  const arriba = centro - hueco / 2;   // y donde termina el cartel
  const abajo = centro + hueco / 2;    // y donde empieza el edificio
  const m = OBSTACULO.hitboxMargen;

  const anchoCartel = cartel.frameAncho * cartel.escala;

  // Hitboxes relativas a la esquina de arriba a la izquierda del par.
  const cajas = [
    // Cartel + estructura: lo que cuelga del techo, centrado y del ancho
    // del cartel (es más angosto que el edificio).
    { dx: (ancho - anchoCartel + m) / 2, dy: 0, ancho: anchoCartel - m, alto: arriba - m / 2 },
    // Edificio: empieza un poco más abajo por las antenas del tope.
    {
      dx: m,
      dy: abajo + OBSTACULO.hitboxMargenTope,
      ancho: ancho - 2 * m,
      alto: JUEGO.suelo - abajo - OBSTACULO.hitboxMargenTope,
    },
  ];

  const obstaculo = {
    x, ancho, arriba, abajo, cajas,
    pasado: false,     // ya sumó su punto
    tiempoChoque: 0,   // segundos que le quedan a .is-hit
    elemento: crearVista(ancho, arriba, abajo, edificio, cartel, cajas),
  };
  return obstaculo;
}

/**
 * Arma el DOM del par (una sola vez).
 * @param {number} ancho ancho del par (el del edificio)
 * @param {number} arriba y donde termina el cartel
 * @param {number} abajo y donde empieza el edificio
 * @param {object} edificio
 * @param {object} cartel
 * @param {object[]} cajas hitboxes relativas, para el modo debug
 * @returns {HTMLDivElement}
 */
function crearVista(ancho, arriba, abajo, edificio, cartel, cajas) {
  const elemento = document.createElement('div');
  elemento.className = 'obstacle';
  elemento.style.width = `${ancho}px`;

  // Arriba: estructura que cuelga del techo con el cartel en la punta.
  const superior = document.createElement('div');
  superior.className = 'obstacle__top';
  superior.style.height = `${arriba}px`;
  const anchoCartel = cartel.frameAncho * cartel.escala;
  superior.style.setProperty('--ancho-cartel', `${anchoCartel}px`);
  const altoCartel = cartel.alto * cartel.escala;

  const banner = document.createElement('div');
  banner.className = 'obstacle__banner';
  banner.style.width = `${anchoCartel}px`;
  banner.style.setProperty('--img', urlCss(cartel.src));
  banner.style.setProperty('--frames', cartel.frames);
  banner.style.setProperty('--frame-w', `${anchoCartel}px`);
  banner.style.setProperty('--alto', `${altoCartel}px`);
  superior.append(banner);

  // Abajo: el edificio, desde el borde del hueco hasta el suelo.
  const inferior = document.createElement('div');
  inferior.className = 'obstacle__bottom';
  inferior.style.height = `${JUEGO.suelo - abajo}px`;
  inferior.style.transform = `translate3d(0, ${abajo}px, 0)`;
  inferior.style.setProperty('--img', urlCss(edificio.src));
  inferior.style.setProperty('--img-alto', `${edificio.alto}px`);

  elemento.append(superior, inferior, ...cajas.map(crearVistaHitbox));
  return elemento;
}

/**
 * url() para una variable CSS. La ruta se pasa a absoluta porque un url()
 * guardado en una variable se resuelve contra el CSS que la usa
 * (css/runner.css), no contra la página: "assets/..." apuntaría a
 * "css/assets/..." y la imagen no cargaría.
 * @param {string} ruta relativa a runner.html
 * @returns {string}
 */
function urlCss(ruta) {
  return `url("${new URL(ruta, document.baseURI).href}")`;
}

/**
 * Mueve el par con el mundo y descuenta su temporizador de choque.
 * @param {object} obstaculo
 * @param {number} velocidad px/s del mundo
 * @param {number} dt
 */
export function actualizarObstaculo(obstaculo, velocidad, dt) {
  obstaculo.x -= velocidad * dt;
  obstaculo.tiempoChoque = Math.max(0, obstaculo.tiempoChoque - dt);
}

/**
 * Escribe la posición y el estado.
 * @param {object} obstaculo
 */
export function dibujarObstaculo(obstaculo) {
  obstaculo.elemento.style.transform = `translate3d(${Math.round(obstaculo.x)}px, 0, 0)`;
  obstaculo.elemento.classList.toggle('is-hit', obstaculo.tiempoChoque > 0);
}

/**
 * ¿Ya salió por la izquierda?
 * @param {object} obstaculo
 * @returns {boolean}
 */
export function salioDePantalla(obstaculo) {
  return obstaculo.x + obstaculo.ancho < 0;
}
