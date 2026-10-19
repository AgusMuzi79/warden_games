// entrada.js — Mouse y teclado del juego
//
// Qué hace: escucha los eventos del canvas (pointer events, teclas, foco)
// y los traduce a acciones del Juego: elegir bando, arrastrar y soltar
// fichas, mover el cursor de teclado, levantar y soltar con Enter, y
// "JUGAR DE NUEVO" en la pantalla de fin.
// Por qué aparte de juego.js: juego.js guarda el estado de la partida y
// dibuja; acá solo se decide qué hacer con cada click o tecla. Así cada
// archivo se puede leer (y explicar) por separado.
// Cómo se conectan: principal.js crea el Juego y después una Entrada con
// ese juego. La Entrada lee y cambia el estado a través de this.juego
// (arrastre, seleccion, cursor, elegido...); juego.js no sabe que existe.
//
// Coordenadas "lógicas": se dibuja siempre en 1200x760 (ANCHO x ALTO),
// aunque el CSS muestre el canvas más chico. El mouse se pasa a esas
// coordenadas antes de usarlo.

import { clamp, prefiereMenosMovimiento } from './utiles.js';
import {
  ANCHO, ALTO, TABLERO_X, CELDA, OFFSET, RADIO_FICHA, BANDOS, ORDEN_BANDOS,
} from './config.js';
import { Tablero } from './tablero.js';
import { centroDeCelda } from './dibujo.js';
import { bandoEn, botonFinEn } from './pantallas.js';

// Hacia dónde mueve el cursor cada flecha: [filas, columnas].
const FLECHAS = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
};

// En la selección de bando: hacia dónde mueve cada flecha (-1 izquierda, 1 derecha).
const FLECHAS_BANDO = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 };

/**
 * Mouse y teclado del juego: traduce los eventos del canvas a acciones
 * del Juego (elegir bando, arrastrar y soltar fichas, cursor de teclado).
 */
export class Entrada {
  /**
   * @param {import('./juego.js').Juego} juego la partida que controla
   */
  constructor(juego) {
    this.juego = juego;
    this.canvas = juego.canvas;
  }

  /**
   * Engancha los eventos del canvas a los métodos de esta clase.
   */
  conectar() {
    const canvas = this.canvas;
    canvas.addEventListener('pointerdown', (evento) => this.alPresionar(evento));
    canvas.addEventListener('pointermove', (evento) => this.alMover(evento));
    canvas.addEventListener('pointerup', () => this.alSoltar());
    canvas.addEventListener('pointercancel', () => this.alCancelar());
    canvas.addEventListener('keydown', (evento) => this.alTeclear(evento));
    canvas.addEventListener('focus', () => this.alEnfocar(true));
    canvas.addEventListener('blur', () => this.alEnfocar(false));
  }

  // ---------------------------------------------------------------
  // Mouse (pointer events)
  // ---------------------------------------------------------------

  /**
   * Pasa la posición del puntero a coordenadas lógicas del canvas (1200x760).
   * @param {PointerEvent} evento
   * @returns {{x: number, y: number}}
   */
  aLogico(evento) {
    const caja = this.canvas.getBoundingClientRect();
    return {
      x: ((evento.clientX - caja.left) * ANCHO) / caja.width,
      y: ((evento.clientY - caja.top) * ALTO) / caja.height,
    };
  }

  /**
   * Casilla de la cruz bajo el punto (x, y), o null si no hay ninguna cerca.
   * @param {number} x
   * @param {number} y
   * @returns {{fila: number, col: number} | null}
   */
  celdaEn(x, y) {
    const col = Math.floor((x - TABLERO_X - OFFSET) / CELDA);
    const fila = Math.floor((y - OFFSET) / CELDA);
    if (!Tablero.esCeldaValida(fila, col)) return null;
    const centro = centroDeCelda(fila, col);
    return Math.hypot(x - centro.x, y - centro.y) <= RADIO_FICHA + 6 ? { fila, col } : null;
  }

