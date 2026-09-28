# Auditoría UX / UI — Warden (TPE2)

- **Proyecto:** Warden, plataforma de mini juegos. TPE2 de Interfaces de Usuario (TUDAI, UNICEN), grupo 24.
- **Sitio publicado:** https://agusmuzi79.github.io/warden_games/tp2/index.html
- **Código auditado:** commit `1a13462` ("Merge origin/main into agus"). Es el mismo commit en `main`, `agus` y `gh-pages`. Los `CLAUDE.md`, `ETAPAS.md` y `DECISIONES.md` de ese commit son idénticos a los que pasó Agus (se compararon ignorando finales de línea CRLF).
- **Fecha:** 28/09/2026. **Entrega:** 30/09/2026 23:59.
- **Todas las rutas son relativas a `tp2/`**, salvo que se indique otra cosa.

---

## 1. Cómo leer este documento

### Estado de la evidencia

Cada hallazgo separa la evidencia en dos etiquetas. Nunca se mezclan en la misma línea.

- **VERIFICADO:** lo probé o lo medí. Hay un número, un resultado de navegador o un conteo, y se indica el método.
- **INFERIDO:** lo deduje leyendo el código, sin ejecutarlo o sin poder reproducir esa condición exacta.

### Severidades

Escala de severidad de Nielsen, más una categoría extra para el enunciado.

- **Enunciado:** riesgo de perder puntos en la corrección de la cátedra.
- **S3 (grave):** bloquea, confunde o viola WCAG 2.2 nivel AA. Una violación AA es S3 como mínimo.
- **S2 (menor):** molesta pero el usuario puede seguir.
- **S1 (cosmético / robustez):** arreglar si sobra tiempo.

### Conflictos con decisiones del proyecto

Cada hallazgo tiene el campo **"Conflicto con decisiones tomadas"**. Se revisó contra las cuatro decisiones que marcó Agus y contra `DECISIONES.md`:

1. El botón "Jugar" del banner aparece solo en hover, a propósito.
2. El banner no tiene botón de pausa visible; se pausa con hover o foco.
3. Solo HTML, CSS y JS vanilla, sin `type="module"`, con tokens `var(--...)` y sin hex sueltos.
4. Orbitron solo en títulos h1-h3 y en el logo.

Ningún código propuesto usa hex sueltos, `rgba()` a mano, `type="module"`, frameworks ni Orbitron.

---

## 2. Método y entorno de prueba

- Lectura completa de los HTML, CSS y JS de `tp2/`, y de `DECISIONES.md`, `ETAPAS.md` y `CLAUDE.md`.
- Render en Chromium headless (Playwright 1.56) servido desde un servidor HTTP local en `127.0.0.1`.
- **Viewports usados:**
  - 320×700 px: mobile chico, criterio de reflow de WCAG.
  - 360×780 px: mobile común. Emulación touch (`has_touch`, `is_mobile`) donde se indica.
  - 1440×900 px: desktop, la grilla de diseño del proyecto.
- **Contraste:** calculado con el script `contraste.py` de la skill de auditoría, a partir de los colores que devolvió `getComputedStyle` en el navegador. Coinciden con los tokens de `css/variables.css`.
- **Bloqueos del entorno:**
  - Dominios bloqueados: la API de la cátedra (`vj.interfaces.jima.com.ar`), `media.rawg.io`, `unpkg.com` (íconos Phosphor) y Google Fonts.
  - Consecuencias en las pruebas:
    - La Home usó los datos de respaldo (`JUEGOS_DE_RESPALDO` y `DESTACADOS_DE_RESPALDO`).
    - Las imágenes de los juegos de terceros no cargaron.
    - Los íconos se ven como cajas vacías.
    - La tipografía cayó a las fuentes de respaldo.
  - Nada de esto cambia los hallazgos, que dependen de layout, comportamiento y colores.
  - Para `producto.html` se interceptó la request a la API y se respondió con un JSON de 1 juego (id 3, "Portal 2", género Puzzle) para poder renderizar la ficha.
- Es una pasada única de un solo evaluador. En promedio cubre alrededor del 35 % de los problemas y no reemplaza un test con usuarios.

---

## 3. Evidencia visual descrita en texto

La versión anterior (PDF) se basó en capturas. Acá está lo que mostraba cada una, para que no haga falta verlas.

### Captura A — Loading en mobile (360 px, a los 0,8 s de cargar)

- **Fondo:** violeta muy oscuro (`--fondo`, `#19042A`) a pantalla completa.
- **Centro:** el logo de Warden (56 px) dentro de un aro de 120 px.
- **Aro:** el fondo es violeta (`--primario-o1`) y el tramo cian (`--acento`, con resplandor) cubre alrededor del 16 % de la circunferencia, empezando arriba.
- **Debajo del aro:** el texto "16%" y, más abajo, la frase "Poniendo a correr a los hámsters…" en lila.
- No se ve nada más: header, main y footer están tapados y con `inert`.

### Captura B — Home en mobile (360 px, a los ~6,3 s)

- **Header:** una sola fila con menú hamburguesa, logo "Warden", lupa, carrito y avatar de invitado (círculo lila).
- **h1:** "Destacados".
- **Banner:**
  - Tiene unos 176 px de alto.
  - La card activa ("The Witcher 3: Wild Hunt") mide 193 px de ancho.
  - Sus etiquetas "DESTACADO" y "GRATIS" arriba a la izquierda: "GRATIS" aparece cortada contra el borde derecho de la card.
  - El nombre, en 22 px, ocupa 2 líneas.
  - La card de Neon Circuit se ve girada a la izquierda.
- **Dots:** 5 barritas, la segunda en cian.
- **Debajo:** el título "Acción", con dos botones de flecha a la derecha y cards de 260 px de ancho que se salen por la derecha (es el scroll horizontal propio de la fila, esperado).

### Captura C — Home en desktop (1440 px, a los ~6,3 s)

- **Header:** logo a la izquierda, buscador tipo píldora centrado con el placeholder "Buscar juegos" y **sin borde visible** contra el header, y avatar a la derecha.
- **h1:** "Destacados".
- **Banner:** coverflow con 3 cards visibles.
  - A la izquierda, Neon Circuit girada en 3D (se ve el logo "NEON CIRCUIT" y el tablero en cruz).
  - Al centro, la card activa "The Witcher 3: Wild Hunt" con las etiquetas "DESTACADO" y "GRATIS".
  - A la derecha, otra card girada.
- **Dots:** 5 barritas; las inactivas se distinguen poco del fondo y la segunda está en cian.
- **Debajo:** la fila "Acción" con cards de 260 px.

### Captura D — Home en mobile (320 px, a los ~5,6 s)

- La página tiene scroll horizontal: el documento mide 368 px de ancho para un viewport de 320 px.
- Lo que sobresale es la parte baja del footer: el bloque newsletter y el bloque empresa.
- Detalle en T06.

---

## 4. Cumplimiento del enunciado

- **Punto 1a — Home interactiva, abrir Peg Solitaire:** parcial. Se puede, pero el único acceso a `juego.html` desde la Home queda visible muy poco tiempo (T04).
- **Punto 1b — Animación en registro correcto:** cumple. El bloque `#registerSuccess` aparece con `@keyframes auth-success-pop` y tiene `role="status"` (`login.html:120`, `css/login.css`).
- **Punto 2 — Tres animaciones hover distintas en botones:** riesgo. En el DS hay 4, pero en las páginas solo se usan 2 (T01).
- **Punto 3 — Loading de 5 s con % y animación, sin GIF:** cumple.
  - El aro SVG muestra progreso real, hay un contador de 0 a 100 % y el logo late con `@keyframes latido`.
  - Mejora de robustez opcional en T14.
- **Punto 4 — Galería con transición animada:** cumple. Flip 3D en `juego.html` con 6 fotos (`js/galeria.js`).
- **Punto 5 — Datos reales, títulos variados, imágenes distintas, API:** cumple. Usa la API de la cátedra, con respaldo de juegos reales de largos distintos (de "Limbo" a "Counter-Strike: Global Offensive").
- **Punto 6 — Mobile first en la Home:** parcial. Las media queries son `min-width` (bien), pero hay scroll horizontal y contenido recortado en mobile (T06 y T13).

---

## 5. Correcciones respecto de la versión anterior (PDF)

1. **Sin reglas CSS para `[hidden]`.** El PDF decía que hacía falta `.game-card[hidden] { display: none; }` porque `display: flex` le ganaba al atributo. Es falso: `css/base.css:12` ya tiene `[hidden] { display: none !important; }`. T03 y T12 ya no incluyen esa regla.
2. **T04 y T07 reescritas** para respetar las decisiones "Jugar solo en hover" y "sin botón de pausa". La solución anterior (play siempre visible y botón de pausa) contradecía las dos.
3. **T04 ya no toca `loading.js`.** Así se respeta la decisión "El fetch de datos no depende del loading simulado", que mantiene cada archivo con una sola responsabilidad.
4. **T13 (badge cortado) sube de S2 a S3.** A 320 px se pierde información (el precio o "Gratis"), y eso viola WCAG 2.2 SC 1.4.10, nivel AA.
5. **Se agregaron datos verificados que antes eran inferidos:**
   - Línea de tiempo del banner contra el loading (T04).
   - Pausa en touch (T07).
   - Medidas del badge (T13).
   - Galería de producto con la API simulada (T12).
   - Buscar desde `producto.html` (T03).
   - Links del menú (T10).
   - Newsletter (T05).
