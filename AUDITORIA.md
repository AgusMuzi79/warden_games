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
| T01 | Enunciado | Solo 2 de las 4 animaciones hover de botón se usan en páginas reales | Pendiente | — |
| T02 | S3 | Texto de botones primarios con contraste 3,62:1 | Pendiente | — |
| T03 | S3 | Buscar con Enter recarga la página | **Hecha** | `769186e`, `cee6a59` |
| T04 | S3 | El acceso a `juego.html` se ve menos de 1 s y en touch nunca | Pendiente | — |
| T05 | S3 | Newsletter: el POST termina en una página de error | Pendiente | — |
| T06 | S3 | Scroll horizontal en mobile (368 px en viewports de 320 y 360) | **Hecha** (footer). Queda el header a 320 px y las etiquetas del banner (T13) | `611d5a3` |
| T07 | S3 | En touch el banner avanza solo y no se puede pausar | Pendiente | — |
| T08 | S3 | Buscador y dots inactivos sin contraste 3:1 | Pendiente | — |
| T09 | S2 | "Pagar carrito" vacío no hace nada ni avisa | Pendiente | — |
| T10 | S2 | Links del hamburguesa que no hacen nada | Pendiente | — |
| T11 | S2 | Dos paradas de Tab por card | A charlar con Fran | — |
| T12 | S2 | Galería de producto gira hacia la misma foto | A charlar con Fran | — |
| T13 | S3 | Etiquetas del banner cortadas en mobile | Pendiente | — |
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
- **Commit:** `611d5a3`. **Justificación:** `DECISIONES.md`, "Franja de abajo del
  footer con `minmax(0, 1fr)` (T06)".
- **Qué sigue desbordando a 320 px (medido después del arreglo):**
  - `.header__actions` / avatar: llega a x=324 con 310 disponibles. El header de
    una fila con la lupa (nuestro) no entra en 320 px con Orbitron. Se resuelve
    aparte (T06b).
  - `.banner__etiquetas`: es T13.
  - A 768 px el banner se pasa 25 px: las cards de los costados del coverflow
    giran fuera del ancho de la pantalla. No está en el informe; se trata aparte.
  - `producto.html` y `juego.html` a 360 px se pasan 18 px por el panel lateral
    fijo de 320 px. Son páginas solo desktop según el enunciado, así que no se
    tocan.

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
