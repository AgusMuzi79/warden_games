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
