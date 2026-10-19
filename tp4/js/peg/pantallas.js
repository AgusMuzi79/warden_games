// pantallas.js — Pantallas que se dibujan encima del tablero
//
// Qué hace: dibuja en el canvas las pantallas que tapan la partida: la de
// selección de bando (dos tarjetas: Usuarios y Programas de Clu) y las de
// fin (victoria "SISTEMA RESTAURADO" y derrota "SISTEMA CORRUPTO").
// Solo dibuja y responde "qué hay en este punto": el estado (qué tarjeta
// está elegida, cómo terminó la partida, si el canvas tiene foco) lo lleva
// juego.js.
//
// Los colores salen de obtenerColores() (variables.css) y las
// transparencias se arman con conAlfa(). No hay colores escritos acá.

import { conAlfa, enRect, clamp, easeOut, formatearTiempo, prefiereMenosMovimiento } from './utiles.js';
import { ANCHO, ALTO, RADIO_FICHA, PADDING_FICHA, BANDOS, ORDEN_BANDOS } from './config.js';
import { texto, dibujarScanlines, dibujarFicha, centroDeCelda } from './dibujo.js';

// ---------------------------------------------------------------
// Selección de bando
// ---------------------------------------------------------------

/**
 * Bando cuya tarjeta está bajo el punto (x, y), o null si no hay ninguna.
 * @param {number} x coordenada lógica (0 a 1200)
 * @param {number} y coordenada lógica (0 a 760)
 * @returns {string | null} 'usuarios', 'clu' o null
 */
export function bandoEn(x, y) {
  return ORDEN_BANDOS.find((clave) => enRect(x, y, BANDOS[clave].tarjeta)) || null;
}

/**
 * Dibuja la ficha grande de una tarjeta, girando despacio (más rápido si la
 * tarjeta está elegida). Con movimiento reducido queda quieta.
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLCanvasElement} imagen una de recursos.fichas
 * @param {number} x centro
 * @param {number} y centro
 * @param {number} radio radio de la ficha en px
 * @param {string} color color del brillo
 * @param {boolean} elegida
 * @param {number} t tiempo actual en ms
 */
function dibujarFichaGrande(ctx, imagen, x, y, radio, color, elegida, t) {
  // La imagen trae un margen para el brillo: se agranda en la misma proporción.
  const lado = radio * 2 * ((RADIO_FICHA + PADDING_FICHA) / RADIO_FICHA);
  const velocidad = elegida ? 0.0012 : 0.0004;
  ctx.save();
  ctx.translate(x, y);
  if (!prefiereMenosMovimiento()) ctx.rotate(t * velocidad);
  ctx.shadowColor = color;
  ctx.shadowBlur = elegida ? 40 : 20;
  ctx.drawImage(imagen, -lado / 2, -lado / 2, lado, lado);
  ctx.restore();
}

/**
 * Tamaño de letra (en px) para que un título entre en un ancho dado:
 * arranca en el tamaño máximo y achica de a 1 px hasta que entra.
 * Orbitron es ancha y "PROGRAMAS DE CLU" no entra a 22 px en la tarjeta.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} cadena
 * @param {string} familia fuente, por ejemplo fuentes.titulo
 * @param {number} maximo tamaño de partida
 * @param {number} anchoMaximo ancho disponible en px
 * @returns {number}
 */
function tamanoQueEntra(ctx, cadena, familia, maximo, anchoMaximo) {
  ctx.save();
  // Mismo espaciado que usa el título (2 px), para medir lo que se va a ver.
  if ('letterSpacing' in ctx) ctx.letterSpacing = '2px';
  let tamano = maximo;
  ctx.font = '700 ' + tamano + 'px ' + familia;
  while (tamano > 12 && ctx.measureText(cadena).width > anchoMaximo) {
    tamano--;
    ctx.font = '700 ' + tamano + 'px ' + familia;
  }
  ctx.restore();
  return tamano;
}

/**
 * Anillo de foco de teclado alrededor de una tarjeta (igual que el cursor
 * del tablero: claro y con brillo).
 * @param {CanvasRenderingContext2D} ctx
 * @param {{x: number, y: number, w: number, h: number}} caja la tarjeta
 * @param {Record<string, string>} colores
 */
