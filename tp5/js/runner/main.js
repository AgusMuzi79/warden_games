// main.js — Punto de entrada de Neon Rider
//
// Es el único script del juego que carga runner.html (type="module"):
// importa el resto. Pasa los tamaños de config.js al CSS, precarga las
// imágenes, muestra las pantallas (carga, inicio, récords, pausa, victoria,
// iniciales, derrota) y conecta la entrada con el juego. La lógica de cada
// cuadro está en game.js; la tabla de récords, en records.js.

import { JUEGO, IMAGENES, MODOS } from './config.js';
import { precargar } from './preload.js';
import { conectarEntrada } from './input.js';
import { crearJuego } from './game.js';
import { entraEnTabla, cargarRecords, guardarRecord, ultimasIniciales } from './records.js';

const areaJuego = document.getElementById('game');
const estadoLector = document.getElementById('game-status');
const porcentajeCarga = document.getElementById('loading-percent');

const pantallas = {
  carga: document.getElementById('screen-loading'),
  inicio: document.getElementById('screen-start'),
  pausa: document.getElementById('screen-pause'),
  victoria: document.getElementById('screen-win'),
  derrota: document.getElementById('screen-lose'),
  iniciales: document.getElementById('screen-initials'),
  records: document.getElementById('screen-records'),
};

const botonRecords = document.getElementById('btn-records');

/** Las 26 letras de las iniciales (A = 0 ... Z = 25). */
const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Carga de iniciales: qué letra hay en cada casilla y el puntaje que se
// va a guardar.
const iniciales = {
  casillas: [...pantallas.iniciales.querySelectorAll('.iniciales__letra')],
  letras: [0, 0, 0],
  puntaje: 0,
};

// Los tamaños del área de juego se escriben una sola vez como variables
// CSS: así runner.css y la lógica usan los mismos números de config.js.
areaJuego.style.setProperty('--ancho', `${JUEGO.ancho}px`);
areaJuego.style.setProperty('--alto', `${JUEGO.alto}px`);
areaJuego.style.setProperty('--suelo', `${JUEGO.suelo}px`);
areaJuego.style.setProperty('--alto-suelo', `${JUEGO.alto - JUEGO.suelo}px`);

const juego = crearJuego({
  juego: areaJuego,
  capas: [...areaJuego.querySelectorAll('.layer')],
  mundo: areaJuego.querySelector('.world'),
  hud: document.querySelector('.hud'),   // está afuera de #game, arriba
  jugador: areaJuego.querySelector('.player'),
  hitboxJugador: areaJuego.querySelector('.hitbox--player'),
}, mostrarFin);

/**
 * Muestra una pantalla y oculta las demás. null las oculta todas.
 * El foco pasa al control marcado con data-autofocus (la primera inicial)
 * o, si no hay, al primer botón, para seguir con el teclado.
 * @param {string|null} nombre clave de `pantallas`
 * @param {boolean} [enfocar=true] false al cargar la página: sin una acción
 *   previa del usuario, el foco haría scroll hasta el juego y activaría la
 *   animación de foco del primer botón. Con Tab se llega igual.
 */
function mostrarPantalla(nombre, enfocar = true) {
  for (const [clave, pantalla] of Object.entries(pantallas)) {
    if (pantalla) pantalla.hidden = clave !== nombre;
  }
  const pantalla = nombre ? pantallas[nombre] : null;
  const control = pantalla?.querySelector('[data-autofocus]') ?? pantalla?.querySelector('button');
  if (control && enfocar) control.focus();
}

/**
 * Arranca una partida y le pasa el foco al área de juego.
 * @param {string} claveModo
 */
function jugar(claveModo) {
  mostrarPantalla(null);
  juego.iniciarPartida(claveModo);
  areaJuego.focus();
  anunciar(`Partida en modo ${MODOS[claveModo].nombre}. Espacio para subir.`);
}

/**
 * Pantalla de victoria o derrota (la llama game.js al terminar). En
 * Infinito (sin meta) la derrota pasa antes por la carga de iniciales si
 * el puntaje entra en la tabla.
 * @param {'victoria' | 'derrota'} resultado
 * @param {number} puntaje
 */
function mostrarFin(resultado, puntaje) {
  if (resultado === 'derrota' && conRecords() && entraEnTabla(puntaje)) {
    pedirIniciales(puntaje);
    return;
  }
  mostrarResultado(resultado, puntaje, -1);
}

/**
 * ¿La partida actual guarda récords? Solo el modo sin meta (Infinito).
 * @returns {boolean}
 */
function conRecords() {
  return !MODOS[juego.modo].conMeta;
}

