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
const avisoRegistro = document.getElementById('pago-registro');

function abrirModalPago() {
  const items = obtenerCarrito();
  if (items.length === 0) return; // No tiene sentido pagar un carrito vacío.

  // Un invitado puede armar el carrito, pero para pagar tiene que tener
  // cuenta: en vez del form de pago se muestra el aviso con el link a registrarse.
  if (!haySesionGuardada()) {
    formPago.hidden = true;
    avisoRegistro.hidden = false;
    modalPago.showModal();
    return;
  }

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

  // Recarga en vez de solo cerrar el modal: es la forma más simple de que
  // la fila "Mis juegos" de home.js se arme de nuevo con la compra recién
  // hecha, sin duplicar esa lógica de renderizado acá (mismo criterio que
  // "Cerrar sesión" en menu.js).
  setTimeout(() => window.location.reload(), 2000);
});

// Deja el modal listo por si se cierra sin llegar a confirmar la compra
// (con la "X", Escape o clickeando el fondo) y se vuelve a abrir después.
modalPago.addEventListener('close', () => {
  formPago.reset();
  formPago.hidden = false;
  exitoPago.hidden = true;
  avisoRegistro.hidden = true;
});