function dibujarFocoTarjeta(ctx, caja, colores) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(caja.x - 8, caja.y - 8, caja.w + 16, caja.h + 16, 14);
  ctx.strokeStyle = colores.textoClaro;
  ctx.lineWidth = 3;
  ctx.shadowColor = colores.acento;
  ctx.shadowBlur = 12;
  ctx.stroke();
  ctx.restore();
}

/**
 * Dibuja la tarjeta de un bando: fondo, borde de su color, ficha grande,
 * nombre y lema. La elegida se enciende y muestra "ENTRAR AL GRID".
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} clave 'usuarios' o 'clu'
 * @param {{fichas: Record<string, HTMLCanvasElement>}} recursos
 * @param {Record<string, string>} colores
 * @param {{titulo: string, ui: string}} fuentes
 * @param {boolean} elegida
 * @param {number} t tiempo actual en ms
 */
function dibujarTarjeta(ctx, clave, recursos, colores, fuentes, elegida, t) {
  const bando = BANDOS[clave];
  const caja = bando.tarjeta;
  const color = colores[bando.color];
  const centroX = caja.x + caja.w / 2;

  // Fondo y borde con brillo.
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(caja.x, caja.y, caja.w, caja.h, 10);
  ctx.fillStyle = conAlfa(colores.placa, elegida ? 0.95 : 0.85);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = elegida ? 2.5 : 1.2;
  ctx.globalAlpha = elegida ? 1 : 0.6;
  ctx.shadowColor = color;
  ctx.shadowBlur = elegida ? 30 : 8;
  ctx.stroke();
  ctx.restore();

  const radio = elegida ? 82 : 74;
  dibujarFichaGrande(ctx, recursos.fichas[bando.ficha], centroX, caja.y + 130, radio, color, elegida, t);

  const tamano = tamanoQueEntra(ctx, bando.titulo, fuentes.titulo, 22, caja.w - 32);
  texto(ctx, bando.titulo, centroX, caja.y + 270, {
    fuente: '700 ' + tamano + 'px ' + fuentes.titulo, color, alinear: 'center', espaciado: 2, brillo: color, desenfoque: elegida ? 18 : 6,
  });
  texto(ctx, bando.lema, centroX, caja.y + 304, {
    fuente: '400 15px ' + fuentes.ui, color: colores.textoTenue, alinear: 'center',
  });
  if (elegida) {
    // El texto late suave; con movimiento reducido queda fijo.
    const pulso = prefiereMenosMovimiento() ? 1 : 0.6 + 0.4 * Math.abs(Math.sin(t * 0.004));
    ctx.save();
    ctx.globalAlpha = pulso;
    texto(ctx, 'ENTRAR AL GRID', centroX, caja.y + 338, {
      fuente: '600 12px ' + fuentes.ui, color: colores.textoClaro, alinear: 'center', espaciado: 3,
    });
    ctx.restore();
  }
}

/**
 * Pantalla de selección de bando: velo sobre el tablero, título, una
 * bajada con la regla del juego, las dos tarjetas y cómo elegir.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{fichas: Record<string, HTMLCanvasElement>}} recursos lo que devuelve prepararRecursos()
 * @param {Record<string, string>} colores lo que devuelve obtenerColores()
 * @param {{titulo: string, ui: string}} fuentes lo que devuelve obtenerFuentes()
 * @param {{elegido: string, t: number, conFoco: boolean}} estado
 *   elegido es la tarjeta encendida; conFoco, si el canvas tiene foco de teclado
 */
export function dibujarSeleccion(ctx, recursos, colores, fuentes, { elegido, t, conFoco }) {
  ctx.fillStyle = conAlfa(colores.descargado, 0.78);
  ctx.fillRect(0, 0, ANCHO, ALTO);

  texto(ctx, 'ELEGÍ TU BANDO', ANCHO / 2, 140, {
    fuente: '700 44px ' + fuentes.titulo, color: colores.textoClaro, alinear: 'center', espaciado: 6, brillo: colores.destino, desenfoque: 20,
  });
  texto(ctx, 'Saltá una ficha sobre otra para descargarla. Ganás si queda un solo nodo activo.', ANCHO / 2, 176, {
    fuente: '400 16px ' + fuentes.ui, color: colores.textoTenue, alinear: 'center',
  });

  ORDEN_BANDOS.forEach((clave) => {
    dibujarTarjeta(ctx, clave, recursos, colores, fuentes, clave === elegido, t);
  });
  if (conFoco) dibujarFocoTarjeta(ctx, BANDOS[elegido].tarjeta, colores);

  texto(ctx, 'Hacé click en una tarjeta, o usá las flechas y Enter.', ANCHO / 2, 620, {
    fuente: '400 15px ' + fuentes.ui, color: colores.textoTenue, alinear: 'center',
  });
}

