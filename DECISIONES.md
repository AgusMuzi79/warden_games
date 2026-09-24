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

### Filas por categoría (invitado) o "Recomendados" (con sesión), no un catálogo único
- **Qué:** se sacó la grilla única de "Recomendados" de la primera versión de
  la 3a. Ahora `#filas-juegos` se llena distinto según el estado del avatar
  del header (`.header__avatar[data-sesion="usuario"]` oculto o no):
  - **Invitado:** una fila por cada categoría fija (`CATEGORIAS` en `home.js`:
    Acción, Shooters, RPG, Aventura), filtrando el catálogo por
    `genres[].name`.
  - **Con sesión:** una sola fila "Recomendados", filtrando el catálogo por
    el género de un juego que simulamos que la persona ya jugó
    (`JUEGO_JUGADO` en `home.js`).
- **Por qué:** así lo define el diseño de la Home: el invitado explora por
  categoría, quien tiene cuenta ve algo personalizado. No tiene sentido
  mostrar "Recomendados" a alguien de quien no sabemos nada.
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
  `scroll-snap`; se desplaza con scroll horizontal nativo (mouse, trackpad,
  scrollbar), sin JS de por medio.
- **Por qué:** la animación con transición (el `clip-path` en diagonal, ver
  banner "Destacados" más abajo) queda reservada para ese banner. Estas filas
  de categorías/recomendados son "carruseles normales, sin animación" por
  diseño, y el scroll nativo ya cumple con "que se desplace".

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
- **Solo se ven 2 posiciones de cada lado (`MAX_VISIBLES`):** las cards más
  lejanas se esconden con `opacity: 0` en vez de seguir achicándose hasta
  desaparecer solas — con 5 destacados en total, alcanza para que siempre
  se vea la activa + 2 de cada lado como mucho.
- **Texto solo en la card activa:** `.banner__etiqueta` y `.banner__nombre`
  están en `opacity: 0` por default y solo se muestran en
  `.banner__slide--activo`, para no mezclar el texto de la activa con el de
  las que están giradas al costado.
- **Click en cualquier card visible para saltar a ella:** cada card llama a
  `irA()` con su propio índice al clickearla, igual que los dots. No hace
  falta que sea la inmediata siguiente — clickear una card 2 posiciones más
  allá salta directo ahí. Antes de resolver el problema de hit-testing (ver
  arriba) esto se había sacado por no ser confiable; ahora que el click
  coincide con lo que se ve, se volvió a agregar.
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
  de "qué es lo nuevo de la semana" que no tenemos cómo sostener. Son 5 y no
  4 para que, con `MAX_VISIBLES: 2`, siempre haya alguna card en cada
  posición visible del coverflow (activa + 2 a cada lado).
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

## Pendientes de decidir

- Sistema de compras real: lo pide el enunciado, no es opcional. Se deja para
  una etapa aparte; mientras no exista, el banner "Destacados" no muestra
  precio.
- Estilo final del componente `.link` (hay un default en `components.css`; falta
  confirmar contra la captura de Figma cuando la tengamos).
- Qué contenido lleva el menú hamburguesa, y cómo unificarlo visualmente con el
  menú de usuario (hoy son muy distintos entre sí).
- Qué es la "galería" de la página del juego (falta ver la captura de Figma;
  hoy el tablero y la galería no están construidos todavía).
