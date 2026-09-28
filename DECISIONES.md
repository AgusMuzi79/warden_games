# Decisiones de diseño e implementación — Warden (TPE2)

Cada decisión: **qué** hicimos, **por qué**, y qué **alternativa** descartamos.
Este archivo es la base para justificar los patrones de diseño en la defensa.

---

## Organización del proyecto

### Carpeta `tp2/` con un `index.html` en la raíz
- **Qué:** todo el TPE2 vive en `/tp2/`; la raíz tiene un index que lleva ahí.
- **Por qué:** separa cada entrega en el mismo repo. GitHub Pages sirve el `index.html`
  de la raíz, así que sin él el link de entrega daría 404.
- **Descartado:** todo en la raíz (se mezcla con futuras entregas).

### Ramas `main`, `agus`, `fran` y `gh-pages`
- **Qué:** cada uno trabaja en su rama, mergea seguido a `main`, y `gh-pages` se actualiza
  desde `main` solo para publicar.
- **Por qué:** trabajamos a la par sin pisarnos. Mergear seguido mantiene los conflictos chicos.
  El enunciado exige entregar por `gh-pages`.
- **Descartado:** trabajar los dos en `main` (conflictos constantes) y ramas por persona
  mergeadas solo al final (conflictos enormes cerca de la entrega).

### Rutas relativas en todo el sitio
- **Qué:** `css/base.css`, `index.html`, nunca `/css/...` ni `href="/"`.
- **Por qué:** en GitHub Pages el sitio vive en `usuario.github.io/repo/tp2/`;
  una ruta con `/` apunta a la raíz del dominio y se rompe.

---

## Arquitectura de CSS

### CSS en capas, cargadas de lo general a lo específico
- **Qué:** `variables → base → components → header → footer → [página]`.
- **Por qué:** aprovecha la cascada: ante reglas igual de específicas gana la última
  cargada, así lo específico de una página puede ajustar lo general sin `!important`.
- **Descartado:** un solo `styles.css` (difícil de navegar y fuente constante de conflictos en git).

### Design tokens en `variables.css`
- **Qué:** colores, espaciados, radios y fuentes como custom properties en `:root`,
  usadas con `var()`. Ningún valor escrito a mano en el resto del CSS.
- **Por qué:** una sola fuente de verdad. Aplicar las correcciones del TPE1 (paleta,
  tipografía) implica cambiar un valor, no buscar colores por todo el código.
  Mantiene el sitio consistente con el design system de Figma.

### Header y footer en archivos propios
- **Qué:** `header.css` y `footer.css`, separados de `components.css`.
- **Por qué:** no son componentes chicos y reutilizables sino secciones de layout,
  presentes una vez por página. Son grandes (el footer tiene más de 200 líneas) y,
  separados, reducen los conflictos en el archivo que más tocamos.
- **Descartado:** meterlos en `components.css`.

### Convención de nombres BEM
- **Qué:** `.bloque__elemento--variante` (ej: `.header__avatar--invitado`).
- **Por qué:** el nombre dice a qué pertenece cada clase y evita que estilos de una
  sección afecten otra sin querer. Mantiene la especificidad baja y pareja.

### Mobile first solo en la Home
- **Qué:** en la Home, estilos base para mobile y `@media (min-width)` para tablet
  (48rem) y desktop (64rem). Login y juego, solo desktop.
- **Por qué:** lo pide el enunciado. Empezar por mobile obliga a priorizar contenido
  y hace que lo que se agrega en pantallas grandes sea incremental.

---

## Tipografía

### Orbitron solo en títulos
- **Qué:** Orbitron para h1–h3 y logo; Roboto Flex para todo lo demás.
- **Por qué:** corrección del TPE1. Orbitron es decorativa y en textos chicos, labels
  e inputs pierde legibilidad. La reservamos para jerarquía y marca.
- **Antes:** usábamos Orbitron desde 18px, lo que igual la dejaba en demasiados lugares.

### Limpieza de Orbitron fuera de h1-h3 (segunda corrección)
- **Qué:** sacamos Orbitron de `h4` (regla vieja en `base.css` lo incluía), de `.t-label`
  (`variables.css`) y de `.sponsors__list a` (`footer.css`) — pasan a `--font-ui`.
- **Por qué:** quedaron de la regla anterior ("Orbitron desde 18px") y el profesor marcó
  de nuevo "demasiado uso de la fuente futurista". `.t-label` y `h4` no se usan todavía
  en ninguna página, pero como son parte del design system los corregimos antes de que
  alguien los use mal. `.sponsors__list a` son links de marcas dentro de una lista, no
  títulos: no entran en la excepción de h1-h3.
- **Se mantiene igual:** `.footer__label` y `.newsletter__title` siguen en Orbitron
  porque son `h2` en el HTML (entran en la regla), aunque se vean como labels chicos.
  Decisión explícita: para el profesor pesa más que sean headings reales que cómo se ven.

### Tildes y voseo
- **Qué:** corregimos textos de Figma sin tilde ("Últimos", "Documentación", "Botón", "menú").
- **Por qué:** consistencia y corrección del contenido; el diseño se actualizó igual.

---

## Accesibilidad (transversal)

### Foco visible global
- **Qué:** `:where(a, button, input, select, textarea, [tabindex]):focus-visible` con
  outline de color `--foco`.
- **Por qué:** quien navega con teclado siempre ve dónde está. `:focus-visible` evita
  que aparezca al hacer click con el mouse. `:where()` tiene especificidad 0, así que
  cualquier componente lo puede ajustar sin pelear.

### Área táctil de 44px en controles de ícono
- **Qué:** hamburguesa, carrito, redes: el ícono mide 24px pero el control 44px.
- **Por qué:** objetivos más grandes son más fáciles de tocar (ley de Fitts), sobre todo
  en mobile. Visualmente no cambia nada.

### Labels en todos los inputs
- **Qué:** cada input tiene `<label>`; si el diseño no lo muestra, se oculta con `.sr-only`.
- **Por qué:** el placeholder no reemplaza al label: desaparece al escribir y muchos
  lectores de pantalla no lo leen.

### Íconos sin texto
- **Qué:** `aria-label` en el link o botón, `aria-hidden="true"` en el ícono.
- **Por qué:** el lector de pantalla anuncia "Carrito, link" en vez de nada o un
  carácter raro de la fuente de íconos.

### Scrollbar con la paleta del sitio, no oculta
- **Qué:** en `base.css`, `scrollbar-color`/`scrollbar-width` (Firefox) y
  `::-webkit-scrollbar*` (Chrome/Edge/Safari) sobre el selector universal
  — track `--fondo`, thumb `--primario-o1` que pasa a `--acento` en hover.
  Aplica a toda la página y a cualquier contenedor con scroll propio
  (el desplegable del carrito, un `<textarea>`), no hace falta repetirlo
  por componente.
- **Por qué no ocultarla directamente (alternativa pedida, descartada):**
  sacar la barra de scroll de la página entera es un golpe a la
  accesibilidad/UX — se pierde la referencia visual de cuánto falta para
  llegar al final y el "agarradero" para arrastrar con mouse. El proyecto
  ya prioriza accesibilidad sobre estética (corrección del profesor sobre
  Orbitron). Estilizarla da la identidad visual que se buscaba sin sacar
  esa función.
- **No pisa el scrollbar oculto de las filas de la Home:**
  `.carrusel__pista` (`home.css`) ya la ocultaba a propósito con
  `scrollbar-width: none` + `::-webkit-scrollbar { display: none }` — ahí
  sí se justifica porque hay flechas como control alternativo. Esa regla
  es más específica que el selector universal de acá y sigue ganando, sin
  tocarla.

---

## Header

### Una estructura, tres variantes
- **Qué:** Home con sesión, Home invitado y página del juego comparten `.header`;
  el juego usa el modificador `.header--juego`.
- **Por qué:** un solo componente con variantes es más fácil de mantener y mantiene
  la consistencia visual entre páginas.

### Grilla de 3 columnas iguales para centrar el buscador
- **Qué:** `grid-template-columns: 1fr minmax(0, 24rem) 1fr`, con menú + logo agrupados
  en `.header__start`.
- **Por qué:** con dos columnas laterales iguales, el buscador queda centrado respecto
  de la página, como en Figma, sin importar que la izquierda y la derecha tengan
  contenido de distinto ancho.
- **Descartado:** flex con `justify-content: space-between` (lo centra entre los
  vecinos, no en la página).

### En mobile el buscador baja a una segunda fila
- **Qué:** con `grid-template-areas`, el buscador ocupa el ancho completo debajo.
- **Por qué:** en una pantalla angosta no entra en la misma fila sin quedar diminuto.
  Se mantiene visible (no se esconde tras un ícono) porque buscar es una tarea
  principal en una plataforma de juegos.

### Header fijo solo en la Home, y solo desde tablet
- **Qué:** `.header--fijo` (`position: sticky; top: 0; z-index: 200`, dentro del
  `@media (min-width: 48rem)` de `header.css`), puesto solo en `index.html`.
  `juego.html` (`.header--juego`) y `producto.html` no lo llevan. En mobile no
  queda fijo.
- **Por qué:** pedido de Agus. En la Home hay mucho scroll (banner + varias filas
  + footer) y tener el menú, el carrito y la cuenta siempre a mano ayuda. En la
  página del juego el "modo foco" busca lo contrario, y la ficha de producto se
  dejó igual a la del juego. En mobile, un header fijo se come pantalla.
- **Como variante y no en `home.css`:** es un modificador del componente
  (`.header--fijo`), igual que `.header--juego`, así que va con el resto del
  header y cualquier página lo puede activar sumando una clase.
- **`z-index: 200`:** el mismo que los menús desplegables, por encima del banner
  coverflow (llega a 100). El loading (500) sigue tapándolo mientras carga.
- **`scroll-padding-top` en `html` (`home.css`, desde tablet):** con el header fijo,
  el link "Mis juegos" del menú (`index.html#fila-mis-juegos`) dejaba el título
  de la fila tapado. El valor sale de tokens: alto del control + padding de arriba
  y de abajo + un poco de aire.

### Header del juego sin menú ni buscador ("modo foco")
- **Qué:** solo logo, estado de guardado, "Volver al menú" y avatar.
- **Por qué:** mientras se juega, reducir distracciones. Se deja una salida clara
  (volver al menú) y feedback del estado del sistema (partida guardada).

### Estado de sesión en el avatar
- **Qué:** con sesión, foto del usuario → "Mi cuenta". Invitado, ícono genérico → `login.html`.
- **Por qué:** el avatar comunica el estado de sesión de un vistazo, y el del invitado
  es el punto de entrada natural al login.
- **Por ahora:** sin JS, cada página muestra un estado fijo (Home como invitado,
  juego con sesión).

