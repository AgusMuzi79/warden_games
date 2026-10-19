// logo-inicio.js: en la Home, clickear el logo sube al inicio en vez de
// recargar.
//
// Los logos (.header__logo y .brand__logo, este último en el footer) son
// links a index.html. Estando ya en la Home, el navegador recargaría la
// página y volvería el loading de 5 segundos. Acá se frena eso y se sube con
// scroll. Solo se carga en index.html; en el resto de las páginas el logo
// sigue llevando a la Home. No depende de otros scripts ni expone nada.

const logosInicio = document.querySelectorAll('.header__logo, .brand__logo');
const prefiereMenosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');

logosInicio.forEach((logo) => {
  logo.addEventListener('click', (evento) => {
    evento.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: prefiereMenosMovimiento.matches ? 'auto' : 'smooth',
    });
  });
});
