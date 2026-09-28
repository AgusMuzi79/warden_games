// juego.js — Lógica del juego (Peg Solitaire)
// Parte 2 (Etapa 4): solo arma el grid visual del tablero (33 posiciones,
// forma de cruz clásica). Reglas de movimiento, detección de fin de juego
// y persistencia de puntaje (vía api.js) quedan para una parte aparte.

const grilla = document.getElementById('tablero-grid');

const FILAS = 7;
const COLUMNAS = 7;
// Posición inicial vacía: el centro del tablero clásico de 33.
const CENTRO_FILA = 3;
const CENTRO_COLUMNA = 3;

// Forma de cruz: una posición es válida si está en la banda central de
// filas (2-4, el "brazo" horizontal) o en la banda central de columnas
// (2-4, el "brazo" vertical). Fuera de esas bandas son las esquinas del
// 7x7 que no existen en el tablero real.
function esPosicionValida(fila, columna) {
  return (fila >= 2 && fila <= 4) || (columna >= 2 && columna <= 4);
}

for (let fila = 0; fila < FILAS; fila++) {
  for (let columna = 0; columna < COLUMNAS; columna++) {
    const casillero = document.createElement('div');

    if (!esPosicionValida(fila, columna)) {
      casillero.className = 'tablero__hueco tablero__hueco--vacio';
      grilla.append(casillero);
      continue;
    }

    const esCentro = fila === CENTRO_FILA && columna === CENTRO_COLUMNA;
    casillero.className = `tablero__hueco ${esCentro ? 'tablero__hueco--descargado' : 'tablero__hueco--activo'}`;
    grilla.append(casillero);
  }
}

// Portada: se ve primero, con el botón "Jugar" para arrancar la partida.
// Al clickearlo, se oculta la portada y se muestra el tablero de una vez
// (no hay lógica de juego todavía — eso es de una etapa aparte). La
// cabecera con el nombre ("Neon Circuit") arranca oculta porque la
// portada ya lo trae dibujado adentro; aparece recién con el tablero.
const cabecera = document.getElementById('tablero-cabecera');
const portada = document.getElementById('tablero-portada');
const tableroJuego = document.getElementById('tablero-juego');
const btnJugar = document.getElementById('btn-jugar');

btnJugar.addEventListener('click', () => {
  portada.hidden = true;
  cabecera.hidden = false;
  tableroJuego.hidden = false;

  // El botón "Jugar" (que tenía el foco) desaparece con la portada: sin
  // esto, el foco cae al <body> y quien navega con teclado o lector de
  // pantalla queda "perdido". La cabecera es lo primero visible del
  // tablero real, por eso recibe el foco (tabindex="-1" en el HTML).
  cabecera.focus();
});

// Galería animada (Etapa 4 parte 5, animada en la 2ª corrección del TPE2):
// las 6 capturas reales de Neon Circuit. El motor del flip (genérico, lo
// comparte producto.html) vive en js/galeria.js, cargado antes que este
// archivo en juego.html.
const FOTOS_GALERIA_JUEGO = [
  { src: 'assets/img/inicio-juego.png', alt: 'Tablero de Neon Circuit al arrancar la partida, con los 33 nodos activos y el hueco central.' },
  { src: 'assets/img/ficha-seleccionada.png', alt: 'Un nodo seleccionado en el tablero, listo para saltar.' },
  { src: 'assets/img/ficha-salto.png', alt: 'El momento del salto de un nodo sobre otro hacia un casillero descargado.' },
  { src: 'assets/img/juego-avanzado.png', alt: 'Partida avanzada, con buena parte de los nodos ya descargados del tablero.' },
  { src: 'assets/img/victoria.png', alt: 'Pantalla de victoria, con un único nodo restante en el centro del tablero.' },
  { src: 'assets/img/glitch-gameover.png', alt: 'Pantalla de fin de partida, con un efecto glitch sobre el tablero.' },
];
iniciarGaleria(FOTOS_GALERIA_JUEGO);