// ---------------------------------------------------------------
// Pantallas de fin
// ---------------------------------------------------------------
//
// juego.js arma un objeto "fin" cuando se muestra la pantalla:
// { resultado, motivo, tiempoMs, movimientos, nodos, ultima, mostradoEn }
//   resultado: 'ganado' | 'perdido'
//   motivo: 'central' | 'un-nodo' | 'sin-saltos' | 'tiempo' (ver MOTIVOS)
//   ultima: casilla del nodo que quedó solo ({fila, col}), o null si se perdió
//   mostradoEn: instante (ms) en que apareció la pantalla; de ahí salen las animaciones

// Cómo se dice cada motivo: etiqueta va en el canvas (mayúsculas, como el
// prototipo) y frase en el aviso para lectores de pantalla.
const MOTIVOS = {
  central: { etiqueta: 'NODO CENTRAL  ·  CONEXIÓN PERFECTA', frase: 'Quedó un solo nodo, en el centro (conexión perfecta),' },
  'un-nodo': { etiqueta: 'UN SOLO NODO ACTIVO', frase: 'Quedó un solo nodo' },
  'sin-saltos': { etiqueta: 'NO QUEDAN SALTOS VÁLIDOS', frase: 'No quedan saltos válidos.' },
  tiempo: { etiqueta: 'SE TERMINÓ EL TIEMPO', frase: 'Se terminó el tiempo.' },
};

const TEXTO_BOTON_FIN = 'JUGAR DE NUEVO';
const ANCHO_BOTON_FIN = 260;
const ALTO_BOTON_FIN = 48;

// Barras de colores de la derrota. Se sortean de nuevo cada 90 ms (no en
// cada cuadro), así se ven como un parpadeo y no como ruido.
const barrasGlitch = { en: -Infinity, lista: [] };

/**
 * Altura (y) del título de la victoria. El bloque de texto va debajo del
 * nodo ganador, o arriba si el nodo quedó en la mitad de abajo, para no taparlo.
 * @param {{ultima: {fila: number, col: number}}} fin
 * @returns {number}
 */
function alturaTituloVictoria(fin) {
  return fin.ultima.fila >= 4 ? 150 : 520;
}

/**
 * Rectángulo del botón "JUGAR DE NUEVO" de la pantalla de fin.
 * @param {{resultado: string, ultima: {fila: number, col: number} | null}} fin
 * @returns {{x: number, y: number, w: number, h: number}}
 */
export function cajaBotonFin(fin) {
  const y = fin.resultado === 'ganado' ? alturaTituloVictoria(fin) + 118 : ALTO / 2 + 118;
  return { x: ANCHO / 2 - ANCHO_BOTON_FIN / 2, y, w: ANCHO_BOTON_FIN, h: ALTO_BOTON_FIN };
}

/**
 * Indica si el punto (x, y) cae sobre el botón "JUGAR DE NUEVO".
 * @param {number} x coordenada lógica (0 a 1200)
 * @param {number} y coordenada lógica (0 a 760)
 * @param {object} fin el objeto de la pantalla de fin
 * @returns {boolean}
 */
export function botonFinEn(x, y, fin) {
  return enRect(x, y, cajaBotonFin(fin));
}

/**
 * Tiempo jugado en mm:ss, redondeado para abajo. formatearTiempo()
 * redondea para arriba (es el criterio de la cuenta regresiva del HUD);
 * así el tiempo usado más el que marca el HUD suman el límite.
 * @param {number} ms
 * @returns {string}
 */
function tiempoUsado(ms) {
  return formatearTiempo(Math.floor(ms / 1000) * 1000);
}

/**
 * Texto para la región en vivo cuando aparece la pantalla de fin: el
 * resultado, el motivo, el tiempo, los movimientos y cómo jugar de nuevo.
 * @param {object} fin el objeto de la pantalla de fin
 * @returns {string}
 */
