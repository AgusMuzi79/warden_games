// sesion.js — Estado de sesión simulado, persistido en localStorage.
// No hay backend todavía: esto es lo que hace que "iniciar sesión" en
// login.js sobreviva la navegación a index.html. Se carga antes que
// home.js y menu.js para que ya vean el estado correcto al arrancar.

const CLAVE_SESION = 'warden-sesion';

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

// Refleja el estado guardado en los avatares del header (si esta página
// los tiene — login.html no, por ejemplo).
function aplicarEstadoSesion() {
  const avatarUsuario = document.querySelector('.header__avatar[data-sesion="usuario"]');
  const avatarInvitado = document.querySelector('.header__avatar[data-sesion="invitado"]');
  if (!avatarUsuario || !avatarInvitado) return;

  const sesionIniciada = haySesionGuardada();
  avatarUsuario.hidden = !sesionIniciada;
  avatarInvitado.hidden = sesionIniciada;
}

aplicarEstadoSesion();
