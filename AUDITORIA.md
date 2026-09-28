# Auditoría UX / UI — qué encontramos, qué cambiamos y dónde se justifica

Este archivo es el hilo conductor para la defensa: por cada hallazgo de la
auditoría, cómo estaba el sitio **antes**, qué hicimos, en qué commit, y en qué
parte de `DECISIONES.md` está el razonamiento.

- **Informe original (sin tocar):** [`docs/auditoria-ux-original.md`](docs/auditoria-ux-original.md).
  Tiene las mediciones, los pasos para reproducir cada problema y el código
  propuesto. Se generó el 28/09/2026 con Claude AI, dándole el link del sitio
  publicado, el enunciado del TPE2 y los tres `.md` del repo.
- **Código auditado:** commit `1a13462`, el mismo que estaba publicado en
  `gh-pages`. Está marcado con el tag `pre-auditoria`.
- **Alcance del informe:** una sola pasada de un evaluador. Cubre en promedio
  alrededor del 35 % de los problemas y no reemplaza un test con usuarios. No
  pudo probar con la API real ni con lector de pantalla real (ver la sección 8
  del informe original).

## Cómo ver cómo estaba antes

```bash
git checkout pre-auditoria          # el sitio tal cual estaba antes de la auditoría
git checkout agus                   # volver a la rama de trabajo
git diff pre-auditoria..agus        # todo lo que cambió desde la auditoría
git diff pre-auditoria..agus -- tp2/js/buscador.js   # lo que cambió en un archivo
git log --oneline pre-auditoria..agus                 # un commit por tarea, con su ID (T03a, ...)
```

Un commit por tarea, con el ID en el mensaje (`fix(T03a): ...`), así se puede
seguir cada hallazgo hasta su cambio exacto.

## Estado de las tareas

Severidades: **Enunciado** (riesgo de perder puntos), **S3** (grave: bloquea,
confunde o viola WCAG 2.2 AA), **S2** (menor), **S1** (cosmético / robustez).

| ID | Sev. | Hallazgo | Estado | Commit |
|---|---|---|---|---|
| T01 | Enunciado | Solo 2 de las 4 animaciones hover de botón se usan en páginas reales | **Hecha** | `git log --grep T01` |
| T02 | S3 | Texto de botones primarios con contraste 3,62:1 | **Hecha** | `git log --grep T02` |
| T03 | S3 | Buscar con Enter recarga la página | **Hecha** | `769186e`, `cee6a59` |
| T04 | S3 | El acceso a `juego.html` se ve menos de 1 s y en touch nunca | **Hecha** | `git log --grep T04` |
| T05 | S3 | Newsletter: el POST termina en una página de error | **Hecha** | `git log --grep T05` |
| T06 | S3 | Scroll horizontal en mobile (368 px en viewports de 320 y 360) | **Hecha** (footer en `a055720`; header a 320 px en T06b, ver abajo). Queda el banner a 768 px | `a055720` |
| T07 | S3 | En touch el banner avanza solo y no se puede pausar | **Hecha** | `git log --grep T07` |
| T08 | S3 | Buscador y dots inactivos sin contraste 3:1 | **Hecha** | `git log --grep T08` |
| T09 | S2 | "Pagar carrito" vacío no hace nada ni avisa | **Hecha** | `git log --grep T09` |
| T10 | S2 | Links del hamburguesa que no hacen nada | **Hecha** | `git log --grep T10` |
| T11 | S2 | Dos paradas de Tab por card | A charlar con Fran | — |
| T12 | S2 | Galería de producto gira hacia la misma foto | A charlar con Fran | — |
| T13 | S3 | Etiquetas del banner cortadas en mobile | **Hecha** | `git log --grep T13` |
| T14 | S1 | El loading dura más de 5 s con la pestaña en segundo plano | Pendiente | — |

## Detalle por tarea

Cada tarea hecha suma acá su bloque. Las pendientes quedan solo en la tabla de
arriba hasta que se hagan; el detalle completo de cada una (evidencia y solución
propuesta) está en el informe original.

### T03 — Buscar con Enter recarga la página (S3) · hecha

- **Antes (`pre-auditoria`):** el buscador del header era un `<form action="#">`
  sin ningún JS. Al apretar Enter, la página se recargaba con `?q=portal#`. En la
  Home volvía a aparecer el loading de 5 segundos y no había ningún resultado. En
  `producto.html` se perdía el `?id=` de la URL y aparecía "No encontramos este
  juego". El control más visible del header no hacía nada.
