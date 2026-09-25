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

### Spinner circular con el % adentro
- **Qué:** un aro (`::before` con borde, uno de sus lados de otro color) que gira con
  `@keyframes`, con el número de 0 a 100 centrado adentro.
- **Por qué:** es la forma más simple de las permitidas por el enunciado (spinner, círculo
  o cuadrado) y la más asociada a "cargando" para quien lo ve. El número va adentro en vez
  de debajo para que ocupe menos alto y quede más compacto.
- **Cómo:** el aro que gira es un `::before` absoluto que ocupa todo el spinner; el texto
  del % es un elemento aparte con `z-index: 1` para quedar siempre arriba, así no hace
  falta contra-rotarlo para que no gire con el aro.

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

### El % es decorativo para lectores de pantalla
- **Qué:** el spinner y el número tienen `aria-hidden="true"`; en cambio hay un texto fijo
  ("Cargando catálogo de juegos…") dentro del `role="status"` que se lee una sola vez.
- **Por qué:** anunciar el número cambiando 100 veces en 5 segundos sería spam para quien
  usa lector de pantalla. Un solo anuncio al aparecer el loading alcanza.

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

### Cards horizontales (16:9), no verticales
- **Qué:** `.game-card__image` usa `aspect-ratio: 16 / 9`.
- **Por qué:** correción sobre la primera versión de la 3a, que las tenía en
  3:4 (verticales). Las cards de estas filas tienen que ser horizontales.

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

### Se eligen los 5 juegos mejor puntuados como "Destacados"
- **Qué:** `carousel.js` ordena el catálogo de la API por `rating` y toma
  los primeros 5. Sin badge de precio (el Figma tenía "$9.99"): no existe
  ningún sistema de compras todavía.
- **Por qué:** dato real (no inventado), sin necesitar un criterio editorial
  de "qué es lo nuevo de la semana" que no tenemos cómo sostener. 5 le da
  variedad a los dots sin que la vuelta completa se sienta demasiado corta.
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

### Componente `.link`
- **Qué:** texto con color `--acento` y subrayado animado que crece de izquierda a
  derecha en hover/foco (`::after` con `scaleX`), reutilizando la misma animación que
  `.btn--terciario` en vez de sumar una 5ª.
- **Por qué:** faltaba un componente para links de texto dentro de una oración (ej.
  "¿No tenés cuenta? Registrate" en el splash de login), distinto del `<a>` genérico de
  `base.css` (que solo subraya con `text-decoration`, sin animación) y de los links de
  navegación del header/footer.
- **Pendiente:** el estilo final depende de la captura de Figma del componente link,
  que todavía no vimos. Este es un default razonable mientras tanto.

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

## Pendientes de decidir

- Sistema de compras real: lo pide el enunciado, no es opcional. Se deja para
  una etapa aparte; mientras no exista, el banner "Destacados" no muestra
  precio.
- Estilo final del componente `.link` (hay un default en `components.css`; falta
  confirmar contra la captura de Figma cuando la tengamos).
- La página del juego sin `<h1>` (PR #4, ver `ETAPAS.md` Etapa 4): rompe la
  regla del proyecto de "un solo h1 por página" (no es un requisito de la
  cátedra, es algo que nos autoimpusimos). Fran lo documentó como excepción
  puntual; falta que lo charlemos los tres antes de aceptarlo.
