// home.js — Catálogo de juegos de la Home
// Depende de api.js (obtenerJuegos) y del contenedor #carousel.

const contenedor = document.querySelector('.carousel__grid');

// Si la API falla, mostramos estos juegos reales igual para que la Home
// nunca quede vacía.
const JUEGOS_DE_RESPALDO = [
  {
    name: 'Grand Theft Auto V',
    background_image: 'https://media.rawg.io/media/games/20a/20aa03a10cda45239fe22d035c0ebe64.jpg',
    rating: 4.47,
  },
  {
    name: 'The Witcher 3: Wild Hunt',
    background_image: 'https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg',
    rating: 4.64,
  },
  {
    name: 'Portal 2',
    background_image: 'https://media.rawg.io/media/games/2ba/2bac0e87cf45e5b508f227d281c9252a.jpg',
    rating: 4.58,
  },
  {
    name: 'Counter-Strike: Global Offensive',
    background_image: 'https://media.rawg.io/media/games/736/73619bd336c894d6941d926bfd563946.jpg',
    rating: 3.57,
  },
];

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

function renderizarJuegos(juegos) {
  contenedor.innerHTML = '';
  juegos.slice(0, 10).forEach((juego) => contenedor.append(crearCard(juego)));
}

obtenerJuegos()
  .then(renderizarJuegos)
  .catch(() => renderizarJuegos(JUEGOS_DE_RESPALDO));