- **Criterios que rompía:** Nielsen #1 (visibilidad del estado), #3 (control y
  libertad) y #9 (recuperarse de errores).
- **Después:**
  - En la Home, `filtrarJuegos()` (`js/buscador.js`) oculta las cards que no
    coinciden con el nombre y las filas que quedan vacías, y escribe el
    resultado en `#busqueda-estado` ("2 juegos para “portal”", o un mensaje si no
    hay ninguno). Borrar el texto vuelve a mostrar todo. Sin recarga, sin loading.
  - Desde `producto.html`, buscar lleva a `index.html?q=...` y `home.js` aplica el
    filtro cuando termina de armar las filas.
  - Después de buscar, la vista baja hasta el mensaje de resultados (ajuste
    nuestro, no estaba en el informe: el banner ocupa casi toda la primera
    pantalla y sin esto no se vería que pasó algo).
  - `buscador.js` se carga antes que `home.js` para evitar una carrera si la API
    responde desde caché.
- **Commits:** `769186e` (filtro en la Home), `cee6a59` (búsqueda desde la ficha).
- **Justificación completa:** `DECISIONES.md`, "El buscador filtra en el lugar
  (Home) o lleva a la Home con `?q=` (T03)".
- **Cómo se verificó:** en el navegador, con "portal", "zzz", borrando con la "x"
  y buscando "witcher" desde la ficha de producto; sin errores de consola. No se
  probó todavía a 360 px con la lupa abierta.
- **Qué se descartó:** una página de resultados aparte (otro `<h1>`, otro header
  y otro loading sin aportar nada) y normalizar tildes (los nombres de la API son
  casi todos en inglés).

### T06 — Scroll horizontal en mobile (S3) · hecha (footer)

- **Antes (`pre-auditoria`):** el informe midió `scrollWidth` 368 con viewports de
  320 y 360 px. Causa: `.footer__bottom` era una grilla de columna automática
  y el form del newsletter (input + botón) empujaba la columna más allá de la
  pantalla. Con las fuentes reales (Roboto Flex / Orbitron) y la scrollbar de 10 px
  del sitio, lo medimos a 320 px: newsletter y empresa llegaban a x=330 con 310 px
  disponibles. A 360 px, con fuentes reales, el footer ya entraba.
- **Criterio que rompía:** WCAG 2.2 SC 1.4.10 Reflow (AA) y enunciado, punto 6.
- **Después:** `.footer__bottom` usa `minmax(0, 1fr)` (una columna en mobile,
  `repeat(2, minmax(0, 1fr))` desde tablet). A 320 px newsletter y empresa quedan
  en x=290; a 768 px son dos columnas iguales (343 px cada una).
- **Commit:** `a055720`. **Justificación:** `DECISIONES.md`, "Franja de abajo del
  footer con `minmax(0, 1fr)` (T06)".
- **T06b — el header a 320 px (se encontró al medir con fuentes reales):**
  después de arreglar el footer, `.header__actions` seguía llegando a x=324 con
  310 disponibles. El header de una fila con la lupa (cambio nuestro, anterior a
  la auditoría) necesita unos 324 px de contenido y a 320 px hay 288. Se achicó
  el gap horizontal y se oculta el texto "Warden" bajo 360 px (queda el ícono).
  Commit: `git log --grep T06b`. Justificación: `DECISIONES.md`, "Header de
  mobile a 320px: gap chico y sin el texto del logo bajo 360px (T06b)".
  El informe original no lo vio porque midió con fuentes de respaldo más
  angostas que Orbitron.
- **Resultado:** en `index.html`, `scrollWidth` = `clientWidth` a 320, 359, 360 y
  390 px.
- **Lo que sigue sin resolver y no es del footer:**
  - A 768 px el banner se pasa 25 px: las cards de los costados del coverflow
    giran fuera del ancho de la pantalla. No está en el informe; se trata aparte.
  - `producto.html` y `juego.html` a 360 px se pasan 18 px por el panel lateral
    fijo de 320 px. Son páginas solo desktop según el enunciado, así que no se
    tocan.

### T13 — Etiquetas del banner cortadas en mobile (S3) · hecha

