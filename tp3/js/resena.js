// resena.js — Contador de caracteres y envío de "Dejá tu reseña"
//
// Depende del HTML de la sección "Dejá tu reseña": #resena-texto (textarea),
// #resena-contador, #form-resena y #resena-estado (región role="status").
// Se carga en juego.html y producto.html. No expone nada.
// El puntaje con estrellas no pasa por acá: es CSS puro (radios + labels).

const textareaResena = document.getElementById('resena-texto');
const contadorResena = document.getElementById('resena-contador');
const formResena = document.getElementById('form-resena');
const estadoResena = document.getElementById('resena-estado');

textareaResena.addEventListener('input', () => {
  contadorResena.textContent = textareaResena.value.length;
});

// Sin backend todavía (ver DECISIONES.md), así que "publicar" no manda la
// reseña a ningún lado. Lo que sí hay que evitar es el submit real del
// form: sin preventDefault(), el navegador navega a la misma URL y se
// pierde el puntaje y el texto ya escritos.
formResena.addEventListener('submit', (evento) => {
  evento.preventDefault();

  formResena.reset();
  contadorResena.textContent = '0';
  estadoResena.textContent = '¡Gracias por tu reseña!';
});
