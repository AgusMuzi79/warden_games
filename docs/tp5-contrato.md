# TP5 — Contrato DOM de Neon Rider

Interfaz entre la **Fase A** (lógica, `tp5/js/runner/`) y la **Fase B** (vista,
`tp5/css/runner.css`). La regla es una sola: **el JS escribe `transform`
(`translate3d`), agrega o quita clases de estado y actualiza textos del HUD;
todo lo visual (colores, `@keyframes`, spritesheets) vive en el CSS.**

Si la Fase B necesita otra clase o cambiar una duración, se cambia en
`js/runner/config.js` (duraciones) y se actualiza este archivo.

---

## Estructura

La parte fija está en `tp5/runner.html`; las entidades las crea el JS dentro de
`.world` y las borra cuando salen de pantalla o terminan su animación.

```
#game.game                      contenedor 960x540 (tabindex="0")
  .layer.layer--1               cielo           (capa1-cielo.png x2)
  .layer.layer--2               ciudad lejana   (capa2-ciudad-lejana.png x2)
  .layer.layer--3               edificios       (capa3-edificios.png x2, oscurecida)
  .layer.layer--4               suelo           (CSS, franja de abajo de 92 px)
  .world                        contenedor de entidades (las crea el JS)
    .obstacle                   un par edificio + cartel
      .obstacle__top            estructura colgante del techo
        .obstacle__banner       cartel (spritesheet)
      .obstacle__bottom         edificio (tope en PNG + cuerpo)
      .hitbox (x2)              cajas de colisión (solo se ven con H)
    .drone                      enemigo (spritesheet)
      .hitbox
    .collectible                chip dorado
      .collectible__sprite      moneda-chip.png (tira de 6 cuadros)
      .hitbox
    .float-text                 "+3" flotante
      span
  .player                       la moto
    .player__body               balanceo del vuelo
      .player__sprite           moto-vuelo.png (tira de 4 cuadros, espejada)
    .player__explosion          moto-choque.png (tira de 6 cuadros)
  .hitbox.hitbox--player        caja de colisión de la moto (solo con H)
  (el .hud NO está dentro de #game: es hermano, arriba del área de juego)
  #screen-loading  #screen-start  #screen-pause  #screen-win  #screen-lose
  #game-status                  texto para lectores de pantalla (role="status")
```

---

## Qué escribe el JS en cada elemento

| Elemento | Lo escribe | Qué | Cuándo |
|---|---|---|---|
| `#game` | `main.js` (una vez) | variables `--ancho`, `--alto`, `--suelo`, `--alto-suelo` | al cargar |
| `.layer--1..4` | `parallax.js` | `transform: translate3d(-x, 0, 0)` y la variable `--tile` (una vez) | cada cuadro |
| `.player` | `entities/player.js` | `translate3d(x, y, 0) rotate(Ndeg)` | cada cuadro |
| `.hitbox--player` | `entities/player.js` | `translate3d(x, y, 0)` | cada cuadro |
| `.obstacle` | `entities/obstacle.js` | `translate3d(x, 0, 0)` | cada cuadro |
| `.obstacle__top`, `__bottom`, `__banner`, `.hitbox` | `entities/obstacle.js` | tamaño, posición y variables del sprite | **una vez**, al crearlo |
| `.drone` | `entities/drone.js` | `translate3d(x, y, 0)` (y incluye el vaivén) | cada cuadro |
| `.collectible` | `entities/collectible.js` | `translate3d(x, y, 0)` | cada cuadro |
| `.float-text` | `entities/collectible.js` | `translate3d(x, y, 0)` | una vez |
| `#progress .hud__progress-bar` | `hud.js` | `transform: scaleX(0..1)` | cuando cambia el puntaje |

Nunca se lee el DOM para calcular (nada de `getBoundingClientRect`,
`offsetWidth`...): posiciones, tamaños y hitboxes salen del estado y de
`config.js`.

---

## Clases de estado

Todas las duraciones están en `config.js` y se cuentan con `dt` dentro del
loop (no hay `setTimeout`). "Hasta que se borra" quiere decir que el JS saca el
elemento del DOM y del arreglo cuando se termina el tiempo.

