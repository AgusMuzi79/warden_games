// resena.js — Contador de caracteres del textarea de "Dejá tu reseña"

const textareaResena = document.getElementById('resena-texto');
const contadorResena = document.getElementById('resena-contador');

textareaResena.addEventListener('input', () => {
  contadorResena.textContent = textareaResena.value.length;
});
