// blocka.js — Página de Blocka
//
// Qué hace hoy:
//   1. Maneja la portada y la pantalla de inicio: "Jugar" (portada) lleva al
//      inicio (tabla de récords, con un tachito para borrar cada uno) y
//      "Comenzar" lleva a elegir la dificultad: 4, 9 o 16 piezas. Los récords
//      y el tiempo límite dependen de la cantidad de piezas.
//   2. Sorteo de la imagen: una tragamonedas de 3 rodillos que frena, uno
//      tras otro, en la imagen elegida para el nivel (extra del enunciado).
//   3. Motor del nivel: carga la imagen sorteada, la corta en piezas, les
//      aplica los filtros del nivel, las gira al azar y deja girarlas con el
//      mouse (clic izquierdo a la izquierda, clic derecho a la derecha) o con
//      el teclado (flechas para elegir, Q / E para girar) hasta armar la imagen. Al armarla se quitan los filtros con un fundido.
//   4. Temporizador (arranca al terminar el sorteo, se frena al armar la imagen),
//      récord por nivel guardado en localStorage y paso entre niveles
//      ("Siguiente nivel", "Reintentar nivel" o "Volver al inicio").
//   5. Extras: "Ayudita" (deja una parte bien puesta y fija, suma 5 segundos),
//      "Trampa" (resuelve el nivel, sin récord; oculta, solo con el atajo
//      Alt + T para la demo) y tiempo máximo en los
//      niveles avanzados (si se acaba, se pierde el nivel).
//   6. Le pasa a la galería animada las capturas del juego.
//
// Depende de blocka.html: #tablero-cabecera, #tablero-portada,
// #tablero-juego, #btn-jugar, #blocka-canvas, #blocka-estado, los datos del
// pantalla de inicio (#blocka-inicio, #blocka-lista-records,
// #blocka-records-estado, .blocka__vista, #btn-comenzar), la elección de
// dificultad (#blocka-dificultad, .blocka__opcion, #btn-dificultad-volver),
// el sorteo (#blocka-sorteo, #blocka-sorteo-titulo, #blocka-sorteo-estado,
// .blocka__slot y las 3 .blocka__tira), la partida (#blocka-partida), el HUD (#blocka-nivel, #blocka-tiempo,
// #blocka-record, #ficha-record) y los botones (#btn-ayudita, #btn-trampa,
// #btn-siguiente, #btn-reintentar, #btn-inicio). También de
// js/filtros.js (FILTROS) y js/galeria.js (iniciarGaleria()), que tienen que
// cargarse antes. No expone nada: los otros scripts no llaman a este.
//
// IMPORTANTE para probar: abrir la página desde un servidor local
// (http://localhost...), no con doble clic (file:///). Por seguridad, con
// file:/// el navegador no deja leer los píxeles del canvas, y los filtros
// de las próximas etapas dependen de eso.

// ---------- Banco de imágenes ----------

// Las 21 imágenes del banco (cuadradas, entre 360 y 1040 píxeles de lado). Las
// usan dos cosas: el juego (elige una al azar en cada nivel) y la galería. Cada
// una lleva su alt.
// "estricta: true" desactiva la regla de "rotaciones que se ven igual" (ver
// rotacionesEquivalentes()): en esa imagen cada pieza solo está bien puesta en
// 0°, aunque girada se vea parecida. Se usa en X-Men: sus piezas simétricas
// (el centro de la X) tienen que colocarse en su posición correcta.
const BANCO_IMAGENES = [
  { src: 'assets/img/antman.jpg', alt: 'Imagen de Ant-Man, una de las que se arman en Blocka.' },
  { src: 'assets/img/black-panther.jpg', alt: 'Imagen de Pantera Negra, una de las que se arman en Blocka.' },
  { src: 'assets/img/black-widow.jpg', alt: 'Imagen de Viuda Negra, una de las que se arman en Blocka.' },
  { src: 'assets/img/captain-marvel.jpg', alt: 'Imagen de Capitana Marvel, una de las que se arman en Blocka.' },
  { src: 'assets/img/daredevil.jpg', alt: 'Imagen de Daredevil, una de las que se arman en Blocka.' },
  { src: 'assets/img/deadpool.png', alt: 'Imagen de Deadpool, una de las que se arman en Blocka.' },
  { src: 'assets/img/dr-strange.jpg', alt: 'Imagen de Doctor Strange, una de las que se arman en Blocka.' },
  { src: 'assets/img/escudo-capitan-america.jpg', alt: 'Imagen del escudo del Capitán América, una de las que se arman en Blocka.' },
  { src: 'assets/img/fantastic-4.jpg', alt: 'Imagen de los Cuatro Fantásticos, una de las que se arman en Blocka.' },
  { src: 'assets/img/hydra.jpg', alt: 'Imagen de Hydra, una de las que se arman en Blocka.' },
  { src: 'assets/img/infinity-gauntlet.jpg', alt: 'Imagen del Guantelete del Infinito, una de las que se arman en Blocka.' },
  { src: 'assets/img/iron-fist.jpg', alt: 'Imagen de Puño de Hierro, una de las que se arman en Blocka.' },
  { src: 'assets/img/iron-man.jpg', alt: 'Imagen de Iron Man, una de las que se arman en Blocka.' },
  { src: 'assets/img/loki.jpg', alt: 'Imagen de Loki, una de las que se arman en Blocka.' },
  { src: 'assets/img/miss-minutes.jpg', alt: 'Imagen de Miss Minutes, una de las que se arman en Blocka.' },
  { src: 'assets/img/ojo-de-halcon.jpg', alt: 'Imagen de Ojo de Halcón, una de las que se arman en Blocka.' },
  { src: 'assets/img/spider-man.jpg', alt: 'Imagen de Spider-Man, una de las que se arman en Blocka.' },
  { src: 'assets/img/the-punisher.jpg', alt: 'Imagen de The Punisher, una de las que se arman en Blocka.' },
  { src: 'assets/img/thor.jpg', alt: 'Imagen de Thor, una de las que se arman en Blocka.' },
  { src: 'assets/img/wolverine.jpg', alt: 'Imagen de Wolverine, una de las que se arman en Blocka.' },
  { src: 'assets/img/x-men.jpg', alt: 'Imagen de los X-Men, una de las que se arman en Blocka.', estricta: true },
];

// ---------- Niveles ----------

// Configuración de cada nivel: qué filtro lleva cada pieza y, opcionalmente,
// el tiempo máximo en segundos (tiempoMax). Si la lista de filtros tiene un
// solo filtro, se aplica a todas las piezas; si tiene 4, cada pieza lleva el
// suyo (en el orden de lectura: de izquierda a derecha y de arriba hacia
// abajo; con 9 o 16 piezas el patrón se repite). Los nombres son las claves de
// FILTROS (js/filtros.js). Los niveles van de menos a más difíciles: el
// primero (escala de grises) no tiene límite de tiempo; el segundo (negativo)
// y el tercero (filtros mezclados) sí. Si se acaba el tiempo, se pierde el
// nivel. tiempoMax está pensado para 4 piezas y crece con la dificultad (ver
// limiteSegundos()).
// En el nivel 3, la lista de 4 filtros hace que aparezcan los tres en
// cualquier dificultad: con 4 piezas, una por filtro (y el negativo dos
// veces); con 9, la pieza i usa el filtro i % 4; con 16 (4 por fila), cada
// columna repite el mismo filtro.
// "nombre" es el texto que se muestra en la pantalla de inicio.
const NIVELES = [
  { nombre: 'Escala de grises', filtros: ['grises'] },
  { nombre: 'Negativo', filtros: ['negativo'], tiempoMax: 60 },
  { nombre: 'Filtros mixtos', filtros: ['negativo', 'brillo', 'grises', 'negativo'], tiempoMax: 60 },
];

