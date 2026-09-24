/*
  login.js — Login / Registro
  Depende del HTML de login.html: los botones .auth-switch__btn, los ids
  de formRegister/formLogin y sus campos, y los botones .toggle-pass.
  Controla: el cambio entre form de registro y de login (agrega/saca
  .active y actualiza aria-selected), el ícono y tipo de los inputs de
  contraseña, y la validación de los dos formularios.
*/
document.addEventListener('DOMContentLoaded', () => {

  /* ================= Selector Crear Cuenta / Ingresar =================
     .auth-switch es un tablist de 2 botones (role="tab"): al hacer click
     se muestra el form correspondiente (clase .active) y se actualiza
     tanto el estilo del botón activo como su aria-selected. */
  const switchButtons = document.querySelectorAll('.auth-switch__btn');
  const formPanels = {
    formRegister: document.getElementById('formRegister'),
    formLogin: document.getElementById('formLogin'),
  };

  function switchTo(panelId) {
    switchButtons.forEach(btn => {
      const isActive = btn.getAttribute('aria-controls') === panelId;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });
    Object.entries(formPanels).forEach(([id, panel]) => {
      panel.classList.toggle('active', id === panelId);
    });
  }

  switchButtons.forEach(btn => {
    btn.addEventListener('click', () => switchTo(btn.getAttribute('aria-controls')));
  });

  /* ================= Mostrar / Ocultar contraseña =================
     Cada botón .toggle-pass apunta a un input por data-target. Alterna
     el type entre password/text, el ícono entre ojo cerrado (oculta,
     con puntitos) y ojo abierto (visible, además se pone celeste por
     CSS vía .is-visible), y el aria-label del botón. */
  document.querySelectorAll('.toggle-pass').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const input = document.getElementById(targetId);
      const icon = btn.querySelector('.toggle-pass__icon');
      if (!input) return;

      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      icon.classList.toggle('ph-eye', isPassword);
      icon.classList.toggle('ph-eye-slash', !isPassword);
      btn.classList.toggle('is-visible', isPassword);
      btn.setAttribute('aria-label', isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña');
    });
  });

  /* ================= Validación: Crear Cuenta =================
     Usa la validación nativa del form (checkValidity/reportValidity) y
     le suma tres chequeos que HTML solo no puede hacer: que las dos
     contraseñas coincidan, y que el captcha y los términos estén tildados. */
  const formRegister = document.getElementById('formRegister');
  formRegister.addEventListener('submit', (e) => {
    e.preventDefault();

    const password = document.getElementById('reg-password');
    const password2 = document.getElementById('reg-password2');
    const captcha = document.getElementById('reg-captcha');
    const terms = document.getElementById('reg-terms');

    if (!formRegister.checkValidity()) {
      formRegister.reportValidity();
      return;
    }

    if (password.value !== password2.value) {
      password2.setCustomValidity('Las contraseñas no coinciden');
      password2.reportValidity();
      return;
    }
    password2.setCustomValidity('');

    if (!captcha.checked) {
      alert('Confirmá que no sos un robot.');
      return;
    }

    if (!terms.checked) {
      alert('Necesitás aceptar los términos y la política de privacidad.');
      return;
    }

    // Punto de integración: reemplazar por la llamada real al backend / API.
    console.log('Registro listo para enviar:', {
      fullname: document.getElementById('reg-name').value,
      nickname: document.getElementById('reg-nickname').value,
      age: document.getElementById('reg-age').value,
      email: document.getElementById('reg-email').value,
      password: password.value,
    });

    // Muestra el bloque de éxito en vez del form: dispara la animación
    // "auth-success-pop" definida en login.css (fade + scale al aparecer).
    formRegister.hidden = true;
    document.getElementById('registerSuccess').hidden = false;

    // Simula que la cuenta queda logueada (ver sesion.js: no hay backend
    // todavía, así que esto es lo que hace que la Home ya te muestre con
    // sesión al llegar).
    iniciarSesion();

    // Deja ver la animación un momento y recién ahí lleva al home.
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 2500);
  });

  // Limpia el mensaje de error custom si el usuario vuelve a escribir
  document.getElementById('reg-password2').addEventListener('input', function () {
    this.setCustomValidity('');
  });

  /* ================= Validación: Ingresar =================
     Solo necesita la validación nativa (email + contraseña requeridos);
     no hay reglas propias como en el registro. */
  const formLogin = document.getElementById('formLogin');
  formLogin.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!formLogin.checkValidity()) {
      formLogin.reportValidity();
      return;
    }

    const email = document.getElementById('log-email').value;
    const password = document.getElementById('log-password').value;
    const remember = document.getElementById('log-remember').checked;

    // Punto de integración: reemplazar por la llamada real al backend / API.
    console.log('Login listo para enviar:', { email, password, remember });

    // Simula que la cuenta queda logueada (ver sesion.js).
    iniciarSesion();

    // Login exitoso lleva al home, como en cualquier sitio.
    window.location.href = 'index.html';
  });

});
