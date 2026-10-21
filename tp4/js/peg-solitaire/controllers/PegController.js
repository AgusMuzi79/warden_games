// PegController.js — Controlador del Peg Solitaire: escucha al usuario y coordina
//
// Qué hace: escucha los eventos del canvas (mouse, teclado, foco) y el botón
// Reiniciar, y por cada uno hace siempre lo mismo:
//   1. le pregunta al modelo (PegModel) qué se puede hacer (¿esa ficha tiene
//      saltos? ¿el salto vale?),
//   2. le pide al modelo que cambie su estado (jugar, elegir bando, reiniciar),
//   3. le pide a la vista (PegView) que anime o avise lo que corresponda.
// También lleva el loop de dibujo: en cada cuadro revisa el tiempo en el
// modelo y le pide a la vista que redibuje.
// No decide reglas (eso es del modelo) ni dibuja nada (eso es de la vista).
//
// Qué estado guarda: el de la interacción, que no es de las reglas del juego
// sino de lo que está haciendo la persona: la ficha que arrastra con el mouse
// (arrastre), la que levantó con el teclado (seleccion), la casilla marcada
// por el teclado (cursor), la tarjeta encendida al elegir bando y si el canvas
// tiene foco. Todo junto va en this.ui, que se le pasa a la vista en cada cuadro.
//
// Coordenadas "lógicas": se dibuja siempre en 1200x760 (ANCHO x ALTO), aunque
// el CSS muestre el canvas más chico. La vista convierte el mouse a esas
// coordenadas antes de que el controlador lo use.

import { clamp, prefiereMenosMovimiento } from '../utiles.js';
import { BANDOS, ORDEN_BANDOS, DEMORA_FIN_MS } from '../config.js';
import { Tablero } from '../models/Tablero.js';

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
 * Controlador del juego: traduce los eventos del usuario a cambios en el
 * modelo y a pedidos a la vista, y lleva el loop de dibujo.
 */
export class PegController {
  /**
   * @param {import('../models/PegModel.js').PegModel} modelo el estado de la partida
   * @param {import('../views/PegView.js').PegView} vista quien dibuja
   * @param {HTMLElement} botonReiniciar el <button> "Reiniciar" de la página
   * @param {HTMLButtonElement} botonHackear el <button> "Hackear Sistema" de la página
   */
  constructor(modelo, vista, botonReiniciar, botonHackear) {
    this.modelo = modelo;
    this.vista = vista;
    this.canvas = vista.canvas;
    this.botonReiniciar = botonReiniciar;
    this.botonHackear = botonHackear;
    // Estado de la interacción (ver el comentario de arriba). Se lo pasa
    // entero a la vista en cada cuadro.
    this.ui = {
      arrastre: null,                 // { fila, col, movimientos, px, py, difX, difY }: ficha arrastrada con el mouse
      seleccion: null,                // { fila, col, movimientos }: ficha levantada con el teclado
      cursor: { fila: 3, col: 3 },    // casilla marcada por el teclado
      elegido: ORDEN_BANDOS[0],       // tarjeta encendida en la selección de bando
      conFoco: false,                 // el cursor de teclado se ve solo con foco de teclado
      botonEncendido: false,          // mouse sobre "JUGAR DE NUEVO"
      fin: null,                      // datos de la pantalla de fin, o null si todavía no se muestra
    };
    this.finPendiente = false;        // la partida terminó pero falta la demora para mostrar el fin
    this.finEn = 0;                   // instante en que se muestra la pantalla de fin
    // bind: requestAnimationFrame llama a la función suelta, sin this.
    this.cuadro = this.cuadro.bind(this);
  }

  /**
   * Engancha los eventos y arranca el loop de dibujo, en la selección de
   * bando. Se llama una sola vez. El reloj recién corre al elegir bando.
   */
  iniciar() {
    const canvas = this.canvas;
    canvas.addEventListener('pointerdown', (evento) => this.alPresionar(evento));
    canvas.addEventListener('pointermove', (evento) => this.alMover(evento));
    canvas.addEventListener('pointerup', () => this.alSoltar());
    canvas.addEventListener('pointercancel', () => this.alCancelar());
    canvas.addEventListener('keydown', (evento) => this.alTeclear(evento));
    canvas.addEventListener('focus', () => this.alEnfocar(true));
    canvas.addEventListener('blur', () => this.alEnfocar(false));
    this.botonReiniciar.addEventListener('click', () => this.reiniciar());
    this.botonHackear.addEventListener('click', () => this.hackear());

    requestAnimationFrame(this.cuadro);
    this.vista.avisar('Elegí tu bando: Usuarios o Programas de Clu.');
  }

