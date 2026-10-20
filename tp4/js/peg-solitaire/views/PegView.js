// PegView.js — Vista del Peg Solitaire: dibuja el modelo en el canvas
//
// Qué hace: en cada cuadro toma el estado del modelo (PegModel) y lo pinta:
// fondo y tablero vacío, fichas, hints de destino (los "fantasmas"), efectos
// (explosión, estela, temblor), el HUD con el tiempo, y las pantallas de
// selección de bando y de fin. También escribe los avisos para lectores de
// pantalla y responde "qué hay en este punto del canvas" (geometría).
// No decide reglas: no sabe qué salto es válido ni cuándo termina la partida,
// solo muestra lo que el modelo y el controlador le pasan.
// Por qué una clase aparte: el dibujo cambia por motivos distintos que las
// reglas (un color, una animación), y así cada archivo se explica por separado.
//
// Quién le pasa qué:
//   - el modelo (PegModel): grilla, movimientos, fase, bando, tiempo y fin;
//   - el controlador (PegController): el estado de la interacción, que no es
//     de las reglas sino del usuario (ficha arrastrada, cursor de teclado,
//     tarjeta encendida, foco). Llega en el objeto `ui` de render().
// Las funciones de dibujo concretas viven en dibujo.js, hud.js, efectos.js,
// pantallaSeleccion.js y pantallaFin.js (que elige entre pantallaVictoria.js y
// pantallaDerrota.js); esta clase las orquesta.
//
// Coordenadas "lógicas": se dibuja siempre en 1200x760 (ANCHO x ALTO),
// aunque el CSS muestre el canvas más chico.

import { conAlfa, easeOut, clamp, prefiereMenosMovimiento } from '../utiles.js';
import {
  ANCHO, ALTO, TABLERO_X, CELDA, OFFSET, RADIO_FICHA,
  DURACION_VUELTA_MS, DURACION_RECHAZO_MS, obtenerDpr, BANDOS,
} from '../config.js';
import { Tablero } from '../models/Tablero.js';
import {
  dibujarFondo, dibujarTablero, dibujarFichas, dibujarFicha, dibujarFantasma, centroDeCelda,
} from './dibujo.js';
import { Efectos } from './efectos.js';
import { dibujarHud } from './hud.js';
import { dibujarSeleccion, bandoEn } from './pantallaSeleccion.js';
import { dibujarFin, avisoDeFin, botonFinEn } from './pantallaFin.js';

/**
 * Vista del juego: dibuja el modelo en el canvas y guarda solo lo que es
 * puramente visual (efectos y las animaciones de la ficha que vuelve o tiembla).
 */
export class PegView {
  /**
   * Ajusta la resolución del canvas a la pantalla y deja la vista lista.
   * @param {HTMLCanvasElement} canvas el canvas de la página
   * @param {object} recursos lo que devuelve prepararRecursos() (dibujo.js)
   * @param {Record<string, string>} colores lo que devuelve obtenerColores()
   * @param {{titulo: string, ui: string}} fuentes lo que devuelve obtenerFuentes()
   * @param {HTMLElement} regionEstado región en vivo (role="status") donde se escriben los avisos
   */
  constructor(canvas, recursos, colores, fuentes, regionEstado) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.recursos = recursos;
    this.colores = colores;
    this.fuentes = fuentes;
    this.regionEstado = regionEstado;
    this.dpr = obtenerDpr();
    this.efectos = new Efectos();
    this.vuelta = null;    // { fila, col, x, y, inicio }: ficha que vuelve a su casilla
    this.rechazo = null;   // { fila, col, inicio }: ficha sin saltos que tiembla

