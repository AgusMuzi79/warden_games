# Decisiones de diseño e implementación — Warden (TPE5: Neon Rider)

Acá se documenta todo lo de la entrega TPE5 (`tp5/`): un runner horizontal tipo
Flappy Bird ("Neon Rider"), hecho con DOM, CSS y JS (sin canvas). `tp5/` es una
copia de `tp4/`. Las decisiones de las entregas anteriores siguen en su lugar:
TPE1 y TPE2 en `../tp2/DECISIONES.md`, TPE3 (Blocka) en `../tp3/DECISIONES.md` y
TPE4 (Peg en canvas) en `../tp4/DECISIONES.md`.
Cada decisión: **qué** hicimos, **por qué**, y qué **alternativa** descartamos.

El detalle de la implementación (fases, contrato DOM, valores de config) está en
`../docs/tp5-estado.md` y `../docs/tp5-contrato.md`.

---

## Organización

### Este archivo es solo del TPE5
- **Qué:** `tp5/DECISIONES.md` arranca vacío en vez de copiar el de `tp4/`.
- **Por qué:** el de `tp4/` ya pesa unos 47 KB; copiarlo duplicaba todo y hacía
  difícil encontrar lo nuevo.
- **Descartado:** seguir sumando entradas al archivo copiado.

### Sin JetBrains Mono
- **Qué:** los números del HUD van en Roboto Flex con `font-variant-numeric:
  tabular-nums`, no en JetBrains Mono.
- **Por qué:** decisión de Agus, igual que en el TPE4: solo se usan las fuentes
  del sitio (Orbitron en títulos, Roboto Flex en el resto).

## Neon Rider (Fase A)

### Todo en el DOM, con el estado en JS
- **Qué:** un solo `requestAnimationFrame` (`js/runner/loop.js`) con `dt` y tope de
  0,05 s. El estado vive en objetos JS; el render solo escribe `transform` y clases
  de estado (`docs/tp5-contrato.md`), y las animaciones son `@keyframes` y `steps()`.
- **Por qué:** lo pide la cátedra. Además separa la lógica (Fase A, Agus) de la vista
  (Fase B, Fran): el contrato DOM es la frontera entre las dos fases.
- **Descartado:** canvas (el enunciado lo excluye) y un timer por entidad.

### Parallax desde una sola velocidad
- **Qué:** las 4 capas usan factores 0,1 / 0,3 / 0,6 / 1 sobre la velocidad del mundo.
  El suelo va a factor 1, igual que los obstáculos.
- **Por qué:** cuando el drone ralentiza el mundo, todas las capas frenan en proporción
  sin tocar nada más. Detalle y valores en `../docs/tp5-estado.md`.

## Neon Rider (Fase B: vista e integración)

### Los sprites son tiras reales animadas con `steps()`
- **Qué:** moto en vuelo (4 cuadros), moto destruida (6) y chip (6) son tiras PNG. Un
  `@keyframes` mueve `background-position-x` con `steps(N)`; `--frames` y `--frame-w`
  son variables CSS. La moto va espejada con `scaleX(-1)` y usa las propiedades
  independientes `scale`/`rotate`/`filter` para no pisar el `transform` del JS.
- **Por qué:** la cátedra pide que el objeto que vuela sea una cadena de imágenes, no una
  imagen fija. Las tiras se generaron con IA sobre fondo verde y se recortaron con
  chroma key, con el mismo recorte para todos los cuadros.
- **Descartado:** rotar una sola imagen (no cumple la consigna) y un GIF (prohibido).

### El drone ayuda, no mata
- **Qué:** tocar un drone lo hace estallar y ralentiza el mundo 3 s, sin restar vida. Es
  chico (36×34) para que cueste agarrarlo.
- **Por qué:** la cátedra dice que un elemento animado no tiene que terminar el juego
  por sí solo. Pedido de Fran: que sea una ayuda difícil de atrapar.
- **Descartado:** drone que resta vida (Fase A), que incumple ese criterio.

### La moto se destruye solo con la última vida
- **Qué:** un choque que no deja sin vidas no activa `.is-hit`: la moto parpadea
  (invulnerable) y, en Normal y Difícil, la pantalla tiembla y la moto muestra por
  0,4 s los 2 primeros frames de la tira de choque (impacto y grieta, `.is-damaged`). La tira de la moto
  destruida se ve solo al perder la última vida, y queda a la vista detrás del game over
  (`tiempoChoque = Infinity`). En Fácil nunca se destruye ni tiembla.
- **Por qué:** destruir la moto en cada choque decía "perdiste" cuando todavía quedaban
  vidas (pedido de Agus). En Fácil la moto es invencible.
- **Antes:** en Normal y Difícil cada choque mostraba la explosión entera (0,6 s).

### Cuerpo de los edificios con franjas espejadas
- **Qué:** el cuerpo repite la franja de abajo del PNG, alternando normal y `scaleY(-1)`.
- **Por qué:** repetir la misma franja deja una costura visible; espejarla la oculta.
  Una grilla de ventanas en CSS se veía mal (se probó y se descartó).

### HUD afuera del área de juego
- **Qué:** el HUD es una barra arriba del juego, del mismo ancho (960 px).
- **Por qué:** dentro del juego le quitaba protagonismo a la acción. Pedido de Fran.

