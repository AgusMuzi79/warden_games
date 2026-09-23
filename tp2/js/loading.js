// loading.js — Simulación de carga en la Home

const overlay = document.getElementById('loading');
const numero = document.getElementById('loading-num');
const bloqueados = document.querySelectorAll('.header, main, .footer');

bloqueados.forEach((el) => el.setAttribute('inert', ''));

const DURACION_MS = 5000;
const PASOS = 100;
const intervalo = DURACION_MS / PASOS;
let porcentaje = 0;

const timer = setInterval(() => {
  porcentaje += 1;
  numero.textContent = porcentaje;

  if (porcentaje >= PASOS) {
    clearInterval(timer);
    overlay.hidden = true;
    bloqueados.forEach((el) => el.removeAttribute('inert'));
  }
}, intervalo);
