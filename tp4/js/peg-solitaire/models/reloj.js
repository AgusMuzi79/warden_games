// reloj.js — Reloj de la partida, con pausa y límite de tiempo
//
// Qué hace: mide cuánto lleva la partida, se puede pausar (por ejemplo
// mientras está abierta la ayuda) y avisa cuando se pasa el límite.
// Por qué se calcula contra un instante de inicio y no sumando de a un tick:
// si el navegador demora un tick (pestaña en segundo plano), sumar se
// atrasaría; restar contra el inicio siempre da el tiempo real. Es el mismo
// criterio que el loading de la Home y el reloj de Blocka.
//
// La función que da la hora se recibe por parámetro (por defecto
// performance.now). Así las pruebas pueden usar un reloj falso.

/**
 * Reloj de la partida: mide el tiempo contra un instante de inicio, se
 * puede pausar y avisa cuando se pasa el límite.
 */
export class Reloj {
  /**
   * @param {number} limiteMs tiempo máximo de la partida
   * @param {() => number} [ahora] función que devuelve la hora en ms
   */
  constructor(limiteMs, ahora = () => performance.now()) {
    this.limiteMs = limiteMs;
    this.ahora = ahora;
    this.inicio = 0;           // instante en que arrancó (corrido por las pausas)
    this.pausadoEn = null;     // instante en que se pausó, o null si corre
    this.congeladoEn = null;   // tiempo final, o null si la partida sigue
  }

  /**
   * Arranca el reloj desde cero.
   */
  iniciar() {
    this.inicio = this.ahora();
    this.pausadoEn = null;
    this.congeladoEn = null;
  }

  /**
   * Frena el reloj hasta que se llame a reanudar().
   */
  pausar() {
    if (this.pausadoEn !== null || this.congeladoEn !== null) return;
    this.pausadoEn = this.ahora();
  }

  /**
   * Vuelve a hacer correr el reloj. El tiempo pausado no cuenta: se corre
   * el inicio hacia adelante lo mismo que duró la pausa.
   */
  reanudar() {
    if (this.pausadoEn === null) return;
    this.inicio += this.ahora() - this.pausadoEn;
    this.pausadoEn = null;
  }

  /**
   * Deja el tiempo fijo para siempre (al terminar la partida).
   */
  congelar() {
    if (this.congeladoEn !== null) return;
    this.congeladoEn = this.transcurrido();
  }

  /**
   * Indica si el reloj está pausado.
   * @returns {boolean}
   */
  get estaPausado() {
    return this.pausadoEn !== null;
  }

  /**
   * Milisegundos jugados, sin contar las pausas.
   * @returns {number}
   */
  transcurrido() {
    if (this.congeladoEn !== null) return this.congeladoEn;
    const hasta = this.pausadoEn !== null ? this.pausadoEn : this.ahora();
    return hasta - this.inicio;
  }

  /**
   * Milisegundos que quedan antes del límite. Nunca es menor que 0.
   * @returns {number}
   */
  restante() {
    return Math.max(0, this.limiteMs - this.transcurrido());
  }

  /**
   * Indica si ya se llegó al límite de tiempo.
   * @returns {boolean}
   */
  agotado() {
    return this.transcurrido() >= this.limiteMs;
  }
}
