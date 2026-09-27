// api.js — Cliente fetch para la API de la cátedra (api-vj-interfaces)
// Doc: https://github.com/jimartinezabadias/api-vj-interfaces

const BASE_URL = 'https://vj.interfaces.jima.com.ar/api';

// Usamos /api (lista básica) y no /api/v2: no necesitamos las descripciones,
// que vienen en inglés, para no mezclar idiomas en una interfaz en español.
async function obtenerJuegos() {
  const respuesta = await fetch(BASE_URL);

  if (!respuesta.ok) {
    throw new Error(`La API de juegos respondió ${respuesta.status}`);
  }

  return respuesta.json();
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

function esDeGenero(juego, genero) {
  return juego.genres.some((g) => g.name === genero);
}
