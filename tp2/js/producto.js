// producto.js — Ficha de un juego del catálogo (no Neon Circuit)
// Depende de api.js (obtenerJuegos, CATEGORIAS, esDeGenero) y de carrito.js
// (esDePago, obtenerComprados, agregarAlCarrito). El id del juego viaja por
// query string (?id=), porque este es un sitio estático sin backend.

const idJuego = Number(new URLSearchParams(location.search).get('id'));

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

// "Jugar" no hace nada todavía (ni siquiera en juegos gratis o ya
// comprados): no hay ningún minijuego real programado para el catálogo de
// la API, a diferencia de Neon Circuit. Pendiente de definir con Fran qué
// debería pasar acá (ver DECISIONES.md).
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
    // Sin esto, este mismo click sigue de largo hasta document después de
    // abrir el desplegable (más abajo) y el listener de menu.js que cierra
    // cualquier menú al clickear "afuera" lo vuelve a cerrar enseguida.
    evento.stopPropagation();
    agregarAlCarrito({ id: juego.id, nombre: juego.name, imagen: juego.background_image });
    // Mismo desplegable del header que ya arma carrito.js/menu.js — no
    // hace falta reimplementar el "abrir menú" acá.
    document.querySelector('.menu-carrito .header__icon-btn').click();
  });
}

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

  elementos.linkCompartir.value = `wardengames.com/producto.html?id=${juego.id}`;
  elementos.mailCompartir.href = `mailto:?subject=${encodeURIComponent(`Mirá ${juego.name}`)}&body=${encodeURIComponent(`Mirá este juego: https://wardengames.com/producto.html?id=${juego.id}`)}`;

  configurarAccion(juego);

  // Galería animada (mismo carrusel de flip que juego.html, motor en
  // js/galeria.js): la API solo trae 1 foto real por juego, así que la
  // lista tiene un único elemento — ver la nota en producto.html sobre
  // qué pasa con el flip cuando hay una sola foto.
  iniciarGaleria([{ src: juego.background_image, alt: `Portada de ${juego.name}` }]);
}

// Sin backend ni catálogo de respaldo acá (a diferencia de home.js): esta
// es una página satélite, no la Home — si la API falla o el id no existe,
// alcanza con avisar en vez de duplicar JUEGOS_DE_RESPALDO.
function mostrarError() {
  elementos.nombre.textContent = 'No encontramos este juego';
  elementos.categoriaFicha.textContent = '';
  elementos.categoria.textContent = 'Juegos';
  elementos.nombreBreadcrumb.textContent = 'No encontrado';
  elementos.accion.hidden = true;
}

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
