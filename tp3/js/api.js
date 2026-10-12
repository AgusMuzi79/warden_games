// api.js — Cliente fetch para la API de la cátedra (api-vj-interfaces)
// Doc: https://github.com/jimartinezabadias/api-vj-interfaces
//
// No depende de otros scripts. Expone (globales): obtenerJuegos(),
// CATEGORIAS y esDeGenero(), que usan home.js, carousel.js y producto.js.

const BASE_URL = 'https://vj.interfaces.jima.com.ar/api';

// Usamos /api (lista básica) y no /api/v2: no necesitamos las descripciones,
// que vienen en inglés, para no mezclar idiomas en una interfaz en español.
// Clave del caché del catálogo en sessionStorage (dura lo que la pestaña).
const CLAVE_CACHE_JUEGOS = 'warden-juegos';

// La API no tiene endpoint por id: solo existe la lista completa. Para no
// repetir ese fetch en cada página (Home, ficha de producto), se guarda en
// sessionStorage. Si el storage falla o está vacío, se pide a la API igual.
function leerCacheJuegos() {
  try {
    const guardado = sessionStorage.getItem(CLAVE_CACHE_JUEGOS);
    return guardado ? JSON.parse(guardado) : null;
  } catch {
    return null;
  }
}

function guardarCacheJuegos(juegos) {
  try {
    sessionStorage.setItem(CLAVE_CACHE_JUEGOS, JSON.stringify(juegos));
  } catch {
    // Sin storage disponible o lleno: se sigue sin caché.
  }
}

// Devuelve la lista de juegos, del caché si está. Si la API falla tira un
// error: quien la llama (home.js, producto.js) decide qué mostrar en ese caso.
async function obtenerJuegos() {
  const enCache = leerCacheJuegos();
  if (enCache) return enCache;

  const respuesta = await fetch(BASE_URL);

  if (!respuesta.ok) {
    throw new Error(`La API de juegos respondió ${respuesta.status}`);
  }

  const juegos = await respuesta.json();
  guardarCacheJuegos(juegos);
  return juegos;
}

// Categorías fijas (las mismas que arma home.js para las filas de la Home y
// que lista el menú hamburguesa). "genero" tiene que matchear el nombre que
// usa la API en genres[].name. Elegidas por cuántos juegos reales tienen en
// el catálogo (de más a menos, ver DECISIONES.md). Compartidas con
// producto.js para el breadcrumb de la ficha de un juego.
const CATEGORIAS = [
  { titulo: 'Acción', genero: 'Action' },
  { titulo: 'Shooters', genero: 'Shooter' },
  { titulo: 'RPG', genero: 'RPG' },
  { titulo: 'Indie', genero: 'Indie' },
  { titulo: 'Aventura', genero: 'Adventure' },
  { titulo: 'Plataformas', genero: 'Platformer' },
  { titulo: 'Puzzle', genero: 'Puzzle' },
  { titulo: 'Estrategia', genero: 'Strategy' },
];

// Un juego puede tener varios géneros, por eso se busca en toda la lista.
function esDeGenero(juego, genero) {
  return juego.genres.some((g) => g.name === genero);
}
