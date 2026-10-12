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
//   filtroGrises(imageData), filtroBrillo(imageData), filtroNegativo(imageData)
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

// Brillo +30 %: se multiplica cada canal por 1,3, así todo se aclara en la
// misma proporción. Math.min(255, ...) evita pasarse del máximo: un canal
// que ya era 250 daría 325, que no es un valor de color válido.
const AUMENTO_BRILLO = 0.3;

function filtroBrillo(imageData) {
  const salida = new ImageData(imageData.width, imageData.height);
  const factor = 1 + AUMENTO_BRILLO;

  for (let x = 0; x < imageData.width; x++) {
    for (let y = 0; y < imageData.height; y++) {
      const r = Math.min(255, getRed(imageData, x, y) * factor);
      const g = Math.min(255, getGreen(imageData, x, y) * factor);
      const b = Math.min(255, getBlue(imageData, x, y) * factor);
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

// Para elegir un filtro por su nombre desde la configuración de los niveles
// (FILTROS['grises'] devuelve la función filtroGrises).
const FILTROS = {
  grises: filtroGrises,
  brillo: filtroBrillo,
  negativo: filtroNegativo,
};