// ---------- Dificultad: cantidad de piezas ----------

// Cada dificultad es una grilla cuadrada de piezas cuadradas: 2x2 = 4 piezas,
// 3x3 = 9 y 4x4 = 16. El tablero siempre es el mismo cuadrado; con más piezas,
// cada una es más chica. Las piezas tienen que ser cuadradas para girar de a
// 90° y seguir encajando en su casillero, y un cuadrado solo se divide en
// cuadrados iguales cuando la cantidad es un cuadrado perfecto: por eso son
// 4, 9 y 16 y no 4, 6 y 8 (ver DECISIONES-TP3.md). "lado" es cuántas piezas
// entran por fila y por columna.
const DIFICULTADES = {
  4: { lado: 2, nombre: 'Fácil' },
  9: { lado: 3, nombre: 'Medio' },
  16: { lado: 4, nombre: 'Difícil' },
};

// Los tiempos máximos de NIVELES están pensados para 4 piezas. Con más piezas
// hay más clics que dar, así que el límite crece en proporción.
const PIEZAS_BASE = 4;

// Dificultad que se está jugando, y la que se está viendo en la tabla de
// récords del inicio (la tabla se puede mirar de las tres).
let cantidadPiezas = 4;
let vistaRecords = 4;

// Tiempo máximo en segundos del nivel "indice" con "cantidad" piezas
// (undefined si el nivel no tiene límite): 60 s a 4 piezas, 135 s a 9 y 240 s a 16.
function limiteSegundos(indice, cantidad) {
  const base = NIVELES[indice].tiempoMax;
  return base === undefined ? undefined : Math.round(base * cantidad / PIEZAS_BASE);
}

// Lo que suma "Ayudita" al contador cada vez que se usa (enunciado: 5 s).
// También es el margen mínimo para usarla: si quedan menos de 5 s, el botón se
// deshabilita (usarla haría perder al instante).
const PENALIZACION_AYUDITA_MS = 5000;

// Índice del nivel que se está jugando (0 = primero). "Siguiente nivel" lo
// hace avanzar, y "Volver a jugar" (al terminar el último) lo reinicia.
let indiceNivel = 0;

// ---------- Tiempo y récord ----------

// Pasa milisegundos a "mm:ss.d" (minutos, segundos y décimas): 42350 -> 00:42.3
function formatearTiempo(ms) {
  const segundosTotales = Math.floor(ms / 1000);
  const minutos = String(Math.floor(segundosTotales / 60)).padStart(2, '0');
  const segundos = String(segundosTotales % 60).padStart(2, '0');
  const decimas = Math.floor(ms / 100) % 10;
  return `${minutos}:${segundos}.${decimas}`;
}

// Texto del tiempo en el HUD: "00:42.3", o "00:42.3 / 02:00" si el nivel
// tiene tiempo máximo (limiteSeg, en segundos; undefined si no tiene).
function textoTiempo(ms, limiteSeg) {
  if (limiteSeg === undefined) return formatearTiempo(ms);
  return `${formatearTiempo(ms)} / ${formatearTiempo(limiteSeg * 1000).slice(0, 5)}`;
}

// El récord se guarda por dificultad Y por nivel, porque un tiempo con 4
// piezas no se puede comparar con uno de 8. En localStorage va un objeto
// { "4-0": milisegundos, "6-2": milisegundos, ... }: la clave es
// "<piezas>-<índice del nivel>". Si el navegador no deja usar el storage
// (bloqueado, lleno), se ignora y el juego sigue sin récords.
const CLAVE_RECORDS = 'warden-blocka-records';

function claveRecord(cantidad, indice) {
  return `${cantidad}-${indice}`;
}

function leerRecords() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_RECORDS)) || {};
  } catch (error) {
    return {};
  }
}

// Récord guardado de un nivel y una dificultad (undefined si no hay).
function leerRecord(cantidad, indice) {
  return leerRecords()[claveRecord(cantidad, indice)];
}

function guardarRecord(cantidad, indice, ms) {
  const records = leerRecords();
  records[claveRecord(cantidad, indice)] = ms;
  try {
    localStorage.setItem(CLAVE_RECORDS, JSON.stringify(records));
  } catch (error) {
    // Sin storage no hay récord guardado: no se avisa, no rompe nada.
  }
}

// Borra el récord de un nivel y una dificultad. Mismo criterio que
// guardarRecord: si el storage falla, el récord queda y no se avisa.
function eliminarRecord(cantidad, indice) {
  const records = leerRecords();
  delete records[claveRecord(cantidad, indice)];
  try {
    localStorage.setItem(CLAVE_RECORDS, JSON.stringify(records));
  } catch (error) {
    // Sin storage no se puede borrar: no rompe nada.
  }
}

// Reloj: guarda el instante en que arrancó (performance.now(), en
// milisegundos) y cada 100 ms muestra cuánto pasó desde entonces. Se calcula
// contra el instante inicial y no sumando de a 100: así no se atrasa si el
// navegador demora un tick.
let inicioMs = 0;
let intervaloReloj = null;

// Aviso de que se acaba el tiempo: en los niveles con tiempo máximo, cuando
// quedan 10 segundos o menos el tiempo del HUD se pinta de rojo y se avisa una
// sola vez con el texto de estado. avisoDado recuerda si ya se avisó en este
// nivel, para no repetir el mensaje en cada tick.
const AVISO_TIEMPO_MS = 10000;
let avisoDado = false;

// ---------- Portada ----------

const cabecera = document.getElementById('tablero-cabecera');
const portada = document.getElementById('tablero-portada');
const zonaJuego = document.getElementById('tablero-juego');
const btnJugar = document.getElementById('btn-jugar');

btnJugar.addEventListener('click', () => {
  portada.hidden = true;
  cabecera.hidden = false;
  zonaJuego.hidden = false;

  // "Jugar" tenía el foco y desaparece con la portada. Sin esto el foco cae
  // al <body> y quien navega con teclado o lector de pantalla se pierde.
  // La cabecera es lo primero visible de la card, y puede recibir el foco
  // por código (tiene tabindex="-1" en el HTML).
  cabecera.focus();

  mostrarInicio();
});

// ---------- Motor del nivel ----------

// El canvas es siempre un cuadrado de 480x480 píxeles reales (el HTML le pone
// width/height). Se corta en una grilla de 2x2, 3x3 o 4x4 piezas según la
// dificultad. 480 se divide justo por 2, 3 y 4, así que cada pieza mide un
// número entero de píxeles: 240, 160 o 120.
const canvas = document.getElementById('blocka-canvas');
const ctx = canvas.getContext('2d');
const estado = document.getElementById('blocka-estado');
const datoNivel = document.getElementById('blocka-nivel');
const datoTiempo = document.getElementById('blocka-tiempo');
const datoRecord = document.getElementById('blocka-record');
const fichaRecord = document.getElementById('ficha-record');
const inicio = document.getElementById('blocka-inicio');
const partida = document.getElementById('blocka-partida');
const sorteo = document.getElementById('blocka-sorteo');
const sorteoTitulo = document.getElementById('blocka-sorteo-titulo');
const sorteoEstado = document.getElementById('blocka-sorteo-estado');
const slot = document.querySelector('.blocka__slot');
const tirasRodillos = document.querySelectorAll('.blocka__tira');
const listaRecords = document.getElementById('blocka-lista-records');
const recordsEstado = document.getElementById('blocka-records-estado');
const dificultad = document.getElementById('blocka-dificultad');
const opcionesDificultad = document.querySelectorAll('.blocka__opcion');
const btnDificultadVolver = document.getElementById('btn-dificultad-volver');
const botonesVista = document.querySelectorAll('.blocka__vista');
const btnComenzar = document.getElementById('btn-comenzar');
const btnAyudita = document.getElementById('btn-ayudita');
const btnTrampa = document.getElementById('btn-trampa');
const btnSiguiente = document.getElementById('btn-siguiente');
const btnReintentar = document.getElementById('btn-reintentar');
const btnInicio = document.getElementById('btn-inicio');