- **Antes (`pre-auditoria`):** `.banner__etiquetas` no tenía límite a la derecha
  ni `flex-wrap`, y `.banner__nombre` medía 22 px en todos los anchos. La card
  activa tiene `overflow: hidden`. Medido a 320 px (card de ~162 px): "Gratis" o
  "Nuevo" quedaban cortadas en las 4 cards que tienen etiqueta, y el nombre
  ocupaba hasta 3 líneas (58 % del alto de la card con "Red Dead Redemption 2").
- **Criterio que rompía:** WCAG 2.2 SC 1.4.10 Reflow (pérdida de contenido a
  320 px) y Nielsen #1 (el precio es información de estado de compra).
- **Después:** las etiquetas hacen `wrap` dentro de la card; el nombre es de 16 px
  en mobile y 22 px desde tablet. Verificado a 320 y 360 px en los 5 destacados:
  0 etiquetas cortadas, nombres de 2 líneas como máximo. A 1440 px queda igual
  (22 px, etiquetas en una fila).
- **Diferencia con el informe:** la sombra del nombre usa `--sombra-elevacion`
  en dos capas, no una sola, para no perder legibilidad (ver `DECISIONES.md`).
- **Justificación:** `DECISIONES.md`, "Etiquetas y nombre del banner en mobile:
  wrap y 16px (T13)". **Commit:** `git log --grep T13`.

### T02 — Contraste del texto de los botones primarios (S3) · hecha

- **Antes (`pre-auditoria`):** `.btn--primario` usaba `--primario-c3` sobre
  `--primario`: **3,62:1** con texto de 16 px, cuando WCAG 2.2 SC 1.4.3 (AA) pide
  4,5:1. Afectaba a todos los botones primarios: Pagar carrito, Confirmar compra,
  Registrarse, Ingresar, Jugar, Publicar y la acción de la portada de producto.
- **Después:** fondo `--primario-o1`, **6,17:1**. El hover (elevación y fondo
  lila claro) no cambia; `:active` se oscurece con `filter`. Medido en el
  navegador en login: Registrarse, Ingresar y la pestaña activa dan 6,17:1.
- **Diferencia con el informe:** se corrigió también la pestaña activa de login
  (`.auth-switch__btn.active`), que tenía el mismo par de colores y el informe
  no incluyó.
- **Justificación:** `DECISIONES.md`, "Botón primario y pestaña activa de login
  en `--primario-o1` (T02)". **Commit:** `git log --grep T02`.

### T08 — Contraste del buscador y de los dots inactivos (S3) · hecha

- **Antes (`pre-auditoria`):** el input del buscador tenía borde transparente:
  `--fondo` sobre el header `--superficie` daba **1,13:1**. La barrita de un dot
  inactivo del banner era `--primario-o1` sobre `--fondo`: **2,39:1**. WCAG 2.2
  SC 1.4.11 (AA) pide 3:1 para componentes de interfaz.
- **Después:** borde del buscador `--primario` (**3,59:1** contra el header;
  `--primario-c1` en hover) y dots inactivos `--primario` (**4,07:1** contra el
  fondo). Medido en el navegador con `getComputedStyle`.
- **Justificación:** `DECISIONES.md`, "Borde visible en el buscador y dots
  inactivos más claros (T08)". **Commit:** `git log --grep T08`.

### T01 — Solo 2 de las 4 animaciones hover se usaban en las páginas (Enunciado) · hecha

- **Antes (`pre-auditoria`):** `.btn--terciario` y `.btn--destructivo` estaban
  definidos en `components.css` pero tenían 0 usos en `index.html`, `login.html`,
  `juego.html`, `producto.html` y en `js/`. Quien corrige veía dos animaciones de
  hover distintas (primario se eleva, secundario rellena), y el enunciado pide al
  menos 3. `DECISIONES.md` afirmaba que había 4.
- **Después:** "Seguir comprando" del carrito (`index.html` y `producto.html`) usa
  `.btn--terciario`: el subrayado crece de izquierda a derecha. Ahora se ven 3
  animaciones distintas. La destructiva sigue sin usarse: no hay acciones
  destructivas en el sitio y no se inventó una.
- **Bug encontrado al probarlo (no estaba en el informe):** el subrayado nativo
  del navegador aparecía junto con el animado en cualquier `<a class="btn">`
  (`a:hover` le ganaba a `.btn` por especificidad). Se corrigió con
  `.btn:hover { text-decoration: none }`.
- **Para la defensa:** el terciario está dentro del desplegable del carrito, hay
  que abrirlo con el ícono del carrito para verlo. Conviene tenerlo presente al
  mostrar las tres animaciones.
