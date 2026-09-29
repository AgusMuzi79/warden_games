// buscador.js: buscador del header. Maneja la lupa de mobile (abre y cierra
// el buscador) y la búsqueda de juegos por nombre.
//
// Depende de: .header__search-toggle (la lupa), .header__search (el form) y
// su input, y en la Home de #filas-juegos (lo arma home.js) y
// #busqueda-estado (el mensaje de resultados).
// Expone filtrarJuegos(consulta), global porque la usa home.js.
//
// La lupa solo hace algo en mobile: desde tablet el buscador ya se ve
// siempre y el botón de la lupa está oculto por CSS (header.css).
// A propósito no usa aria-controls: menu.js engancha cualquier botón que
// tenga aria-controls + aria-expanded, y cierra sus paneles al clickear en
// cualquier lado — eso cerraría el buscador al tocar el input para escribir.
//
// Buscar: en la Home filtra las filas ya armadas, sin recargar (una recarga
// volvería a mostrar el loading de 5 segundos). En cualquier otra página
// (producto.html) lleva a la Home con ?q=...

// Filtra por nombre las cards ya armadas: oculta las que no coinciden y las
// filas que quedan vacías, y escribe el resultado en #busqueda-estado.
// Una consulta vacía vuelve a mostrar todo.
// Global a propósito (los scripts no usan type="module"): home.js la llama
// al terminar de armar las filas si la búsqueda vino de otra página.
function filtrarJuegos(consulta) {
  const texto = consulta.trim();
  const q = texto.toLowerCase();
  // Un mismo juego puede estar en varias filas (ej. Acción y RPG): se
  // cuentan nombres distintos, no cards, para que el número tenga sentido.
  const encontrados = new Set();

  document.querySelectorAll('#filas-juegos .carrusel').forEach((fila) => {
    let visiblesEnLaFila = 0;

    fila.querySelectorAll('.game-card').forEach((card) => {
      const nombre = card.querySelector('.game-card__title').textContent;
      const coincide = q === '' || nombre.toLowerCase().includes(q);
      card.hidden = !coincide;
      if (coincide) {
        visiblesEnLaFila += 1;
        encontrados.add(nombre);
      }
    });

    // Una fila sin ninguna card visible se oculta entera (con su título).
    fila.hidden = visiblesEnLaFila === 0;

    // La fila cambió de ancho: vuelve al principio y avisa a
    // carrusel-fila.js (que escucha "scroll") para que actualice qué
    // flechas quedan habilitadas.
    const pista = fila.querySelector('.carrusel__pista');
    if (pista) {
      pista.scrollLeft = 0;
      pista.dispatchEvent(new Event('scroll'));
    }
  });

  const estado = document.getElementById('busqueda-estado');
  if (!estado) return;

  if (q === '') {
    estado.textContent = '';
    return;
  }

  if (encontrados.size > 0) {
    const palabra = encontrados.size === 1 ? 'juego' : 'juegos';
    estado.textContent = `${encontrados.size} ${palabra} para “${texto}”`;
  } else {
    estado.textContent = `No encontramos juegos para “${texto}”. Probá con otro nombre.`;
  }

  // El banner ocupa casi toda la primera pantalla: sin esto, al apretar
  // Enter no se vería que pasó algo. Con el header fijo, el scroll-margin-top
  // de home.css deja el mensaje justo debajo. Sin animación si el usuario
  // pidió movimiento reducido.
  const sinAnimacion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  estado.scrollIntoView({ behavior: sinAnimacion ? 'auto' : 'smooth', block: 'start' });
}

// Lupa de mobile. En páginas sin estos elementos, los bloques de abajo no
// hacen nada.
const botonLupa = document.querySelector('.header__search-toggle');
const buscador = document.querySelector('.header__search');
const inputBuscador = buscador ? buscador.querySelector('input') : null;

if (botonLupa && buscador) {
  // Al abrir, el foco pasa al input para escribir de una.
  function abrirBuscador() {
    buscador.classList.add('header__search--abierto');
    botonLupa.setAttribute('aria-expanded', 'true');
    inputBuscador.focus();
  }

  function cerrarBuscador() {
    buscador.classList.remove('header__search--abierto');
    botonLupa.setAttribute('aria-expanded', 'false');
  }

  botonLupa.addEventListener('click', () => {
    const estaAbierto = botonLupa.getAttribute('aria-expanded') === 'true';
    if (estaAbierto) {
      cerrarBuscador();
    } else {
      abrirBuscador();
    }
  });

  // Escape lo cierra y devuelve el foco a la lupa (mismo criterio que menu.js).
  buscador.addEventListener('keydown', (evento) => {
    if (evento.key !== 'Escape') return;
    cerrarBuscador();
    botonLupa.focus();
  });
}

// Enviar la búsqueda y borrarla. Esto corre en todas las páginas con header.
if (buscador) {
  // Solo la Home tiene filas de juegos para filtrar.
  const estamosEnLaHome = () => document.getElementById('filas-juegos') !== null;

  buscador.addEventListener('submit', (evento) => {
    // Sin esto, el form (action="#") recarga la página: en la Home vuelve el
    // loading de 5 s, y en producto.html se pierde el ?id= del juego.
    evento.preventDefault();

    // Fuera de la Home (producto.html) no hay filas que filtrar: se va a la
    // Home con ?q=..., y home.js aplica el filtro cuando termina de armar
    // las filas (recién existen después del fetch).
    if (!estamosEnLaHome()) {
      window.location.href = `index.html?q=${encodeURIComponent(inputBuscador.value.trim())}`;
      return;
    }

    filtrarJuegos(inputBuscador.value);
  });

  // Borrar el texto (la "x" nativa del input type="search", o dejarlo vacío)
  // vuelve a mostrar todas las filas.
  inputBuscador.addEventListener('search', () => {
    if (inputBuscador.value === '' && estamosEnLaHome()) filtrarJuegos('');
  });
}