const LADO_TABLERO = 480;

// Estado del nivel actual.
let imagen = null;
let imagenEstricta = false;
let piezas = [];
let nivelActivo = false;
let ultimaImagen = -1;

// Pieza elegida con el teclado: es un índice de "piezas", que está ordenada
// fila por fila (de izquierda a derecha y de arriba hacia abajo). Las flechas
// la mueven y Q / E / Enter / Espacio la giran (ver el keydown del canvas).
let piezaFoco = 0;

// Cuántas piezas entran por fila y por columna con la dificultad actual (2, 3 o 4).
function piezasPorLado() {
  return DIFICULTADES[cantidadPiezas].lado;
}

// Lado en píxeles de cada pieza dentro del canvas (240, 160 o 120).
function ladoPieza() {
  return LADO_TABLERO / piezasPorLado();
}

// Arma el recorte de una pieza: un canvas chico (fuera de la página, no se
// ve) de ladoPieza() x ladoPieza() con ese pedazo de la imagen, sin girar.
function recortarPieza(columna, fila) {
  const lado = piezasPorLado();

  // La imagen se corta en una grilla cuadrada. Las del banco son cuadradas, así
  // que se usa entera; si alguna no lo fuera, se usa el cuadrado del centro
  // (el lado más corto) para que las piezas sigan siendo cuadradas.
  const ladoImagen = Math.min(imagen.naturalWidth, imagen.naturalHeight);
  const ladoRecorte = ladoImagen / lado;
  const origenX = (imagen.naturalWidth - ladoImagen) / 2;
  const origenY = (imagen.naturalHeight - ladoImagen) / 2;

  const tamano = ladoPieza();
  const lienzo = document.createElement('canvas');
  lienzo.width = tamano;
  lienzo.height = tamano;
  const lienzoCtx = lienzo.getContext('2d');
  // Si la imagen tiene partes transparentes (un PNG con el fondo recortado), se
  // pintan sobre blanco. Sin esto se verían como "huecos" que dejan pasar el
  // fondo oscuro de la card, y los filtros (que escriben cada píxel como
  // opaco) las volverían negras. Blanco es el fondo de los otros logos del
  // banco (X-Men, Capitán América).
  lienzoCtx.fillStyle = 'white';
  lienzoCtx.fillRect(0, 0, tamano, tamano);
  // drawImage con 9 valores: imagen, recorte (x, y, ancho, alto) y destino
  // (x, y, ancho, alto).
  lienzoCtx.drawImage(
    imagen,
    origenX + columna * ladoRecorte, origenY + fila * ladoRecorte, ladoRecorte, ladoRecorte,
    0, 0, tamano, tamano
  );
  return lienzo;
}

// Aplica un filtro a un recorte: lee sus píxeles (getImageData), los pasa por
// el filtro y devuelve un canvas nuevo con el resultado (putImageData).
// El recorte original no se toca: lo necesitamos para mostrar la imagen sin
// filtros cuando el jugador termina.
function aplicarFiltro(lienzo, nombreFiltro) {
  const pixeles = lienzo.getContext('2d').getImageData(0, 0, lienzo.width, lienzo.height);
  const filtrados = FILTROS[nombreFiltro](pixeles);

  const resultado = document.createElement('canvas');
  resultado.width = lienzo.width;
  resultado.height = lienzo.height;
  resultado.getContext('2d').putImageData(filtrados, 0, 0);
  return resultado;
}

// ---------- Partes que se ven iguales al girarlas ----------

// Una pieza casi uniforme (el negro de una esquina de Avengers, el blanco de
// una esquina del escudo) se ve igual girada 0°, 90°, 180° o 270°: el jugador
// no tiene forma de saber cuál es la posición "correcta", y el juego no se
// podría ganar sin adivinar. Por eso, para cada pieza se calcula en qué
// rotaciones se ve igual que sin girar, y todas esas cuentan como bien puestas.
// Dos rotaciones "se ven igual" si en promedio sus colores difieren menos que
// esto (de 255): por debajo no se distingue a simple vista.
const UMBRAL_PARECIDO = 8;

// Diferencia media entre dos listas de píxeles RGBA, por canal (0 a 255). El
// alfa no se compara: los recortes ya vienen opacos (fondo blanco).
function diferenciaMedia(a, b) {
  let total = 0;
  let canales = 0;
  for (let i = 0; i < a.length; i += 4) {
    total += Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]);
    canales += 3;
  }
  return total / canales;
}

// Devuelve una lista de 4 booleanos: el elemento i dice si la pieza girada i
// cuartos de vuelta se ve igual que sin girar. El 0 siempre es true.
function rotacionesEquivalentes(original) {
  const tamano = original.width;
  const base = original.getContext('2d').getImageData(0, 0, tamano, tamano).data;

  // Canvas auxiliar donde se dibuja la pieza girada para comparar sus píxeles.
  const prueba = document.createElement('canvas');
  prueba.width = tamano;
  prueba.height = tamano;
  const pruebaCtx = prueba.getContext('2d');

  const equivalentes = [true];
  for (let giros = 1; giros < 4; giros++) {
    pruebaCtx.clearRect(0, 0, tamano, tamano);
    pruebaCtx.save();
    pruebaCtx.translate(tamano / 2, tamano / 2);
    pruebaCtx.rotate(giros * Math.PI / 2);
    pruebaCtx.drawImage(original, -tamano / 2, -tamano / 2);
    pruebaCtx.restore();
    const girada = pruebaCtx.getImageData(0, 0, tamano, tamano).data;
    equivalentes.push(diferenciaMedia(base, girada) < UMBRAL_PARECIDO);
  }
  return equivalentes;
}

// true si la pieza está bien puesta: su giro es 0 o una rotación que se ve
// igual que 0.
function estaBienPuesta(pieza) {
  return pieza.equivalentes[pieza.giros];
}

// true si la pieza se ve igual en las 4 rotaciones (un recuadro liso, como una
// esquina de fondo negro). Esas piezas quedan fijas desde el principio: están
// siempre bien puestas, no se pueden girar y no llevan marca, así el jugador
// no pierde clics en algo que no cambia nada.
function esLisa(pieza) {
  return pieza.equivalentes.every(Boolean);
}

// Cada pieza guarda de dónde sale en la imagen (columna y fila), cuántos
// cuartos de vuelta tiene girados en sentido horario (0, 1, 2 o 3), su
// recorte "original" y el "lienzo" que se dibuja: al empezar es el recorte
// con el filtro puesto, y al ganar pasa a ser el original.
// Está bien puesta cuando su giro es 0 o equivalente (ver "equivalentes").
// "fija" es true si Ayudita la puso en su lugar y la bloqueó.
function crearPiezas(nivel) {
  const lado = piezasPorLado();
  const lista = [];
  for (let fila = 0; fila < lado; fila++) {
    for (let columna = 0; columna < lado; columna++) {
      const original = recortarPieza(columna, fila);
      // Un solo filtro en la lista vale para todas; con varios, cada pieza
      // lleva el suyo y el patrón se repite si hay más piezas que filtros
      // (lista.length es el número de piezas creadas hasta ahora).
      const nombreFiltro = nivel.filtros[lista.length % nivel.filtros.length];
      lista.push({
        columna,
        fila,
        giros: 0,
        fija: false,
        // En una imagen estricta solo vale el giro 0; en el resto, también las
        // rotaciones que se ven igual.
        equivalentes: imagenEstricta ? [true, false, false, false] : rotacionesEquivalentes(original),
        original,
        lienzo: aplicarFiltro(original, nombreFiltro),
      });
    }
  }
  return lista;
}

