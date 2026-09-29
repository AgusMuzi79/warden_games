// galeria.js — Motor de la galería animada (carrusel de flip 3D)
//
// Es genérico y no trae fotos propias. Lo usan juego.html (6 capturas de
// Neon Circuit, desde juego.js) y producto.html (1 sola foto, la portada,
// desde producto.js). Cada página llama a iniciarGaleria(fotos) cuando ya
// tiene su lista.
//
// Depende de estos ids del HTML: galeria-carta, galeria-img-a, galeria-img-b,
// galeria-contador, galeria-prev, galeria-next y, opcional, galeria-vacio.
// Expone una sola función global: iniciarGaleria(fotos). Tiene que cargarse
// antes que el script que la llama.
//
// La animación la hace el CSS (.galeria__carta en components.css): una
// transition sobre transform que sigue la variable --angulo. Acá solo se
// decide, en cada click, qué foto va en la cara escondida y cuántos grados
// se le suman al ángulo para que esa cara pase al frente.

// fotos: array de { src, alt }, con al menos 1 elemento.
// Caso de una sola foto: si la página tiene la cara "sin más capturas"
// (#galeria-vacio), esa cara hace de 2ª diapositiva. Las flechas giran igual,
// pero en vez de repetir la foto se ve un mensaje. Sin esa cara, las 2 caras
// muestran la misma foto.
function iniciarGaleria(fotos) {
  const carta = document.getElementById('galeria-carta');

  // No toda página tiene el HTML de la galería: sin este chequeo tiraría error.
  if (!carta || !fotos || fotos.length === 0) return;

  const imgA = document.getElementById('galeria-img-a');
  const imgB = document.getElementById('galeria-img-b');
  const contador = document.getElementById('galeria-contador');
  const botonPrev = document.getElementById('galeria-prev');
  const botonNext = document.getElementById('galeria-next');
  const vacio = document.getElementById('galeria-vacio');

  // Diapositivas: las fotos reales, más un marcador { vacio: true } como 2ª
  // cuando hay una sola foto y existe la cara de "sin más capturas". El vacío
  // cae siempre en la cara B: con 2 diapositivas y 2 caras que se alternan,
  // la diapositiva 1 va siempre en la B.
  const hayUnaSolaFoto = fotos.length === 1 && vacio !== null;
  const diapositivas = hayUnaSolaFoto ? [fotos[0], { vacio: true }] : fotos;

  // Pone una diapositiva en una cara (img es imgA o imgB). Si es el vacío,
  // esconde la <img> y muestra el mensaje. Si es una foto, se asegura de que
  // la cara B muestre su <img> y no el mensaje.
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

  // Estado inicial: las 2 caras con las 2 primeras diapositivas. Si hay una
  // sola y no hay cara de vacío, Math.min hace que las dos arranquen con la misma.
  ponerEnCara(imgA, diapositivas[0]);
  ponerEnCara(imgB, diapositivas[Math.min(1, diapositivas.length - 1)]);

  // Índice de la diapositiva que se ve ahora (arranca en 0, la de la cara A).
  let indiceVisible = 0;

  // Cuál de las 2 caras no se ve. Arranca en 'b': la A está al frente (0°,
  // su rotación por defecto) y la B está escondida, pre-girada 180° en el CSS.
  let caraOculta = 'b';

  // Ángulo acumulado de la tarjeta. No se resetea a 0 al llegar a 360°: sigue
  // sumando o restando, para que el giro continúe siempre hacia el lado en
  // que se lo empujó. Si volviera a 0, la transition giraría "hacia atrás"
  // una vuelta entera en vez de seguir.
  let angulo = 0;

  // El contador cuenta solo fotos reales (fotos.length): con el mensaje a la
  // vista dice "Sin más capturas" y no "Foto 2 de 1". El mensaje queda
  // aria-hidden mientras está en la cara de atrás, así el lector de pantalla
  // lo lee solo cuando se ve.
  function actualizarContador() {
    const seVeElVacio = diapositivas[indiceVisible].vacio === true;
    contador.textContent = seVeElVacio
      ? 'Sin más capturas'
      : `Foto ${indiceVisible + 1} de ${fotos.length}`;
    if (vacio) vacio.setAttribute('aria-hidden', String(!seVeElVacio));
  }
  actualizarContador();

  // direccion: 1 para "siguiente", -1 para "anterior".
  function girar(direccion) {
    const total = diapositivas.length;

    // La diapositiva nueva se calcula a partir de la que se ve hoy, no de una
    // que se haya precargado antes. Así funciona bien si el click cambia de
    // dirección respecto del anterior (ej: "siguiente" y después "anterior").
    const nuevoIndice = direccion > 0
      ? (indiceVisible + 1) % total
      : (indiceVisible - 1 + total) % total;

    // Se carga en la cara escondida: el cambio de src no se ve hasta que gire.
    const imgDestino = caraOculta === 'a' ? imgA : imgB;
    ponerEnCara(imgDestino, diapositivas[nuevoIndice]);

    // Cambiar --angulo es lo único que dispara la animación: el giro lo hace
    // la transition del CSS.
    angulo += direccion * 180;
    carta.style.setProperty('--angulo', `${angulo}deg`);

    // Después del giro las caras intercambian rol.
    caraOculta = caraOculta === 'a' ? 'b' : 'a';
    indiceVisible = nuevoIndice;
    actualizarContador();
  }

  botonPrev.addEventListener('click', () => girar(-1));
  botonNext.addEventListener('click', () => girar(1));
}
