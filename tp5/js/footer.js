// footer.js: comportamiento del footer (compartido por index.html,
// producto.html y juego.html).
//
// Depende de .newsletter__form y .newsletter__ok (el <p role="status">
// vacío que ya está en el HTML). Si alguno falta, no hace nada. No expone
// funciones globales.
//
// Newsletter simulado: no hay backend, y GitHub Pages no acepta POST (un
// submit real terminaría en una página de error). Se valida el mail con la
// validación nativa del navegador y se confirma en el mismo lugar, sin
// navegar.

const formNewsletter = document.querySelector('.newsletter__form');
const confirmacionNewsletter = document.querySelector('.newsletter__ok');

if (formNewsletter && confirmacionNewsletter) {
  formNewsletter.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const inputMail = formNewsletter.querySelector('input[type="email"]');

    // El form tiene novalidate (para que no salte la burbuja nativa sola al
    // apretar Enter en otro campo), así que la validación se pide a mano.
    if (!inputMail.checkValidity()) {
      inputMail.reportValidity();
      return;
    }

    // El <p role="status"> ya estaba en la página, vacío: un lector de
    // pantalla anuncia el cambio de texto en una región que ya existe, pero no
    // siempre lo hace con una que se agrega recién con el texto puesto.
    confirmacionNewsletter.textContent = `Listo, te vamos a escribir a ${inputMail.value}.`;
    formNewsletter.hidden = true;

    // El botón que tenía el foco desaparece con el form: sin esto, el foco
    // quedaría en el <body> y quien navega con teclado perdería el lugar.
    confirmacionNewsletter.focus();
  });
}