// true si todas las piezas están bien puestas (la imagen está armada).
function estaArmada() {
  return piezas.every(estaBienPuesta);
}

// Le da a cada pieza un giro al azar de 0 a 3. Si por casualidad quedaron
// todas bien puestas, vuelve a mezclar: un nivel que arranca resuelto se
// ganaría sin hacer nada. Una pieza lisa (ver esLisa()) queda en 0: girarla no
// cambia nada. El tope de intentos
// evita un bucle infinito si por algún motivo todas las piezas fueran así.
function mezclar() {
  let intentos = 0;
  do {
    piezas.forEach((pieza) => {
      pieza.giros = esLisa(pieza) ? 0 : Math.floor(Math.random() * 4);
    });
    intentos++;
  } while (estaArmada() && intentos < 50);
}

// Dibuja una pieza en su casillero, girada según sus giros. "lienzo" es lo que
// se pinta: el recorte con filtro o el original (el fundido del final usa los
// dos).
function dibujarPieza(pieza, lienzo) {
  const tamano = ladoPieza();
  // Centro del casillero donde va esta pieza en el canvas.
  const centroX = pieza.columna * tamano + tamano / 2;
  const centroY = pieza.fila * tamano + tamano / 2;

  ctx.save();
  // translate mueve el origen (0,0) al centro del casillero, y rotate gira
  // alrededor de ese origen: así la pieza gira sobre su propio centro.
  ctx.translate(centroX, centroY);
  ctx.rotate(pieza.giros * Math.PI / 2);
  // El destino va desde -mitad hasta +mitad porque el origen ya está en el
  // centro de la pieza.
  ctx.drawImage(lienzo, -tamano / 2, -tamano / 2);
  ctx.restore();
}

// Dibuja todas las piezas, cada una con su lienzo actual.
function dibujar() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const tamano = ladoPieza();

  piezas.forEach((pieza) => {
    dibujarPieza(pieza, pieza.lienzo);

    // Las partes que dejó fijas Ayudita llevan un borde del color de acento,
    // para distinguirlas. Se dibuja después de restore(), sin giro.
    if (pieza.fija) {
      ctx.lineWidth = 6;
      ctx.strokeStyle = colorMarca();
      ctx.strokeRect(
        pieza.columna * tamano + 3, pieza.fila * tamano + 3,
        tamano - 6, tamano - 6
      );
    }
  });

  // La pieza elegida con el teclado lleva un anillo punteado del color de foco
  // (el mismo amarillo del :focus-visible del sitio). Solo se dibuja si el
  // canvas tiene el foco y hay un nivel en juego: con el mouse en otro lado no
  // hace falta. Es punteado y va más adentro que el borde de Ayudita (que es
  // liso), para que no se confundan.
  const piezaElegida = piezas[piezaFoco];
  if (nivelActivo && piezaElegida && document.activeElement === canvas) {
    ctx.lineWidth = 4;
    ctx.strokeStyle = colorFoco();
    // setLineDash([trazo, espacio]) hace la línea punteada. Se vuelve a una
    // línea lisa ([]) después, porque el contexto recuerda el patrón y el
    // borde de Ayudita del próximo dibujo saldría punteado.
    ctx.setLineDash([10, 6]);
    ctx.strokeRect(
      piezaElegida.columna * tamano + 8, piezaElegida.fila * tamano + 8,
      tamano - 16, tamano - 16
    );
    ctx.setLineDash([]);
  }
}

// Color del borde de las partes fijas: el token --acento del sitio, leído de
// variables.css (en JS no se puede usar var() directo, pero sí leer su valor).
function colorMarca() {
  return getComputedStyle(document.documentElement).getPropertyValue('--acento').trim();
}

// Color del anillo de la pieza elegida con el teclado: el token --foco, leído
// igual que --acento.
function colorFoco() {
  return getComputedStyle(document.documentElement).getPropertyValue('--foco').trim();
}

// ---------- Fundido al ganar ----------

// Id del requestAnimationFrame del fundido en curso (null si no hay ninguno).
// Se guarda para poder cancelarlo si arranca otro nivel a mitad del fundido.
let cuadroFundido = null;

// Duración del fundido: el token --duracion-estado de variables.css
// ("500ms"). parseFloat lee el número y deja de leer en "ms". Si no se
// pudiera leer, se usan 500 ms.
function duracionFundidoMs() {
  const valor = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--duracion-estado'));
  return Number.isNaN(valor) ? 500 : valor;
}

function cancelarFundido() {
  cancelAnimationFrame(cuadroFundido);
  cuadroFundido = null;
}

// Quita los filtros: las piezas pasan de su lienzo con filtro al recorte
// original. En cada cuadro se dibujan las piezas con filtro y, encima, las
// originales con una opacidad (globalAlpha) que va de 0 a 1: la imagen real
// "aparece" sobre la filtrada. Con movimiento reducido el cambio es directo.
function quitarFiltros() {
  cancelarFundido();
  if (sinMovimiento) {
    piezas.forEach((p) => { p.lienzo = p.original; });
    dibujar();
    return;
  }

  const duracion = duracionFundidoMs();
  const inicioFundido = performance.now();

  function pasoFundido() {
    // avance va de 0 a 1 según el tiempo que pasó.
    const avance = Math.min(1, (performance.now() - inicioFundido) / duracion);
    // Curva "ease-out": cambia rápido al principio y frena al final.
    const opacidad = 1 - (1 - avance) * (1 - avance);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    piezas.forEach((p) => dibujarPieza(p, p.lienzo));
    ctx.globalAlpha = opacidad;
    piezas.forEach((p) => dibujarPieza(p, p.original));
    ctx.globalAlpha = 1;

    if (avance < 1) {
      cuadroFundido = requestAnimationFrame(pasoFundido);
    } else {
      // Terminó: las piezas quedan con su original, como si nunca hubieran
      // tenido filtro.
      piezas.forEach((p) => { p.lienzo = p.original; });
      cuadroFundido = null;
    }
  }

  cuadroFundido = requestAnimationFrame(pasoFundido);
}

function iniciarReloj() {
  detenerReloj();
  inicioMs = performance.now();
  // Cada nivel arranca sin aviso de tiempo.
  avisoDado = false;
  datoTiempo.parentElement.classList.remove('blocka__dato--alerta');
  intervaloReloj = setInterval(actualizarReloj, 100);
}

function detenerReloj() {
  clearInterval(intervaloReloj);
  intervaloReloj = null;
}

// Tiempo máximo del nivel actual en segundos (undefined si no tiene), según
// la dificultad elegida.
function limiteDelNivel() {
  return limiteSegundos(indiceNivel, cantidadPiezas);
}

// true si el nivel tiene tiempo máximo y ya se alcanzó. Se revisa en cada
// tick del reloj y también en el momento de un clic, antes de dar por ganado
// el nivel: así no cuenta una victoria que llega después del límite (el tick
// corre cada 100 ms y el clic puede caer entre dos ticks).
function tiempoAgotado() {
  const limite = limiteDelNivel();
  return limite !== undefined && performance.now() - inicioMs >= limite * 1000;
}

// Muestra el tiempo transcurrido y, si el nivel tiene tiempo máximo, pierde
// el nivel cuando se alcanza. Corre cada 100 ms y también después de que
// "Ayudita" suma sus 5 segundos.
function actualizarReloj() {
  datoTiempo.textContent = textoTiempo(performance.now() - inicioMs, limiteDelNivel());
  if (tiempoAgotado()) {
    perderNivel();
    return;
  }
  avisarTiempo();
  actualizarAyudita();
}

