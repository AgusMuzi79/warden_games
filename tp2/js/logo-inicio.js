// logo-inicio.js — En la Home, clickear el logo sube al inicio en vez de recargar
// Los logos (header y footer) son links a index.html: estando ya en la Home,
// el navegador recargaría la página. Acá se frena eso y se sube con scroll.
// Solo se carga en index.html; en el resto de las páginas el logo sigue
// llevando a la Home como siempre.

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
