// juego.js — Estado de la partida, loop de dibujo y entrada (mouse y teclado)
//
// Qué hace: junta las piezas de los otros módulos. Tiene el Tablero (las
// reglas), el Reloj (tiempo con pausa), cuenta los movimientos, sabe en qué
// fase está la partida (eligiendo bando, jugando o terminada) y maneja el
// arrastre con el mouse y el cursor de teclado. En cada cuadro (requestAnimationFrame) redibuja todo el canvas.
// Los efectos (explosión, estela, temblor) viven en efectos.js; acá solo se
// avisa cuándo pasan.
// Por qué una clase: el estado vive en un solo objeto (this) y cada método
// hace una cosa; principal.js solo tiene que crear el Juego y conectarle
// los eventos del canvas.
//
// Coordenadas "lógicas": se dibuja siempre en 1200x760 (ANCHO x ALTO),
// aunque el CSS muestre el canvas más chico. El mouse se pasa a esas
// coordenadas antes de usarlo.

import { conAlfa, easeOut, clamp, prefiereMenosMovimiento } from './utiles.js';
import {
  ANCHO, ALTO, TABLERO_X, CELDA, OFFSET, RADIO_FICHA, TIEMPO_LIMITE_MS,
  DURACION_VUELTA_MS, DURACION_RECHAZO_MS, obtenerDpr,
  BANDOS, ORDEN_BANDOS,
} from './config.js';
import { Tablero } from './tablero.js';
import { Reloj } from './reloj.js';
import {
  dibujarFondo, dibujarTablero, dibujarFichas, dibujarFicha, dibujarFantasma,
  dibujarScanlines, centroDeCelda, texto,
} from './dibujo.js';
import { Efectos } from './efectos.js';
import { dibujarHud } from './hud.js';
import { dibujarSeleccion, bandoEn } from './pantallas.js';

// Hacia dónde mueve el cursor cada flecha: [filas, columnas].
const FLECHAS = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
};

// En la selección de bando: hacia dónde mueve cada flecha (-1 izquierda, 1 derecha).
const FLECHAS_BANDO = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 };

// Textos del final provisorio (la Fase 3 trae las pantallas definitivas).
const TITULOS_FIN = { ganado: 'SISTEMA RESTAURADO', perdido: 'SISTEMA CORRUPTO' };

export class Juego {
  /**
   * @param {HTMLCanvasElement} canvas el canvas de la página
   * @param {object} recursos lo que devuelve prepararRecursos()
   * @param {Record<string, string>} colores lo que devuelve obtenerColores()
   * @param {{titulo: string, ui: string}} fuentes lo que devuelve obtenerFuentes()
   * @param {{avisar?: (texto: string) => void}} [opciones] avisar escribe en la región en vivo
   */
  constructor(canvas, recursos, colores, fuentes, opciones = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.recursos = recursos;
    this.colores = colores;
    this.fuentes = fuentes;
    this.avisar = opciones.avisar || (() => {});
    this.dpr = obtenerDpr();
    this.tablero = new Tablero();
    this.reloj = new Reloj(TIEMPO_LIMITE_MS);
    this.efectos = new Efectos();
    this.pausado = false;
    this.conFoco = false;               // el cursor de teclado se ve solo con foco de teclado
    this.cursor = { fila: 3, col: 3 };  // casilla marcada por el teclado
    this.bando = null;                  // 'usuarios' | 'clu', se elige al empezar
    this.elegido = ORDEN_BANDOS[0];     // tarjeta encendida en la selección de bando
    // bind: requestAnimationFrame llama a la función suelta, sin this.
    this.cuadro = this.cuadro.bind(this);
    this.limpiarPartida();
    this.detenerReloj();
  }

  /**
   * Deja en cero todo lo que cambia durante una partida.
   */
  limpiarPartida() {
    this.tablero.reiniciar();
    this.movimientos = 0;
    this.fase = 'eligiendo';        // 'eligiendo' | 'jugando' | 'ganado' | 'perdido'
    this.subtitulo = '';
    this.arrastre = null;           // { fila, col, movimientos, px, py, difX, difY }
    this.vuelta = null;             // { fila, col, x, y, inicio }: ficha que vuelve a su casilla
    this.rechazo = null;            // { fila, col, inicio }: ficha sin saltos que tiembla
    this.seleccion = null;          // { fila, col, movimientos }: ficha levantada con el teclado
    this.efectos.limpiar();         // sin chispas, estelas ni temblor de la partida anterior
  }