// Si el nivel tiene tiempo máximo y quedan 10 s o menos, marca el tiempo del
// HUD (la clase pinta el número de rojo, ver blocka.css) y avisa una vez en el
// texto de estado, que es role="status": el lector de pantalla también lo
// anuncia. La clase va en el <p> del dato; datoTiempo es el <strong> de adentro.
function avisarTiempo() {
  const limite = limiteDelNivel();
  if (limite === undefined) return;
  const restanteMs = limite * 1000 - (performance.now() - inicioMs);
  if (restanteMs > AVISO_TIEMPO_MS) return;
  datoTiempo.parentElement.classList.add('blocka__dato--alerta');
  if (!avisoDado) {
    avisoDado = true;
    estado.textContent = '¡Quedan 10 segundos!';
  }
}

// Habilita o deshabilita "Ayudita". Se deshabilita si no quedan partes mal
// puestas (no hay nada que ayudar) o si el nivel tiene tiempo máximo y quedan
// menos de 5 s (los 5 s que suma harían perder al instante). Corre en cada
// tick del reloj y después de cada giro o Ayudita.
function actualizarAyudita() {
  const quedanMalPuestas = piezas.some((p) => !p.fija && !estaBienPuesta(p));
  const limite = limiteDelNivel();
  const restanteMs = limite === undefined ? Infinity : limite * 1000 - (performance.now() - inicioMs);
  btnAyudita.disabled = !nivelActivo || !quedanMalPuestas || restanteMs < PENALIZACION_AYUDITA_MS;

  // Un botón deshabilitado pierde el foco: se pasa al canvas para que quien
  // usa teclado no quede en el <body>.
  if (btnAyudita.disabled && document.activeElement === btnAyudita) canvas.focus();
}

// Muestra el récord del nivel actual en el HUD y en la ficha del juego. Por
// defecto es el de la dificultad que se juega; en el inicio, el de la que se
// está viendo en la tabla.
function mostrarRecord(cantidad = cantidadPiezas) {
  const record = leerRecord(cantidad, indiceNivel);
  datoRecord.textContent = record === undefined ? '—' : formatearTiempo(record);
  fichaRecord.textContent = record === undefined ? 'Sin récord' : formatearTiempo(record);
}

// Esconde todos los botones de debajo del canvas. Cada momento de la partida
// (jugando, ganó, perdió) muestra solo los que le corresponden.
function ocultarAcciones() {
  [btnAyudita, btnTrampa, btnSiguiente, btnReintentar, btnInicio]
    .forEach((boton) => { boton.hidden = true; });
}

// Prepara el nivel actual: sortea una imagen (distinta a la del nivel
// anterior), muestra la tragamonedas y, cuando termina, arranca el nivel.
// Quien llega acá ya eligió empezar, con "Comenzar", "Siguiente nivel" o
// "Reintentar nivel".
function iniciarNivel() {
  detenerReloj();
  // Si el nivel anterior todavía estaba en su fundido final, se corta: si no,
  // seguiría dibujando sobre el canvas del nivel nuevo.
  cancelarFundido();
  nivelActivo = false;
  ocultarAcciones();
  datoNivel.textContent = `${indiceNivel + 1} de ${NIVELES.length} · ${cantidadPiezas} piezas`;
  datoTiempo.textContent = textoTiempo(0, limiteDelNivel());
  // Si el nivel anterior terminó con el aviso de tiempo, se saca ya: si no,
  // el 00:00 del nivel nuevo se vería en rojo hasta que arranque el reloj.
  datoTiempo.parentElement.classList.remove('blocka__dato--alerta');
  mostrarRecord();

  // Se repite el sorteo hasta que toque una imagen distinta a la última.
  let indiceImagen;
  do {
    indiceImagen = Math.floor(Math.random() * BANCO_IMAGENES.length);
  } while (BANCO_IMAGENES.length > 1 && indiceImagen === ultimaImagen);
  ultimaImagen = indiceImagen;

  // Se muestra la tragamonedas en lugar del inicio o de la partida anterior.
  inicio.hidden = true;
  dificultad.hidden = true;
  partida.hidden = true;
  sorteo.hidden = false;
  sorteoTitulo.textContent = `Nivel ${indiceNivel + 1} de ${NIVELES.length} · ${NIVELES[indiceNivel].nombre} · ${cantidadPiezas} piezas`;
  // El botón que se apretó desaparece: el foco pasa al bloque del sorteo
  // (tiene tabindex="-1" en el HTML), para no caer al <body>.
  sorteo.focus();

  sortear(indiceImagen).then(() => {
    sorteo.hidden = true;
    partida.hidden = false;
    canvas.focus();
    arrancarNivel(indiceImagen);
  });
}

// Carga la imagen sorteada, le aplica los filtros, mezcla las piezas, las
// dibuja y arranca el reloj. El reloj corre recién cuando la imagen está
// lista, así el tiempo de descarga no le cuenta al jugador.
function arrancarNivel(indiceImagen) {
  estado.textContent = 'Cargando imagen…';
  const cargando = new Image();

  // La descarga no es instantánea: todo lo que depende de la imagen va en
  // onload, que el navegador ejecuta cuando termina de bajarla.
  cargando.onload = () => {
    imagen = cargando;
    imagenEstricta = BANCO_IMAGENES[indiceImagen].estricta === true;
    // getImageData falla si el canvas está "contaminado": pasa al abrir el
    // archivo con doble clic (file:///). Se avisa en vez de dejar el juego
    // roto sin explicación.
    try {
      piezas = crearPiezas(NIVELES[indiceNivel]);
    } catch (error) {
      mostrarErrorDeCarga('Los filtros necesitan un servidor: abrí la página desde http://localhost, no con doble clic.');
      return;
    }
    // El teclado arranca en la primera pieza (arriba a la izquierda).
    piezaFoco = 0;
    mezclar();
    // nivelActivo va antes de dibujar(): así, si el canvas ya tiene el foco,
    // el primer dibujo ya muestra el anillo de la pieza elegida.
    nivelActivo = true;
    dibujar();
    btnAyudita.hidden = false;
    // "Trampa" no se muestra: queda oculta para la demo (ver el atajo
    // Alt + T, más abajo).
    estado.textContent = 'Girá cada parte hasta armar la imagen.';
    iniciarReloj();
    // Ayudita arranca habilitada en cada nivel nuevo (si hay partes mal puestas).
    actualizarAyudita();
  };
  cargando.onerror = () => {
    mostrarErrorDeCarga('No se pudo cargar la imagen. Probá reintentar el nivel.');
  };
  cargando.src = BANCO_IMAGENES[indiceImagen].src;
}

// Si la imagen no carga (o no se pueden leer sus píxeles), el nivel no puede
// arrancar. Se muestra el aviso junto con "Reintentar nivel" (sortea otra
// imagen) y "Volver al inicio", para no dejar la partida sin ningún botón.
function mostrarErrorDeCarga(mensaje) {
  estado.textContent = mensaje;
  btnReintentar.hidden = false;
  btnInicio.hidden = false;
  btnReintentar.focus();
}

// ---------- Sorteo (tragamonedas) ----------

// El sorteo dura 2 segundos en total: los rodillos frenan uno tras otro
// (izquierda, centro, derecha) y los últimos 400 ms se queda quieto para ver
// que las tres imágenes son iguales antes de arrancar el nivel.
const DURACION_SORTEO_MS = 2000;
const PARADAS_RODILLOS_MS = [1000, 1300, 1600];

// Cuántas imágenes tiene la tira de cada rodillo. Los de la derecha tienen
// más, así recorren más camino en el mismo tiempo y giran más rápido.
const CASILLAS_POR_TIRA = [14, 18, 22];

// En la ventana de cada rodillo se ven 3 imágenes: la de arriba, la del
// medio (la línea de pago, la que cuenta) y la de abajo.
const CASILLAS_VISIBLES = 3;