  /**
   * Botón del mouse apretado. En la selección elige el bando de la tarjeta
   * tocada; en el fin, "JUGAR DE NUEVO" vuelve a la selección; jugando,
   * agarra la ficha si tiene saltos (si no, tiembla).
   * @param {PointerEvent} evento
   */
  alPresionar(evento) {
    const juego = this.juego;
    if (evento.button !== 0) return;
    const { x, y } = this.aLogico(evento);
    if (juego.fase === 'eligiendo') {
      const clave = juego.pausado ? null : bandoEn(x, y);
      if (clave) juego.elegirBando(clave);
      return;
    }
    if (juego.terminado) {
      if (!juego.pausado && botonFinEn(x, y, juego.fin)) juego.jugarDeNuevo();
      return;
    }
    if (!juego.activo) return;
    const celda = this.celdaEn(x, y);
    if (!celda || juego.tablero.grilla[celda.fila][celda.col] !== true) return;
    const t = performance.now();
    const movimientos = juego.tablero.movimientosDesde(celda.fila, celda.col);
    juego.seleccion = null;  // el mouse le gana a una selección hecha con el teclado
    juego.vuelta = null;
    if (movimientos.length === 0) {
      this.rechazar(celda, t);
      return;
    }
    juego.rechazo = null;
    const centro = centroDeCelda(celda.fila, celda.col);
    juego.arrastre = { ...celda, movimientos, px: x, py: y, difX: x - centro.x, difY: y - centro.y };
    juego.efectos.agregarEstela(centro.x, centro.y, juego.colorBando, t);
    // Con la captura, los eventos siguen llegando al canvas aunque el puntero salga de él.
    this.canvas.setPointerCapture(evento.pointerId);
    this.canvas.style.cursor = 'grabbing';
  }

  /**
   * Puntero en movimiento: en la selección enciende la tarjeta de abajo;
   * en el fin, el botón "JUGAR DE NUEVO"; jugando, mueve la ficha arrastrada o cambia el cursor del mouse.
   * @param {PointerEvent} evento
   */
  alMover(evento) {
    const juego = this.juego;
    const { x, y } = this.aLogico(evento);
    if (juego.fase === 'eligiendo') {
      const clave = bandoEn(x, y);
      if (clave) juego.elegido = clave;
      this.canvas.style.cursor = clave ? 'pointer' : 'default';
      return;
    }
    if (juego.terminado) {
      juego.botonEncendido = botonFinEn(x, y, juego.fin);
      this.canvas.style.cursor = juego.botonEncendido ? 'pointer' : 'default';
      return;
    }
    if (juego.arrastre) {
      juego.arrastre.px = x;
      juego.arrastre.py = y;
      const ficha = juego.posicionArrastre();
      juego.efectos.agregarEstela(ficha.x, ficha.y, juego.colorBando, performance.now());
      return;
    }
    const celda = juego.activo ? this.celdaEn(x, y) : null;
    const movible = celda && juego.tablero.puedeMover(celda.fila, celda.col);
    this.canvas.style.cursor = movible ? 'grab' : 'default';
  }

  /**
   * Botón del mouse soltado: si la ficha está sobre un destino válido, salta;
   * si no, vuelve a su lugar.
   */
  alSoltar() {
    const juego = this.juego;
    if (!juego.arrastre) return;
    const t = performance.now();
    const destino = juego.destinoBajoFicha();
    if (!destino) {
      juego.cancelarArrastre(t);
      return;
    }
    const origen = { fila: juego.arrastre.fila, col: juego.arrastre.col };
    // La estela termina justo en el centro de la casilla de destino.
    const centro = centroDeCelda(destino.fila, destino.col);
    juego.efectos.agregarEstela(centro.x, centro.y, juego.colorBando, t);
    juego.efectos.cortarEstela();
    juego.arrastre = null;
    this.canvas.style.cursor = 'default';
    juego.jugar(origen, destino, t);
  }

  /**
   * El navegador canceló el puntero (por ejemplo, otra app tomó el foco):
   * la ficha vuelve a su casilla.
   */
  alCancelar() {
    this.juego.cancelarArrastre(performance.now());
  }

  /**
   * Hace temblar una ficha que no tiene saltos y lo avisa.
   * @param {{fila: number, col: number}} celda
   * @param {number} t
   */
  rechazar(celda, t) {
    const juego = this.juego;
    juego.vuelta = null;  // una sola ficha animada por vez (ver cuadro en juego.js)
    if (!prefiereMenosMovimiento()) juego.rechazo = { ...celda, inicio: t };
    juego.avisar('Ese nodo no tiene saltos posibles.');
  }

  // ---------------------------------------------------------------
  // Teclado
  // ---------------------------------------------------------------

  /**
   * El canvas ganó o perdió el foco. El cursor se muestra solo con foco de
   * teclado (:focus-visible), no al hacer click con el mouse.
   * @param {boolean} enfocado
   */
  alEnfocar(enfocado) {
    this.juego.conFoco = enfocado && this.canvas.matches(':focus-visible');
    if (!enfocado) this.cancelarSeleccion(false);
  }

