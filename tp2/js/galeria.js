// Motor de la galería animada (carrusel de flip 3D). No trae datos
// propios: es genérico, lo comparten juego.html (Neon Circuit, 6 fotos
// reales, ver js/juego.js) y producto.html (un juego del catálogo de la
// API, que solo tiene 1 foto real — la portada, ver js/producto.js). Cada
// página le pasa su propia lista de fotos llamando a iniciarGaleria(fotos)
// una vez que las tiene listas.
//
// El giro en sí (la animación) lo resuelve el CSS (.galeria__carta,
// components.css) con la variable --angulo y una transition sobre
// transform. Acá solo decidimos DOS cosas en cada click: qué foto le toca
// a la cara que está escondida, y cuánto hay que sumarle al ángulo para
// que esa cara pase al frente.

// fotos: array de { src, alt }, con al menos 1 elemento. Si solo hay 1
// foto real (como en producto.html) y la página tiene la cara "sin más
// capturas" (#galeria-vacio), esa cara hace de 2da diapositiva: las flechas
// siguen girando la tarjeta, pero en vez de repetir la misma foto se ve un
// mensaje que dice que no hay más. Sin esa cara, con 1 sola foto las 2
// caras muestran la misma.
function iniciarGaleria(fotos) {
  const carta = document.getElementById('galeria-carta');

  // No todas las páginas tienen esta galería (aunque hoy la tengan las 2
  // que la llaman) — sin este chequeo, cualquier página sin el HTML
  // correspondiente tiraría error acá.
  if (!carta || !fotos || fotos.length === 0) return;

  const imgA = document.getElementById('galeria-img-a');
  const imgB = document.getElementById('galeria-img-b');
  const contador = document.getElementById('galeria-contador');
  const botonPrev = document.getElementById('galeria-prev');
  const botonNext = document.getElementById('galeria-next');
  const vacio = document.getElementById('galeria-vacio');

  // Las "diapositivas" son las fotos reales, más un marcador { vacio: true }
  // como 2da cuando hay una sola foto y la página tiene la cara de "sin más
  // capturas". El vacío vive siempre en la cara B: con 2 diapositivas y 2
  // caras que se alternan, la diapositiva 1 siempre cae en la B.
  const hayUnaSolaFoto = fotos.length === 1 && vacio !== null;
  const diapositivas = hayUnaSolaFoto ? [fotos[0], { vacio: true }] : fotos;

  // Pone una diapositiva en una cara (img = imgA o imgB). Si es el vacío, en
  // vez de una foto se muestra el mensaje; si es una foto, se asegura de
  // que la cara B vuelva a mostrar su <img> y no el mensaje.
  function ponerEnCara(img, diapositiva) {
    if (diapositiva.vacio) {
      img.hidden = true;
      vacio.hidden = false;
      return;
    }
    img.hidden = false;
    if (img === imgB && vacio) vacio.hidden = true;
    img.src = diapositiva.src;
    img.alt = diapositiva.alt;
  }

  // Deja las 2 caras con las primeras 2 diapositivas (si solo hay 1 foto y
  // no hay cara de vacío, Math.min hace que las 2 arranquen con esa misma).
  ponerEnCara(imgA, diapositivas[0]);
  ponerEnCara(imgB, diapositivas[Math.min(1, diapositivas.length - 1)]);

  // Índice de la foto que se ve ahora mismo (arranca en 0: la que se
  // acaba de poner en la cara A).
  let indiceVisible = 0;

  // Cuál de las 2 caras NO se ve en este momento. Arranca en 'b' porque
  // así la dejamos recién: cara A al frente (0°, su rotación por
  // defecto) con la foto 0, cara B escondida (pre-girada 180° en el CSS)
  // con la foto 1 (o la 0 repetida, si no hay una 2da foto real).
  let caraOculta = 'b';

  // Ángulo acumulado de la tarjeta. Nunca "vuelve" a 0 al llegar a 360:
  // se lo deja seguir sumando (o restando) para que el giro visual
  // siempre continúe para el mismo lado en el que se lo empujó, sin
  // saltos raros hacia atrás.
  let angulo = 0;

  // El contador cuenta solo fotos reales (fotos.length): con el mensaje de
  // "sin más capturas" a la vista dice eso mismo, en vez de "Foto 2 de 1".
  // El mensaje también queda oculto para lectores de pantalla mientras está
  // en la cara de atrás: se lee solo cuando de verdad se ve.
  function actualizarContador() {
    const seVeElVacio = diapositivas[indiceVisible].vacio === true;
    contador.textContent = seVeElVacio
      ? 'Sin más capturas'
      : `Foto ${indiceVisible + 1} de ${fotos.length}`;
    if (vacio) vacio.setAttribute('aria-hidden', String(!seVeElVacio));
  }
  actualizarContador();

  // direccion: 1 para "foto siguiente", -1 para "foto anterior".
  function girar(direccion) {
    const total = diapositivas.length;

    // Calculamos qué diapositiva va a mostrarse ahora, en base a la que se
    // ve hoy (no a lo que se venía preparando de antes): así el carrusel
    // responde bien aunque el click cambie de dirección respecto del
    // anterior (ej: "siguiente" y después "anterior" seguidos).
    const nuevoIndice = direccion > 0
      ? (indiceVisible + 1) % total
      : (indiceVisible - 1 + total) % total;

    // La cargamos en la cara que en este momento está escondida: como no
    // se ve, este cambio es invisible hasta que la tarjeta gire.
    const imgDestino = caraOculta === 'a' ? imgA : imgB;
    ponerEnCara(imgDestino, diapositivas[nuevoIndice]);

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