// Con "reducir movimiento" activado en el sistema no hay giro: se muestra
// directo el resultado.
const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Una imagen al azar del banco, distinta a las que se pasan en "excluir".
function imagenAlAzar(excluir) {
  let indice;
  do {
    indice = Math.floor(Math.random() * BANCO_IMAGENES.length);
  } while (excluir.includes(indice));
  return indice;
}

// Arma la tira de un rodillo: una columna de imágenes. Arriba de todo (en las
// 3 casillas que quedan a la vista al frenar) va: una imagen cualquiera, la
// ganadora en el medio, y otra imagen cualquiera. El resto es relleno al azar
// que se ve pasar mientras gira.
function llenarTira(tira, indiceGanadora, cantidad) {
  const indices = [imagenAlAzar([indiceGanadora]), indiceGanadora, imagenAlAzar([indiceGanadora])];
  while (indices.length < cantidad) {
    // El relleno no repite la imagen de la casilla anterior.
    indices.push(imagenAlAzar([indices[indices.length - 1]]));
  }

  tira.replaceChildren(...indices.map((indice) => {
    const casilla = document.createElement('div');
    casilla.className = 'blocka__casilla';
    const foto = document.createElement('img');
    foto.src = BANCO_IMAGENES[indice].src;
    foto.alt = '';
    casilla.append(foto);
    return casilla;
  }));
}

// Carga las 6 imágenes antes de girar, para que no aparezcan de golpe a mitad
// de la animación. Si alguna falla, igual se sigue (la promesa se cumple igual).
function precargarBanco() {
  return Promise.all(BANCO_IMAGENES.map((foto) => new Promise((resolver) => {
    const precarga = new Image();
    precarga.onload = resolver;
    precarga.onerror = resolver;
    precarga.src = foto.src;
  })));
}

// Hace girar los 3 rodillos y devuelve una promesa que se cumple cuando
// termina el sorteo (2 segundos después de empezar a girar).
function sortear(indiceGanadora) {
  slot.classList.remove('blocka__slot--premio');
  sorteoEstado.textContent = 'Sorteando la imagen…';

  return precargarBanco().then(() => new Promise((terminar) => {
    tirasRodillos.forEach((tira, i) => {
      const cantidad = CASILLAS_POR_TIRA[i];
      llenarTira(tira, indiceGanadora, cantidad);

      // Punto de partida: la tira corrida hacia arriba, mostrando sus últimas
      // 3 casillas. translateY en % se mide contra la altura de la propia
      // tira, así no depende del tamaño en píxeles de cada casilla. Va sin
      // transición para que el salto inicial no se vea.
      const corrida = (cantidad - CASILLAS_VISIBLES) / cantidad * 100;
      tira.style.transition = 'none';
      tira.style.transform = `translateY(-${corrida}%)`;
      // Leer una medida obliga al navegador a aplicar el estilo ya, antes del
      // cambio de abajo; si no, la transición no arranca desde la posición inicial.
      tira.offsetHeight;

      // Destino: la tira en su lugar (translateY(0)), con la ganadora en el
      // medio. Al correrla hacia abajo las imágenes "caen" como en una
      // tragamonedas. La transición (con frenado) está en blocka.css; acá solo
      // se elige cuánto dura en cada rodillo. Con movimiento reducido no hay
      // transición: salta directo al resultado.
      tira.style.transition = sinMovimiento ? 'none' : '';
      tira.style.transitionDuration = `${PARADAS_RODILLOS_MS[i]}ms`;
      tira.style.transform = 'translateY(0)';
    });

    // Cuando frena el último rodillo se marca la línea de pago.
    setTimeout(() => {
      slot.classList.add('blocka__slot--premio');
      sorteoEstado.textContent = '¡Tres iguales! Esta es la imagen del nivel.';
    }, sinMovimiento ? 0 : PARADAS_RODILLOS_MS[PARADAS_RODILLOS_MS.length - 1]);

    // Y 400 ms después termina el sorteo y arranca el nivel.
    setTimeout(terminar, sinMovimiento ? 600 : DURACION_SORTEO_MS);
  }));
}

// Pantalla de inicio: se ve después de la portada y al volver de un nivel.
// Muestra la tabla de récords (de la dificultad que se esté viendo). Todavía
// no hay partida: se elige la dificultad con "Comenzar".
function mostrarInicio() {
  detenerReloj();
  cancelarFundido();
  nivelActivo = false;
  indiceNivel = 0;
  partida.hidden = true;
  sorteo.hidden = true;
  dificultad.hidden = true;
  inicio.hidden = false;
  recordsEstado.textContent = '';
  marcarVista();
  mostrarRecordsInicio();
  mostrarRecord(vistaRecords);
}

// Marca cuál de los tres botones de la tabla (4, 9 o 16 piezas) está activo.
function marcarVista() {
  botonesVista.forEach((boton) => {
    boton.setAttribute('aria-pressed', String(Number(boton.dataset.piezas) === vistaRecords));
  });
}

botonesVista.forEach((boton) => {
  boton.addEventListener('click', () => {
    vistaRecords = Number(boton.dataset.piezas);
    recordsEstado.textContent = '';
    marcarVista();
    mostrarRecordsInicio();
    mostrarRecord(vistaRecords);
  });
});

// Arma la lista de récords de la dificultad que se está viendo: una fila por
// nivel, con su nombre, su tiempo máximo (o "Sin límite", que depende de la
// dificultad), el mejor tiempo guardado ("—" si no hay) y un tachito para
// borrar ese récord. En los niveles sin récord el tachito no se ve (pero
// ocupa su lugar, así las filas no se corren).
function mostrarRecordsInicio() {
  listaRecords.replaceChildren(...NIVELES.map((nivel, indice) => {
    const fila = document.createElement('li');
    fila.className = 'blocka__fila-record';

    const nombre = document.createElement('span');
    nombre.textContent = `Nivel ${indice + 1} · ${nivel.nombre}`;

    const limiteSeg = limiteSegundos(indice, vistaRecords);
    const limite = document.createElement('span');
    limite.className = 'blocka__limite';
    limite.textContent = limiteSeg === undefined
      ? 'Sin límite'
      : `Límite ${formatearTiempo(limiteSeg * 1000).slice(0, 5)}`;

    const record = leerRecord(vistaRecords, indice);
    const hayRecord = record !== undefined;
    const tiempo = document.createElement('strong');
    tiempo.textContent = hayRecord ? formatearTiempo(record) : '—';

    // Tachito: botón de solo ícono (Phosphor), con el estilo destructivo
    // (rojo, con pulso al pasar el mouse). El ícono es decorativo: el nombre
    // del botón lo da el aria-label.
    const borrar = document.createElement('button');
    borrar.type = 'button';
    borrar.className = 'btn btn--destructivo blocka__borrar' + (hayRecord ? '' : ' blocka__borrar--oculto');
    borrar.setAttribute('aria-label', `Borrar el récord del nivel ${indice + 1} con ${vistaRecords} piezas`);
    const icono = document.createElement('i');
    icono.className = 'ph ph-trash';
    icono.setAttribute('aria-hidden', 'true');
    borrar.append(icono);
    borrar.addEventListener('click', () => borrarRecordDelInicio(indice));

    fila.append(nombre, limite, tiempo, borrar);
    return fila;
  }));
}

