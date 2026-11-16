// game.js — Estado de la partida, update y render de cada cuadro
//
// Junta todas las piezas: en cada cuadro el loop llama a paso(dt), que
// primero actualiza el estado (física, choques) y después lo dibuja. El
// estado es un objeto JS; el DOM solo recibe transforms y clases (ver
// docs/tp5-contrato.md). main.js se encarga de las pantallas.
//
// Fases: 'menu' (sin partida), 'jugando', 'pausa', 'muriendo' (se ve la
// explosión antes de la pantalla de derrota) y 'fin'.

import { JUEGO, JUGADOR, MUNDO } from './config.js';
import { crearLoop } from './loop.js';
import { crearParallax } from './parallax.js';
import {
  crearJugador, impulsar as impulsarJugador, actualizarJugador, descontarTiempos,
  cajaJugador, prepararVistaJugador, dibujarJugador, centroVertical,
} from './entities/player.js';

/**
 * Crea el juego.
 * @param {{ juego: HTMLElement, capas: HTMLElement[], jugador: HTMLElement, hitboxJugador: HTMLElement }} dom
 * @param {(resultado: 'victoria' | 'derrota', puntaje: number) => void} alTerminar
 */
export function crearJuego(dom, alTerminar) {
  const estado = {
    fase: 'menu',
    modo: null,
    jugador: crearJugador(),
    tiempoSacudon: 0,
    tiempoFin: 0,       // cuenta regresiva de la fase 'muriendo'
    tiempoRalentizado: 0,
    debug: false,
  };
  const loop = crearLoop(paso);
  const parallax = crearParallax(dom.capas);

  prepararVistaJugador(dom.jugador, dom.hitboxJugador);
  dibujar();

  /**
   * Arranca una partida nueva en el modo elegido.
   * @param {string} claveModo 'facil' | 'normal' | 'dificil'
   */
  function iniciarPartida(claveModo) {
    estado.modo = claveModo;
    estado.jugador = crearJugador();
    estado.tiempoSacudon = 0;
    estado.tiempoFin = 0;
    estado.tiempoRalentizado = 0;
    parallax.reiniciar();
    estado.fase = 'jugando';
    dom.juego.classList.remove('is-paused');
    dibujar();
    loop.iniciar();
  }

  /**
   * Un cuadro del loop.
   * @param {number} dt segundos (ya con tope)
   */
  function paso(dt) {
    actualizar(dt);
    dibujar();
  }

  /**
   * Actualiza el estado.
   * @param {number} dt
   */
  function actualizar(dt) {
    estado.tiempoSacudon = Math.max(0, estado.tiempoSacudon - dt);

    if (estado.fase === 'muriendo') {
      // El mundo queda quieto; solo corren los tiempos de las animaciones.
      descontarTiempos(estado.jugador, dt);
      estado.tiempoFin -= dt;
      if (estado.tiempoFin <= 0) terminar('derrota');
      return;
    }
    if (estado.fase !== 'jugando') return;

    estado.tiempoRalentizado = Math.max(0, estado.tiempoRalentizado - dt);
    parallax.actualizar(velocidadMundo(), dt);
    actualizarJugador(estado.jugador, dt);
    revisarBordes();
  }

  /**
   * Velocidad actual del mundo en px/s: la base, o menos si un drone la
   * ralentizó. Todo lo que scrollea (capas y entidades) usa este número.
   * @returns {number}
   */
  function velocidadMundo() {
    const factor = estado.tiempoRalentizado > 0 ? MUNDO.factorRalentizado : 1;
    return MUNDO.velocidadBase * factor;
  }

  /** Techo y suelo cuentan como choque. */
  function revisarBordes() {
    const caja = cajaJugador(estado.jugador);
    if (caja.y < JUEGO.techo || caja.y + caja.alto > JUEGO.suelo) chocar();
  }

  /** Choque: animación de la moto y sacudón. Por ahora termina la partida. */
  function chocar() {
    const jugador = estado.jugador;
    jugador.tiempoChoque = JUGADOR.duracionChoque;
    jugador.vy = 0;
    estado.tiempoSacudon = JUEGO.duracionSacudon;
    estado.fase = 'muriendo';
    estado.tiempoFin = JUEGO.esperaDerrota;
  }

  /**
   * Fin de la partida: frena el loop y avisa a main.js.
   * @param {'victoria' | 'derrota'} resultado
   */
  function terminar(resultado) {
    estado.fase = 'fin';
    loop.detener();
    dibujar();
    alTerminar(resultado, 0);
  }

  /** Escribe el estado en el DOM. */
  function dibujar() {
    parallax.dibujar();
    dibujarJugador(estado.jugador, dom.jugador, dom.hitboxJugador);
    dom.juego.classList.toggle('is-shaking', estado.tiempoSacudon > 0);
  }

  return {
    iniciarPartida,
    /** @returns {string} fase actual */
    get fase() { return estado.fase; },
    /** @returns {string|null} modo de la última partida */
    get modo() { return estado.modo; },

    /**
     * Impulso de la moto. Solo funciona jugando.
     * @returns {boolean} true si se usó
     */
    impulsar() {
      if (estado.fase !== 'jugando') return false;
      impulsarJugador(estado.jugador);
      return true;
    },

    /**
     * Pausa (frena el loop y las animaciones CSS).
     * @returns {boolean} true si estaba jugando y se pausó
     */
    pausar() {
      if (estado.fase !== 'jugando') return false;
      estado.fase = 'pausa';
      loop.detener();
      dom.juego.classList.add('is-paused');
      return true;
    },

    /** Sale de la pausa. El loop arranca con dt = 0 (no hay salto). */
    reanudar() {
      if (estado.fase !== 'pausa') return;
      estado.fase = 'jugando';
      dom.juego.classList.remove('is-paused');
      loop.iniciar();
    },

    /** Deja la partida (botón "Cambiar modo" de la pausa). */
    abandonar() {
      loop.detener();
      estado.fase = 'menu';
      estado.jugador = crearJugador();
      estado.jugador.y = centroVertical();
      dom.juego.classList.remove('is-paused');
      dibujar();
    },

    /** Muestra u oculta las hitboxes (tecla H). */
    alternarDebug() {
      estado.debug = !estado.debug;
      dom.juego.classList.toggle('is-debug', estado.debug);
    },
  };
}