6. **Se quitó el hallazgo de los `alert()` del registro.** Los checkboxes de captcha y términos son `required`, así que `checkValidity()` corta antes y esas ramas de `js/login.js` nunca se ejecutan: es código muerto, no un problema de UX.

---

## 6. Hallazgos

### T01 — Solo 2 de las 4 animaciones hover de botón se usan en páginas reales

- **Severidad:** Enunciado.
- **Página y viewport:** todas las páginas, cualquier viewport.
- **Archivos / selectores:**
  - `css/components.css` (`.btn--terciario` y `.btn--destructivo`, líneas 36-45 y 85-108).
  - `index.html:116` y `producto.html:96` ("Seguir comprando").
- **Evidencia:**
  - VERIFICADO (grep sobre los 4 HTML y la carpeta `js/`):
    - Hay 26 usos de `class="btn btn--…"`: 10 son `btn--primario` y 16 son `btn--secundario`.
    - `btn--terciario` y `btn--destructivo` tienen 0 usos en `index.html`, `login.html`, `juego.html`, `producto.html` y en `js/`.
    - Los demás botones con hover (`.carrusel__flecha`, `.header__icon-btn`, `.galeria__flecha`, `.compartir__copiar`, `.auth-switch__btn`, `.toggle-pass`) solo cambian color o fondo.
    - El único subrayado animado visible es `.link` en `login.html:98`, que es un link, no un botón.
  - INFERIDO: que la cátedra no cuente los cambios de color como "animación". No se conoce el criterio exacto de la slide 14 de la teórica.
- **Qué pasa hoy:** quien corrige ve dos animaciones distintas en botones:
  - Primario: se eleva con `translateY` y sombra.
  - Secundario: el relleno entra deslizando.

  El enunciado pide al menos 3, y `DECISIONES.md` ("Las 4 animaciones de hover de los botones") afirma que hay 4. Existen en el CSS, pero no en ninguna pantalla.
- **Criterio que se rompe:** Enunciado, punto 2 (al menos 3 animaciones hover distintas en botones; el menú hamburguesa no cuenta).
- **Conflicto con decisiones tomadas:** ninguno.
  - Refuerza la decisión documentada: hace que las animaciones del DS se vean en el sitio.
  - No suma variantes de botón nuevas, que era la corrección del TPE1 ("demasiados botones distintos").
- **Solución propuesta:** usar la variante terciaria, que ya existe, en la acción de menor prioridad del carrito. Es la acción que menos compite con "Pagar carrito". Reemplazar la línea en `index.html:116` y `producto.html:96`:

```html
<a href="#" class="btn btn--terciario">Seguir comprando</a>
```

  Opcional, para mostrar también la cuarta (destructivo): hoy no hay ninguna acción destructiva en el sitio. No se recomienda inventar una solo para mostrar el hover. Si se agregara, por ejemplo, "Vaciar carrito", necesitaría confirmación o deshacer (Nielsen #3).
- **Cómo verificar:**
  1. Abrir `index.html`, esperar el loading y agregar un juego de pago al carrito.
  2. Abrir el carrito y pasar el mouse sobre "Seguir comprando": aparece un subrayado que crece de izquierda a derecha.
  3. Repetir en `producto.html?id=<id>`.
  4. Ejecutar `grep -c "btn--terciario" tp2/index.html tp2/producto.html`: tiene que dar al menos 1 en cada archivo.
  5. Actualizar en `DECISIONES.md` la entrada "Las 4 animaciones de hover de los botones" indicando dónde se ve cada una.

---

### T02 — Texto de los botones primarios con contraste 3,62:1

- **Severidad:** S3.
- **Página y viewport:** Home (Pagar carrito, Confirmar compra), Login (Registrarse, Ingresar), Juego (Jugar, Publicar), Producto (acción de portada, Pagar carrito, Confirmar compra). Cualquier viewport.
- **Archivos / selectores:** `css/components.css:33-35`, `.btn--primario` y `.btn--primario:active`.
- **Evidencia:**
  - VERIFICADO:
    - `getComputedStyle(#btn-pagar-carrito)` devuelve color `rgb(236, 219, 250)` (`--primario-c3`) y fondo `rgb(155, 75, 221)` (`--primario`).
    - Contraste calculado: **3,62:1**.
    - El texto es de 16 px, peso 500 (`.btn` en `css/components.css:22`), así que el mínimo es 4,5:1.
    - La combinación invertida tampoco alcanza: `--fondo` sobre `--primario` da 4,07:1.
  - INFERIDO: ninguno.
- **Qué pasa hoy:** el texto claro sobre el violeta medio queda por debajo del mínimo AA en todos los botones primarios del sitio, en reposo. El hover (`--fondo` sobre `--primario-c1`) da 8,98:1 y está bien.
- **Criterio que se rompe:** WCAG 2.2 SC 1.4.3 Contraste (mínimo), nivel AA.
- **Conflicto con decisiones tomadas:** ninguno. Solo usa tokens existentes y no cambia la animación de elevación.
- **Solución propuesta:** reemplazar las reglas de reposo y `:active` de `.btn--primario` en `css/components.css`. El hover queda igual.

```css
/* Primario: se eleva y tira sombra al pasar el mouse (animación 1).
   Fondo --primario-o1 en reposo: con --primario-c3 da 6,17:1 (el --primario
   anterior daba 3,62:1 y no llegaba al 4,5:1 de WCAG 1.4.3). */
.btn--primario            { background: var(--primario-o1); color: var(--primario-c3); }
.btn--primario:hover      { background: var(--primario-c1); color: var(--fondo); transform: translateY(-3px); box-shadow: 0 6px 14px var(--sombra-elevacion); }
.btn--primario:active     { background: var(--primario-o1); filter: brightness(0.85); transform: translateY(0) scale(0.98); box-shadow: none; }
```

- **Cómo verificar:**
  1. En DevTools, inspeccionar "Pagar carrito" (Home, panel del carrito) e "Ingresar" (Login): el panel de contraste del selector de color tiene que marcar 6,17:1 (AA ✓).
  2. Pasar el mouse: el botón se eleva y pasa a lila claro con texto oscuro, igual que antes.
  3. Hacer clic sostenido: se oscurece un poco (el `filter`) y se achica.

---

### T03 — Buscar con Enter recarga la página: en la Home repite el loading y en producto pierde el juego

- **Severidad:** S3.
- **Página y viewport:** `index.html` y `producto.html`, cualquier viewport. En mobile, primero hay que abrir el buscador con la lupa.
- **Archivos / selectores / funciones:**
  - `index.html:93` y `producto.html:73` (`<form class="header__search" role="search" action="#">`).
  - `js/buscador.js`.
  - `js/home.js` (`renderizarFilas`).
- **Evidencia:**
  - VERIFICADO (1440 px):
    - **Home:** escribir "portal" en `#buscar` y apretar Enter. La URL pasa a `index.html?q=portal#`, la página se recarga y el overlay `#loading` vuelve a estar visible durante 5 s. Después no hay ningún filtro ni resultado.
    - **Producto** (con la API simulada, `producto.html?id=3`): escribir "portal" y apretar Enter. La URL pasa a `producto.html?q=portal#`. Se pierde el parámetro `id` y el `<h1>` muestra "No encontramos este juego".
    - Ningún JS escucha el `submit` de `.header__search` (grep en `js/`).
  - INFERIDO: ninguno.
- **Qué pasa hoy:** el buscador es un control visible en todas las páginas con header, pero buscar no busca nada. En la Home cuesta 5 s de espera. En producto, además, rompe la página que estabas viendo.
- **Criterio que se rompe:**
  - Nielsen #1 Visibilidad del estado del sistema: no hay resultados ni feedback.
  - Nielsen #3 Control y libertad del usuario: la acción destruye el contexto (el juego abierto en producto).
  - Nielsen #9 Ayudar a reconocer y recuperarse de errores: en producto aparece "No encontramos este juego" sin relación con lo que hizo el usuario.
- **Conflicto con decisiones tomadas:** ninguno.
  - Respeta "En mobile el buscador se esconde tras una lupa" (la lupa se mantiene igual).
  - Respeta "sin `aria-controls` en la lupa".
  - Respeta "El logo de la Home sube al inicio en vez de recargar": mismo criterio de evitar recargas que repitan el loading.
- **Solución propuesta:** filtrar en el lugar en la Home. Desde otras páginas, ir a la Home con `?q=`.

**1) Reemplazar `js/buscador.js` completo:**