// Click en un tachito: borra el récord de ese nivel (de la dificultad que se
// ve), actualiza la tabla y la ficha, y lo avisa con el texto de estado
// (role="status"). Al lado del aviso aparece "Deshacer", que lo vuelve a
// guardar: borrar es inmediato (sin confirmación), así que un clic sin querer
// tiene que poder revertirse.
function borrarRecordDelInicio(indice) {
  // Se guarda qué se borra (dificultad, nivel y tiempo) antes de borrarlo,
  // para poder restaurarlo después.
  const cantidad = vistaRecords;
  const ms = leerRecord(cantidad, indice);
  eliminarRecord(cantidad, indice);
  mostrarRecordsInicio();
  mostrarRecord(vistaRecords);

  const deshacer = document.createElement('button');
  deshacer.type = 'button';
  deshacer.className = 'btn btn--terciario';
  deshacer.textContent = 'Deshacer';
  deshacer.addEventListener('click', () => {
    // guardarRecord escribe el tiempo tal cual: como el récord se había
    // borrado, no hay otro con el que compararlo.
    guardarRecord(cantidad, indice, ms);
    mostrarRecordsInicio();
    mostrarRecord(vistaRecords);
    recordsEstado.textContent = 'Récord restaurado.';
    // El botón "Deshacer" desaparece con el texto nuevo: el foco vuelve a
    // "Comenzar" para no caer al <body>.
    btnComenzar.focus();
  });

  // El aviso y el botón van juntos en el mismo párrafo. Si después otra
  // acción cambia el texto (otro borrado, cambiar de dificultad, volver al
  // inicio), el botón desaparece solo: ya no hay nada que deshacer.
  recordsEstado.replaceChildren(
    `Récord del nivel ${indice + 1} con ${cantidad} piezas borrado.`,
    deshacer
  );
  // El tachito que tenía el foco se vuelve invisible al borrarse su récord:
  // el foco pasa a "Deshacer", que es la acción que más probablemente se
  // quiera hacer justo después.
  deshacer.focus();
}

// ---------- Elección de dificultad ----------

// "Comenzar" (inicio): lleva a elegir cuántas piezas tendrá la imagen.
btnComenzar.addEventListener('click', () => {
  inicio.hidden = true;
  dificultad.hidden = false;
  // El botón que se apretó desaparece: el foco pasa a la primera opción.
  opcionesDificultad[0].focus();
});

// Cada opción (4, 9 o 16 piezas) fija la dificultad y arranca el nivel 1, que
// empieza por el sorteo de la imagen. La tabla del inicio pasa a mostrar los
// récords de esa dificultad, así al volver se ve la que se acaba de jugar.
opcionesDificultad.forEach((opcion) => {
  opcion.addEventListener('click', () => {
    cantidadPiezas = Number(opcion.dataset.piezas);
    vistaRecords = cantidadPiezas;
    indiceNivel = 0;
    iniciarNivel();
  });
});

// "Volver" (elección de dificultad): de nuevo al inicio.
btnDificultadVolver.addEventListener('click', () => {
  mostrarInicio();
  btnComenzar.focus();
});

// Termina el nivel porque se armó la imagen (o porque se hizo trampa): frena
// el reloj, guarda el récord si corresponde y ofrece seguir ("Siguiente
// nivel", salvo en el último), repetir el nivel ("Reintentar nivel") o
// volver a la pantalla de inicio ("Volver al inicio"). Con trampa no se
// guarda récord.
function terminarNivel(conTrampa = false) {
  detenerReloj();
  nivelActivo = false;
  ocultarAcciones();
  const tiempo = performance.now() - inicioMs;
  datoTiempo.textContent = textoTiempo(tiempo, limiteDelNivel());

  // Se quitan las marcas de Ayudita y los filtros: con un fundido, cada pieza
  // pasa a su recorte original y se ve la imagen con sus colores reales. Los
  // botones aparecen enseguida; si se aprieta uno durante el fundido, el nivel
  // nuevo lo cancela (ver iniciarNivel()).
  piezas.forEach((p) => { p.fija = false; });
  quitarFiltros();

  const hayOtroNivel = indiceNivel < NIVELES.length - 1;
  const mensajeFinal = hayOtroNivel ? '' : ' Completaste todos los niveles.';

  if (conTrampa) {
    estado.textContent = 'Nivel resuelto con trampa: no cuenta para el récord.' + mensajeFinal;
  } else {
    const recordAnterior = leerRecord(cantidadPiezas, indiceNivel);
    const esRecord = recordAnterior === undefined || tiempo < recordAnterior;
    if (esRecord) guardarRecord(cantidadPiezas, indiceNivel, tiempo);
    mostrarRecord();
    estado.textContent = `¡Listo! Armaste la imagen en ${formatearTiempo(tiempo)}.` +
      (esRecord ? ' ¡Nuevo récord!' : '') + mensajeFinal;
  }

  btnReintentar.hidden = false;
  btnInicio.hidden = false;
  // Después del último nivel no hay "siguiente": queda reintentar o volver.
  btnSiguiente.hidden = !hayOtroNivel;
  (hayOtroNivel ? btnSiguiente : btnInicio).focus();
}

// Se acabó el tiempo máximo: se pierde el nivel. Se puede reintentar (mismo
// nivel, con una imagen nueva) o volver a la pantalla de inicio.
function perderNivel() {
  detenerReloj();
  nivelActivo = false;
  ocultarAcciones();
  datoTiempo.textContent = textoTiempo(limiteDelNivel() * 1000, limiteDelNivel());
  estado.textContent = '¡Se acabó el tiempo! Perdiste el nivel.';
  // Se redibuja sin el anillo del teclado (nivelActivo ya es false).
  dibujar();
  btnReintentar.hidden = false;
  btnInicio.hidden = false;
  btnReintentar.focus();
}

btnReintentar.addEventListener('click', () => iniciarNivel());

// "Ayudita": deja una parte mal puesta en su lugar correcto y la bloquea (ya
// no se puede girar). A cambio suma 5 segundos al contador: en vez de guardar
// una penalización aparte, se corre el instante de inicio 5 segundos hacia
// atrás, y así el tiempo transcurrido y el récord ya la incluyen.
btnAyudita.addEventListener('click', () => {
  if (!nivelActivo) return;
  // Solo ayuda con partes que de verdad están mal puestas (una uniforme que
  // "no está en 0" ya se ve bien y no vale la pena gastar la ayuda).
  const candidatas = piezas.filter((p) => !p.fija && !estaBienPuesta(p));
  if (candidatas.length === 0) return;

  const elegida = candidatas[Math.floor(Math.random() * candidatas.length)];
  elegida.giros = 0;
  elegida.fija = true;
  inicioMs -= PENALIZACION_AYUDITA_MS;
  dibujar();
  estado.textContent = 'Ayudita: una parte quedó fija en su lugar. Se sumaron 5 segundos.';

  // Primero el límite: si con los 5 s se pasó, se pierde aunque la imagen
  // haya quedado armada. Si no, se gana o sigue el juego (actualizarReloj()
  // también actualiza el botón de Ayudita).
  if (tiempoAgotado()) {
    perderNivel();
  } else if (estaArmada()) {
    terminarNivel();
  } else {
    actualizarReloj();
  }
});

// "Trampa": resuelve el nivel de golpe. No cuenta para el récord.
btnTrampa.addEventListener('click', () => {
  if (!nivelActivo) return;
  piezas.forEach((p) => { p.giros = 0; });
  terminarNivel(true);
});

// Atajos de teclado de toda la página.
// F1: abre la Ayuda. Despliega el primer ítem ("Cómo se juega") y pasa el
// foco al título del panel; preventDefault() evita que el navegador abra su
// propia ayuda.
// Alt + T: "Trampa", para la demo. El botón queda oculto (un jugador no
// debería ver un botón que le resuelve el juego), pero sigue en el HTML con
// su listener: click() en un botón oculto igual dispara su evento, y el
// listener ya revisa que haya un nivel en juego. No es Ctrl + Mayús + T
// porque Chrome y Edge se reservan esa combinación (reabrir la última
// pestaña) y no se la pasan a la página. Se compara evento.code ("KeyT", la
// tecla física) y no evento.key, que con Alt puede dar otro carácter según
// la distribución del teclado.
document.addEventListener('keydown', (evento) => {
  if (evento.key === 'F1') {
    evento.preventDefault();
    abrirAyuda();
  } else if (evento.altKey && !evento.ctrlKey && !evento.shiftKey && evento.code === 'KeyT') {
    evento.preventDefault();
    btnTrampa.click();
  }
});

