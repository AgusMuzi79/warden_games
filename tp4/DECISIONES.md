# Decisiones de diseño e implementación — Warden (TPE4: Peg Solitaire)

Acá se documenta todo lo de la entrega TPE4 (`tp4/`): el Peg Solitaire ("Neon
Circuit" en la interfaz) hecho jugable en un `<canvas>`. `tp4/` es una copia de
`tp3/` (que ya incluye Blocka). Las decisiones de las entregas anteriores siguen
en su lugar: TPE1 y TPE2 en `../tp2/DECISIONES.md`, y TPE3 (Blocka) en
`../tp3/DECISIONES.md`. Los comentarios del código que dicen "ver DECISIONES.md"
sin nombrar el Peg remiten a esos archivos.
Cada decisión: **qué** hicimos, **por qué**, y qué **alternativa** descartamos.

---

## Organización

### `tp4/` es una copia de `tp3/`
- **Qué:** el TPE4 vive en `tp4/`, copia de `tp3/` sobre la que se rehace la
  página del Peg (`juego.html`). `tp2/` y `tp3/` no se tocan.
- **Por qué:** mismo criterio que en el TPE3: cada entrega en su carpeta, y la
  anterior queda como se entregó. La copia ya trae el arreglo de la galería
  (precarga y giro recién cuando la foto está lista, ver `../tp3/DECISIONES.md`).

### `juego.html` pasa de página estática a juego jugable
- **Qué:** la página del Peg del TPE2 tenía una grilla de `div` solo visual. Ahora
  el tablero es un `<canvas>` con el juego completo, y el código vive en
  `tp4/js/peg/`. Se borró el `js/juego.js` viejo.
- **Por qué:** el enunciado pide implementar la lógica del juego e integrarlo en
  la página del TPE2, que "debe poder ejecutarse desde la web".

### Lo que se sacó de la página vieja
- **Qué:** la portada con el botón "Jugar", la grilla de `div` y la leyenda de
  estados en HTML, "Partida guardada" del header, "Tu récord" de la ficha, y de
  la Ayuda los desplegables de Puentes y Puntaje y el atajo Z (deshacer). Esc
  sigue, con otro uso: suelta el nodo levantado con el teclado o cierra la ayuda.
- **Por qué:**
  - Portada: el canvas ya arranca en la pantalla de selección de bando, que
    cumple ese papel; dos pasos para empezar sería fricción.
  - Grilla y leyenda: ahora el tablero y los indicadores se dibujan en el canvas.
  - "Partida guardada" y "Tu récord": no se guarda ninguna partida ni récord
    (el guardado de puntajes se descartó en el TPE2), así que mostrarlos era
    prometer algo que no existe.
  - Puentes, Puntaje y Z: este tablero de 33 no usa puentes, no hay puntaje
    aparte del tiempo y los movimientos, y no hay deshacer.
- **Prototipo de referencia:** el juego se portó de un prototipo en un solo
  archivo (`tp4/referencia/prototipo-peg.html`). Se borró cuando ya no lo usaba
  nada del sitio; queda en el historial:
  `git show b4db644:tp4/referencia/prototipo-peg.html`.

---

## Página

### El canvas ocupa todo el ancho y entra en 1080 sin scroll
- **Qué:** la zona de juego (`.peg`) va en la primera fila del grid de
  `.juego-layout--peg`, ocupando las dos columnas (`grid-column: 1 / -1`). El
  canvas dibuja en 1200×760 (atributos del HTML) y el CSS lo muestra con
  `width: min(100%, calc((100vh - 200px) * 1200 / 760))` y
  `aspect-ratio: 1200 / 760`.
- **Por qué:** el enunciado pide que el canvas entre completo en Full HD sin
  scroll. En 1920×1080 gana el 100 %: 1152 px de ancho y unos 730 de alto,
  empezando en y≈122 (header, padding de `main` y breadcrumb). Los 200 px que se
  restan al alto de la ventana son esos ~122 px, la barra del "?" (~60 px) y un
  poco de aire. Si la ventana es más baja, el segundo valor achica el canvas.
- **`margin-top: 0` en `.juego-layout--peg`:** el breadcrumb ya deja aire arriba
  y cada píxel cuenta para que entre.

### Ficha, Ayuda y Compartir bajan a la fila 2
- **Qué:** el panel lateral (`.panel-lateral`: ficha, Ayuda y Compartir) va en
  la fila 2, columna derecha, al lado de "Sobre el juego" y la Galería.
  `.juego-layout--peg .panel-lateral` le saca el tope de alto que tiene en
  la otra página de juego (`max-height: none`) y no se estira (`align-self: start`).
- **Por qué:** con el canvas a ancho completo ya no hay un tablero al lado cuyo
  alto respetar. Todo cuelga de `.juego-layout--peg` o de `.peg`, así la otra
  página de juego (que carga el mismo `juego.css`) no cambia.

### Botón "?" que abre un `<dialog>` con la Ayuda clonada
- **Qué:** arriba del canvas hay una barra (`.peg__barra`) con el botón "?"
  (`#btn-peg-ayuda`, 44 px, `aria-label="Cómo se juega"`). Abre `#peg-ayuda`, un
  `<dialog>` que reusa el componente `.modal`. `llenarAyuda()` (`pagina.js`)
  copia con `cloneNode(true)` los `<details class="ayuda__item">` y la lista
  `.ayuda__atajos` de la sección Ayuda de la página, y los pone con
  `replaceChildren()` (abrirlo varias veces no duplica el contenido). F1 también
  lo abre (`preventDefault()` evita la ayuda del navegador).
- **Por qué:** el enunciado pide las ayudas de cómo jugar, y con el canvas
  ocupando la pantalla la Ayuda del panel queda abajo, fuera de la vista. El
  diálogo la acerca sin escribir el texto dos veces: la única fuente es el HTML
  de la sección Ayuda.
- **`<dialog>` con `showModal()`:** el navegador atrapa el foco adentro, oscurece
  el fondo y cierra con Esc, igual que el modal de pago del TPE2. El resto de la
  página queda inerte, así que el canvas no recibe teclas mientras está abierto.
- **Al cerrar** (X, click en el fondo o Esc) el evento `close` reanuda la
  partida y devuelve el foco al "?".
- **Descartado:** copiar el texto de la Ayuda adentro del diálogo: dos textos
  para mantener iguales.

### Reiniciar es un `<button>` del HTML, no un dibujo
- **Qué:** `#btn-peg-reiniciar` (`.btn--secundario`) va en la barra, al lado del
  "?". Llama a `juego.reiniciar()`, que vuelve a la selección de bando. La tecla
  R hace lo mismo con el canvas enfocado.
- **Por qué:** el enunciado pide poder reiniciar. Un botón real se usa con
  teclado y lo anuncia un lector de pantalla, sin código extra.
- **Descartado:** el botón "REINICIAR" dibujado en el canvas del prototipo
  (`RESET_BTN`): habría que programarle foco, teclado y anuncio a mano.

### Galería con 4 capturas del Peg
- **Qué:** la galería animada (flip 3D, `js/galeria.js`) recibe la lista
  `FOTOS_GALERIA_PEG` desde `pagina.js`: `peg-seleccion.jpg`, `peg-partida.jpg`,
  `peg-victoria.jpg` y `peg-derrota.jpg`, en el orden en que se vive una
  partida, cada una con su `alt`.
- **Por qué:** el enunciado pide imágenes del juego; las capturas del canvas
  muestran lo que se juega ahora (las del TPE2 eran de la versión estática).
- **Cómo se sacaron:** son píxeles del canvas real (`canvas.toDataURL`), no
  capturas de pantalla, así que no tienen cursor ni anillo de foco. Cada escena
  se armó con el código real del juego (elegir bando, saltos, arrastre); para
  las de fin se dejó el tablero a un salto del final. Los tiempos y movimientos
  de esas dos son de ejemplo, como en las capturas de Blocka. 1200×760, JPG.
- **Proporción del canvas en la galería:** `juego.css` cambia `aspect-ratio` de
  `.galeria__carta` a `1200 / 760` solo en la página del Peg
  (`.juego-layout--peg`), así las capturas no se recortan. Las galerías de las
  otras páginas siguen en 16:9.
- **Descartado:** dejar el 16:9 general, que con `object-fit: cover` cortaba
  arriba y abajo el HUD y los títulos de fin.

### El juego no se ejecuta dos veces: un solo `<script type="module">`
- **Qué:** `juego.html` carga solo `js/peg/pagina.js` como módulo, después de
  `js/galeria.js` (script clásico con `defer`). `pagina.js` importa
  `pausarJuego` y `reanudarJuego` de `principal.js`, y ese import es lo que
  carga y arranca el juego.
- **Por qué:** `pagina.js` necesita las funciones de pausa de `principal.js`. Si
  el HTML cargara además `principal.js` con su propio `<script>`, el navegador
  igual lo ejecuta una sola vez, pero queda menos claro quién arranca qué. Con un
  solo punto de entrada en el HTML, el orden se lee en los `import`.
- **`iniciarGaleria()` existe cuando corre `pagina.js`:** los módulos se
  ejecutan diferidos y en orden de documento, como un `defer`, y `galeria.js`
  está antes.

---

## Arquitectura del código

### Canvas 2D
- **Qué:** todo el juego (placa, fichas, HUD, pantallas, efectos) se dibuja en un
  solo `<canvas>` con el contexto 2D, redibujado entero en cada cuadro con
  `requestAnimationFrame`.
- **Por qué:** es la técnica de la materia (la misma del juego del TPE3), y permite
  arrastrar fichas con suavidad, efectos de luz y pantallas superpuestas sin
  armar cientos de elementos HTML.

### ES modules (`type="module"`)
- **Qué:** el código del Peg son módulos con `import` / `export`, en
  `tp4/js/peg/`.
- **Por qué:** con 12 archivos, los `import` dicen explícitamente qué usa cada
  uno, y nada queda en el scope global (en el TPE2, dos scripts clásicos que
  declararon la misma constante rompieron la Home entera, ver
  `../tp2/DECISIONES.md`). Permite además importar la lógica desde Node para
  probarla.
- **Es una excepción pedida a la regla del proyecto:** `CLAUDE.md` dice "sin
  `type="module"` salvo que lo pidamos"; para el TPE4 se pidió y se aceptó.
- **Costo:** los módulos no cargan abriendo el archivo con doble clic
  (`file:///`): hace falta un servidor local (por ejemplo Live Server). En
  GitHub Pages (https) funcionan sin nada más.
- **Descartado:** scripts clásicos con `defer` y funciones globales, como el
  resto del sitio: con tantos archivos, el orden de carga y los nombres globales
  se vuelven difíciles de seguir.

### Un módulo por responsabilidad
| Archivo | Qué hace |
|---|---|
| `utiles.js` | Funciones chicas: `clamp`, `easeOut`, `formatearTiempo`, `crearCanvas`, `cargarImagen`, `mulberry32`, `leerToken`, `conAlfa`, `prefiereMenosMovimiento`. |
| `config.js` | Medidas, tiempos, rutas de las fichas, `BANDOS`; lee colores y fuentes de `variables.css` (`obtenerColores()`, `obtenerFuentes()`). |
| `tablero.js` | Clase `Tablero`: las reglas, sin canvas ni DOM. |
| `reloj.js` | Clase `Reloj`: tiempo de la partida con pausa y límite. |
| `dibujo.js` | Fondo, placa y fichas: los arma una vez fuera de pantalla y los pinta. |
| `hud.js` | Paneles de datos a los costados del tablero. |
| `efectos.js` | Clase `Efectos`: explosión, onda, estela y temblor. |
| `pantallas.js` | Selección de bando y pantallas de fin, dibujadas encima del tablero. |
| `juego.js` | Clase `Juego`: estado de la partida y loop de dibujo. |
| `entrada.js` | Clase `Entrada`: mouse y teclado, traducidos a acciones del `Juego`. |
| `principal.js` | Punto de entrada: carga fuentes e imágenes, crea `Juego` y `Entrada`, conecta Reiniciar. |
| `pagina.js` | Lo de la página que no es el juego: galería y diálogo de ayuda. |

- **Por qué:** cada archivo se puede leer y explicar solo, que es lo que se pide
  en la defensa. Todos los métodos tienen un JSDoc corto en español (el
  enunciado pide el código comentado).

### `Tablero` es lógica pura
- **Qué:** `tablero.js` no toca `document` ni el canvas. `utiles.js` y
  `config.js` solo tocan el navegador cuando se llama a una función que lo
  necesita.
- **Por qué:** las reglas se pueden probar en Node sin navegador (posición
  inicial con 32 fichas y 4 saltos, salto válido e inválido, ganado,
  sin-saltos, reloj con pausa y límite). El dibujo solo lee el estado; no decide
  nada.

### `Juego` guarda el estado; `Entrada` maneja el input
- **Qué:** `Juego` tiene el `Tablero`, el `Reloj`, los `Efectos`, la fase
  (`'eligiendo'`, `'jugando'`, `'terminando'`, `'ganado'`, `'perdido'`), los
  movimientos y lo que se está animando, y redibuja en `cuadro(t)`. `Entrada`
  escucha los eventos del canvas y cambia ese estado a través de `this.juego`;
  `juego.js` no sabe que `Entrada` existe.
- **Por qué:** al sumar bandos, efectos y pantallas de fin, `juego.js` llegó a
  741 líneas. Se partió sin cambiar comportamiento: el manejo de mouse y teclado
  pasó a `entrada.js` (351 líneas) y `juego.js` quedó en 452.
- **Descartado:** dejar todo en `juego.js` (demasiado largo para explicarlo).
  El estado sigue entero en `Juego`, para que no haya dos lugares con estado de
  la partida.

### `principal.js` conecta las piezas
- **Qué:** espera las fuentes (`cargarFuentes()` y la de títulos, con un tope de
  1,5 s), lee los colores, arma los recursos (`prepararRecursos()`), ajusta los
  atributos `width` / `height` del canvas al DPR, crea
  `new Juego(...)` y `new Entrada(juego).conectar()`, y engancha Reiniciar.
  Exporta `pausarJuego()` y `reanudarJuego()` para `pagina.js`.
- **Por qué:** así ningún módulo del juego necesita saber cómo se arman los
  demás. Si la ayuda se abre antes de que el juego esté listo, `pausaPedida`
  recuerda la pausa y se aplica al terminar de cargar.
- **Si falla la carga** (por ejemplo una imagen de ficha), el `catch` hace
  visible el texto de `#peg-estado` con la clase `.peg__error`: "No se pudo
  cargar el tablero. Recargá la página para intentar de nuevo."

---

## Reglas y lógica

### Grilla de 7×7 con `true` / `false` / `null`
- **Qué:** `tablero.grilla[fila][col]` vale `true` (hay ficha), `false` (hueco
  vacío) o `null` (fuera de la cruz). `Tablero.esCeldaValida()` define la cruz:
  una casilla es parte de ella si su fila o su columna está entre 2 y 4. Al
  empezar todo está lleno menos el centro (3, 3).
- **Por qué:** tres valores distintos evitan confundir "vacío" con "no existe", y
  la regla de la cruz en una línea reemplaza una tabla de 49 casillas escrita a
  mano.

### `movimientosDesde()` es la única regla de salto
- **Qué:** para una ficha, revisa las 4 direcciones (`DIRECCIONES`: arriba,
  abajo, izquierda, derecha): hay salto si la vecina tiene ficha y la casilla de
  dos más allá es un hueco vacío. Devuelve cada destino con la ficha que come.
  `puedeMover()`, `mover()`, `contarSaltos()` y los fantasmas de destino salen de
  ahí.
- **Por qué:** una sola función que decide qué es un salto válido; `mover()` solo
  acepta un destino que esté en esa lista, así un soltado inválido no cambia nada.

### Los contadores se calculan, no se guardan
- **Qué:** `contarFichas()` y `contarSaltos()` recorren el tablero cada vez que se
  piden (el HUD los pide en cada cuadro).
- **Por qué:** son 33 casillas por 4 direcciones, un cálculo instantáneo. Un
  contador guardado habría que actualizarlo en cada movimiento y al reiniciar, y
  si se olvida en un lugar muestra un número equivocado.

### Se revisa el estado después de cada movimiento
- **Qué:** `Juego.jugar()` llama a `tablero.estado()` después de cada salto:
  `'ganado'` si queda una ficha, `'sin-saltos'` si quedan varias pero ningún
  salto, `'jugando'` si no. Ganar con la última ficha en el centro es "conexión
  perfecta" (motivo `'central'`); en otro lugar, motivo `'un-nodo'`.
- **Por qué:** el enunciado pide que el juego termine cuando no hay más
  movimientos y que se verifique después de cada movimiento.

### Reloj pausable con 5 minutos de límite
- **Qué:** `Reloj` guarda el instante de inicio y calcula
  `transcurrido()` restando contra la hora actual. `pausar()` / `reanudar()`
  corren el inicio lo que duró la pausa; `congelar()` lo deja fijo al terminar.
  `TIEMPO_LIMITE_MS` es 5 minutos; `cuadro()` revisa `agotado()` y, si se pasó,
  termina la partida con motivo `'tiempo'`. La hora se recibe por parámetro (por
  defecto `performance.now()`).
- **Por qué:** el enunciado pide un timer con límite. Restar contra el inicio (y
  no sumar de a un tick) es el mismo criterio del loading de la Home y del reloj
  del juego del TPE3: no se atrasa si el navegador demora un tick. Recibir la hora por
  parámetro deja probarlo en Node con un reloj falso.
- **El reloj arranca al elegir bando,** no al cargar la página: mientras se elige
  queda quieto en 05:00 (`detenerReloj()` lo inicia y lo congela en el mismo
  instante).

### Tiempo con tope y redondeo coherente
- **Qué:** el HUD muestra lo que queda con `formatearTiempo()`, que redondea para
  arriba (cuenta regresiva: con 0,4 s todavía dice 00:01). La pantalla de fin
  muestra el tiempo usado redondeado para abajo (`tiempoUsado()`), con tope en el
  límite (`Math.min(transcurrido, limiteMs)`).
- **Por qué:** el último cuadro puede pasarse del límite unos milisegundos, y sin
  tope el fin mostraba más de 5 minutos. Con los dos redondeos, tiempo usado más
  tiempo restante suman el límite.

---

## Dibujo

### La placa se dibuja una vez, fuera de pantalla
- **Qué:** `prepararRecursos()` arma en canvas fuera de pantalla (`crearCanvas()`)
  el fondo, la placa en cruz vacía (con grilla, trazas de circuito y los 33
  huecos), las scanlines y las tres fichas con su brillo. En cada cuadro se
  copian con `drawImage`.
- **Por qué:** la placa tiene muchas líneas y sombras; redibujarla 60 veces por
  segundo sería lento. Las trazas usan `mulberry32` con semilla fija, así salen
  iguales en cada carga.

### Nítido en pantallas de alta densidad (DPR)
- **Qué:** los canvas (el de la página y los de fuera de pantalla) miden
  `ANCHO * dpr` píxeles reales y se dibuja con el contexto escalado, en medidas
  lógicas de 1200×760. `obtenerDpr()` pone un tope de 2.
- **Por qué:** sin esto, en una pantalla retina el canvas se ve borroso. Más de 2
  no se nota y gasta memoria.

### Colores de los tokens, leídos con `getComputedStyle`
- **Qué:** en canvas no se puede usar `var()`, así que `leerToken()` lee los
  tokens de `:root` y `obtenerColores()` los junta. Las transparencias se arman
  con `conAlfa()`. Ningún módulo del Peg tiene un hex escrito.
- **Tokens nuevos en `variables.css`:**
  - `--texto-tenue` (#A99BC2): etiquetas chicas del HUD y textos secundarios.
  - `--placa` (#0E0822): fondo de la placa en cruz y de las tarjetas de bando.
  - `--placa-borde` (#120A24): borde del degradé de los huecos.
- **Por qué tokens nuevos:** son los tonos del prototipo y ninguno de los
  existentes se acercaba. Siguen la regla del proyecto: ningún color a mano.
- **Se reusaron los existentes donde se podía:** el cyan es `--acento` (el mismo
  #52D1DC del prototipo) y el naranja es `--tablero-activo`, la paleta del
  tablero del TPE2, en vez del naranja del prototipo.

### Fuentes: Roboto Flex para números y textos, Orbitron para títulos
- **Qué:** los títulos de las pantallas ("ELEGÍ TU BANDO", "SISTEMA
  RESTAURADO"...) y los nombres de los bandos van en Orbitron; el HUD, lemas y
  estadísticas en Roboto Flex (pesos 600 y 700, sumados en el link de Google
  Fonts de `juego.html`).
- **Por qué:** es la regla del proyecto (Orbitron solo en títulos) llevada al
  canvas.
- **Descartado:** JetBrains Mono para los números, como el prototipo (decisión
  de Agus): una tercera fuente solo para el HUD. El costo es que Roboto Flex no
  tiene ancho fijo en el canvas y un número puede moverse un poco al cambiar.

### Las fichas son imágenes PNG
- **Qué:** `FICHAS` (`config.js`) apunta a `ficha-naranja.png`, `ficha-cyan.png`
  y `ficha-blanca.png` en `assets/img/`. `crearImagenFicha()` las carga y les
  suma un brillo del color del bando.
- **Por qué:** el enunciado lo pide como obligatorio: las piezas no pueden ser
  un color sólido.
- **El brillo se arma en un canvas, no con `toDataURL`:** el canvas se usa
  directo con `drawImage`; pasarlo a una URL de datos fallaría con `file://`.

---

## Interacción

### Arrastrar y soltar con pointer events
- **Qué:** `Entrada` escucha `pointerdown`, `pointermove`, `pointerup` y
  `pointercancel`. Al agarrar una ficha con saltos llama a
  `setPointerCapture()`; la ficha sigue al puntero un poco más grande, con
  sombra y con la imagen de "levantada" del bando. El mouse se pasa a
  coordenadas lógicas con `aLogico()` (el CSS muestra el canvas más chico que
  1200×760).
- **Por qué:** el enunciado pide elegir la ficha con click y arrastrarla. Con la
  captura, los eventos siguen llegando aunque el puntero salga del canvas.
  `touch-action: none` en el CSS evita que el arrastre scrollee la página.

### Tolerancias para agarrar y soltar
- **Qué:** para agarrar, el click tiene que caer a `RADIO_FICHA + 6` px del
  centro de la casilla (`celdaEn()`). Para soltar, el centro de la ficha tiene
  que quedar a menos de `CELDA * 0.55` de un destino válido
  (`destinoBajoFicha()`).
- **Por qué:** soltar con precisión de píxel sería frustrante; algo más de media
  celda alcanza para que el destino sea claro sin confundirlo con el vecino.

### Si el soltado no vale, la ficha vuelve
- **Qué:** si no hay destino bajo la ficha, `cancelarArrastre()` la hace volver
  deslizándose a su casilla (`DURACION_VUELTA_MS`, 220 ms). Una ficha sin saltos
  no se levanta: tiembla (`DURACION_RECHAZO_MS`) y se avisa "Ese nodo no tiene
  saltos posibles."
- **Por qué:** el enunciado pide que la ficha solo caiga si el movimiento es
  válido. Que vuelva animada muestra qué pasó; que tiemble explica por qué no se
  puede agarrar.

### Hints animados: el fantasma que respira
- **Qué:** con una ficha levantada, cada destino válido muestra un "fantasma":
  la ficha levantada del bando, translúcida, que late suave
  (`dibujarFantasma()`, opacidad y escala con un seno). El que recibiría la ficha
  al soltarla se enciende (más opaco y más grande).
- **Por qué:** el enunciado pide como obligatorio hints animados que indiquen
  dónde se puede soltar. El fantasma muestra el resultado (la ficha ya puesta
  ahí) y no tapa el tablero.

### Control con teclado y `role="application"`
- **Qué:** el canvas tiene `tabindex="0"`, `role="application"`, un
  `aria-label` y `aria-describedby="peg-instrucciones"` (un párrafo `.sr-only`
  con las teclas). Con el canvas enfocado: flechas para mover el cursor entre
  casillas, Enter o Espacio para levantar y soltar, Escape para dejar la ficha,
  R para reiniciar. Con una ficha levantada, las flechas solo van a sus destinos.
  El cursor (un anillo claro) se ve solo con foco de teclado (`:focus-visible`).
- **Por qué `role="application"`:** sin ese rol, un lector de pantalla usa las
  flechas para leer el documento y no le llegan al juego. El rol le dice que este
  elemento maneja sus propias teclas. Se acota a un solo elemento y va con las
  instrucciones asociadas, que es lo que se pide para usarlo bien.
- **Región en vivo `#peg-estado` (`role="status"`):** el canvas no se puede leer,
  así que cada cosa importante se anuncia ahí: bando elegido, salto hecho con
  nodos y saltos restantes, ficha levantada, resultado final con estadísticas.
  `avisar()` vacía el texto y lo escribe 50 ms después, así se repite un aviso
  aunque sea igual al anterior.

### La ayuda pausa el reloj
- **Qué:** abrir el diálogo llama a `pausarJuego()`; `Juego.pausar()` frena el
  reloj y devuelve a su casilla una ficha que se estuviera arrastrando. Cerrarlo
  llama a `reanudarJuego()`. Mientras está en pausa, `Entrada` ignora clicks y
  teclas del juego.
- **Por qué:** leer cómo se juega no debería costar tiempo de la partida.

---

## Bandos (tipos de fichas)

### Usuarios y Programas de Clu
- **Qué:** antes de jugar se elige bando en una pantalla del canvas
  (`dibujarSeleccion()`), con dos tarjetas. La temática es Tron: Legacy.
  - **Usuarios:** fichas cyan (`--acento`), ficha levantada y fantasmas blancos.
  - **Programas de Clu:** fichas naranja (`--tablero-activo`), ficha levantada y
    fantasmas cyan.
  `BANDOS` (`config.js`) guarda para cada uno la imagen normal, la levantada, el
  color, el lema y dónde va su tarjeta.
- **Por qué:** el punto 9 del enunciado pide diferentes tipos de fichas según la
  temática. El color del bando también tiñe la estela y la explosión.
- **La ficha levantada de Usuarios es blanca:** primero era naranja; se cambió a
  blanca a pedido de Agus, como en el prototipo. Una ficha levantada del mismo
  cyan que las demás no se distinguiría.

### Se elige con mouse o con teclado, dentro del canvas
- **Qué:** click en una tarjeta, o flechas para cambiar y Enter / Espacio para
  elegir; la tarjeta encendida se agranda y su ficha gira más rápido, y con foco
  de teclado suma un anillo. Cada cambio se anuncia en `#peg-estado`.
- **Por qué:** es parte de la partida (el reloj arranca ahí) y mantiene todo el
  juego en un mismo lugar.
- **El bando queda fijo durante la partida:** R, Reiniciar y "Jugar de nuevo"
  vuelven a esta pantalla, con la tarjeta del último bando encendida.

---

## Efectos y pantallas de fin

### Explosión, onda, estela y temblor (`efectos.js`)
- **Qué:** al comer una ficha: chispas (`CHISPAS_POR_EXPLOSION`, 38), un
  destello, una onda que crece (`DURACION_ONDA_MS`) y la ficha comida que se
  infla y desaparece; el tablero tiembla (`FUERZA_TEMBLOR` px durante
  `DURACION_TEMBLOR_MS`). Al arrastrar, la ficha deja una estela de luz que se
  apaga en `DURACION_ESTELA_MS`. Se suman con `globalCompositeOperation =
  'lighter'`, como un neón.
- **Por qué:** feedback claro de que el salto se hizo y qué ficha se fue, en la
  estética del sitio. La clase `Efectos` recuerda cada efecto y lo borra solo
  cuando termina; `juego.js` solo avisa "explotó acá".

### Scanlines solo en las pantallas de fin
- **Qué:** las líneas horizontales finas (una cada `SEPARACION_SCANLINES` px) se
  dibujan solo sobre la victoria y la derrota.
- **Por qué:** así está en el prototipo. Sobre el tablero en juego ensuciarían la
  placa y bajarían el contraste.

### Pantallas de fin con estadísticas y "Jugar de nuevo"
- **Qué:** "SISTEMA RESTAURADO" (victoria: ondas desde el último nodo y título
  que se revela con un barrido) o "SISTEMA CORRUPTO" (derrota: efecto de
  pantalla rota y título con glitch). Las dos muestran el motivo, el tiempo
  usado, los movimientos y los nodos que quedaron, y un botón "JUGAR DE NUEVO"
  en el canvas que vuelve a la selección de bando (también con Enter o Espacio).
  `avisoDeFin()` dice lo mismo en la región en vivo.
- **Por qué:** el jugador ve por qué terminó y cómo le fue, y tiene la salida a
  mano. Si el último nodo quedó en la mitad de abajo, el texto va arriba para no
  taparlo (`alturaTituloVictoria()`).

### Demora antes de mostrar el fin
- **Qué:** `terminar()` congela el reloj y pasa a la fase `'terminando'`; la
  pantalla aparece `DEMORA_FIN_MS` (700 ms) después.
- **Por qué:** sin la demora, la pantalla de fin tapaba la explosión del último
  salto y no se veía qué pasó.

---

## Movimiento reducido

- **Qué se apaga** con `prefers-reduced-motion: reduce`
  (`prefiereMenosMovimiento()`):
  - explosión, onda, estela y temblor (no se crea ningún efecto);
  - la ficha que vuelve deslizándose (vuelve de golpe) y la que tiembla al
    rechazarla (solo queda el aviso);
  - la demora del fin (aparece al instante) y sus animaciones (barrido, ondas,
    glitch, nodo que late): la pantalla se ve quieta desde el primer cuadro;
  - el giro de las fichas de las tarjetas y el latido de "ENTRAR AL GRID";
  - el parpadeo del reloj en los últimos 30 s (queda solo el cambio a naranja);
  - el fantasma de destino deja de latir.
- **Qué queda:** los fantasmas siguen visibles (quietos, a media opacidad) y el
  de destino se enciende igual; las scanlines (son quietas); los cambios de
  color; todos los avisos de `#peg-estado`.
- **Por qué:** la regla del proyecto: toda animación respeta
  `prefers-reduced-motion`. El juego funciona igual, sin el movimiento.

---

## Accesibilidad (resumen)

- Canvas enfocable con `role="application"`, `aria-label` e instrucciones por
  `aria-describedby`; juego completo con teclado.
- Región en vivo `#peg-estado` para todo lo que pasa en el canvas.
- Reiniciar y Ayuda son botones reales del HTML; el "?" mide 44 px
  (`--control-alto`) y tiene `aria-label`.
- La ayuda en `<dialog>` modal: foco atrapado, Esc, y el foco vuelve al "?".
- El cursor de teclado se ve solo con foco de teclado, no con el mouse.
- Colores de los tokens del sitio; Orbitron solo en títulos.
- Movimiento reducido respetado en el canvas y en el CSS (`.peg__ayuda-btn`).
- La página del Peg sigue sin `h1`: es la excepción del TPE2, que sigue
  pendiente de charlar entre los tres (ver `../tp2/DECISIONES.md`).

---

## Punto 1 del enunciado: la placa vacía es una imagen generada al cargar

- **Qué:** el "tablero vacío (imagen de fondo)" se genera una sola vez al cargar
  la página: `crearFondo` y `crearPlaca` (`dibujo.js`) lo dibujan en un canvas
  fuera de pantalla, y en cada cuadro se pega con `drawImage`, igual que una
  imagen cargada de un archivo.
- **Por qué:** es una imagen de verdad (un canvas se dibuja con `drawImage` como
  un `<img>`), pero sus colores salen de los tokens de `variables.css`. Si cambia
  la paleta, la placa cambia sola. Decisión de Agus.
- **Descartado:** exportar la placa a un PNG en `assets/img/` y cargarla con
  `cargarImagen`. Cumpliría el punto al pie de la letra, pero cada cambio de
  color obligaría a volver a exportar la imagen, y los colores quedarían fijos
  fuera del sistema de tokens.

---

## Pendientes

- **Hints animados con movimiento reducido:** el enunciado pide hints animados,
  y con `prefers-reduced-motion` el fantasma queda quieto. Se justifica por la
  regla de accesibilidad del proyecto; sin esa preferencia, siempre está animado.
