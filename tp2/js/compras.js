// compras.js — Modal de pago simulado ("Pagar carrito")
// Sin pasarela real (ver DECISIONES.md): el form no valida contra nada ni
// manda datos a ningún lado. "Confirmar compra" simula el éxito, mueve los
// juegos del carrito a la lista de comprados (carrito.js) y vacía el carrito.

const modalPago = document.getElementById('modal-pago');
const botonPagar = document.getElementById('btn-pagar-carrito');
const botonCerrarPago = document.getElementById('btn-cerrar-pago');
const formPago = document.getElementById('form-pago');
const resumenPago = document.getElementById('pago-resumen');
const exitoPago = document.getElementById('pago-exito');

function abrirModalPago() {
  const items = obtenerCarrito();
  if (items.length === 0) return; // No tiene sentido pagar un carrito vacío.

  resumenPago.textContent = items.length === 1
    ? 'Vas a comprar 1 juego.'
    : `Vas a comprar ${items.length} juegos.`;

  modalPago.showModal();
}

botonPagar.addEventListener('click', abrirModalPago);
botonCerrarPago.addEventListener('click', () => modalPago.close());

// Clickear el fondo oscuro cierra el modal. Al usar showModal(), un click
// sobre el ::backdrop llega con el propio <dialog> como target (no hay
// forma de apuntar al backdrop en sí, no es un nodo real del DOM).
modalPago.addEventListener('click', (evento) => {
  if (evento.target === modalPago) modalPago.close();
});

formPago.addEventListener('submit', (evento) => {
  evento.preventDefault();

  agregarComprados(obtenerCarrito());
  vaciarCarrito();

  formPago.hidden = true;
  exitoPago.hidden = false;

  setTimeout(() => modalPago.close(), 2000);
});

// Deja el modal listo para la próxima vez que se abra (si no, la próxima
// compra arrancaría directo en la pantalla de éxito de la anterior).
modalPago.addEventListener('close', () => {
  formPago.reset();
  formPago.hidden = false;
  exitoPago.hidden = true;
});