| Clase | Elemento | La pone | Cuándo | Dura |
|---|---|---|---|---|
| `.is-shaking` | `#game` | `game.js` | cualquier choque que hace daño (o choque en Fácil) | `JUEGO.duracionSacudon` (0,4 s) |
| `.is-paused` | `#game` | `game.js` | pausa (P/Esc, o al perder el foco) | hasta reanudar. El CSS frena todas las animaciones |
| `.is-debug` | `#game` | `game.js` | tecla H | hasta volver a apretar H. Muestra los `.hitbox` |
| `.is-boost` | `.player` | `player.js` | cada impulso | `JUGADOR.duracionImpulso` (0,2 s); se reinicia con cada pulsación |
| `.is-hit` | `.player` | `game.js` | choque (obstáculo, drone, techo o suelo) | `JUGADOR.duracionChoque` (0,6 s) |
| `.is-invulnerable` | `.player` | `game.js` | después de un choque | `JUGADOR.duracionInvulnerable` (1,5 s) |
| `.is-hit` | `.obstacle` | `game.js` | la moto chocó ese obstáculo | `OBSTACULO.duracionChoque` (0,5 s) |
| `.is-exploding` | `.drone` | `game.js` | la moto tocó el drone (no hace daño: solo ralentiza el mundo) | `DRONE.duracionExplosion` (0,5 s), después se borra |
| `.is-collected` | `.collectible` | `game.js` | la moto lo agarró | `COLECCIONABLE.duracionRecogida` (0,4 s), después se borra |
| `.float-text` | (elemento nuevo) | `collectible.js` | al agarrar un coleccionable | `COLECCIONABLE.duracionTexto` (0,8 s), después se borra |

Mientras un drone explota o un coleccionable se recoge, ya no colisiona.

Notas (Fase B, resueltas en la vista):
- `.is-boost` dura 0,2 s desde la última pulsación: si se pulsa de nuevo
  antes de que termine, la clase sigue puesta y una animación con
  `@keyframes` no se reinicia (el JS no fuerza un reflow, porque no lee el
  DOM). Conviene que el estirón de la llama sea una transición o un estado,
  no una animación de una sola vez.
- Mientras la moto es invulnerable atraviesa edificios, carteles y drones;
  el techo y el suelo solo la frenan. Los coleccionables se agarran igual.
- En la fase de derrota el mundo queda quieto 1 s (`JUEGO.esperaDerrota`)
  para que se vea la explosión; recién ahí aparece `#screen-lose`.

---

## Variables CSS por entidad (las pone el JS una vez)

- `.obstacle__bottom`: `--img` (url del tope del edificio), `--img-alto`.
- `.obstacle__banner`: `--img`, `--frames`, `--frame-w` (ya escalado), `--alto`.
  La animación es `steps(var(--frames))` sobre `background-position-x`.
- `.obstacle__top`: `--ancho-cartel` (ancho del cartel ya escalado; la estructura y la hitbox de arriba se centran con ese ancho).
- `.collectible__sprite`: placeholder por CSS. Para pasarlo a spritesheet:
  ponerle la clase `.collectible__sprite--sheet` y definir `--img`,
  `--frames`, `--frame-w`, `--frame-h` (ver el comentario en `runner.css`).

---

## Pantallas

Son `div.screen` con `[hidden]`; las muestra y oculta `main.js`. Solo una
visible a la vez.

| Id | Cuándo se ve | Botones (`data-action` / `data-mode`) |
|---|---|---|
| `#screen-loading` | al cargar, mientras se precargan las imágenes. `#loading-percent` muestra el % | — |
| `#screen-start` | después de la carga y al elegir "Cambiar modo" | `data-mode="facil"`, `"normal"`, `"dificil"` |
| `#screen-pause` | pausa | `data-action="resume"`, `data-action="menu"` |
| `#screen-win` | puntaje objetivo alcanzado | `data-action="retry"`, `data-action="menu"` |
| `#screen-lose` | sin vidas (después de 1 s de explosión) | `data-action="retry"`, `data-action="menu"` |

Las pantallas llevan un `.screen__panel` adentro. Dentro de win y lose,
`.screen__score` muestra el puntaje final. La derrota es "Game over": la escena
queda visible detrás y el panel ofrece `data-action="retry"` (seguir jugando) y
`data-action="menu"`.

Cambios de la Fase B que tocan la lógica: el drone no resta vida (solo
ralentiza `MUNDO.duracionRalentizado` s y explota); en Fácil la moto no
se destruye (sin `.is-hit` ni temblor, solo parpadea); al morir
`jugador.tiempoChoque = Infinity` para que se vea la moto destruida en el game over.

## HUD

El `.hud` va afuera de `#game`, arriba (Fran, Fase B): así no le saca protagonismo
al juego. Los ids no cambian.

| Id | Contenido |
|---|---|
| `#score` | puntaje (número) |
| `#lives` (`.hud__vidas`) | un `<i class="ph ph-heart hud__vida">` por vida; en Fácil, un `<span class="hud__vida hud__vida--infinita">∞</span>`. `aria-label` con la cantidad |
| `#mode` | nombre del modo |
| `#progress` | `role="progressbar"` con `aria-valuenow`; la barra interna escala con `scaleX` |

## Entrada

| Tecla / gesto | Acción |
|---|---|
| Espacio, ↑, W, clic en `#game` | impulso (una vez por pulsación: se ignora `e.repeat`) |
| P, Esc | pausa / reanudar |
| H | mostrar u ocultar hitboxes |
| Perder el foco de la pestaña | pausa automática |
