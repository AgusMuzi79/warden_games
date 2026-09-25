// compartir.js — Botón "Copiar" del link para compartir (sección Compartir)

const botonCopiar = document.getElementById('btn-copiar-link');
const inputLink = document.getElementById('link-juego');

botonCopiar.addEventListener('click', async () => {
  await navigator.clipboard.writeText(inputLink.value);

  const textoOriginal = botonCopiar.textContent;
  botonCopiar.textContent = '¡Copiado!';

  setTimeout(() => {
    botonCopiar.textContent = textoOriginal;
  }, 2000);
});
