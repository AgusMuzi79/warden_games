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
// foto real (como en producto.html), las 2 caras terminan mostrando la
// misma — no hay una 2da foto real para poner ahí, pero el carrusel se
// sigue viendo y las flechas siguen animando el giro igual.
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

  // Deja las 2 caras con las primeras 2 fotos de la lista recibida (si
  // solo hay 1, Math.min hace que las 2 caras arranquen con esa misma).
  imgA.src = fotos[0].src;
  imgA.alt = fotos[0].alt;
  const indiceB = Math.min(1, fotos.length - 1);
  imgB.src = fotos[indiceB].src;
  imgB.alt = fotos[indiceB].alt;

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

  function actualizarContador() {
    contador.textContent = `Foto ${indiceVisible + 1} de ${fotos.length}`;
  }
  actualizarContador();

  // direccion: 1 para "foto siguiente", -1 para "foto anterior".
  function girar(direccion) {
    const total = fotos.length;

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
    imgDestino.src = fotos[nuevoIndice].src;
    imgDestino.alt = fotos[nuevoIndice].alt;

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
