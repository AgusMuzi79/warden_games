// Tablero.js — La grilla del Peg Solitaire y sus reglas de salto, sin dibujo
//
// Qué hace: guarda qué casillas tienen ficha y aplica las reglas del tablero
// (qué saltos se pueden hacer, mover una ficha, contar fichas y saltos). No
// sabe nada de tiempo, bando ni fases de la partida: eso es de PegModel, que
// usa un Tablero. No toca el canvas ni el DOM.
// Por qué separado de PegModel: las reglas del tablero se pueden probar solas
// y la partida (fase, reloj, resultado) queda más corta y fácil de explicar.
//
// La grilla es de 7x7. Cada casilla vale:
//   true  -> hay una ficha
//   false -> hueco vacío
//   null  -> fuera de la cruz (no es parte del tablero)

// Las cuatro direcciones en las que se puede saltar: arriba, abajo, izquierda, derecha.
const DIRECCIONES = [[-1, 0], [1, 0], [0, -1], [0, 1]];

/**
 * Grilla de 7x7 y reglas de salto: saltos válidos, mover fichas y contar
 * fichas y saltos. No dibuja nada.
 */
export class Tablero {
  /**
   * Crea el tablero ya listo para jugar (cruz llena, centro vacío).
   */
  constructor() {
    this.grilla = [];
    this.reiniciar();
  }

  /**
   * Indica si la casilla (fila, col) pertenece a la cruz de 33 posiciones.
   * Una casilla es parte de la cruz si su fila o su columna está entre 2 y 4.
   * @param {number} fila
   * @param {number} col
   * @returns {boolean}
   */
  static esCeldaValida(fila, col) {
    const dentro = fila >= 0 && fila < 7 && col >= 0 && col < 7;
    const filaDelMedio = fila >= 2 && fila <= 4;
    const colDelMedio = col >= 2 && col <= 4;
    return dentro && (filaDelMedio || colDelMedio);
  }

  /**
   * Deja el tablero en la posición inicial: todas las fichas puestas
   * menos la del centro.
   */
  reiniciar() {
    this.grilla = [];
    for (let fila = 0; fila < 7; fila++) {
      this.grilla[fila] = [];
      for (let col = 0; col < 7; col++) {
        this.grilla[fila][col] = Tablero.esCeldaValida(fila, col) ? true : null;
      }
    }
    this.grilla[3][3] = false;
  }

  /**
   * Llama a fn(fila, col) por cada casilla de la cruz.
   * @param {(fila: number, col: number) => void} fn
   */
  recorrer(fn) {
    for (let fila = 0; fila < 7; fila++) {
      for (let col = 0; col < 7; col++) {
        if (Tablero.esCeldaValida(fila, col)) fn(fila, col);
      }
    }
  }

  /**
   * Indica si hay una ficha en la casilla (fila, col).
   * @param {number} fila
   * @param {number} col
   * @returns {boolean}
   */
  hayFicha(fila, col) {
    return Tablero.esCeldaValida(fila, col) && this.grilla[fila][col] === true;
  }

  /**
   * Saltos posibles desde (fila, col): saltar una ficha vecina y caer en
   * un hueco vacío que está dos casillas más allá.
   * @param {number} fila
   * @param {number} col
   * @returns {{fila: number, col: number, comida: {fila: number, col: number}}[]}
   */
  movimientosDesde(fila, col) {
    if (!this.hayFicha(fila, col)) return [];
    const movimientos = [];
    for (const [df, dc] of DIRECCIONES) {
      const destinoFila = fila + 2 * df;
      const destinoCol = col + 2 * dc;
      const medioFila = fila + df;
      const medioCol = col + dc;
      if (!Tablero.esCeldaValida(destinoFila, destinoCol)) continue;
      const destinoVacio = this.grilla[destinoFila][destinoCol] === false;
      const medioConFicha = this.grilla[medioFila][medioCol] === true;
      if (destinoVacio && medioConFicha) {
        movimientos.push({
          fila: destinoFila,
          col: destinoCol,
          comida: { fila: medioFila, col: medioCol },
        });
      }
    }
    return movimientos;
  }

  /**
   * Indica si la ficha de (fila, col) tiene al menos un salto posible.
   * @param {number} fila
   * @param {number} col
   * @returns {boolean}
   */
  puedeMover(fila, col) {
    return this.movimientosDesde(fila, col).length > 0;
  }

  /**
   * Mueve una ficha si el salto es válido: la ficha pasa al destino y la
   * del medio se saca. Si el salto no vale, no cambia nada. Es solo el
   * movimiento sobre la grilla; el conteo y el fin de partida los hace
   * PegModel.jugar().
   * @param {{fila: number, col: number}} origen
   * @param {{fila: number, col: number}} destino
   * @returns {{fila: number, col: number} | null} la casilla comida, o null
   */
  mover(origen, destino) {
    const posibles = this.movimientosDesde(origen.fila, origen.col);
    const elegido = posibles.find((m) => m.fila === destino.fila && m.col === destino.col);
    if (!elegido) return null;
    this.grilla[origen.fila][origen.col] = false;
    this.grilla[elegido.comida.fila][elegido.comida.col] = false;
    this.grilla[destino.fila][destino.col] = true;
    return elegido.comida;
  }

  /**
   * Cuenta las fichas que quedan en el tablero.
   * @returns {number}
   */
  contarFichas() {
    let fichas = 0;
    this.recorrer((fila, col) => {
      if (this.grilla[fila][col] === true) fichas++;
    });
    return fichas;
  }

  /**
   * Cuenta todos los saltos posibles en el tablero, sumando los de cada ficha.
   * @returns {number}
   */
  contarSaltos() {
    let saltos = 0;
    this.recorrer((fila, col) => {
      saltos += this.movimientosDesde(fila, col).length;
    });
    return saltos;
  }

  /**
   * Devuelve la casilla de la última ficha encontrada al recorrer el
   * tablero. Sirve para resaltarla cuando queda una sola.
   * @returns {{fila: number, col: number} | null}
   */
  ultimaFicha() {
    let ultima = null;
    this.recorrer((fila, col) => {
      if (this.grilla[fila][col] === true) ultima = { fila, col };
    });
    return ultima;
  }

  /**
   * Deja solo dos fichas, en (3, 1) y (3, 2), con el centro (3, 3) vacío.
   * Quedan dos saltos posibles y los dos ganan, porque dejan una sola ficha:
   * (3, 1) sobre (3, 2) hasta el centro ("conexión perfecta") o (3, 2) sobre
   * (3, 1) hasta (3, 0). Lo usa PegModel.hackear().
   * @returns {{fila: number, col: number}[]} las casillas de las fichas que se sacaron
   */
  dejarDosFichas() {
    const quitadas = [];
    this.recorrer((fila, col) => {
      const queda = fila === 3 && (col === 1 || col === 2);
      if (this.grilla[fila][col] === true && !queda) quitadas.push({ fila, col });
      this.grilla[fila][col] = queda;
    });
    return quitadas;
  }

  /**
   * Cómo está el tablero: 'ganado' si queda una sola ficha, 'sin-saltos' si
   * quedan varias pero ningún salto posible, 'jugando' en cualquier otro caso.
   * @returns {'ganado' | 'sin-saltos' | 'jugando'}
   */
  estado() {
    if (this.contarFichas() === 1) return 'ganado';
    if (this.contarSaltos() === 0) return 'sin-saltos';
    return 'jugando';
  }
}
