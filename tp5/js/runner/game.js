// game.js — Estado de la partida, update y render de cada cuadro
//
// Junta todas las piezas: en cada cuadro el loop llama a paso(dt), que
// primero actualiza el estado (física, spawner, choques, puntaje) y después
// lo dibuja. El estado es un objeto JS; el DOM solo recibe transforms y
// clases (ver docs/tp5-contrato.md). main.js se encarga de las pantallas.
//
// Fases: 'menu' (sin partida), 'jugando', 'pausa', 'muriendo' (se ve la
// explosión antes de la pantalla de derrota) y 'fin'.

import { JUEGO, JUGADOR, MUNDO, OBSTACULO, MODOS } from './config.js';
import { crearLoop } from './loop.js';
import { crearParallax } from './parallax.js';
import { crearHud } from './hud.js';
import { crearSpawner, siguientePar, elegir } from './spawner.js';
import { seTocan, cajaEnMundo } from './collision.js';
import {
  crearJugador, impulsar as impulsarJugador, actualizarJugador, descontarTiempos,
  cajaJugador, prepararVistaJugador, dibujarJugador,
} from './entities/player.js';
import {
  crearObstaculo, actualizarObstaculo, dibujarObstaculo, salioDePantalla,
} from './entities/obstacle.js';

/**
 * Crea el juego.
 * @param {{
 *   juego: HTMLElement, capas: HTMLElement[], mundo: HTMLElement,
 *   jugador: HTMLElement, hitboxJugador: HTMLElement, hud: HTMLElement,
 * }} dom
 * @param {(resultado: 'victoria' | 'derrota', puntaje: number) => void} alTerminar
 */
export function crearJuego(dom, alTerminar) {
  const estado = crearEstado('normal');
  estado.fase = 'menu';
  const loop = crearLoop(paso);
  const parallax = crearParallax(dom.capas);
  const hud = crearHud(dom.hud);

  prepararVistaJugador(dom.jugador, dom.hitboxJugador);
  dibujar();

  /**
   * Estado de una partida nueva.
   * @param {string} claveModo
   * @returns {object}
   */
  function crearEstado(claveModo) {
    return {
      fase: 'jugando',
      modo: claveModo,
      jugador: crearJugador(),
      obstaculos: [],
      spawner: crearSpawner(),
      proximaX: OBSTACULO.primeraX,  // x donde va a empezar el próximo par
      puntaje: 0,
      pasados: 0,                    // obstáculos pasados (achica el hueco)
      tiempoSacudon: 0,
      tiempoFin: 0,                  // cuenta regresiva de la fase 'muriendo'
      tiempoRalentizado: 0,
      debug: false,
    };
  }

  /**
   * Arranca una partida nueva en el modo elegido.
   * @param {string} claveModo 'facil' | 'normal' | 'dificil'
   */
  function iniciarPartida(claveModo) {
    loop.detener();
    vaciarMundo();
    const debug = estado.debug;
    Object.assign(estado, crearEstado(claveModo), { debug });
    parallax.reiniciar();
    dom.juego.classList.remove('is-paused');
    dibujar();
    loop.iniciar();
  }

  /** Saca del DOM todas las entidades de la partida anterior. */
  function vaciarMundo() {
    estado.obstaculos.forEach((obstaculo) => obstaculo.elemento.remove());
    estado.obstaculos = [];
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
      estado.obstaculos.forEach((obstaculo) => actualizarObstaculo(obstaculo, 0, dt));
      estado.tiempoFin -= dt;
      if (estado.tiempoFin <= 0) terminar('derrota');
      return;
    }
    if (estado.fase !== 'jugando') return;

    estado.tiempoRalentizado = Math.max(0, estado.tiempoRalentizado - dt);
    const velocidad = velocidadMundo();
    parallax.actualizar(velocidad, dt);
    actualizarJugador(estado.jugador, dt);
    estado.obstaculos.forEach((obstaculo) => actualizarObstaculo(obstaculo, velocidad, dt));
    generar(velocidad, dt);
    contarPasados();
    revisarChoques();
    borrarFueraDePantalla();
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

  /**
   * Crea los pares que entran por la derecha. proximaX se mueve con el
   * mundo; cuando llega cerca del borde derecho se crea un par ahí y se
   * corre al siguiente lugar (ancho del par + separación al azar). Así la
   * distancia entre pares es exacta y no depende de los fps.
   * @param {number} velocidad
   * @param {number} dt
   */
  function generar(velocidad, dt) {
    estado.proximaX -= velocidad * dt;
    while (estado.proximaX < JUEGO.ancho + 100) {
      const par = siguientePar(estado.spawner, MODOS[estado.modo], estado.pasados);
      const obstaculo = crearObstaculo(
        estado.proximaX, par.hueco, par.centro,
        elegir(OBSTACULO.edificios, Math.random), elegir(OBSTACULO.carteles, Math.random),
      );
      estado.obstaculos.push(obstaculo);
      dom.mundo.append(obstaculo.elemento);
      estado.proximaX += obstaculo.ancho + par.separacion;
    }
  }

  /** +1 por cada par que la moto dejó atrás. */
  function contarPasados() {
    for (const obstaculo of estado.obstaculos) {
      if (!obstaculo.pasado && obstaculo.x + obstaculo.ancho < estado.jugador.x) {
        obstaculo.pasado = true;
        estado.pasados += 1;
        estado.puntaje += 1;
      }
    }
  }

  /** Techo, suelo y obstáculos. */
  function revisarChoques() {
    const caja = cajaJugador(estado.jugador);
    if (caja.y < JUEGO.techo || caja.y + caja.alto > JUEGO.suelo) {
      chocar();
      return;
    }
    for (const obstaculo of estado.obstaculos) {
      const toca = obstaculo.cajas.some((hitbox) => seTocan(caja, cajaEnMundo(obstaculo.x, 0, hitbox)));
      if (toca) {
        obstaculo.tiempoChoque = OBSTACULO.duracionChoque;
        chocar();
        return;
      }
    }
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

  /** Borra del DOM y del arreglo los pares que ya salieron por la izquierda. */
  function borrarFueraDePantalla() {
    estado.obstaculos = estado.obstaculos.filter((obstaculo) => {
      if (!salioDePantalla(obstaculo)) return true;
      obstaculo.elemento.remove();
      return false;
    });
  }

  /**
   * Fin de la partida: frena el loop y avisa a main.js.
   * @param {'victoria' | 'derrota'} resultado
   */
  function terminar(resultado) {
    estado.fase = 'fin';
    loop.detener();
    dibujar();
    alTerminar(resultado, estado.puntaje);
  }

  /** Escribe el estado en el DOM. */
  function dibujar() {
    parallax.dibujar();
    estado.obstaculos.forEach(dibujarObstaculo);
    dibujarJugador(estado.jugador, dom.jugador, dom.hitboxJugador);
    dom.juego.classList.toggle('is-shaking', estado.tiempoSacudon > 0);
    hud.dibujar({ puntaje: estado.puntaje, vidas: MODOS[estado.modo].vidas, modo: MODOS[estado.modo].nombre });
  }

  return {
    iniciarPartida,
    /** @returns {string} fase actual */
    get fase() { return estado.fase; },
    /** @returns {string} modo de la última partida */
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

    /** Deja la partida (botón "Cambiar modo"): limpia el mundo y vuelve al menú. */
    abandonar() {
      loop.detener();
      vaciarMundo();
      const debug = estado.debug;
      Object.assign(estado, crearEstado(estado.modo), { debug, fase: 'menu' });
      parallax.reiniciar();
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
