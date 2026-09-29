// sesion.js — Estado de sesión simulado, persistido en localStorage.
// No hay backend todavía: esto es lo que hace que "iniciar sesión" en
// login.js sobreviva la navegación a index.html. Se carga antes que
// home.js y menu.js para que ya vean el estado correcto al arrancar.
//
// Depende de: los dos avatares del header (.header__avatar con
// data-sesion="usuario" o "invitado") y, en cerrarSesion(), de las claves
// CLAVE_CARRITO y CLAVE_COMPRAS que define carrito.js.
// Expone (globales): haySesionGuardada, iniciarSesion, cerrarSesion.
// Los usan login.js, menu.js y compras.js. aplicarEstadoSesion() corre sola
// al cargar el script.

const CLAVE_SESION = 'warden-sesion';

// La sesión es un solo valor: si la clave vale 'usuario' hay sesión, si no
// existe sos invitado.
function haySesionGuardada() {
  return localStorage.getItem(CLAVE_SESION) === 'usuario';
}

function iniciarSesion() {
  localStorage.setItem(CLAVE_SESION, 'usuario');
}

// También borra carrito y compras (claves de carrito.js): al no haber cuentas
// reales, no hay "tu cuenta" a la que asociarlos, y un invitado no debería ver
// lo que compró otra sesión. Solo la llama menu.js, en páginas que ya cargan carrito.js.
function cerrarSesion() {
  localStorage.removeItem(CLAVE_SESION);
  localStorage.removeItem(CLAVE_CARRITO);
  localStorage.removeItem(CLAVE_COMPRAS);
}

// Refleja el estado guardado en los avatares del header: muestra el de
// usuario o el de invitado, nunca los dos. Si la página no tiene los dos
// avatares (login.html no tiene header), no hace nada.
function aplicarEstadoSesion() {
  const avatarUsuario = document.querySelector('.header__avatar[data-sesion="usuario"]');
  const avatarInvitado = document.querySelector('.header__avatar[data-sesion="invitado"]');
  if (!avatarUsuario || !avatarInvitado) return;

  const sesionIniciada = haySesionGuardada();
  avatarUsuario.hidden = !sesionIniciada;
  avatarInvitado.hidden = sesionIniciada;
}

aplicarEstadoSesion();