  /**
   * Tecla apretada con el canvas enfocado. Solo se cancela la acción del
   * navegador (scrollear) para las teclas que usa el juego.
   * @param {KeyboardEvent} evento
   */
  alTeclear(evento) {
    const juego = this.juego;
    const tecla = evento.key;
    if (tecla === 'r' || tecla === 'R') {
      if (juego.fase !== 'eligiendo') juego.reiniciar();
      return;
    }
    if (juego.fase === 'eligiendo') {
      if (!juego.pausado) this.teclearSeleccion(evento);
      return;
    }
    if (juego.terminado) {
      // En la pantalla de fin, Enter o Espacio equivalen a "JUGAR DE NUEVO".
      if ((tecla === 'Enter' || tecla === ' ') && !juego.pausado) {
        evento.preventDefault();
        juego.jugarDeNuevo();
      }
      return;
    }
    if (!juego.activo) return;
    if (FLECHAS[tecla]) {
      evento.preventDefault();
      juego.conFoco = true;
      this.moverCursor(FLECHAS[tecla]);
    } else if (tecla === 'Enter' || tecla === ' ') {
      evento.preventDefault();
      juego.conFoco = true;
      if (juego.seleccion) this.soltarSeleccion();
      else this.levantarConTeclado();
    } else if (tecla === 'Escape' && juego.seleccion) {
      evento.preventDefault();
      this.cancelarSeleccion(true);
    }
  }

  /**
   * Teclas de la selección de bando: las flechas cambian de tarjeta y
   * Enter o Espacio eligen la encendida.
   * @param {KeyboardEvent} evento
   */
  teclearSeleccion(evento) {
    const juego = this.juego;
    const tecla = evento.key;
    if (tecla in FLECHAS_BANDO) {
      evento.preventDefault();
      juego.conFoco = true;
      const actual = ORDEN_BANDOS.indexOf(juego.elegido);
      const indice = clamp(actual + FLECHAS_BANDO[tecla], 0, ORDEN_BANDOS.length - 1);
      if (indice !== actual) {
        juego.elegido = ORDEN_BANDOS[indice];
        const bando = BANDOS[juego.elegido];
        juego.avisar(bando.nombre + '. ' + bando.lema + '.');
      }
    } else if (tecla === 'Enter' || tecla === ' ') {
      evento.preventDefault();
      juego.elegirBando(juego.elegido);
    }
  }

  /**
   * Mueve el cursor una casilla en la dirección dada. Sin ficha levantada,
   * saltea lo que está fuera de la cruz; con una levantada, solo va a sus destinos.
   * @param {number[]} direccion [filas, columnas]
   */
  moverCursor([df, dc]) {
    const juego = this.juego;
    if (juego.seleccion) {
      const { fila, col, movimientos } = juego.seleccion;
      const destino = movimientos.find((m) => m.fila === fila + 2 * df && m.col === col + 2 * dc);
      if (destino) juego.cursor = { fila: destino.fila, col: destino.col };
      return;
    }
    let fila = juego.cursor.fila + df;
    let col = juego.cursor.col + dc;
    while (fila >= 0 && fila < 7 && col >= 0 && col < 7) {
      if (Tablero.esCeldaValida(fila, col)) {
        juego.cursor = { fila, col };
        return;
      }
      fila += df;
      col += dc;
    }
  }

  /**
   * Levanta la ficha que está bajo el cursor, si tiene saltos, y pone el
   * cursor en su primer destino.
   */
  levantarConTeclado() {
    const juego = this.juego;
    const { fila, col } = juego.cursor;
    if (juego.tablero.grilla[fila][col] !== true) {
      juego.avisar('En esa casilla no hay un nodo.');
      return;
    }
    const movimientos = juego.tablero.movimientosDesde(fila, col);
    if (movimientos.length === 0) {
      this.rechazar({ fila, col }, performance.now());
      return;
    }
    juego.seleccion = { fila, col, movimientos };
    juego.cursor = { fila: movimientos[0].fila, col: movimientos[0].col };
    const plural = movimientos.length === 1 ? ' destino posible.' : ' destinos posibles.';
    juego.avisar('Nodo fila ' + (fila + 1) + ', columna ' + (col + 1) + ' levantado. '
      + movimientos.length + plural);
  }

  /**
   * Suelta la ficha levantada con el teclado en el destino del cursor.
   */
  soltarSeleccion() {
    const juego = this.juego;
    const origen = { fila: juego.seleccion.fila, col: juego.seleccion.col };
    juego.seleccion = null;
    juego.jugar(origen, juego.cursor, performance.now());
  }

  /**
   * Deja la ficha levantada con el teclado en su lugar y vuelve el cursor a ella.
   * @param {boolean} anunciar si se avisa a la región en vivo
   */
  cancelarSeleccion(anunciar) {
    const juego = this.juego;
    if (!juego.seleccion) return;
    juego.cursor = { fila: juego.seleccion.fila, col: juego.seleccion.col };
    juego.seleccion = null;
    if (anunciar) juego.avisar('Nodo soltado sin moverlo.');
  }
}