  // ---------------------------------------------------------------
  // Loop
  // ---------------------------------------------------------------

  /**
   * Un cuadro de la animación: revisa el tiempo en el modelo, muestra el fin
   * cuando pasa la demora y le pide a la vista que dibuje.
   *
   * Un solo reloj: el tiempo del cuadro sale de performance.now(), el mismo
   * que usan los eventos (mouse, teclado, botones) para marcar cuándo empieza
   * cada efecto. Como un efecto siempre se crea antes del cuadro que lo
   * dibuja, su edad (t - inicio) nunca da negativa. El tiempo que pasa
   * requestAnimationFrame no se usa: es el del comienzo del cuadro y puede
   * ser unos ms anterior a un evento que llegó justo antes.
   *
   * El try/finally pide el cuadro siguiente aunque algo falle al dibujar:
   * el error se ve en la consola, pero el juego no se congela.
   */
  cuadro() {
    try {
      const t = performance.now();
      if (this.modelo.verificarTiempo()) {
        this.cancelarArrastre(t);
        this.alTerminar(t);
      }
      // Pasada la demora, se muestra la pantalla de fin.
      if (this.finPendiente && t >= this.finEn) this.mostrarFin(t);
      this.sincronizarBotonHackear();

      this.vista.render(this.modelo, this.ui, t);
    } finally {
      requestAnimationFrame(this.cuadro);
    }
  }

  /**
   * La partida terminó (el modelo ya guardó cómo): programa la pantalla de
   * fin para dentro de DEMORA_FIN_MS, así se alcanza a ver la última
   * explosión. Con movimiento reducido no hay demora.
   * @param {number} t tiempo actual en ms
   */
  alTerminar(t) {
    this.ui.seleccion = null;
    this.finPendiente = true;
    this.finEn = t + (prefiereMenosMovimiento() ? 0 : DEMORA_FIN_MS);
  }

  /**
   * Muestra la pantalla de fin y avisa el resultado con las estadísticas.
   * @param {number} t tiempo actual en ms
   */
  mostrarFin(t) {
    this.finPendiente = false;
    // mostradoEn: de ahí salen las animaciones de la pantalla de fin.
    this.ui.fin = { ...this.modelo.fin, mostradoEn: t };
    this.ui.botonEncendido = false;
    this.vista.detenerHackeo();  // el cartel del hackeo no va encima del fin
    this.vista.avisarFin(this.ui.fin);
  }

  // ---------------------------------------------------------------
  // Acciones de la partida
  // ---------------------------------------------------------------

  /**
   * Bando con el que se dibuja: el elegido, o la tarjeta encendida mientras
   * todavía se está eligiendo.
   * @returns {string} 'usuarios' o 'clu'
   */
  bandoActual() {
    return this.modelo.bando || this.ui.elegido;
  }

  /**
   * Deja en cero lo que cambia durante una partida: arrastre, selección,
   * pantalla de fin y animaciones de la vista.
   */
  limpiarInteraccion() {
    this.ui.arrastre = null;
    this.ui.seleccion = null;
    this.ui.fin = null;
    this.ui.botonEncendido = false;
    this.finPendiente = false;
    this.vista.limpiarAnimaciones();
  }

  /**
   * Reiniciar (tecla R o botón de la página): vuelve a la selección de bando.
   * @param {string} [aviso] primera frase del aviso para lectores de pantalla
   */
  reiniciar(aviso = 'Partida reiniciada.') {
    this.mostrarSeleccion();
    this.vista.avisar(aviso + ' Elegí tu bando: Usuarios o Programas de Clu.');
  }

  /**
   * "JUGAR DE NUEVO" (botón del canvas, Enter o Espacio en la pantalla de
   * fin): lo mismo que Reiniciar, con otro aviso.
   */
  jugarDeNuevo() {
    this.reiniciar('Nueva partida.');
  }

  /**
   * Deja el tablero como al principio, frena el reloj y muestra la
   * selección de bando, con la tarjeta del último bando encendida.
   */
  mostrarSeleccion() {
    this.modelo.reiniciar();
    this.limpiarInteraccion();
    this.ui.elegido = this.modelo.bando || ORDEN_BANDOS[0];
    this.vista.fijarCursor('default');
  }