export function avisoDeFin(fin) {
  const tiempo = tiempoUsado(fin.tiempoMs);
  const movimientos = fin.movimientos + (fin.movimientos === 1 ? ' movimiento' : ' movimientos');
  const cierre = ' Apretá Enter para jugar de nuevo.';
  const frase = MOTIVOS[fin.motivo].frase;
  if (fin.resultado === 'ganado') {
    return 'Sistema restaurado. ' + frase + ' en ' + tiempo + ' y ' + movimientos + '.' + cierre;
  }
  return 'Sistema corrupto. ' + frase + ' Quedaron ' + fin.nodos + ' nodos, en ' + tiempo
    + ' y ' + movimientos + '.' + cierre;
}

/**
 * Línea de estadísticas: tiempo usado, movimientos y nodos que quedaron.
 * @param {object} fin
 * @returns {string}
 */
function lineaEstadisticas(fin) {
  return 'TIEMPO ' + tiempoUsado(fin.tiempoMs) + '  ·  MOVIMIENTOS ' + fin.movimientos
    + '  ·  NODOS ' + fin.nodos;
}

/**
 * Botón "JUGAR DE NUEVO" dibujado en el canvas: borde cyan con brillo, que
 * se rellena un poco más con el mouse encima. Con foco de teclado suma el
 * mismo anillo claro que el cursor del tablero.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{x: number, y: number, w: number, h: number}} caja
 * @param {Record<string, string>} colores
 * @param {{ui: string}} fuentes
 * @param {{encendido: boolean, conFoco: boolean}} estado
 */
function dibujarBotonFin(ctx, caja, colores, fuentes, { encendido, conFoco }) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(caja.x, caja.y, caja.w, caja.h, 6);
  ctx.fillStyle = conAlfa(colores.acento, encendido ? 0.22 : 0.08);
  ctx.fill();
  ctx.strokeStyle = colores.acento;
  ctx.lineWidth = 1.5;
  ctx.shadowColor = colores.acento;
  ctx.shadowBlur = encendido ? 16 : 6;
  ctx.stroke();
  ctx.restore();
  if (conFoco) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(caja.x - 6, caja.y - 6, caja.w + 12, caja.h + 12, 10);
    ctx.strokeStyle = colores.textoClaro;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }
  texto(ctx, TEXTO_BOTON_FIN, caja.x + caja.w / 2, caja.y + 30, {
    fuente: '600 15px ' + fuentes.ui, color: colores.textoClaro, alinear: 'center', espaciado: 3,
  });
}

/**
 * Título de la derrota con aberración cromática: una copia naranja y otra
 * cyan corridas a los costados, y la clara encima.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Record<string, string>} colores
 * @param {{titulo: string}} fuentes
 * @param {number} y
 * @param {number} corrimiento cuántos px se separan las copias
 * @param {boolean} quieto true con movimiento reducido (sin temblor al azar)
 */
function dibujarTituloGlitch(ctx, colores, fuentes, y, corrimiento, quieto) {
  const cadena = 'SISTEMA CORRUPTO';
  const x = ANCHO / 2;
  const fuente = '700 62px ' + fuentes.titulo;
  const azar = () => (quieto ? 0 : (Math.random() - 0.5) * corrimiento);
  ctx.save();
  // 'lighter' suma los colores donde las copias se pisan.
  ctx.globalCompositeOperation = 'lighter';
  texto(ctx, cadena, x - corrimiento, y + azar(), {
    fuente, color: conAlfa(colores.activo, 0.85), alinear: 'center', espaciado: 6,
  });
  texto(ctx, cadena, x + corrimiento, y - azar(), {
    fuente, color: conAlfa(colores.acento, 0.85), alinear: 'center', espaciado: 6,
  });
  ctx.restore();
  texto(ctx, cadena, x, y, {
    fuente, color: colores.textoClaro, alinear: 'center', espaciado: 6, brillo: colores.activo, desenfoque: 24,
  });
}

/**
 * Efecto de pantalla rota de la derrota: franjas del propio canvas corridas
 * de lado y barras de colores. Es fuerte al principio y después vuelve en
 * ráfagas cortas.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Record<string, string>} colores
 * @param {number} t tiempo actual en ms
 * @param {boolean} fuerte si es un momento de ráfaga
 * @param {number} dpr densidad de píxeles del canvas
 */
