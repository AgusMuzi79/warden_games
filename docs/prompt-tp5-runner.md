# Prompt para Claude Code — TPE5 Runner (Flappy-like)

> Pegar en Claude Code parado en la raíz del repo `warden_games`.

---

## Contexto

Estamos en el repo `warden_games` (plataforma de juegos **Warden**, TUDAI, grupo 24). Ya existen `tpe1/`, `tp2/`, `tp3/`, `tp4/`, `assets/`, `docs/`, `CLAUDE.md` y `DECISIONES.md` en la raíz.

**Antes de escribir código:**
1. Leé `CLAUDE.md` y `DECISIONES.md` de la raíz y respetalos (design system, tokens, tipografías, convenciones). **No los regeneres.** Si hay que agregar decisiones, agregá entradas cortas al final de `DECISIONES.md` (está cerca del límite de caracteres: sé breve o proponé moverlo a `docs/`).
2. Mirá cómo se integró el juego en `tp4/` (página del juego, ayuda, descripción, galería) y replicá ese patrón.
3. Guardá una copia de este prompt en `docs/prompt-tp5-runner.md` (la va a leer la sesión de la Fase B).
4. Proponeme un plan corto (archivos + orden de implementación) **solo de la Fase A** y esperá mi OK antes de implementar.

## División del trabajo — IMPORTANTE

El TP lo hacemos entre dos, **en secuencia**: **Agus** (quien corre este prompt ahora) hace la **Fase A**; **Fran** sigue después con la **Fase B** en otra sesión de Claude Code. Todo el contexto de este prompt aplica a las dos fases, pero **en esta sesión implementá SOLO la Fase A**.

### Fase A — Agus (esta sesión): base + lógica completa jugable
1. Crear `tp5/` copiando `tp4/`; verificar los assets en `tp5/assets/game/`.
2. Escribir `docs/tp5-contrato.md`: estructura del DOM, ids y **clases de estado** que el JS agrega/quita (ver "Contrato DOM" abajo). Es la interfaz entre las dos fases.
3. Toda la lógica de `js/runner/`: loop con `dt`, input, física del avatar, spawner, colisiones + debug `H`, drones/coleccionables con sus efectos, modos, vidas, puntaje, victoria/derrota, pausa, parallax (velocidades), borrado de entidades, precarga.
4. **Vista mínima funcional**: sprites puestos y animados con `steps()` (moto, drone, explosión, carteles), capas de parallax con las imágenes, edificios y carteles reconocibles, HUD con datos, pantallas de inicio/selector de modo, victoria y derrota **sin pulir** (texto + botones). Las clases de estado se aplican aunque todavía no tengan animación vistosa.
5. El juego tiene que quedar **jugable de punta a punta** en los 3 modos.

### Fase B — Fran (próxima sesión): vista pulida + integración web
1. Animaciones del avatar a fondo (vuelo con llama, impulso, choque con explosión + screen shake + flash, invulnerabilidad) — **notorias**, no sutiles.
2. Suelo con grilla neón en CSS, capa 3 oscurecida, edificios con cuerpo repetido y carteles gigantes colgando de su estructura.
3. Animaciones del drone, del coleccionable, el "+3" flotante y la reacción del obstáculo al choque.
4. Reemplazar el placeholder del coleccionable por su spritesheet (si ya lo tienen).
5. HUD y pantallas (inicio, pausa, victoria, derrota) con la estética de las entregas anteriores.
6. Integración en la web: página con cómo jugar, descripción, capturas, créditos; agregar el juego a la Home.
7. Revisar todos los criterios de aceptación y ajustar valores de `config.js` jugando.

### Al terminar la Fase A (obligatorio)
- Crear `docs/tp5-estado.md` con: qué se hizo en la Fase A (lista por archivo), qué queda para la Fase B (la lista de arriba, ajustada a lo real), decisiones tomadas, bugs o pendientes conocidos, y valores de config actuales.
- Agregar en `CLAUDE.md` **una sola línea** (fragmento, sin regenerar el archivo): `TP5 Runner: Fase A (lógica, Agus) terminada. Antes de trabajar en tp5/, leé docs/tp5-estado.md y docs/tp5-contrato.md y seguí con la Fase B (vista + integración, Fran).`
- Agregar en `DECISIONES.md` 2–3 líneas con las decisiones clave del TP5 y un puntero a `docs/tp5-estado.md`.
- **No avanzar con tareas de la Fase B** aunque sobre tiempo; si algo de la Fase B resultó necesario para que el juego funcione, anotarlo en `docs/tp5-estado.md`.

