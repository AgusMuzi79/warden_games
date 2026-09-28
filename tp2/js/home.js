// home.js — Filas de juegos de la Home
// Depende de api.js (obtenerJuegos), del contenedor #filas-juegos y del
// avatar del header con data-sesion="usuario" para saber si hay sesión.

const contenedor = document.getElementById('filas-juegos');

// No hay login real ni historial de partidas todavía: simulamos que el
// usuario ya jugó este título, y buscamos "Recomendados" por ese género
// (no por genres[0]: el orden de géneros de la API no es confiable, por
// ejemplo "Middle-earth: Shadow of Mordor" trae "Action" y "RPG", y de las
// dos elegimos RPG a mano). El nombre también se muestra debajo del título
// de la fila, para explicar por qué se recomienda lo que se ve.
const JUEGO_JUGADO = { nombre: 'Middle-earth: Shadow of Mordor', genero: 'RPG' };

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

function crearCard(juego) {
  const card = document.createElement('article');
  card.className = 'card game-card';

  // <a>, no <div>: clickear la imagen también lleva a la ficha del juego,
  // igual que el nombre/puntaje de más abajo (dos links a la misma
  // página, uno por zona de la card). No hay ningún botón adentro de
  // .game-card__media (el de carrito vive aparte, en .game-card__cuerpo),
  // así que este <a> no anida ningún control interactivo.
  const media = document.createElement('a');
  media.className = 'game-card__media';
  media.href = `producto.html?id=${juego.id}`;
  // El link de la imagen es un atajo para mouse y touch: el del nombre
  // (.game-card__texto, más abajo) ya lleva al mismo lugar. Fuera del orden
  // de Tab y oculto para lectores de pantalla, así teclado y lector pasan
  // una sola vez por cada juego (ver DECISIONES.md, "Etapa 2: las cards de
  // las filas de la Home enlazan a la ficha", costo asumido revisado).
  media.tabIndex = -1;
  media.setAttribute('aria-hidden', 'true');

  const imagen = document.createElement('img');
  imagen.className = 'game-card__image';
  imagen.src = juego.background_image;
  imagen.alt = '';
  imagen.loading = 'lazy';
  media.append(imagen);

  const badge = crearBadge(juego);
  if (badge) {
    badge.classList.add('game-card__badge');
    media.append(badge);
  }

  const titulo = document.createElement('h3');
  titulo.className = 'game-card__title';
  titulo.textContent = juego.name;

  // Un <a> en vez de un <div>: clickear el nombre lleva a la ficha del
  // juego (producto.html). No puede envolver también al botón de carrito
  // (serían dos controles interactivos anidados) — por eso viven como
  // hermanos en .game-card__cuerpo, no uno adentro del otro.
  const texto = document.createElement('a');
  texto.className = 'game-card__texto';
  texto.href = `producto.html?id=${juego.id}`;
  texto.append(titulo);

  // El botón de carrito va acá, a la altura del nombre, no superpuesto a
  // la imagen (ver DECISIONES.md).
  const cuerpo = document.createElement('div');
  cuerpo.className = 'game-card__cuerpo';
  cuerpo.append(texto);
  if (esDePago(juego.id)) cuerpo.append(crearBotonCarrito(juego, 'game-card__carrito'));

  card.append(media, cuerpo);
  return card;
}

// "Mis juegos" no viene de la API: son los objetos {id, nombre, imagen}
// que guarda carrito.js al comprar, sin rating ni género. Card más simple,
// sin el botón de agregar al carrito (ya es tuyo) ni la estrella.
function crearCardComprado(juego) {
  const card = document.createElement('article');
  card.className = 'card game-card';

  const media = document.createElement('a');
  media.className = 'game-card__media';
  media.href = `producto.html?id=${juego.id}`;
  // Mismo criterio que crearCard(): el link de la imagen es un atajo, el
  // del nombre ya lleva al mismo lugar.
  media.tabIndex = -1;
  media.setAttribute('aria-hidden', 'true');

  const imagen = document.createElement('img');
  imagen.className = 'game-card__image';
  imagen.src = juego.imagen;
  imagen.alt = '';
  imagen.loading = 'lazy';
  media.append(imagen);

  const titulo = document.createElement('h3');
  titulo.className = 'game-card__title';
  titulo.textContent = juego.nombre;

  const texto = document.createElement('a');
  texto.className = 'game-card__texto';
  texto.href = `producto.html?id=${juego.id}`;
  texto.append(titulo);

  const cuerpo = document.createElement('div');
  cuerpo.className = 'game-card__cuerpo';
  cuerpo.append(texto);

  card.append(media, cuerpo);
  return card;
}

