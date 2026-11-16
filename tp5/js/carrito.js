// carrito.js — Carrito de compras simulado, persistido en localStorage
// (mismo patrón que sesion.js). Sin backend ni precios reales todavía (ver
// DECISIONES.md): cada ítem guarda solo id/nombre/imagen, sin cantidad —
// un juego entra una sola vez. Se carga antes que home.js y carousel.js,
// que son quienes agregan juegos al carrito.
//
// Depende de los ids del header (#carrito-contador, #carrito-lista,
// #carrito-vacio, #btn-pagar-carrito); si la página no los tiene, el render
// del desplegable se saltea.
// Expone (globales): obtenerCarrito, agregarAlCarrito, quitarDelCarrito,
// vaciarCarrito, estaEnElCarrito, alternarCarrito, obtenerComprados,
// agregarComprados, esDePago, esNuevo, crearBotonCarrito, crearBadge,
// CLAVE_CARRITO y CLAVE_COMPRAS (las borra sesion.js al cerrar sesión).
// Avisa cada cambio con el evento 'carrito:actualizado' en document.

const CLAVE_CARRITO = 'warden-carrito';

// Sin nada guardado, o con un JSON roto, devuelve un carrito vacío.
function obtenerCarrito() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_CARRITO)) ?? [];
  } catch {
    return [];
  }
}

// Todos los cambios pasan por acá. El evento es lo que hace que el numerito
// del header y los botones de las cards se actualicen solos (ver el listener
// al final del archivo).
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

function vaciarCarrito() {
  guardarCarrito([]);
}

// ---- Juegos ya comprados (simulado, ver DECISIONES.md) ----
// Clave aparte de CLAVE_CARRITO: son dos listas independientes, un juego
// sale de una cuando entra a la otra.

const CLAVE_COMPRAS = 'warden-compras';

function obtenerComprados() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_COMPRAS)) ?? [];
  } catch {
    return [];
  }
}

// Suma juegos a la lista de comprados sin repetir los que ya están. No
// dispara 'carrito:actualizado': el que compra llama a vaciarCarrito() después.
function agregarComprados(juegos) {
  const yaComprados = obtenerComprados();
  const nuevos = juegos.filter((juego) => !yaComprados.some((item) => item.id === juego.id));
  localStorage.setItem(CLAVE_COMPRAS, JSON.stringify([...yaComprados, ...nuevos]));
}

// Simulado hasta que haya precios reales (ver "Pendientes de decidir" en
// DECISIONES.md): 1 de cada 3 juegos es "de pago", elegido de forma
// determinística por id — no con Math.random() en cada render, que haría
// que un juego ya agregado al carrito "dejara" de ser de pago al recargar.
function esDePago(id) {
  return id % 3 === 0;
}

// Mismo criterio que esDePago(): 1 de cada 5 juegos es "nuevo", simulado y
// determinístico por id. Si un id cumple los dos, "nuevo" tiene prioridad
// visual (ver crearBadge) — son etiquetas simuladas, no hace falta que un
// juego nuevo también muestre precio.
function esNuevo(id) {
  return id % 5 === 0;
}

// Sin precios reales todavía: cualquier juego "de pago" cuesta lo mismo.
const PRECIO_SIMULADO = '$9.99';

// ---- Ícono del header: numerito + lista del desplegable ----

// Estos elementos son null en las páginas sin carrito en el header.
const contadorCarrito = document.getElementById('carrito-contador');
const listaCarrito = document.getElementById('carrito-lista');
const vacioCarrito = document.getElementById('carrito-vacio');

// Arma un <li> del desplegable: miniatura, nombre y botón para quitarlo.
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

// Vuelve a dibujar el desplegable desde cero con lo que haya guardado.
function renderizarCarritoHeader() {
  if (!contadorCarrito) return; // Páginas sin este carrito en el header.

  const items = obtenerCarrito();

  contadorCarrito.textContent = items.length;
  contadorCarrito.hidden = items.length === 0;

  vacioCarrito.hidden = items.length > 0;
  listaCarrito.innerHTML = '';
  items.forEach((item) => listaCarrito.append(crearItemCarrito(item)));

  // Sin juegos no hay nada que pagar: el botón queda deshabilitado (con el
  // estilo .btn:disabled de components.css) en vez de parecer activo y no
  // hacer nada al clickearlo (compras.js corta en silencio si el carrito
  // está vacío). Se busca acá por id y no se usa la constante de compras.js:
  // ese archivo se carga después de este.
  const botonPagarCarrito = document.getElementById('btn-pagar-carrito');
  if (botonPagarCarrito) botonPagarCarrito.disabled = items.length === 0;
}

