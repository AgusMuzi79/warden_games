// filtros.js — Filtros de imagen para Blocka
//
// Cada filtro recibe un ImageData (los píxeles de una imagen, leídos del
// canvas con getImageData) y devuelve un ImageData NUEVO con el filtro
// aplicado. No modifica el original: así se puede volver a usar.
// Misma estructura que la plantilla de la cátedra (cargar-imagen.html):
// recorrer todos los píxeles con un doble for, leer el color con
// getRed/getGreen/getBlue y escribir el resultado con setPixel.
//
// Expone estas globales (los scripts no usan type="module"):
//   filtroGrises(imageData), filtroBrillo(imageData), filtroNegativo(imageData),
//   filtroBordes(imageData)
//   FILTROS: objeto que asocia el nombre de un filtro con su función.
// Lo usa js/blocka.js, que tiene que cargarse después de este archivo.

// ---------- Cómo se guardan los píxeles ----------
// imageData.data es UNA lista larga: [R,G,B,A, R,G,B,A, ...], fila por fila.
// Cada valor va de 0 a 255 (A = opacidad, 255 es totalmente opaco).
// El píxel (x, y) empieza en la posición (x + y * ancho) * 4.

// Escribe el color (r, g, b, a) en el píxel (x, y).
function setPixel(imageData, x, y, r, g, b, a) {
  const index = (x + y * imageData.width) * 4;
  imageData.data[index + 0] = r;
  imageData.data[index + 1] = g;
  imageData.data[index + 2] = b;
  imageData.data[index + 3] = a;
}

// Devuelven el valor de un canal (0 a 255) del píxel (x, y).
function getRed(imageData, x, y) {
  return imageData.data[(x + y * imageData.width) * 4 + 0];
}

function getGreen(imageData, x, y) {
  return imageData.data[(x + y * imageData.width) * 4 + 1];
}

function getBlue(imageData, x, y) {
  return imageData.data[(x + y * imageData.width) * 4 + 2];
}

// ---------- Filtros ----------

// Escala de grises: un gris es un color con R = G = B. Se usa el promedio de
// los tres canales para conservar qué tan claro u oscuro era cada píxel.
function filtroGrises(imageData) {
  // new ImageData(ancho, alto) crea un ImageData vacío (todo transparente)
  // donde escribimos el resultado, sin pisar la imagen original.
  const salida = new ImageData(imageData.width, imageData.height);

  for (let x = 0; x < imageData.width; x++) {
    for (let y = 0; y < imageData.height; y++) {
      const r = getRed(imageData, x, y);
      const g = getGreen(imageData, x, y);
      const b = getBlue(imageData, x, y);
      const gris = (r + g + b) / 3;
      setPixel(salida, x, y, gris, gris, gris, 255);
    }
  }

  return salida;
}

// Brillo al 30 %: se multiplica cada canal por 0,3, así todo se oscurece en la
// misma proporción (un píxel claro sigue siendo más claro que uno oscuro).
// Multiplicar por un número entre 0 y 1 nunca se pasa de 255 ni baja de 0,
// así que no hace falta limitar el resultado.
const FACTOR_BRILLO = 0.3;

function filtroBrillo(imageData) {
  const salida = new ImageData(imageData.width, imageData.height);

  for (let x = 0; x < imageData.width; x++) {
    for (let y = 0; y < imageData.height; y++) {
      const r = getRed(imageData, x, y) * FACTOR_BRILLO;
      const g = getGreen(imageData, x, y) * FACTOR_BRILLO;
      const b = getBlue(imageData, x, y) * FACTOR_BRILLO;
      setPixel(salida, x, y, r, g, b, 255);
    }
  }

  return salida;
}

// Negativo: cada canal pasa a su opuesto (255 - valor). Lo negro queda
// blanco, lo rojo queda cian, etc.
function filtroNegativo(imageData) {
  const salida = new ImageData(imageData.width, imageData.height);

  for (let x = 0; x < imageData.width; x++) {
    for (let y = 0; y < imageData.height; y++) {
      const r = 255 - getRed(imageData, x, y);
      const g = 255 - getGreen(imageData, x, y);
      const b = 255 - getBlue(imageData, x, y);
      setPixel(salida, x, y, r, g, b, 255);
    }
  }

  return salida;
}

// Bordes (Sobel): marca dónde el brillo cambia de golpe entre un píxel y sus
// vecinos. Los contornos quedan blancos y las zonas parejas, negras.
// Por cada píxel se mira el cuadrado de 3x3 a su alrededor (en gris):
//   gx = columna derecha - columna izquierda (cambio de izquierda a derecha)
//   gy = fila de abajo - fila de arriba (cambio de arriba hacia abajo)
// con peso 2 en el vecino del medio. La intensidad es la raíz de gx² + gy²,
// limitada a 255 (puede pasarse: el máximo teórico es ~1442).
// A diferencia de los otros filtros, cada píxel depende de sus vecinos: por
// eso se lee siempre de imageData y se escribe en salida, nunca en el mismo.
function filtroBordes(imageData) {
  const ancho = imageData.width;
  const alto = imageData.height;
  const salida = new ImageData(ancho, alto);

  // Brillo (promedio de los canales) de un vecino. Si cae fuera de la imagen,
  // se usa el píxel del borde: así también se calculan los píxeles del marco
  // (si se salteaban, quedaban transparentes, como arranca salida).
  const gris = (x, y) => {
    const vx = Math.min(ancho - 1, Math.max(0, x));
    const vy = Math.min(alto - 1, Math.max(0, y));
    return (getRed(imageData, vx, vy) + getGreen(imageData, vx, vy) + getBlue(imageData, vx, vy)) / 3;
  };

  for (let x = 0; x < ancho; x++) {
    for (let y = 0; y < alto; y++) {
      const gx = -gris(x - 1, y - 1) - 2 * gris(x - 1, y) - gris(x - 1, y + 1)
               +  gris(x + 1, y - 1) + 2 * gris(x + 1, y) + gris(x + 1, y + 1);
      const gy = -gris(x - 1, y - 1) - 2 * gris(x, y - 1) - gris(x + 1, y - 1)
               +  gris(x - 1, y + 1) + 2 * gris(x, y + 1) + gris(x + 1, y + 1);
      const borde = Math.min(255, Math.sqrt(gx * gx + gy * gy));
      setPixel(salida, x, y, borde, borde, borde, 255);
    }
  }

  return salida;
}

// Para elegir un filtro por su nombre desde la configuración de los niveles
// (FILTROS['grises'] devuelve la función filtroGrises).
const FILTROS = {
  grises: filtroGrises,
  brillo: filtroBrillo,
  negativo: filtroNegativo,
  bordes: filtroBordes,
};
