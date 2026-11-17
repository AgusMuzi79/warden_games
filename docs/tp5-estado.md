# TP5 Neon Rider — Estado

Prompt original: `docs/prompt-tp5-runner.md` · Contrato DOM: `docs/tp5-contrato.md` ·
Seguimiento: `odd/tasks/tp5-runner-fase-a.md`.

## Fase A (lógica, Agus) — terminada (2026-11-16)

El juego se puede jugar de punta a punta en los 3 modos en `tp5/runner.html`.

### Qué se hizo, por archivo
| Archivo | Qué hace |
|---|---|
| `tp5/runner.html` | Página mínima: head, header y footer de `juego.html`, `h1` sr-only, `#game` con capas, mundo, moto, HUD y las 5 pantallas. `<meta name="darkreader-lock">` porque la extensión Dark Reader invertía los PNG. |
| `tp5/css/runner.css` | Área de 960×540, capas del parallax (capa 3 oscurecida, suelo con grilla neón en CSS), sprites con `steps()` (drone, explosión, carteles), llama básica, depuración de hitboxes, temblor de pantalla, pausa y `prefers-reduced-motion`. |
| `js/runner/main.js` | Arranque: precarga, pantallas, selector de modo, reintentar y cambiar de modo. |
| `js/runner/config.js` | Todos los parámetros, con los de cada modo. |
| `js/runner/loop.js` | El único `requestAnimationFrame`, con `dt` en segundos y tope de 0,05. |
| `js/runner/input.js` | Espacio, ↑, W y clic, ignorando `e.repeat`; P y Esc para pausar; H para la depuración; pausa al perder el foco. |
| `js/runner/preload.js` | Precarga de todas las imágenes antes de mostrar el selector. |
| `js/runner/game.js` | Estado y ciclo `update` → `render`: vidas, puntaje, ralentización, invulnerabilidad, victoria y derrota. |
| `js/runner/parallax.js` | 4 capas con factores 0,1 / 0,3 / 0,6 / 1 sobre una sola velocidad del mundo. |
| `js/runner/spawner.js` | Funciones puras: separación, hueco que se achica y altura del hueco variable. |
| `js/runner/collision.js` | `seTocan()`: AABB con hitboxes reducidas. |
| `js/runner/hud.js` | Puntaje, vidas (∞ en Fácil), modo y barra de progreso. |
| `js/runner/entities/player.js` | Física de la moto (gravedad, impulso, tope de caída, rotación según `vy`), techo y suelo. |
| `js/runner/entities/obstacle.js` | Par edificio + cartel; se borra del DOM y del arreglo al salir de pantalla. |
| `js/runner/entities/drone.js` | Drone con vaivén; al chocarlo resta una vida, ralentiza el mundo y explota. |
| `js/runner/entities/collectible.js` | Chip provisorio (rombo CSS) que da +3 y muestra un "+3" flotante. |

### Decisiones tomadas
- `tp5/DECISIONES.md` es propio y corto; no se copió el de `tp4/`.
- Sin JetBrains Mono: el HUD usa Roboto Flex con `tabular-nums`.
- Módulos ES con un solo `<script type="module">`.
- Área de 960×540 con las capas del pack escaladas x2 (448 px) y un suelo CSS de 92 px.
- El cartel de arriba es una columna angosta del ancho del cartel, con la hitbox centrada; el edificio usa todo el ancho.
- Escala: edificios y moto a x1, carteles a x2.
- Los drones aparecen a mitad de camino entre dos pares, corridos hasta ±70 px del centro del hueco anterior.
- Las URL de imágenes que se pasan por variables CSS son absolutas (`urlCss()` en `obstacle.js`). Si no, se resuelven contra `css/` y no cargan.

### Pendientes y bugs conocidos (para la Fase B)
- `.is-boost` no reinicia la animación si se aprieta muy seguido (falta forzar un reflow). Está documentado en el contrato.
- El HUD no tiene fondo y los carteles le pasan por encima.
- El cuerpo del edificio es un color plano; falta la franja repetida del PNG.
- Los obstáculos a x1 se confunden un poco con la capa 3.
- Al ganar o perder, la escena queda detrás de la pantalla hasta la próxima partida.
- No se usa la torreta (`turret.png`).
- Nadie lo jugó a mano todavía: lo probó un piloto automático en Chrome, con `requestAnimationFrame` reemplazado por un timer de 16 ms porque la pestaña automatizada corría a unos 2 fps. Hay que jugarlo y ajustar `config.js`.
- No hizo falta adelantar nada de la Fase B para que funcione.

