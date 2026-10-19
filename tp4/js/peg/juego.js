// juego.js — Estado de la partida y loop de dibujo
//
// Qué hace: junta las piezas de los otros módulos. Tiene el Tablero (las
// reglas), el Reloj (tiempo con pausa), cuenta los movimientos y sabe en qué
// fase está la partida (eligiendo bando, jugando, terminando o terminada).
// En cada cuadro (requestAnimationFrame) redibuja todo el canvas.
// Los efectos (explosión, estela, temblor) viven en efectos.js, las
// pantallas (bandos y fin) en pantallas.js y el mouse y el teclado en
// entrada.js, que cambia el estado de este objeto (arrastre, seleccion,
// cursor...) y llama a sus métodos (elegirBando, jugar, reiniciar...).
// Por qué una clase: el estado vive en un solo objeto (this) y cada método
// hace una cosa; principal.js crea el Juego y le conecta una Entrada.
//
// Coordenadas "lógicas": se dibuja siempre en 1200x760 (ANCHO x ALTO),
// aunque el CSS muestre el canvas más chico.

import { conAlfa, easeOut, clamp, prefiereMenosMovimiento } from './utiles.js';
import {
  CELDA, RADIO_FICHA, TIEMPO_LIMITE_MS,
  DURACION_VUELTA_MS, DURACION_RECHAZO_MS, DEMORA_FIN_MS, obtenerDpr,
  BANDOS, ORDEN_BANDOS,
} from './config.js';
import { Tablero } from './tablero.js';
import { Reloj } from './reloj.js';
import {
  dibujarFondo, dibujarTablero, dibujarFichas, dibujarFicha, dibujarFantasma, centroDeCelda,
} from './dibujo.js';
import { Efectos } from './efectos.js';
import { dibujarHud } from './hud.js';
import { dibujarSeleccion, dibujarFin, avisoDeFin } from './pantallas.js';

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
    this.fase = 'eligiendo';        // 'eligiendo' | 'jugando' | 'terminando' | 'ganado' | 'perdido'
    this.fin = null;                // datos de la pantalla de fin (ver terminar)
    this.finEn = 0;                 // instante en que se muestra la pantalla de fin
    this.botonEncendido = false;    // mouse sobre "JUGAR DE NUEVO"
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
   * "JUGAR DE NUEVO" (botón del canvas, Enter o Espacio en la pantalla de
   * fin): vuelve a la selección de bando, igual que Reiniciar.
   */
  jugarDeNuevo() {
    this.mostrarSeleccion();
    this.avisar('Nueva partida. Elegí tu bando: Usuarios o Programas de Clu.');
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

  /**
   * Indica si se está mostrando una pantalla de fin (victoria o derrota).
   * @returns {boolean}
   */
  get terminado() {
    return this.fase === 'ganado' || this.fase === 'perdido';
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
      this.terminar('perdido', 'tiempo', t);
    }
    // Pasada la demora, se muestra la pantalla de fin.
    if (this.fase === 'terminando' && t >= this.finEn) this.mostrarFin(t);

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
    } else if (this.terminado) {
      dibujarFin(ctx, this.recursos, this.colores, this.fuentes, this.fin, {
        t, dpr: this.dpr, imagen: this.fichasBando.levantada,
        encendido: this.botonEncendido, conFoco: this.conFoco,
      });
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
    if (estado === 'ganado') {
      // Conexión perfecta si el último nodo quedó en el centro (3, 3).
      const ultima = this.tablero.ultimaFicha();
      const central = ultima.fila === 3 && ultima.col === 3;
      this.terminar('ganado', central ? 'central' : 'un-nodo', t);
    } else if (estado === 'sin-saltos') {
      this.terminar('perdido', 'sin-saltos', t);
    } else {
      this.avisar('Salto hecho. Quedan ' + this.tablero.contarFichas() + ' nodos y '
        + this.tablero.contarSaltos() + ' saltos posibles.');
    }
  }

  /**
   * Termina la partida: congela el reloj, guarda los datos de la pantalla
   * de fin y la programa para dentro de DEMORA_FIN_MS (fase 'terminando'),
   * así se alcanza a ver la última explosión. Con movimiento reducido no
   * hay demora.
   * @param {'ganado' | 'perdido'} resultado
   * @param {'central' | 'un-nodo' | 'sin-saltos' | 'tiempo'} motivo
   * @param {number} t tiempo actual en ms
   */
  terminar(resultado, motivo, t) {
    if (this.fase !== 'jugando') return;
    this.reloj.congelar();
    this.seleccion = null;
    this.fase = 'terminando';
    this.fin = {
      resultado,
      motivo,
      // Tope en el límite: si se agotó, el último cuadro pudo pasarse unos ms.
      tiempoMs: Math.min(this.reloj.transcurrido(), this.reloj.limiteMs),
      movimientos: this.movimientos,
      nodos: this.tablero.contarFichas(),
      ultima: resultado === 'ganado' ? this.tablero.ultimaFicha() : null,
      mostradoEn: 0,
    };
    this.finEn = t + (prefiereMenosMovimiento() ? 0 : DEMORA_FIN_MS);
  }

  /**
   * Muestra la pantalla de fin y avisa el resultado con las estadísticas.
   * @param {number} t tiempo actual en ms
   */
  mostrarFin(t) {
    this.fase = this.fin.resultado;
    this.fin.mostradoEn = t;
    this.botonEncendido = false;
    this.avisar(avisoDeFin(this.fin));
  }

  // ---------------------------------------------------------------
  // Arrastre (lo usan el dibujo, la pausa y entrada.js)
  // ---------------------------------------------------------------

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
}
