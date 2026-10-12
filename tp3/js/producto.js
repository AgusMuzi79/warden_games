// producto.js — Ficha de un juego del catálogo (no Neon Circuit)
//
// Lee el id de la URL (?id=, no hay backend que resuelva otra ruta), busca
// el juego en el catálogo de la API y llena la ficha de producto.html.
//
// Depende de:
//   - api.js: obtenerJuegos, CATEGORIAS, esDeGenero.
//   - carrito.js: esDePago, obtenerComprados, agregarAlCarrito.
//   - galeria.js: iniciarGaleria (tiene que cargarse antes que este archivo).
//   - los ids "producto-*" de producto.html, #link-juego y el botón del
//     carrito del header (.menu-carrito), que arma menu.js.
// No expone nada.

const idJuego = Number(new URLSearchParams(location.search).get('id'));

// Nodos de la página que se llenan con los datos del juego.
const elementos = {
  categoria: document.getElementById('producto-categoria'),
  nombreBreadcrumb: document.getElementById('producto-nombre-breadcrumb'),
  imagen: document.getElementById('producto-imagen'),
  miniatura: document.getElementById('producto-miniatura'),
  nombre: document.getElementById('producto-nombre'),
  categoriaFicha: document.getElementById('producto-categoria-ficha'),
  rating: document.getElementById('producto-rating'),
  accion: document.getElementById('producto-accion'),
  accionTexto: document.getElementById('producto-accion-texto'),
  linkCompartir: document.getElementById('link-juego'),
  mailCompartir: document.getElementById('producto-compartir-mail'),
};

// Traduce el género real de la API a una de las 8 categorías fijas del
// sitio (mismo criterio que las filas de la Home); si no matchea ninguna,
// usa el primer género tal cual viene de la API antes que no mostrar nada.
function categoriaDe(juego) {
  const conocida = CATEGORIAS.find((c) => esDeGenero(juego, c.genero));
  return conocida ? conocida.titulo : (juego.genres[0]?.name ?? 'Juegos');
}

// Decide si el botón de la portada dice "Comprar" o "Jugar".
// "Comprar" solo si el juego es de pago y todavía no está en los comprados.
// "Jugar" no hace nada todavía, ni en gratis ni en ya comprados: los juegos
// del catálogo no tienen minijuego programado, a diferencia de Neon Circuit.
// Pendiente de definir con Fran (ver DECISIONES.md).
function configurarAccion(juego) {
  const comprado = obtenerComprados().some((item) => item.id === juego.id);
  const esComprable = esDePago(juego.id) && !comprado;

  elementos.accionTexto.textContent = esComprable ? 'Comprar' : 'Jugar';
  elementos.accion.setAttribute(
    'aria-label',
    esComprable ? `Comprar ${juego.name}` : `Jugar a ${juego.name}`
  );

  if (!esComprable) return;

  elementos.accion.addEventListener('click', (evento) => {
    // Sin esto, este mismo click sigue hasta document después de abrir el
    // desplegable (más abajo), y el listener de menu.js que cierra los menús
    // al clickear "afuera" lo cierra enseguida.
    evento.stopPropagation();
    agregarAlCarrito({ id: juego.id, nombre: juego.name, imagen: juego.background_image });
    // Se abre el desplegable del carrito del header con un click simulado,
    // así no hay que reimplementar el abrir/cerrar de menu.js.
    document.querySelector('.menu-carrito .header__icon-btn').click();
  });
}

// Llena toda la página con los datos del juego encontrado.
function mostrarJuego(juego) {
  document.title = `Warden Games — ${juego.name}`;

  const categoria = categoriaDe(juego);
  elementos.categoria.textContent = categoria;
  elementos.nombreBreadcrumb.textContent = juego.name;

  elementos.imagen.src = juego.background_image;
  elementos.miniatura.style.backgroundImage = `url("${juego.background_image}")`;
  elementos.nombre.textContent = juego.name;
  elementos.categoriaFicha.textContent = categoria;
  elementos.rating.textContent = juego.rating.toFixed(1);

  // Link y mail de la sección Compartir. El dominio es ficticio: el sitio
  // no tiene uno propio, solo sirve para que el texto se vea real.
  elementos.linkCompartir.value = `wardengames.com/producto.html?id=${juego.id}`;
  elementos.mailCompartir.href = `mailto:?subject=${encodeURIComponent(`Mirá ${juego.name}`)}&body=${encodeURIComponent(`Mirá este juego: https://wardengames.com/producto.html?id=${juego.id}`)}`;

  configurarAccion(juego);

  // Galería con el mismo flip que juego.html. La API trae una sola imagen
  // por juego, así que la lista tiene un único elemento. Con una sola foto,
  // galeria.js muestra en la 2ª cara el mensaje "sin más capturas".
  iniciarGaleria([{ src: juego.background_image, alt: `Portada de ${juego.name}` }]);
}

// Estado de error: la API falló o el id no existe. No hay catálogo de
// respaldo como en home.js (JUEGOS_DE_RESPALDO): en una página secundaria
// alcanza con avisar.
function mostrarError() {
  elementos.nombre.textContent = 'No encontramos este juego';
  elementos.categoriaFicha.textContent = '';
  elementos.categoria.textContent = 'Juegos';
  elementos.nombreBreadcrumb.textContent = 'No encontrado';
  elementos.accion.hidden = true;
}

// Punto de entrada: pide el catálogo y busca el juego por id.
obtenerJuegos()
  .then((juegos) => {
    const juego = juegos.find((j) => j.id === idJuego);
    if (juego) {
      mostrarJuego(juego);
    } else {
      mostrarError();
    }
  })
  .catch(mostrarError);