- **Justificación:** `DECISIONES.md`, "Dónde se ve cada animación de hover:
  'Seguir comprando' pasa a terciario (T01)". **Commit:** `git log --grep T01`.
- **Sigue abierto:** no conocemos el criterio exacto de la cátedra (slide 14) sobre
  qué cuenta como "animación" de hover; si aceptan cambios de color, ya cumplíamos.

### T05 — Newsletter: el POST termina en una página de error (S3) · hecha

- **Antes (`pre-auditoria`):** el form del footer (`action="#" method="post"
  novalidate`) no tenía ningún JS. "Suscribirse" navegaba con un POST: en el
  servidor local de prueba respondía 501 y en GitHub Pages (hosting estático)
  respondería 405. Quien se suscribía salía del sitio a una página de error, sin
  confirmación, y un mail mal escrito también se enviaba (por el `novalidate`).
- **Criterios que rompía:** Nielsen #9 (recuperarse de errores), #1 (visibilidad
  del estado) y #5 (prevención de errores).
- **Después:** `js/footer.js` intercepta el envío, valida el mail y confirma en
  el lugar ("Listo, te vamos a escribir a ..."). Sin navegación. Vale para las
  tres páginas con footer.
- **Diferencia con el informe:** el `<p role="status">` está en el HTML desde el
  principio, vacío, en vez de crearse con JS. Es más confiable para lectores de
  pantalla. Y el foco pasa al mensaje al confirmar.
- **Verificado en el navegador** en `index.html`, `producto.html` y `juego.html`:
  mail vacío y "hola" quedan bloqueados por la validación; con
  `test@ejemplo.com` el form se oculta, aparece el mensaje, la URL no cambia y no
  hay recarga. Sin errores de consola. No se probó en el sitio publicado.
- **Justificación:** `DECISIONES.md`, "Newsletter simulado: valida el mail y
  confirma en el lugar (T05)". **Commit:** `git log --grep T05`.

### T04 — El acceso al juego se ve menos de 1 s y en touch nunca (S3) · hecha

- **Antes (`pre-auditoria`):** el autoplay del banner arrancaba apenas respondía
  la API, detrás del overlay de 5 s. El informe midió (1440 px) el overlay
  oculto a los 5644 ms y el banner pasando al segundo destacado a los 6387 ms:
  Neon Circuit, que es el único acceso a `juego.html` desde la Home, quedaba de
  frente 743 ms y volvía unos 30 s después. Además `.banner__jugar` tenía
  `opacity: 0` salvo con hover, y en touch (`hover: none`) no se ve nunca.
- **Criterios que rompía:** Nielsen #6 (reconocimiento antes que recuerdo), #1, y
  el punto 1a del enunciado.
- **Después:** el autoplay arranca cuando desaparece el overlay
  (`MutationObserver` sobre `#loading`), y en dispositivos sin hover el botón
  "Jugar" queda fijo en la card activa, sin el velo oscuro. Con mouse no cambia.
- **Verificado:** el primer destacado no se movió en más de 11 s con el overlay
  visible, y avanzó ~6 s después de ocultarlo. En desktop sin hover el botón
  sigue oculto. **Pendiente de probar:** el `@media (hover: none)` real, en un
  celular o con la emulación táctil de DevTools.
- **Decisión que toca:** "Neon Circuit es clickeable: botón Jugar en hover" y
  "Autoplay que se pausa con hover o foco" (se agregó una actualización a cada
  una). **Justificación:** `DECISIONES.md`, "Neon Circuit accesible en touch y
  visible después del loading (T04)". **Commit:** `git log --grep T04`.

### T07 — En touch el banner avanza solo y no se puede pausar (S3) · hecha

- **Antes (`pre-auditoria`):** el banner avanzaba cada 6 s y solo se pausaba con
  `pointerenter`/`focusin`. En touch (360 px, emulado) se tocó el título del
  banner y 6,8 s después el destacado activo era el 2: `pointerleave` llega enseguida
  después del toque y volvía a armar el timer. Ningún mecanismo de pausa en touch.
- **Criterio que rompía:** WCAG 2.2 SC 2.2.2 Pausar, detener, ocultar (nivel A):
  contenido que se actualiza solo por más de 5 s tiene que poder pausarse.
- **Después:** en dispositivos sin hover el autoplay no arranca
  (`puedePausarConHover`). No se agregó botón de pausa (contradecía la decisión
  vigente). Los dots y el toque en las cards de los costados siguen navegando.
