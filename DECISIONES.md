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

### Paleta del tablero: valores elegidos
- **Qué:** `--tablero-activo: #FF6A1A` (naranja), `--tablero-descargado:
  #0B0710` (casi negro), `--tablero-seleccionado: #3FE8E4` (celeste-cian),
  `--tablero-destino: #B79CF0` (violeta claro).
- **Por qué:** estimados a ojo de la captura de Figma. Quedan como
  "pendiente de ajustar" (ver esa sección al final del archivo) hasta
  compararlos en pantalla contra el diseño real.

### Panel lateral: tablero + ficha/Ayuda/Compartir en dos columnas, solo desktop
- **Qué:** `.juego-layout` es un grid de 2 columnas: `.juego-layout__principal`
  (tablero, "Sobre el juego" y Galería, apilados) y `.panel-lateral`
  (ficha del juego, Ayuda y Compartir, apilados). 320px fijo para el panel,
  el resto para la columna principal. Sin `@media`, porque la página del
  juego no necesita mobile first (regla del proyecto).
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

### Miniatura de la ficha del juego: gradiente con la paleta del tablero
- **Qué:** `.ficha-juego__miniatura` es un `linear-gradient` con
  `--tablero-activo`, `--tablero-seleccionado` y `--tablero-destino`, no una
  imagen.
- **Por qué:** todavía no hay ningún asset real para Neon Circuit (se
  resuelve más adelante, junto con las fotos de la galería). Reusar la
  paleta del tablero mantiene la miniatura coherente con el resto de la
  página sin depender de un archivo nuevo.

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

- Hex de `--superficie` (fondo de header y footer).
- Tipo de transición del carrusel de recomendados.
- Estilo final del componente `.link` (hay un default en `components.css`; falta
  confirmar contra la captura de Figma cuando la tengamos).
- Qué contenido lleva el menú hamburguesa, y cómo unificarlo visualmente con el
  menú de usuario (hoy son muy distintos entre sí).
- Hex definitivo de la paleta del tablero (`--tablero-*`): son valores
  estimados a ojo de la captura de Figma, falta compararlos en pantalla.