### Valores actuales de `config.js`
- **Juego:** 960×540, suelo en y = 448, objetivo 50 puntos, `dtMax` 0,05, temblor 0,4 s y 1 s antes de mostrar la derrota.
- **Mundo:** velocidad base 220 px/s; al chocar un drone baja a ×0,45 durante 1,5 s. Factores de capa 0,1 / 0,3 / 0,6 / 1, con tiles de 768 / 768 / 2018 / 64.
- **Moto:** x 240, gravedad 1500, impulso 430, caída máxima 620, rotación de 0,07° por px/s (entre -25° y 55°), hitbox 14 / 16 / 64×30. Impulso 0,2 s, choque 0,6 s, invulnerabilidad 1,5 s.
- **Obstáculos:** separación 280–420 px, salto del centro ±150, márgenes de 60 arriba y 80 abajo, primer par en x 1120, margen de hitbox de 10 (14 en el tope del edificio), reacción al choque 0,5 s.
- **Drone:** aparece en el 35 % de los casos desde el 2.º par, corrido 70 px, vaivén de 18 px a 0,8 Hz, explosión de 0,5 s.
- **Chip:** aparece en el 40 % de los casos, da +3, se recoge en 0,4 s y el "+3" dura 0,8 s.
- **Modos (hueco inicial / baja por par / mínimo):** Fácil ∞ vidas, 220 / 4 / 130 · Normal 3 vidas, 220 / 4 / 130 · Difícil 1 vida, 190 / 6 / 130.

### Criterios de aceptación al cerrar la Fase A
- [x] Un solo `requestAnimationFrame` (`loop.js`) y ningún `setInterval` ni `setTimeout`.
- [x] Velocidades en px/s, con `dt` y tope.
- [x] Ninguna lectura del DOM en el bucle; todo el movimiento va por `transform`.
- [ ] ≥3 animaciones por eventos del avatar, notorias: las clases `.is-boost`, `.is-hit` e `.is-invulnerable` ya se aplican, pero las animaciones son básicas (Fase B).
- [x] Parallax de 4 capas con velocidades proporcionales; el suelo va a la velocidad de los obstáculos y acompaña la ralentización.
- [x] 2 elementos animados con efectos distintos que no terminan el juego por sí solos (el chip todavía es provisorio).
- [x] Separación horizontal variable, hueco que se achica y alturas variables.
- [x] El puntaje decide el final; modos Fácil, Normal y Difícil.
- [x] Hitboxes visibles con `H`.
- [x] Lo que sale de pantalla se borra del DOM y del arreglo.
- [x] Precarga antes de empezar.
- [ ] Integrado en la web con ayuda, descripción, imágenes y créditos (Fase B).
- [ ] Animaciones notorias (Fase B).

## Fase B (vista + integración, Fran) — terminada (2026-11-17)

Plan original (el detalle y los motivos están en `tp5/DECISIONES.md`):
1. Animaciones del avatar a fondo y notorias: vuelo con llama, impulso (con el reinicio de `.is-boost`), choque con explosión, temblor y destello, e invulnerabilidad.
2. Edificios con el cuerpo repetido del PNG y carteles colgando de su estructura; que los obstáculos se distingan de la capa 3.
3. Animaciones del drone, del chip, del "+3" y la reacción del obstáculo al choque.
4. Cambiar el chip provisorio por su spritesheet cuando exista (`--frames`, `--frame-w` y la URL).
5. HUD con fondo y pantallas (inicio, pausa, victoria, derrota) con la estética de las entregas anteriores; limpiar la escena detrás de las pantallas de fin.
6. Integración web: cómo jugar, descripción, capturas, créditos (Warped City de ansimuz, con su licencia) y agregar el juego a la Home.
7. Jugarlo a mano, ajustar `config.js` y cerrar los criterios de aceptación.

### Resultado de la Fase B
- **Sprites reales:** moto en vuelo (4 cuadros), moto destruida (6), chip (6), drone y carteles, todos con `steps()`. Moto, chip y portada generados con IA y procesados.
- **Animaciones por evento:** impulso (estirón), choque (explosión + temblor + destello rojo), invulnerabilidad (parpadeo con brillo), chispa del cartel, drone que estalla, chip que se recoge y "+3" flotante.
- **Escenario:** cuerpo de los edificios con franjas espejadas del PNG; HUD afuera del juego; pantallas con panel; game over con la escena visible detrás.
- **Página:** `runner.html` con breadcrumb, juego a todo el ancho, Sobre el juego, Galería (4 capturas), Créditos, ficha, Ayuda (sección + diálogo "?" y F1), Compartir y reseñas. `js/runner-pagina.js` tiene la galería y el diálogo.
- **Home:** Neon Rider es el primer destacado del banner (`NEON_RIDER` en `carousel.js`).

### Cambios en la lógica de la Fase A (avisar a Agus)
- El drone ya no resta vida: ralentiza el mundo (`MUNDO.duracionRalentizado` = 3 s) y explota. Ahora es más chico (36×34) y más difícil de agarrar. Motivo: la cátedra pide que un elemento animado no termine el juego solo.
- En Fácil la moto no se destruye ni tiembla: solo parpadea.
- Al morir, `jugador.tiempoChoque = Infinity`: la moto destruida queda a la vista en el game over.
- Hitboxes y tamaños nuevos en `config.js` (moto 74×48 con hitbox 51×24; moneda 32 con hitbox 26).
- `main.js` apunta a `.hud` fuera de `#game` y escucha el evento `runner:pausar` (lo dispara la ayuda).

### Pendientes
- Verificar la licencia de Warped City (ansimuz) y escribirla en los créditos.
- Jugar los 3 modos completos y ajustar `config.js` si hace falta.
- Torreta (`turret.png`) sin usar.
