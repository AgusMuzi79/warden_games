// loading.js: loading simulado de 5 segundos que se ve cada vez que carga la
// Home (lo pide el enunciado). Muestra un % real de avance, un aro de
// progreso y frases que rotan.
//
// Depende de los ids #loading, #loading-num, #loading-ring y #loading-texto
// de index.html. Mientras carga, deja el header, el main y el footer con
// `inert` para que no se pueda tabular ni clickear lo que tapa el overlay.
// No expone nada. carousel.js observa el atributo hidden de #loading para
// saber cuándo arrancar su autoplay.

const overlay = document.getElementById('loading');
const numero = document.getElementById('loading-num');
const anillo = document.getElementById('loading-ring');
const texto = document.getElementById('loading-texto');
// Lo que queda bloqueado (inert) hasta que termina la carga.
const bloqueados = document.querySelectorAll('.header, main, .footer');

bloqueados.forEach((el) => el.setAttribute('inert', ''));

const DURACION_MS = 5000;
// El avance va de 0 a 100 %.
const PASOS = 100;
const intervalo = DURACION_MS / PASOS;
const CIRCUNFERENCIA = 2 * Math.PI * 54; // mismo radio que el <circle> de index.html

// Puramente decorativas (aria-hidden en index.html, ver DECISIONES.md): el
// lector de pantalla no las lee, ya tiene su propio anuncio fijo — leer
// esto en voz alta cambiaría de texto demasiadas veces en 5 segundos.
const FRASES = [
  'Poniendo a correr a los hámsters…',
  'Convenciendo a la IA de que trabaje…',
  'Ocultando las microtransacciones…',
];
const FRASE_FINAL = 'Todo listo, a viciar.';

let porcentaje = 0;
let indiceAnterior = -1;

// Cambia la frase según el tramo del avance: una por cada tercio, y la final
// al llegar a 100. Solo toca el DOM cuando cambia de tramo.
function actualizarFrase() {
  const indice = porcentaje === PASOS ? FRASES.length : Math.floor(porcentaje / (PASOS / FRASES.length));
  if (indice === indiceAnterior) return;
  texto.textContent = porcentaje === PASOS ? FRASE_FINAL : FRASES[indice];
  indiceAnterior = indice;
}

actualizarFrase();

// El % se calcula con el tiempo real transcurrido, no sumando 1 por cada
// tick: si la pestaña está en segundo plano el navegador frena los timers
// (ticks de 1 segundo o más), y sumando de a 1 el loading podía tardar más de
// un minuto. Así siempre termina a los 5 segundos, se vea o no la pestaña
// (ver AUDITORIA.md, T14).
const inicioCarga = performance.now();

// Cada tick actualiza el número, el aro (strokeDashoffset va de la
// circunferencia completa, aro vacío, a 0, aro lleno) y la frase.
const timer = setInterval(() => {
  const transcurrido = performance.now() - inicioCarga;
  porcentaje = Math.min(PASOS, Math.floor((transcurrido / DURACION_MS) * PASOS));
  numero.textContent = porcentaje;
  anillo.style.strokeDashoffset = CIRCUNFERENCIA * (1 - porcentaje / PASOS);
  actualizarFrase();

  if (porcentaje >= PASOS) {
    clearInterval(timer);
    overlay.hidden = true;
    bloqueados.forEach((el) => el.removeAttribute('inert'));
  }
}, intervalo);
