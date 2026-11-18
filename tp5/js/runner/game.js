// game.js — Estado de la partida, update y render de cada cuadro
//
// Junta todas las piezas: en cada cuadro el loop llama a paso(dt), que
// primero actualiza el estado (física, spawner, choques, puntaje) y después
// lo dibuja. El estado es un objeto JS; el DOM solo recibe transforms y
// clases (ver docs/tp5-contrato.md). main.js se encarga de las pantallas.
//
// Fases: 'menu' (sin partida), 'jugando', 'pausa', 'muriendo' (se ve la
// explosión antes de la pantalla de derrota) y 'fin'.

import { JUEGO, JUGADOR, MUNDO, OBSTACULO, DRONE, COLECCIONABLE, MODOS } from './config.js';
import { crearLoop } from './loop.js';
import { crearParallax } from './parallax.js';
import { crearHud } from './hud.js';
import { crearSpawner, siguientePar, elegir, entre } from './spawner.js';
import { seTocan, cajaEnMundo } from './collision.js';
import {
  crearJugador, impulsar as impulsarJugador, actualizarJugador, descontarTiempos,
  cajaJugador, prepararVistaJugador, dibujarJugador, centroVertical,
} from './entities/player.js';
import {
  crearObstaculo, actualizarObstaculo, dibujarObstaculo, salioDePantalla,
} from './entities/obstacle.js';
import {
  crearDrone, actualizarDrone, explotarDrone, cajaDrone, dibujarDrone, droneTerminado,
} from './entities/drone.js';
import {
  crearColeccionable, actualizarColeccionable, recoger, cajaColeccionable,
  dibujarColeccionable, coleccionableTerminado, crearTextoFlotante,
} from './entities/collectible.js';

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
      vidas: MODOS[claveModo].vidas,  // Infinity en Fácil
      obstaculos: [],
      drones: [],
      coleccionables: [],
      textos: [],                    // "+3" flotantes
      spawner: crearSpawner(),
      proximaX: OBSTACULO.primeraX,  // x donde va a empezar el próximo par
      puntaje: 0,
      pasados: 0,                    // obstáculos pasados (achica el hueco)
      generados: 0,                  // pares creados (los drones esperan unos cuantos)
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
    for (const lista of [estado.obstaculos, estado.drones, estado.coleccionables, estado.textos]) {
      lista.forEach((entidad) => entidad.elemento.remove());
    }
    estado.obstaculos = [];
    estado.drones = [];
    estado.coleccionables = [];
    estado.textos = [];
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
      moverEntidades(0, dt);
      borrarTerminadas();
      estado.tiempoFin -= dt;
      if (estado.tiempoFin <= 0) terminar('derrota');
      return;
    }
    if (estado.fase !== 'jugando') return;

    estado.tiempoRalentizado = Math.max(0, estado.tiempoRalentizado - dt);
    const velocidad = velocidadMundo();
    parallax.actualizar(velocidad, dt);
    actualizarJugador(estado.jugador, dt);
    moverEntidades(velocidad, dt);
    generar(velocidad, dt);
    contarPasados();
    revisarChoques();
    borrarTerminadas();
    if (estado.fase === 'jugando' && estado.puntaje >= JUEGO.puntajeObjetivo) terminar('victoria');
  }

  /**
   * Mueve todas las entidades con el mundo (a velocidad 0 se quedan quietas
   * pero sus temporizadores siguen corriendo).
   * @param {number} velocidad
   * @param {number} dt
   */
  function moverEntidades(velocidad, dt) {
    estado.obstaculos.forEach((obstaculo) => actualizarObstaculo(obstaculo, velocidad, dt));
    estado.drones.forEach((drone) => actualizarDrone(drone, velocidad, dt));
    estado.coleccionables.forEach((coleccionable) => actualizarColeccionable(coleccionable, velocidad, dt));
    estado.textos.forEach((texto) => { texto.tiempo -= dt; });
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
      estado.generados += 1;
      agregarExtras(obstaculo, par);
      estado.proximaX += obstaculo.ancho + par.separacion;
    }
  }

  /**
   * A veces suma un coleccionable en el hueco del par y un drone en el
   * espacio que queda hasta el próximo.
   * @param {object} obstaculo el par recién creado
   * @param {{ hueco: number, centro: number, separacion: number }} par
   */
  function agregarExtras(obstaculo, par) {
    if (Math.random() < COLECCIONABLE.probabilidad) {
      const lado = COLECCIONABLE.lado;
      const x = obstaculo.x + (obstaculo.ancho - lado) / 2;
      const desvio = entre(-COLECCIONABLE.desvioMax, COLECCIONABLE.desvioMax, Math.random);
      const coleccionable = crearColeccionable(x, par.centro + desvio - lado / 2);
      estado.coleccionables.push(coleccionable);
      dom.mundo.append(coleccionable.elemento);
    }

    if (estado.generados >= DRONE.desdeObstaculo && Math.random() < DRONE.probabilidad) {
      // A mitad de camino hasta el próximo par, arriba o abajo de la
      // altura del hueco (así se puede esquivar pasando por el otro lado).
      const x = obstaculo.x + obstaculo.ancho + (par.separacion - DRONE.ancho) / 2;
      const lado = Math.random() < 0.5 ? -1 : 1;
      const minimo = JUEGO.techo + DRONE.amplitud;
      const maximo = JUEGO.suelo - DRONE.alto - DRONE.amplitud;
      const yBase = Math.min(maximo, Math.max(minimo, par.centro + lado * DRONE.desvio - DRONE.alto / 2));
      const drone = crearDrone(x, yBase);
      estado.drones.push(drone);
      dom.mundo.append(drone.elemento);
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

  /**
   * Choques de la moto. Mientras es invulnerable atraviesa edificios y
   * carteles, y el techo y el suelo solo la frenan. Los coleccionables y
   * los drones (que no hacen daño) se agarran siempre.
   */
  function revisarChoques() {
    const jugador = estado.jugador;
    const caja = cajaJugador(jugador);
    const invulnerable = jugador.tiempoInvulnerable > 0;

    // Techo y suelo.
    if (caja.y < JUEGO.techo || caja.y + caja.alto > JUEGO.suelo) {
      if (invulnerable) {
        const minimo = JUEGO.techo - JUGADOR.hitbox.dy;
        const maximo = JUEGO.suelo - JUGADOR.hitbox.dy - JUGADOR.hitbox.alto;
        jugador.y = Math.min(maximo, Math.max(minimo, jugador.y));
        jugador.vy = 0;
      } else {
        recibirDanio(true);
        return;
      }
    }

    if (!invulnerable) {
      for (const obstaculo of estado.obstaculos) {
        const toca = obstaculo.cajas.some((hitbox) => seTocan(caja, cajaEnMundo(obstaculo.x, 0, hitbox)));
        if (toca) {
          obstaculo.tiempoChoque = OBSTACULO.duracionChoque;
          recibirDanio(false);
          return;
        }
      }
    }

    // Drones: no hacen daño, son una ayuda. Al agarrar uno explota y el
    // mundo se ralentiza un rato (la moto también los agarra si es
    // invulnerable).
    for (const drone of estado.drones) {
      if (!drone.explotando && seTocan(caja, cajaDrone(drone))) {
        explotarDrone(drone);
        estado.tiempoRalentizado = MUNDO.duracionRalentizado;
      }
    }

    for (const coleccionable of estado.coleccionables) {
      if (!coleccionable.recogido && seTocan(caja, cajaColeccionable(coleccionable))) {
        recoger(coleccionable);
        estado.puntaje += COLECCIONABLE.puntos;
        const texto = crearTextoFlotante(coleccionable.x, coleccionable.y, `+${COLECCIONABLE.puntos}`);
        estado.textos.push(texto);
        dom.mundo.append(texto.elemento);
      }
    }
  }

  /**
   * Un choque que hace daño: una vida menos. La moto solo se destruye del
   * todo (tira de choque completa, .is-hit) con la última vida. Con vidas de
   * sobra queda invulnerable y parpadea; en Normal y Difícil además muestra
   * los primeros cuadros de la tira (.is-damaged) y hay sacudón. En Fácil
   * (vidas infinitas) solo parpadea. Si chocó contra el techo o el suelo,
   * vuelve al centro para no volver a chocar enseguida.
   * @param {boolean} fueBorde chocó contra el techo o el suelo
   */
  function recibirDanio(fueBorde) {
    const jugador = estado.jugador;
    if (estado.vidas !== Infinity) {
      estado.tiempoSacudon = JUEGO.duracionSacudon;
      jugador.tiempoDanio = JUGADOR.duracionDanio;
    }
    estado.vidas -= 1;  // Infinity - 1 sigue siendo Infinity

    if (estado.vidas <= 0) {
      jugador.vy = 0;
      jugador.tiempoDanio = 0;
      // Se destruye y queda así (frame final de la tira) detrás del game over.
      jugador.tiempoChoque = Infinity;
      estado.fase = 'muriendo';
      estado.tiempoFin = JUEGO.esperaDerrota;
      return;
    }
    jugador.tiempoInvulnerable = JUGADOR.duracionInvulnerable;
    if (fueBorde) {
      jugador.y = centroVertical();
      jugador.vy = 0;
    }
  }

  /** Borra del DOM y del arreglo lo que salió de pantalla o terminó su animación. */
  function borrarTerminadas() {
    estado.obstaculos = filtrarYBorrar(estado.obstaculos, salioDePantalla);
    estado.drones = filtrarYBorrar(estado.drones, droneTerminado);
    estado.coleccionables = filtrarYBorrar(estado.coleccionables, coleccionableTerminado);
    estado.textos = filtrarYBorrar(estado.textos, (texto) => texto.tiempo <= 0);
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
    estado.drones.forEach(dibujarDrone);
    estado.coleccionables.forEach(dibujarColeccionable);
    dibujarJugador(estado.jugador, dom.jugador, dom.hitboxJugador);
    dom.juego.classList.toggle('is-shaking', estado.tiempoSacudon > 0);
    hud.dibujar({ puntaje: estado.puntaje, vidas: estado.vidas, modo: MODOS[estado.modo].nombre });
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

/**
 * Se queda con las entidades que siguen y saca del DOM las que terminaron.
 * @param {object[]} lista
 * @param {(entidad: object) => boolean} terminada
 * @returns {object[]} lista nueva, sin las terminadas
 */
function filtrarYBorrar(lista, terminada) {
  return lista.filter((entidad) => {
    if (!terminada(entidad)) return true;
    entidad.elemento.remove();
    return false;
  });
}