### Contrato DOM (base; ajustalo en `docs/tp5-contrato.md` si hace falta)
```
#game                         contenedor (.is-shaking)
  .layer.layer--1..4          capas parallax (JS aplica translateX)
  .world                      contenedor de entidades
    .obstacle                 .is-hit
      .obstacle__top          cartel colgante
      .obstacle__bottom       edificio
    .drone                    .is-exploding
    .collectible              .is-collected
  .player                     siempre vuela; .is-boost .is-hit .is-invulnerable
  .hud  #score #lives #mode #progress
  #screen-loading #screen-start #screen-pause #screen-win #screen-lose
```
Regla: el JS solo escribe `transform` y agrega/quita estas clases; todo lo visual vive en el CSS.

## Tarea

Crear la carpeta `tp5/` copiando `tp4/` como base de la web, y agregar una **página nueva** con un juego **horizontal scroller tipo Flappy Bird** implementado en **HTML + JS vanilla + CSS3 (animaciones)**. **Sin canvas**: todo es DOM, las animaciones son `@keyframes` y spritesheets con `steps()`.

Temática: ciudad cyberpunk nocturna (pack *Warped City* de ansimuz). El jugador maneja una **moto voladora** que esquiva **edificios (abajo) y carteles gigantes colgantes (arriba)**, recoge **coleccionables** y evita **drones**.

Nombre de trabajo del juego: **"Neon Rider"** (cambiable).

## Assets (ya preparados en `tp5/assets/game/`)

Todo es pixel art: usar `image-rendering: pixelated` y escalar con múltiplos enteros (x2 / x3).

| Archivo | Uso | Frames | Frame (px) |
|---|---|---|---|
| `sprites/moto.png` | Avatar. **Mira hacia la IZQUIERDA en el PNG → espejar con `scaleX(-1)`** | 1 (estático) | 93×60 |
| `sprites/drone.png` | Elemento animado #1 (enemigo) | 4 | 55×52 |
| `sprites/explosion.png` | Explosión del avatar y de drones | 6 | 55×52 |
| `sprites/banner-big.png` | Cartel gigante (obstáculo superior) | 4 | 35×92 |
| `sprites/banner-neon.png` | Variante de cartel | 4 | 19×48 |
| `sprites/banner-side.png` | Variante de cartel | 4 | 19×76 |
| `sprites/turret.png` | Extra opcional (algo que sale del edificio) | 6 | 25×23 |
| `bg/capa1-cielo.png` | Parallax capa 1 (la más lejana) | — | 384×224 |
| `bg/capa2-ciudad-lejana.png` | Parallax capa 2 | — | 384×224 |
| `bg/capa3-edificios.png` | Parallax capa 3 | — | 1009×224 |
| `obstaculos/edificio-1..7.png` | Obstáculo inferior (tope del edificio) | — | varios |

