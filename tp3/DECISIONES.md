# Decisiones de diseño e implementación — Warden (TPE3: Blocka)

Acá se documenta todo lo de la entrega TPE3 (`tp3/`). Las decisiones de las
entregas anteriores (TPE1 y TPE2) siguen en `../tp2/DECISIONES.md`: como
`tp3/` es una copia de `tp2/`, los comentarios del código que dicen "ver
DECISIONES.md" sin nombrar Blocka remiten a ese archivo.
Cada decisión: **qué** hicimos, **por qué**, y qué **alternativa** descartamos.

---

## Organización

### `tp3/` es una copia de `tp2/`, con el Peg Solitaire intacto
- **Qué:** el TPE3 vive en `tp3/`, copia de `tp2/` sobre la que se suma el
  videojuego Blocka. `tp2/` no se toca.
- **Por qué:** el enunciado pide ejecutar el juego "sobre la entrega del TPE2".
  Copiar la carpeta separa las entregas y deja la anterior como estaba.

### `blocka.html` aparte de `juego.html`; el Peg se queda
- **Qué:** página nueva `tp3/blocka.html` (+ `css/blocka.css`, `js/blocka.js`),
  con el mismo diseño que la del Peg: misma card `.tablero` de 808×660 px,
  portada con botón "Jugar", panel lateral con ficha y Ayuda, Sobre el juego,
  Galería, Compartir y reseñas. `juego.html` no se toca.
- **Por qué:** el enunciado pide una página propia "similar a la del Peg
  Solitaire", y el Peg se retoma en el TPE4.
- **`blocka.html` carga `juego.css` y después `blocka.css`:** el layout, la
  card y la Ayuda ya están resueltos en `juego.css`; repetirlos en otro
  archivo sería duplicar. `blocka.css` solo pisa lo que cambia (zona de juego
  centrada y miniatura de la ficha), aprovechando que lo último cargado gana.
- **Descartado:** copiar `juego.css` entero a un `blocka.css` (dos archivos con
  el mismo CSS para mantener).

### Blocka sí tiene `h1` (oculto), a diferencia del Peg
- **Qué:** `blocka.html` lleva un `<h1 class="sr-only">Blocka, rompecabezas de
  imágenes</h1>` al principio de `<main>`. `juego.html` (Peg) sigue sin `h1`.
- **Por qué:** la regla del proyecto es un solo `h1` por página, y la excepción
  que tiene el Peg (decisión de Fran en el TPE2, todavía sin cerrar entre los
  tres) no se hereda sola a una página nueva: Blocka nació copiando la
  estructura del Peg y quedaba sin título. Se hizo en el repaso final.
- **Por qué oculto y no visible:** el nombre del juego ya se ve en el breadcrumb
  y en la card, y un título grande cambiaría el diseño, que tiene que ser el
  mismo que el del Peg. `.sr-only` lo deja disponible para lectores de pantalla
  (y es el primer encabezado del documento, así que el esquema de títulos
  empieza bien: h1, h2...) sin tocar nada a la vista.
- **Descartado:** convertir el nombre de la ficha (`.ficha-juego__nombre`) en
  `h1`, como hace `producto.html`: queda dentro del panel lateral, que en el
  HTML viene después de la card, y el esquema arrancaría con un `h2`.

## Imágenes

### Portada recortada a la proporción de la card y pasada a JPG
- **Qué:** `portada-blocka.jpg` (1374×1122, 567 KB) sale de la imagen original
  de 1402×1122 (3 MB, PNG), recortada al centro a la proporción exacta de la
  card (808:660). El original queda fuera de `tp3/`, en `assets/`.
- **Por qué:** 3 MB es demasiado para una portada web, y con la proporción ya
  ajustada `object-fit: cover` no recorta nada en el navegador (mismo criterio
  que la portada del Peg). El nombre original tenía tilde, espacios y
  mayúsculas, que rompen en GitHub Pages.

