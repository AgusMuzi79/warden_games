// Galería animada de la página del juego (Etapa 4, parte 5 — animada en la
// 2ª corrección del TPE2). Es un carrusel de "una foto a la vez": al pasar
// de una a otra, la tarjeta gira en 3D como una ficha que se da vuelta.
//
// El giro en sí (la animación) lo resuelve el CSS (.galeria__carta,
// components.css) con la variable --angulo y una transition sobre
// transform. Acá solo decidimos DOS cosas en cada click: qué foto le toca
// a la cara que está escondida, y cuánto hay que sumarle al ángulo para
// que esa cara pase al frente.

// Las 6 capturas, en el mismo orden que documenta DECISIONES.md. La 0 y la
// 1 ya están puestas directo en el HTML (son las 2 caras con las que
// arranca la tarjeta); esta lista es la fuente de verdad para las que van
// entrando después.
const FOTOS_GALERIA = [
  { src: 'assets/img/inicio-juego.png', alt: 'Tablero de Neon Circuit al arrancar la partida, con los 33 nodos activos y el hueco central.' },
  { src: 'assets/img/ficha-seleccionada.png', alt: 'Un nodo seleccionado en el tablero, listo para saltar.' },
  { src: 'assets/img/ficha-salto.png', alt: 'El momento del salto de un nodo sobre otro hacia un casillero descargado.' },
  { src: 'assets/img/juego-avanzado.png', alt: 'Partida avanzada, con buena parte de los nodos ya descargados del tablero.' },
  { src: 'assets/img/victoria.png', alt: 'Pantalla de victoria, con un único nodo restante en el centro del tablero.' },
  { src: 'assets/img/glitch-gameover.png', alt: 'Pantalla de fin de partida, con un efecto glitch sobre el tablero.' },
];

const carta = document.getElementById('galeria-carta');

// La página del juego es la única que tiene esta galería animada
// (producto.html sigue con la grilla de gradientes) — sin este chequeo,
// el script tiraría error en cualquier otra página que lo cargara.
if (carta) {
  const imgA = document.getElementById('galeria-img-a');
  const imgB = document.getElementById('galeria-img-b');
  const contador = document.getElementById('galeria-contador');
  const botonPrev = document.getElementById('galeria-prev');
  const botonNext = document.getElementById('galeria-next');

  // Índice de la foto que se ve ahora mismo (arranca en 0: la que ya
  // puso el HTML en la cara A).
  let indiceVisible = 0;

  // Cuál de las 2 caras NO se ve en este momento. Arranca en 'b' porque
  // así la dejó el HTML: cara A al frente (0°) con la foto 0, cara B
  // escondida (pre-girada 180° en el CSS) con la foto 1.
  let caraOculta = 'b';

  // Ángulo acumulado de la tarjeta. Nunca "vuelve" a 0 al llegar a 360:
  // se lo deja seguir sumando (o restando) para que el giro visual
  // siempre continúe para el mismo lado en el que se lo empujó, sin
  // saltos raros hacia atrás.
  let angulo = 0;

  function actualizarContador() {
    contador.textContent = `Foto ${indiceVisible + 1} de ${FOTOS_GALERIA.length}`;
  }

  // direccion: 1 para "foto siguiente", -1 para "foto anterior".
  function girar(direccion) {
    const total = FOTOS_GALERIA.length;

    // Calculamos qué foto va a mostrarse ahora, en base a la que se ve
    // hoy (no a lo que se venía preparando de antes): así el carrusel
    // responde bien aunque el click cambie de dirección respecto del
    // anterior (ej: "siguiente" y después "anterior" seguidos).
    const nuevoIndice = direccion > 0
      ? (indiceVisible + 1) % total
      : (indiceVisible - 1 + total) % total;

    // La cargamos en la cara que en este momento está escondida: como no
    // se ve, este cambio de imagen es invisible hasta que la tarjeta gire.
    const imgDestino = caraOculta === 'a' ? imgA : imgB;
    imgDestino.src = FOTOS_GALERIA[nuevoIndice].src;
    imgDestino.alt = FOTOS_GALERIA[nuevoIndice].alt;

    // Giramos la tarjeta 180° hacia el lado que corresponda a la
    // dirección: esto es lo único que dispara la animación (el resto lo
    // hace la transition del CSS al cambiar esta variable).
    angulo += direccion * 180;
    carta.style.setProperty('--angulo', `${angulo}deg`);

    // Con el giro, las 2 caras intercambian su rol: la que estaba
    // escondida pasa a ser la visible, y al revés.
    caraOculta = caraOculta === 'a' ? 'b' : 'a';
    indiceVisible = nuevoIndice;
    actualizarContador();
  }

  botonPrev.addEventListener('click', () => girar(-1));
  botonNext.addEventListener('click', () => girar(1));
}