    // Solo los atributos: el tamaño en pantalla lo decide el CSS.
    canvas.width = ANCHO * this.dpr;
    canvas.height = ALTO * this.dpr;
  }

  // ---------------------------------------------------------------
  // Datos del bando y avisos
  // ---------------------------------------------------------------

  /**
   * Imágenes de las fichas de un bando: la normal y la levantada (también
   * usada en los fantasmas).
   * @param {string} clave 'usuarios' o 'clu'
   * @returns {{normal: HTMLCanvasElement, levantada: HTMLCanvasElement}}
   */
  fichasDe(clave) {
    const bando = BANDOS[clave];
    return {
      normal: this.recursos.fichas[bando.ficha],
      levantada: this.recursos.fichas[bando.fichaLevantada],
    };
  }

  /**
   * Color de un bando, en hex. Lo usan la estela y la explosión.
   * @param {string} clave 'usuarios' o 'clu'
   * @returns {string}
   */
  colorDe(clave) {
    return this.colores[BANDOS[clave].color];
  }

  /**
   * Escribe un aviso en la región en vivo (role="status"). Se vacía primero
   * y se escribe un instante después: así el lector de pantalla repite un
   * aviso aunque sea igual al anterior.
   * @param {string} texto
   */
  avisar(texto) {
    this.regionEstado.textContent = '';
    setTimeout(() => { this.regionEstado.textContent = texto; }, 50);
  }

  /**
   * Avisa el resultado de la partida (con motivo, tiempo y movimientos) en
   * la región en vivo, para quien usa lector de pantalla.
   * @param {object} fin el objeto de la pantalla de fin
   */
  avisarFin(fin) {
    this.avisar(avisoDeFin(fin));
  }

  /**
   * Cambia el cursor del mouse sobre el canvas ('default', 'pointer', 'grab'...).
   * @param {string} tipo valor de la propiedad CSS cursor
   */
  fijarCursor(tipo) {
    this.canvas.style.cursor = tipo;
  }

  // ---------------------------------------------------------------
  // Geometría: qué hay en cada punto del canvas
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
   * Centro de una casilla en coordenadas lógicas del canvas.
   * @param {number} fila
   * @param {number} col
   * @returns {{x: number, y: number}}
   */
  centroDeCelda(fila, col) {
    return centroDeCelda(fila, col);
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
   * Bando cuya tarjeta está bajo el punto (x, y) en la selección, o null.
   * @param {number} x
   * @param {number} y
   * @returns {string | null} 'usuarios', 'clu' o null
   */
  bandoEn(x, y) {
    return bandoEn(x, y);
  }

  /**
   * Indica si el punto (x, y) cae sobre el botón "JUGAR DE NUEVO".
   * @param {number} x
   * @param {number} y
   * @param {object} fin el objeto de la pantalla de fin
   * @returns {boolean}
   */
  botonFinEn(x, y, fin) {
    return botonFinEn(x, y, fin);
  }

  /**
   * Posición actual de la ficha arrastrada: el puntero menos el punto donde se la agarró.
   * @param {{px: number, py: number, difX: number, difY: number}} arrastre
   * @returns {{x: number, y: number}}
   */
  posicionArrastre(arrastre) {
    return { x: arrastre.px - arrastre.difX, y: arrastre.py - arrastre.difY };
  }

  /**
   * Destino válido que está debajo de la ficha arrastrada, o null. Los
   * destinos válidos los calculó el modelo (arrastre.movimientos); acá solo
   * se mide cuál queda cerca de la ficha.
   * @param {{px: number, py: number, difX: number, difY: number, movimientos: {fila: number, col: number}[]}} arrastre
   * @returns {{fila: number, col: number} | null}
   */
  destinoBajoFicha(arrastre) {
    if (!arrastre) return null;
    const { x, y } = this.posicionArrastre(arrastre);
    return arrastre.movimientos.find((m) => {
      const centro = centroDeCelda(m.fila, m.col);
      return Math.hypot(x - centro.x, y - centro.y) < CELDA * 0.55;
    }) || null;
  }

  // ---------------------------------------------------------------
  // Animaciones que dispara el controlador
  // ---------------------------------------------------------------

  /**
   * Borra los efectos y las animaciones de ficha de la partida anterior.
   */
  limpiarAnimaciones() {
    this.efectos.limpiar();
    this.vuelta = null;
    this.rechazo = null;
  }

  /**
   * Frena la animación de la ficha que vuelve o que tiembla. Se usa al
   * agarrar una ficha: solo una se anima aparte por vez.
   */
  detenerAnimacionDeFicha() {
    this.vuelta = null;
    this.rechazo = null;
  }

  /**
   * Hace temblar una ficha que no tiene saltos. Con movimiento reducido no
   * anima nada.
   * @param {{fila: number, col: number}} celda
   * @param {number} t tiempo actual en ms
   */
  rechazar(celda, t) {
    this.vuelta = null;  // una sola ficha animada por vez (ver render)
    if (!prefiereMenosMovimiento()) this.rechazo = { ...celda, inicio: t };
  }

  /**
   * Hace volver deslizándose a su casilla a una ficha arrastrada que se
   * soltó sin mover nada (de golpe, si se prefiere menos movimiento).
   * @param {{fila: number, col: number, px: number, py: number, difX: number, difY: number}} arrastre
   * @param {number} t tiempo actual en ms
   */
  volverAlLugar(arrastre, t) {
    const { x, y } = this.posicionArrastre(arrastre);
    if (!prefiereMenosMovimiento()) {
      this.vuelta = { fila: arrastre.fila, col: arrastre.col, x, y, inicio: t };
    }
    this.efectos.cortarEstela();
  }

  /**
   * Explosión de la ficha comida (chispas, onda y temblor del tablero).
   * @param {{fila: number, col: number}} comida casilla de la ficha comida
   * @param {string} bando 'usuarios' o 'clu'
   * @param {number} t tiempo actual en ms
   */
  explotar(comida, bando, t) {
    const centro = centroDeCelda(comida.fila, comida.col);
    this.efectos.explotar(centro.x, centro.y, this.colorDe(bando), this.fichasDe(bando).normal, t);
  }

  /**
   * Suma un punto a la estela de luz de la ficha arrastrada.
   * @param {number} x
   * @param {number} y
   * @param {string} bando 'usuarios' o 'clu'
   * @param {number} t tiempo actual en ms
   */
  agregarEstela(x, y, bando, t) {
    this.efectos.agregarEstela(x, y, this.colorDe(bando), t);
  }

  /**
   * La ficha se soltó: la estela deja de crecer y se apaga sola.
   */
  cortarEstela() {
    this.efectos.cortarEstela();
  }

  // ---------------------------------------------------------------
  // Dibujo
  // ---------------------------------------------------------------

  /**
   * Dibuja un cuadro completo: fondo, tablero, fichas, hints, efectos, HUD
   * y, encima, la pantalla de selección o de fin si corresponde.
   * @param {import('../models/PegModel.js').PegModel} modelo el estado de la partida
   * @param {object} ui el estado de la interacción, que arma el controlador
   * @param {{fila: number, col: number, movimientos: object[], px: number, py: number, difX: number, difY: number} | null} ui.arrastre ficha arrastrada con el mouse
   * @param {{fila: number, col: number, movimientos: object[]} | null} ui.seleccion ficha levantada con el teclado
   * @param {{fila: number, col: number}} ui.cursor casilla marcada por el teclado
   * @param {string} ui.elegido tarjeta encendida en la selección de bando
   * @param {boolean} ui.conFoco el canvas tiene foco de teclado
   * @param {boolean} ui.botonEncendido el mouse está sobre "JUGAR DE NUEVO"
   * @param {object | null} ui.fin datos de la pantalla de fin (con mostradoEn), o null si todavía no se muestra
   * @param {number} t tiempo actual en ms (lo pasa requestAnimationFrame)
   */
  render(modelo, ui, t) {
    const ctx = this.ctx;
    // Mientras se elige se usa la tarjeta encendida; después, el bando elegido.
    const bando = modelo.bando || ui.elegido;
    const fichas = this.fichasDe(bando);

    // El backing store mide ANCHO*dpr; con esta escala se dibuja en medidas lógicas.
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    dibujarFondo(ctx, this.recursos);

    // Temblor del tablero al comer una ficha: se corre unos px al azar.
    this.efectos.actualizar(t);
    const temblor = this.efectos.desplazamiento(t);
    ctx.save();
    ctx.translate(temblor.x, temblor.y);
    dibujarTablero(ctx, this.recursos);
    this.dibujarFantasmas(ui, fichas.levantada, t);

    // El temblor que ya terminó se borra antes de dibujar, así la ficha no
    // falta durante un cuadro.
    if (this.rechazo && t - this.rechazo.inicio >= DURACION_RECHAZO_MS) this.rechazo = null;
    // Solo una ficha se dibuja aparte por vez: la arrastrada, la que vuelve o la que tiembla.
    const aparte = ui.arrastre || this.vuelta || this.rechazo;
    const resaltada = ui.seleccion ? { fila: ui.seleccion.fila, col: ui.seleccion.col } : null;
    dibujarFichas(ctx, modelo.tablero, this.recursos, {
      levantada: aparte, resaltada, imagen: fichas.normal, imagenResaltada: fichas.levantada,
    });
    this.dibujarRechazo(fichas.normal, t);
    this.efectos.dibujar(ctx, t);  // estelas, ondas y chispas, encima de las fichas
    this.dibujarVuelta(fichas.normal, t);
    this.dibujarArrastre(ui.arrastre, fichas.levantada);
    this.dibujarCursor(modelo, ui);
    ctx.restore();

    dibujarHud(ctx, {
      restanteMs: modelo.restanteMs(),
      limiteMs: modelo.limiteMs,
      movimientos: modelo.movimientos,
      fichas: modelo.tablero.contarFichas(),
      saltos: modelo.tablero.contarSaltos(),
      t,
    }, this.colores, this.fuentes);

    if (modelo.fase === 'eligiendo') {
      dibujarSeleccion(ctx, this.recursos, this.colores, this.fuentes, {
        elegido: ui.elegido, t, conFoco: ui.conFoco,
      });
    } else if (ui.fin) {
      dibujarFin(ctx, this.recursos, this.colores, this.fuentes, ui.fin, {
        t, dpr: this.dpr, imagen: fichas.levantada,
        encendido: ui.botonEncendido, conFoco: ui.conFoco,
      });
    }
  }

  /**
   * Hints de destino: fantasmas en las casillas donde se puede soltar la
   * ficha levantada (con el mouse o con el teclado). Se enciende el que
   * recibiría la ficha al soltarla.
   * @param {object} ui el estado de la interacción (ver render)
   * @param {HTMLCanvasElement} imagen ficha levantada del bando
   * @param {number} t
   */
  dibujarFantasmas(ui, imagen, t) {
    const levantada = ui.arrastre || ui.seleccion;
    if (!levantada) return;
    const encendido = ui.arrastre ? this.destinoBajoFicha(ui.arrastre) : ui.cursor;
    levantada.movimientos.forEach((m) => {
      const prendido = Boolean(encendido) && encendido.fila === m.fila && encendido.col === m.col;
      dibujarFantasma(this.ctx, m.fila, m.col, this.recursos, t, prendido, imagen);
    });
  }

  /**
   * Ficha sin saltos que tiembla de lado a lado y se va calmando.
   * @param {HTMLCanvasElement} imagen ficha normal del bando
   * @param {number} t
   */
  dibujarRechazo(imagen, t) {
    if (!this.rechazo) return;
    const avance = (t - this.rechazo.inicio) / DURACION_RECHAZO_MS;
    const { x, y } = centroDeCelda(this.rechazo.fila, this.rechazo.col);
    const corrimiento = Math.sin(avance * Math.PI * 6) * 5 * (1 - avance);
    dibujarFicha(this.ctx, imagen, x + corrimiento, y);
  }

  /**
   * Ficha que vuelve deslizándose a su casilla después de un soltado no válido.
   * @param {HTMLCanvasElement} imagen ficha normal del bando
   * @param {number} t
   */
  dibujarVuelta(imagen, t) {
    if (!this.vuelta) return;
    const avance = clamp((t - this.vuelta.inicio) / DURACION_VUELTA_MS);
    const destino = centroDeCelda(this.vuelta.fila, this.vuelta.col);
    const suave = easeOut(avance);
    const x = this.vuelta.x + (destino.x - this.vuelta.x) * suave;
    const y = this.vuelta.y + (destino.y - this.vuelta.y) * suave;
    dibujarFicha(this.ctx, imagen, x, y);
    if (avance >= 1) this.vuelta = null;
  }

  /**
   * Ficha arrastrada: sigue al puntero, un poco más grande y con sombra.
   * @param {object | null} arrastre
   * @param {HTMLCanvasElement} imagen ficha levantada del bando
   */
  dibujarArrastre(arrastre, imagen) {
    if (!arrastre) return;
    const { x, y } = this.posicionArrastre(arrastre);
    const ctx = this.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(x, y + 10, RADIO_FICHA, RADIO_FICHA * 0.55, 0, 0, Math.PI * 2);
    ctx.fillStyle = conAlfa(this.colores.descargado, 0.6);
    ctx.fill();
    ctx.restore();
    dibujarFicha(ctx, imagen, x, y - 6, 1.1);
  }

  /**
   * Anillo del cursor de teclado. Solo se ve si el canvas tiene foco de
   * teclado y la partida está en curso.
   * @param {import('../models/PegModel.js').PegModel} modelo
   * @param {{conFoco: boolean, cursor: {fila: number, col: number}}} ui
   */
  dibujarCursor(modelo, ui) {
    if (!ui.conFoco || modelo.fase !== 'jugando') return;
    const { x, y } = centroDeCelda(ui.cursor.fila, ui.cursor.col);
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
}