  /**
   * Elige un bando y arranca la partida: tablero inicial y reloj desde cero.
   * @param {string} clave 'usuarios' o 'clu'
   */
  elegirBando(clave) {
    this.modelo.elegirBando(clave);
    this.limpiarInteraccion();
    this.ui.elegido = clave;
    this.ui.cursor = { fila: 3, col: 3 };
    this.vista.fijarCursor('default');
    this.vista.avisar('Jugás con ' + BANDOS[clave].nombre + '. ¡Empezá! Hay 32 nodos activos.');
  }

  /**
   * Frena la partida (por ejemplo, mientras está abierta la ayuda). Si había
   * una ficha arrastrada, vuelve a su casilla.
   */
  pausar() {
    this.modelo.pausar();
    this.cancelarArrastre(performance.now());
  }

  /**
   * Vuelve a hacer correr el reloj después de una pausa.
   */
  reanudar() {
    this.modelo.reanudar();
  }

  /**
   * Intenta el salto de origen a destino. Si el modelo lo acepta, la vista
   * hace explotar la ficha comida y se revisa si terminó la partida.
   * @param {{fila: number, col: number}} origen
   * @param {{fila: number, col: number}} destino
   * @param {number} t
   */
  jugar(origen, destino, t) {
    const resultado = this.modelo.jugar(origen, destino);
    if (!resultado) return;
    this.vista.explotar(resultado.comida, this.bandoActual(), t);
    this.ui.cursor = { fila: destino.fila, col: destino.col };

    if (resultado.terminada) {
      this.alTerminar(t);
    } else {
      this.vista.avisar('Salto hecho. Quedan ' + this.modelo.tablero.contarFichas() + ' nodos y '
        + this.modelo.tablero.contarSaltos() + ' saltos posibles.');
    }
  }

  /**
   * Habilita "Hackear Sistema" solo cuando se puede usar (partida en curso y
   * con más de dos fichas). Solo toca el DOM si el estado cambió.
   * Si el botón tenía el foco cuando se deshabilita (por ejemplo, se terminó
   * el tiempo), el foco pasa antes al canvas: un botón deshabilitado lo
   * pierde y quedaría en el <body>.
   */
  sincronizarBotonHackear() {
    const deshabilitado = !this.modelo.puedeHackear;
    if (this.botonHackear.disabled === deshabilitado) return;
    if (deshabilitado && document.activeElement === this.botonHackear) this.canvas.focus();
    this.botonHackear.disabled = deshabilitado;
  }

  /**
   * "Hackear Sistema": el modelo deja solo dos fichas con un último salto
   * para ganar; la vista hace el efecto. La partida sigue: gana quien haga
   * ese salto. El foco pasa al canvas, para seguir jugando (el botón se
   * deshabilita en el cuadro siguiente).
   * Si había una ficha arrastrada, se suelta sin la animación de vuelta: puede
   * ser una de las que se sacan, y deslizarse a su casilla la dibujaría como
   * un fantasma.
   */
  hackear() {
    const t = performance.now();
    const quitadas = this.modelo.hackear();
    if (!quitadas) return;
    if (this.ui.arrastre) {
      this.ui.arrastre = null;
      this.vista.cortarEstela();
      this.vista.fijarCursor('default');
    }
    this.ui.seleccion = null;
    this.ui.cursor = { fila: 3, col: 2 };
    this.vista.hackear(quitadas, t);
    this.vista.avisar('Sistema hackeado. Quedan dos nodos en la fila 4, columnas 2 y 3. '
      + 'Un salto más y ganás.');
    this.canvas.focus();
  }

  /**
   * Suelta la ficha arrastrada sin mover nada: vuelve deslizándose a su
   * casilla (o de golpe, si se prefiere menos movimiento).
   * @param {number} t
   */
  cancelarArrastre(t) {
    if (!this.ui.arrastre) return;
    this.vista.volverAlLugar(this.ui.arrastre, t);
    this.ui.arrastre = null;
    this.vista.fijarCursor('default');
  }

  /**
   * Hace temblar una ficha que no tiene saltos y lo avisa.
   * @param {{fila: number, col: number}} celda
   * @param {number} t
   */
  rechazar(celda, t) {
    this.vista.rechazar(celda, t);
    this.vista.avisar('Ese nodo no tiene saltos posibles.');
  }

  // ---------------------------------------------------------------
  // Mouse (pointer events)
  // ---------------------------------------------------------------

