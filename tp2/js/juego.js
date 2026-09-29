// juego.js — Página del juego (Neon Circuit, un Peg Solitaire)
//
// Qué hace hoy:
//   1. Arma el tablero visual de 33 posiciones (forma de cruz).
//   2. Maneja la portada: el botón "Jugar" la reemplaza por el tablero.
//   3. Le pasa las 6 capturas del juego a la galería animada.
// Todavía no hay reglas de movimiento ni detección de fin de partida.
//
// Depende de juego.html: #tablero-grid, #tablero-cabecera, #tablero-portada,
// #tablero-juego y #btn-jugar. También de js/galeria.js, que tiene que
// cargarse antes porque de ahí sale iniciarGaleria().
// No expone nada: los otros scripts no llaman a este.

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

// Recorre las 49 celdas del 7x7. Las que no son parte de la cruz se crean
// igual, como huecos invisibles, para que el CSS Grid conserve la forma.
// El centro arranca descargado y el resto activo.
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

// Portada: es lo primero que se ve. Al clickear "Jugar" se oculta y se
// muestra el tablero. La cabecera con el nombre arranca oculta porque la
// imagen de la portada ya trae el nombre dibujado; aparece con el tablero.
const cabecera = document.getElementById('tablero-cabecera');
const portada = document.getElementById('tablero-portada');
const tableroJuego = document.getElementById('tablero-juego');
const btnJugar = document.getElementById('btn-jugar');

btnJugar.addEventListener('click', () => {
  portada.hidden = true;
  cabecera.hidden = false;
  tableroJuego.hidden = false;

  // "Jugar" tenía el foco y desaparece con la portada. Sin esto el foco cae
  // al <body> y quien navega con teclado o lector de pantalla se pierde.
  // La cabecera es lo primero visible del tablero, y por eso puede recibir
  // el foco por código (tiene tabindex="-1" en el HTML).
  cabecera.focus();
});

// Galería: las 6 capturas reales de Neon Circuit, en el orden en que se
// ven. El motor del flip es genérico (lo comparte producto.html) y vive en
// js/galeria.js. Cada foto lleva su propio alt.
const FOTOS_GALERIA_JUEGO = [
  { src: 'assets/img/inicio-juego.png', alt: 'Tablero de Neon Circuit al arrancar la partida, con los 33 nodos activos y el hueco central.' },
  { src: 'assets/img/ficha-seleccionada.png', alt: 'Un nodo seleccionado en el tablero, listo para saltar.' },
  { src: 'assets/img/ficha-salto.png', alt: 'El momento del salto de un nodo sobre otro hacia un casillero descargado.' },
  { src: 'assets/img/juego-avanzado.png', alt: 'Partida avanzada, con buena parte de los nodos ya descargados del tablero.' },
  { src: 'assets/img/victoria.png', alt: 'Pantalla de victoria, con un único nodo restante en el centro del tablero.' },
  { src: 'assets/img/glitch-gameover.png', alt: 'Pantalla de fin de partida, con un efecto glitch sobre el tablero.' },
];
iniciarGaleria(FOTOS_GALERIA_JUEGO);