function dibujarRotura(ctx, colores, t, fuerte, dpr) {
  // Copia pedazos del canvas sobre sí mismo. La fuente se mide en píxeles
  // reales (por eso el dpr) y el destino en medidas lógicas.
  const franjas = fuerte ? 9 : 2;
  for (let i = 0; i < franjas; i++) {
    const y = Math.random() * ALTO;
    const alto = 4 + Math.random() * (fuerte ? 40 : 12);
    const corrimiento = (Math.random() - 0.5) * (fuerte ? 90 : 24);
    ctx.drawImage(ctx.canvas, 0, y * dpr, ANCHO * dpr, alto * dpr, corrimiento, y, ANCHO, alto);
  }

  if (t - barrasGlitch.en > 90) {
    barrasGlitch.en = t;
    const tonos = [colores.activo, colores.acento, colores.destino];
    barrasGlitch.lista = Array.from({ length: fuerte ? 14 : 6 }, () => ({
      x: Math.random() * ANCHO,
      y: Math.random() * ALTO,
      w: 40 + Math.random() * (Math.random() < 0.15 ? ANCHO : 200),
      h: 2 + Math.random() * 10,
      color: tonos[Math.floor(Math.random() * tonos.length)],
    }));
  }
  ctx.save();
  ctx.globalAlpha = 0.7;
  barrasGlitch.lista.forEach((barra) => {
    ctx.fillStyle = barra.color;
    ctx.fillRect(barra.x, barra.y, barra.w, barra.h);
  });
  ctx.restore();
}

/**
 * Pantalla de derrota "SISTEMA CORRUPTO": el canvas se rompe en franjas,
 * aparecen barras de colores, el título tiembla y abajo van el motivo
 * (en una caja), las estadísticas y el botón. Con movimiento reducido se
 * ve quieta desde el primer cuadro.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} recursos lo que devuelve prepararRecursos()
 * @param {Record<string, string>} colores
 * @param {{titulo: string, ui: string}} fuentes
 * @param {object} fin el objeto de la pantalla de fin
 * @param {{t: number, dpr: number, encendido: boolean, conFoco: boolean}} estado
 */
function dibujarDerrota(ctx, recursos, colores, fuentes, fin, { t, dpr, encendido, conFoco }) {
  const quieto = prefiereMenosMovimiento();
  const pasado = t - fin.mostradoEn;
  const fuerte = !quieto && (pasado < 600 || pasado % 1800 < 140);
  if (!quieto) dibujarRotura(ctx, colores, t, fuerte, dpr);

  // Velo que oscurece en medio segundo (de golpe con movimiento reducido).
  ctx.fillStyle = conAlfa(colores.descargado, 0.62 * (quieto ? 1 : clamp(pasado / 500)));
  ctx.fillRect(0, 0, ANCHO, ALTO);

  const centroX = ANCHO / 2;
  dibujarTituloGlitch(ctx, colores, fuentes, ALTO / 2 - 40, fuerte ? 9 : 2.5, quieto);

  // Caja con el motivo, del ancho del texto.
  const etiqueta = MOTIVOS[fin.motivo].etiqueta;
  const fuenteMotivo = '600 20px ' + fuentes.ui;
  ctx.save();
  ctx.font = fuenteMotivo;
  if ('letterSpacing' in ctx) ctx.letterSpacing = '6px';
  const anchoCaja = ctx.measureText(etiqueta).width + 56;
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(centroX - anchoCaja / 2, ALTO / 2 + 6, anchoCaja, 50, 6);
  ctx.fillStyle = conAlfa(colores.descargado, 0.85);
  ctx.fill();
  ctx.strokeStyle = conAlfa(colores.activo, 0.7);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
  // El +3 compensa el espaciado que queda después de la última letra.
  texto(ctx, etiqueta, centroX + 3, ALTO / 2 + 38, {
    fuente: fuenteMotivo, color: colores.textoClaro, alinear: 'center', espaciado: 6,
  });

  texto(ctx, lineaEstadisticas(fin), centroX, ALTO / 2 + 92, {
    fuente: '700 16px ' + fuentes.ui, color: colores.textoTenue, alinear: 'center', espaciado: 2,
  });
  dibujarBotonFin(ctx, cajaBotonFin(fin), colores, fuentes, { encendido, conFoco });

  dibujarScanlines(ctx, recursos);
}

/**
 * Pantalla de victoria "SISTEMA RESTAURADO": ondas cyan que salen del
 * último nodo, el nodo latiendo encima del velo, el título que se revela
 * con un barrido desde el centro, y después el motivo, las estadísticas y
 * el botón, que aparecen de a poco. Con movimiento reducido se ve todo
 * quieto desde el primer cuadro.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} recursos lo que devuelve prepararRecursos()
 * @param {Record<string, string>} colores
 * @param {{titulo: string, ui: string}} fuentes
 * @param {object} fin el objeto de la pantalla de fin
 * @param {{t: number, imagen: HTMLCanvasElement, encendido: boolean, conFoco: boolean}} estado
 *   imagen es la ficha del bando con la que se dibuja el nodo ganador
 */