  /**
   * Botón del mouse apretado. En la selección elige el bando de la tarjeta
   * tocada; en el fin, "JUGAR DE NUEVO" vuelve a la selección; jugando,
   * agarra la ficha si tiene saltos (si no, tiembla).
   * @param {PointerEvent} evento
   */
  alPresionar(evento) {
    const { modelo, vista, ui } = this;
    if (evento.button !== 0) return;
    const { x, y } = vista.aLogico(evento);
    if (modelo.fase === 'eligiendo') {
      const clave = modelo.pausado ? null : vista.bandoEn(x, y);
      if (clave) this.elegirBando(clave);
      return;
    }
    if (ui.fin) {
      if (!modelo.pausado && vista.botonFinEn(x, y, ui.fin)) this.jugarDeNuevo();
      return;
    }
    if (!modelo.activo) return;
    const celda = vista.celdaEn(x, y);
    if (!celda || !modelo.tablero.hayFicha(celda.fila, celda.col)) return;
    const t = performance.now();
    const movimientos = modelo.tablero.movimientosDesde(celda.fila, celda.col);
    ui.seleccion = null;  // el mouse le gana a una selección hecha con el teclado
    vista.detenerAnimacionDeFicha();
    if (movimientos.length === 0) {
      this.rechazar(celda, t);
      return;
    }
    const centro = vista.centroDeCelda(celda.fila, celda.col);
    ui.arrastre = { ...celda, movimientos, px: x, py: y, difX: x - centro.x, difY: y - centro.y };
    vista.agregarEstela(centro.x, centro.y, this.bandoActual(), t);
    // Con la captura, los eventos siguen llegando al canvas aunque el puntero salga de él.
    this.canvas.setPointerCapture(evento.pointerId);
    vista.fijarCursor('grabbing');
  }

  /**
   * Puntero en movimiento: en la selección enciende la tarjeta de abajo;
   * en el fin, el botón "JUGAR DE NUEVO"; jugando, mueve la ficha arrastrada o cambia el cursor del mouse.
   * @param {PointerEvent} evento
   */
  alMover(evento) {
    const { modelo, vista, ui } = this;
    const { x, y } = vista.aLogico(evento);
    if (modelo.fase === 'eligiendo') {
      const clave = vista.bandoEn(x, y);
      if (clave) ui.elegido = clave;
      vista.fijarCursor(clave ? 'pointer' : 'default');
      return;
    }
    if (ui.fin) {
      ui.botonEncendido = vista.botonFinEn(x, y, ui.fin);
      vista.fijarCursor(ui.botonEncendido ? 'pointer' : 'default');
      return;
    }
    if (ui.arrastre) {
      ui.arrastre.px = x;
      ui.arrastre.py = y;
      const ficha = vista.posicionArrastre(ui.arrastre);
      vista.agregarEstela(ficha.x, ficha.y, this.bandoActual(), performance.now());
      return;
    }
    const celda = modelo.activo ? vista.celdaEn(x, y) : null;
    const movible = celda && modelo.tablero.puedeMover(celda.fila, celda.col);
    vista.fijarCursor(movible ? 'grab' : 'default');
  }

  /**
   * Botón del mouse soltado: si la ficha está sobre un destino válido, salta;
   * si no, vuelve a su lugar.
   */
  alSoltar() {
    const { vista, ui } = this;
    if (!ui.arrastre) return;
    const t = performance.now();
    const destino = vista.destinoBajoFicha(ui.arrastre);
    if (!destino) {
      this.cancelarArrastre(t);
      return;
    }
    const origen = { fila: ui.arrastre.fila, col: ui.arrastre.col };
    // La estela termina justo en el centro de la casilla de destino.
    const centro = vista.centroDeCelda(destino.fila, destino.col);
    vista.agregarEstela(centro.x, centro.y, this.bandoActual(), t);
    vista.cortarEstela();
    ui.arrastre = null;
    vista.fijarCursor('default');
    this.jugar(origen, destino, t);
  }

  /**
   * El navegador canceló el puntero (por ejemplo, otra app tomó el foco):
   * la ficha vuelve a su casilla.
   */
  alCancelar() {
    this.cancelarArrastre(performance.now());
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
    this.ui.conFoco = enfocado && this.canvas.matches(':focus-visible');
    if (!enfocado) this.cancelarSeleccion(false);
  }