### "Partida guardada" con `role="status"`
- **Qué:** el texto de estado tiene `role="status"` y la hora en `<time>`.
- **Por qué:** cuando JS actualice la hora, el lector de pantalla lo anuncia sin
  interrumpir. Es feedback del estado del sistema (heurística de Nielsen #1).

### Placeholder "Buscar juegos"
- **Qué:** se agregó aunque en Figma el buscador está vacío.
- **Por qué:** deja claro qué se busca. El label oculto sigue estando para accesibilidad.

---

## Footer

### Fat footer con estructura semántica
- **Qué:** `nav` por cada columna de links (con `aria-labelledby` a su título),
  `section` para sponsors y newsletter, `address` para los datos de la empresa,
  `div` solo para la grilla y la franja de abajo.
- **Por qué:** un lector de pantalla puede saltar entre navegaciones ("navegación Jugar",
  "navegación Ayuda") y entiende qué es cada bloque. Los `div` quedan para layout puro.

### Títulos de columna como `h2` con estilo de label
- **Qué:** son `h2` en el HTML pero se ven como labels chicos.
- **Por qué:** la jerarquía la define el HTML y el tamaño visual el CSS. Así el
  outline del documento queda correcto.

### Layout mobile first
- **Qué:** en mobile la marca arriba y las columnas de a dos; desde tablet, 4 columnas;
  desde desktop, marca + 4 columnas como en Figma.
- **Por qué:** el footer está en la Home, que es mobile first.

---

## Loading de la Home

### Reemplazado: logo con pulso + aro de progreso real + frases graciosas
- **Qué:** el spinner original (un aro que giraba sin parar, `::before` con
  `border-top-color` distinto) se reemplazó por: el logo de Warden
  latiendo (`@keyframes latido`, `scale` + `drop-shadow`), un aro de
  progreso real alrededor (un `<svg>` con dos `<circle>` — uno de fondo,
  fijo, y uno de relleno cuyo `stroke-dashoffset` avanza junto con el %
  real en `loading.js`, no es un giro infinito sin relación con el
  avance), el % debajo, y una frase que va rotando cada 1/3 del progreso
  ("Poniendo a correr a los hámsters…", "Convenciendo a la IA de que
  trabaje…", "Ocultando las microtransacciones…"), terminando en "Todo
  listo, a viciar." al llegar a 100%.
- **Por qué:** pedido de Agus — quería algo más elaborado que un spinner
  genérico, atado a la marca del sitio en vez de una forma abstracta. Se
  probó primero como archivo suelto (`preview-loading-logo.html`, junto a
  otra opción con un marco cuadrado que no se usó) para verlo funcionando
  antes de tocar el archivo real — se pudo iterar rápido el copy de las
  frases sin arriesgar nada del sitio.
- **El aro de progreso está atado al % real, no es decorativo suelto:**
  mismo criterio que ya se valora en el proyecto (ej. el contador real de
  0 a 100 en vez de una animación sin relación con el tiempo transcurrido)
  — el relleno del aro *es* el avance, no un giro que da vueltas sin decir
  nada.
- **Las frases son puramente para quien ve la pantalla, no para lectores
  de pantalla:** ver "El % es decorativo para lectores de pantalla" más
  abajo — se actualizó ese criterio para incluirlas.

### `z-index: 500` en el overlay (bug encontrado después de armar el banner)
- **Qué:** `.loading-overlay` tenía `z-index: 100`. Al armar el banner
  coverflow, la card activa también llega a `z-index: 100` (empatan), y por
  orden de aparición en el HTML (el banner está después del overlay) el
  banner ganaba el empate — el spinner quedaba tapado por la card activa
  mientras cargaba.
- **Por qué 500 y no, por ejemplo, 101:** tiene que quedar por encima de
  cualquier cosa que se agregue más adelante con su propio z-index alto
  (los menús del header ya están en 200). Mientras el loading está visible,
  nada más de la página debería poder pintarse por encima.

### Contador real de 0 a 100% en 5 segundos
- **Qué:** `loading.js` suma 1% cada 50ms (100 pasos × 50ms = 5000ms) y al llegar a 100
  oculta el overlay con el atributo `hidden`.
- **Por qué:** el enunciado pide "loading simulado de 5 segundos con % de avance visible";
  un contador reproducible es más simple de explicar que una animación por `requestAnimationFrame`.

### El resto de la página queda `inert` mientras carga
- **Qué:** mientras el loading está visible, el header, el `main` y el footer tienen el
  atributo `inert`.
- **Por qué:** sin esto, alguien podría tabular o hacer click en contenido tapado por el
  overlay. `inert` es nativo de HTML, no hace falta JS para bloquear foco elemento por elemento.

### El % (y ahora las frases graciosas) son decorativos para lectores de pantalla
- **Qué:** todo el bloque visual (`.loading__centro`: logo, aro, %, frase)
  tiene `aria-hidden="true"`; en cambio hay un texto fijo ("Cargando
  catálogo de juegos…") dentro del `role="status"` que se lee una sola vez.
- **Por qué:** anunciar el número cambiando 100 veces en 5 segundos sería spam para quien
  usa lector de pantalla — mismo problema si se anunciaran las 4 frases que van rotando
  (menos veces, pero igual interrumpirían un anuncio con el siguiente antes de terminar
  de leerse). Un solo anuncio fijo al aparecer el loading alcanza para las dos cosas.

---

## Catálogo de la Home (Etapa 3)

### Se consume la API de la cátedra en vez de inventar datos
- **Qué:** `api.js` define `BASE_URL = 'https://vj.interfaces.jima.com.ar/api'` y
  `obtenerJuegos()`, que hace `fetch(BASE_URL)` y devuelve la lista (~80 juegos
  reales con nombre, imagen, rating y géneros). `home.js` la usa para armar
  las filas de juegos.
- **Por qué:** resuelve dos cosas a la vez — el requisito de "datos reales"
  (títulos de largos distintos, imágenes de colores variados) y el "Plus" de
  consumir la API de la cátedra — sin inventar contenido ni necesitar assets
  propios que no teníamos.
- **`/api` y no `/api/v2`:** `/v2` suma imágenes optimizadas y descripciones,
  pero las descripciones vienen en inglés (la API está armada sobre datos de
  RAWG). Como no las mostramos en las cards, no vale la pena mezclar idiomas
  en una interfaz que tiene que estar en español.
- **Descartado:** armar cards con imágenes ilustradas (gradiente + ícono) para
  no depender de assets — dejó de hacer falta en cuanto encontramos que la API
  ya provee portadas reales y con licencia para este uso académico.

### Con sesión: "Recomendados" arriba, categorías igual que a un invitado abajo
- **Qué:** se sacó la grilla única de "Recomendados" de la primera versión de
  la 3a. `#filas-juegos` arma las categorías fijas siempre (`CATEGORIAS` en
  `home.js`: Acción, Shooters, RPG, Aventura, filtrando el catálogo por
  `genres[].name`), y si hay sesión (`.header__avatar[data-sesion="usuario"]`
  visible) le agrega arriba de todo una fila "Recomendados", filtrando por
  el género de un juego que simulamos que la persona ya jugó
  (`JUEGO_JUGADO` en `home.js`).
- **Por qué:** al principio "Recomendados" reemplazaba a las categorías por
  completo con sesión — pero tener cuenta no debería significar perder la
  forma de explorar por categoría, solo sumarle algo personalizado arriba.
  Es lo mismo que ya lista el menú hamburguesa (mismas categorías), así
  que ahora Home y hamburguesa muestran el mismo universo de categorías
  sin importar si hay sesión o no.
- **`JUEGO_JUGADO` con género explícito, no `genres[0]`:** al principio se
  tomaba el primer género del juego "jugado" para buscar similares, pero el
  orden de `genres[]` en la API no es confiable (ej. "The Witcher 3" trae
  `Action` antes que `RPG`), y terminaba recomendando por el género
  equivocado. Se hardcodea el género junto con el nombre.
- **Sin login real ni historial de partidas:** no hay backend de sesión
  (`data-sesion` sigue siendo un estado fijo en el HTML, ver "Estado de sesión
  en el avatar" en `## Header`) ni datos de qué jugó cada usuario (con un solo
  juego construido, Peg Solitaire, no hay historial real que trackear). Tanto
  el "hay sesión" como el "juego ya jugado" son simulados a propósito para
  esta entrega.

### Cada fila es un carrusel de scroll nativo, no el banner animado
- **Qué:** `.carrusel__pista` es un `flex` con `overflow-x: auto` y
  `scroll-snap`; se desplaza con scroll (trackpad, arrastrando con mouse,
  flechas, touch nativo en mobile), sin transición animada.
- **Por qué:** la animación con transición (el coverflow, ver banner
  "Destacados" más abajo) queda reservada para ese banner. Estas filas de
  categorías/recomendados son "carruseles normales, sin animación" por
  diseño.

### Flechas + arrastre con mouse (`js/carrusel-fila.js`), scrollbar oculta
- **Qué:** cada fila suma una cabecera (`.carrusel__cabecera`) con el título
  a la izquierda y dos flechas a la derecha (`.carrusel__flecha`), que
  desplazan la pista un 90% de su ancho visible (`scrollBy` con
  `behavior: smooth`) y se deshabilitan solas al llegar a una punta. La
  pista también se puede arrastrar con el mouse (`pointerdown` +
  `pointermove`, solo para `pointerType: 'mouse'` — el touch ya scrollea
  nativo). La scrollbar del navegador se oculta (`scrollbar-width: none` +
  `::-webkit-scrollbar { display: none }`).
- **Por qué:** en desktop no hay forma táctil de arrastrar como en mobile;
  el mouse-drag lo simula. Las flechas son la alternativa para quien no
  quiere arrastrar (o navega con mouse pero prefiere clickear). La
  scrollbar nativa quedaba fea y era redundante con flechas + arrastre.
- **`.game-card:hover` (scale 1.06) se recortaba contra el borde de la
  fila:** `overflow-x: auto` obliga, por spec de CSS, a que `overflow-y`
  también recorte aunque no se lo pida explícitamente — así que el hover
  que agranda la card se cortaba arriba/abajo. Se le agregó `padding: 12px`
  a `.carrusel__pista` (deja lugar para el crecimiento) compensado con
  `margin: -12px` (para que el layout no se corra).
- **Solo mouse arrastra, no touch:** en touch ya funciona el scroll nativo
  del navegador; agregar la misma lógica ahí lo duplicaría y podría pelear
  con el scroll nativo (movimiento doble). Se filtra por
  `evento.pointerType === 'mouse'`.

### Las flechas también respetan `prefers-reduced-motion` (revisión de Fran antes de mergear)
- **Qué:** `carrusel-fila.js` suma `prefiereMovimientoReducido` (mismo chequeo
  que ya usa `carousel.js`) y, si está activo, el click en las flechas
  desplaza la pista con `behavior: 'auto'` en vez de `'smooth'`.
- **Por qué:** el `scrollBy({ behavior: 'smooth' })` original es una
  animación (el scroll se anima), pero es JavaScript, no CSS — el
  `@media (prefers-reduced-motion: reduce)` de `home.css` no lo alcanza.
  Se había escapado en la revisión inicial del PR: rompía la regla propia
  del proyecto ("toda animación tiene que respetar `prefers-reduced-motion`",
  `CLAUDE.md`). El arrastre con mouse no necesita el mismo chequeo porque
  ahí el movimiento lo genera la persona, no una animación del sitio.
- **Bug real que rompía toda la Home, encontrado después de mergear:**
  ese primer fix declaraba `const prefiereMovimientoReducido` en
  `carrusel-fila.js`, pero `carousel.js` ya tenía una constante global
  con el mismo nombre. Ninguno de los dos scripts usa `type="module"`
  (regla del proyecto), así que comparten un solo scope global — declarar
  la misma constante dos veces tira `SyntaxError` apenas carga el segundo
  script, y ese script entero deja de ejecutarse. Como `carrusel-fila.js`
  cargaba después de `carousel.js`, era el que fallaba: nunca llegaba a
  definir `activarCarrusel()`, y como `home.js` la llama al armar cada
  fila, las categorías/recomendados fallaban en silencio (try/catch de la
  promesa de `obtenerJuegos()` de por medio, sin ningún error visible más
  que en la consola). El banner "Destacados" no se veía afectado porque
  `carousel.js` no depende de nada de `carrusel-fila.js`. Se renombró a
  `prefiereMovimientoReducidoFilas` en `carrusel-fila.js` para no
  volver a pisar el nombre de otro script.

### Cards horizontales (16:9), no verticales
- **Qué:** `.game-card__image` usa `aspect-ratio: 16 / 9`.
- **Por qué:** correción sobre la primera versión de la 3a, que las tenía en
  3:4 (verticales). Las cards de estas filas tienen que ser horizontales.

### Cards sin rating, botón de carrito cuadrado, y alto parejo
- **Qué:** las cards de las filas ya no muestran la estrella con el rating,
  solo el título (igual que las de "Mis juegos"). El botón de carrito pasó
  de círculo (`border-radius: 50%`) a cuadrado con esquinas redondeadas
  (`--radio-md`), siempre de 44×44px. Se borró `.game-card__rating`.
  `.game-card__cuerpo` pasa a tener alto fijo (`height: var(--control-alto)`
  con `box-sizing: content-box`, para que el padding se sume por fuera).
- **Por qué:** pedido de Agus — "Mis juegos" se veía mejor. Las cards eran
  del mismo ancho y con la misma imagen 16:9; la diferencia era que sin el
  rating el texto de abajo ocupa una sola línea, y la imagen pasa a ser una
  parte más grande de la card. El `min-height` iguala el alto con o sin
  botón (juegos gratis, "Mis juegos"), así el título queda a la misma altura
  en todas las cards de una fila, centrado en vertical con el botón.
- **El rating no se pierde:** sigue en la ficha de cada juego
  (`producto.html`) y sigue usándose para elegir los "Destacados" del banner.
- **Descartado:** agrandar la imagen (ancho de la card o aspect-ratio) —
  no hacía falta para lograr lo que se buscaba.

#### Título a 2 líneas en reposo, completo en hover
- **Qué:** `.game-card__title` se corta a 2 líneas con "…"
  (`-webkit-line-clamp: 2`). Con hover o foco en la card se saca el corte y
  se ve el título completo.
- **Por qué:** con Orbitron (ancha) y el botón al costado, un título como
  "Counter-Strike: Global Offensive" ocupa 3 líneas, y como las cards de una
  fila se estiran a la altura de la más alta (flex, `align-items: stretch`),
  un título largo agrandaba todas las de esa fila. Con el corte a 2 líneas
  (~38px) todas entran en los 44px fijos y miden lo mismo.
- **`.game-card__texto` es `position: absolute`, tapando todo el cuerpo:** en
  reposo mide lo mismo que el cuerpo (`min-height: 100%`) y centra el título
  con flex; en hover crece hacia abajo. Al ser absoluto no cuenta para el
  layout, así que la card y la fila no cambian de alto (si no, todo lo que
  está debajo saltaría cada vez que se pasa el mouse). Se pinta del mismo
  color que la card (`--superficie`) con sombra para que lo que se sale por
  debajo se lea como continuación de la card.
- **Cambios que hicieron falta para que se pueda salir:** `overflow: hidden`
  se mudó de `.game-card` a `.game-card__media` (con radio solo arriba,
  para que la imagen siga respetando las esquinas), y `.carrusel__pista`
  suma más padding abajo (32px, con margin negativo igual, para no correr
  el layout), porque `overflow-x: auto` recorta también en vertical.
- **El borde de la card se cortaba (bug encontrado por Agus):** el borde de
  1px es de `.card`, y el texto absoluto, al salirse por abajo, lo pisaba
  sin tener uno propio — el trazo se interrumpía justo donde la caja
  seguía. Se arregló dándole al texto un borde propio (`1px solid`,
  transparente en reposo y `--primario-o1` en hover, sin borde arriba para
  no marcar la unión con la imagen), con `left/right: -1px` y
  `min-height: calc(100% + 1px)` para que cubra exactamente el borde de la
  card: con un título corto queda encima del de la card (no se ve doble) y
  con uno largo lo continúa hacia abajo.
- **Botón de carrito:** ahora `position: relative; z-index: 1;
  margin-left: auto`, para quedar arriba del texto absoluto y a la derecha.
  El texto deja el lugar libre con `:has(.game-card__carrito)`.
- **Descartado:** dejar que la card crezca en su lugar — empujaba todas las
  cards de la fila y todo lo de abajo cada vez que se pasaba el mouse.

### Datos de respaldo si la API falla
- **Qué:** `home.js` tiene `JUEGOS_DE_RESPALDO`, 5 juegos reales con género
  incluido, elegidos para cubrir las 4 categorías fijas y el simulado de
  "Recomendados".
- **Por qué:** la Home no puede depender de que un servicio externo esté
  siempre arriba. Sin esto, un corte de la API dejaría todas las filas vacías.
- **Una fila vacía no se muestra:** si una categoría (o "Recomendados") queda
  sin ningún juego que matchee, `crearFila()` devuelve `null` y no se agrega
  nada, en vez de mostrar un título sin contenido debajo.

### El fetch de datos no depende del loading simulado
- **Qué:** `home.js` pide los juegos apenas carga la página, en paralelo con
  el contador de 5 segundos de `loading.js`; no hay comunicación entre los dos
  archivos.
- **Por qué:** mantener cada archivo con una sola responsabilidad (loading.js
  no sabe nada de juegos, home.js no toca el overlay). En la práctica el
  fetch de este JSON tarda mucho menos que los 5 segundos simulados, así que
  las filas ya están listas cuando el loading se oculta.

### `<h2>` por fila, no un catálogo con un solo título
- **Qué:** cada fila que arma `home.js` es un `<section>` con su propio
  `<h2>` (el nombre de la categoría, o "Recomendados") y `aria-labelledby`
  apuntando a ese `h2` — mismo patrón que las columnas del footer. Los
  títulos de cada juego son `<h3>`, dentro de esa jerarquía.
- **Por qué:** sin un `h2` por sección, los títulos de juego como `<h3>`
  saltarían un nivel justo después del `<h1>` de la Home, rompiendo el
  outline del documento. Como ahora hay varias filas (no una sola), cada una
  necesita su propio heading para que un lector de pantalla pueda saltar
  entre ellas.

### Los íconos de Phosphor deben ser de la variante "regular"
- **Qué:** el rating de cada card usa `ph-star`, no `ph-star-fill`.
- **Por qué:** el proyecto solo carga la hoja de estilos
  `@phosphor-icons/web/src/regular/style.css`. Los nombres de ícono con sufijo
  de otro peso (`-fill`, `-bold`, `-duotone`, etc.) no existen en esa hoja: el
  ícono no se rompe visualmente, directamente no aparece nada, sin error en
  consola. Vale la pena recordarlo para cualquier ícono nuevo que se agregue
  en el resto del proyecto.

---

## Banner "Destacados" (Etapa 3b)

### Reemplaza al `#hero` de texto; el `<h1>` pasa a ser "Destacados"
- **Qué:** el `#hero` con "Warden Games" + bajada se saca. El banner es lo
  primero que se ve al entrar, y su `<h1>` visible dice "Destacados".
- **Por qué:** la marca "Warden" ya está en el logo del header, no hace
  falta repetirla como título de página. "Destacados" describe mejor lo que
  hay ahí (una selección curada, no un saludo genérico).

### Carrusel coverflow: perspective + rotateY + translateZ, no un recorte plano
- **Qué:** cada card (`.banner__slide`) es un cuadrado centrado
  (`position: absolute; left:50%; margin-left:-31%`) al que `carousel.js` le
  calcula un `transform` en JS según su distancia (offset) a la activa:
  `perspective()` primero (ver más abajo por qué va ahí y no en un
  ancestro), `translateX` para correrla al costado, `translateZ` negativo
  para mandarla "para atrás", `rotateY` para que gire como si se alejara, y
  `scale` para achicarla. La activa (offset 0) queda sin esas
  transformaciones, de frente.
- **Por qué:** las dos versiones anteriores (wipe con `clip-path` y después
  slides en paralelogramo con `clip-path` diagonal) eran técnicas 2D — un
  recorte, no una rotación real. La referencia es un carrusel "coverflow"
  (tipo iTunes viejo): eso es específicamente perspectiva 3D, no se puede
  simular bien con `clip-path`. Con `perspective`/`rotateY`/`translateZ` se
  arma la técnica correcta en vez de aproximarla.
- **`perspective()` en el `transform` de cada card, no en `.banner__viewport`:**
  la primera versión ponía `perspective: 1400px` en `.banner__viewport` (un
  ancestro) y `transform-style: preserve-3d` en `.banner__escena`. Visualmente
  andaba bien, pero el hit-testing de clicks quedaba roto: `elementFromPoint`
  y los clicks reales no coincidían con la posición visual de una card
  rotada — es una limitación conocida de Chrome con `perspective` heredada
  de un ancestro en vez de puesta en el propio elemento transformado. Se
  resolvió pasando `perspective()` a ser la primera función dentro del
  `transform` de cada `.banner__slide`, sacando `perspective` del viewport y
  `preserve-3d` de la escena. El resultado visual es prácticamente el mismo
  (cada card arma su propio punto de fuga en vez de compartir uno), pero los
  clicks ya coinciden con lo que se ve.
- **`.banner__viewport` sin `overflow: hidden`:** las cards de los costados
  se ven completas, no recortadas por los bordes del contenedor. No hace
  falta recortar nada verticalmente tampoco: todas las cards miden el 100%
  del alto del viewport, no hay overflow en ese eje.
- **`offsetCircular()`:** la distancia de cada card a la activa se calcula
  con ciclo corto (si hay 5 cards y la activa es la 0, la card 4 está a
  distancia -1, no -4), para que ir de la última a la primera gire para el
  lado corto en vez de cruzar toda la fila.
- **Bug encontrado al probarlo — una card "daba la vuelta" barriendo toda
  la pantalla, corregido bajando `MAX_VISIBLES` de 2 a 1:** avanzar un solo
  paso (activo pasa de 1 a 2, por ejemplo) hace que la card que queda justo
  en el extremo opuesto salte de golpe de `offset -2` a `offset +2` — es
  matemáticamente correcto (el lado corto cambia de dirección para esa
  card en ese punto), pero animado con el `transition` normal, la
  interpolación en línea recta de un extremo al otro barre por encima de
  las cards del medio en el camino.
  - **Primer intento (descartado):** detectar ese salto grande contra el
    offset anterior de la card (`dataset.offset`) y sacarle la transición
    justo ahí (`transition: none`, forzando reflow) para que apareciera
    directo en la nueva posición en vez de barrer. Funcionaba (ya no
    barría), pero se sentía igual de raro: la card desaparecía de un lado
    y aparecía de golpe en el otro, un corte demasiado brusco.
  - **Solución real:** el salto solo puede pasar en la distancia MÁXIMA
    posible (con 5 destacados, esa distancia es 2 — el piso de 5/2). Si esa
    distancia directamente no se muestra (`MAX_VISIBLES: 1` en vez de 2),
    la card en cuestión ya está oculta (`opacity: 0`) tanto antes como
    después del salto, así que nadie lo ve — sin ningún truco de
    transición. Como efecto secundario, ahora se ven 3 cards en total
    (activa + 1 de cada lado) en vez de 5, un coverflow más despejado.
- **Texto solo en la card activa:** `.banner__etiqueta` y `.banner__nombre`
  están en `opacity: 0` por default y solo se muestran en
  `.banner__slide--activo`, para no mezclar el texto de la activa con el de
  las que están giradas al costado.
- **`.banner__nombre` en `--font-ui`, no `--font-display` (bug marcado por
  Fran en el PR #3):** es un `<p>`, no un título — se había quedado con
  Orbitron de un copy/paste. Mismo problema de "demasiado Orbitron" que ya
  se corrigió dos veces antes, esta vez lo agarró una revisión en vez de
  una corrección del profesor.
- **Click en cualquier card visible para saltar a ella:** cada card llama a
  `irA()` con su propio índice al clickearla, igual que los dots. No hace
  falta que sea la inmediata siguiente — clickear una card 2 posiciones más
  allá salta directo ahí. Antes de resolver el problema de hit-testing (ver
  arriba) esto se había sacado por no ser confiable; ahora que el click
  coincide con lo que se ve, se volvió a agregar.
- **Las cards no son alcanzables por teclado, solo con mouse (marcado por
  Fran en el PR #3, no se cambia):** clickear una card del costado es un
  atajo con mouse; no tienen `tabindex` ni rol de botón. Es intencional, no
  un olvido: los dots ya cubren la navegación completa por teclado, y
  convertir cada card en su propio tab-stop metería 5 paradas de Tab extra
  para algo que los dots ya resuelven — el patrón ARIA de carruseles en
  general evita eso mismo (los controles de navegación son el tab-stop, no
  cada slide).
- **Sin atenuar la opacidad de las cards del costado:** al principio las
  cards a distancia 1-2 bajaban de opacidad (hasta un mínimo de 0.35), para
  que se notara más cuál era la activa. Se sacó al sacar el `overflow:
  hidden` del viewport: ahora que se ve la imagen completa de cada card (no
  un pedazo recortado), ya se distingue bien cuál es cuál solo con el
  tamaño, el giro y la posición — no hace falta además oscurecerlas.

### Se eligen los 5 juegos mejor puntuados como "Destacados" — y Neon Circuit siempre primero
- **Qué:** `carousel.js` ordena el catálogo de la API por `rating` y toma
  los primeros 4, y les suma un 5º de entrada: `NEON_CIRCUIT`, un objeto
  hardcodeado (no viene de la API) que `elegirDestacados()` pone siempre
  al principio del array, antes que el resto — así `indiceActivo = 0` lo
  deja como la card activa apenas carga la página. Sin badge de precio (el
  Figma tenía "$9.99"): no existe ningún sistema de compras todavía.
- **Por qué:** pedido de Fran — el propio juego (Neon Circuit) tiene que
  ser lo primero que se ve al entrar a la Home, no competir por rating
  contra el catálogo de la API (que trae juegos de terceros, no el
  nuestro). El resto (4, no 5) sigue siendo dato real de la API — mismo
  criterio de siempre, sin inventar contenido.
- **Imagen:** reusa `assets/img/portada-tronpeg-1616x1320.png`, la misma
  portada de la página del juego — coherencia visual, sin generar un
  asset aparte para el banner.
- **Pendiente:** hay que armar un sistema de compras real (es parte del
  enunciado, no opcional) — se deja para una etapa aparte. Cuando exista, ahí
  vuelve el precio al banner.

### Autoplay que se pausa con hover o foco, sin botón de pausa
- **Qué:** `programarSiguiente()` arma un `setTimeout` que se reprograma
  solo cada vez que cambia el slide (manual o automático). `pointerenter` /
  `focusin` sobre el banner lo cancelan (`pausarAutoplay`); `pointerleave` /
  `focusout` lo vuelven a armar de cero.
- **Por qué:** WCAG pide que algo que se mueve solo por más de 5 segundos se
  pueda pausar. En vez de un botón de pausa visible (que no pidieron), se
  pausa con hover — y también con foco de teclado, así alguien que navega
  sin mouse puede pararlo igual llegando a los dots con Tab, sin depender de
  un puntero.
- **Descartado:** un solo `setInterval` seguido con un flag de "pausado" que
  salteaba ticks. Funciona, pero al reanudar podía tardar hasta el doble del
  intervalo configurado en volver a avanzar, porque no había forma de saber
  en qué punto del ciclo anterior se había pausado. Reprogramar el timer de
  cero en cada cambio es más simple de razonar y de explicar.
- **Movimiento reducido:** con `prefers-reduced-motion`, no arranca el
  autoplay y las cards cambian de posición directo, sin el giro animado.

### `margin-inline: auto` en el viewport, porque `aspect-ratio` + `max-height` le achica el ancho
- **Qué:** `.banner__viewport` quedaba pegado a la izquierda en vez de
  centrado en pantallas anchas. Se arregla con `margin-inline: auto`.
- **Por qué:** el viewport tiene `aspect-ratio: 16/9` y `max-height: 420px`.
  Cuando el ancho disponible haría que, a 16:9, la altura supere esos
  420px, el navegador achica el ANCHO de la caja para mantener la
  proporción — no solo la altura. Al quedar más angosta que su contenedor,
  una caja de bloque normal no se centra sola, se pega al borde de inicio
  (izquierda). Con `margin-inline: auto` sí se centra, como una imagen con
  `max-width` que también necesita `display:block; margin:auto` para no
  quedar pegada a un lado.

### Neon Circuit es clickeable: botón "Jugar" que aparece en hover
- **Qué:** solo la card de Neon Circuit (no las de la API) tiene adentro un
  `<a href="juego.html">` con un ícono `ph-play` centrado sobre un círculo
  `--acento`, que lleva a la página del juego. Está oculto
  (`opacity: 0; visibility: hidden`) salvo que esa card sea la **activa**
  (la de adelante): recién ahí, con hover o con foco de teclado, se muestra.
  Con `prefers-reduced-motion`, aparece directo, sin fade.
- **Por qué:** era la única card del banner sin ninguna acción real —
  clickearla mientras está activa no hacía nada (`irA()` no-opea si ya es la
  activa). Al ser nuestro propio juego (no un juego de terceros de la API),
  tiene sentido que sea el único con una acción directa a "ir a jugar".
- **Solo visible/alcanzable cuando la card está activa, no en las laterales:**
  las cards de los costados están rotadas en 3D y achicadas — mostrar un
  botón de jugar ahí se vería roto (heredaría la rotación) y confundiría con
  la acción de "saltar a esta card" que ya tienen. Además, con
  `visibility: hidden` en ese estado, el link no queda como tab-stop
  mientras la card no se ve de frente — evita que alguien tabee a un botón
  invisible o girado al costado.
- **Excepción puntual sobre "las cards no son alcanzables por teclado":**
  la decisión de más abajo (cards laterales sin `tabindex`, solo clickeables
  con mouse) sigue vigente para saltar de una card a otra — los dots cubren
  esa navegación. Este botón es distinto: es una navegación real a otra
  página, no un salto de carrusel, así que sí tiene sentido que sea un
  `<a>` real, alcanzable con Tab.
- **`stopPropagation` en el click del link:** el `<div>` de la card ya tiene
  su propio listener de click (`irA(index)`), que no hace nada si la card ya
  está activa (que es el único momento en que el botón es clickeable) — pero
  se corta la propagación igual para que no dependa de esa coincidencia.

### Etiqueta "Destacado": mismo radio que `.badge`, texto centrado con `inline-flex`
- **Qué:** `.banner__etiqueta` pasó de `border-radius: 999px` + `line-height: 1`
  a `--radio-sm` + `line-height: 1.4` (los mismos valores que `.badge`), y
  suma `display: inline-flex; align-items: center`.
- **Por qué:** `.banner__etiquetas` es un flex con `align-items: stretch` (el
  default), así que cuando el juego tiene un badge al lado ("Gratis", precio,
  "Nuevo"), que es más alto, "Destacado" se estiraba a esa altura. Con
  `line-height: 1` el texto quedaba pegado arriba (no centrado) y el 999px
  sobre una caja más alta se veía como un radio exagerado. Igualar radio y
  line-height con `.badge` hace que las dos etiquetas se vean como un par.
- **Descartado:** `align-items: center` en el contenedor — evita el estiramiento,
  pero deja las dos etiquetas con alturas distintas (el badge de precio tiene
  borde de 1px).

### Dots como barritas finitas (estilo Steam), no círculos
- **Qué:** `.banner__dot` es un botón de 28×24px sin nada visible propio; la
  barrita (4px de alto, bien angosta) es un `::before` adentro.
- **Por qué:** los círculos de `--control-target` (24px) quedaban grandes
  para un indicador de posición. Separar "botón" (área táctil, 24px) de
  "barrita" (lo que se ve, 4px) deja el tamaño del área táctil intacto sin
  que el indicador visual tenga que ser igual de grande.

---

## Login / Registro

### Splash de 2 columnas (Etapa 2)
- **Qué:** `.auth-shell` parte la pantalla en 2 con CSS grid: `.auth-brand`
  (logo con una animación de flotar, el `h1` de la página y una bajada) a la
  izquierda, `.auth-panel` (el `.auth-card` con los forms) a la derecha. Es
  el único `<main>` de la página; ya no usa el ancho máximo centrado de
  `base.css`, lo pisa `.auth-shell` con más especificidad.
- **Por qué:** lo pide `ETAPAS.md`. Al no tener `.header`, la página no tenía
  ningún lugar para la marca; el panel de marca cumple esa función y de paso
  resuelve dónde va el `h1` obligatorio de la página.
- **Contenido del panel de marca:** logo (`assets/img/logo.png`, el mismo de
  header/footer) + "Warden Games" + una bajada corta. Sin form ni links: es
  puramente de presentación.
- **Solo desktop:** sin media queries, porque la regla del proyecto dice que
  login no necesita mobile first.

### Alternar Crear Cuenta / Ingresar: se volvió al selector de arriba (no el link)
- **Qué:** `.auth-switch`, un `role="tablist"` de 2 botones (`.auth-switch__btn`,
  `role="tab"` + `aria-selected` + `aria-controls`) arriba de la card. Cada
  `<form>` es su `role="tabpanel"` con `aria-labelledby` al botón. Se sacó el
  link (`.hint-text` + `.link`) que habíamos puesto en su lugar.
- **Por qué:** es como está en la captura de Figma que pasó Fran — un selector
  tipo pill, con la opción activa como botón violeta sólido. Tener el link
  *además* del selector sería redundante (las dos cosas alternan lo mismo),
  así que se sacó el link en vez de sumar ambos.
- **Reemplaza una decisión anterior:** habíamos elegido el link porque
  `ETAPAS.md` lo proponía por más simple y evitaba la semántica de tabs. Se
  volvió atrás para respetar el diseño real, pero esta vez sí se le puso el
  ARIA de tabs completo (con lo que ya sabíamos que iba a hacer falta).
- **Descartado:** dejar el link y el selector juntos, como se ve en la
  captura — mismo resultado funcional con más código y más texto para
  mantener y explicar en la defensa.

### Animación de registro exitoso: reemplazar el form por un bloque de éxito
- **Qué:** al mandar bien el form de registro, `login.js` le pone `hidden` al
  `<form id="formRegister">` y se lo saca a `<div id="registerSuccess">`, que
  tiene un ícono de check, un título y un texto. El bloque entra con
  `@keyframes auth-success-pop` (fade + scale, 0.4s).
- **Por qué:** el enunciado pide una animación al registrarse correctamente.
  Reemplazar el form (en vez de superponerle un modal) evita que quede un
  formulario ya enviado detrás, y comunica con claridad que la acción
  terminó. `role="status"` en el bloque hace que el lector de pantalla lo
  anuncie solo, sin mover el foco.
- **Descartado:** un `alert()` nativo (lo que había antes) no es una animación
  y además bloquea el hilo; un modal aparte sumaba otro componente para algo
  que ya tiene su lugar (el mismo espacio del form).
- **Movimiento reducido:** con `prefers-reduced-motion`, el bloque aparece
  directo, sin la animación.

### Login y registro exitosos llevan al home
- **Qué:** si el login pasa la validación, redirige directo a `index.html`
  (`window.location.href`). Si el registro sale bien, deja ver la animación
  de éxito 2.5s y recién ahí redirige también a `index.html`.
- **Por qué:** es el comportamiento esperado en cualquier sitio (entrar o
  registrarte te lleva adentro). Los 2.5s en el registro son para que la
  animación se alcance a ver antes de navegar a otra página.
- **Sin backend real todavía:** como no hay API conectada, "éxito" hoy es
  "pasó la validación del formulario", no una cuenta real verificada. Eso
  lo resuelve `js/api.js` (ítem "Plus" pendiente).

### Captcha simulado: paleta gris de Google, no los tokens del sitio
- **Qué:** `.check-block--captcha` (el "No soy un robot" del registro)
  pasa de fondo `--fondo` (violeta oscuro) a la paleta gris/blanca real del
  widget de reCAPTCHA de Google (`#f9f9f9` de fondo, borde `#d3d3d3`,
  casillero blanco con borde `#c1c1c1`, tilde y logo en azul `#4285f4`,
  texto en gris oscuro/negro). También se corrigió que quedaba
  desalineado verticalmente: `.check-block--captcha` ahora tiene
  `align-items: center` propio, en vez de heredar el `align-items:
  flex-start` de `.check-block` (pensado para labels de varias líneas,
  como "Acepto los términos...", no para esta fila de una sola línea).
- **Por qué colores hardcodeados acá, rompiendo la regla de "nunca colores
  escritos a mano":** reCAPTCHA es un widget de un tercero (Google) — en
  un sitio real ni siquiera es HTML propio, es un iframe que Google renderiza
  siempre igual, sin importar el tema de quien lo integra. Para que la
  simulación sea creíble tiene que verse como el widget real, no como si
  hubiera tomado la paleta violeta del sitio — es la única excepción
  consciente a esa regla, justo porque conceptualmente no es "nuestro" CSS.
- **Logo corregido — es una flecha circular de "refresh", no un candado:**
  la primera versión usaba un ícono de candado/escudo (`ph-shield`, mal
  elegido de entrada). Agus lo marcó comparando de memoria contra el real;
  se confirmó visitando el demo oficial de Google
  (`google.com/recaptcha/api2/demo`) y se rehizo el SVG con la forma
  correcta: dos flechas en arco formando un círculo (ícono "autorenew" de
  Material Design), cada una con su propio `<path>` para poder pintarlas
  de dos colores distintos — `.recaptcha__icon-a` azul (`#4285f4`),
  `.recaptcha__icon-b` gris (`#b3b3b3`) — en vez de un ícono de un solo
  color.

---

## Página del juego (Etapa 4)

A partir de las capturas de Figma que pasó Fran, se dividió en partes chicas
(ver `ETAPAS.md`). Esta sección junta las decisiones de cada una.

### Nombre visible: "Neon Circuit"
- **Qué:** el `h1`, el `<title>` y la ficha del juego dicen "Neon Circuit",
  no "Peg Solitaire".
- **Por qué:** así lo llama la captura de Figma. Es el nombre de fantasía
  que le puso la cátedra al mock; el juego que programamos abajo sigue
  siendo Peg Solitaire (reglas, tablero de 33), pero de cara a la interfaz
  usamos el nombre real del diseño para no tener que inventar ni traducir
  ningún texto de la ficha, la ayuda o las reseñas.

### Breadcrumb en `--font-ui`, no en Orbitron
- **Qué:** `<nav class="breadcrumb">` con "Inicio > Puzzle > Neon Circuit",
  en Roboto Flex 14px. El separador "›" es un `::before` generado por CSS.
- **Por qué:** en el mock estaba con una tipografía grande, angulosa, que
  parece Orbitron — pero es navegación, no un título (h1-h3), así que le
  aplica la regla general del proyecto. "Puzzle" queda como texto plano, sin
  link: las categorías de la Home son filtros (`home.js`), no páginas
  propias, así que no hay a dónde linkear todavía.

### Paleta propia del tablero, no la del sitio
- **Qué:** los colores de las fichas (activa, descargada, seleccionada,
  destino) van a ser tokens nuevos en `variables.css`, con prefijo
  `--tablero-*`, en vez de reusar `--primario`/`--acento` aunque algún tono
  se le parezca.
- **Por qué:** decisión de Fran y Agus — el tablero tiene su propio lenguaje
  visual (neón sobre fondo oscuro) pensado aparte del design system general
  del sitio. Van en `variables.css` y no en `juego.css` siguiendo el mismo
  criterio que ya usamos con `--sombra-elevacion`/`--resplandor-error`:
  tokens únicos para todo el proyecto, aunque los use un solo componente.
  (Los hex concretos se definen en la parte 2, junto con la grilla.)

### El placeholder "Botón" de Figma se muestra como rótulo, no como control
- **Qué:** arriba de la card del tablero, en vez de un `<button>` sin ninguna
  acción definida, hay un `<p class="tablero__etiqueta">` con el nombre del
  juego ("Neon Circuit"), superpuesto al borde superior de la card.
- **Por qué:** en Figma ese elemento está sin definir (dice literalmente
  "Botón", sin ícono ni texto real). Armar un botón clickeable que no hace
  nada sería confuso para quien navega con teclado o lector de pantalla.
  Cuando se sepa qué función cumple, se resuelve en una parte aparte.

### Grid del tablero generado por JS, no hardcodeado en el HTML
- **Qué:** `js/juego.js` arma las 33 posiciones del tablero clásico (forma
  de cruz: filas de 3-3-7-7-7-3-3 sobre una grilla de 7x7) recorriendo las
  49 celdas y decidiendo con `esPosicionValida()` cuáles son parte de la
  cruz. Las que no lo son quedan como huecos invisibles (`.tablero__hueco--vacio`,
  `visibility: hidden`) que igual ocupan su lugar en el CSS Grid, para no
  romper la forma. El centro arranca "descargado" (vacío); el resto,
  "activo".
- **Por qué:** es la misma idea que ya usamos en `carousel.js`/`home.js` —
  contenido que se arma en JS en vez de escribir 33 `<div>` a mano en el
  HTML, más fácil de ajustar si el tamaño del tablero cambia a futuro.

### El grid de fichas es `aria-hidden` por ahora
- **Qué:** `#tablero-grid` tiene `aria-hidden="true"`.
- **Por qué:** todavía no hay clicks ni navegación por teclado sobre las
  fichas (eso es lógica de juego, una parte aparte). Sin eso, un lector de
  pantalla solo encontraría 33 `<div>` sin ninguna acción ni información
  útil — sería ruido, no contenido. Se saca este atributo en cuanto el
  tablero sea interactivo de verdad.
- **La leyenda sí queda accesible:** las muestras de color (`<span>` de cada
  estado) son decorativas y están `aria-hidden`, pero el texto de al lado
  ("Nodo activo", "Descargado", etc.) no — describe algo real del diseño
  aunque el tablero en sí todavía no funcione.

### Portada con botón "Jugar" antes de mostrar el tablero
- **Qué:** `.tablero__cuerpo` tiene dos hijos: `.tablero__portada`
  (imagen `assets/img/portada-tronpeg-1616x1320.png` + botón
  `.btn--primario` "Jugar", visible por default) y `.tablero__juego` (el
  grid + la leyenda de siempre, con `hidden` puesto en el HTML).
  `js/juego.js` engancha un click en el botón que hace
  `portada.hidden = true` y `tableroJuego.hidden = false`, mostrando el
  tablero real.
- **Por qué:** pedido de Fran — al entrar a la página se ve una portada
  (como en cualquier plataforma de juegos) en vez del tablero directo, y
  recién arranca al clickear "Jugar".
- **`object-fit: cover`, y la imagen final ya viene recortada a la
  proporción exacta de la card:** `.tablero__portada-img` usa
  `object-fit: cover` (misma técnica que el banner "Destacados" y las
  cards de la Home) para que la imagen llene la card sin deformarse,
  cualquiera sea su proporción — pero con la primera imagen que probamos
  (cuadrada, 1080×1080) eso recortaba ~99px arriba y abajo, comiéndose
  parte del título y de "Peg Solitaire". La card mide 808×660px mientras
  se ve la portada (fija: con `.tablero__cabecera` oculta en ese momento,
  el alto de `.tablero` queda solo en su `min-height`, sin nada más que
  lo empuje). Se le pasó esa proporción exacta (808:660 ≈ 1.224:1) a la
  IA para que exportara la imagen ya recortada así, en vez de dejar que
  `cover` la recorte en el navegador — con la imagen ya a la proporción
  correcta, `cover` no tiene nada que recortar.
- **`.tablero__cuerpo` pasa a `position: relative`, y el `flex`/`space-between`
  que tenía se mueve a `.tablero__juego`:** la portada es `position:
  absolute; inset: 0` sobre `.tablero__cuerpo` (así tapa toda la card, de
  punta a punta, sin el padding en el medio). Un elemento absoluto no
  participa del `flex` del padre, así que el `justify-content:
  space-between` que llevaba el grid+leyenda al fondo de la card se pasó
  a `.tablero__juego` (que ahora sí es el único hijo flex real de
  `.tablero__cuerpo` cuando la portada está oculta).
- **Nombre de archivo:** las imágenes que va probando Fran las deja en la
  carpeta `assets/` de la raíz del repo (no en `tp2/`); cada una se copia
  a `tp2/assets/img/` con nombre en minúsculas, sin espacios ni el
  carácter `×`, por la regla de rutas del proyecto (GitHub Pages
  distingue mayúsculas).
- **Historial de versiones probadas** (las viejas quedan en
  `tp2/assets/img/` sin usar, por si hace falta volver atrás — no se
  borran): `portada-tron.jpg` (arte genérico estilo Tron, decía "Grid
  Solitaire", no el nombre real) → `portada-neon-circuit.png` (1080×1080,
  ya con "Neon Circuit"/"Peg Solitaire", pero cuadrada, se recortaba) →
  `portada-tronpeg-808x660.png` / `portada-tronpeg-1616x1320.png` (ya a
  la proporción exacta de la card, sin recorte). Se usa la de
  1616×1320 (el doble de 808×660) para que se vea nítida en pantallas de
  alta densidad (retina).
- **Sin derechos propios, como el avatar:** ninguna de las portadas
  probadas es un asset propio con derechos — mismo criterio ya aceptado
  para `avatar.jpg` (ver "Imagen de avatar con sesión"), para los fines
  de este TP.
- **`alt=""` en la imagen:** es decorativa — trae el nombre del juego
  dibujado adentro y el botón "Jugar" es lo único accionable de la
  portada.
- **La cabecera ("Neon Circuit") también arranca oculta:** `.tablero__cabecera`
  suma `id="tablero-cabecera"` y `hidden` en el HTML; el mismo click de
  "Jugar" que oculta la portada la vuelve a mostrar
  (`cabecera.hidden = false`). Pedido de Fran — con la portada ya
  mostrando el nombre del juego dibujado adentro, la franja de arriba con
  el mismo texto quedaba redundante mientras se ve la portada.

### La card del tablero mide exactamente lo mismo que ficha + Ayuda (no todo el panel lateral)
- **Qué:** `.juego-layout` pasó a tener 4 hijos directos en vez de 2
  (sacamos los wrappers `.juego-layout__principal` y la parte de
  `.panel-lateral` que envolvía a Compartir): fila 1 = `.tablero` | `.panel-lateral`
  (ahora solo ficha-juego + Ayuda), fila 2 = `.juego-layout__secundario`
  ("Sobre el juego" + Galería) | `.compartir`. Con `align-items: stretch`,
  CSS Grid iguala por spec la altura de los dos ítems de una misma fila —
  el tablero y el panel lateral miden siempre lo mismo, sin ningún cálculo
  manual. La fila 2 usa `align-self: start` para no heredar ese estirado
  (no hace falta que "Sobre el juego"+Galería midan lo mismo que Compartir).
- **Por qué:** la versión anterior (`.tablero` con `flex: 1` dentro de un
  wrapper que agrupaba las 3 secciones de la izquierda) igualaba la altura
  del **total** de la columna izquierda contra el **total** de la derecha
  — pero eso no garantiza que el tablero en sí llegue hasta el borde de
  Ayuda, solo que la suma final coincida. Fran lo notó comparando contra una
  captura: el tablero quedaba corto porque "Sobre el juego" + Galería son
  altas y se llevaban gran parte del crecimiento. Separar en 2 filas de
  grid ata la altura del tablero directamente a la de ficha+Ayuda, que es
  la comparación que importa visualmente.
- **Compartir sigue viéndose debajo de Ayuda:** al ser la fila 2, columna
  derecha, queda en la misma posición visual de siempre (ver "Panel
  lateral" más abajo) — solo cambió de qué elemento del HTML depende su
  altura, no dónde se ve en pantalla.
- **`.tablero` pierde su `margin-top` propio:** ahora que vuelve a ser un
  hijo directo de `.juego-layout` (como en la parte 1, antes de que
  existiera el layout de 2 columnas), ese espaciado ya lo pone el
  `margin-top` del propio `.juego-layout`; dejar los dos sumaba doble
  espacio.
- **Leyenda del tablero más compacta:** `.tablero__leyenda` bajó su
  `padding-top` (16px → 8px) y su `gap` (16px → 12px), a pedido de Fran,
  para que ocupe menos alto de la card y el grid de fichas tenga más lugar
  relativo dentro de ella.
- **El tablero se desengancha del stretch después de probarlo (`align-self: start`
  + `min-height` fijo):** con `align-items: stretch` puro, el tablero no solo
  igualaba contra Ayuda en su estado inicial — la seguía en vivo cada vez
  que se abría otro `<details>` (misma fila del grid, la fila crece con
  Ayuda y el tablero la sigue). Fran probó el resultado, le gustó el alto
  que da Ayuda en su estado por default (un solo ítem abierto), pero pidió
  que el tablero se quede en esa altura "base" en vez de seguir creciendo
  cada vez que se abre un desplegable más. `.tablero` pasa a
  `align-self: start` (sale del stretch de la fila) más un `min-height: 660px`
  que congela ese alto base — valor estimado a partir del contenido de
  ficha+Ayuda en su estado inicial.
- **Confirmado, sin ajustar:** medido en pantalla, ficha+Ayuda (estado
  inicial, un solo `<details>` abierto) suman ~656px de alto natural —
  contra los 660px del `.tablero`, una diferencia de 4px, imperceptible.
  El valor estimado ya estaba bien calibrado, no hizo falta tocarlo.

### Fichas más grandes (44px → 56px), y el ancho se resuelve con el gap, no con la ficha
- **Qué:** el grid de fichas y cada `.tablero__hueco` pasaron de 44px a
  56px, con los anillos internos reescalados en proporción (`inset: 8px` y
  `17px`, antes `6px` y `13px`). Para ocupar más ancho de la card, en vez
  de agrandar la ficha de nuevo, `.tablero__grid` separó `gap` en
  `row-gap` (`--espaciado-3`, sin cambios) y `column-gap`
  (`--espaciado-8`, más grande).
- **Por qué:** con la card más grande, el tablero quedaba chico dentro de
  tanto espacio. Subir la ficha a 56px resolvió el alto ("quedaba
  perfecto", según Fran). Para el ancho, agrandar la ficha de nuevo también
  la hacía más alta (es un círculo, ancho y alto van juntos) — separar el
  gap horizontal del vertical resuelve el ancho sin tocar el alto que ya
  estaba bien.

### Fichas a 68px y de vuelta a 60px: mismo gap horizontal y vertical (`--espaciado-5`, token nuevo)
- **Qué:** al agrandar la card (ver "La card del tablero mide exactamente
  lo mismo que ficha + Ayuda"), las fichas subieron otra vez, a 68px
  (anillos en `inset: 10px`/`21px`), para aprovechar el espacio de sobra.
  Fran después pidió que el gap horizontal (32px) y vertical (12px) —
  distintos a propósito desde la decisión anterior— se acercaran a un
  punto intermedio, probando 20px para los dos. Como no había ningún token
  de 20px en la escala (`--espaciado-1..8` son `N × 4px`, pero saltea el 5
  y el 7), se agregó `--espaciado-5: 20px` en vez de escribirlo a mano.
  Subir el `row-gap` de 12px a 20px agranda el grid en alto (6 espacios ×
  8px de más = 48px), así que la ficha bajó de 68px a 60px para
  compensar y no romper el alto de la card — anillos reescalados de nuevo
  en proporción (`inset: 9px`/`18px`).
- **Por qué:** Fran lo pidió así explícitamente: un punto intermedio entre
  las dos distancias, priorizando no romper el tamaño de la card por sobre
  mantener la ficha lo más grande posible.

### La etiqueta del título va sobre una cabecera propia, no flotando sola
- **Qué:** `.tablero` se dividió en `.tablero__cabecera` (franja de arriba,
  fondo `--primario-o1`, más clara) y `.tablero__cuerpo` (donde van la
  grilla de fondo, el grid de fichas y la leyenda). El placeholder "Botón"
  vive centrado dentro de la cabecera. Se sacó el truco de
  `position: absolute` + `transform` que la hacía flotar sobre el borde
  superior de la card; ahora es un elemento normal, centrado con flexbox
  dentro de su propia franja. `.tablero` pasó a tener `overflow: hidden`
  para que esa franja respete las esquinas redondeadas de la card.
- **Por qué:** en Figma no es una etiqueta flotando sola sobre la grilla —
  hay una franja de cabecera de otro color detrás, como el header de una
  card. Fran lo marcó comparando directo contra la captura.

### Fondo negro debajo de los anillos, y hueco central más grande
- **Qué:** las fichas "activa"/"seleccionada"/"destino" ahora tienen
  `background: var(--tablero-descargado)` (el mismo negro del estado
  "descargado"), y se agrandó el espacio entre los 3 anillos (`inset: 6px`
  y `13px`, antes `9px` y `16px`).
- **Por qué:** sin fondo propio, se veía la grilla violeta de atrás
  mezclada con el resplandor de los anillos — un efecto "naranja
  difuminado" en vez del hueco negro limpio de Figma. El resplandor
  (`box-shadow`, hacia afuera del borde) sigue intacto, solo que ahora
  tiene un fondo negro sólido detrás para contrastar en vez de transparencia.

### Anillo de las fichas: son 3 (no 2), y la leyenda usa el mismo dibujo
- **Qué:** las fichas "activa"/"seleccionada" no son un borde sólido +
  un punteado; son 3 anillos concéntricos (sólido afuera, punteado bien en
  el medio de la banda, sólido chico adentro) con el centro hueco de
  verdad. Se agregó un tercer anillo con `::after` (antes solo estaba el
  `::before` punteado, que quedaba pegado al hueco central en vez de ir
  centrado en la banda). Los íconos de la leyenda (`.tablero__muestra`)
  usan exactamente el mismo dibujo a escala, no una versión simplificada.
- **Por qué:** Fran comparó contra el zoom real de Figma — ahí se ve que
  son 3 trazos, no 2, y que la leyenda tiene que ser igual a la ficha
  grande, no un ícono aparte.

### Ajustes visuales del tablero contra la captura de Figma (ronda 2)
Fran comparó el resultado con la captura real de Figma y marcó 3 diferencias,
más una que sumamos nosotros al revisar:
- **Fondo con grilla:** `.tablero` tenía un fondo violeta liso; Figma tiene
  una grilla tenue de líneas. Se agregó con dos `linear-gradient` de 1px
  (uno horizontal, uno vertical) repetidos cada 28px, con un token nuevo
  `--tablero-grilla` (rgba de `--primario`, bien tenue). El
  `background-image` respeta el `border-radius` de la card solo, sin
  necesitar `overflow: hidden` — importante, porque eso hubiera cortado la
  mitad de arriba de la etiqueta del título.
- **Fichas con anillo doble:** `.tablero__hueco--activo`/`--seleccionado`
  tenían un solo `border: 3px dashed`, que se veía como gajos en vez de un
  aro prolijo. Ahora son dos capas: un borde sólido (con resplandor) en el
  propio `div`, más un `::before` punteado más adentro (`inset: 6px`) —
  igual que en Figma. Una variable CSS local (`--color-ficha`) evita repetir
  el color de cada estado en los 3 lugares que lo usan (borde, resplandor,
  anillo interno).
- **Marco del título:** poco padding y sin resplandor. Se le subió el
  padding, el grosor del borde (1px → 2px) y se sumó un `box-shadow` sutil
  del mismo color, para que combine con el resto de la estética "neón" del
  tablero.
- **Leyenda en mayúsculas:** de nuestra cuenta, comparando las dos capturas
  — el estilo "técnico" de Figma usa mayúsculas con letras espaciadas.
  Se resolvió con `text-transform: uppercase` y `letter-spacing`, sin sumar
  ninguna fuente nueva (sigue en `--font-ui`, achicado a 12px para que no
  se vea grande al ir en mayúsculas).

### Paleta del tablero: valores elegidos (definitivos, no se tocan)
- **Qué:** `--tablero-activo: #FF6A1A` (naranja), `--tablero-descargado:
  #0B0710` (casi negro), `--tablero-seleccionado: #3FE8E4` (celeste-cian),
  `--tablero-destino: #B79CF0` (violeta claro).
- **Por qué:** confirmado con Agus — estos 4 son los únicos colores del
  tablero, no hay que compararlos contra ninguna captura nueva de Figma.
  (Esto no incluye las imágenes de los juegos en sí, que van con su color
  real, sin restricción de paleta.)

### Panel lateral: tablero + ficha/Ayuda/Compartir en dos columnas, solo desktop
- **Qué:** `.juego-layout` es un grid de 2 columnas (320px fijo para la
  derecha, el resto para la izquierda) y 2 filas: tablero / ficha+Ayuda
  arriba, "Sobre el juego"+Galería / Compartir abajo. Compartir queda
  debajo de Ayuda, en la misma columna, aunque ya no comparte wrapper HTML
  con `.panel-lateral` — ver "La card del tablero mide exactamente lo mismo
  que ficha + Ayuda" más arriba, que explica por qué se separó en 2 filas.
  Sin `@media`, porque la página del juego no necesita mobile first (regla
  del proyecto).
- **Por qué:** así está en la captura de Figma que confirmó Fran — Compartir
  va debajo de Ayuda, en la misma columna lateral, no debajo de la Galería.
  Al principio Compartir había quedado como sección suelta a ancho completo
  porque se armó antes de tener esa captura puntual del layout completo.

### Acordeón de Ayuda con `<details>`/`<summary>`, no JS a mano
- **Qué:** cada ítem ("Cómo se juega", "Objetivo", "Puentes", "Puntaje") es
  un `<details>`; el primero con el atributo `open`. El signo "+"/"−" es un
  `::after` sobre `summary` que cambia solo con el selector `[open]`.
- **Por qué:** es exactamente el comportamiento que hace falta (expandir/
  colapsar, uno a la vez o varios juntos, todo announced correctamente por
  lectores de pantalla) y el navegador ya lo resuelve solo, sin estado en
  JS ni manejo de foco a mano — a diferencia del selector de Login (que sí
  necesitó ARIA de tabs a mano porque el comportamiento ahí es "tabs", no
  "acordeón").
- **Contenido de "Puentes" y "Puntaje":** son reglas del juego terminado
  (todavía no programadas — la lógica de movimientos es de una etapa
  aparte). El texto de "Puentes" aclara que este tablero clásico de 33 no
  los usa, en vez de prometer algo que no está.

### Miniatura de la ficha del juego: ahora con imagen real (antes, gradiente con la paleta del tablero)
- **Qué:** `.ficha-juego__miniatura` pasó de un `linear-gradient` (con
  `--tablero-activo`, `--tablero-seleccionado` y `--tablero-destino`) a
  `background: url("../assets/img/miniatura-neon-circuit.png") center / cover`.
- **Por qué antes era un gradiente:** todavía no había ningún asset real
  para Neon Circuit. Reusar la paleta del tablero mantenía la miniatura
  coherente con el resto de la página sin depender de un archivo nuevo.
- **Por qué ahora es una imagen:** ya existe una portada real para el
  juego (ver "Portada con botón Jugar"). `miniatura-neon-circuit.png` es
  la misma imagen `tron-peg-efectos.png` que probamos para la portada
  grande, copiada sin recortar — es 1080×1080 (1:1), el mismo cuadrado
  que ya usa `.ficha-juego__miniatura` (56×56px), así que no hace falta
  ningún ajuste de proporción. A ese tamaño el texto ("Neon Circuit",
  "Peg Solitaire") no se llega a leer, queda como un ícono abstracto de
  colores — el mismo efecto visual que ya tenía el gradiente, no una
  regresión.

### "Sobre el juego": texto propio, no copiado de la captura
- **Qué:** `.sobre-juego` es un párrafo simple (`max-width: 70ch` para que
  las líneas no queden demasiado largas de leer), con un texto escrito para
  este juego puntual, no una copia literal de Figma (la captura estaba muy
  chica para transcribir bien).
- **Por qué:** describe la mecánica real que ya está definida (saltos en
  línea recta, 33 nodos, objetivo de terminar con el mínimo posible),
  consistente con el resto de la página en vez de un texto genérico.

### Galería con gradientes de la paleta del tablero, `aria-hidden` por ahora
- **Qué:** `.galeria__grid` tiene 6 `<li>` sin contenido, cada uno con un
  `linear-gradient` distinto combinando los tokens `--tablero-*` (y algún
  color del sitio, como `--acento`/`--primario`, para variar más). Toda la
  lista tiene `aria-hidden="true"`.
- **Por qué:** decisión de Fran y Agus — todavía no hay capturas reales del
  juego (se resuelven en otra parte), y unos gradientes lisos sin `alt` no
  aportan nada a quien usa lector de pantalla; mejor ocultarlos que anunciar
  6 elementos vacíos. Cuando haya fotos reales con su `alt` correspondiente,
  se saca el `aria-hidden`.

### Reseñas de Comunidad: 3 distintas, no la misma repetida
- **Qué:** 3 reseñas con nombre, fecha, puntaje y largo de texto distintos
  (una larga, una media, una cortita), en vez de copiar la captura de Figma
  que repite el mismo texto de "Malena F." tres veces.
- **Por qué:** es justo el tipo de dato repetido/genérico que el enunciado
  pide evitar. Los avatares son un círculo con iniciales (sin foto real
  todavía), con un color distinto por reseña.
- **Estrellas con caracteres Unicode, no íconos:** `★`/`☆` como texto,
  `aria-hidden` en el visual y un `sr-only` al lado con el puntaje en
  palabras ("Puntaje: 5 de 5"). Evita depender de un ícono "relleno" que no
  existe en la hoja de Phosphor que carga el proyecto (ver el bug que le
  marcamos a Agus en el PR de la Home: la hoja `regular` no trae `-fill`).

### "Dejá tu reseña": el puntaje es CSS puro (radios + labels), sin JS
- **Qué:** `.estrellas` es un `<fieldset>` con 5 `<input type="radio">` en
  orden inverso (5,4,3,2,1) + sus `<label>`, dado vuelta visualmente con
  `flex-direction: row-reverse`. Con `input:checked ~ label` y
  `label:hover ~ label` (combinador de hermanos siguientes) se pinta la
  estrella elegida y todas las anteriores en pantalla.
- **Por qué:** es el truco clásico de "rating con radios": nace accesible
  (son inputs de verdad, con foco y selección por teclado) y no hace falta
  ninguna línea de JS. El input queda invisible (`opacity: 0`) pero sigue
  ocupando su lugar, así que el foco de teclado se redirige a su label con
  `input:focus-visible + label`.
- **Sin eco numérico ("4/5") al lado:** en Figma aparece, pero como no hay
  JS enganchado al puntaje, ese número quedaría desactualizado en cuanto
  alguien tocara otra estrella. Mejor no mostrarlo que mostrar uno
  incorrecto.

### Contador de caracteres y botón "Copiar", en archivos propios
- **Qué:** `js/resena.js` (contador del textarea, actualiza un `<span>` en
  cada `input`) y `js/compartir.js` (copia el link con
  `navigator.clipboard.writeText` y cambia el texto del botón a "¡Copiado!"
  por 2 segundos) son archivos nuevos, no se sumaron a `juego.js`.
- **Por qué:** `juego.js` es la lógica del tablero (una responsabilidad
  puntual); estos dos son widgets sueltos de la página, sin relación entre
  sí ni con el juego. Separarlos sigue el mismo criterio que ya usa el
  proyecto en la Home (`carousel.js`, `home.js`, `menu.js` aparte).

### Compartir sin backend real
- **Qué:** los botones de redes sociales y "Mensaje" son placeholders
  (`href="#"`, sin navegar a ningún lado todavía). El único que hace algo
  real es "Copiar".
- **Por qué:** no hay integraciones reales armadas (compartir a redes,
  mensajería interna) — se deja para cuando exista esa lógica. "Copiar" sí
  se resolvió porque es una sola función del navegador (`clipboard`), sin
  ninguna dependencia externa.

### Excepción puntual: la página del juego se queda sin `h1`
- **Qué:** se sacó el `<h1>Neon Circuit</h1>` de `juego.html`. La página
  arranca directo con el breadcrumb (que ya termina en "Neon Circuit" como
  página actual) y sigue con `h2` en adelante.
- **Por qué:** decisión explícita de Fran, sabiendo que contradice la regla
  general del proyecto ("un solo `h1` por página") — se dejó pasar puntual
  para esta página porque el nombre del juego ya queda claro en el
  breadcrumb, justo arriba, y repetirlo como título grande se sentía
  redundante. No se aplica al resto del sitio: Home y Login siguen
  necesitando su `h1`.
- **Costo asumido:** sin `h1`, alguien que navegue saltando de heading en
  heading (lectores de pantalla) no tiene un punto de entrada claro al
  contenido principal, y la página pierde el título de mayor jerarquía para
  buscadores. Se acepta ese costo puntualmente acá.

### Se sacó el botón "Reiniciar" suelto debajo del `h1`
- **Qué:** se sacó la `<section id="controls">` con el botón "Reiniciar"
  que quedaba entre el `h1` y el tablero, de una versión vieja de la página
  (de antes de tener las capturas de Figma).
- **Por qué:** decisión de Fran — no está en el diseño y, sin lógica de
  juego todavía, no hacía nada (no tenía ningún `addEventListener`
  enganchado). "Reiniciar tablero" ya está como atajo de teclado (`R`) en
  el panel de Ayuda; si hace falta un botón real más adelante, se agrega
  ahí como acción del juego, no suelto en la parte de arriba.

### Comunidad y "Dejá tu reseña" reusan el layout de 2 columnas
- **Qué:** el mismo `.juego-layout` que ya arma tablero + panel lateral se
  reusa para esta fila: Comunidad (columna ancha) y "Dejá tu reseña"
  (columna de 320px), uno al lado del otro.
- **Por qué:** confirmado con la captura de Figma que pasó Fran — es
  exactamente el mismo layout de 2 columnas, así que reusar la clase evita
  duplicar el mismo CSS con otro nombre.

### "Enlaces relacionados" se sacó de la página
- **Qué:** se sacó por completo la sección con los 4 links (WardenDevs,
  Sitio Oficial, Red Prisma, Ajedrez) que estaba debajo de Compartir, junto
  con su CSS (`.enlaces-relacionados*`).
- **Por qué:** decisión de Fran — no la vamos a usar. No hay ninguna de esas
  páginas/juegos armada todavía y no está en el plan sumarlas.

### Números de la ficha ("Jugando ahora", "Tu récord", rating) simulados
- **Qué:** 4.7 de rating, 1.284 reseñas, 8.412 jugando ahora, 3 nodos de
  récord — son valores fijos en el HTML, no vienen de ningún lado.
- **Por qué:** Neon Circuit es nuestro propio juego (no viene de la API de
  la cátedra, que trae juegos de terceros para el catálogo de la Home). No
  hay backend de puntajes ni de sesiones concurrentes todavía (`js/api.js`,
  ítem "Plus" pendiente), así que son simulados a propósito, mismo criterio
  que ya se usó para "Partida guardada" y el estado de sesión del header.

---

## Componentes

### Cards que se elevan sobre las vecinas en hover
- **Qué:** `transform: scale(1.06)` + `z-index: 1` en hover y `:focus-within`.
- **Por qué:** feedback claro de qué card está activa; `:focus-within` hace que funcione
  también con teclado. En Figma no se puede mostrar el z-index dinámico; en código sí.
- **Movimiento reducido:** se desactiva con `prefers-reduced-motion`.

### Las 4 animaciones de hover de los botones (revisado en la 2ª corrección)
- **Qué:** primario se eleva (`translateY` + sombra); secundario tiene un relleno que
  entra deslizando de izquierda a derecha (`::before` con `scaleX`); terciario tiene un
  subrayado que crece de izquierda a derecha (`::after` con `scaleX`); destructivo tiene
  un pulso/resplandor rojo que crece y se desvanece (`@keyframes` sobre `box-shadow`,
  en loop mientras dura el hover). 4 animaciones distintas para los 4 estilos de botón.
- **Por qué:** el enunciado pide un mínimo de 3 animaciones de hover distintas; al
  principio primario y destructivo compartían la de elevar. La 2ª corrección del TPE1
  pidió explícitamente que las 4 variantes tengan hover distinto entre sí, así que
  sumamos una 4ª. Para destructivo buscamos algo que comunique "cuidado" sin ser tan
  brusco como un shake (más fácil de explicar en la defensa) y que sea mecánicamente
  distinto a los otros tres (animación con `@keyframes`, no con `transition`).
- **Token nuevo:** `--sombra-elevacion` (rgba sin alfa en ningún token existente, para
  la sombra del hover de primario) y `--resplandor-error` (rgba de `--error`, para el
  pulso de destructivo), ambos en `variables.css`.
- **`appearance: none` en `.btn`:** lo agregamos porque, sin él, algunos navegadores le
  aplican su propio estilo nativo de botón (bordes, colores) por encima del nuestro. Con
  `appearance: none` el botón se ve igual en todos lados y depende solo de nuestro CSS.
- **Movimiento reducido:** con `prefers-reduced-motion`, ninguna transición ni animación
  corre. Primario no se eleva, secundario y terciario aparecen de golpe, y destructivo
  muestra el resplandor fijo (sin loop) para no perder el feedback de hover.
- **Reemplaza una decisión anterior:** antes habíamos descartado una 4ª animación para
  destructivo (un shake) porque el enunciado pedía 3 como mínimo, no exactamente 3. La
  corrección del profesor cambió el criterio: ahora se pide explícitamente que sean 4
  distintas, una por variante.

### Componente `.link`, con dos variantes (cerrado: no hay una tercera captura de Figma para esto)
- **Qué:** `.link` (color `--acento` siempre, con el subrayado animado que
  crece de izquierda a derecha en hover/foco, reutilizando la misma
  animación que `.btn--terciario` en vez de sumar una 5ª) y `.link--blanco`
  (color heredado — blanco/lila según el texto que lo rodea — que pasa a
  celeste en hover/foco, con el subrayado nativo del navegador en vez del
  animado).
- **Por qué dos variantes, no una:** aclarado por Agus — no hay un
  componente único de Figma para esto, sino dos usos distintos ya
  presentes en el sitio: `.link` es para resaltar una palabra suelta
  dentro de una oración (ej. "Acepto los **términos**" del checkbox de
  login, celeste de entrada porque tiene que notarse que es clickeable en
  medio de texto plano) y `.link--blanco` es para un link suelto que no
  necesita destacar hasta que se interactúa con él — mismo criterio que ya
  usan los links del footer (`.footer a`, footer.css: heredan el color y
  pasan a celeste en hover, sin subrayado animado).
- **`.link--blanco` no inventa un estilo nuevo, reusa el del footer:**
  mismos valores (`color: inherit` → `var(--acento)` en hover/foco) en vez
  de un tercer componente de color propio.

### Botón de newsletter unificado a `.btn`
- **Qué:** el botón "Suscribirse" del footer tenía su propio estilo hardcodeado en
  `footer.css` en vez de usar `.btn--secundario`. Se unificó: ahora es
  `<button class="btn btn--secundario">` y `footer.css` solo le agrega `flex-shrink: 0`.
- **Por qué:** era el tipo de botón "suelto" que señalaba la corrección "muchos botones
  diferentes" — un componente que ya existía (`.btn--secundario`) se estaba reinventando
  en otro archivo.

---

## Menús desplegables del header (Etapa 3c)

### Un solo componente `.menu-dropdown` para hamburguesa y cuenta
- **Qué:** ninguno de los dos menús existía todavía en el código (el botón
  hamburguesa y el avatar estaban armados pero sin nada atrás). Se
  construyeron los dos juntos, compartiendo el mismo componente visual:
  card flotante con bordes redondeados, fondo `--superficie`, divisores
  (`<hr>`) entre secciones, mismo espaciado e íconos en `--acento`.
- **Por qué:** la corrección pedía "unificar" el estilo — el hamburguesa (una
  lista plana de categorías, panel de ancho completo) y el de cuenta (card
  angosta con cabecera) tenían estructuras visuales distintas. Se calcó el
  estilo del menú de cuenta (el que le había gustado más al profesor) y se
  le aplicó también al hamburguesa.
- **`z-index: 200`, más alto que el banner:** el coverflow de "Destacados"
  usa z-index hasta 100 en sus cards. La primera versión del dropdown tenía
  z-index 50 y quedaba tapado por las cards del banner donde se
  superponían en pantalla (un bug real, no solo teórico — se vio al probarlo:
  la mitad de los items del menú de cuenta desaparecían detrás del banner).

### Contenido del hamburguesa: 2 secciones + un botón de contacto, no una lista de 7
- **Qué:** "Jugar" (Destacados, Últimos, Recientes, Top 100, Actualizados —
  los mismos links que ya están en la columna "Jugar" del footer) y
  "Categorías" (las mismas 8 categorías que arma `home.js`), más un botón
  "Contáctanos" (`mailto:hola@warden.gg`, el mismo mail que usa el footer).
- **Por qué:** la corrección pedía más contenido, organizado en secciones
  (referencia: el menú de CrazyGames, con íconos por ítem). En vez de
  inventar secciones o páginas que no existen, se reutiliza vocabulario que
  el sitio ya tiene en el footer y en la Home — nada nuevo que mantener ni
  explicar en la defensa.

### De 4 a 8 categorías, elegidas por cuántos juegos reales tienen
- **Qué:** se suman Indie, Plataformas, Puzzle y Estrategia a las 4 que ya
  había (Acción, Shooters, RPG, Aventura), en `CATEGORIAS` (`home.js`) y en
  el hamburguesa (siempre las mismas en los dos lugares).
- **Por qué:** se eligieron mirando cuántos juegos reales matchean cada
  género en el catálogo de la API (de 70 en Acción a 2 en Estrategia) — no
  quedan géneros con 0 o 1 solo juego, que harían una fila casi vacía o que
  ni se llegue a mostrar (`crearFila()` no agrega nada si no hay resultados).
- **`JUEGOS_DE_RESPALDO` también se actualiza:** se suman "Limbo" (Indie +
  Plataformas) y "Company of Heroes 2" (Estrategia) para que, si la API
  falla, las categorías nuevas igual tengan algo real para mostrar.

### El avatar con sesión pasa de `<a>` a `<button>`
- **Qué:** `data-sesion="usuario"` era un `<a href="#">`; ahora es un
  `<button type="button" aria-expanded aria-controls="menu-perfil">`. El
  avatar sin sesión (`data-sesion="invitado"`) sigue siendo `<a
  href="login.html">`.
- **Por qué:** ahora que tiene un dropdown atrás, la acción es "abrir un
  menú" (una interacción local), no "navegar a otra página" — eso es
  semánticamente un botón, no un link. El de invitado sí navega de verdad
  (a `login.html`), por eso se queda como `<a>`.
- **`appearance: none` en `.header__avatar`:** al pasar a `<button>` para el
  caso con sesión, hacía falta el mismo reset que ya tiene `.btn` — si no,
  el navegador le pinta su fondo nativo encima (el mismo bug ya documentado
  para `.btn` y para `.auth-switch__btn` de Fran en el PR de login).

### `js/menu.js`: un solo archivo maneja los dos menús
- **Qué:** busca todos los botones con `aria-controls` + `aria-expanded` y
  les engancha abrir/cerrar, cerrar al clickear afuera, cerrar con Escape
  (devolviendo el foco al botón), y que solo uno quede abierto a la vez.
  Clickear un link o "Cerrar sesión" adentro también cierra el menú.
- **Por qué:** son links placeholder (`href="#"`), no navegan a ningún
  lado — sin este cierre automático, el menú se quedaría abierto para
  siempre después de clickear algo adentro.
- **"Cerrar sesión" no cambia el estado de sesión:** solo cierra el menú.
  No hay login real todavía (`data-sesion` sigue siendo un estado fijo en
  el HTML), así que no hay nada real que "cerrar". Cambiar el avatar
  visible de vuelta a invitado se deja para cuando haya sesión real.

### Imagen de avatar con sesión: la que pasó Agus (no libre de derechos)
- **Qué:** `assets/img/avatar.jpg` es un collage de arte de Spider-Man
  (personaje de Marvel), no una imagen propia ni de stock libre.
- **Por qué:** decisión explícita de Agus, sabiendo que no es una imagen con
  derechos propios, para los fines de este TP. Si en algún momento hay que
  sacarlo (por ejemplo si se comparte el link más ampliamente), reemplazar
  ese archivo por una imagen propia o de stock no rompe nada más: el resto
  del sitio solo lo referencia por esa ruta.

---

## Sesión simulada persistida en `localStorage`

### `js/sesion.js` nuevo: la sesión sobrevive la navegación de login.html a index.html
- **Qué:** hasta ahora, `data-sesion` era un estado fijo en el HTML de cada
  página (Home siempre invitado, juego siempre con sesión) — no había forma
  de "loguearte" de verdad y que se notara en otra página. `sesion.js` guarda
  una clave (`warden-sesion`) en `localStorage` cuando `iniciarSesion()` se
  llama, y al cargar cualquier página que lo importe, `aplicarEstadoSesion()`
  togglea los dos avatares del header según esa clave.
- **Por qué:** completar el flujo que pide el enunciado: login/registro con
  datos válidos tiene que llevarte a la sesión iniciada. Sin backend, la
  única forma de que ese estado "viaje" de `login.html` a `index.html` es
  guardarlo en el navegador.
- **`localStorage`, no una cookie ni un query param:** no hace falta que
  viaje al servidor (no hay servidor), y a diferencia de un query param
  (`?sesion=1`) no se pierde si alguien navega a mano o recarga.
- **No hace falta un segundo `index.html`:** se evaluó tener una página
  aparte para el estado logueado, pero hubiera duplicado header, footer,
  banner y toda la lógica de filas de `home.js` para lograr lo mismo que ya
  hace `home.js` leyendo el estado del avatar — la única pieza que faltaba
  era que ese estado se pudiera "encender" desde otra página.
- **`sesion.js` se carga antes que `home.js`/`menu.js`:** los scripts con
  `defer` corren en el orden en que aparecen en el HTML. `aplicarEstadoSesion()`
  tiene que correr antes de que `home.js` decida qué filas armar, si no
  arma las filas con el estado viejo.
- **Toca `js/login.js` (de Fran):** se le agregan dos llamadas a
  `iniciarSesion()` (login y registro exitosos, antes de cada redirect a
  `index.html`). El resto del archivo no cambia.
- **"Cerrar sesión" ahora hace algo:** antes solo cerraba el menú (era un
  placeholder). Ahora llama a `cerrarSesion()` (borra la clave) y recarga la
  página — la forma más simple de que la Home se vuelva a armar en estado
  invitado sin duplicar la lógica de renderizado de `home.js`.

---

## Correcciones al PR #4 (página del juego), tras un code review

Un review encontró 5 bugs reales en lo que Fran mergeó en el PR #4. Se
corrigieron directo, sin cambiar el diseño:

- **Área táctil del puntaje de reseña, de 24px a 44px:** `.estrellas
  label`/`.estrellas input` usaban `--control-target` (24px, el mínimo
  WCAG). Es un control de ícono (una estrella, sin texto visible), y la
  regla del proyecto pide `--control-alto` (44px) para esos casos — mismo
  criterio que ya se usa en el header y en el botón de mostrar contraseña
  del login.
- **El form de "Dejá tu reseña" hacía submit real:** sin `preventDefault()`,
  clickear "Publicar" recargaba la página (perdiendo el puntaje y el texto
  ya escritos) y de paso reiniciaba el resto de la página (el tablero volvía
  a la portada). Se le agregó un handler en `resena.js` que previene el
  submit, resetea el form y muestra un mensaje (`role="status"`,
  `#resena-estado`) confirmando el envío. Sigue sin backend (ver
  "Pendientes de decidir"): "publicar" hoy es solo feedback visual, no
  guarda la reseña en ningún lado.
- **`compartir.js` sin manejar el error de `clipboard.writeText()`:** la API
  de portapapeles necesita un contexto seguro (https o localhost) y puede
  fallar al abrir el archivo con `file://`, que es como se prueba en local.
  Ahora un `try/catch` cambia el texto del botón a "No se pudo copiar" en
  vez de quedar como una promesa rechazada sin ningún feedback.
- **Se perdía el foco al clickear "Jugar":** el botón `#btn-jugar` (que
  tenía el foco) se ocultaba junto con la portada sin mover el foco a
  ningún lado, así que quedaba en el `<body>`. Se le agregó `tabindex="-1"`
  a `#tablero-cabecera` (lo primero visible del tablero real) y
  `juego.js` le hace `.focus()` al mostrarla.
- **`aria-label="Tablero de Peg Solitaire"` desactualizado:** el resto del
  PR había renombrado todo a "Neon Circuit" menos ese atributo. Se corrigió
  a `aria-label="Tablero de Neon Circuit"`.

---

## Carrito de compras (parte 1: motor + header + filas de la Home)

No es el sistema de compras real que pide el enunciado (eso sigue en
"Pendientes de decidir": falta método de pago, precios reales, etc.). Esto
es la mecánica de agregar/quitar juegos y verlos en el header, para no
bloquear esa parte de la interfaz hasta que exista un backend de pagos.

- **`js/carrito.js` nuevo, mismo patrón que `sesion.js`:** guarda el
  carrito en `localStorage` (clave `warden-carrito`) como un array de
  `{id, nombre, imagen}`. Se carga antes que `home.js` (que agrega juegos
  al carrito) y no depende de ningún otro archivo.
- **Sin cantidad, un juego entra una sola vez:** son licencias digitales,
  no unidades de supermercado — no tiene sentido "comprar 2" del mismo
  juego. El botón de la card alterna entre "Agregar al carrito" y "Quitar
  del carrito" en vez de sumar de a uno.
- **Qué juegos son "de pago", simulado:** no hay precios reales todavía
  (ver "Pendientes de decidir"), así que `esDePago(id)` en `carrito.js`
  decide de forma determinística por `id % 3 === 0` — no con
  `Math.random()` en cada render, que haría que un juego ya agregado al
  carrito "dejara" de tener el botón al recargar la página. Solo esas
  cards muestran el botón; las demás quedan como estaban.
- **El ícono de carrito del header ya existía como placeholder** (`<a
  href="#">` sin funcionalidad). Se convirtió en un botón que abre un
  desplegable, reusando el mismo componente `.menu-dropdown` que ya
  comparten el menú de cuenta y el hamburguesa — no un componente nuevo.
- **`menu.js` no se tocó:** ya busca genéricamente cualquier botón con
  `aria-controls` + `aria-expanded` y lo conecta (abrir/cerrar, click
  afuera, Escape). El botón del carrito sigue ese mismo patrón, así que
  quedó enganchado solo.
- **El botón "Quitar" de cada ítem frena la propagación del click
  (`stopPropagation`):** el listener de `menu.js` que cierra cualquier
  menú abierto al clickear en cualquier lado (adentro o afuera) no
  distingue el origen del click. Sin frenarlo ahí, sacar un ítem cerraría
  todo el desplegable en vez de dejarlo abierto para sacar varios.
- **"Seguir comprando" y "Pagar carrito" son links (`<a href="#">`), no
  botones:** así heredan gratis el cierre automático del desplegable que
  `menu.js` ya aplica a cualquier link de adentro de un menú (mismo
  criterio que "Mi perfil", "Favoritos", etc. en el menú de cuenta).
  "Pagar carrito" no lleva a ningún lado todavía — no existe sistema de
  compras real (ver "Pendientes de decidir").
- **Numerito del carrito, oculto con `[hidden]` si está vacío:** en vez de
  mostrar "0" todo el tiempo. Mismo criterio que el resto del proyecto
  para estados vacíos (ej. una fila de categoría sin resultados no se
  muestra).

### Bug real: el botón de la card no respondía al click con mouse
- **Qué:** el arrastre de `carrusel-fila.js` hace `pointerdown.preventDefault()`
  sobre toda la pista, para evitar el "fantasma" de arrastrar una imagen. Por
  la spec de Pointer Events, cancelar el `pointerdown` también cancela los
  eventos de mouse de compatibilidad que vienen después — incluido el
  `click`. Como el botón "Agregar al carrito" vive dentro de la pista, un
  click que arrancaba justo sobre el botón quedaba comido por ese
  `preventDefault()` de la fila, sin ningún error visible.
- **Por qué se corrigió así:** en el listener de `pointerdown` de
  `carrusel-fila.js`, si `evento.target.closest('button, a')` frena antes de
  arrancar el arrastre (`return` temprano) — el `preventDefault()` nunca se
  llama para ese click, así que el navegador sí dispara el `click` normal
  sobre el botón. El arrastre en el resto de la card (imagen, texto) sigue
  igual.

### El botón pasa de texto a ícono, superpuesto en la esquina de la imagen
- **Qué:** `.game-card__carrito` dejó de ser un `.btn--secundario` con
  texto debajo de la card — ahora es un botón solo-ícono
  (`ph-shopping-cart-simple`), circular, superpuesto en la esquina inferior
  derecha de la imagen (`.game-card__media` pasa a `position: relative`
  para anclarlo). El estado "ya está en el carrito" se comunica con
  `aria-pressed` (no con cambiar el texto, que ya no existe): CSS lo lee
  con el selector de atributo `[aria-pressed="true"]` y lo pinta relleno
  con `--acento`, más `transform: scale(0.9)` — queda "hundido" a
  propósito, para que se note de un vistazo cuál ya se agregó sin tener
  que leer nada.
- **Por qué:** pedido explícito — menos intrusivo sobre la card (no le
  agrega una fila entera de alto) y el estado "pressed" persistente es más
  directo que un cambio de texto para comunicar "ya lo agregaste".
- **Sigue siendo accesible sin texto visible:** `aria-label` dinámico
  ("Agregar/Quitar `<nombre>` del carrito", `carrito.js`) y el ícono con
  `aria-hidden`, mismo patrón que cualquier otro control de solo ícono del
  proyecto (44px de área táctil, `--control-alto`, aunque el ícono se vea
  chico).
- **Token nuevo `--fondo-o1`:** rgba de `--fondo` al 75%, para que el
  círculo del botón se distinga incluso sobre imágenes claras — ninguno de
  los tokens existentes era una versión translúcida de `--fondo`.
- **Actualizado después (pedido de Agus): el ícono se saca de encima de la
  imagen.** Pasa a vivir en una fila nueva (`.game-card__cuerpo`) junto con
  el nombre y el puntaje, no superpuesto a `.game-card__media` — queda a la
  misma altura que ese texto, a la derecha. `.game-card__media` pierde el
  `position: relative` (ya no ancla nada) y `.game-card__title`/
  `.game-card__rating` pierden los márgenes que antes los separaban del
  borde de la card (ahora ese espacio lo da el `padding` de
  `.game-card__cuerpo`, compartido con el botón). De paso, esto deja
  `.game-card__title--solo` (el ajuste puntual para "Mis juegos") sin uso:
  se saca, porque ahora el espaciado sale del `padding` del contenedor para
  cualquier card, tenga rating o no. `--fondo-o1` queda igual (sigue
  funcionando bien sobre el fondo de la card), aunque ya no hace falta que
  se distinga sobre una imagen.

## Carrito de compras (parte 2: banner Destacados)

- **`crearBotonCarrito()` se mudó a `carrito.js`:** hasta acá vivía
  duplicada la lógica (crear el botón, el ícono, el `aria-pressed`, el
  click) en `home.js`. Ahora es una función compartida
  (`crearBotonCarrito(juego, clase)`, la `clase` es lo único que cambia
  entre `.game-card__carrito` y `.banner__carrito`) — `carousel.js` la
  reusa igual que `home.js`, en vez de reescribirla.
- **`evento.stopPropagation()` en el click, ahora sí necesario:** cada
  `.banner__slide` tiene su propio listener de click (`irA(index)`) — sin
  frenar la propagación, clickear el ícono de carrito también dispararía
  ese click del slide (sin romper nada porque la card ya está activa
  cuando el ícono es clickeable, pero no hace falta que compitan).
- **Neon Circuit no tiene ícono de carrito:** es nuestro propio juego, no
  algo que salga del catálogo de la API — ya tiene su propia acción real
  (el botón "Jugar" que aparece en hover). `crearSlide()` lo excluye por
  comparación de referencia (`juego !== NEON_CIRCUIT`).
- **El ícono va arriba a la derecha, no abajo a la derecha como en las
  filas de la Home:** se probó abajo primero (mismo lugar que
  `.game-card__carrito`), pero `.banner__nombre` (el título del juego) ya
  ocupa esa franja de punta a punta — un título largo como "Counter-Strike:
  Global Offensive" quedaba tapado por el círculo. Arriba a la derecha
  queda simétrico a la etiqueta "Destacado" (arriba a la izquierda) y no
  compite con ningún otro texto.
- **Visible solo si la card está activa, sin necesidad de hover:** mismo
  criterio de "invisible y no alcanzable por Tab si no está activa" que ya
  usa el botón "Jugar" (una card rotada al costado no debería ser un
  tab-stop). A diferencia de "Jugar", no hace falta además pasar el mouse
  para verlo una vez activa — es un ícono chico en una esquina, no una
  superposición grande que tape el resto de la card.
- **Bug real encontrado al probarlo — el click no le pegaba al ícono:**
  con el botón del tamaño real del ícono (44px, en la esquina), clickear
  ahí no hacía nada; `boton.click()` desde consola sí agregaba el juego,
  así que el handler estaba bien enganchado. Se confirmó con
  `document.elementFromPoint()` en el centro exacto del botón: devolvía
  `.banner__escena` (un ancestro), no el botón. Es la misma familia del
  bug de hit-testing que ya está documentado para el propio coverflow
  ("Carrusel coverflow: perspective + rotateY..." más arriba) — dentro de
  un ancestro con `perspective()` en su `transform` (acá, el propio
  `.banner__slide`), las coordenadas de click no siempre coinciden con la
  posición visual de un hijo chico y absolutamente posicionado.
  - **Solución, igual que ya se usa para "Jugar":** el `<button>` pasa a
    cubrir toda la card (`inset: 0`, sin fondo ni borde propios) en vez de
    ser del tamaño del ícono. El círculo que se ve sigue siendo chico —
    ahora es un `<span class="carrito-icono">` interno, anclado arriba a
    la derecha — pero el ÁREA que reacciona al click es toda la card, así
    que cualquier desvío del hit-testing sigue cayendo adentro.
  - **Por qué no se notó con "Jugar":** ese botón YA cubría toda la card
    desde el principio (fue diseñado así, ver "Neon Circuit es clickeable"
    más arriba) — el bug existe igual ahí, pero como el área objetivo es
    del tamaño de toda la card, un desvío de unos pocos píxeles no alcanza
    a sacar el punto de click afuera. Con un blanco de 44px sí alcanza.
  - **Consecuencia asumida:** clickear en cualquier parte de la card activa
    de un juego "de pago" (no solo el ícono) agrega/quita del carrito —
    igual que clickear en cualquier parte de la card activa de Neon Circuit
    ya llevaba a "Jugar", no solo su ícono. Es la misma mecánica que ya
    estaba aceptada en el banner, aplicada al nuevo botón por la misma
    razón técnica.
- **`DESTACADOS_DE_RESPALDO` (`carousel.js`) suma `id`:** no los tenía
  (el respaldo de `carousel.js` es una lista aparte de la de `home.js`,
  con sus propios juegos). Sin `id`, `esDePago()` no tiene con qué decidir.
  Se usaron ids fuera del rango real de la API (101-105) para que no
  choquen si algún día conviven datos reales y de respaldo en la misma
  sesión.

---

## Sistema de compras (parte 1: modal de pago simulado)

Primera mitad del ítem "Sistema de compras" de `ETAPAS.md` (el único que el
enunciado pide sin marcar como opcional). Sin captura de Figma: a diferencia
del resto del sitio, acá no hubo diseño previo en el TPE1 — las decisiones de
esta sección son nuestras, no una traducción de un mock.

### Modal con `<dialog>` nativo, no un `<div>` armado a mano
- **Qué:** clickear "Pagar carrito" (el link ya existía, `href="#"`, ahora es
  un `<button>`) abre un `<dialog id="modal-pago">` con un form falso (nombre,
  número de tarjeta, vencimiento, CVV). Ninguno de esos datos se valida contra
  nada real ni se manda a ningún lado.
- **Por qué `<dialog>` y no un overlay hecho con `position: fixed` + JS:**
  mismo criterio que ya se usó para el acordeón de Ayuda (`<details>`) — el
  navegador resuelve solo el foco atrapado adentro del modal, el cierre con
  Escape (evento `cancel` nativo) y el fondo oscurecido (`::backdrop`), sin
  manejar nada de eso a mano.
- **"Pagar carrito" pasa de `<a>` a `<button>`:** mismo cambio que ya se hizo
  con el avatar de sesión (ver "Menús desplegables del header") — la acción es
  abrir un modal, no navegar a otra página, así que semánticamente es un botón.
  Efecto colateral bueno: `menu.js` solo cierra el desplegable del carrito al
  clickear un `<a>` de adentro; al ser `<button>` no dispara ese cierre
  específico, pero el listener global de "click afuera" lo cierra igual
  (bubbling normal), así que el desplegable se cierra solo al abrir el modal
  sin código nuevo.

### Compra simulada: mueve el carrito a una lista de "comprados", no queda nada a medio camino
- **Qué:** al enviar el form (`js/compras.js`), se agregan los juegos del
  carrito a una lista nueva en `localStorage` (`warden-compras`,
  `agregarComprados()` en `carrito.js`) y se vacía el carrito
  (`vaciarCarrito()`, nueva también). El form se reemplaza por un bloque de
  éxito (`.modal__exito`, mismo criterio que `.auth-success` de
  login.css: fade + scale con `@keyframes modal-pop`, reutilizado también
  para la entrada del propio modal en vez de sumar una animación más) y el
  modal se cierra solo a los 2 segundos.
- **Por qué una clave de `localStorage` aparte (`warden-compras`) y no un
  campo "comprado" adentro del mismo item del carrito:** carrito y comprados
  son conceptos distintos con ciclos de vida distintos — son dos listas
  independientes, no un estado dentro de la misma.
- **El modal vuelve a mostrar el form (no la pantalla de éxito) la próxima
  vez que se abre:** al evento `close` del `<dialog>` se le engancha un reset
  (`form.reset()`, se muestra el form, se oculta el éxito) — si no, la
  siguiente compra arrancaría directo en la pantalla de éxito de la anterior.
- **Sin resumen de precio en el modal:** solo dice "Vas a comprar N juego(s)."
  No hay precios reales todavía (`esDePago()` en `carrito.js` es un booleano
  simulado, sin ningún monto asociado — ver "Pendientes de decidir"),
  así que mostrar un total inventado sería peor que no mostrar nada.

### `.modal__cerrar` con su propio estilo, no reusa `.header__icon-btn`
- **Qué:** el botón "X" del modal tiene su propio bloque de CSS en
  `components.css` (mismas medidas y comportamiento que `.header__icon-btn`:
  44px, ícono solo, mismo hover) en vez de compartir esa clase.
- **Por qué:** `.header__icon-btn` es un nombre BEM atado al bloque `.header`
  (vive en `header.css`). El modal no es parte del header — reusar esa clase
  ahí sería el mismo tipo de mezcla de responsabilidades que el proyecto ya
  evita en otros lados (ver "Header y footer en archivos propios"). Repetir
  unas pocas líneas de CSS es más barato de mantener que un nombre que mienta
  de dónde viene el estilo.

## Sistema de compras (parte 2: fila "Mis juegos" en la Home)

### Debajo de "Recomendados", pero independiente de la sesión simulada
- **Qué:** `home.js` arma una fila más, "Mis juegos", con lo que haya en
  `obtenerComprados()` (`carrito.js`). Va inmediatamente debajo de
  "Recomendados" cuando hay sesión — pero a diferencia de esa fila, "Mis
  juegos" se arma siempre que haya algo comprado, tenga sesión iniciada o no.
- **Por qué debajo de Recomendados:** decisión de Agus — la Home tiene que
  seguir priorizando vender antes que mostrar lo que ya comprás.
- **Por qué independiente de la sesión (a diferencia de "Recomendados"):**
  comprar (`compras.js`) no depende en ningún momento de tener sesión
  iniciada — es una mecánica aparte, atada solo a `localStorage`. Si "Mis
  juegos" solo apareciera con sesión, alguien podría comprar como invitado y
  no ver la compra reflejada en ningún lado de la Home, lo cual sería raro
  dado que ambas cosas (comprar y ver lo comprado) pasan en el mismo
  navegador sin login real de por medio.

### Card sin rating ni botón de carrito, no la misma `crearCard()`
- **Qué:** `crearFila()` ahora recibe una fábrica de cards como tercer
  parámetro (`fabricaCard = crearCard` por default). "Mis juegos" le pasa
  `crearCardComprado()`, una card más simple: imagen + título, sin estrella
  de rating ni el botón de agregar al carrito.
- **Por qué no se puede reusar `crearCard()` tal cual:** los objetos que
  guarda `carrito.js` (`{id, nombre, imagen}`, en español, sin rating ni
  género) no tienen la forma de los que devuelve la API
  (`{id, name, background_image, rating, genres}`, en inglés) — no hay
  `juego.rating` ni `juego.genres` para mostrar. Mostrar el botón de carrito
  tampoco tendría sentido: ya es tuyo, no hay nada que agregar.
- **Token de CSS nuevo:** `.game-card__title--solo` en `home.css`, para el
  margen inferior que en el resto de las cards pone `.game-card__rating`
  (que acá no existe). *(Actualizado: esta clase se sacó después, ver "El
  botón pasa de texto a ícono..." más arriba — el espaciado pasó a salir del
  `padding` de `.game-card__cuerpo`, común a cualquier card.)*

### La compra recarga la página en vez de solo cerrar el modal
- **Qué:** en `compras.js`, tras mostrar el mensaje de éxito, en vez de
  `modalPago.close()` ahora se hace `window.location.reload()`.
- **Por qué:** sin esto, "Mis juegos" no reflejaría la compra recién hecha
  hasta la próxima carga de la página — `home.js` arma las filas una sola
  vez, al cargar. Recargar es la forma más simple de que se vuelva a armar
  con el estado nuevo, sin duplicar la lógica de renderizado acá (mismo
  criterio que ya usa "Cerrar sesión" en `menu.js`). Cerrar el modal sin
  confirmar (X, Escape, fondo) sigue sin recargar nada.

### El link "Mis juegos" del menú de cuenta ya apunta a la fila
- **Qué:** pasa de `href="#"` a `href="index.html#fila-mis-juegos"` (el id
  que arma `crearFila()` a partir del título).
- **Por qué:** ya existe una fila real a la que apuntar. Si no hay nada
  comprado la fila no se arma y el link no tiene efecto — no hace falta
  ningún manejo especial para ese caso.

---

## Sistema de compras (parte 3: badges "Gratis" / precio / "Nuevo")

Fran pasó una captura de Figma con estos 3 badges (sin contexto de dónde
van ni de qué depende cada uno — esas decisiones se tomaron acá, con Agus).

### Una sola etiqueta por card, con prioridad "Nuevo" > precio/"Gratis" > nada
- **Qué:** `crearBadge(juego)` (`carrito.js`, fábrica compartida por
  `home.js` y `carousel.js`, mismo patrón que `crearBotonCarrito`) devuelve
  una sola etiqueta: "Nuevo" si `esNuevo(id)`, si no el precio simulado o
  "Gratis" según `esDePago(id)`, o `null` si el juego ya figura en
  `obtenerComprados()` — un juego que ya es tuyo no necesita decir que es
  gratis o cuánto cuesta.
- **`esNuevo(id)`:** simulado y determinístico, mismo criterio que
  `esDePago()` (1 de cada 5 juegos por id, en vez de `Math.random()` en
  cada render). Si un id cumple los dos, "Nuevo" gana — no hay lugar para
  mostrar dos etiquetas a la vez, y es la más noticiosa de las dos.
- **Precio fijo simulado (`PRECIO_SIMULADO = '$9.99'`), decisión final, no
  un placeholder a reemplazar:** cualquier juego "de pago" muestra el mismo
  monto. Confirmado con Agus — no va a haber precios reales por juego en
  este proyecto. Un monto único y fijo es más simple de mantener y explicar
  en la defensa que inventar precios distintos por juego, que sería un dato
  fabricado con apariencia de real en vez de un placeholder que se nota
  que lo es.

### Roboto Flex en mayúsculas, no Orbitron — la captura de Figma no aplica tal cual
- **Qué:** el componente `.badge` (`components.css`) usa `--font-ui` en
  700 y `text-transform: uppercase`, no `--font-display`.
- **Por qué:** la tipografía de la captura de Figma para estos 3 badges
  parece Orbitron — pero son tags chicos sobre una imagen, no títulos
  (h1-h3), así que copiarla tal cual rompería la regla del proyecto. Mismo
  motivo por el que ya se sacó Orbitron de `.banner__nombre` en su momento
  (ver "Carrusel coverflow" más arriba). Se avisó la diferencia en vez de
  copiarla, como pide `CLAUDE.md`.
- **Dos variantes de color, no una por texto:** `.badge--precio` (violeta,
  para "Gratis" y el precio — visualmente son la misma etiqueta en la
  captura, solo cambia el texto) y `.badge--nuevo` (cian, mismo par de
  colores que ya usa `.banner__etiqueta` para "Destacado").

### Ubicación: arriba a la izquierda de la imagen (Home) y junto a "Destacado" (banner)
- **Qué:** en las filas de la Home, el badge va arriba a la izquierda de
  `.game-card__media` — el lugar que dejó libre el ícono de carrito al
  moverse a `.game-card__cuerpo` (ver "El botón pasa de texto a ícono...").
  En el banner "Destacados", se agrupa junto a la etiqueta "Destacado" en
  un wrapper nuevo (`.banner__etiquetas`), arriba a la izquierda — el
  carrito ya ocupa arriba a la derecha y el nombre ocupa abajo de punta a
  punta, no quedaba otro lugar libre.
- **`.game-card__media` recupera `position: relative`:** se había sacado
  cuando el ícono de carrito dejó de estar ahí (ver decisión anterior);
  vuelve porque ahora el badge sí necesita anclarse a la imagen.
- **Neon Circuit no lleva badge en el banner:** no viene de la API (no
  tiene un id real para `esDePago()`/`esNuevo()`/`obtenerComprados()`) y ya
  tiene su propia acción real ("Jugar") — mismo criterio que ya lo excluye
  del ícono de carrito ahí.

---

## Ficha de producto para juegos del catálogo (`producto.html`)

Pedido de Agus: al clickear un juego de pago que todavía no compraste, se
abre una ficha con su portada, datos y reseñas — igual que la de Neon
Circuit, pero para cualquier juego de la API. Sin captura de Figma (esto
no se diseñó en el TPE1): las decisiones de layout y contenido son
nuestras. Primera etapa: la página en sí, sin todavía enlazarla desde las
cards de la Home ni del banner (parte 2 y 3, aparte).

### Página nueva, no la misma que Neon Circuit
- **Qué:** `producto.html` (+ `js/producto.js`, `css/producto.css`), no
  reutiliza `juego.html`. Recibe el juego por query string (`?id=`, ej.
  `producto.html?id=3498`) y busca el juego llamando a `obtenerJuegos()`
  otra vez (mismo catálogo que ya trae la Home).
- **Por qué no reusar `juego.html`:** esa página tiene un tablero real de
  Peg Solitaire (grilla de 33 posiciones, reglas, atajos de teclado) —
  específico de Neon Circuit. Ningún otro juego del catálogo tiene un
  minijuego programado atrás, así que no hay nada que mostrar ahí. Se
  decidió con Agus: sin tablero, solo la portada (ver más abajo).
- **Sin backend ni id como ruta real:** es un sitio estático, no hay
  servidor que resuelva `/juego/123` — el id viaja por query string y
  `producto.js` arma la página en el cliente, mismo criterio que ya usa
  todo el proyecto (sesión y compras simuladas en `localStorage`).

### Ficha, Sobre el juego, Galería, Compartir, Comunidad y Dejá tu reseña se movieron a `components.css`
- **Qué:** ese CSS vivía entero en `juego.css`. Ahora que dos páginas lo
  usan (`juego.html` y `producto.html`), se movió a `components.css` —
  mismo criterio que ya se usó para promover `crearBotonCarrito()` y
  `crearBadge()` a `carrito.js` cuando pasaron a compartirse entre
  `home.js` y `carousel.js`. `juego.css` se queda solo con lo específico
  de Neon Circuit: el tablero y la Ayuda.
- **`.ficha-juego__miniatura` pierde su imagen fija:** antes traía
  `background-image` de Neon Circuit adentro de la regla compartida. Ahora
  esa regla solo pone tamaño/forma, y cada página pone la imagen que le
  corresponde: `juego.css` la deja fija (siempre la misma), `producto.js`
  la setea por juego (`style.backgroundImage`, la imagen real de la API).
- **Sin "Tu récord" en la ficha de un juego del catálogo:** ese dato es la
  cantidad de nodos al terminar una partida de Peg Solitaire — no aplica a
  un juego que no programamos. Tampoco hay desarrollador (la API no lo
  trae en el endpoint que usamos, `/api`). Queda solo: miniatura, nombre,
  categoría (géneros reales), rating (real) y "Jugando ahora" (simulado,
  mismo número que ya usa Neon Circuit).
- **`CATEGORIAS`/`esDeGenero()` se mueven de `home.js` a `api.js`:**
  `producto.js` los necesita para traducir el género real del juego a una
  de las 8 categorías fijas del sitio, en el breadcrumb. Como ahora los
  usan dos archivos, `api.js` (ya compartido por ambas páginas) es el
  lugar que corresponde — mismo patrón que categorías/esDePago/CATEGORIAS.
- **"Sobre el juego", Galería y las 3 reseñas de Comunidad son genéricas,
  no por juego:** no tenemos descripciones en español de estos juegos
  (la API las trae en inglés, ver "Plus" en `DECISIONES.md`) ni reseñas
  reales. Se reusa el mismo texto/datos de ejemplo para cualquier juego —
  confirmado con Agus, mismo criterio que ya se acepta en otros lados del
  sitio para contenido simulado.

### `.ficha-juego__nombre` es `<h1>` acá (en Neon Circuit sigue siendo un `<p>`)
- **Qué:** en `producto.html`, el nombre del juego en la ficha es un
  `<h1>`. En `juego.html` sigue siendo un `<p>` (Neon Circuit no tiene
  `<h1>`, ver "Excepción puntual" en `DECISIONES.md` — pendiente de
  discutir con los tres). Misma clase CSS en los dos casos: el estilo no
  depende de la etiqueta.
- **Por qué no repetir la excepción de Neon Circuit acá:** esa excepción
  fue una decisión puntual de Fran para esa pantalla específica, todavía
  sin cerrar entre los tres. `producto.html` es una página nueva — por
  default sigue la regla general del proyecto ("un solo h1 por página") en
  vez de heredar una excepción ajena sin haberla charlado.

### Portada con botón en hover, no siempre visible como en Neon Circuit
- **Qué:** `.producto__portada` muestra la imagen real del juego a pantalla
  completa; el botón ("Comprar" o "Jugar", según corresponda) aparece con
  hover o foco, con un scrim oscuro atrás — mismo criterio que ya usa
  "Jugar" en el banner Destacados, no el botón siempre visible de la
  portada de Neon Circuit.
- **Por qué distinto a Neon Circuit:** ahí el botón "arranca" el tablero
  (una transición real, de portada a juego, dentro de la misma card) — acá
  no hay tablero al que pasar, la acción es "comprar" o (todavía) nada, así
  que no hace falta ese peso visual permanente.
- **"Comprar" agrega al carrito y abre el desplegable del header:**
  confirmado con Agus. Un solo click hace las dos cosas — reusa
  `agregarAlCarrito()` (`carrito.js`) y dispara el click del botón de
  carrito del header (`document.querySelector('.menu-carrito
  .header__icon-btn').click()`) en vez de reimplementar el "abrir menú".
  Hace falta `evento.stopPropagation()` en el click de "Comprar": si no,
  el mismo click sigue de largo hasta `document` y el listener de
  `menu.js` que cierra cualquier menú al clickear "afuera" lo vuelve a
  cerrar enseguida (bug real, encontrado al probarlo).
- **"Jugar" no hace nada todavía:** ni en juegos gratis ni en los de pago
  ya comprados — no hay ningún minijuego real detrás de estos juegos del
  catálogo. Queda pendiente definir con Fran qué debería pasar acá (ver
  "Pendientes de decidir").

### Etapa 2: las cards de las filas de la Home enlazan a la ficha
- **Qué:** en `home.js`, `.game-card__texto` pasa de `<div>` a
  `<a href="producto.html?id=...">` — clickear el nombre o el puntaje de
  cualquier card (en cualquier fila, incluida "Mis juegos") lleva a su
  ficha. Sigue sin ser toda la card: la imagen no es parte del link (ver
  más abajo).
- **Por qué no envolver toda la card en el link:** el botón de agregar al
  carrito ya vive adentro de `.game-card__cuerpo`, al lado del texto. Un
  `<a>` no puede contener un `<button>` (contenido interactivo anidado,
  inválido en HTML) — por eso `.game-card__link` y el botón de carrito
  siguen siendo hermanos dentro de `.game-card__cuerpo`, cada uno con su
  propia área de click, en vez de uno adentro del otro.
- **`.game-card__title` necesita `color` explícito ahora:** al pasar el
  contenedor de `<div>` a `<a>`, el título heredaba el celeste de link de
  `base.css` en vez del blanco de siempre (bug real, visto al probarlo) —
  se le puso `color: var(--primario-c3)` explícito para no depender de la
  herencia según qué etiqueta envuelva el texto.
- **Sin regresiones en el arrastre con mouse (`carrusel-fila.js`):** ya
  frenaba el arrastre si el click empieza en un `<a>` o `<button>`
  (`evento.target.closest('button, a')`, ver "Bug real: el botón de la
  card no respondía al click con mouse") — cubre el link nuevo sin
  cambios.

### Etapa 3: el banner "Destacados" enlaza a la ficha, reemplaza el agregar-al-carrito directo
- **Qué:** en `carousel.js`, `.banner__carrito` (el botón que agregaba al
  carrito con un click, cubriendo toda la card activa) se reemplaza por
  `.banner__ver`, un `<a href="producto.html?id=...">` del mismo tamaño
  (toda la card). Aplica a cualquier juego que no sea Neon Circuit, tenga o
  no badge de Gratis/precio/Nuevo — antes solo estaba el botón de carrito
  en los "de pago". Neon Circuit no cambia: sigue yendo a `juego.html` con
  "Jugar".
- **Por qué se pierde el agregar-al-carrito directo desde el banner:**
  confirmado con Agus — las dos acciones (agregar al carrito, ir a la
  ficha) competían por el mismo gesto de click en la card activa, y no se
  puede achicar el área de click de una sin volver al bug de hit-testing
  que ya se documentó (ver "Carrusel coverflow" y "Bug real: el click no
  le pegaba al ícono", más arriba) — con las cards rotadas en 3D, un
  control chico ahí adentro no siempre resuelve al click en las
  coordenadas correctas. Se prioriza "ir a la ficha", consistente con las
  filas de la Home (Etapa 2); para agregar al carrito desde el banner
  ahora hay que entrar a la ficha y usar "Comprar" ahí.
- **El badge no cambia:** `crearBadge(juego)` se sigue llamando igual,
  independiente del click de la card — Gratis/precio/Nuevo siguen
  mostrándose junto a "Destacado".
- **Limpieza de CSS:** se sacaron `.banner__carrito` y las referencias a
  `.banner__carrito`/`.banner__carrito .carrito-icono` del bloque
  compartido con `.game-card__carrito` (ahora ese bloque es solo para las
  filas de la Home) y de los `prefers-reduced-motion` correspondientes.

---

## Pendientes de decidir

- Qué pasa al clickear "Jugar" en la ficha de un juego del catálogo que no
  es Neon Circuit (gratis, o de pago ya comprado): hoy no hace nada. Falta
  charlarlo con Fran — ver "Ficha de producto para juegos del catálogo".
- La página del juego sin `<h1>` (ver `ETAPAS.md` Etapa 4): rompe la
  regla del proyecto de "un solo h1 por página" (no es un requisito de la
  cátedra, es algo que nos autoimpusimos). Fran lo documentó como excepción
  puntual; falta que lo charlemos los tres antes de aceptarlo.
