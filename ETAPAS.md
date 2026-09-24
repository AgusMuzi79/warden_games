# Etapas — 2ª corrección del TPE1

Plan para aplicar las correcciones que nos pasaron sobre el TPE1 (ds: fuentes y
botones; home: cards/carrusel/menú; peg: grilla/galería; login: splash de 2
columnas). Va en orden porque cada etapa depende de la anterior (ej: el login
necesita el componente `.link` de la etapa 1).

Cualquiera de los dos puede tomar la siguiente etapa disponible. Antes de
arrancar una, avisar en el grupo para no pisarse, y una vez terminada sumar las
decisiones tomadas a `DECISIONES.md` (formato: qué, por qué, alternativa
descartada) como se explica en `CLAUDE.md`.

---

## ✅ Etapa 1 — Design system

### ✅ 1a. Fuentes (sacar el exceso de Orbitron)
Archivos: `variables.css`, `base.css`, `footer.css`.
- `h4` sale del selector de Orbitron en `base.css` (quedaba agrupado con h1-h3).
- `.t-label` (`variables.css`) pasa a `--font-ui`.
- `.sponsors__list a` (`footer.css`) pasa a `--font-ui` (son links, no títulos).
- `.footer__label` y `.newsletter__title` quedan en Orbitron a propósito: son
  `h2`, entran en la regla de headings.

### ✅ 1b. Botones (4 hovers distintos) + componente `.link`
Archivos: `components.css`, `variables.css`, `footer.css` + las 3 páginas.
- `.btn--destructivo` ya no comparte animación con primario: ahora pulsa/resplandece
  en rojo (`@keyframes` sobre `box-shadow`). Nuevo token `--resplandor-error`.
- Componente `.link` nuevo (subrayado animado, reutiliza la animación de
  `.btn--terciario`). Todavía no se usa en ninguna página — se necesita para
  la etapa 2.
- El botón "Suscribirse" del footer se unificó a `.btn .btn--secundario` (estaba
  con estilo propio hardcodeado).

Detalle completo de las decisiones en `DECISIONES.md`.

---

## ✅ Etapa 2 — Login: splash de 2 columnas

Archivos: `login.html`, `login.css`, `js/login.js`.

- ✅ Sin `<header>` ni `<footer>` en la página.
- ✅ `<h1>` como título del panel de marca (ya no hay `<h2>` de "Iniciar
  sesión"/"Registrarse": los forms se distinguen por el selector de arriba).
- ✅ Layout de 2 columnas: `.auth-brand` (logo con animación de flotar +
  "Warden Games" + bajada) y `.auth-panel` (el form activo).
- ✅ **Decisión tomada:** se alterna con el selector `.auth-switch` (2 botones,
  el activo relleno de violeta), como en la captura de Figma — no con un link
  suelto (se probó esa opción primero, pero era redundante contra el selector).
- ✅ Animación al registrarse correctamente (bloque `.auth-success` con
  fade + scale).

Detalle completo de las decisiones en `DECISIONES.md`.

---

## ⬜ Etapa 3 — Home

Archivos: `index.html`, `home.css`, `js/carousel.js`, `js/home.js`, `header.css`.

- Cards de juego con nombre real e imagen en `#carousel` (datos reales, largos
  y colores distintos — no hay ni una todavía).
- Carrusel de recomendados con transición animada (fade/scale/clip-path — a
  definir cuál).
- Unificar menú hamburguesa y menú de usuario en un solo componente visual
  (hoy son muy distintos entre sí). Agregar más ítems al menú hamburguesa.

---

## ✅ Etapa 4 — Juego (Peg Solitaire / "Neon Circuit" en la interfaz)

Archivos: `juego.html`, `juego.css`, `js/juego.js`, `js/compartir.js`,
`js/resena.js`.

A partir de las capturas de Figma que pasó Fran, la página del juego trae
bastante más que la grilla y la galería. Se dividió en partes.

- ✅ 4a. Breadcrumb ("Inicio > Puzzle > Neon Circuit"), `h1` renombrado a
  "Neon Circuit" y marco de la card del tablero (con el placeholder "Botón"
  de Figma como rótulo, sin función todavía).
- ✅ 4b. Paleta de colores propia del tablero (tokens nuevos en
  `variables.css`) + grilla de 33 posiciones + estados de ficha (activa,
  descargada, seleccionada, destino) + leyenda de símbolos. Solo visual,
  sin lógica de movimientos todavía. Fuera de alcance por ahora: tableros
  de otro tamaño y "puentes" (tablero 21+).
- ✅ 4c. Panel lateral: ficha del juego (miniatura, categoría, dev, rating,
  "jugando ahora"/"tu récord") + acordeón de Ayuda (`<details>`/`<summary>`)
  + atajos de teclado (Z/R/Esc).
- ✅ 4d. Sección "Sobre el juego" (texto descriptivo, escrito para este
  juego, no copiado de la captura).
- ✅ 4e. Galería: 6 tiles con gradientes CSS armados con la paleta del
  tablero (sin fotos reales todavía, `aria-hidden` hasta que las haya).
- ✅ 4f. Comunidad (3 reseñas reales y distintas, no repetidas) + Compartir
  (redes, mail, "Copiar" link funcional) + "Dejá tu reseña" (puntaje con
  radios en CSS puro, sin JS). Sin enlaces relacionados: se sacaron, no se
  van a usar.
- ✅ 4g. Pase final de layout, con 3 correcciones de Fran contra Figma:
  - Compartir pasó a vivir en el panel lateral, debajo de Ayuda (no debajo
    de la Galería).
  - Se sacó la sección "Enlaces relacionados".
  - Comunidad y "Dejá tu reseña" pasaron a ir uno al lado del otro (reusan
    el mismo `.juego-layout` de 2 columnas).
- ⬜ 4f. Comunidad (reseñas con contenido real y distinto) + Compartir +
  enlaces relacionados + "Dejá tu reseña".

Detalle de las decisiones de la 4a en `DECISIONES.md`.

---

## Plus (sin fecha todavía)

- `js/api.js`: consumir la API de la cátedra (login/registro reales, catálogo
  de juegos, puntajes). Hoy es un stub sin lógica.
