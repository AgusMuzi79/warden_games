// home.js — Filas de juegos de la Home
// Depende de api.js (obtenerJuegos), del contenedor #filas-juegos y del
// avatar del header con data-sesion="usuario" para saber si hay sesión.

const contenedor = document.getElementById('filas-juegos');

// Categorías fijas para el invitado. "genero" tiene que matchear el nombre
// que usa la API en genres[].name.
const CATEGORIAS = [
  { titulo: 'Acción', genero: 'Action' },
  { titulo: 'Shooters', genero: 'Shooter' },
  { titulo: 'RPG', genero: 'RPG' },
  { titulo: 'Aventura', genero: 'Adventure' },
];

// No hay login real ni historial de partidas todavía: simulamos que el
// usuario ya jugó este título, y buscamos "Recomendados" por ese género
// (no por genres[0]: el orden de géneros de la API no es confiable, por
// ejemplo "The Witcher 3" trae "Action" antes que "RPG").
const JUEGO_JUGADO = { nombre: 'The Witcher 3: Wild Hunt', genero: 'RPG' };

// Si la API falla, mostramos estos juegos reales igual, con genero
// suficiente para cubrir las 4 categorías y el simulado de "Recomendados".
const JUEGOS_DE_RESPALDO = [
  { name: 'Grand Theft Auto V', background_image: 'https://media.rawg.io/media/games/20a/20aa03a10cda45239fe22d035c0ebe64.jpg', rating: 4.47, genres: [{ name: 'Action' }] },
  { name: 'The Witcher 3: Wild Hunt', background_image: 'https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg', rating: 4.64, genres: [{ name: 'Action' }, { name: 'RPG' }] },
  { name: 'Portal 2', background_image: 'https://media.rawg.io/media/games/2ba/2bac0e87cf45e5b508f227d281c9252a.jpg', rating: 4.58, genres: [{ name: 'Shooter' }, { name: 'Puzzle' }] },
  { name: 'Counter-Strike: Global Offensive', background_image: 'https://media.rawg.io/media/games/736/73619bd336c894d6941d926bfd563946.jpg', rating: 3.57, genres: [{ name: 'Shooter' }] },
  { name: 'Life is Strange', background_image: 'https://media.rawg.io/media/games/562/562553814dd54e001a541e4ee83a591c.jpg', rating: 4.12, genres: [{ name: 'Adventure' }] },
];

function esDeGenero(juego, genero) {
  return juego.genres.some((g) => g.name === genero);
}

function crearCard(juego) {
  const card = document.createElement('article');
  card.className = 'card game-card';

  const imagen = document.createElement('img');
  imagen.className = 'game-card__image';
  imagen.src = juego.background_image;
  imagen.alt = '';
  imagen.loading = 'lazy';

  const titulo = document.createElement('h3');
  titulo.className = 'game-card__title';
  titulo.textContent = juego.name;

  const rating = document.createElement('p');
  rating.className = 'game-card__rating';
  rating.innerHTML = `<i class="ph ph-star" aria-hidden="true"></i> ${juego.rating.toFixed(1)}`;

  card.append(imagen, titulo, rating);
  return card;
}

function crearFila(titulo, juegos) {
  if (juegos.length === 0) return null;

  const idTitulo = `fila-${titulo.toLowerCase().replace(/\s+/g, '-')}`;

  const fila = document.createElement('section');
  fila.className = 'carrusel';
  fila.setAttribute('aria-labelledby', idTitulo);

  const h2 = document.createElement('h2');
  h2.className = 'carrusel__titulo';
  h2.id = idTitulo;
  h2.textContent = titulo;

  const pista = document.createElement('div');
  pista.className = 'carrusel__pista';
  juegos.slice(0, 10).forEach((juego) => pista.append(crearCard(juego)));

  fila.append(h2, pista);
  return fila;
}

function haySesionIniciada() {
  const avatarUsuario = document.querySelector('.header__avatar[data-sesion="usuario"]');
  return !!avatarUsuario && !avatarUsuario.hidden;
}

function renderizarRecomendados(juegos) {
  const recomendados = juegos.filter(
    (j) => esDeGenero(j, JUEGO_JUGADO.genero) && j.name !== JUEGO_JUGADO.nombre
  );

  const fila = crearFila('Recomendados', recomendados);
  if (fila) contenedor.append(fila);
}

function renderizarCategorias(juegos) {
  CATEGORIAS.forEach(({ titulo, genero }) => {
    const deLaCategoria = juegos.filter((j) => esDeGenero(j, genero));
    const fila = crearFila(titulo, deLaCategoria);
    if (fila) contenedor.append(fila);
  });
}

function renderizarFilas(juegos) {
  contenedor.innerHTML = '';
  if (haySesionIniciada()) {
    renderizarRecomendados(juegos);
  } else {
    renderizarCategorias(juegos);
  }
}

obtenerJuegos()
  .then(renderizarFilas)
  .catch(() => renderizarFilas(JUEGOS_DE_RESPALDO));
