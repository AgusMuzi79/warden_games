// PegModel.js — Modelo del Peg Solitaire: la partida, sin dibujo ni DOM
//
// Qué hace: guarda todo lo que es "la partida" y aplica las reglas del juego:
//   - el tablero (grilla y saltos, en Tablero.js),
//   - cuántos movimientos se hicieron y en qué fase está la partida,
//   - el bando elegido, el reloj con su límite y cómo terminó (victoria o derrota).
// No toca el canvas ni el DOM. No sabe nada de mouse, teclado ni animaciones:
// la Vista (views/PegView.js) lee este estado para dibujarlo y el Controlador
// (controllers/PegController.js) le pide cambios cuando el usuario hace algo.
// Por qué separado: las reglas se pueden probar solas (incluso desde Node) y
// el dibujo solo tiene que leer el estado, no decidir nada.
//
// Fases de la partida (this.fase):
//   'eligiendo' -> todavía no se eligió bando, el reloj está quieto
//   'jugando'   -> partida en curso
//   'terminado' -> se ganó o se perdió (el detalle está en this.fin)

import { TIEMPO_LIMITE_MS } from '../config.js';
import { Reloj } from './reloj.js';
import { Tablero } from './Tablero.js';

/**
 * Estado y reglas de la partida: tablero, movimientos, fase, bando, reloj y
 * resultado. No dibuja nada.
 */
export class PegModel {
  /**
   * Crea la partida en la fase 'eligiendo', con el tablero listo para jugar.
   * @param {() => number} [ahora] función que da la hora en ms (se la pasa al reloj; sirve para pruebas)
   */
  constructor(ahora) {
    this.tablero = new Tablero();
    this.reloj = new Reloj(TIEMPO_LIMITE_MS, ahora);
    this.pausado = false;
    this.bando = null;   // 'usuarios' | 'clu', se elige al empezar
    this.reiniciar();
  }

  /**
   * Deja la partida como al principio: tablero inicial, sin movimientos, en
   * la fase 'eligiendo' y con el reloj quieto en el tiempo completo. El bando
   * elegido antes se conserva (la selección arranca en él).
   */
  reiniciar() {
    this.tablero.reiniciar();
    this.movimientos = 0;
    this.fase = 'eligiendo';
    this.fin = null;   // { resultado, motivo, hackeado, tiempoMs, movimientos, nodos, ultima } al terminar
    this.hackeado = false;  // se usó "Hackear Sistema" en esta partida
    // Se arranca y se congela en el mismo instante: marca 0 ms jugados hasta que se elija bando.
    this.reloj.iniciar();
    this.reloj.congelar();
  }

  /**
   * Elige un bando y arranca la partida: tablero inicial y reloj desde cero.
   * @param {string} clave 'usuarios' o 'clu'
   */
  elegirBando(clave) {
    this.tablero.reiniciar();
    this.movimientos = 0;
    this.fin = null;
    this.hackeado = false;
    this.bando = clave;
    this.fase = 'jugando';
    this.reloj.iniciar();
    if (this.pausado) this.reloj.pausar();
  }

  /**
   * Frena el reloj (por ejemplo, mientras está abierta la ayuda).
   */
  pausar() {
    this.pausado = true;
    this.reloj.pausar();
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
   * Indica si la partida terminó (se ganó o se perdió).
   * @returns {boolean}
   */
  get terminado() {
    return this.fase === 'terminado';
  }

  /**
   * Indica si se puede usar "Hackear Sistema": partida en curso, sin pausa y
   * con más de dos fichas (con dos o menos no queda nada que sacar).
   * @returns {boolean}
   */
  get puedeHackear() {
    return this.activo && this.tablero.contarFichas() > 2;
  }

  /**
   * "Hackear Sistema": deja solo dos fichas, con un último salto para ganar
   * (ver Tablero.dejarDosFichas). No cuenta como movimiento ni toca el reloj:
   * la partida sigue, y gana quien haga ese salto. La partida queda marcada
   * como hackeada (this.hackeado), así la victoria lo dice.
   * @returns {{fila: number, col: number}[] | null}
   *   las casillas de las fichas que se sacaron, o null si no se puede hackear ahora
   */
  hackear() {
    if (!this.puedeHackear) return null;
    this.hackeado = true;
    return this.tablero.dejarDosFichas();
  }

  /**
   * Milisegundos que quedan antes del límite de tiempo.
   * @returns {number}
   */
  restanteMs() {
    return this.reloj.restante();
  }

  /**
   * Límite de tiempo de la partida, en milisegundos.
   * @returns {number}
   */
  get limiteMs() {
    return this.reloj.limiteMs;
  }

  /**
   * Hace el salto de origen a destino, cuenta el movimiento y revisa si
   * terminó la partida. Si el salto no es válido, no cambia nada.
   * @param {{fila: number, col: number}} origen
   * @param {{fila: number, col: number}} destino
   * @returns {{comida: {fila: number, col: number}, terminada: boolean} | null}
   *   la casilla comida y si el salto terminó la partida, o null si no valía
   *   (o si la partida no está en curso)
   */
  jugar(origen, destino) {
    if (this.fase !== 'jugando') return null;
    const comida = this.tablero.mover(origen, destino);
    if (!comida) return null;
    this.movimientos++;

    const estado = this.tablero.estado();
    if (estado === 'ganado') {
      // Conexión perfecta si el último nodo quedó en el centro (3, 3).
      const ultima = this.tablero.ultimaFicha();
      const central = ultima.fila === 3 && ultima.col === 3;
      this.terminar('ganado', central ? 'central' : 'un-nodo');
    } else if (estado === 'sin-saltos') {
      this.terminar('perdido', 'sin-saltos');
    }
    return { comida, terminada: this.terminado };
  }

  /**
   * Revisa si se agotó el tiempo y, si es así, da la partida por perdida.
   * Lo llama el Controlador en cada cuadro.
   * @returns {boolean} true si la partida terminó justo ahora por falta de tiempo
   */
  verificarTiempo() {
    if (this.fase !== 'jugando' || !this.reloj.agotado()) return false;
    this.terminar('perdido', 'tiempo');
    return true;
  }

  /**
   * Termina la partida: congela el reloj y guarda los datos del resultado.
   * @param {'ganado' | 'perdido'} resultado
   * @param {'central' | 'un-nodo' | 'sin-saltos' | 'tiempo'} motivo
   */
  terminar(resultado, motivo) {
    if (this.fase !== 'jugando') return;
    this.reloj.congelar();
    this.fase = 'terminado';
    this.fin = {
      resultado,
      motivo,
      hackeado: this.hackeado,
      // Tope en el límite: si se agotó, el último cuadro pudo pasarse unos ms.
      tiempoMs: Math.min(this.reloj.transcurrido(), this.reloj.limiteMs),
      movimientos: this.movimientos,
      nodos: this.tablero.contarFichas(),
      ultima: resultado === 'ganado' ? this.tablero.ultimaFicha() : null,
    };
  }
}