- **Coleccionable (elemento animado #2): todavía no hay sprite.** Implementarlo con un placeholder (div con forma geométrica neón, p. ej. un chip/rombo celeste) animado con `@keyframes`, y dejar la estructura lista para reemplazarlo por un spritesheet horizontal con `steps(N)` cambiando solo una variable CSS (`--frames`, `--frame-w`, URL).
- **Capa 4 del parallax (suelo):** no viene en el pack. Hacerla con CSS: piso/grilla neón con gradientes (estética Tron, colores del design system) con `background-repeat: repeat-x`.
- `capa3-edificios.png` y los obstáculos comparten arte: la capa 3 va más oscura/desaturada (`filter: brightness(.5) saturate(.7)`) para que los obstáculos se lean claramente en primer plano.
- Edificios como obstáculo: la imagen es el **tope**; el resto de la altura hasta el suelo se completa con una franja repetida en `repeat-y` (recortar una franja del propio PNG en CSS con `background-position`, o un div con color/patrón coherente). Mismo criterio para los carteles colgantes: cartel escalado + estructura/cable hasta el borde superior.

## Reglas técnicas obligatorias (de la cátedra — NO negociables)

1. **Un solo loop** con `requestAnimationFrame`. Nada de `setInterval`/`setTimeout` por entidad.
2. **Mover con `dt`**: todas las velocidades en **px/s**. Tope de `dt` (p. ej. `Math.min(dt, 0.05)`) para cuando la pestaña vuelve, así la moto no "teletransporta" a través de un obstáculo.
3. **Estado en JS, vista en el DOM**: posiciones, velocidades, vidas, puntaje y colisiones viven en objetos JS. El render escribe el estado al DOM; **nunca se lee del DOM para calcular** (nada de `getBoundingClientRect` en el loop).
4. **Mover solo con `transform`** (`translate3d`), nunca `top`/`left`.
5. **Animaciones por estado**: el JS solo agrega/quita clases (o data-attributes); el CSS define los `@keyframes`.
6. **Spritesheets con `steps(N)`**: animar `background-position-x` de `0` a `-N*frameW` px. Todas las tiras son horizontales y de frames iguales.
7. **Parallax de 4 capas** con velocidades derivadas de una **única velocidad base**: lo cercano más rápido, lo lejano más lento. El **suelo va a la misma velocidad que los obstáculos** (factor 1). Si la velocidad base cambia (p. ej. ralentización por choque), todas las capas cambian en proporción.
8. **Hitboxes chicas y probadas**: más chicas que el sprite. Modo debug con la tecla **`H`** que dibuja un borde sobre cada hitbox.
9. **Borrar** obstáculos y elementos que salen de pantalla, **del DOM y del arreglo**. Usar pooling si suma, pero que quede claro.
10. **Precargar** todos los spritesheets/imágenes antes de arrancar (pantalla de carga breve) para que nada aparezca a medias.
11. **Una entrada por pulsación**: ignorar `e.repeat`. Funciona con **teclado (Espacio / ↑ / W) y clic/tap** en el área de juego.
12. Desktop-first; no hace falta mobile.

## Mecánica

### Avatar
- Avanza a **velocidad constante** (el mundo scrollea; la moto queda en un X fijo ~25% del ancho). La velocidad horizontal **no aumenta** con el tiempo.
- Gravedad + impulso hacia arriba en cada pulsación. Velocidad vertical máxima de caída con tope.
- Rotación según velocidad vertical (nariz arriba al subir, abajo al caer), calculada en JS y aplicada por `transform`.
- Siempre "volando": nunca está quieta (ver animaciones).
- Choque con techo/suelo cuenta como choque.

### Animaciones del avatar (mínimo 3 por evento — hacemos 4)
La corrección del TP2 fue "animaciones demasiado sutiles": **que se noten**.
1. **Vuelo (loop permanente)**: balanceo vertical suave del sprite + **llama del propulsor** (pseudo-elemento) parpadeando/cambiando de largo. Corre siempre.
2. **Impulso** (al pulsar): "flap" — la llama se estira fuerte, pequeño squash & stretch e inclinación; dura ~200ms y vuelve al loop sin cortarlo.
3. **Choque**: explosión (`explosion.png`, 6 frames) sobre la moto + **screen shake** del contenedor del juego + flash.
4. **Invulnerabilidad** (después de perder una vida, ~1.5s): parpadeo/opacidad intermitente; durante ese tiempo no recibe daño.

### Obstáculos (edificios abajo + carteles gigantes arriba)
- Cada "par" = edificio inferior + cartel colgante superior, con un **hueco** entre ambos.
- **Separación horizontal variable**: random entre ~280 y ~420 px.
- **Hueco que se achica**: arranca ~220 px y baja ~4 px por obstáculo pasado, con mínimo ~130 px.
- **Altura del hueco variable**: posición random, pero sin saltar más de ±150 px respecto del anterior (siempre pasable).
- Al chocar: animación del avatar (choque) + reacción del obstáculo (el cartel parpadea/chispea o tiembla).
- **Pasar un obstáculo suma 1 punto.**
- Todos los parámetros en un objeto de config (por modo).

### Elementos animados (2, con efectos DISTINTOS)
- **Drone** (`drone.png`): aparece en algunos huecos o entre obstáculos, flotando con un leve vaivén. Al chocarlo: **resta 1 vida y ralentiza el mundo** ~1.5s (la velocidad base baja, el parallax acompaña), el drone explota (`explosion.png`). **No termina el juego** por sí solo salvo que fuera la última vida.
- **Coleccionable** (placeholder): aparece en los huecos. Al agarrarlo: **suma +3 puntos**, con animación de recogida y un "+3" flotante.

### Modos de dificultad (selector antes de jugar)
| Modo | Vidas | Notas |
|---|---|---|
| **Fácil** | Invencible | Choca, se ven las animaciones (choque + invulnerabilidad), pero **no pierde**. Pensado para que los profes recorran todo. Misma curva de hueco que Normal. |
| **Normal** | 3 | Se pierden vidas con edificios/carteles **y** con drones. |
| **Difícil** | 1 | Cualquier choque es game over. Hueco arranca más chico y baja más rápido. |

- Tras perder una vida (Normal): invulnerabilidad + la moto se recoloca en el centro vertical si chocó contra techo/suelo.

### Fin de juego
- **Victoria**: llegar al **puntaje objetivo** (p. ej. 50, configurable) — aplica a los 3 modos.
- **Derrota**: quedarse sin vidas (Normal/Difícil).
- Pantallas de victoria/derrota con la estética de las entregas anteriores (como el "sistema corrupto" del Peg), con reintentar / cambiar modo.
- Pausa con `P`/`Esc`; al perder el foco de la pestaña, pausar automáticamente.

### HUD
Puntaje, vidas (íconos), modo actual y barra de progreso hacia el objetivo. Números en JetBrains Mono con `tabular-nums`.

## Integración en la web (punto 7)

Página nueva del juego dentro de `tp5/`, siguiendo el patrón de `tp4/`:
- Juego ejecutable embebido.
- **Cómo jugar** (controles, modos, qué hace cada elemento, cómo se gana/pierde).
- **Descripción completa** e **imágenes/capturas**.
- **Créditos**: assets de *Warped City* por **ansimuz** (ansimuz.itch.io) + licencia.
- Agregar el juego a la Home/listado como en las entregas anteriores.

## Arquitectura sugerida (ajustala al patrón del repo)

```
tp5/
  <pagina-del-juego>.html
  css/runner.css            # layout, capas, @keyframes, spritesheets
  js/runner/
    main.js                 # bootstrap, preload, selector de modo
    config.js               # parámetros por modo (velocidades px/s, huecos, vidas)
    loop.js                 # único rAF, dt con tope, update → render
    input.js                # teclado + clic, !e.repeat
    entities/player.js
    entities/obstacle.js
    entities/drone.js
    entities/collectible.js
    spawner.js              # separación/hueco/altura variables
    collision.js            # AABB con hitboxes reducidas
    parallax.js
    hud.js
  assets/game/...
```

## Criterios de aceptación (chequear uno por uno al final)
- [ ] Un solo `requestAnimationFrame`; cero `setInterval`.
- [ ] Velocidades en px/s con `dt` y tope.
- [ ] Ninguna lectura del DOM en el loop; todo movimiento por `transform`.
- [ ] ≥3 animaciones keyframe del avatar disparadas por eventos (hay 4).
- [ ] Parallax de 4 capas con velocidades proporcionales; suelo = velocidad de obstáculos; acompaña la ralentización.
- [ ] 2 elementos con spritesheet/animación distintos, con efectos distintos, que no terminan el juego por sí mismos.
- [ ] Separación horizontal variable, hueco que se achica, alturas variables.
- [ ] Sistema de puntaje que determina el fin; modos Fácil/Normal/Difícil.
- [ ] Hitboxes visibles con `H`.
- [ ] Elementos fuera de pantalla removidos del DOM y del arreglo.
- [ ] Precarga antes de empezar.
- [ ] Integrado en la web con ayuda, descripción, imágenes y créditos.
- [ ] Animaciones notorias (no sutiles).

(Los criterios se cierran al final de la Fase B. En la Fase A marcá en `docs/tp5-estado.md` cuáles ya se cumplen.)

Al terminar la Fase A, hacé lo de "Al terminar la Fase A" y dame un resumen de qué quedó hecho y qué archivo cumple cada punto del enunciado hasta ahora (para la defensa).