```js
// buscador.js — Buscador del header: la lupa de mobile (abre/cierra el
// buscador) y la búsqueda de juegos por nombre.
//
// La lupa solo hace algo en mobile: desde tablet el buscador ya se ve
// siempre y el botón de la lupa está oculto por CSS (header.css).
// A propósito no usa aria-controls: menu.js engancha cualquier botón que
// tenga aria-controls + aria-expanded, y cierra sus paneles al clickear en
// cualquier lado — eso cerraría el buscador al tocar el input para escribir.
//
// Buscar: en la Home filtra las filas ya armadas, sin recargar (una recarga
// volvería a mostrar el loading de 5 segundos). En cualquier otra página
// (producto.html) lleva a la Home con ?q=..., y home.js aplica el filtro
// cuando termina de armar las filas.

// Global a propósito (los scripts no usan type="module"): home.js la llama
// al terminar de armar las filas si la URL trae ?q=.
function filtrarJuegos(consulta) {
  const texto = consulta.trim();
  const q = texto.toLowerCase();
  // Un mismo juego puede estar en varias filas (ej. Acción y RPG): se
  // cuentan nombres distintos, no cards, para que el número tenga sentido.
  const encontrados = new Set();

  document.querySelectorAll('#filas-juegos .carrusel').forEach((fila) => {
    let visiblesEnLaFila = 0;

    fila.querySelectorAll('.game-card').forEach((card) => {
      const nombre = card.querySelector('.game-card__title').textContent;
      const coincide = q === '' || nombre.toLowerCase().includes(q);
      card.hidden = !coincide;
      if (coincide) {
        visiblesEnLaFila += 1;
        encontrados.add(nombre);
      }
    });

    fila.hidden = visiblesEnLaFila === 0;

    // La fila cambió de ancho: vuelve al principio y avisa a
    // carrusel-fila.js (que escucha "scroll") para que actualice qué
    // flechas quedan habilitadas.
    const pista = fila.querySelector('.carrusel__pista');
    if (pista) {
      pista.scrollLeft = 0;
      pista.dispatchEvent(new Event('scroll'));
    }
  });

  const estado = document.getElementById('busqueda-estado');
  if (!estado) return;

  if (q === '') {
    estado.textContent = '';
  } else if (encontrados.size > 0) {
    const palabra = encontrados.size === 1 ? 'juego' : 'juegos';
    estado.textContent = `${encontrados.size} ${palabra} para “${texto}”`;
  } else {
    estado.textContent = `No encontramos juegos para “${texto}”. Probá con otro nombre.`;
  }
}

const botonLupa = document.querySelector('.header__search-toggle');
const buscador = document.querySelector('.header__search');

if (botonLupa && buscador) {
  const inputBuscador = buscador.querySelector('input');

  function abrirBuscador() {
    buscador.classList.add('header__search--abierto');
    botonLupa.setAttribute('aria-expanded', 'true');
    inputBuscador.focus();
  }

  function cerrarBuscador() {
    buscador.classList.remove('header__search--abierto');
    botonLupa.setAttribute('aria-expanded', 'false');
  }

  botonLupa.addEventListener('click', () => {
    const estaAbierto = botonLupa.getAttribute('aria-expanded') === 'true';
    if (estaAbierto) {
      cerrarBuscador();
    } else {
      abrirBuscador();
    }
  });

  // Escape lo cierra y devuelve el foco a la lupa (mismo criterio que menu.js).
  buscador.addEventListener('keydown', (evento) => {
    if (evento.key !== 'Escape') return;
    cerrarBuscador();
    botonLupa.focus();
  });
}

if (buscador) {
  const inputBusqueda = buscador.querySelector('input');
  const estamosEnLaHome = () => document.getElementById('filas-juegos') !== null;

  buscador.addEventListener('submit', (evento) => {
    // Sin esto, el form (action="#") recarga la página: en la Home vuelve el
    // loading de 5 s, y en producto.html se pierde el ?id= del juego.
    evento.preventDefault();

    if (!estamosEnLaHome()) {
      window.location.href = `index.html?q=${encodeURIComponent(inputBusqueda.value.trim())}`;
      return;
    }

    filtrarJuegos(inputBusqueda.value);
  });

  // Borrar el texto (la "x" nativa del input type="search", o dejarlo vacío)
  // vuelve a mostrar todas las filas.
  inputBusqueda.addEventListener('search', () => {
    if (inputBusqueda.value === '' && estamosEnLaHome()) filtrarJuegos('');
  });
}
```

**2) `index.html`:** agregar el mensaje de estado justo antes de `<div id="filas-juegos"></div>`, dentro de `<main>`.

```html
    <!-- Resultado de la búsqueda del header (buscador.js). role="status":
         el lector de pantalla lo anuncia sin mover el foco. Vacío = oculto. -->
    <p id="busqueda-estado" class="busqueda-estado" role="status"></p>
```

**3) `js/home.js`:** agregar al final de la función `renderizarFilas(juegos)`, después de `renderizarCategorias(juegos);`.

```js
  // Búsqueda hecha desde otra página: buscador.js lleva a index.html?q=...
  // Las filas recién existen acá (después del fetch), por eso el filtro se
  // aplica al final y no al cargar la página.
  const consultaInicial = new URLSearchParams(window.location.search).get('q');
  if (consultaInicial && typeof filtrarJuegos === 'function') {
    document.getElementById('buscar').value = consultaInicial;
    filtrarJuegos(consultaInicial);
  }
```

**4) `css/home.css`:** agregar al final. No hace falta ninguna regla para `[hidden]`, porque `css/base.css:12` ya la tiene global.

```css
/* Resultado de la búsqueda del header (buscador.js). Vacío no ocupa lugar. */
.busqueda-estado {
  margin: var(--espaciado-8) 0 0;
  color: var(--primario-c3);
}

.busqueda-estado:empty {
  display: none;
}
```

- **Cómo verificar:**
  1. Home a 1440 px, después del loading: escribir "portal" y apretar Enter.
     - La URL no cambia y el loading no vuelve a aparecer.
     - Solo quedan las filas que tienen Portal 2 (Shooters y Puzzle con los datos de respaldo).
     - Aparece "1 juego para “portal”".
  2. Escribir "zzz" y apretar Enter: todas las filas desaparecen y aparece "No encontramos juegos para “zzz”. Probá con otro nombre."
  3. Borrar el texto con la "x" del input: vuelven todas las filas y el mensaje desaparece.
  4. En `producto.html?id=<id>`, buscar "witcher" y apretar Enter: lleva a `index.html?q=witcher`, pasa el loading y la Home aparece ya filtrada, con "witcher" escrito en el buscador.
  5. A 360 px: abrir la lupa, buscar, y confirmar lo mismo.
  6. La consola no muestra errores (ojo con nombres de `const` repetidos entre scripts).

---

### T04 — El acceso al juego desde la Home se ve menos de 1 segundo y en touch no se ve nunca

- **Severidad:** S3.
- **Página y viewport:** `index.html`. Desktop a 1440 px (problema de tiempo) y mobile touch a 360 px (problema de visibilidad).
- **Archivos / selectores / funciones:**
  - `js/carousel.js`: `renderizarBanner()` llama a `iniciarAutoplay()` apenas responde la API.
  - `css/home.css:147-165`: `.banner__jugar` con `opacity: 0`, que pasa a 1 solo con `:hover` o `:focus-visible`.
- **Evidencia:**
  - VERIFICADO (1440 px, `MutationObserver` sobre el atributo `hidden` de `#loading` y sobre `aria-current` de los dots, tiempos desde que empieza la navegación):
    - El overlay se oculta a los **5644 ms**.
    - El banner pasa al destacado 2 a los **6387 ms**.
    - Neon Circuit, el destacado 1 y el único que lleva a `juego.html`, queda de frente **743 ms** después de que termina el loading.
    - El siguiente cambio fue a los 12387 ms: el ciclo es de 6 s por destacado, así que Neon Circuit vuelve a estar de frente recién unos 30 s después.
  - VERIFICADO (1440 px): con Neon Circuit activo y el puntero fuera del banner, `getComputedStyle(.banner__jugar)` da `opacity: 0` y `visibility: visible`. El botón existe y se puede clickear, pero no se ve.
  - VERIFICADO (360 px, emulación touch): `matchMedia('(hover: none)').matches` da `true`. En ese contexto `:hover` no se activa de forma estable.
  - VERIFICADO (grep): el único enlace a `juego.html` en la Home es el `href` que arma `js/carousel.js` para la card de Neon Circuit. `index.html` no tiene ningún link a esa página; las otras menciones en `js/` (`juego.js`, `galeria.js`, `producto.js`) son comentarios.
  - INFERIDO: en un dispositivo touch real, el ícono de play no se ve nunca. Tocar la card igual lleva al juego porque el link cubre toda la card (`inset: 0`), pero nada lo comunica.
- **Qué pasa hoy:**
  - El autoplay corre detrás del overlay de carga, así que cuando el usuario empieza a ver la Home, el banner ya está por pasar a otro juego.
  - En touch, además, la card de Neon Circuit no muestra ninguna acción.
  - Es el flujo que pide el punto 1a del enunciado: desde la Home, abrir la página de ejecución del juego.
