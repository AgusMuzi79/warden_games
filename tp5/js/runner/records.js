// records.js — Tabla de récords del modo Infinito (estilo arcade)
//
// Módulo puro: no toca el DOM. Guarda en localStorage un objeto
// { records: [{ iniciales, puntaje }], ultimas } con los 10 mejores
// puntajes de mayor a menor y las últimas iniciales usadas (el valor de
// arranque de la próxima carga). Si el storage falla (bloqueado, lleno o
// con datos rotos) se ignora: el juego anda igual, sin récords guardados.
// Usa globalThis.localStorage y no window, así también se puede probar
// con Node.

/** Clave de localStorage. */
const CLAVE = 'warden-neon-rider-records';

/** Cuántos puestos tiene la tabla. */
export const MAX_RECORDS = 10;

/** Iniciales de arranque si nunca se cargó ninguna. */
export const INICIALES_DEFECTO = 'AAA';

/**
 * Lee lo guardado. Cualquier error (sin storage, JSON roto, forma rara)
 * devuelve la tabla vacía.
 * @returns {{ records: { iniciales: string, puntaje: number }[], ultimas: string }}
 */
function leer() {
  const vacio = { records: [], ultimas: INICIALES_DEFECTO };
  try {
    const datos = JSON.parse(globalThis.localStorage.getItem(CLAVE));
    if (!datos || typeof datos !== 'object') return vacio;
    const records = Array.isArray(datos.records)
      ? datos.records.filter(esValido).slice(0, MAX_RECORDS)
      : [];
    const ultimas = typeof datos.ultimas === 'string' ? normalizarIniciales(datos.ultimas) : INICIALES_DEFECTO;
    return { records, ultimas };
  } catch {
    return vacio;
  }
}

/**
 * Escribe la tabla. Si el storage falla, no pasa nada.
 * @param {{ records: object[], ultimas: string }} datos
 */
function escribir(datos) {
  try {
    globalThis.localStorage.setItem(CLAVE, JSON.stringify(datos));
  } catch {
    // Sin storage: el récord vale solo hasta recargar la página.
  }
}

/**
 * Una entrada guardada es válida si tiene 3 letras y un puntaje entero > 0.
 * @param {unknown} entrada
 * @returns {boolean}
 */
function esValido(entrada) {
  return Boolean(entrada)
    && typeof entrada.iniciales === 'string' && /^[A-Z]{3}$/.test(entrada.iniciales)
    && Number.isInteger(entrada.puntaje) && entrada.puntaje > 0;
}

/**
 * Deja las iniciales en 3 letras mayúsculas A–Z (lo que sobra se corta y
 * lo que falta se completa con A).
 * @param {string} texto
 * @returns {string}
 */
export function normalizarIniciales(texto) {
  return String(texto).toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3).padEnd(3, 'A');
}

/**
 * Los récords guardados, de mayor a menor.
 * @returns {{ iniciales: string, puntaje: number }[]}
 */
export function cargarRecords() {
  return leer().records;
}

/**
 * Las últimas iniciales cargadas ("AAA" si nunca hubo).
 * @returns {string}
 */
export function ultimasIniciales() {
  return leer().ultimas;
}

/**
 * Puesto (0 a 9) que ocuparía el puntaje, o -1 si no entra. En un empate
 * el récord más viejo queda arriba: el nuevo va después de los iguales.
 * @param {{ puntaje: number }[]} records de mayor a menor
 * @param {number} puntaje
 * @returns {number}
 */
export function puestoPara(records, puntaje) {
  if (!(puntaje > 0)) return -1;
  const indice = records.findIndex((record) => record.puntaje < puntaje);
  const puesto = indice === -1 ? records.length : indice;
  return puesto < MAX_RECORDS ? puesto : -1;
}

/**
 * ¿El puntaje entra en la tabla? (mayor a 0 y dentro del top 10).
 * @param {number} puntaje
 * @param {{ puntaje: number }[]} [records] por defecto, los guardados
 * @returns {boolean}
 */
export function entraEnTabla(puntaje, records = cargarRecords()) {
  return puestoPara(records, puntaje) !== -1;
}

/**
 * Inserta sin modificar la lista recibida (función pura).
 * @param {{ iniciales: string, puntaje: number }[]} records
 * @param {string} iniciales
 * @param {number} puntaje
 * @returns {{ records: { iniciales: string, puntaje: number }[], puesto: number }}
 *   puesto -1 si no entró (la lista vuelve igual)
 */
export function insertarRecord(records, iniciales, puntaje) {
  const puesto = puestoPara(records, puntaje);
  if (puesto === -1) return { records: [...records], puesto };
  const nueva = [...records];
  nueva.splice(puesto, 0, { iniciales: normalizarIniciales(iniciales), puntaje });
  return { records: nueva.slice(0, MAX_RECORDS), puesto };
}

/**
 * Guarda un récord y recuerda las iniciales para la próxima vez.
 * @param {string} iniciales
 * @param {number} puntaje
 * @returns {{ records: { iniciales: string, puntaje: number }[], puesto: number }}
 */
export function guardarRecord(iniciales, puntaje) {
  const resultado = insertarRecord(cargarRecords(), iniciales, puntaje);
  escribir({ records: resultado.records, ultimas: normalizarIniciales(iniciales) });
  return resultado;
}