### Banco de imágenes cuadradas
- **Qué:** empezó con 6 imágenes de 1040×1040; hoy son 21 (ver "Banco de 21
  imágenes", más abajo), en `tp3/assets/img/`. Todas cuadradas.
- **Por qué:** el enunciado pide 6 o más. Cuadradas porque cada pieza gira de a
  90°: una pieza rectangular no encajaría en su casillero después de girar.

## Home

### Banner: Blocka primero, Neon Circuit segundo (`JUEGOS_PROPIOS`)
- **Qué:** en `carousel.js`, `BLOCKA` y `NEON_CIRCUIT` van en el array
  `JUEGOS_PROPIOS` (cada uno con su `enlace`) y `esPropio()` reemplaza las
  comparaciones `=== NEON_CIRCUIT`. El banner sigue con 5 cards: 2 propias y
  las 3 mejor puntuadas de la API.
- **Por qué:** con dos juegos propios, repetir el caso especial de Neon Circuit
  habría duplicado código. Blocka va primero porque es el juego de esta entrega.
- **Sin badge ni ficha:** igual que Neon Circuit, no vienen de la API (no tienen
  `id` para precio, "Nuevo" o carrito) y tienen su propio botón "Jugar".
- **La portada se ve recortada en el banner, a propósito:** la card activa mide
  ~1,1:1 y la portada es apaisada, así que `cover` corta un poco los costados
  ("B" y "A"). Se probó una versión con relleno arriba y abajo y se descartó:
  la portada actual es provisoria, no vale la pena mantener otra imagen.

## Motor del juego

### Un solo `<canvas>` de 480×480 que se redibuja entero
- **Qué:** el juego vive en `#blocka-canvas`. La imagen se corta en 4, 9 o 16
  piezas (de 240, 160 o 120 px, ver "Un solo tablero de 480x480 píxeles") y cada
  vez que algo cambia se vuelven a dibujar todas.
- **Por qué:** es la técnica que explicó la cátedra (`cargar-imagen.html`) y la
  que permite aplicar los filtros píxel por píxel con `getImageData`. Con 4
  piezas, redibujar todo es instantáneo.
- **Descartado:** una pieza por elemento HTML girada con CSS `transform`. El giro
  podría animarse sin código, pero los filtros por pieza (que piden el
  enunciado) son mucho más difíciles de aplicar.

### Cada pieza guarda un número de giros (0 a 3), no un ángulo
- **Qué:** `pieza.giros` cuenta cuartos de vuelta en sentido horario. Girar a la
  derecha suma 1, a la izquierda suma 3, y siempre `% 4`. La imagen está armada
  cuando las 4 piezas tienen `giros === 0`.
- **Por qué:** con ángulos en grados habría que normalizar (-90° es 270°) y
  comparar números con decimales. Contar giros enteros hace que "está bien
  puesta" sea simplemente `=== 0`.

### Clic izquierdo y derecho: `click` y `contextmenu`
- **Qué:** `click` gira a la izquierda; `contextmenu` (clic derecho) gira a la
  derecha y llama a `preventDefault()` para que no abra el menú del navegador.
  Para saber qué pieza se tocó se convierte la posición del mouse a
  coordenadas del canvas (el CSS puede mostrarlo más chico que sus 480 px).
- **Por qué:** lo pide el enunciado. `contextmenu` es el evento estándar del
  botón derecho.
- **Costo asumido:** el clic derecho no existe en touch ni con teclado. Como
  Blocka es solo desktop (como el resto de las páginas de juego), se acepta;
  la alternativa por teclado se resuelve en el pulido.

### Mezcla al azar, y nunca arranca ya armada
- **Qué:** cada pieza arranca con un giro al azar de 0 a 3. Si por casualidad
  las 4 quedan en 0 (1 de cada 256 veces), se vuelve a mezclar.
- **Por qué:** un nivel que arranca resuelto se ganaría sin hacer nada.

## Filtros

### `js/filtros.js` aparte, con la estructura de la plantilla de la cátedra
- **Qué:** tres funciones (`filtroGrises`, `filtroBrillo`, `filtroNegativo`) que
  reciben un `ImageData` y devuelven uno nuevo, más el objeto `FILTROS` que
  asocia cada nombre con su función. Misma estructura que `cargar-imagen.html`:
  doble `for` sobre los píxeles, `getRed/getGreen/getBlue` para leer y
  `setPixel` para escribir en una salida nueva.
- **Por qué:** un archivo por responsabilidad (el motor del juego no sabe cómo
  se calcula un filtro) y, al seguir la plantilla, cada línea se puede explicar
  en la defensa. Devolver un `ImageData` nuevo deja intacto el original.
- **`new ImageData(ancho, alto)` en vez de `ctx.createImageData`:** la plantilla
  usa el contexto del canvas, pero así `filtros.js` no depende de ningún canvas.
- **`index` con `const`:** la plantilla lo deja como variable global sin
  declarar; acá es local a cada función.

### Brillo al 30 %: multiplicar cada canal por 0,3
- **Qué:** `filtroBrillo` multiplica cada canal por 0,3 (`FACTOR_BRILLO`): la
  imagen queda al 30 % de su brillo, más oscura.
- **Por qué:** decisión del equipo: "brillo 30 %" es el brillo que queda, no
  un aumento. Multiplicar oscurece en proporción (un píxel claro sigue siendo
  más claro que uno oscuro). Un número entre 0 y 1 nunca da menos de 0 ni más
  de 255, así que no hace falta el `Math.min` de antes.
- **Antes:** se multiplicaba por 1,3 (+30 %, más claro). Se revirtió por
  decisión del equipo.
- **Descartado:** restar un valor fijo a cada canal (aplasta los tonos oscuros
  a negro y les quita contraste).

### Los filtros se aplican por pieza, una sola vez, al armar el nivel
- **Qué:** cada pieza guarda su recorte `original` y un `lienzo` ya filtrado
  (dos canvas chicos del tamaño de la pieza, fuera de la página). El juego
  dibuja siempre el `lienzo`. Al ganar, un fundido pasa de uno al otro y
  `lienzo` queda apuntando al `original`: se ven los colores reales sin
  recalcular nada (ver "Fundido al ganar").
- **Por qué:** lo pide el enunciado ("filtros aplicados en tiempo de carga, en
  el setup del nivel") y permite que cada pieza lleve un filtro distinto.
  Filtrar la imagen completa y recortar después no lo permitiría. Los giros
  no vuelven a calcular píxeles: solo cambia el ángulo al dibujar.

### Niveles en un array de configuración (`NIVELES`)
- **Qué:** `NIVELES` es una lista de objetos `{ filtros: [...] }`. Con un solo
  nombre, el filtro vale para todas las piezas; con cuatro, cada pieza lleva el
  suyo. Hoy (decisión del equipo): nivel 1 escala de grises, sin tiempo
  máximo; nivel 2 negativo, con tiempo máximo; nivel 3 un filtro distinto por
  pieza (negativo, brillo, grises, negativo), con tiempo máximo.
- **Antes:** nivel 1 brillo, nivel 2 grises. Se reordenó de menos a más
  difícil: los grises se reconocen enseguida, el negativo cuesta más y la
  mezcla es lo más difícil.
- **Por qué:** agregar o cambiar un nivel es editar una línea, sin tocar la
  lógica. Cubre lo que pide el enunciado: tres niveles, los tres filtros, y en
  los avanzados un filtro distinto por subimagen.

### Si el canvas está "contaminado", se avisa en pantalla
- **Qué:** `crearPiezas` va dentro de un `try/catch`; si `getImageData` falla,
  el texto de estado dice que hay que abrir la página desde `http://localhost`.
- **Por qué:** abriendo el archivo con doble clic (`file:///`) el navegador
  bloquea la lectura de píxeles. Sin aviso el juego quedaría vacío y sin
  explicación. En GitHub Pages (https) no pasa.
- **Con "Reintentar nivel" y "Volver al inicio" (bug corregido):** antes, si
  la imagen no cargaba (`onerror`) o el canvas estaba contaminado, el aviso
  aparecía pero todos los botones quedaban ocultos y la partida no tenía
  salida. Ahora `mostrarErrorDeCarga()` muestra el aviso junto con esos dos
  botones (el foco va a "Reintentar nivel").

### Fundido al ganar
- **Qué:** al armar la imagen (o con Trampa), `quitarFiltros()` hace un fundido
  en el mismo canvas con `requestAnimationFrame`: en cada cuadro dibuja las
  piezas con filtro y, encima, las originales con `globalAlpha` de 0 a 1,
  durante `--duracion-estado` (500 ms, leído de `variables.css`) con una curva
  que frena al final. Mientras dura, los clics no giran nada (el nivel ya no
  está activo) y los botones del final ya están visibles.
- **Por qué:** antes los colores reales aparecían de golpe; el fundido hace
  visible el cambio de estado (corrección del profesor: animaciones más
  marcadas). Si se aprieta un botón a mitad del fundido, `iniciarNivel()` y
  `mostrarInicio()` lo cancelan (`cancelAnimationFrame`), para que no siga
  dibujando sobre el nivel nuevo.
- **Movimiento reducido:** con `prefers-reduced-motion: reduce` el cambio es
  directo, como antes.
- **El giro de las piezas sigue sin animación** (decisión del equipo): cada
  clic cambia el giro al instante.
- **Descartado:** una transición CSS de opacidad sobre un segundo canvas
  encimado: más HTML y CSS para el mismo efecto.

## Niveles, temporizador y récord

### Pantalla de inicio entre la portada y la partida
- **Qué:** "Jugar" (portada) ya no abre el nivel: muestra una pantalla de inicio
  dentro de la misma card, con la tabla de **récords** de los 3 niveles y el
  botón **Comenzar**. Recién ahí se carga la imagen y arranca el
  nivel 1 con el reloj corriendo. Pedido de Fran.
- **Un solo "Comenzar":** antes había que apretar "Jugar" y después otro
  "Comenzar" dentro del nivel. El que queda es el del inicio; el reloj arranca
  cuando la imagen terminó de cargar (así la descarga no le cuenta al jugador).
- **Por qué:** lo pide el enunciado ("el temporizador se inicia cuando el usuario
  elige Comenzar") y además ordena la experiencia: ver los récords antes de
  empezar.
- **"Siguiente nivel" y "Reintentar" arrancan al instante**, sin volver al
  inicio: el jugador ya eligió seguir, y repetir el paso sería fricción.
- **Al terminar el nivel 3**, el botón dice "Volver al inicio" y lleva a esta
  pantalla (vuelve al nivel 1, con los récords actualizados).
- **Sin "Cómo se juega" en el inicio** (pedido de Fran): la primera versión
  tenía las instrucciones al lado de los récords, pero ya están en el panel de
  Ayuda de la derecha, que se ve en toda la página. Tenerlas en dos lugares
  era repetir el mismo texto para mantener dos veces. Quedó un solo panel de
  récords, centrado (`max-width: 480px`).
- **La lista de récords se arma con JS** (`mostrarRecordsInicio()`) porque lee
  `localStorage`. Cada fila muestra el nivel,
  su tiempo máximo ("Sin límite" o "Límite 01:00") y el mejor tiempo ("—" si no
  hay). Por eso `NIVELES` suma un `nombre` por nivel.
- **Descartado:** que cada fila de récords sea un botón para elegir el nivel
  desde el que se arranca (se salta la progresión de dificultad del enunciado).
- **Foco:** al apretar "Comenzar" pasa al canvas; al volver al inicio, a
  "Comenzar". Sin esto el foco caería al `<body>` al desaparecer el botón.
- **Detalle de CSS:** para centrar el contenido en vertical dentro de la card,
  `.tablero__cuerpo` pasa a columna flex y `.tablero__juego` a `flex: 1`; el
  `height: 100%` de `juego.css` no alcanza porque el cuerpo no tiene alto fijo.

### El reloj se calcula contra el instante de inicio, con décimas
- **Qué:** `iniciarReloj()` guarda `performance.now()` y un `setInterval` de
  100 ms muestra `ahora - inicio` como `mm:ss.d`.
- **Por qué:** igual que en el loading del TPE2: si el navegador demora un tick
  (pestaña en segundo plano), sumar de a 100 se atrasaría; restar contra el
  inicio siempre da el tiempo real. Las décimas evitan empates entre tiempos
  parecidos al comparar récords.
- **Descartado:** `Date.now()` (puede saltar si cambia la hora del sistema).

### Récord por nivel en `localStorage`
- **Qué:** clave `warden-blocka-records`, un objeto con una entrada por nivel. (Desde el
  extra de dificultades la clave de cada entrada es `"<piezas>-<nivel>"`, ver
  "Extra: dificultades de 4, 9 y 16 piezas".)
  Un tiempo solo reemplaza al guardado si es menor. El récord del nivel actual
  se muestra en el HUD y en "Tu récord" de la ficha.
- **Por qué:** es el mismo mecanismo que ya usa el sitio para la sesión y el
  carrito. Cada nivel tiene su propio récord porque los tiempos de un nivel con
  un filtro no se pueden comparar con los de otro.
- **Si el storage falla** (bloqueado, lleno), `try/catch` lo ignora: el juego
  anda igual, solo que sin récords guardados.
- **Se guarda en milisegundos y se muestra con décimas:** así la comparación es
  exacta aunque en pantalla dos tiempos se vean iguales.

### Fin de nivel: "Reintentar nivel", "Volver al inicio" y "Siguiente nivel"
- **Qué:** al armar la imagen aparecen "Reintentar nivel" (mismo nivel, imagen
  nueva), "Volver al inicio" (pantalla de inicio del juego, con los récords) y,
  si hay un nivel siguiente, "Siguiente nivel" (arranca al instante, otra
  imagen y otro filtro). Tras el último nivel no hay "siguiente". Al perder por
  tiempo quedan "Reintentar nivel" y "Volver al inicio".
- **Se sacó el botón "Menú principal"** que llevaba a la Home del sitio (pedido
  de Fran). El enunciado dice que al terminar un nivel se puede "volver al Menú
  Ppal o continuar al siguiente": la salida a la Home sigue en el "Volver al
  menú" del header, siempre visible, y "Volver al inicio" lleva al menú del
  juego. Primero se había reemplazado de más ("Volver al inicio" quedaba solo
  en el último nivel); se corrigió con un botón propio (`#btn-inicio`).
- **Por qué un botón propio y no reusar "Siguiente nivel":** así "Volver al
  inicio" está en todos los finales (ganar o perder, cualquier nivel), no solo
  después del último.
- **La imagen nunca se repite dos niveles seguidos:** se sortea de nuevo
  mientras toque la misma que la anterior (`ultimaImagen`). El enunciado dice
  que cada nivel usa "otra imagen".

### Canvas mostrado a 440 px (resolución real de 480 px)
- **Qué:** el `<canvas>` es de 480×480 píxeles, pero el CSS lo muestra a
  440 px (`--ancho-canvas`).
- **Por qué:** la card mide 660 px de alto (igual a la del Peg) y, con el HUD,
  el texto de estado y la fila de botones, a tamaño real no entraba. Medido: los
  botones terminan 38 px antes del borde de la card.
- **Los clics no se ven afectados:** `piezaEnPunto()` ya escala la posición del
  mouse con la relación entre el tamaño real y el mostrado.
- **Lugar reservado para los botones** (`min-height` de 44 px): el canvas no
  salta cuando aparecen o desaparecen.

## Extras: Ayudita, Trampa y tiempo máximo

### Ayudita: una parte bien puesta y bloqueada, +5 segundos
- **Qué:** el botón "Ayudita (+5 s)" elige al azar una parte que todavía no está
  bien puesta, la deja en su lugar (`giros = 0`), la marca como `fija` y la
  bloquea: los clics sobre ella no hacen nada. Las partes fijas se dibujan con
  un borde del color de acento (`--acento`, leído de `variables.css` con
  `getComputedStyle`, porque en JS no se puede usar `var()` directo).
- **Los 5 segundos:** en vez de guardar una penalización aparte, se corre
  `inicioMs` 5 segundos hacia atrás. Así el tiempo mostrado, el límite y el
  récord ya la incluyen sin sumar nada más (el enunciado dice "se sumarán 5
  segundos al contador").
- **Sin tope de usos:** el enunciado no lo limita. Cada uso cuesta 5 s, que ya
  es el costo; y si se usa en la última parte pendiente, el nivel termina.
- **Descartado:** limitar a una Ayudita por nivel (no está en el enunciado) y
  mostrar un contador de ayudas.

### Trampa: resuelve el nivel, pero no cuenta para el récord
- **Qué:** botón extra pedido por el equipo. Deja las 4 partes bien puestas y
  termina el nivel como si se hubiera ganado: se quitan los filtros y aparecen
  "Reintentar nivel", "Volver al inicio" y "Siguiente nivel". El mensaje lo aclara ("Nivel resuelto
  con trampa: no cuenta para el récord").
- **Por qué sin récord:** si guardara el tiempo, el récord sería casi 0 y
  bloquearía cualquier mejora real. Se usa `terminarNivel(conTrampa)`, la misma
  función que cierra un nivel ganado, con un parámetro, para no duplicar código.
- **Estilo `btn--terciario`:** es la acción de menor prioridad (Ayudita queda
  en `btn--secundario`).

### Tiempo máximo en los niveles 2 y 3 (`tiempoMax` en `NIVELES`)
- **Qué:** el nivel 1 no tiene límite; el 2 y el 3 tienen 60 s cada uno
  (provisorio, para poder probar todo; antes 120 s y 90 s). El HUD
  muestra `00:12.3 / 01:00`. Si el tiempo transcurrido llega al límite, se pierde
  el nivel: el reloj se frena, las partes dejan de girar y quedan
  "Reintentar nivel" (mismo nivel, imagen nueva, arranca al instante) y
  "Volver al inicio".
- **Por qué:** lo pide el extra del enunciado ("al menos los más avanzados").
  Poner el límite en la configuración del nivel permite cambiarlo en una línea.
- **Ayudita se deshabilita** (`actualizarAyudita()`, atributo `disabled`)
  cuando no quedan partes mal puestas o, en los niveles con tiempo máximo,
  cuando quedan menos de 5 s (los 5 s que suma harían perder al instante). Se
  revisa en cada tick del reloj y después de cada giro o Ayudita, y vuelve a
  habilitarse al empezar un nivel. Así el botón nunca invita a una acción que
  no sirve o que hace perder. Si igual se pasara del límite (el tick es cada
  100 ms), se pierde en el momento.
- **Descartado:** dejarlo habilitado y que haga perder (la versión anterior):
  un botón que hace perder sin avisar es una trampa para el jugador.
- **Una victoria pasado el límite no cuenta (bug corregido):** el límite solo
  se revisaba en el tick de 100 ms, así que un clic que armaba la imagen entre
  dos ticks (o una Ayudita cuyos 5 s pasaban el límite) ganaba y guardaba
  récord. Ahora `tiempoAgotado()` se revisa también al hacer clic, antes de
  girar, y después de la Ayudita, antes de dar el nivel por ganado: si ya se
  pasó, se pierde.
- **Los botones se muestran según el momento** (`ocultarAcciones()`): jugando,
  "Ayudita" y "Trampa"; al ganar, "Reintentar nivel", "Volver al inicio" y
  "Siguiente nivel"; al perder, "Reintentar nivel" y "Volver al inicio". Así nunca hay botones que no
  corresponden.

### "Reintentar nivel" usa el botón destructivo (rojo)
- **Qué:** `#btn-reintentar` lleva `btn--destructivo`: borde y texto en
  `--error`, y al pasar el mouse se rellena de rojo con un pulso de resplandor.
- **Por qué:** pedido de Fran. Es la cuarta variante de botón del design system
  (la que pulsa en rojo) y hasta ahora no se usaba en ninguna pantalla (ver
  "Dónde se ve cada animación de hover" en `DECISIONES.md`). Se usa al perder
  un nivel y también al ganar: el rojo comunica la acción de volver a
  empezar el nivel. Con esto
  las cuatro animaciones de hover del TPE2 se ven en el sitio.
- **Nota:** "destructivo" es el nombre de la variante; acá no borra nada, solo
  descarta la partida perdida.

## Extra: sorteo de la imagen (tragamonedas)

### Tres rodillos que frenan en la misma imagen
- **Qué:** entre "Comenzar" / "Siguiente nivel" / "Reintentar nivel" y el juego,
  aparece una tragamonedas de 3 rodillos. Cada rodillo es una ventana de 3
  casillas de alto sobre una tira vertical de imágenes del banco. Las tiras
  caen y frenan una tras otra (izquierda, centro, derecha) hasta dejar la
  imagen elegida en la fila del medio, la **línea de pago**: tres iguales. Arriba
  y abajo quedan otras imágenes, como en una máquina real. Pedido de Fran
  ("un tragamonedas más real, con las 3 filas, que salga la misma imagen").
- **Por qué:** es el extra del enunciado ("previo a iniciar el nivel se muestran
  todas las imágenes y mediante una animación se muestra con cuál se jugará").
  Como las tiras repiten las 6 imágenes, al girar pasan todas por la ventana.
- **La imagen se sortea antes de girar** (con la misma lógica de siempre: al
  azar y distinta a la del nivel anterior). La animación solo termina mostrando
  esa imagen, así el sorteo y el juego nunca se contradicen.

### Dura 2 segundos y el reloj del nivel arranca después
- **Qué:** los rodillos frenan a 1000, 1300 y 1600 ms; los últimos 400 ms se
  queda quieto, con la línea de pago encendida, y a los 2000 ms arranca el
  nivel. El reloj del juego corre recién entonces (el sorteo no le cuenta al
  jugador). Pedido de Fran: 2 segundos.
- **Los rodillos de la derecha tienen más imágenes** (14, 18 y 22), así recorren
  más camino en su tiempo y giran más rápido: la sensación de un rodillo que
  "frena" distinto a los otros.
- **Las constantes** (`DURACION_SORTEO_MS`, `PARADAS_RODILLOS_MS`,
  `CASILLAS_POR_TIRA`) están juntas arriba de la sección en `blocka.js`.

### Animación con transición CSS, no cuadro por cuadro
- **Qué:** el JS arma la tira, la deja corrida hacia arriba (sin transición) y
  después le pone `transform: translateY(0)`. La transición con frenado
  (`cubic-bezier(0.15, 0.7, 0.2, 1)`) está en `blocka.css`; el JS solo elige la
  duración de cada rodillo. Hay una lectura de `offsetHeight` en el medio, que
  obliga al navegador a aplicar el punto de partida antes del cambio: sin eso
  se ve el estado final de golpe.
- **`translateY` en %:** se mide contra la altura de la propia tira, así el JS no
  necesita saber cuántos píxeles mide cada casilla (el tamaño sale de la
  variable `--lado-casilla` del CSS).
- **Por qué:** es CSS animado (no GIF ni spritesheet) y es la misma idea que ya
  usa el loading de la Home. Descartado: `requestAnimationFrame` con cuentas a
  mano, que es más código para el mismo resultado.
- **Aspecto de cilindro:** un degradé de `--fondo` arriba y abajo de cada
  rodillo (`::after`) lo oscurece en los bordes, y la línea de pago usa
  `--tablero-activo` (el naranja neón del tablero del Peg).

### Movimiento reducido: sin giro, resultado directo
- **Qué:** con `prefers-reduced-motion: reduce`, las tiras saltan al resultado
  sin transición, la línea de pago se enciende al instante y se espera 600 ms
  (no 2 s) antes de arrancar. También hay una regla en CSS por las dudas.
- **Por qué:** es la regla del proyecto ("toda animación respeta
  `prefers-reduced-motion`"). El sorteo sigue mostrando qué imagen salió, que es
  lo que importa, sin el giro.

### Accesibilidad del sorteo
- **Qué:** los rodillos son `aria-hidden` (son decorativos, 40 imágenes
  repetidas); lo que se lee es el texto de estado (`role="status"`): "Sorteando
  la imagen…" y después "¡Tres iguales! Esta es la imagen del nivel." El foco
  pasa al bloque del sorteo (`tabindex="-1"`) y de ahí al canvas.
- **Precarga:** las 6 imágenes se cargan antes de girar, para que no aparezcan
  de golpe a mitad de la animación. Si alguna falla, el sorteo sigue igual.

## Borrar récords

### Un tachito por fila, con el botón destructivo
- **Qué:** cada fila de la tabla de récords (pantalla de inicio) tiene un botón
  cuadrado de 44 px con el ícono `ph-trash` de Phosphor, que borra el récord de
  ese nivel. Usa `btn--destructivo`: borde y ícono rojos y, al pasar el mouse,
  se rellena de rojo con el pulso de resplandor (la cuarta animación de hover,
  la misma de "Reintentar nivel"). Pedido de Fran.
- **Por qué uno por uno y no "borrar todos":** cada nivel tiene su propio
  récord, y a veces se quiere reiniciar solo uno. Con tres filas, tres tachitos
  no ensucian la tabla. Descartado: un botón "Borrar todos" aparte (más grande
  y más fácil de apretar sin querer).
- **Accesibilidad:** el ícono es decorativo (`aria-hidden`) y el nombre del
  botón es el `aria-label` "Borrar el récord del nivel N". Mide 44 px
  (`--control-alto`), como el resto de los controles de solo ícono.
- **Al borrar:** `eliminarRecord()` saca la clave del nivel del objeto en
  `localStorage` (mismo `try/catch` que `guardarRecord`), se rearma la tabla, se
  actualiza "Tu récord" de la ficha y un texto de estado (`role="status"`)
  anuncia "Récord del nivel N borrado." El foco pasa a "Comenzar", porque el
  tachito que lo tenía deja de verse.
- **Sin récord, el tachito no se ve** (`visibility: hidden`): no hay nada que
  borrar, no recibe foco y sigue ocupando su lugar para que las filas queden
  alineadas.
- **Sin confirmación:** borrar un récord es barato (se vuelve a lograr jugando)
  y un `confirm()` nativo bloquea la página y no se puede estilar (ver las
  decisiones del TPE2 sobre `alert()`). Si más adelante hiciera falta, la salida
  sería un "deshacer" en el aviso de estado.

## Extra: dificultades de 4, 9 y 16 piezas

### Por qué 4, 9 y 16 y no 4, 6 y 8 (para la defensa)
- **Qué dice el enunciado:** el extra pide configurar la "cantidad de subimagen
  de la Blocka: 4, 6, 8".
- **Qué hicimos:** 4 (2x2), 9 (3x3) y 16 (4x4) piezas. El tablero es siempre el
  mismo cuadrado; con más piezas, cada una es más chica.
- **Por qué:** las piezas giran de a 90°, así que tienen que ser cuadradas (una
  pieza rectangular no encaja en su casillero después de girar). Y un cuadrado
  solo se puede dividir en piezas cuadradas iguales cuando la cantidad es un
  cuadrado perfecto (4, 9, 16...). Con 6 u 8 no existe esa grilla: había que
  elegir entre estirar la imagen, recortarla, usar una imagen apaisada o usar
  piezas rectangulares que no giran de a 90°.
- **Primera versión (descartada):** 4 = 2x2, 6 = 3x2 y 8 = 4x2, con piezas
  cuadradas. Funcionaba, pero con 6 y 8 el tablero pasaba a ser un rectángulo y
  de la foto cuadrada se usaba solo una franja del centro: la imagen cambiaba de
  forma y se perdía parte. Fran lo marcó: la gracia de las imágenes cuadradas es
  que tengan siempre el mismo tamaño y la misma simetría.
- **Descartado también:** imágenes rectangulares en el banco (la imagen dejaría
  de tener siempre el mismo tamaño) y piezas rectangulares (solo podrían girar
  180°, y "clic izquierdo" y "clic derecho" harían lo mismo).
- **Costo asumido:** los números del enunciado (6 y 8) pasan a ser 9 y 16. Los
  otros tres extras (Ayudita, tiempo máximo y sorteo) ya cubren el mínimo de dos
  que pide el enunciado para promocionar.

### Se elige al tocar "Comenzar", antes del sorteo
- **Qué:** "Comenzar" (pantalla de inicio) abre "Elegí la dificultad", con tres
  tarjetas-botón (4 Fácil, 9 Medio, 16 Difícil) y un "Volver". La opción elegida
  fija la dificultad y arranca el nivel 1 con el sorteo. "Siguiente nivel" y
  "Reintentar nivel" conservan la dificultad; "Volver al inicio" permite elegir
  de nuevo. Pedido de Fran.
- **Por qué antes del sorteo y no dentro del nivel:** la cantidad de piezas
  cambia casi todo (récords, límite de tiempo, tamaño de las piezas), así que
  se decide una vez por partida, al empezar, y no nivel por nivel.
- **Actualización:** las tarjetas ya no dicen Fácil/Medio/Difícil sino la
  grilla (2 × 2, 3 × 3, 4 × 4), la pantalla se llama "Elegí la cantidad de
  piezas" y, al elegir, no arranca el nivel: pasa a elegir el modo (ver "Extra:
  modo Normal y Difícil").

### Un solo tablero de 480x480 píxeles
- **Qué:** `LADO_TABLERO = 480`. `DIFICULTADES` guarda cuántas piezas entran por
  lado (2, 3 o 4) y `ladoPieza()` da su tamaño: 240, 160 o 120 px. El canvas
  siempre se muestra a 440 px de ancho (la variable `--ancho-canvas`, de la
  que también sale el ancho del HUD).
- **Por qué 480:** se divide justo por 2, 3 y 4, así cada pieza mide un número
  entero de píxeles (con 520, que usábamos antes, 3 daba 173,33 y los bordes de
  las piezas se verían borrosos).
- **Se simplificó el código:** desapareció `ajustarCanvas()`, el `data-piezas`
  en el CSS y el ancho variable del canvas, que ya no hacen falta.
- **El recorte usa toda la imagen:** las del banco son cuadradas (1040x1040).
  Si alguna no lo fuera, se usaría el cuadrado del centro (el lado más corto)
  para que las piezas sigan siendo cuadradas.
- **El patrón de filtros se repite:** el nivel 3 (filtros mixtos) tiene 4
  filtros; con más piezas la pieza `i` usa el filtro `i % 4`. Así los tres
  filtros aparecen con 4, 9 y 16 piezas (con 16, cada columna lleva uno).

### Más piezas, más tiempo límite (proporcional)
- **Qué:** `tiempoMax` de cada nivel está pensado para 4 piezas y
  `limiteSegundos(nivel, piezas)` lo multiplica por `piezas / 4`: con el límite
  actual de 60 s son 60 s (4 piezas), 135 s (9) y 240 s (16). El nivel 1 sigue
  sin límite en todas.
- **Por qué:** con 16 piezas hay cuatro veces más partes que girar (cuatro
  veces más clics), así que el mismo tiempo sería mucho más difícil.
  Proporcional es lo más simple de explicar. Los 5 segundos de Ayudita no
  cambian.
- **Descartado:** un límite fijo por dificultad escrito a mano en cada nivel
  (seis números más para mantener en `NIVELES`).

### Los récords son por dificultad y por nivel
- **Qué:** la clave es `"<piezas>-<nivel>"` (por ejemplo `"16-1"`). La tabla de
  récords del inicio tiene tres botones (4, 9 y 16 piezas, con `aria-pressed`)
  para ver los de cada dificultad; muestra también el límite de esa dificultad
  y los tachitos borran el récord de la que se ve. Al volver de una partida la
  tabla queda en la dificultad que se jugó.
- **Por qué:** un tiempo con 4 piezas no se puede comparar con uno de 16. Si
  compartieran récord, el de 4 piezas sería casi imposible de superar con 16.
- **Los récords viejos (claves `"0"`, `"1"`, `"2"`) dejan de verse:** eran de 4
  piezas, pero no se migraron. Eran solo de prueba y migrarlos sumaba código
  para un caso que existe en un solo navegador.
- **Descartado:** una tabla con las tres dificultades como columnas (no entra en
  la card junto con el límite y el tachito de cada fila).
- **Actualización:** con el modo Difícil la clave pasó a ser
  `"<piezas>-<modo>-<nivel>"` (ver "Extra: modo Normal y Difícil").

## Extra: modo Normal y Difícil (filtro sorpresa)

### Dos ejes independientes: piezas y modo
- **Qué:** después de elegir la cantidad de piezas aparece "Elegí el modo", con
  dos tarjetas (Normal y Difícil) y un "Volver" que lleva de nuevo a las
  piezas. Al elegir el modo arranca el nivel 1 con el sorteo, como antes.
  "Siguiente nivel" y "Reintentar nivel" conservan piezas y modo.
- **Por qué:** la cantidad de piezas y el filtro complican cosas distintas
  (cuántas partes hay que girar y cuánto cuesta reconocer la imagen). Separarlos
  deja jugar, por ejemplo, 4 piezas en Difícil o 16 en Normal.
- **Las tarjetas de piezas dejaron de decir Fácil/Medio/Difícil:** ahora dicen
  la grilla (2 × 2, 3 × 3, 4 × 4). Con "Difícil" en las dos pantallas no se
  entendía si se hablaba de las piezas o del modo.
- **Reusa las tarjetas:** la pantalla de modo usa el mismo bloque y la misma
  `.blocka__opcion` que la de piezas (con `.blocka__opciones--dos` para dos
  columnas). En el JS se distinguen por `data-piezas` o `data-modo`.
- **Foco:** al mostrar la pantalla de modo pasa a "Normal"; "Volver" lo
  devuelve a la tarjeta de piezas que se había elegido.
- **Descartado:** dejar Fácil/Medio/Difícil en las tarjetas de piezas (ambiguo
  con el modo) y elegir piezas y modo en una sola pantalla (seis tarjetas no
  entran bien en la card y mezclan las dos decisiones).

### Difícil: un filtro al azar para toda la imagen, sin repetir el anterior
- **Qué:** Normal es lo de siempre (los filtros fijos de `NIVELES`). En Difícil,
  cada vez que empieza un nivel (también al reintentarlo o al pasar al
  siguiente) `sortearFiltro()` elige uno de los filtros de `FILTROS` (grises,
  brillo o negativo) y `filtrosDelNivel()` lo devuelve como lista de un solo
  filtro, que vale para todas las piezas. El nivel 3 también: en Difícil no
  mezcla. `crearPiezas()` solo cambió para pedirle la lista a
  `filtrosDelNivel()`. Los tiempos límite no cambian.
- **Por qué un solo filtro para toda la imagen:** decisión del equipo ("por
  pieza no"). La dificultad está en no saber de antemano qué filtro va a tocar,
  no en mezclar.
- **Por qué nunca el mismo que el nivel anterior:** `ultimoFiltro` guarda el
  último sorteado y se vuelve a sortear si sale igual, el mismo criterio que
  `ultimaImagen` con las imágenes. Con solo tres filtros, repetir seguido se
  sentiría como que no hubo sorteo.
- **Por qué de `FILTROS` y no de `NIVELES`:** `FILTROS` son los tres filtros
  que existen; tomarlos de `NIVELES` mezclaría la lista del nivel 3 y el
  negativo saldría el doble de veces.
- **Descartado:** un filtro al azar por pieza (lo descartó el equipo) y sortear
  entre las listas de `NIVELES`.

### "Filtro sorpresa": no se dice cuál tocó
- **Qué:** en Difícil, donde se mostraría el nombre del filtro (título del
  sorteo y filas de la tabla de récords) dice "Filtro sorpresa"
  (`nombreNivel()`). El título del sorteo suma el modo ("· Difícil").
- **Por qué:** decir el filtro antes de jugar le quita la sorpresa, que es la
  gracia del modo. Al ganar se quitan los filtros como siempre.
- **Se revela al terminar:** al ganar, al resolver con Trampa o al perder por
  tiempo, el mensaje de estado suma "El filtro era: negativo." (u otro), con
  los nombres de `NOMBRES_FILTRO` y `textoFiltroRevelado()`. En ese momento ya
  no le quita la sorpresa a nadie, y el jugador se entera de qué le tocó. En
  Normal no se agrega nada (el filtro ya se conocía). Pedido de Agus.
- **El HUD no muestra el modo:** "Nivel 1 de 3 · 16 piezas · Difícil" junto
  al tiempo con límite y el récord no entra en los 440 px del canvas. El modo
  ya se ve en el título del sorteo, justo antes de jugar.

### Récords por piezas, modo y nivel
- **Qué:** la clave pasa a ser `"<piezas>-<modo>-<nivel>"` (por ejemplo
  `"16-dificil-2"`), con modo `normal` o `dificil`, en todos los lugares que
  leen, guardan o borran un récord. La tabla del inicio suma un segundo grupo
  de píldoras (Normal / Difícil, con `aria-pressed`, mismo estilo que las de
  piezas) debajo del primero. Los tachitos borran el récord de las piezas y el
  modo que se ven, y su `aria-label` nombra el modo. "Tu récord" de la ficha y
  la tabla, al volver de una partida, quedan en las piezas y el modo jugados.
- **Por qué:** un tiempo con el filtro fijo (que se conoce de antemano) no se
  puede comparar con uno con filtro sorpresa.
- **Los récords viejos (claves `"4-0"`, `"16-2"`...) dejan de verse:** mismo
  criterio que en "Los récords son por dificultad y por nivel": no se migran.
  Eran del modo Normal, pero migrarlos suma código para unos pocos récords de
  prueba.
- **Las dos píldoras van una debajo de la otra:** las dos filas juntas no
  entran al lado del título en los 480 px del panel.
- **Descartado:** dejar el modo afuera de la clave (un récord de Normal
  bloquearía mejorar en Difícil y al revés).

## Imágenes con esquinas vacías

### Problema: piezas que se ven iguales giradas de cualquier forma
- **Qué pasaba:** varias imágenes del banco tienen esquinas lisas (el negro de
  Avengers, Loki e Iron Man; el blanco de los logos sobre fondo blanco). Con 16
  piezas, algunas son un recuadro de un solo color: se ven idénticas giradas 0°,
  90°, 180° o 270°. Pero el juego exigía `giros === 0`, así que el jugador no
  tenía forma de saber cuál era la posición correcta y solo ganaba adivinando.
  Lo marcó Fran. Medido: variación de color de 2 sobre 255 en esas esquinas.
- **Por qué no se cambian las imágenes:** funcionaría con estas seis, pero el
  problema volvería con cualquier foto nueva. Es mejor que el juego lo resuelva
  solo.

### Solución: las rotaciones que se ven igual cuentan como correctas
- **Qué:** al crear cada pieza, `rotacionesEquivalentes()` la dibuja girada 90°,
  180° y 270° sobre un canvas auxiliar y compara sus píxeles con los de la
  pieza sin girar (`diferenciaMedia()`: promedio de la diferencia por canal).
  Si es menor que `UMBRAL_PARECIDO` (8 sobre 255, por debajo no se distingue a
  simple vista), esa rotación es "equivalente". Cada pieza guarda sus 4
  booleanos en `pieza.equivalentes`, y `estaBienPuesta()` es
  `equivalentes[giros]`.
- **Dónde se usa:** `estaArmada()` (victoria), `mezclar()` (las piezas lisas
  quedan en 0, girarlas no cambia nada, y el nivel nunca arranca armado) y
  Ayudita (solo elige piezas realmente mal puestas; no gasta una ayuda y 5
  segundos en una pieza lisa). Trampa no cambia.
- **También sirve para piezas simétricas** (por ejemplo un detalle que se ve
  igual a 180°), no solo para las lisas.
- **Medido con las 6 imágenes:** con 16 piezas, Avengers tiene 3 piezas lisas
  (las esquinas), Iron Man y Loki 2 cada uno (abajo), y X-Men tiene 2 simétricas
  y, con 9 piezas, el centro. Con 4 piezas ninguna imagen tiene. (X-Men queda
  fuera de la regla, ver más abajo.)
- **Tope de 50 intentos en `mezclar()`:** evita un bucle infinito si por algún
  motivo todas las piezas fueran lisas (no pasa con el banco actual).
- **Descartado:** subir el umbral para considerar "iguales" piezas con poco
  detalle (como las que tienen unos pocos puntos de luz): el jugador sí puede
  distinguirlas y se perdería el desafío.

### Los PNG con fondo transparente se pintan sobre blanco
- **Qué:** `recortarPieza()` rellena de blanco el recorte antes de dibujar la
  imagen. Hace falta por `deadpool_1040x1040.png`, que es un PNG con el fondo
  recortado (transparente en casi todas las piezas).
- **Por qué:** sin esto las esquinas se veían como huecos que dejan pasar el
  fondo oscuro de la card, y los filtros (que escriben cada píxel como opaco)
  las volvían negras. Blanco es el fondo de los otros logos del banco (X-Men y
  el escudo del Capitán América), así que es coherente. Medido: las esquinas
  pasan de transparentes a (255, 255, 255, 255).
- **El color blanco está en el JS** (`fillStyle = 'white'`) porque el CSS no
  tiene un token de blanco puro y es una pintura de píxeles, no un estilo de la
  página.

### X-Men queda estricto: sus piezas solo valen en 0° (`estricta: true`)
- **Qué:** `BANCO_IMAGENES` admite una marca `estricta: true` por imagen. Con
  ella, `crearPiezas()` no calcula rotaciones equivalentes: cada pieza solo
  está bien puesta en 0°, como antes del cambio. Hoy solo X-Men la tiene.
  Pedido de Fran: la X no tiene el problema de las esquinas (sus esquinas son
  el blanco del fondo con un arco de la circunferencia, con detalle suficiente
  para orientarlas) y el centro de la X tiene que colocarse en su posición
  correcta, no aceptarse girado.
- **Por qué una marca por imagen y no un umbral más bajo:** bajar el umbral
  también dejaría de detectar las esquinas negras de Avengers, Loki e Iron Man,
  que sí hay que detectar. Decidir imagen por imagen es más simple de explicar y
  de cambiar.
- **Costo asumido:** el centro de la X con 9 piezas es casi simétrico (se ve
  parecido en las 4 rotaciones), así que ahí el jugador puede necesitar probar
  hasta dar con la correcta. Es una decisión explícita del equipo.
- **`imagenEstricta`** se actualiza en `arrancarNivel()` con la imagen sorteada,
  antes de crear las piezas.

## Banco de 21 imágenes

### Se renombraron y se revisaron una por una
- **Qué:** Fran cargó 18 imágenes nuevas y sacó 3 de las viejas (Avengers, y los
  Iron Man y Loki de 1040 px). Quedaron 21: Ant-Man, Pantera Negra, Viuda Negra,
  Capitana Marvel, Daredevil, Deadpool, Doctor Strange, escudo del Capitán
  América, Cuatro Fantásticos, Hydra, Guantelete del Infinito, Puño de Hierro,
  Iron Man, Loki, Miss Minutes, Ojo de Halcón, Spider-Man, The Punisher, Thor,
  Wolverine y X-Men. Todas son logos o íconos cuadrados.
- **Nombres de archivo:** todos en minúscula, con guiones y sin espacios, tildes
  ni símbolos (`Black Panther.jpg` -> `black-panther.jpg`, `Dr_ Strange.jpg` ->
  `dr-strange.jpg`, `Ojo-de-Halcón.jpg` -> `ojo-de-halcon.jpg`,
  `Hydra-Symbol.jpg` -> `hydra.jpg`, `Antman-icon.jpg` -> `antman.jpg`,
  `Wolverinw.jpg` (error de tipeo) -> `wolverine.jpg`) y sin el sufijo
  `_1040x1040`. **Por qué:** GitHub Pages distingue mayúsculas y los espacios y
  tildes rompen las rutas (regla de rutas del proyecto).
- **Tamaños:** van de 360 a 1040 px de lado (la mayoría 736). Los más chicos
  son The Punisher (360) y Black Widow (500). Se ven bien: el canvas es de 480 px
  y la pieza más chica (16 piezas) mide 120 px, es decir, se ampliaron como
  mucho 1,3 veces. Dr. Strange mide 736x737 (no exactamente cuadrada): el recorte
  usa el lado más corto, no hace falta tocarla.
- **El banco está en un solo lugar:** `BANCO_IMAGENES` de `js/blocka.js`, que
  usan el juego, el sorteo y la galería. Agregar una imagen es sumarla ahí.

### Análisis de bordes vacíos, en las tres divisiones
Se corrió el código real del juego en el navegador sobre cada imagen con 4, 9 y
16 piezas. "Lisa" es una pieza que se ve igual en las 4 rotaciones.
- **4 piezas:** ninguna imagen tiene piezas lisas.
- **9 piezas:** Daredevil (1 lisa, abajo a la izquierda), Miss Minutes (2, las
  esquinas de abajo); Black Widow y Deadpool tienen una pieza simétrica en el
  centro (no lisa). El resto, ninguna.
- **16 piezas:**
  - 4 lisas (las 4 esquinas): Pantera Negra, Daredevil, Guantelete del Infinito,
    Iron Man y Loki.
  - 5 lisas: Miss Minutes (4 esquinas y una más en el borde izquierdo), es la
    que más tiene.
  - 2 lisas: Doctor Strange (arriba, en el medio) y Thor (esquinas de arriba).
  - Sin lisas: Ant-Man, Viuda Negra, Capitana Marvel, Deadpool, escudo del
    Capitán América, Cuatro Fantásticos, Hydra, Puño de Hierro, Ojo de Halcón,
    Spider-Man, The Punisher, Wolverine y X-Men.

### Las piezas lisas quedan fijas (pedido de Fran)
- **Qué:** una pieza lisa (`esLisa()`: sus 4 rotaciones se ven iguales) arranca
  en su lugar, no se puede girar (los clics no hacen nada) y siempre cuenta como
  bien puesta. No lleva el borde de Ayudita: no se destaca, simplemente está
  hecha. Antes de este cambio se podía girar (daba igual) y el jugador gastaba
  clics en algo que no cambia nada.
- **Por qué:** "así no hay que enloquecerse": el jugador no se queda dudando si
  una esquina negra está bien o mal, y con 16 piezas hay menos partes que
  resolver. Se apoya en la misma detección de rotaciones equivalentes
  (`rotacionesEquivalentes()`); X-Men, que es `estricta`, no tiene piezas lisas.
- **Las simétricas parciales** (que valen en 0° y 180°, no en las 4) siguen
  siendo girables, porque ahí sí hay una orientación incorrecta.
- **Costo asumido:** con 16 piezas, una imagen como Miss Minutes tiene 5 piezas
  fijas, o sea 11 por resolver en vez de 16. Se acepta; Fran lo prefirió a
  sacar la imagen.

## Galería con capturas del juego

### La galería muestra cómo se ve el juego, no el banco de imágenes
- **Qué:** la galería animada (flip 3D, `js/galeria.js`) pasó de mostrar las
  imágenes del banco a mostrar 8 capturas de la partida, en el orden en que se
  vive: pantalla de inicio con récords, elección de dificultad, el sorteo
  (tragamonedas con tres iguales), nivel 1 con 4 piezas y brillo, nivel 2 con 9
  piezas y una parte fijada por Ayudita, nivel 3 con 16 piezas y filtros mixtos,
  derrota por tiempo y victoria con nuevo récord. Pedido de Fran, igual que en la
  página del Peg, que muestra capturas de su juego.
- **Por qué:** el enunciado pide "imágenes representativas del juego". Las
  capturas muestran las pantallas y las dificultades, que es lo que explica el
  juego; el banco de 21 imágenes ya se ve en el sorteo y en la partida.
- **Archivos:** `blocka-inicio.jpg`, `blocka-dificultad.jpg`, `blocka-sorteo.jpg`,
  `blocka-4-piezas.jpg`, `blocka-9-piezas.jpg`, `blocka-16-piezas.jpg`,
  `blocka-derrota.jpg` y `blocka-victoria.jpg`, en `tp3/assets/img/`, de 60 a
  93 KB cada una. Cada una lleva su propio `alt` descriptivo. La lista está en
  `FOTOS_GALERIA_BLOCKA` (`js/blocka.js`).

### Solo la card del juego, sin el panel de Ayuda
- **Qué:** la primera versión recortaba en 16:9 e incluía el panel lateral
  (ficha y Ayuda) al lado de la card. A Fran no le gustó que se viera la Ayuda,
  así que las capturas se rehicieron recortadas exactamente a la card del juego
  (770x630 px, proporción 1,22).
- **Por qué:** la Ayuda es texto chico y repetido (está en la página, al lado),
  y en la galería le sacaba lugar al juego. Sin ella la card ocupa toda la foto.
- **Calidad:** la card sale a casi su tamaño real (770 px de captura contra 808
  px de la card en la página), y en la galería se muestra a 640 px, o sea que se
  achica y no se agranda: no pierde nitidez. En la versión 16:9 la card ocupaba
  solo la mitad de la foto, así que se veía más chica de lo que es.

### La galería de Blocka tiene la proporción de la card y un ancho máximo de 640 px
- **Qué:** `blocka.css` pisa el `aspect-ratio: 16 / 9` que `components.css` le da
  a `.galeria__carta` con `770 / 630`, y le pone a `.galeria` (título, contador
  y fotos) `width: 100%; max-width: 640px; margin-inline: auto`: queda centrada
  en su columna y mide unos 640x524 px.
- **Por qué la proporción:** con 16:9, `object-fit: cover` recortaría arriba y
  abajo una captura que es casi cuadrada. Con la proporción de la captura, cada
  foto se ve entera, sin recortes ni deformación.
- **Por qué 640 px y no el ancho completo (808 px):** a ancho completo la galería
  medía 661 px de alto y alargaba la página unos 200 px. A 640 px mide 524 y la
  captura se achica un 17 % (de 770 a 640 px): sigue nítida (se reduce, no se
  agranda) y el texto del juego sigue siendo legible. Pedido de Fran.
- **`width: 100%` es necesario:** la columna (`.juego-layout__secundario`) es un
  contenedor flex y, con `margin-inline: auto` sola, el elemento se encoge a lo
  que mide su contenido (la galería llegó a medir 159 px). Con `width: 100%` y
  `max-width` llena la columna hasta 640 px.
- **Solo en esta página:** va en `blocka.css`, así que la galería de `juego.html`
  (Neon Circuit) y la de `producto.html` siguen en 16:9 y a ancho completo.
- **Para cambiar el tamaño:** es un solo número, el `max-width` de `.galeria`.

### Cómo se sacaron
- **Capturas reales del navegador, no maquetas:** cada escena se armó con las
  funciones reales del juego (`crearPiezas()`, `mezclar()`, `dibujar()`,
  `sortear()`, `perderNivel()`, `terminarNivel()`), con una imagen y una
  dificultad elegidas a mano para que se vean variadas.
- **Con el zoom de la página al 95 %** durante la captura: la card mide 660 px de
  alto y la ventana de captura, 639; sin reducir un poco no entraba entera.
- **Se evitó el recuadro de foco** (amarillo, de la accesibilidad) quitándolo
  antes de capturar, y se ocultó un aviso de la extensión de Chrome que tapaba el
  borde de una captura.
- **Datos de ejemplo:** para la pantalla de inicio se cargaron récords de
  ejemplo en el navegador de prueba y después se restauraron los reales. Los
  tiempos que se ven en las capturas (00:38.4, 00:21.3, etc.) son de ejemplo.

---

## Animaciones más marcadas (corrección del profesor)

El profesor marcó que las animaciones del TPE2 eran demasiado sutiles. Se
reaplicaron sobre `tp3/` en bloques; cada bloque queda comentado en su CSS.
`blocka.html` y `blocka.css` no se tocaron, pero `blocka.html` carga
`components.css`, `header.css` y `footer.css`, así que hereda los hovers nuevos.

### Tokens de movimiento (`variables.css`)
- **Qué:** `--duracion-rapida` (150 ms, cambios solo de color),
  `--duracion-hover` (300 ms, botones y cards), `--duracion-estado` (500 ms,
  carruseles, menús, modales), `--easing-rebote` (curva que se pasa un poco y
  vuelve) y `--glow-acento` (resplandor celeste).
- **Por qué:** una sola fuente de verdad para duraciones y curvas, igual que
  los demás tokens. Cambiar la sensación de todo el sitio es cambiar un valor.
- **Descartado:** dejar `0.15s`/`0.25s` escritos en cada regla (era lo que
  hacía las animaciones difíciles de ajustar de forma pareja).

### Hovers de los 4 botones (`components.css`)
- **Qué:** primario sube 4 px (antes 3) con sombra y resplandor celeste;
  secundario mantiene el relleno deslizante y además crece un 6 % con
  resplandor (y se achica al hacer clic); terciario hace crecer el subrayado
  con rebote y el texto toma un resplandor suave; destructivo pulsa durante
  1 s (2 × `--duracion-estado`).
- **Por qué:** más movimiento sin cambiar que sean 4 animaciones distintas
  entre sí.
- **Relleno del secundario sin rebote:** con rebote el relleno se pasaría del
  ancho del botón y asomaría por fuera del borde.

### Entradas y salidas de estado
- **Menús desplegables** (`components.css`, `menu-entrada`): aparecen bajando
  y creciendo desde arriba. Al cerrar desaparecen de golpe.
- **Modales y bloque de éxito del login** (`modal-pop`, `auth-success-pop`):
  500 ms con rebote.
- **Loading** (`home.css` + `loading.js`): al llegar a 100 % el overlay se
  desvanece y el centro se agranda un 10 % (clase `--saliendo`); recién al
  terminar la transición se le pone `hidden`, con un respaldo de 700 ms por si
  nunca llega el `transitionend`. La página queda usable (sin `inert`) antes de
  empezar la salida, y `carousel.js` sigue esperando el `hidden` para arrancar
  el autoplay.
- **Galería de flip 3D y banner coverflow:** el giro y el cambio de card pasan
  a `--duracion-estado` con rebote.

### Se sacan dos animaciones infinitas y decorativas
- **Qué:** el latido del logo del loading y el flotado del logo del login.
- **Por qué:** no comunicaban nada (el avance ya lo muestran el aro y el %), y
  el profesor pidió animar solo lo que comunica.

### `prefers-reduced-motion`
- **Qué:** cada bloque tiene su regla que apaga la transición o animación. El
  resplandor celeste del hover sí queda (aparece de golpe: no es movimiento y
  sigue avisando el hover). Se extendió a los hovers del header, footer,
  compartir y flechas de la galería. `loading.js` oculta el overlay de golpe.