  /**
   * Arranca el loop de dibujo en la selección de bando. Se llama una sola
   * vez. El reloj recién corre al elegir bando.
   */
  iniciar() {
    requestAnimationFrame(this.cuadro);
    this.avisar('Elegí tu bando: Usuarios o Programas de Clu.');
  }

  /**
   * Deja el reloj quieto en el tiempo completo: lo arranca y lo congela en
   * el mismo instante, así marca 0 ms jugados hasta que se elija bando.
   */
  detenerReloj() {
    this.reloj.iniciar();
    this.reloj.congelar();
  }

  /**
   * Reiniciar (tecla R o botón de la página): vuelve a la selección de bando.
   */
  reiniciar() {
    this.mostrarSeleccion();
    this.avisar('Partida reiniciada. Elegí tu bando: Usuarios o Programas de Clu.');
  }

  /**
   * Deja el tablero como al principio, frena el reloj y muestra la
   * selección de bando, con la tarjeta del último bando encendida.
   */
  mostrarSeleccion() {
    this.limpiarPartida();
    this.detenerReloj();
    this.elegido = this.bando || ORDEN_BANDOS[0];
    this.canvas.style.cursor = 'default';
  }

  /**
   * Elige un bando y arranca la partida: tablero inicial y reloj desde cero.
   * @param {string} clave 'usuarios' o 'clu'
   */
  elegirBando(clave) {
    this.bando = clave;
    this.elegido = clave;
    this.limpiarPartida();
    this.fase = 'jugando';
    this.cursor = { fila: 3, col: 3 };
    this.reloj.iniciar();
    if (this.pausado) this.reloj.pausar();
    this.canvas.style.cursor = 'default';
    this.avisar('Jugás con ' + BANDOS[clave].nombre + '. ¡Empezá! Hay 32 nodos activos.');
  }

  /**
   * Imágenes de las fichas del bando: la normal y la levantada (también
   * usada en los fantasmas). Mientras se elige, usa la tarjeta encendida.
   * @returns {{normal: HTMLCanvasElement, levantada: HTMLCanvasElement}}
   */
  get fichasBando() {
    const bando = BANDOS[this.bando || this.elegido];
    return {
      normal: this.recursos.fichas[bando.ficha],
      levantada: this.recursos.fichas[bando.fichaLevantada],
    };
  }

  /**
   * Color del bando elegido (o de la tarjeta encendida), en hex. Lo usan
   * la estela y la explosión.
   * @returns {string}
   */
  get colorBando() {
    return this.colores[BANDOS[this.bando || this.elegido].color];
  }

  /**
   * Frena el reloj (por ejemplo, mientras está abierta la ayuda). Si había
   * una ficha arrastrada, vuelve a su casilla.
   */
  pausar() {
    this.pausado = true;
    this.reloj.pausar();
    this.cancelarArrastre(performance.now());
  }

  /**
   * Vuelve a hacer correr el reloj después de una pausa.
   */
  reanudar() {
    this.pausado = false;
    this.reloj.reanudar();
  }

  /**
   * Indica si se puede tocar el tablero: partida en curso y sin pausa.
   * @returns {boolean}
   */
  get activo() {
    return this.fase === 'jugando' && !this.pausado;
  }

  // ---------------------------------------------------------------
  // Dibujo
  // ---------------------------------------------------------------