- **Criterio que se rompe:**
  - Nielsen #6 Reconocimiento antes que recuerdo: la acción no está a la vista cuando se la necesita.
  - Nielsen #1 Visibilidad del estado del sistema.
  - Enunciado, punto 1a.
- **Conflicto con decisiones tomadas:**
  - **Sí, con "El botón Jugar del banner aparece solo en hover, a propósito"** (`DECISIONES.md`, "Neon Circuit es clickeable: botón Jugar que aparece en hover"). **La solución de abajo la respeta:** en dispositivos con hover (desktop) el botón sigue apareciendo solo con hover o foco. Solo cambia en dispositivos sin hover, donde hoy la decisión no puede cumplirse porque no existe el hover. Documentar esa excepción en `DECISIONES.md`.
  - **Tensión menor con "El fetch de datos no depende del loading simulado".** `loading.js` no se toca. `carousel.js` pasa a leer el atributo `hidden` del overlay `#loading`, igual que ya lee `#banner`. Si se prefiere no acoplarlos, la alternativa es aceptar el problema de tiempo y aplicar solo la parte CSS.
  - La versión anterior proponía mostrar el play siempre; queda descartada por contradecir la decisión.
- **Solución propuesta:**

**1) `css/home.css`:** agregar después de la regla `.banner__slide--activo:hover .banner__jugar, .banner__jugar:focus-visible { opacity: 1; }`.

```css
/* Dispositivos sin hover (touch): el botón "Jugar" no puede depender del
   hover porque ahí el hover no existe. Se muestra fijo en la card activa.
   Con mouse sigue la decisión original: aparece solo con hover o foco. */
@media (hover: none) {
  .banner__slide--activo .banner__jugar {
    opacity: 1;
  }
}
```

**2) `js/carousel.js`:** agregar esta función antes de `renderizarBanner()`.

```js
// El autoplay arranca recién cuando termina el loading simulado de la Home.
// Si arrancara apenas responde la API (antes que el loading), el primer
// destacado (Neon Circuit, nuestro juego) pasaría detrás del overlay y el
// usuario lo vería menos de un segundo. No se toca loading.js: acá solo se
// observa el atributo hidden del overlay, igual que este archivo ya depende
// de #banner.
function iniciarAutoplayDespuesDeLaCarga() {
  const overlayCarga = document.getElementById('loading');

  if (!overlayCarga || overlayCarga.hidden) {
    iniciarAutoplay();
    return;
  }

  const observador = new MutationObserver(() => {
    if (overlayCarga.hidden) {
      observador.disconnect();
      iniciarAutoplay();
    }
  });
  observador.observe(overlayCarga, { attributes: true, attributeFilter: ['hidden'] });
}
```

**3) `js/carousel.js`:** dentro de `renderizarBanner(juegos)`, reemplazar la última línea `iniciarAutoplay();` por:

```js
  iniciarAutoplayDespuesDeLaCarga();
```

- **Cómo verificar:**
  1. Desktop a 1440 px: recargar la Home y cronometrar. Cuando desaparece el loading, la card de frente es Neon Circuit y se queda así unos 6 s antes de pasar a la siguiente.
  2. En la consola, antes de que termine el loading, confirmar que `document.querySelector('.banner__dot[aria-current="true"]')` sigue siendo el primer dot.
  3. Desktop: con el mouse fuera del banner, el play no se ve. Con el mouse sobre la card de Neon Circuit, aparece (decisión original intacta).
  4. DevTools con emulación de dispositivo touch (por ejemplo iPhone o Pixel) a 360 px: con Neon Circuit activa, el círculo de play se ve sin tocar nada. Tocarlo lleva a `juego.html`.
  5. Actualizar en `DECISIONES.md` la entrada "Neon Circuit es clickeable" con la excepción para `hover: none`.

---

### T05 — Suscribirse al newsletter saca al usuario del sitio a una página de error

- **Severidad:** S3.
- **Página y viewport:** footer de `index.html`, `producto.html` y `juego.html`, cualquier viewport.
- **Archivos / selectores:** `<form class="newsletter__form" action="#" method="post" novalidate>` en el footer de las 3 páginas. No hay ningún JS para el form.
- **Evidencia:**
  - VERIFICADO (1440 px, servidor local): con el mail `test@ejemplo.com`, clic en "Suscribirse". El navegador navega a `index.html#` con un POST y el servidor responde **501**. El usuario queda en una página de error, fuera de la Home.
  - VERIFICADO (grep): `newsletter` tiene 0 apariciones en `js/`, así que nada intercepta el submit.
  - INFERIDO: en GitHub Pages (el sitio publicado) la respuesta a un POST es **405 Method Not Allowed**, porque es hosting estático. No se probó contra el sitio publicado, pero el resultado para el usuario es el mismo: una página de error.
  - INFERIDO: con `novalidate`, un mail mal escrito también se envía sin aviso.
- **Qué pasa hoy:** el usuario completa una acción legítima y termina en un error del servidor, sin forma de saber si se suscribió.
- **Criterio que se rompe:**
  - Nielsen #9 Ayudar a reconocer, diagnosticar y recuperarse de errores.
  - Nielsen #1 Visibilidad del estado del sistema: no hay confirmación.
  - Nielsen #5 Prevención de errores: no hay validación.
- **Conflicto con decisiones tomadas:** ninguno. "Botón de newsletter unificado a `.btn`" no cambia. Sigue la regla de `CLAUDE.md` de un archivo JS por responsabilidad.
- **Solución propuesta:**

**1) Crear `js/footer.js`:**

```js
// footer.js — Comportamiento del footer (compartido por index.html,
// producto.html y juego.html).
//
// Newsletter simulado: no hay backend, y GitHub Pages no acepta POST (un
// submit real terminaría en una página de error). Se valida el mail con la
// validación nativa del navegador y se confirma en el mismo lugar, sin
// navegar.

const formNewsletter = document.querySelector('.newsletter__form');

if (formNewsletter) {
  formNewsletter.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const inputMail = formNewsletter.querySelector('input[type="email"]');

    // El form tiene novalidate (para que no salte la burbuja nativa sola al
    // apretar Enter en otro campo), así que la validación se pide a mano.
    if (!inputMail.checkValidity()) {
      inputMail.reportValidity();
      return;
    }

    // role="status": el lector de pantalla anuncia la confirmación sin mover
    // el foco. Hereda el color de los <p> del footer (footer.css).
    const confirmacion = document.createElement('p');
    confirmacion.className = 'newsletter__ok';
    confirmacion.setAttribute('role', 'status');
    confirmacion.textContent = `Listo, te vamos a escribir a ${inputMail.value}.`;

    formNewsletter.replaceWith(confirmacion);
  });
}
```

**2)** En `index.html`, `producto.html` y `juego.html`, sacar `method="post"` del form del newsletter:

```html
<form class="newsletter__form" action="#" novalidate>
```

**3)** En las mismas 3 páginas, agregar como último script (después del último `<script ... defer>` que ya existe):

```html
  <script src="./js/footer.js" defer></script>
```

- **Cómo verificar:**
  1. En cada una de las 3 páginas, con el campo vacío: clic en "Suscribirse" muestra la burbuja nativa de campo requerido y la URL no cambia.
  2. Con "hola": burbuja nativa de mail inválido.
  3. Con "test@ejemplo.com": el form se reemplaza por "Listo, te vamos a escribir a test@ejemplo.com." La URL y la pestaña de red no muestran ninguna navegación.
  4. En el sitio publicado, repetir el paso 3 y confirmar que no aparece ninguna página 405.

---

### T06 — Scroll horizontal en mobile: el documento mide 368 px en viewports de 320 y 360 px

- **Severidad:** S3.
- **Página y viewport:** `index.html` a 320 y 360 px. Ver la captura D.
- **Archivos / selectores:** `css/footer.css:128` (`.footer__bottom { display: grid; }`) y su media query de `48rem` (`grid-template-columns: 1fr 1fr`).
- **Evidencia:**
  - VERIFICADO: `document.documentElement.scrollWidth` da **368** con `innerWidth` 320, y **368** con `innerWidth` 360.
  - VERIFICADO: los elementos que sobresalen a 320 px (sin contar las filas de juegos, que tienen scroll horizontal propio a propósito) son:
    - `section.newsletter`, de x=20 a x=368.
    - `h2.newsletter__title`, de 20 a 368.
    - `form.newsletter__form`, de 20 a 368.
    - El botón "Suscribirse", de 228 a 368.
    - `section.company`, de 20 a 368.
    - `address`, de 20 a 368.
  - VERIFICADO: el fix propuesto, inyectado en el navegador, deja `scrollWidth` en 320/320 y 360/360.
  - INFERIDO: la causa es el mínimo automático de los ítems de grilla. El track `auto` crece al ancho mínimo del contenido, en este caso el form del newsletter.
  - INFERIDO: `producto.html` y `juego.html` comparten el footer, así que probablemente desborden igual. No se midieron, y el enunciado solo pide mobile para la Home.