// `basadoEn` (opcional) es el nombre del juego que explica por qué se ve esta
// fila: agrega debajo del título "Basado en que jugaste <nombre>".
function crearFila(titulo, juegos, fabricaCard = crearCard, basadoEn = null) {
  if (juegos.length === 0) return null;

  const idTitulo = `fila-${titulo.toLowerCase().replace(/\s+/g, '-')}`;

  const fila = document.createElement('section');
  fila.className = 'carrusel';
  fila.setAttribute('aria-labelledby', idTitulo);

  const h2 = document.createElement('h2');
  h2.className = 'carrusel__titulo';
  h2.id = idTitulo;
  h2.textContent = titulo;

  // El título (y el subtítulo, si hay) van juntos en un contenedor para que
  // las flechas sigan a la derecha, centradas contra los dos.
  const encabezado = document.createElement('div');
  encabezado.className = 'carrusel__encabezado';
  encabezado.append(h2);

  if (basadoEn) {
    const idSubtitulo = `${idTitulo}-motivo`;
    const nombreJuego = document.createElement('strong');
    nombreJuego.textContent = basadoEn;

    const subtitulo = document.createElement('p');
    subtitulo.className = 'carrusel__subtitulo';
    subtitulo.id = idSubtitulo;
    subtitulo.append('Basado en que jugaste ', nombreJuego);

    fila.setAttribute('aria-describedby', idSubtitulo);
    encabezado.append(subtitulo);
  }

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
  cabecera.append(encabezado, flechas);

  const pista = document.createElement('div');
  pista.className = 'carrusel__pista';
  juegos.slice(0, 10).forEach((juego) => pista.append(fabricaCard(juego)));

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

  const fila = crearFila('Recomendados', recomendados, crearCard, JUEGO_JUGADO.nombre);
  if (fila) contenedor.append(fila);
}

// Independiente de la sesión simulada (sesion.js): comprar no depende de
// tener sesión iniciada, así que esta fila se guía solo por si hay algo en
// "warden-compras" (carrito.js), no por el avatar del header.
function renderizarMisJuegos() {
  const fila = crearFila('Mis juegos', obtenerComprados(), crearCardComprado);
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
  renderizarMisJuegos();
  renderizarCategorias(juegos);

  // Búsqueda hecha desde otra página: buscador.js lleva a index.html?q=...
  // Las filas recién existen acá (después del fetch), por eso el filtro se
  // aplica al final y no al cargar la página.
  const consultaInicial = new URLSearchParams(window.location.search).get('q');
  if (consultaInicial) {
    document.getElementById('buscar').value = consultaInicial;
    filtrarJuegos(consultaInicial);
  }

  // Anclas a filas (menú hamburguesa "index.html#fila-acción", menú de
  // cuenta "index.html#fila-mis-juegos"): las filas recién existen acá,
  // después del fetch, así que el navegador no las encontró al cargar la
  // página y no hizo el scroll. Si ya estaban (estando en la Home), el
  // navegador scrollea solo y esto no cambia nada. El hash viene codificado
  // ("acci%C3%B3n"), por eso el decodeURIComponent.
  if (window.location.hash) {
    const destino = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    if (destino) destino.scrollIntoView();
  }
}

obtenerJuegos()
  .then(renderizarFilas)
  .catch(() => renderizarFilas(JUEGOS_DE_RESPALDO));