  /**
   * Un cuadro de la animación: revisa el tiempo y redibuja todo el canvas.
   * @param {number} t tiempo actual en ms (lo pasa requestAnimationFrame)
   */
  cuadro(t) {
    if (this.fase === 'jugando' && this.reloj.agotado()) {
      this.cancelarArrastre(t);
      this.seleccion = null;
      this.terminar('perdido', 'Se terminó el tiempo.');
    }

    const ctx = this.ctx;
    // El backing store mide ANCHO*dpr; con esta escala se dibuja en medidas lógicas.
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    dibujarFondo(ctx, this.recursos);

    // Temblor del tablero al comer una ficha: se corre unos px al azar.
    this.efectos.actualizar(t);
    const temblor = this.efectos.desplazamiento(t);
    ctx.save();
    ctx.translate(temblor.x, temblor.y);
    dibujarTablero(ctx, this.recursos);
    this.dibujarFantasmas(t);

    // El temblor que ya terminó se borra antes de dibujar, así la ficha no
    // falta durante un cuadro.
    if (this.rechazo && t - this.rechazo.inicio >= DURACION_RECHAZO_MS) this.rechazo = null;
    // Solo una ficha se dibuja aparte por vez: la arrastrada, la que vuelve o la que tiembla.
    const aparte = this.arrastre || this.vuelta || this.rechazo;
    const resaltada = this.seleccion ? { fila: this.seleccion.fila, col: this.seleccion.col } : null;
    const fichas = this.fichasBando;
    dibujarFichas(ctx, this.tablero, this.recursos, {
      levantada: aparte, resaltada, imagen: fichas.normal, imagenResaltada: fichas.levantada,
    });
    this.dibujarRechazo(t);
    this.efectos.dibujar(ctx, t);  // estelas, ondas y chispas, encima de las fichas
    this.dibujarVuelta(t);
    this.dibujarArrastre();
    this.dibujarCursor();
    ctx.restore();

    dibujarHud(ctx, {
      restanteMs: this.reloj.restante(),
      limiteMs: TIEMPO_LIMITE_MS,
      movimientos: this.movimientos,
      fichas: this.tablero.contarFichas(),
      saltos: this.tablero.contarSaltos(),
      t,
    }, this.colores, this.fuentes);

    if (this.fase === 'eligiendo') {
      dibujarSeleccion(ctx, this.recursos, this.colores, this.fuentes, {
        elegido: this.elegido, t, conFoco: this.conFoco,
      });
    } else if (this.fase !== 'jugando') {
      this.dibujarFin();
    }
    requestAnimationFrame(this.cuadro);
  }

  /**
   * Fantasmas en los destinos de la ficha levantada (con el mouse o con el
   * teclado). Se enciende el que recibiría la ficha al soltarla.
   * @param {number} t
   */
  dibujarFantasmas(t) {
    const levantada = this.arrastre || this.seleccion;
    if (!levantada) return;
    const encendido = this.arrastre ? this.destinoBajoFicha() : this.cursor;
    levantada.movimientos.forEach((m) => {
      const prendido = Boolean(encendido) && encendido.fila === m.fila && encendido.col === m.col;
      dibujarFantasma(this.ctx, m.fila, m.col, this.recursos, t, prendido, this.fichasBando.levantada);
    });
  }

  /**
   * Ficha sin saltos que tiembla de lado a lado y se va calmando.
   * @param {number} t
   */
  dibujarRechazo(t) {
    if (!this.rechazo) return;
    const avance = (t - this.rechazo.inicio) / DURACION_RECHAZO_MS;
    const { x, y } = centroDeCelda(this.rechazo.fila, this.rechazo.col);
    const corrimiento = Math.sin(avance * Math.PI * 6) * 5 * (1 - avance);
    dibujarFicha(this.ctx, this.fichasBando.normal, x + corrimiento, y);
  }

  /**
   * Ficha que vuelve deslizándose a su casilla después de un soltado no válido.
   * @param {number} t
   */
  dibujarVuelta(t) {
    if (!this.vuelta) return;
    const avance = clamp((t - this.vuelta.inicio) / DURACION_VUELTA_MS);
    const destino = centroDeCelda(this.vuelta.fila, this.vuelta.col);
    const suave = easeOut(avance);
    const x = this.vuelta.x + (destino.x - this.vuelta.x) * suave;
    const y = this.vuelta.y + (destino.y - this.vuelta.y) * suave;
    dibujarFicha(this.ctx, this.fichasBando.normal, x, y);
    if (avance >= 1) this.vuelta = null;
  }

  /**
   * Ficha arrastrada: sigue al puntero, un poco más grande y con sombra.
   */
  dibujarArrastre() {
    if (!this.arrastre) return;
    const { x, y } = this.posicionArrastre();
    const ctx = this.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(x, y + 10, RADIO_FICHA, RADIO_FICHA * 0.55, 0, 0, Math.PI * 2);
    ctx.fillStyle = conAlfa(this.colores.descargado, 0.6);
    ctx.fill();
    ctx.restore();
    dibujarFicha(ctx, this.fichasBando.levantada, x, y - 6, 1.1);
  }