- **Qué pasa hoy:** en el ancho de celular más común (360 px) la Home se puede arrastrar 8 px hacia los costados. A 320 px sobran 48 px.
- **Criterio que se rompe:**
  - WCAG 2.2 SC 1.4.10 Reflow, nivel AA.
  - Enunciado, punto 6 (mobile first en la Home).
- **Conflicto con decisiones tomadas:** ninguno. Refuerza "Mobile first solo en la Home" y "Layout mobile first" del footer.
- **Solución propuesta:** en `css/footer.css`, cambiar las columnas de `.footer__bottom` en la regla base y en la media query de `48rem`. El resto de las propiedades de esas reglas queda igual.

```css
/* minmax(0, 1fr) en vez de auto / 1fr: el mínimo automático de un ítem de
   grilla es el ancho de su contenido, y el form del newsletter empujaba la
   columna a 348px, más que la pantalla (scroll horizontal a 320 y 360px). */
.footer__bottom {
  grid-template-columns: minmax(0, 1fr);
}

@media (min-width: 48rem) {
  .footer__bottom {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
```

- **Cómo verificar:**
  1. DevTools con emulación de dispositivo a 320 px, en la Home y después del loading. En la consola, `document.documentElement.scrollWidth === window.innerWidth` tiene que dar `true`.
  2. Repetir a 360 y 768 px, y en `producto.html` y `juego.html`.
  3. A 768 px y más, el newsletter y los datos de empresa siguen en dos columnas iguales.

---

### T07 — En touch el banner avanza solo y no hay forma de pausarlo

- **Severidad:** S3.
- **Página y viewport:** `index.html`, mobile touch a 360 px. En desktop con mouse o teclado la pausa existente funciona.
- **Archivos / selectores / funciones:** `js/carousel.js`, en `programarSiguiente()` e `iniciarAutoplay()` (pausa con `pointerenter` / `focusin`, reanuda con `pointerleave` / `focusout`).
- **Evidencia:**
  - VERIFICADO (360 px, emulación touch): después del loading, con el destacado 1 activo, se tocó el título del banner (`#banner-titulo`, dentro de `#banner`). 6,8 s después el destacado activo era el 2. Tocar el banner no deja el autoplay pausado: en touch `pointerleave` llega enseguida después del toque y vuelve a armar el timer.
  - VERIFICADO: en esa emulación `matchMedia('(hover: hover)').matches` da `false`.
  - INFERIDO: en desktop, la pausa por hover y por foco de teclado funciona (leído en el código, no cronometrado).
  - INFERIDO: si la cátedra acepta la pausa por hover y foco como mecanismo suficiente para el SC 2.2.2 en desktop. Es interpretable.
- **Qué pasa hoy:** el contenido cambia solo cada 6 s, indefinidamente. En desktop se puede pausar con mouse o teclado. En touch no hay ningún mecanismo.
- **Criterio que se rompe:** WCAG 2.2 SC 2.2.2 Pausar, detener, ocultar, nivel A. El contenido que se actualiza solo por más de 5 s tiene que poder pausarse.
- **Conflicto con decisiones tomadas:**
  - **Sí, con "El banner no tiene botón de pausa visible; se pausa con hover o foco"** (`DECISIONES.md`, "Autoplay que se pausa con hover o foco, sin botón de pausa"). **La solución de abajo la respeta:** no agrega ningún botón. En dispositivos sin hover (donde la pausa por hover no puede existir) no arranca el autoplay. Es el mismo criterio que la decisión ya aplica con `prefers-reduced-motion`.
  - La navegación con dots y con tap en las cards laterales sigue igual.
  - La versión anterior proponía un botón de pausa; queda descartada por contradecir la decisión.
- **Solución propuesta:** en `js/carousel.js`.

**1)** Agregar la constante al lado de `const prefiereMovimientoReducido = ...`:

```js
// Solo con puntero que puede hacer hover (mouse, trackpad): ahí existe la
// pausa por hover. En touch no hay hover, así que el autoplay no arranca —
// mismo criterio que ya se usa con prefers-reduced-motion. El usuario igual
// navega con los dots o tocando las cards de los costados.
const puedePausarConHover = window.matchMedia('(hover: hover)').matches;
```

**2)** Reemplazar la función `programarSiguiente()` completa:

```js
// setTimeout que se reprograma solo: pausar es cancelarlo, reanudar es
// armar uno nuevo de cero (sin flag de "pausado" ni ambigüedad de en qué
// punto del ciclo anterior había quedado).
function programarSiguiente() {
  clearTimeout(timerAutoplay);
  if (!puedePausarConHover || prefiereMovimientoReducido || slides.length < 2) return;

  timerAutoplay = setTimeout(siguiente, DURACION_AUTOPLAY_MS);
}
```

**3)** En `DECISIONES.md`, agregar a "Autoplay que se pausa con hover o foco, sin botón de pausa" un punto **"Sin hover (touch): sin autoplay"** con el porqué: en touch la pausa por hover no existe, y sin mecanismo de pausa el autoplay violaría el SC 2.2.2. Como alternativa descartada, anotar el botón de pausa visible, porque contradice esta misma decisión.

- **Cómo verificar:**
  1. DevTools con emulación touch a 360 px: después del loading, esperar 15 s sin tocar nada. El destacado activo no cambia.
  2. Tocar un dot: cambia de destacado y no vuelve a avanzar solo.
  3. Desktop a 1440 px con mouse: el autoplay sigue funcionando y se pausa con hover y con Tab a los dots, igual que antes.
  4. Si se aplicó T04, el autoplay en desktop sigue arrancando recién después del loading (las dos tareas tocan funciones distintas de `carousel.js`).

---

### T08 — El buscador y los dots inactivos no llegan a 3:1 contra el fondo

- **Severidad:** S3.
- **Página y viewport:**
  - Buscador: header de `index.html` y `producto.html`, visible siempre desde 768 px y en mobile al abrir la lupa. Medido a 1440 px.
  - Dots: banner de `index.html`, cualquier viewport.
- **Archivos / selectores:**
  - `css/header.css`: `.header__search input` (`border: 1px solid transparent`).
  - `css/home.css`: `.banner__dot::before` (`background: var(--primario-o1)`).
- **Evidencia:**
  - VERIFICADO (`getComputedStyle` a 1440 px):
    - `#buscar` tiene fondo `rgb(25, 4, 42)` (`--fondo`) y borde `rgba(0, 0, 0, 0)`. Está sobre el header, `rgb(44, 8, 73)` (`--superficie`). El límite del campo tiene **1,13:1**.
    - El `::before` de un dot inactivo es `rgb(115, 30, 184)` (`--primario-o1`), sobre el body `rgb(25, 4, 42)`: **2,39:1**.
    - La captura C lo muestra: la píldora del buscador y las barritas inactivas apenas se distinguen del fondo.
  - VERIFICADO (contraste de los tokens propuestos): `--primario` contra `--superficie` da 3,59:1, y contra `--fondo`, 4,07:1.
  - INFERIDO: ninguno.
- **Qué pasa hoy:** el borde del input, lo que indica que ahí se puede escribir, es invisible. Los dots inactivos, que indican cuántos destacados hay y que también son botones, casi no se ven.
- **Criterio que se rompe:** WCAG 2.2 SC 1.4.11 Contraste no textual, nivel AA (mínimo 3:1 para componentes de interfaz).
- **Conflicto con decisiones tomadas:** ninguno.
  - Mantiene "Dots como barritas finitas (estilo Steam)": solo cambia el color de la barrita.
  - Mantiene "Placeholder Buscar juegos".
- **Solución propuesta:**

**1) `css/header.css`:** reemplazar las reglas del borde del input.

```css
/* Borde visible en reposo: --primario sobre --superficie da 3,59:1
   (WCAG 1.4.11 pide 3:1 para el límite de un campo). Antes era
   transparente (1,13:1). En hover se aclara, como feedback. */
.header__search input {
  border-color: var(--primario);
}

.header__search input:hover {
  border-color: var(--primario-c1);
}
```

  Estas dos reglas pisan solo el color del borde. El resto de `.header__search input` (ancho, alto, padding, fondo, radio y fuente) queda igual. Si se prefiere, cambiar directamente `border: 1px solid transparent;` por `border: 1px solid var(--primario);` dentro de la regla existente, y `border-color: var(--primario-o1);` por `border-color: var(--primario-c1);` en el hover.

**2) `css/home.css`:** en la regla existente `.banner__dot::before`, cambiar solo el fondo.

```css
.banner__dot::before {
  content: "";
  display: block;
  width: 100%;
  height: 4px;
  border-radius: 999px;
  /* --primario sobre --fondo: 4,07:1 (antes --primario-o1, 2,39:1). */
  background: var(--primario);
  transition: background-color 0.2s ease;
}
```

- **Cómo verificar:**
  1. A 1440 px, el buscador del header muestra un borde violeta en reposo. En DevTools, el contraste entre el borde y el fondo del header da 3,59:1.
  2. Los dots inactivos se ven violeta medio; el activo sigue en cian y se distingue claramente.
  3. El hover sobre un dot inactivo sigue aclarando a lila (`--primario-c1`).

---

