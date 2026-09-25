// home.js — Filas de juegos de la Home
// Depende de api.js (obtenerJuegos), del contenedor #filas-juegos y del
// avatar del header con data-sesion="usuario" para saber si hay sesión.

const contenedor = document.getElementById('filas-juegos');

// Categorías fijas (las mismas que lista el menú hamburguesa). "genero"
// tiene que matchear el nombre que usa la API en genres[].name. Elegidas
// por cuántos juegos reales tienen en el catálogo (de más a menos).
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

// No hay login real ni historial de partidas todavía: simulamos que el
// usuario ya jugó este título, y buscamos "Recomendados" por ese género
// (no por genres[0]: el orden de géneros de la API no es confiable, por
// ejemplo "The Witcher 3" trae "Action" antes que "RPG").
const JUEGO_JUGADO = { nombre: 'The Witcher 3: Wild Hunt', genero: 'RPG' };

// Si la API falla, mostramos estos juegos reales igual, con género
// suficiente para cubrir las 8 categorías y el simulado de "Recomendados".
const JUEGOS_DE_RESPALDO = [
  { id: 1, name: 'Grand Theft Auto V', background_image: 'https://media.rawg.io/media/games/20a/20aa03a10cda45239fe22d035c0ebe64.jpg', rating: 4.47, genres: [{ name: 'Action' }] },
  { id: 2, name: 'The Witcher 3: Wild Hunt', background_image: 'https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg', rating: 4.64, genres: [{ name: 'Action' }, { name: 'RPG' }] },
  { id: 3, name: 'Portal 2', background_image: 'https://media.rawg.io/media/games/2ba/2bac0e87cf45e5b508f227d281c9252a.jpg', rating: 4.58, genres: [{ name: 'Shooter' }, { name: 'Puzzle' }] },
  { id: 4, name: 'Counter-Strike: Global Offensive', background_image: 'https://media.rawg.io/media/games/736/73619bd336c894d6941d926bfd563946.jpg', rating: 3.57, genres: [{ name: 'Shooter' }] },
  { id: 5, name: 'Life is Strange', background_image: 'https://media.rawg.io/media/games/562/562553814dd54e001a541e4ee83a591c.jpg', rating: 4.12, genres: [{ name: 'Adventure' }] },
  { id: 6, name: 'Limbo', background_image: 'https://media.rawg.io/media/games/942/9424d6bb763dc38d9378b488603c87fa.jpg', rating: 4.14, genres: [{ name: 'Indie' }, { name: 'Platformer' }] },
  { id: 7, name: 'Company of Heroes 2', background_image: 'https://media.rawg.io/media/games/0bd/0bd5646a3d8ee0ac3314bced91ea306d.jpg', rating: 3.1, genres: [{ name: 'Strategy' }] },
];

function esDeGenero(juego, genero) {
  return juego.genres.some((g) => g.name === genero);
}

// Solo los juegos "de pago" (simulado, ver carrito.js) muestran este botón.
function crearBotonCarrito(juego) {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'btn btn--secundario game-card__carrito';
  boton.dataset.carritoId = juego.id;
  boton.textContent = textoBotonCarrito(estaEnElCarrito(juego.id));

  boton.addEventListener('click', () => {
    alternarCarrito({ id: juego.id, nombre: juego.name, imagen: juego.background_image });
  });

  return boton;
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
  if (esDePago(juego.id)) card.append(crearBotonCarrito(juego));
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

  const flechaIzquierda = document.createElement('button');
  flechaIzquierda.type = 'button';
  flechaIzquierda.className = 'carrusel__flecha';
  flechaIzquierda.setAttribute('aria-label', `Ver anteriores en ${titulo}`);
  flechaIzquierda.innerHTML = '<i class="ph ph-caret-left" aria-hidden="true"></i>';

  const flechaDerecha = document.createElement('button');
  flechaDerecha.type = 'button';
  flechaDerecha.className = 'carrusel__flecha';
  flechaDerecha.setAttribute('aria-label', `Ver más en ${titulo}`);
  flechaDerecha.innerHTML = '<i class="ph ph-caret-right" aria-hidden="true"></i>';

  const flechas = document.createElement('div');
  flechas.className = 'carrusel__flechas';
  flechas.append(flechaIzquierda, flechaDerecha);

  const cabecera = document.createElement('div');
  cabecera.className = 'carrusel__cabecera';
  cabecera.append(h2, flechas);

  const pista = document.createElement('div');
  pista.className = 'carrusel__pista';
  juegos.slice(0, 10).forEach((juego) => pista.append(crearCard(juego)));

  fila.append(cabecera, pista);
  activarCarrusel(pista, flechaIzquierda, flechaDerecha);
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
  // Con sesión: "Recomendados" arriba, y las categorías igual que a un
  // invitado debajo. Sin sesión: solo las categorías.
  if (haySesionIniciada()) {
    renderizarRecomendados(juegos);
  }
  renderizarCategorias(juegos);
}

obtenerJuegos()
  .then(renderizarFilas)
  .catch(() => renderizarFilas(JUEGOS_DE_RESPALDO));