  /**
   * Anillo del cursor de teclado. Solo se ve si el canvas tiene foco de teclado.
   */
  dibujarCursor() {
    if (!this.conFoco || this.fase !== 'jugando') return;
    const { x, y } = centroDeCelda(this.cursor.fila, this.cursor.col);
    const ctx = this.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, RADIO_FICHA + 9, 0, Math.PI * 2);
    ctx.strokeStyle = this.colores.textoClaro;
    ctx.lineWidth = 3;
    ctx.shadowColor = this.colores.acento;
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Final provisorio: un velo oscuro con título y subtítulo. La Fase 3 lo
   * reemplaza por las pantallas de victoria y derrota.
   */
  dibujarFin() {
    const ctx = this.ctx;
    const color = this.fase === 'ganado' ? this.colores.acento : this.colores.activo;
    ctx.fillStyle = conAlfa(this.colores.fondo, 0.8);
    ctx.fillRect(0, 0, ANCHO, ALTO);
    texto(ctx, TITULOS_FIN[this.fase], ANCHO / 2, ALTO / 2 - 10, {
      fuente: '700 52px ' + this.fuentes.titulo, color, alinear: 'center', espaciado: 4, brillo: color, desenfoque: 20,
    });
    texto(ctx, this.subtitulo, ANCHO / 2, ALTO / 2 + 40, {
      fuente: '600 22px ' + this.fuentes.ui, color: this.colores.textoClaro, alinear: 'center',
    });
    texto(ctx, 'Apretá Reiniciar (o R) para elegir bando y jugar de nuevo.', ANCHO / 2, ALTO / 2 + 80, {
      fuente: '600 16px ' + this.fuentes.ui, color: this.colores.textoTenue, alinear: 'center',
    });
    dibujarScanlines(ctx, this.recursos);
  }

  // ---------------------------------------------------------------
  // Reglas de la partida
  // ---------------------------------------------------------------

  /**
   * Hace el salto de origen a destino, cuenta el movimiento, hace explotar
   * la ficha comida y revisa si terminó la partida.
   * @param {{fila: number, col: number}} origen
   * @param {{fila: number, col: number}} destino
   * @param {number} t
   */
  jugar(origen, destino, t) {
    if (!this.tablero.mover(origen, destino)) return;
    this.movimientos++;
    // La ficha comida es la del medio entre el origen y el destino.
    const comida = centroDeCelda((origen.fila + destino.fila) / 2, (origen.col + destino.col) / 2);
    this.efectos.explotar(comida.x, comida.y, this.colorBando, this.fichasBando.normal, t);
    this.cursor = { fila: destino.fila, col: destino.col };

    const estado = this.tablero.estado();
    if (estado === 'ganado') this.terminar('ganado', 'Quedó un solo nodo.');
    else if (estado === 'sin-saltos') this.terminar('perdido', 'No quedan saltos válidos.');
    else {
      this.avisar('Salto hecho. Quedan ' + this.tablero.contarFichas() + ' nodos y '
        + this.tablero.contarSaltos() + ' saltos posibles.');
    }
  }