### Game over con la escena visible
- **Qué:** al perder, la escena queda detrás y un panel ofrece "Seguir jugando" o "Volver
  al inicio".
- **Por qué:** se entiende qué pasó y se reintenta sin volver al selector.

### La página reusa el esquema del Peg
- **Qué:** `runner.html` copia la estructura de `juego.html` (juego a todo el ancho, y
  debajo Sobre el juego + Galería + Créditos, y la columna con ficha, Ayuda y Compartir).
  Carga `juego.css` antes de `runner.css` y reusa `.peg__ayuda-btn` y `.peg-ayuda`.
  La Ayuda también se abre en un diálogo con "?" o F1, y pausa la partida avisando con el
  evento `runner:pausar`.
- **Por qué:** mismo diseño que el resto de las páginas de juego y nada de CSS duplicado.
  El evento evita que `runner-pagina.js` importe el juego.
- **Descartado:** copiar los estilos de Ayuda a `runner.css`.

### Neon Rider primero en el banner de la Home
- **Qué:** `NEON_RIDER` va primero en `JUEGOS_PROPIOS` (`carousel.js`): 3 propios y 2 de la API.
- **Por qué:** es el juego de esta entrega, mismo criterio que Blocka y Neon Circuit antes.

### Créditos
- **Qué:** fondos, edificios y carteles: *Warped City* de ansimuz. Moto, chip, portada y
  capturas: generados con IA y retocados por el equipo.
- **Licencia:** Warped City es CC0 1.0 (dominio público), según la página del pack
  (https://ansimuz.itch.io/warped-city, sección "Asset license"). No pide atribución y
  permite cualquier uso; lo nombramos igual en los créditos, con el link al pack y a la
  licencia.
- **Descartado:** no nombrarlo por ser CC0. Mostrar de dónde salen los fondos es lo
  honesto, y en la defensa se puede explicar qué licencia tiene.

### Difícil pasa a ser Infinito
- **Qué:** el tercer modo (`MODOS.infinito`) tiene 1 vida y los mismos huecos que tenía
  Difícil (190 / 6 / 130), pero no tiene meta (`conMeta: false`): la partida solo termina
  al chocar. El HUD oculta la barra de progreso, que no tiene a qué llegar.
- **Por qué:** decisión de Agus. Con una sola vida y una meta de 50 puntos, el modo se
  terminaba enseguida; sin meta, el puntaje pasa a ser el desafío y tiene sentido
  guardarlo en una tabla.
- **Descartado:** sumar un 4.º modo (más botones en el inicio para algo que ya cubría
  Difícil).

### Récords arcade con iniciales (solo Infinito)
- **Qué:** `records.js` (sin DOM) guarda en `localStorage` (`warden-neon-rider-records`)
  los 10 mejores puntajes de mayor a menor, cada uno con 3 iniciales A–Z, y las últimas
  iniciales usadas. Al chocar, si el puntaje es mayor a 0 y entra en el top 10, aparece
  "¡Nuevo récord!" con tres casillas: ↑/↓ cambian la letra, ←/→ la casilla, tipear una
  letra la pone y avanza, Backspace vuelve y Enter guarda; con mouse, flechas por casilla
  y "Guardar". Después, el game over muestra la tabla con el récord nuevo resaltado. El
  inicio suma un botón "Récords".
- **Por qué:** es como en las máquinas arcade, y 3 letras entran en la tabla sin cortar
  nada. En un empate queda arriba el récord más viejo (el que llegó primero). Fácil y
  Normal no guardan récords: Fácil no se puede perder y Normal termina en la meta, así
  que los puntajes no se comparan con los de Infinito.
- **Accesibilidad:** cada casilla es un `role="spinbutton"` con la letra en
  `aria-valuetext`, y el foco arranca en la primera. Mientras la pantalla está a la
  vista, `input.js` no toma las teclas (`[data-iniciales]`): si no, H prendería las
  hitboxes y Esc intentaría pausar mientras se escribe.
- **Si el storage falla** (bloqueado o con datos rotos), se ignora con `try/catch`: el
  juego anda igual, sin récords guardados.
- **Descartado:** un `<input>` de texto (no se siente arcade y hay que validar
  caracteres) y guardar un nombre libre (no entra en la tabla del panel).

### La pantalla de pausa no se veía (bug corregido)
- **Qué:** la regla que congela las animaciones en pausa pasó de `.game.is-paused *` a
  `.game.is-paused :not(.screen, .screen *)` (`runner.css`).
- **Por qué:** la pantalla de pausa vive dentro de `#game`, así que la regla vieja también
  congelaba la animación de entrada del panel (`modal-pop`, que arranca en `opacity: 0`).
  El panel quedaba quieto en su primer cuadro: invisible, aunque la pantalla estaba
  abierta y los botones se podían usar con el teclado. Ahora se congela el juego (moto,
  drones, carteles, parallax) y las pantallas animan normal, incluido el hover de sus botones.
- **Descartado:** sacar la pantalla de pausa de `#game`. Cambia el HTML y el
  posicionamiento de todas las pantallas para arreglar una sola regla de CSS.
