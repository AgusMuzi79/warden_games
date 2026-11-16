// menu.js — Menús desplegables del header (hamburguesa y cuenta)
// Depende de que cada botón que abre un menú tenga aria-controls apuntando
// al id de su panel, y aria-expanded para saber si está abierto. También
// depende de sesion.js (cerrarSesion) para el botón "Cerrar sesión".
// Sirve para cualquier menú con ese patrón: hamburguesa, cuenta y carrito.
// No expone nada global: solo engancha eventos al cargar.

// Lista de pares { boton, panel }. Se descartan los botones cuyo panel no
// existe en esta página (por ejemplo, el de cuenta en login.html).
const disparadores = [...document.querySelectorAll('[aria-controls][aria-expanded]')]
  .map((boton) => ({ boton, panel: document.getElementById(boton.getAttribute('aria-controls')) }))
  .filter(({ panel }) => panel);

function cerrarMenu(boton, panel) {
  boton.setAttribute('aria-expanded', 'false');
  panel.hidden = true;
}

function abrirMenu(boton, panel) {
  // Solo un menú abierto a la vez.
  disparadores.forEach(({ boton: otroBoton, panel: otroPanel }) => {
    if (otroBoton !== boton) cerrarMenu(otroBoton, otroPanel);
  });
  boton.setAttribute('aria-expanded', 'true');
  panel.hidden = false;
}

disparadores.forEach(({ boton, panel }) => {
  boton.addEventListener('click', (evento) => {
    evento.stopPropagation();
    const yaEstaAbierto = boton.getAttribute('aria-expanded') === 'true';
    if (yaEstaAbierto) {
      cerrarMenu(boton, panel);
    } else {
      abrirMenu(boton, panel);
    }
  });

  // Clickear un link o el botón de "Cerrar sesión" adentro del panel lo
  // cierra. Hace falta porque algunos links llevan a un ancla de la misma
  // página (#fila-rpg, por ejemplo) o a "#", y ahí la página no se recarga:
  // sin esto el menú se quedaría abierto.
  panel.addEventListener('click', (evento) => {
    if (evento.target.closest('a, .menu-dropdown__cerrar-sesion')) {
      cerrarMenu(boton, panel);
    }
  });
});

// "Cerrar sesión" (simulado: no hay backend, ver sesion.js) vuelve a
// invitado y recarga para que la Home se arme de nuevo con ese estado.
const botonCerrarSesion = document.querySelector('.menu-dropdown__cerrar-sesion');
if (botonCerrarSesion) {
  botonCerrarSesion.addEventListener('click', () => {
    cerrarSesion();
    window.location.reload();
  });
}

// Cierra si se clickea afuera de cualquier menú abierto. Los botones que
// abren un menú frenan la propagación (stopPropagation) para que su propio
// click no llegue hasta acá y lo cierre en el acto.
document.addEventListener('click', () => {
  disparadores.forEach(({ boton, panel }) => {
    if (!panel.hidden) cerrarMenu(boton, panel);
  });
});

// Cierra con Escape y devuelve el foco al botón que lo abrió.
document.addEventListener('keydown', (evento) => {
  if (evento.key !== 'Escape') return;
  disparadores.forEach(({ boton, panel }) => {
    if (!panel.hidden) {
      cerrarMenu(boton, panel);
      boton.focus();
    }
  });
});
