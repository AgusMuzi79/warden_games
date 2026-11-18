// input.js — Teclado y clic
//
// Traduce teclas y clics a acciones del juego. No sabe nada del estado:
// llama a las funciones que le pasa main.js. Cada pulsación cuenta una sola
// vez: si se deja apretada la tecla, el navegador repite el keydown con
// e.repeat = true, y esos se ignoran.

/** Teclas que impulsan la moto (event.code no depende del idioma del teclado). */
const TECLAS_IMPULSO = ['Space', 'ArrowUp', 'KeyW'];
const TECLAS_PAUSA = ['KeyP', 'Escape'];

/**
 * Conecta la entrada.
 * @param {HTMLElement} areaJuego #game, donde el clic impulsa
 * @param {{
 *   impulsar: () => boolean,
 *   alternarPausa: () => void,
 *   alternarDebug: () => void,
 *   pausar: () => void,
 *   reanudar: () => void,
 * }} acciones reanudar no hace nada si la partida no está en pausa; impulsar devuelve true si se usó (había partida en curso)
 */
export function conectarEntrada(areaJuego, acciones) {
  document.addEventListener('keydown', (evento) => {
    if (evento.repeat) return;
    // Si se está escribiendo en un campo (el newsletter del footer), las
    // teclas son de ese campo, no del juego.
    if (evento.target instanceof Element && evento.target.closest('input, textarea, select')) return;
    // Con un diálogo abierto (la ayuda), las teclas son del diálogo: Esc lo
    // cierra y la partida sigue en pausa hasta que se elija continuar.
    if (document.querySelector('dialog[open]')) return;

    if (TECLAS_IMPULSO.includes(evento.code)) {
      // El espacio sobre un botón con foco lo activa (por ejemplo
      // "Continuar" en la pausa): eso es del botón, no del juego.
      if (evento.code === 'Space' && evento.target instanceof Element
        && evento.target.closest('button, a, summary')) return;
      // En cualquier otro caso se cancela el scroll de la página, haya
      // partida o no. Si no había partida en curso pero sí pausa, la misma
      // tecla de subir la reanuda.
      evento.preventDefault();
      if (!acciones.impulsar()) acciones.reanudar();
    } else if (TECLAS_PAUSA.includes(evento.code)) {
      acciones.alternarPausa();
    } else if (evento.code === 'KeyH') {
      acciones.alternarDebug();
    }
  });

  // pointerdown y no click: responde al apretar, no al soltar. Los clics
  // sobre los botones de las pantallas son de los botones.
  areaJuego.addEventListener('pointerdown', (evento) => {
    if (evento.target.closest('button')) return;
    if (acciones.impulsar()) {
      evento.preventDefault();   // evita seleccionar texto al clickear rápido
      areaJuego.focus();         // las teclas siguen llegando al juego
    }
  });

  // Pausa automática: otra pestaña o la ventana pierde el foco.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) acciones.pausar();
  });
  window.addEventListener('blur', () => acciones.pausar());
}