### T09 — "Pagar carrito" con el carrito vacío no hace nada y no avisa

- **Severidad:** S2.
- **Página y viewport:** `index.html` y `producto.html`, cualquier viewport. Medido a 1440 px.
- **Archivos / selectores / funciones:**
  - `js/compras.js`: `abrirModalPago()` hace `return` en silencio si el carrito está vacío.
  - `js/carrito.js`: `renderizarCarritoHeader()`.
- **Evidencia:**
  - VERIFICADO (1440 px, carrito vacío): se abre el panel del carrito y se hace clic en "Pagar carrito". `#modal-pago.open` sigue en `false` y `#btn-pagar-carrito.disabled` también en `false`. No pasa nada visible.
  - INFERIDO: ninguno.
- **Qué pasa hoy:** el botón primario del panel parece habilitado, pero no responde. El texto "Todavía no agregaste ningún juego." está arriba, pero el botón contradice ese estado.
- **Criterio que se rompe:** Nielsen #1 Visibilidad del estado del sistema.
- **Conflicto con decisiones tomadas:** ninguno. La regla `.btn:disabled` ya existe en `css/components.css`: `--primario-c1` sobre `--primario-o2`, con 7,92:1 y cursor `not-allowed`.
- **Solución propuesta:** en `js/carrito.js`, agregar al final de la función `renderizarCarritoHeader()`, antes de la llave de cierre:

```js
  // Sin juegos no hay nada que pagar: el botón queda deshabilitado (con el
  // estilo .btn:disabled de components.css) en vez de parecer activo y no
  // hacer nada al clickearlo.
  const botonPagarCarrito = document.getElementById('btn-pagar-carrito');
  if (botonPagarCarrito) botonPagarCarrito.disabled = items.length === 0;
```

- **Cómo verificar:**
  1. Con el carrito vacío (en la consola, `localStorage.removeItem('warden-carrito')` y recargar), "Pagar carrito" se ve deshabilitado y el cursor es `not-allowed`.
  2. Agregar un juego de pago: el botón se habilita sin recargar.
  3. Quitar el juego desde el panel: se vuelve a deshabilitar.
  4. Repetir en `producto.html`.

---

### T10 — El menú hamburguesa tiene links que no hacen nada, aunque las filas a las que podrían ir ya existen

- **Severidad:** S2.
- **Página y viewport:** menú hamburguesa de `index.html` y `producto.html`, cualquier viewport. Medido a 1440 px.
- **Archivos / selectores / funciones:**
  - `#menu-principal` en `index.html` y en `producto.html`.
  - `js/home.js` (`crearFila()` genera los ids; `renderizarFilas()`).
- **Evidencia:**
  - VERIFICADO (1440 px): abrir el menú y hacer clic en "Acción". La URL queda en `index.html#` y `scrollY` pasa de 0 a 0. No hay ningún desplazamiento.
  - VERIFICADO: los ids de las filas en el DOM son `fila-acción`, `fila-shooters`, `fila-rpg`, `fila-indie`, `fila-aventura`, `fila-plataformas`, `fila-puzzle` y `fila-estrategia`. Coinciden 1 a 1 con las 8 categorías del menú.
  - INFERIDO: el link "Mis juegos" del menú de cuenta (`index.html#fila-mis-juegos`) no desplaza hasta la fila cuando se entra desde otra página. La fila se crea después del fetch, y el navegador busca el ancla al cargar, cuando todavía no existe. No se probó con una compra hecha.
- **Qué pasa hoy:**
  - 13 links del menú apuntan a `#`: 5 de "Jugar" y 8 de "Categorías".
  - Las 8 categorías tienen un destino real en la Home y no lo usan.
- **Criterio que se rompe:**
  - Nielsen #4 Consistencia y estándares: un link tiene que llevar a algún lado.
  - Enunciado, punto 1: el usuario debe poder interactuar con la Home.
- **Conflicto con decisiones tomadas:** ninguno. Refuerza "Contenido del hamburguesa" y "De 4 a 8 categorías", que ya dicen que son las mismas categorías que arma `home.js`. Últimos, Recientes, Top 100 y Actualizados quedan en `#`, porque no hay datos para esas vistas.
- **Solución propuesta:**

**1)** En `index.html` y `producto.html`, reemplazar las dos `<nav class="menu-dropdown__seccion">` del `#menu-principal` (la sección "Jugar" y la sección "Categorías") por:

```html
        <nav class="menu-dropdown__seccion" aria-labelledby="menu-jugar-titulo">
          <h2 class="menu-dropdown__titulo" id="menu-jugar-titulo">Jugar</h2>
          <ul>
            <li><a href="index.html#banner"><i class="ph ph-star" aria-hidden="true"></i> Destacados</a></li>
            <li><a href="#"><i class="ph ph-sparkle" aria-hidden="true"></i> Últimos</a></li>
            <li><a href="#"><i class="ph ph-clock" aria-hidden="true"></i> Recientes</a></li>
            <li><a href="#"><i class="ph ph-trophy" aria-hidden="true"></i> Top 100</a></li>
            <li><a href="#"><i class="ph ph-arrows-clockwise" aria-hidden="true"></i> Actualizados</a></li>
          </ul>
        </nav>

        <hr class="menu-dropdown__divisor">

        <!-- Cada categoría apunta a su fila de la Home: los ids los arma
             crearFila() en home.js como "fila-" + título en minúscula. -->
        <nav class="menu-dropdown__seccion" aria-labelledby="menu-categorias-titulo">
          <h2 class="menu-dropdown__titulo" id="menu-categorias-titulo">Categorías</h2>
          <ul>
            <li><a href="index.html#fila-acción"><i class="ph ph-lightning" aria-hidden="true"></i> Acción</a></li>
            <li><a href="index.html#fila-shooters"><i class="ph ph-crosshair-simple" aria-hidden="true"></i> Shooters</a></li>
            <li><a href="index.html#fila-rpg"><i class="ph ph-sword" aria-hidden="true"></i> RPG</a></li>
            <li><a href="index.html#fila-indie"><i class="ph ph-palette" aria-hidden="true"></i> Indie</a></li>
            <li><a href="index.html#fila-aventura"><i class="ph ph-compass" aria-hidden="true"></i> Aventura</a></li>
            <li><a href="index.html#fila-plataformas"><i class="ph ph-game-controller" aria-hidden="true"></i> Plataformas</a></li>
            <li><a href="index.html#fila-puzzle"><i class="ph ph-puzzle-piece" aria-hidden="true"></i> Puzzle</a></li>
            <li><a href="index.html#fila-estrategia"><i class="ph ph-brain" aria-hidden="true"></i> Estrategia</a></li>
          </ul>
        </nav>
```

  El `<hr>` entre "Jugar" y "Categorías" ya existe. Si se reemplazan las dos `<nav>` por separado, no hay que duplicarlo.

**2) `js/home.js`:** agregar al final de `renderizarFilas(juegos)`. Si ya se aplicó T03, va a continuación de ese bloque.

```js
  // Anclas a filas (menú hamburguesa "index.html#fila-acción", menú de
  // cuenta "#fila-mis-juegos"): las filas recién existen acá, después del
  // fetch, así que el navegador no las encontró al cargar la página.
  if (window.location.hash) {
    const destino = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    if (destino) destino.scrollIntoView();
  }
```

- **Cómo verificar:**
  1. Home a 1440 px, después del loading: menú hamburguesa, "RPG". La página se desplaza hasta la fila RPG y el título queda visible debajo del header fijo (hay `scroll-padding-top` desde `48rem`).
  2. Desde `producto.html?id=<id>`: menú, "Puzzle". Lleva a la Home, pasa el loading y termina desplazada en la fila Puzzle.
  3. "Destacados" lleva al banner.
  4. A 360 px: lo mismo desde el menú abierto.

---

### T11 — Cada card de juego tiene dos paradas de Tab al mismo destino

- **Severidad:** S2.
- **Página y viewport:** `index.html`, navegación con teclado, cualquier viewport. Medido a 1440 px.
- **Archivos / selectores / funciones:** `js/home.js`, en `crearCard()` y `crearCardComprado()`. `.game-card__media` y `.game-card__texto` son dos `<a>` a la misma URL.
- **Evidencia:**
  - VERIFICADO (1440 px, 14 Tabs desde el principio del documento): la secuencia termina en "Ver Grand Theft Auto V" (imagen), "Grand Theft Auto V" (nombre) y "Ver The Witcher 3: Wild Hunt" (imagen): dos paradas por card.
  - VERIFICADO (datos de respaldo): hay 10 cards en las filas y 20 links adentro.
  - INFERIDO: con la API real (unos 80 juegos, hasta 10 cards por fila y 8 filas) son hasta 80 paradas de Tab redundantes. El lector de pantalla, además, anuncia cada juego dos veces.
