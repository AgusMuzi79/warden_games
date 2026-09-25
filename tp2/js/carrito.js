// carrito.js — Carrito de compras simulado, persistido en localStorage
// (mismo patrón que sesion.js). Sin backend ni precios reales todavía (ver
// DECISIONES.md): cada ítem guarda solo id/nombre/imagen, sin cantidad —
// un juego entra una sola vez. Se carga antes que home.js y carousel.js,
// que son quienes agregan juegos al carrito.

const CLAVE_CARRITO = 'warden-carrito';

function obtenerCarrito() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_CARRITO)) ?? [];
  } catch {
    return [];
  }
}

function guardarCarrito(items) {
  localStorage.setItem(CLAVE_CARRITO, JSON.stringify(items));
  document.dispatchEvent(new CustomEvent('carrito:actualizado'));
}

function estaEnElCarrito(id) {
  return obtenerCarrito().some((item) => item.id === id);
}

function agregarAlCarrito(juego) {
  const items = obtenerCarrito();
  if (items.some((item) => item.id === juego.id)) return;
  guardarCarrito([...items, juego]);
}

function quitarDelCarrito(id) {
  guardarCarrito(obtenerCarrito().filter((item) => item.id !== id));
}

// Simulado hasta que haya precios reales (ver "Pendientes de decidir" en
// DECISIONES.md): 1 de cada 3 juegos es "de pago", elegido de forma
// determinística por id — no con Math.random() en cada render, que haría
// que un juego ya agregado al carrito "dejara" de ser de pago al recargar.
function esDePago(id) {
  return id % 3 === 0;
}

// ---- Ícono del header: numerito + lista del desplegable ----

const contadorCarrito = document.getElementById('carrito-contador');
const listaCarrito = document.getElementById('carrito-lista');
const vacioCarrito = document.getElementById('carrito-vacio');

function crearItemCarrito(item) {
  const li = document.createElement('li');
  li.className = 'carrito__item';

  const imagen = document.createElement('img');
  imagen.src = item.imagen;
  imagen.alt = '';
  imagen.width = 48;
  imagen.height = 48;

  const nombre = document.createElement('p');
  nombre.className = 'carrito__item-nombre';
  nombre.textContent = item.nombre;

  const quitar = document.createElement('button');
  quitar.type = 'button';
  quitar.className = 'carrito__quitar';
  quitar.setAttribute('aria-label', `Quitar ${item.nombre} del carrito`);
  quitar.innerHTML = '<i class="ph ph-x" aria-hidden="true"></i>';
  quitar.addEventListener('click', (evento) => {
    // Sin esto, el listener de menu.js que cierra cualquier menú al
    // clickear adentro (ver menu.js) cerraría todo el carrito con cada
    // ítem que se saca, en vez de dejarlo abierto para sacar varios.
    evento.stopPropagation();
    quitarDelCarrito(item.id);
  });

  li.append(imagen, nombre, quitar);
  return li;
}

function renderizarCarritoHeader() {
  if (!contadorCarrito) return; // Páginas sin este carrito en el header.

  const items = obtenerCarrito();

  contadorCarrito.textContent = items.length;
  contadorCarrito.hidden = items.length === 0;

  vacioCarrito.hidden = items.length > 0;
  listaCarrito.innerHTML = '';
  items.forEach((item) => listaCarrito.append(crearItemCarrito(item)));
}

// ---- Botones "Agregar al carrito" de las cards (home.js, carousel.js) ----
// Se identifican con data-carrito-id para que, ante cualquier cambio del
// carrito (agregar, quitar, quitar desde el desplegable), todos se
// actualicen solos sin que cada uno tenga que escuchar el evento.

function textoBotonCarrito(enCarrito) {
  return enCarrito ? 'Quitar del carrito' : 'Agregar al carrito';
}

function actualizarBotonesDeCarrito() {
  document.querySelectorAll('[data-carrito-id]').forEach((boton) => {
    const id = Number(boton.dataset.carritoId);
    boton.textContent = textoBotonCarrito(estaEnElCarrito(id));
  });
}

function alternarCarrito(juego) {
  if (estaEnElCarrito(juego.id)) {
    quitarDelCarrito(juego.id);
  } else {
    agregarAlCarrito(juego);
  }
}

document.addEventListener('carrito:actualizado', () => {
  renderizarCarritoHeader();
  actualizarBotonesDeCarrito();
});

renderizarCarritoHeader();