/**
 * Muestra la pantalla de victoria o derrota. En Infinito, la de derrota
 * suma la tabla de récords.
 * @param {'victoria' | 'derrota'} resultado
 * @param {number} puntaje
 * @param {number} puesto récord recién guardado a resaltar (-1 si ninguno)
 */
function mostrarResultado(resultado, puntaje, puesto) {
  const pantalla = pantallas[resultado];
  pantalla.querySelector('.screen__score').textContent = puntaje;
  const tabla = pantalla.querySelector('[data-records]');
  if (tabla) {
    tabla.hidden = !conRecords();
    // Panel más compacto para que entren las 10 filas.
    pantalla.querySelector('.screen__panel').classList.toggle('screen__panel--records', conRecords());
    if (conRecords()) dibujarRecords(tabla, cargarRecords(), puesto);
  }
  mostrarPantalla(resultado);
  let aviso = resultado === 'victoria' ? `Ganaste con ${puntaje} puntos.` : `Perdiste con ${puntaje} puntos.`;
  if (puesto !== -1) aviso += ` Récord guardado en el puesto ${puesto + 1}.`;
  anunciar(aviso);
}

/**
 * Arma la tabla de récords adentro de un contenedor [data-records].
 * @param {HTMLElement} contenedor
 * @param {{ iniciales: string, puntaje: number }[]} records
 * @param {number} resaltar puesto del récord nuevo (-1 si ninguno)
 */
function dibujarRecords(contenedor, records, resaltar) {
  if (!records.length) {
    const vacio = document.createElement('p');
    vacio.className = 'records__vacio';
    vacio.textContent = 'Todavía no hay récords. Jugá en modo Infinito y estrená la tabla.';
    contenedor.replaceChildren(vacio);
    return;
  }
  const tabla = document.createElement('table');
  tabla.className = 'records__tabla';
  tabla.innerHTML = '<caption class="sr-only">Récords del modo Infinito</caption>'
    + '<thead><tr><th scope="col">Puesto</th><th scope="col">Iniciales</th><th scope="col">Puntaje</th></tr></thead>';
  const cuerpo = document.createElement('tbody');
  records.forEach((record, indice) => {
    const fila = document.createElement('tr');
    // textContent y no innerHTML: las iniciales vienen del storage.
    for (const valor of [indice + 1, record.iniciales, record.puntaje]) {
      const celda = document.createElement('td');
      celda.textContent = valor;
      fila.append(celda);
    }
    if (indice === resaltar) {
      fila.className = 'records__fila--nueva';
      const nuevo = document.createElement('span');
      nuevo.className = 'sr-only';
      nuevo.textContent = ' (tu récord)';
      fila.lastChild.append(nuevo);
    }
    cuerpo.append(fila);
  });
  tabla.append(cuerpo);
  contenedor.replaceChildren(tabla);
}

/** Abre la pantalla de récords desde el inicio. */
function verRecords() {
  dibujarRecords(pantallas.records.querySelector('[data-records]'), cargarRecords(), -1);
  mostrarPantalla('records');
}

/** Vuelve de los récords al inicio, con el foco en el botón Récords. */
function volverDeRecords() {
  mostrarPantalla('inicio', false);
  botonRecords.focus();
}

// ---------------------------------------------------------------
// Carga de iniciales (arcade): 3 casillas A–Z
// ---------------------------------------------------------------

/**
 * Muestra la pantalla de iniciales, arrancando con las últimas usadas.
 * @param {number} puntaje
 */
function pedirIniciales(puntaje) {
  iniciales.puntaje = puntaje;
  iniciales.letras = [...ultimasIniciales()].map((letra) => LETRAS.indexOf(letra));
  iniciales.casillas.forEach((_, casilla) => dibujarLetra(casilla));
  pantallas.iniciales.querySelector('.screen__score').textContent = puntaje;
  mostrarPantalla('iniciales');
  anunciar(`¡Nuevo récord con ${puntaje} puntos! Cargá tus iniciales.`);
}

/**
 * Escribe la letra de una casilla (texto y atributos del spinbutton).
 * @param {number} casilla 0 a 2
 */
function dibujarLetra(casilla) {
  const letra = LETRAS[iniciales.letras[casilla]];
  const elemento = iniciales.casillas[casilla];
  elemento.textContent = letra;
  elemento.setAttribute('aria-valuenow', iniciales.letras[casilla]);
  elemento.setAttribute('aria-valuetext', letra);
}

/**
 * Pasa el foco a una casilla.
 * @param {number} casilla se recorta a 0..2
 */
function irACasilla(casilla) {
  const limitada = Math.max(0, Math.min(iniciales.casillas.length - 1, casilla));
  iniciales.casillas[limitada].focus();
}

/**
 * Sube o baja la letra de una casilla, dando la vuelta entre Z y A.
 * @param {number} casilla
 * @param {1 | -1} paso
 */