- **Qué pasa hoy:** para llegar del banner al footer con teclado hay que pasar dos veces por cada juego.
- **Criterio que se rompe:** Nielsen #7 Flexibilidad y eficiencia de uso.
- **Conflicto con decisiones tomadas:**
  - **Revisa una decisión, sin contradecir su motivo.** `DECISIONES.md` ("Etapa 2: las cards de las filas de la Home enlazan a la ficha") acepta como **"Costo asumido"** las dos paradas de Tab, "por mantener el HTML simple (nada de `position: absolute` ni `z-index`)".
  - La solución mantiene ese HTML simple: solo agrega dos atributos, y el clic en la imagen sigue funcionando.
  - Actualizar la nota "Costo asumido" en `DECISIONES.md`.
- **Solución propuesta:** en `js/home.js`, en `crearCard(juego)`, reemplazar la línea:

```js
  media.setAttribute('aria-label', `Ver ${juego.name}`);
```

por:

```js
  // El link de la imagen es un atajo para mouse y touch: el del nombre
  // (.game-card__texto, más abajo) ya lleva al mismo lugar. Fuera del orden
  // de Tab y oculto para lectores de pantalla, así teclado y lector pasan
  // una sola vez por cada juego.
  media.tabIndex = -1;
  media.setAttribute('aria-hidden', 'true');
```

  En `crearCardComprado(juego)`, reemplazar la línea:

```js
  media.setAttribute('aria-label', `Ver ${juego.nombre}`);
```

  por el mismo bloque de 5 líneas (comentario + `tabIndex` + `aria-hidden`).
- **Cómo verificar:**
  1. Home a 1440 px, después del loading: recorrer con Tab. En cada card, el foco pasa por el nombre y, si es de pago, por el botón de carrito. Nunca por la imagen.
  2. Clic en la imagen de una card: sigue llevando a `producto.html?id=...`.
  3. La consola no muestra errores.

---

### T12 — La galería de producto gira hacia la misma foto ("Foto 1 de 1")

- **Severidad:** S2.
- **Página y viewport:** `producto.html?id=<id>`, desktop (1440 px). El enunciado pide `producto.html` solo en desktop.
- **Archivos / selectores / funciones:**
  - `js/galeria.js`, en `iniciarGaleria(fotos)`.
  - `js/producto.js`, que la llama con un array de 1 foto.
- **Evidencia:**
  - VERIFICADO (1440 px, con la respuesta de la API interceptada: 1 juego, id 3):
    - Antes del clic: el contador dice "Foto 1 de 1" y las dos caras (`#galeria-img-a`, `#galeria-img-b`) tienen el mismo `src`.
    - Después de clic en "Foto siguiente": `--angulo` pasa a `180deg` (la carta gira), el contador sigue en "Foto 1 de 1" y las dos caras tienen el mismo `src`.
    - Las flechas se ven (`display: flex`).
  - INFERIDO: ninguno.
- **Qué pasa hoy:** las flechas prometen otra imagen, la animación se ejecuta y termina mostrando la misma portada.
- **Criterio que se rompe:**
  - Nielsen #1 Visibilidad del estado del sistema.
  - Nielsen #8 Estética y diseño minimalista: un control que no aporta nada.
  - El punto 4 del enunciado **no** depende de esta galería: ya lo cubre `juego.html`, con 6 fotos.
- **Conflicto con decisiones tomadas:**
  - **Sí, contradice una decisión de Fran** (`DECISIONES.md`, "Galería animada en `producto.html`: mismo carrusel, con la portada repetida"). Se le plantearon las opciones (a) carrusel igual, con la portada repetida, y (b) portada fija sin carrusel, y **eligió la (a)** a sabiendas.
  - **Recomendación: no aplicar esta tarea sin charlarlo con Fran.** Si la decisión se mantiene, este hallazgo queda como riesgo aceptado y no hay nada que cambiar.
- **Solución propuesta (opción b, solo si se decide cambiar):** en `js/galeria.js`, dentro de `iniciarGaleria(fotos)`, agregar justo después de la llamada inicial `actualizarContador();`:

```js
  // Con una sola foto no hay nada que navegar: las flechas y el contador
  // se ocultan (quedaría una animación que gira hacia la misma imagen). La
  // galería animada del enunciado es la de juego.html, que tiene 6 fotos.
  if (fotos.length < 2) {
    botonPrev.hidden = true;
    botonNext.hidden = true;
    contador.hidden = true;
    return;
  }
```

  No hace falta CSS extra: `[hidden] { display: none !important; }` ya está en `css/base.css:12`.
- **Cómo verificar (si se aplica):**
  1. En `producto.html?id=<id>` se ve la portada fija, sin flechas ni contador.
  2. En `juego.html`, la galería de Neon Circuit sigue con flechas, contador "Foto 1 de 6" y el giro animado.
  3. Actualizar la entrada correspondiente en `DECISIONES.md` (pasa a la opción b, con el motivo).

---

### T13 — En mobile, las etiquetas del banner quedan cortadas y se pierde el precio

- **Severidad:** S3. Sube desde S2: a 320 px se pierde información, y eso viola AA.
- **Página y viewport:** `index.html`, banner "Destacados", a 320 y 360 px. Ver la captura B.
- **Archivos / selectores:** `css/home.css`, en `.banner__etiquetas` (posición absoluta, sin límite derecho ni `flex-wrap`) y `.banner__nombre` (22 px en todos los viewports). La card activa tiene `overflow: hidden`.
- **Evidencia:**
  - VERIFICADO (320 px, card activa "The Witcher 3: Wild Hunt"):
    - La card va de x=76 a x=244 (169×153 px).
    - `.banner__etiquetas` va de x=92 a x=288: **44 px quedan fuera de la card** y se recortan.
    - Esos 44 px son casi toda la etiqueta "GRATIS" (o el precio "$9.99" en los juegos de pago).
    - El nombre ocupa **86 px de alto** (3 líneas a 22 px), más de la mitad de la card.
  - VERIFICADO (360 px): la card va de 83 a 277 (193×176 px) y las etiquetas de 99 a 295: **18 px recortados**. El nombre mide 57 px (2 líneas). En la captura B se ve "GRATIS" cortada contra el borde derecho.
  - INFERIDO: a 768 px o más la card es lo bastante ancha y no hay recorte. No se midió.
- **Qué pasa hoy:** en celulares, el precio o "Gratis" del destacado activo no se lee completo, y el nombre tapa gran parte de la imagen.
- **Criterio que se rompe:**
  - WCAG 2.2 SC 1.4.10 Reflow, nivel AA: pérdida de contenido a 320 px.
  - Nielsen #1 Visibilidad del estado del sistema: el precio es información de estado de compra.
- **Conflicto con decisiones tomadas:** ninguno.
  - No cambia la ubicación de la entrada "Ubicación: arriba a la izquierda de la imagen (Home) y junto a Destacado (banner)".
  - `.banner__nombre` ya usa `--font-ui`, no Orbitron.
  - Los tamaños de letra van en px porque el proyecto no tiene tokens de tamaño de fuente: `.banner__nombre` ya usa `22px` escrito así, y se sigue esa convención.
- **Solución propuesta:** en `css/home.css`, reemplazar las reglas `.banner__etiquetas` y `.banner__nombre` por las de abajo. Es mobile first: 16 px de base y 22 px desde `48rem`.

```css
/* right + flex-wrap: en mobile la card activa mide 169-193px y
   "DESTACADO" + "GRATIS"/precio no entran en una fila; sin esto la segunda
   etiqueta se recortaba contra el borde (overflow: hidden de la card). */
.banner__etiquetas {
  position: absolute;
  left: var(--espaciado-4);
  right: var(--espaciado-4);
  top: var(--espaciado-4);
  display: flex;
  flex-wrap: wrap;
  gap: var(--espaciado-2);
}

/* Mobile first: 16px de base (a 22px el nombre ocupaba 3 líneas y más de
   la mitad de la card a 320px); 22px desde tablet, como antes. */
.banner__nombre {
  position: absolute;
  left: var(--espaciado-4);
  right: var(--espaciado-4);
  bottom: var(--espaciado-4);
  margin: 0;
  color: var(--primario-c3);
  font: 600 16px/1.3 var(--font-ui);
  text-shadow: 0 2px 8px var(--sombra-elevacion);
}

@media (min-width: 48rem) {
  .banner__nombre {
    font-size: 22px;
  }
}
```

  El `text-shadow` usaba `rgba(0, 0, 0, 0.6)` escrito a mano. Se reemplaza por el token existente `--sombra-elevacion` (`rgba(0, 0, 0, 0.35)`) para cumplir la regla de no escribir colores sueltos. La sombra queda algo más suave. Si se necesita la intensidad original, proponer un token nuevo en `variables.css` en lugar de volver al valor suelto.
- **Cómo verificar:**
  1. DevTools a 320 px, Home, después del loading. Para cada destacado (con los dots), las etiquetas "DESTACADO" y "GRATIS"/precio/"NUEVO" se leen completas: si no entran en una fila, bajan a una segunda.
  2. El nombre ocupa como máximo 2 líneas.
  3. Repetir a 360 px.
  4. A 1440 px el banner se ve igual que antes (nombre a 22 px, etiquetas en una fila).

---

### T14 — El loading puede durar mucho más de 5 segundos si la pestaña está en segundo plano

