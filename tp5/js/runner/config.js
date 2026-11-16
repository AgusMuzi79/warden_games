// config.js — Todos los números del juego en un solo lugar
//
// Velocidades en px/s, aceleraciones en px/s², tiempos en segundos y
// tamaños en px del área de juego (960x540). Ajustar la dificultad es
// cambiar valores acá, sin tocar la lógica. Los tamaños de los sprites
// salen de los PNG (ver docs/prompt-tp5-runner.md, tabla de assets): el
// juego nunca los mide en el DOM.

/** Carpeta de las imágenes del juego (relativa a runner.html). */
const ASSETS = 'assets/game/';

/** Área de juego y reglas generales. */
export const JUEGO = {
  ancho: 960,
  alto: 540,
  techo: 0,              // y del borde de arriba
  suelo: 448,            // y donde empieza la franja del suelo (540 - 92)
  puntajeObjetivo: 50,   // se gana al llegar acá (los 3 modos)
  dtMax: 0.05,           // tope del dt: si la pestaña se congela, no "teletransporta"
  duracionSacudon: 0.4,  // .is-shaking del #game
  esperaDerrota: 1.0,    // la explosión se ve antes de mostrar la pantalla de derrota
};

/** Velocidad del mundo. Todo lo que scrollea deriva de velocidadBase. */
export const MUNDO = {
  velocidadBase: 220,        // px/s del suelo y de los obstáculos (factor 1)
  factorRalentizado: 0.45,   // al chocar un drone la velocidad base baja a este factor
  duracionRalentizado: 1.5,
};

/**
 * Capas del parallax, de la más lejana a la más cercana. factor multiplica
 * la velocidad del mundo; anchoTile es lo que mide una repetición del
 * fondo (PNG escalado x2, o el patrón CSS del suelo), para poder volver a 0
 * sin que se note el salto.
 */
export const CAPAS = [
  { factor: 0.1, anchoTile: 768 },   // capa1-cielo 384 x2
  { factor: 0.3, anchoTile: 768 },   // capa2-ciudad-lejana 384 x2
  { factor: 0.6, anchoTile: 2018 },  // capa3-edificios 1009 x2
  { factor: 1, anchoTile: 64 },      // suelo CSS: misma velocidad que los obstáculos
];

/** La moto. x es fijo (25 % del ancho); el mundo es el que se mueve. */
export const JUGADOR = {
  x: 240,
  ancho: 93,                // moto.png 93x60, escala x1
  alto: 60,
  gravedad: 1500,
  impulso: 430,             // velocidad hacia arriba después de cada pulsación
  caidaMax: 620,            // tope de la velocidad de caída
  gradosPorVelocidad: 0.07, // rotación = vy * esto (nariz arriba al subir)
  rotacionMin: -25,
  rotacionMax: 55,
  // Hitbox más chica que el sprite, relativa a su esquina de arriba a la izquierda.
  hitbox: { dx: 14, dy: 16, ancho: 64, alto: 30 },
  duracionImpulso: 0.2,     // .is-boost
  duracionChoque: 0.6,      // .is-hit
  duracionInvulnerable: 1.5,
};

/** Pares edificio + cartel. */
export const OBSTACULO = {
  separacionMin: 280,   // px entre el borde derecho de un par y el izquierdo del siguiente
  separacionMax: 420,
  saltoMaxCentro: 150,  // el centro del hueco no se mueve más que esto respecto del anterior
  margenArriba: 60,     // alto mínimo del cartel colgante
  margenAbajo: 80,      // alto mínimo del edificio
  primeraX: 1120,       // el primer par aparece fuera de pantalla, a la derecha
  hitboxMargen: 10,     // achica las hitboxes a los costados
  hitboxMargenTope: 14, // el tope del edificio tiene antenas: la caja empieza más abajo
  duracionChoque: 0.5,  // .is-hit del obstáculo
  edificios: [
    { src: `${ASSETS}obstaculos/edificio-1.png`, ancho: 139, alto: 174 },
    { src: `${ASSETS}obstaculos/edificio-2.png`, ancho: 77, alto: 197 },
    { src: `${ASSETS}obstaculos/edificio-3.png`, ancho: 101, alto: 130 },
    { src: `${ASSETS}obstaculos/edificio-4.png`, ancho: 123, alto: 156 },
    { src: `${ASSETS}obstaculos/edificio-5.png`, ancho: 89, alto: 83 },
    { src: `${ASSETS}obstaculos/edificio-6.png`, ancho: 139, alto: 203 },
    { src: `${ASSETS}obstaculos/edificio-7.png`, ancho: 78, alto: 167 },
  ],
  // Carteles: tiras horizontales de 4 frames, escaladas x2.
  carteles: [
    { src: `${ASSETS}sprites/banner-big.png`, frames: 4, frameAncho: 35, alto: 92, escala: 2 },
    { src: `${ASSETS}sprites/banner-neon.png`, frames: 4, frameAncho: 19, alto: 48, escala: 2 },
    { src: `${ASSETS}sprites/banner-side.png`, frames: 4, frameAncho: 19, alto: 76, escala: 2 },
  ],
};

/** Drone: resta una vida y ralentiza el mundo. */
export const DRONE = {
  ancho: 55,             // un frame de drone.png
  alto: 52,
  probabilidad: 0.35,    // chance de que aparezca entre dos pares
  desdeObstaculo: 2,     // no aparece antes del 2º par (para arrancar tranquilo)
  desvio: 70,            // distancia vertical a la línea que une los dos huecos
  amplitud: 18,          // vaivén vertical
  frecuencia: 0.8,       // vaivenes por segundo
  hitbox: { dx: 10, dy: 12, ancho: 35, alto: 26 },
  duracionExplosion: 0.5,
};

/** Coleccionable: suma puntos. */
export const COLECCIONABLE = {
  lado: 24,
  probabilidad: 0.4,     // chance de que aparezca en el hueco de un par
  desvioMax: 30,         // se corre un poco del centro del hueco
  puntos: 3,
  hitbox: { dx: 2, dy: 2, ancho: 20, alto: 20 },
  duracionRecogida: 0.4,
  duracionTexto: 0.8,
};

/**
 * Modos. vidas: Infinity en Fácil (invencible: choca y se ven las
 * animaciones, pero no pierde). La curva del hueco: arranca en huecoInicial
 * y baja huecoBaja px por obstáculo pasado, hasta huecoMin.
 */
export const MODOS = {
  facil: { nombre: 'Fácil', vidas: Infinity, huecoInicial: 220, huecoBaja: 4, huecoMin: 130 },
  normal: { nombre: 'Normal', vidas: 3, huecoInicial: 220, huecoBaja: 4, huecoMin: 130 },
  dificil: { nombre: 'Difícil', vidas: 1, huecoInicial: 190, huecoBaja: 6, huecoMin: 130 },
};

/** Imágenes que se precargan antes de mostrar el selector de modo. */
export const IMAGENES = [
  `${ASSETS}bg/capa1-cielo.png`,
  `${ASSETS}bg/capa2-ciudad-lejana.png`,
  `${ASSETS}bg/capa3-edificios.png`,
  `${ASSETS}sprites/moto.png`,
  `${ASSETS}sprites/drone.png`,
  `${ASSETS}sprites/explosion.png`,
  ...OBSTACULO.edificios.map((edificio) => edificio.src),
  ...OBSTACULO.carteles.map((cartel) => cartel.src),
];