// El título de la Ayuda (un <h2>) no recibe foco solo: tabIndex = -1 deja
// darle el foco por código sin sumarlo al recorrido de Tab. Al enfocarlo, el
// navegador lo trae a la vista y el lector de pantalla lo anuncia.
function abrirAyuda() {
  const primerItem = document.querySelector('.ayuda details');
  if (primerItem) primerItem.open = true;
  const tituloAyuda = document.getElementById('ayuda-titulo');
  tituloAyuda.tabIndex = -1;
  tituloAyuda.focus();
}

// "Siguiente nivel": arranca el próximo nivel al instante. Solo se muestra si
// hay un nivel siguiente.
btnSiguiente.addEventListener('click', () => {
  if (indiceNivel < NIVELES.length - 1) {
    indiceNivel++;
    iniciarNivel();
  }
});

// "Volver al inicio": vuelve a la pantalla de inicio del juego (la tabla de
// récords), no a la Home del sitio. Para eso está el "Volver al menú"
// del header.
btnInicio.addEventListener('click', () => {
  mostrarInicio();
  btnComenzar.focus();
});

// Convierte el punto donde se hizo clic (en píxeles de la pantalla) a la
// pieza que está ahí. El CSS puede mostrar el canvas más chico que sus píxeles
// reales, por eso se escala con la relación entre los dos tamaños.
function piezaEnPunto(evento) {
  const caja = canvas.getBoundingClientRect();
  const x = (evento.clientX - caja.left) * canvas.width / caja.width;
  const y = (evento.clientY - caja.top) * canvas.height / caja.height;
  const columna = Math.floor(x / ladoPieza());
  const fila = Math.floor(y / ladoPieza());
  return piezas.find((pieza) => pieza.columna === columna && pieza.fila === fila);
}

// Gira una pieza. sentido = +1 (derecha) o -1 (izquierda). La usan el mouse
// (girarPieza) y el teclado (keydown del canvas), así las reglas son las
// mismas venga de donde venga el giro.
// Sumar 4 antes del módulo evita números negativos: (0 - 1 + 4) % 4 = 3.
function girar(pieza, sentido) {
  if (!nivelActivo) return;
  // Si el giro llega con el tiempo ya agotado (entre dos ticks del reloj), se
  // pierde el nivel en vez de girar: así nunca se gana pasado el límite.
  if (tiempoAgotado()) {
    perderNivel();
    return;
  }
  // Las partes fijadas por Ayudita y las lisas (fijas desde el inicio) no giran.
  if (!pieza || pieza.fija || esLisa(pieza)) return;

  pieza.giros = (pieza.giros + sentido + 4) % 4;
  dibujar();

  if (estaArmada()) {
    terminarNivel();
  } else {
    actualizarAyudita();
  }
}

// Gira la pieza clickeada. Además, la pieza clickeada pasa a ser la elegida
// para el teclado: al hacer clic el canvas recibe el foco, y si el anillo
// quedara en otra pieza confundiría.
function girarPieza(evento, sentido) {
  const pieza = piezaEnPunto(evento);
  if (pieza) piezaFoco = piezas.indexOf(pieza);
  girar(pieza, sentido);
}

// Clic izquierdo: gira hacia la izquierda. Con Mayús apretada gira hacia la
// derecha: es la alternativa al clic derecho para quien usa un trackpad.
canvas.addEventListener('click', (evento) => girarPieza(evento, evento.shiftKey ? +1 : -1));

// Clic derecho: gira hacia la derecha. preventDefault() evita que se abra el
// menú contextual del navegador (el que sale con el botón derecho).
canvas.addEventListener('contextmenu', (evento) => {
  evento.preventDefault();
  girarPieza(evento, +1);
});

// Teclado: las flechas mueven la pieza elegida dentro de la grilla (al pasar
// el borde aparece del otro lado de la misma fila o columna), Q la gira hacia
// la izquierda y E, Enter o Espacio hacia la derecha. preventDefault() solo
// en esas teclas: evita que las flechas y el Espacio scrolleen la página, y no
// toca el resto (Tab, por ejemplo, sigue sacando el foco del canvas).
canvas.addEventListener('keydown', (evento) => {
  // Con Ctrl, Alt o Cmd es un atajo de otra cosa (del navegador o de la página).
  if (evento.ctrlKey || evento.altKey || evento.metaKey) return;
  if (!nivelActivo) return;

  const lado = piezasPorLado();
  let columna = piezaFoco % lado;
  let fila = Math.floor(piezaFoco / lado);
  const tecla = evento.key.toLowerCase();

  if (tecla === 'arrowleft') {
    columna = (columna - 1 + lado) % lado;
  } else if (tecla === 'arrowright') {
    columna = (columna + 1) % lado;
  } else if (tecla === 'arrowup') {
    fila = (fila - 1 + lado) % lado;
  } else if (tecla === 'arrowdown') {
    fila = (fila + 1) % lado;
  } else if (tecla === 'q') {
    evento.preventDefault();
    girar(piezas[piezaFoco], -1);
    return;
  } else if (tecla === 'e' || tecla === 'enter' || tecla === ' ') {
    evento.preventDefault();
    girar(piezas[piezaFoco], +1);
    return;
  } else {
    return;
  }

  // Llegó acá con una flecha: se mueve la pieza elegida y se redibuja el anillo.
  evento.preventDefault();
  piezaFoco = fila * lado + columna;
  dibujar();
});

// El anillo del teclado solo se ve con el canvas enfocado: al entrar o salir
// el foco se redibuja. Solo durante un nivel en juego: fuera de él no hay
// anillo que mostrar, y así tampoco se pisa el fundido del final.
canvas.addEventListener('focus', () => { if (nivelActivo) dibujar(); });
canvas.addEventListener('blur', () => { if (nivelActivo) dibujar(); });

// ---------- Galería ----------

// Capturas reales del juego, en el orden en que se vive una partida. El motor
// del flip es genérico y vive en js/galeria.js: acá solo se le pasa la lista
// de fotos. Cada una lleva su propio alt. Son de 16:9, igual que las del Peg.
const FOTOS_GALERIA_BLOCKA = [
  { src: 'assets/img/blocka-inicio.jpg', alt: 'Pantalla de inicio de Blocka, con la tabla de récords por nivel y los botones para ver cada dificultad.' },
  { src: 'assets/img/blocka-dificultad.jpg', alt: 'Pantalla para elegir la dificultad: 4, 9 o 16 piezas.' },
  { src: 'assets/img/blocka-sorteo.jpg', alt: 'La tragamonedas del sorteo, con tres rodillos que frenan en la misma imagen, la de Capitana Marvel.' },
  { src: 'assets/img/blocka-4-piezas.jpg', alt: 'Nivel 1 con 4 piezas en escala de grises: una imagen de Capitana Marvel cortada en cuatro partes giradas.' },
  { src: 'assets/img/blocka-9-piezas.jpg', alt: 'Nivel 2 con 9 piezas en negativo (Spider-Man), con una parte fijada por Ayudita y el reloj corriendo contra el tiempo límite.' },
  { src: 'assets/img/blocka-16-piezas.jpg', alt: 'Nivel 3 con 16 piezas y filtros mixtos (Hydra): negativo, brillo y escala de grises en distintas partes.' },
  { src: 'assets/img/blocka-derrota.jpg', alt: 'Pantalla de derrota al agotarse el tiempo límite, con los botones Reintentar nivel y Volver al inicio.' },
  { src: 'assets/img/blocka-victoria.jpg', alt: 'Pantalla de victoria: la imagen de Thor armada y sin filtros, con el tiempo y el aviso de nuevo récord.' },
];
iniciarGaleria(FOTOS_GALERIA_BLOCKA);