- **Severidad:** S1.
- **Página y viewport:** `index.html`, cualquier viewport. Solo cuando la Home se abre en una pestaña que no está al frente (por ejemplo, con clic central).
- **Archivos / funciones:** `js/loading.js`. Avanza 1 % por cada tick de `setInterval` cada 50 ms.
- **Evidencia:**
  - VERIFICADO: en primer plano, el overlay se ocultó a los 5644 ms desde el inicio de la navegación (incluye la carga de la página), así que en uso normal cumple.
  - INFERIDO: los navegadores frenan los timers de las pestañas en segundo plano, con ticks de 1 s o más. Como el porcentaje suma 1 por tick y no depende del tiempo real, llegar a 100 podría tardar alrededor de 100 s. No se midió.
- **Qué pasa hoy:** en el caso descrito, el usuario vuelve a la pestaña y el loading sigue por la mitad.
- **Criterio que se rompe:** Enunciado, punto 3 ("loading simulado de 5 segundos"), en un caso borde de robustez.
- **Conflicto con decisiones tomadas:** ninguno.
  - Mantiene "Contador real de 0 a 100 % en 5 segundos" y las frases, que siguen `aria-hidden`.
  - Mantiene "El resto de la página queda `inert` mientras carga".
  - No agrega ninguna comunicación con otros archivos.
- **Solución propuesta:** reemplazar `js/loading.js` completo. El único cambio de comportamiento es que el porcentaje se calcula a partir del tiempo transcurrido.

```js
// loading.js — Simulación de carga en la Home

const overlay = document.getElementById('loading');
const numero = document.getElementById('loading-num');
const anillo = document.getElementById('loading-ring');
const texto = document.getElementById('loading-texto');
const bloqueados = document.querySelectorAll('.header, main, .footer');

bloqueados.forEach((el) => el.setAttribute('inert', ''));

const DURACION_MS = 5000;
const PASOS = 100;
const intervalo = DURACION_MS / PASOS;
const CIRCUNFERENCIA = 2 * Math.PI * 54; // mismo radio que el <circle> de index.html

// Puramente decorativas (aria-hidden en index.html, ver DECISIONES.md): el
// lector de pantalla no las lee, ya tiene su propio anuncio fijo — leer
// esto en voz alta cambiaría de texto demasiadas veces en 5 segundos.
const FRASES = [
  'Poniendo a correr a los hámsters…',
  'Convenciendo a la IA de que trabaje…',
  'Ocultando las microtransacciones…',
];
const FRASE_FINAL = 'Todo listo, a viciar.';

let porcentaje = 0;
let indiceAnterior = -1;

// El % se calcula con el tiempo real transcurrido, no sumando 1 por tick:
// si la pestaña está en segundo plano el navegador frena los timers (ticks
// de 1 segundo o más), y sumando de a 1 el loading podía tardar ~100 s.
// Así siempre termina a los 5 segundos, se vea o no la pestaña.
const inicioCarga = performance.now();

function actualizarFrase() {
  const indice = porcentaje === PASOS ? FRASES.length : Math.floor(porcentaje / (PASOS / FRASES.length));
  if (indice === indiceAnterior) return;
  texto.textContent = porcentaje === PASOS ? FRASE_FINAL : FRASES[indice];
  indiceAnterior = indice;
}

actualizarFrase();

const timer = setInterval(() => {
  const transcurrido = performance.now() - inicioCarga;
  porcentaje = Math.min(PASOS, Math.floor((transcurrido / DURACION_MS) * PASOS));

  numero.textContent = porcentaje;
  anillo.style.strokeDashoffset = CIRCUNFERENCIA * (1 - porcentaje / PASOS);
  actualizarFrase();

  if (porcentaje >= PASOS) {
    clearInterval(timer);
    overlay.hidden = true;
    bloqueados.forEach((el) => el.removeAttribute('inert'));
  }
}, intervalo);
```

- **Cómo verificar:**
  1. En primer plano: el contador va de 0 a 100 en 5 s y el aro se llena de forma pareja, igual que antes.
  2. Abrir `index.html` con clic central (pestaña nueva en segundo plano), esperar 6 s y pasar a esa pestaña: el loading ya terminó, o termina enseguida.
  3. Las tres frases siguen apareciendo en orden, y "Todo listo, a viciar." al final.

---

## 7. Lo que está bien (no romper al aplicar los cambios)

- **Menús del header** (`js/menu.js`):
  - `aria-expanded` actualizado y un solo menú abierto a la vez.
  - Se cierran con Escape (y el foco vuelve al botón que los abrió) y con clic afuera.
  - El `stopPropagation` de `.carrito__quitar` (`js/carrito.js`) es intencional: permite quitar varios ítems sin que se cierre el panel.
- **Foco visible global** (`css/variables.css`): outline de 3 px en `--foco` con 2 px de separación. `--foco` sobre `--fondo` da 16,14:1. Cumple WCAG 2.2 SC 2.4.7 y 2.4.11.
- **Loading accesible:**
  - `inert` sobre header, main y footer mientras carga.
  - Un único anuncio `sr-only` fijo en vez de leer el % en voz alta (SC 4.1.3).
  - El aro muestra progreso real, no es un spinner decorativo.
- **Movimiento reducido:** `prefers-reduced-motion` se respeta en los botones, las cards, el banner (sin autoplay y sin giro), las filas (scroll sin animación), el loading y el modal.
- **Resiliencia y controles:**
  - Hay datos de respaldo reales si falla la API: la Home nunca queda vacía.
  - El modal de pago usa `<dialog>` con `showModal()`, que da trampa de foco y cierre con Escape nativos.
  - Los controles de ícono miden 44×44 px (`--control-alto`) y los dots 28×24 px, que cumplen SC 2.5.8 (mínimo 24×24).
- **Mobile first real:** todas las media queries de la Home son `min-width` (`48rem`) y el header de mobile, con lupa en una sola fila, no desborda.

---

## 8. Límites de esta auditoría (no verificado)

- **Sitio publicado:** comportamiento con los datos e imágenes reales de la API, porque desde el entorno de prueba no se pudo acceder. Tampoco se pudo probar el 405 del newsletter en GitHub Pages (T05).
- **Íconos y fuentes:** aspecto final de los íconos Phosphor y de Orbitron/Roboto Flex, porque los CDN estaban bloqueados.
- **Tecnologías reales:** experiencia con lector de pantalla real (NVDA, VoiceOver) y dispositivos táctiles reales. Todo lo de touch es emulación de Chromium.
- **Página del juego:** la lógica del Peg Solitaire y la corrección de la grilla pedida en el TPE1. La página `juego.html` no se auditó en profundidad.
- **Pendiente documentado:** la excepción "la página del juego se queda sin `h1`" figura en `DECISIONES.md` como pendiente de decidir entre los tres y no se evaluó.
- **Criterio de la cátedra:** qué animaciones hover acepta según la slide 14 de la teórica (T01).
- **Conflicto de principios asumido:** el loading de 5 s en cada entrada a la Home choca con Nielsen #7 y con el umbral de Doherty, pero es requisito del enunciado y manda. Por eso T03 es importante: cada recarga accidental cuesta 5 s.

---

## 9. Resumen

| ID | Severidad | Archivos | Esfuerzo |
|---|---|---|---|
| T01 | Enunciado | `index.html`, `producto.html`, `DECISIONES.md` | S |
| T02 | S3 | `css/components.css` | S |
| T03 | S3 | `js/buscador.js`, `js/home.js`, `index.html`, `css/home.css` | M |
| T04 | S3 | `js/carousel.js`, `css/home.css`, `DECISIONES.md` | S |
| T05 | S3 | `js/footer.js` (nuevo), `index.html`, `producto.html`, `juego.html` | S |
| T06 | S3 | `css/footer.css` | S |
| T07 | S3 | `js/carousel.js`, `DECISIONES.md` | S |
| T08 | S3 | `css/header.css`, `css/home.css` | S |
| T09 | S2 | `js/carrito.js` | S |
| T10 | S2 | `index.html`, `producto.html`, `js/home.js` | S |
| T11 | S2 | `js/home.js`, `DECISIONES.md` | S |
| T12 | S2 (contradice una decisión; charlar con Fran antes) | `js/galeria.js`, `DECISIONES.md` | S |
| T13 | S3 | `css/home.css` | S |
| T14 | S1 | `js/loading.js` | S |

**Totales:** 1 de enunciado, 8 S3, 4 S2, 1 S1.

**Hallazgos que tocan decisiones del proyecto:**
- T04 respeta "Jugar solo en hover" con una excepción en dispositivos sin hover.
- T07 respeta "sin botón de pausa" desactivando el autoplay en touch.
- T11 revisa el "costo asumido" de las dos paradas de Tab.
- T12 contradice la opción que eligió Fran.

**Archivos que tocan varias tareas:**
- `js/home.js`: T03, T10 y T11. T03 y T10 agregan bloques al final de `renderizarFilas()` y no se pisan.
- `js/carousel.js`: T04 y T07, en funciones distintas.
- `css/home.css`: T03, T04, T08 y T13, en reglas distintas.