  /**
   * Tecla apretada con el canvas enfocado. Solo se cancela la acción del
   * navegador (scrollear) para las teclas que usa el juego.
   * @param {KeyboardEvent} evento
   */
  alTeclear(evento) {
    const { modelo, ui } = this;
    const tecla = evento.key;
    if (tecla === 'r' || tecla === 'R') {
      if (modelo.fase !== 'eligiendo') this.reiniciar();
      return;
    }
    if (modelo.fase === 'eligiendo') {
      if (!modelo.pausado) this.teclearSeleccion(evento);
      return;
    }
    if (ui.fin) {
      // En la pantalla de fin, Enter o Espacio equivalen a "JUGAR DE NUEVO".
      if ((tecla === 'Enter' || tecla === ' ') && !modelo.pausado) {
        evento.preventDefault();
        this.jugarDeNuevo();
      }
      return;
    }
    if (!modelo.activo) return;
    if (FLECHAS[tecla]) {
      evento.preventDefault();
      ui.conFoco = true;
      this.moverCursor(FLECHAS[tecla]);
    } else if (tecla === 'Enter' || tecla === ' ') {
      evento.preventDefault();
      ui.conFoco = true;
      if (ui.seleccion) this.soltarSeleccion();
      else this.levantarConTeclado();
    } else if (tecla === 'Escape' && ui.seleccion) {
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
    const { ui, vista } = this;
    const tecla = evento.key;
    if (tecla in FLECHAS_BANDO) {
      evento.preventDefault();
      ui.conFoco = true;
      const actual = ORDEN_BANDOS.indexOf(ui.elegido);
      const indice = clamp(actual + FLECHAS_BANDO[tecla], 0, ORDEN_BANDOS.length - 1);
      if (indice !== actual) {
        ui.elegido = ORDEN_BANDOS[indice];
        const bando = BANDOS[ui.elegido];
        vista.avisar(bando.nombre + '. ' + bando.lema + '.');
      }
    } else if (tecla === 'Enter' || tecla === ' ') {
      evento.preventDefault();
      this.elegirBando(ui.elegido);
    }
  }

  /**
   * Mueve el cursor una casilla en la dirección dada. Sin ficha levantada,
   * saltea lo que está fuera de la cruz; con una levantada, solo va a sus destinos.
   * @param {number[]} direccion [filas, columnas]
   */
  moverCursor([df, dc]) {
    const ui = this.ui;
    if (ui.seleccion) {
      const { fila, col, movimientos } = ui.seleccion;
      const destino = movimientos.find((m) => m.fila === fila + 2 * df && m.col === col + 2 * dc);
      if (destino) ui.cursor = { fila: destino.fila, col: destino.col };
      return;
    }
    let fila = ui.cursor.fila + df;
    let col = ui.cursor.col + dc;
    while (fila >= 0 && fila < 7 && col >= 0 && col < 7) {
      if (Tablero.esCeldaValida(fila, col)) {
        ui.cursor = { fila, col };
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
    const { modelo, vista, ui } = this;
    const { fila, col } = ui.cursor;
    if (!modelo.tablero.hayFicha(fila, col)) {
      vista.avisar('En esa casilla no hay un nodo.');
      return;
    }
    const movimientos = modelo.tablero.movimientosDesde(fila, col);
    if (movimientos.length === 0) {
      this.rechazar({ fila, col }, performance.now());
      return;
    }
    ui.seleccion = { fila, col, movimientos };
    ui.cursor = { fila: movimientos[0].fila, col: movimientos[0].col };
    const plural = movimientos.length === 1 ? ' destino posible.' : ' destinos posibles.';
    vista.avisar('Nodo fila ' + (fila + 1) + ', columna ' + (col + 1) + ' levantado. '
      + movimientos.length + plural);
  }

  /**
   * Suelta la ficha levantada con el teclado en el destino del cursor.
   */
  soltarSeleccion() {
    const ui = this.ui;
    const origen = { fila: ui.seleccion.fila, col: ui.seleccion.col };
    ui.seleccion = null;
    this.jugar(origen, ui.cursor, performance.now());
  }

  /**
   * Deja la ficha levantada con el teclado en su lugar y vuelve el cursor a ella.
   * @param {boolean} anunciar si se avisa a la región en vivo
   */
  cancelarSeleccion(anunciar) {
    const ui = this.ui;
    if (!ui.seleccion) return;
    ui.cursor = { fila: ui.seleccion.fila, col: ui.seleccion.col };
    ui.seleccion = null;
    if (anunciar) this.vista.avisar('Nodo soltado sin moverlo.');
  }
}