  /**
   * Termina la partida: congela el reloj, guarda el resultado y lo avisa.
   * @param {'ganado' | 'perdido'} fase
   * @param {string} subtitulo el motivo, en una frase
   */
  terminar(fase, subtitulo) {
    this.reloj.congelar();
    this.fase = fase;
    this.subtitulo = subtitulo;
    const titulo = fase === 'ganado' ? 'Sistema restaurado' : 'Sistema corrupto';
    this.avisar(titulo + '. ' + subtitulo);
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
   * Posición actual de la ficha arrastrada: el puntero menos el punto donde se la agarró.
   * @returns {{x: number, y: number}}
   */
  posicionArrastre() {
    return { x: this.arrastre.px - this.arrastre.difX, y: this.arrastre.py - this.arrastre.difY };
  }

  /**
   * Destino válido que está debajo de la ficha arrastrada, o null.
   * @returns {{fila: number, col: number} | null}
   */
  destinoBajoFicha() {
    if (!this.arrastre) return null;
    const { x, y } = this.posicionArrastre();
    return this.arrastre.movimientos.find((m) => {
      const centro = centroDeCelda(m.fila, m.col);
      return Math.hypot(x - centro.x, y - centro.y) < CELDA * 0.55;
    }) || null;
  }

  /**
   * Suelta la ficha arrastrada sin mover nada: vuelve deslizándose a su
   * casilla (o de golpe, si se prefiere menos movimiento).
   * @param {number} t
   */
  cancelarArrastre(t) {
    if (!this.arrastre) return;
    const { x, y } = this.posicionArrastre();
    if (!prefiereMenosMovimiento()) {
      this.vuelta = { fila: this.arrastre.fila, col: this.arrastre.col, x, y, inicio: t };
    }
    this.efectos.cortarEstela();
    this.arrastre = null;
    this.canvas.style.cursor = 'default';
  }

  /**
   * Botón del mouse apretado. En la selección elige el bando de la tarjeta
   * tocada; jugando, agarra la ficha si tiene saltos (si no, tiembla).
   * @param {PointerEvent} evento
   */
  alPresionar(evento) {
    if (evento.button !== 0) return;
    const { x, y } = this.aLogico(evento);
    if (this.fase === 'eligiendo') {
      const clave = this.pausado ? null : bandoEn(x, y);
      if (clave) this.elegirBando(clave);
      return;
    }
    if (!this.activo) return;
    const celda = this.celdaEn(x, y);
    if (!celda || this.tablero.grilla[celda.fila][celda.col] !== true) return;
    const t = performance.now();
    const movimientos = this.tablero.movimientosDesde(celda.fila, celda.col);
    this.seleccion = null;  // el mouse le gana a una selección hecha con el teclado
    this.vuelta = null;
    if (movimientos.length === 0) {
      this.rechazar(celda, t);
      return;
    }
    this.rechazo = null;
    const centro = centroDeCelda(celda.fila, celda.col);
    this.arrastre = { ...celda, movimientos, px: x, py: y, difX: x - centro.x, difY: y - centro.y };
    this.efectos.agregarEstela(centro.x, centro.y, this.colorBando, t);
    // Con la captura, los eventos siguen llegando al canvas aunque el puntero salga de él.
    this.canvas.setPointerCapture(evento.pointerId);
    this.canvas.style.cursor = 'grabbing';
  }

  /**
   * Puntero en movimiento: en la selección enciende la tarjeta de abajo;
   * jugando, mueve la ficha arrastrada o cambia el cursor del mouse.
   * @param {PointerEvent} evento
   */
  alMover(evento) {
    const { x, y } = this.aLogico(evento);
    if (this.fase === 'eligiendo') {
      const clave = bandoEn(x, y);
      if (clave) this.elegido = clave;
      this.canvas.style.cursor = clave ? 'pointer' : 'default';
      return;
    }
    if (this.arrastre) {
      this.arrastre.px = x;
      this.arrastre.py = y;
      const ficha = this.posicionArrastre();
      this.efectos.agregarEstela(ficha.x, ficha.y, this.colorBando, performance.now());
      return;
    }
    const celda = this.activo ? this.celdaEn(x, y) : null;
    const movible = celda && this.tablero.puedeMover(celda.fila, celda.col);
    this.canvas.style.cursor = movible ? 'grab' : 'default';
  }

  /**
   * Botón del mouse soltado: si la ficha está sobre un destino válido, salta;
   * si no, vuelve a su lugar.
   */
  alSoltar() {
    if (!this.arrastre) return;
    const t = performance.now();
    const destino = this.destinoBajoFicha();
    if (!destino) {
      this.cancelarArrastre(t);
      return;
    }
    const origen = { fila: this.arrastre.fila, col: this.arrastre.col };
    // La estela termina justo en el centro de la casilla de destino.
    const centro = centroDeCelda(destino.fila, destino.col);
    this.efectos.agregarEstela(centro.x, centro.y, this.colorBando, t);
    this.efectos.cortarEstela();
    this.arrastre = null;
    this.canvas.style.cursor = 'default';
    this.jugar(origen, destino, t);
  }

  /**
   * El navegador canceló el puntero (por ejemplo, otra app tomó el foco):
   * la ficha vuelve a su casilla.
   */
  alCancelar() {
    this.cancelarArrastre(performance.now());
  }

  /**
   * Hace temblar una ficha que no tiene saltos y lo avisa.
   * @param {{fila: number, col: number}} celda
   * @param {number} t
   */
  rechazar(celda, t) {
    this.vuelta = null;  // una sola ficha animada por vez (ver cuadro)
    if (!prefiereMenosMovimiento()) this.rechazo = { ...celda, inicio: t };
    this.avisar('Ese nodo no tiene saltos posibles.');
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
    this.conFoco = enfocado && this.canvas.matches(':focus-visible');
    if (!enfocado) this.cancelarSeleccion(false);
  }

  /**
   * Tecla apretada con el canvas enfocado. Solo se cancela la acción del
   * navegador (scrollear) para las teclas que usa el juego.
   * @param {KeyboardEvent} evento
   */
  alTeclear(evento) {
    const tecla = evento.key;
    if (tecla === 'r' || tecla === 'R') {
      if (this.fase !== 'eligiendo') this.reiniciar();
      return;
    }
    if (this.fase === 'eligiendo') {
      if (!this.pausado) this.teclearSeleccion(evento);
      return;
    }
    if (!this.activo) return;
    if (FLECHAS[tecla]) {
      evento.preventDefault();
      this.conFoco = true;
      this.moverCursor(FLECHAS[tecla]);
    } else if (tecla === 'Enter' || tecla === ' ') {
      evento.preventDefault();
      this.conFoco = true;
      if (this.seleccion) this.soltarSeleccion();
      else this.levantarConTeclado();
    } else if (tecla === 'Escape' && this.seleccion) {
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
    const tecla = evento.key;
    if (tecla in FLECHAS_BANDO) {
      evento.preventDefault();
      this.conFoco = true;
      const actual = ORDEN_BANDOS.indexOf(this.elegido);
      const indice = clamp(actual + FLECHAS_BANDO[tecla], 0, ORDEN_BANDOS.length - 1);
      if (indice !== actual) {
        this.elegido = ORDEN_BANDOS[indice];
        const bando = BANDOS[this.elegido];
        this.avisar(bando.nombre + '. ' + bando.lema + '.');
      }
    } else if (tecla === 'Enter' || tecla === ' ') {
      evento.preventDefault();
      this.elegirBando(this.elegido);
    }
  }

  /**
   * Mueve el cursor una casilla en la dirección dada. Sin ficha levantada,
   * saltea lo que está fuera de la cruz; con una levantada, solo va a sus destinos.
   * @param {number[]} direccion [filas, columnas]
   */
  moverCursor([df, dc]) {
    if (this.seleccion) {
      const { fila, col, movimientos } = this.seleccion;
      const destino = movimientos.find((m) => m.fila === fila + 2 * df && m.col === col + 2 * dc);
      if (destino) this.cursor = { fila: destino.fila, col: destino.col };
      return;
    }
    let fila = this.cursor.fila + df;
    let col = this.cursor.col + dc;
    while (fila >= 0 && fila < 7 && col >= 0 && col < 7) {
      if (Tablero.esCeldaValida(fila, col)) {
        this.cursor = { fila, col };
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
    const { fila, col } = this.cursor;
    if (this.tablero.grilla[fila][col] !== true) {
      this.avisar('En esa casilla no hay un nodo.');
      return;
    }
    const movimientos = this.tablero.movimientosDesde(fila, col);
    if (movimientos.length === 0) {
      this.rechazar({ fila, col }, performance.now());
      return;
    }
    this.seleccion = { fila, col, movimientos };
    this.cursor = { fila: movimientos[0].fila, col: movimientos[0].col };
    const plural = movimientos.length === 1 ? ' destino posible.' : ' destinos posibles.';
    this.avisar('Nodo fila ' + (fila + 1) + ', columna ' + (col + 1) + ' levantado. '
      + movimientos.length + plural);
  }

  /**
   * Suelta la ficha levantada con el teclado en el destino del cursor.
   */
  soltarSeleccion() {
    const origen = { fila: this.seleccion.fila, col: this.seleccion.col };
    this.seleccion = null;
    this.jugar(origen, this.cursor, performance.now());
  }

  /**
   * Deja la ficha levantada con el teclado en su lugar y vuelve el cursor a ella.
   * @param {boolean} anunciar si se avisa a la región en vivo
   */
  cancelarSeleccion(anunciar) {
    if (!this.seleccion) return;
    this.cursor = { fila: this.seleccion.fila, col: this.seleccion.col };
    this.seleccion = null;
    if (anunciar) this.avisar('Nodo soltado sin moverlo.');
  }
}