// ---- Botones "Agregar al carrito" de las cards (home.js, carousel.js) ----
// Ícono solo (sin texto): el estado "ya agregado" se comunica con
// aria-pressed (lector de pantalla) y su estilo en home.css (visual, queda
// "hundido" y relleno). Se identifican con data-carrito-id para que, ante
// cualquier cambio del carrito (agregar, quitar, quitar desde el
// desplegable), todos se actualicen solos sin que cada uno escuche el evento.

// Sincroniza un botón con el carrito: aria-pressed y aria-label según si su
// juego ya está adentro.
function actualizarBotonCarrito(boton) {
  const id = Number(boton.dataset.carritoId);
  const nombre = boton.dataset.carritoNombre;
  const enCarrito = estaEnElCarrito(id);
  boton.setAttribute('aria-pressed', String(enCarrito));
  boton.setAttribute('aria-label', enCarrito ? `Quitar ${nombre} del carrito` : `Agregar ${nombre} al carrito`);
}

function actualizarBotonesDeCarrito() {
  document.querySelectorAll('[data-carrito-id]').forEach(actualizarBotonCarrito);
}

// Fábrica compartida por home.js (cards de las filas) y carousel.js (banner
// Destacados): mismo botón ícono, mismo comportamiento, solo cambia la
// clase para que cada CSS lo posicione donde corresponda. El ícono va
// envuelto en un <span class="carrito-icono">: en las filas de la Home ese
// span no hace nada especial (el botón ya es el círculo), pero en el
// banner es el círculo visual — el botón ahí cubre toda la card, ver
// DECISIONES.md ("Carrito de compras, parte 2").
function crearBotonCarrito(juego, clase) {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = clase;
  boton.dataset.carritoId = juego.id;
  boton.dataset.carritoNombre = juego.name;
  boton.innerHTML = '<span class="carrito-icono"><i class="ph ph-shopping-cart-simple" aria-hidden="true"></i></span>';
  actualizarBotonCarrito(boton);

  boton.addEventListener('click', (evento) => {
    // En el banner, el slide tiene su propio click (irA); en las filas de
    // la Home no hay nada que competir, pero frenarlo igual no cambia nada.
    evento.stopPropagation();
    alternarCarrito({ id: juego.id, nombre: juego.name, imagen: juego.background_image });
  });

  return boton;
}

// Fábrica compartida por home.js (cards de las filas) y carousel.js (banner
// Destacados), mismo criterio que crearBotonCarrito(): una sola etiqueta por
// juego, "Nuevo" > precio/"Gratis" > nada si ya está comprado (obtenerComprados,
// ver "Mis juegos" en DECISIONES.md — un juego que ya es tuyo no necesita
// mostrar que es gratis o cuánto cuesta).
function crearBadge(juego) {
  const yaComprado = obtenerComprados().some((item) => item.id === juego.id);
  if (yaComprado) return null;

  const badge = document.createElement('span');

  if (esNuevo(juego.id)) {
    badge.className = 'badge badge--nuevo';
    badge.textContent = 'Nuevo';
  } else {
    badge.className = 'badge badge--precio';
    badge.textContent = esDePago(juego.id) ? PRECIO_SIMULADO : 'Gratis';
  }

  return badge;
}

// Si el juego está en el carrito lo saca, si no lo agrega. Recibe el formato
// del carrito ({id, nombre, imagen}), no el objeto crudo de la API.
function alternarCarrito(juego) {
  if (estaEnElCarrito(juego.id)) {
    quitarDelCarrito(juego.id);
  } else {
    agregarAlCarrito(juego);
  }
}

// Cualquier cambio del carrito refresca el header y todos los botones de las
// cards. El render inicial de abajo cubre lo que ya había guardado al cargar.
document.addEventListener('carrito:actualizado', () => {
  renderizarCarritoHeader();
  actualizarBotonesDeCarrito();
});

renderizarCarritoHeader();
