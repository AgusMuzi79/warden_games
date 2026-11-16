// compartir.js — Botón "Copiar" del link para compartir (sección Compartir)
//
// Depende de #btn-copiar-link y del input #link-juego. En producto.html el
// valor de ese input lo pone producto.js. Se carga en juego.html y
// producto.html. No expone nada.
// Los botones de redes y "Mensaje" son placeholders, el único que hace algo
// es "Copiar".

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
