// preload.js — Precarga de imágenes antes de jugar
//
// Pide todas las imágenes del juego y espera a que lleguen. Así, cuando
// aparece un edificio o explota un drone, el PNG ya está en la caché del
// navegador y no se ve a medias.

/**
 * Carga una lista de imágenes.
 * @param {string[]} rutas
 * @param {(porcentaje: number) => void} alProgresar se llama cada vez que llega una
 * @returns {Promise<string[]>} rutas que fallaron (vacío si cargaron todas)
 */
export function precargar(rutas, alProgresar) {
  let listas = 0;
  const fallidas = [];

  const promesas = rutas.map((ruta) => new Promise((resolver) => {
    const imagen = new Image();
    // Una imagen que falla no frena el juego: se sigue y se avisa por consola.
    const terminar = (ok) => {
      if (!ok) fallidas.push(ruta);
      listas += 1;
      alProgresar(Math.round((listas / rutas.length) * 100));
      resolver();
    };
    imagen.onload = () => terminar(true);
    imagen.onerror = () => terminar(false);
    imagen.src = ruta;
  }));

  return Promise.all(promesas).then(() => fallidas);
}
