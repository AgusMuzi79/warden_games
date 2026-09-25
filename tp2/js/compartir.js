// compartir.js — Botón "Copiar" del link para compartir (sección Compartir)

const botonCopiar = document.getElementById('btn-copiar-link');
const inputLink = document.getElementById('link-juego');

botonCopiar.addEventListener('click', async () => {
  const textoOriginal = botonCopiar.textContent;

  try {
    await navigator.clipboard.writeText(inputLink.value);
    botonCopiar.textContent = '¡Copiado!';
  } catch {
    // navigator.clipboard puede fallar (contexto no seguro, ej. abrir el
    // archivo con file://, o permiso denegado): avisamos en vez de quedar
    // sin ningún feedback.
    botonCopiar.textContent = 'No se pudo copiar';
  }

  setTimeout(() => {
    botonCopiar.textContent = textoOriginal;
  }, 2000);
});