function dibujarVictoria(ctx, recursos, colores, fuentes, fin, { t, imagen, encendido, conFoco }) {
  const quieto = prefiereMenosMovimiento();
  const pasado = quieto ? Infinity : t - fin.mostradoEn;
  ctx.fillStyle = conAlfa(colores.fondo, 0.7 * clamp(pasado / 500));
  ctx.fillRect(0, 0, ANCHO, ALTO);

  // Tres ondas que se agrandan desde el último nodo y se apagan.
  const nodo = centroDeCelda(fin.ultima.fila, fin.ultima.col);
  if (!quieto) {
    ctx.save();
    ctx.strokeStyle = colores.acento;
    ctx.shadowColor = colores.acento;
    ctx.shadowBlur = 12;
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const avance = (pasado / 1600 + i / 3) % 1;
      ctx.globalAlpha = (1 - avance) * 0.6;
      ctx.beginPath();
      ctx.arc(nodo.x, nodo.y, 40 + avance * 460, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
  const pulso = quieto ? 0 : (Math.sin(t * 0.004) + 1) / 2;
  dibujarFicha(ctx, imagen, nodo.x, nodo.y, 1.1 + 0.06 * pulso);

  // Título revelado con un barrido desde el centro hacia los lados.
  const centroX = ANCHO / 2;
  const y = alturaTituloVictoria(fin);
  const revelado = easeOut(clamp((pasado - 200) / 700));
  const mitad = (ANCHO / 2) * revelado;
  ctx.save();
  ctx.beginPath();
  ctx.rect(centroX - mitad, y - 80, mitad * 2, 110);
  ctx.clip();
  texto(ctx, 'SISTEMA RESTAURADO', centroX, y, {
    fuente: '700 58px ' + fuentes.titulo, color: colores.textoClaro, alinear: 'center', espaciado: 6, brillo: colores.acento, desenfoque: 26,
  });
  ctx.restore();
  if (revelado < 1) {
    // Los dos bordes del barrido, como líneas de luz.
    ctx.save();
    ctx.fillStyle = colores.textoClaro;
    ctx.shadowColor = colores.acento;
    ctx.shadowBlur = 18;
    ctx.fillRect(centroX - mitad - 1, y - 80, 2, 110);
    ctx.fillRect(centroX + mitad - 1, y - 80, 2, 110);
    ctx.restore();
  }

  // El resto aparece cuando el barrido está terminando.
  ctx.save();
  ctx.globalAlpha = clamp((pasado - 700) / 400);
  texto(ctx, MOTIVOS[fin.motivo].etiqueta, centroX, y + 54, {
    fuente: '600 20px ' + fuentes.ui, color: colores.acento, alinear: 'center', espaciado: 6,
  });
  texto(ctx, lineaEstadisticas(fin), centroX, y + 92, {
    fuente: '700 16px ' + fuentes.ui, color: colores.textoTenue, alinear: 'center', espaciado: 2,
  });
  dibujarBotonFin(ctx, cajaBotonFin(fin), colores, fuentes, { encendido, conFoco });
  ctx.restore();

  dibujarScanlines(ctx, recursos);
}

/**
 * Pantalla de fin: elige la de victoria o la de derrota según el resultado.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} recursos lo que devuelve prepararRecursos()
 * @param {Record<string, string>} colores lo que devuelve obtenerColores()
 * @param {{titulo: string, ui: string}} fuentes lo que devuelve obtenerFuentes()
 * @param {object} fin el objeto de la pantalla de fin (ver arriba)
 * @param {{t: number, dpr: number, imagen: HTMLCanvasElement, encendido: boolean, conFoco: boolean}} estado
 *   encendido: el mouse está sobre el botón; conFoco: el canvas tiene foco de teclado
 */
export function dibujarFin(ctx, recursos, colores, fuentes, fin, estado) {
  if (fin.resultado === 'ganado') dibujarVictoria(ctx, recursos, colores, fuentes, fin, estado);
  else dibujarDerrota(ctx, recursos, colores, fuentes, fin, estado);
}