- **Verificado en el navegador**, simulando un celular con `matchMedia('(hover:
  hover)')` en `false` dentro de un iframe: el banner no avanzó solo en 9,5 s;
  al tocar un dot cambió a ese destacado y no volvió a moverse en 8 s. El control
  con hover normal avanzó a los ~7 s (6 s del timer más el redondeo de una pestaña en
  segundo plano). **Pendiente de probar** en un celular real.
- **Relación con T04:** en touch el autoplay ya no corre, así que la parte de
  timing de T04 (esperar al loading) solo aplica en dispositivos con hover; la
  parte del botón "Jugar" fijo sin hover sigue siendo necesaria.
- **Justificación:** `DECISIONES.md`, "Autoplay que se pausa con hover o foco,
  sin botón de pausa" (actualización T07). **Commit:** `git log --grep T07`.

### T09 — "Pagar carrito" vacío no hace nada ni avisa (S2) · hecha

- **Antes (`pre-auditoria`):** con el carrito vacío el botón "Pagar carrito"
  parecía activo (`disabled` en `false`), pero `abrirModalPago()` cortaba en
  silencio: el clic no hacía nada. El texto "Todavía no agregaste ningún juego."
  estaba arriba y el botón lo contradecía.
- **Criterio que rompía:** Nielsen #1 (visibilidad del estado del sistema).
- **Después:** el botón queda deshabilitado con el carrito vacío y se habilita al
  agregar un juego (sin recargar); se vuelve a deshabilitar al quitarlo. Verificado
  en `index.html` (vacío, con un juego, y de nuevo vacío) y en `producto.html`.
  Un clic en el botón deshabilitado no cierra el desplegable.
- **Bug encontrado al probarlo (no estaba en el informe):** el botón
  deshabilitado seguía elevándose 3px con sombra en hover. Se agregó
  `.btn:disabled:hover` para anularlo; aplica a cualquier botón deshabilitado.
- **Justificación:** `DECISIONES.md`, "'Pagar carrito' se deshabilita con el
  carrito vacío (T09)". **Commit:** `git log --grep T09`.

### T10 — Links del hamburguesa que no hacen nada (S2) · hecha

- **Antes (`pre-auditoria`):** 13 links del menú hamburguesa eran `href="#"`:
  5 de "Jugar" y las 8 categorías. Las 8 categorías coinciden 1 a 1 con los ids de
  las filas que arma `home.js`, y no las usaban. El link "Mis juegos" del menú de
  cuenta tampoco scrolleaba viniendo de otra página: la fila se crea después del
  `fetch`, cuando el navegador ya buscó el ancla.
- **Criterio que rompía:** Nielsen #4 (consistencia) y enunciado, punto 1.
- **Después:** "Destacados" y las 8 categorías apuntan a `index.html#banner` y
  `index.html#fila-...`; `home.js` scrollea al hash cuando termina de armar las
  filas. Verificado (1440 px): desde la Home, "RPG" y "Acción" dejan el título de
  la fila a 76 px del borde, debajo del header fijo, y cierran el menú; desde
  `producto.html`, "Puzzle" abre la Home ya scrolleada a esa fila.
- **Quedan en `#`:** Últimos, Recientes, Top 100 y Actualizados (sin datos
  reales para esas vistas), como propone el informe.
- **Justificación:** `DECISIONES.md`, "Los links del hamburguesa llevan a las
  filas de la Home (T10)". **Commit:** `git log --grep T10`.

## Tareas que tocan decisiones ya tomadas

Estas cuatro no se aplican a ciegas. Cada una cambia o matiza una decisión que
está documentada en `DECISIONES.md`:

- **T04:** el botón "Jugar" del banner aparece solo con hover, a propósito. La
  propuesta lo respeta en desktop y solo lo deja fijo en dispositivos sin hover
  (`@media (hover: none)`), donde el hover no existe.
- **T07:** el banner no tiene botón de pausa, se pausa con hover o foco. La
  propuesta no agrega un botón: en dispositivos sin hover el autoplay no arranca
  (mismo criterio que con `prefers-reduced-motion`).
- **T11:** las dos paradas de Tab por card figuran como "costo asumido" en la
  decisión de Fran. Se revisa con él antes de tocar.
- **T12:** Fran eligió a sabiendas la galería de producto con la portada
  repetida. Si la decisión se mantiene, queda como riesgo aceptado.
