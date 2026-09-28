// buscador.js — Lupa del header en mobile: abre y cierra el buscador
// Solo hace algo en mobile: desde tablet el buscador ya se ve siempre y el
// botón de la lupa está oculto por CSS (header.css).
// A propósito no usa aria-controls: menu.js engancha cualquier botón que
// tenga aria-controls + aria-expanded, y cierra sus paneles al clickear en
// cualquier lado — eso cerraría el buscador al tocar el input para escribir.

const botonLupa = document.querySelector('.header__search-toggle');
const buscador = document.querySelector('.header__search');

if (botonLupa && buscador) {
  const inputBuscador = buscador.querySelector('input');

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
