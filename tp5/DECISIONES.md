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

### Fácil no destruye la moto
- **Qué:** en Fácil el choque no activa `.is-hit` ni el temblor: la moto solo parpadea.
  Normal y Difícil sí muestran la explosión y el temblor. Al morir, la moto destruida
  queda a la vista (`tiempoChoque = Infinity`).
- **Por qué:** en Fácil la moto es invencible; destruirla contradecía el modo.

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
- **Pendiente:** verificar y escribir la licencia de Warped City.