function cambiarLetra(casilla, paso) {
  iniciales.letras[casilla] = (iniciales.letras[casilla] + paso + LETRAS.length) % LETRAS.length;
  dibujarLetra(casilla);
}

/** Guarda el récord y muestra el game over con la tabla. */
function guardarIniciales() {
  const texto = iniciales.letras.map((indice) => LETRAS[indice]).join('');
  const { puesto } = guardarRecord(texto, iniciales.puntaje);
  mostrarResultado('derrota', iniciales.puntaje, puesto);
}

// Teclado de las iniciales: ↑/↓ cambian la letra, ←/→ la casilla, una
// letra se escribe y avanza, Backspace vuelve y Enter guarda. Sobre el
// botón Guardar se deja el comportamiento normal del botón. (input.js no
// toma estas teclas mientras la pantalla está a la vista: data-iniciales.)
pantallas.iniciales.addEventListener('keydown', (evento) => {
  const casilla = evento.target.closest('.iniciales__casilla');
  if (!casilla) return;
  const indice = [...casilla.parentElement.children].indexOf(casilla);
  const esLetra = /^[a-z]$/i.test(evento.key) && !evento.ctrlKey && !evento.metaKey && !evento.altKey;

  if (evento.key === 'ArrowUp') cambiarLetra(indice, 1);
  else if (evento.key === 'ArrowDown') cambiarLetra(indice, -1);
  else if (evento.key === 'ArrowRight') irACasilla(indice + 1);
  else if (evento.key === 'ArrowLeft' || evento.key === 'Backspace') irACasilla(indice - 1);
  else if (evento.key === 'Enter') guardarIniciales();
  else if (esLetra) {
    iniciales.letras[indice] = LETRAS.indexOf(evento.key.toUpperCase());
    dibujarLetra(indice);
    irACasilla(indice + 1);
  } else if (evento.key !== ' ' || !evento.target.matches('.iniciales__letra')) {
    return;   // Tab, el espacio sobre una flecha y el resto siguen su camino normal
  }
  // Flechas y espacio no scrollean la página; Enter no "clickea" la flecha.
  evento.preventDefault();
});

/** Pausa y muestra la pantalla de pausa (si había partida). */
function pausar() {
  if (juego.pausar()) mostrarPantalla('pausa');
}

/** Sale de la pausa. */
function reanudar() {
  mostrarPantalla(null);
  juego.reanudar();
  areaJuego.focus();
}

/** Vuelve al selector de modo. */
function irAlMenu() {
  juego.abandonar();
  mostrarPantalla('inicio');
}

/**
 * Texto para lectores de pantalla (el juego en sí es visual).
 * @param {string} texto
 */
function anunciar(texto) {
  estadoLector.textContent = texto;
}

// Botones de las pantallas: data-mode elige el modo, data-action el resto.
areaJuego.addEventListener('click', (evento) => {
  const boton = evento.target.closest('button');
  if (!boton) return;
  if (boton.dataset.mode) jugar(boton.dataset.mode);
  else if (boton.dataset.letra) {
    // Flecha de una casilla de las iniciales: cambia la letra y deja el
    // foco en la casilla, para seguir con el teclado.
    const casilla = Number(boton.dataset.casilla);
    cambiarLetra(casilla, boton.dataset.letra === 'subir' ? 1 : -1);
    irACasilla(casilla);
  } else if (boton.dataset.action === 'resume') reanudar();
  else if (boton.dataset.action === 'retry') jugar(juego.modo);
  else if (boton.dataset.action === 'menu') irAlMenu();
  else if (boton.dataset.action === 'records') verRecords();
  else if (boton.dataset.action === 'back') volverDeRecords();
  else if (boton.dataset.action === 'save-initials') guardarIniciales();
});

conectarEntrada(areaJuego, {
  impulsar: () => juego.impulsar(),
  alternarPausa: () => {
    if (juego.fase === 'pausa') reanudar();
    else pausar();
  },
  alternarDebug: () => juego.alternarDebug(),
  pausar,
  reanudar: () => {
    if (juego.fase === 'pausa') reanudar();
  },
});

// La página (js/runner-pagina.js) avisa con este evento que se abrió la
// ayuda: se pausa la partida y queda la pantalla de pausa para continuar.
document.addEventListener('runner:pausar', pausar);

// Precarga: hasta que no llegan todas las imágenes no se puede elegir modo.
mostrarPantalla('carga');
precargar(IMAGENES, (porcentaje) => {
  porcentajeCarga.textContent = porcentaje;
}).then((fallidas) => {
  if (fallidas.length) console.warn('No se pudieron cargar:', fallidas);
  mostrarPantalla('inicio', false);
});
