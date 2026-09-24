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

## 🔶 Etapa 2 — Login: splash de 2 columnas (a cargo de Fran)

En revisión: [PR #2](https://github.com/AgusMuzi79/warden_games/pull/2), rama `fran`.
Splash de 2 columnas, selector Crear Cuenta/Ingresar con tabs, animación de
registro exitoso y toggle de contraseña. Falta corregir antes de mergear a
`main`: a `.auth-switch__btn` y `.toggle-pass` les falta `appearance: none`,
así que el navegador les pinta su fondo nativo encima y no se distingue cuál
tab está activo (mismo problema que ya tuvimos con `.btn`, comentado en el PR).

---

## 🔶 Etapa 3 — Home (a cargo de Agus)

La Home queda con: banner "Destacados" arriba (con skew y transición
animada), y abajo, según el estado del avatar del header
(`data-sesion="usuario"` oculto o no): filas por categoría para invitado, o
una fila "Recomendados" para quien tiene sesión.

### ✅ 3a. Catálogo real desde la API + filas por categoría/recomendados
Archivos: `js/api.js`, `js/home.js`, `home.css`, `index.html`.
- `api.js` pide `https://vj.interfaces.jima.com.ar/api` (la API de
  jimartinezabadias, ~80 juegos reales con nombre/imagen/rating/género).
- `home.js` arma una fila por categoría fija (Acción, Shooters, RPG,
  Aventura) para invitado, o una fila "Recomendados" (simulada por género)
  si `data-sesion="usuario"` está visible en el header. Cards horizontales
  (16:9), cada fila con scroll nativo (sin animación — eso es solo del
  banner). Datos de respaldo hardcodeados si la API falla.
- `<h2>` propio por cada fila para no saltear niveles de título.
- (La primera versión de la 3a era una única grilla "Recomendados" para
  todos, con cards verticales — se descartó, ver `DECISIONES.md`.)

Detalle en `DECISIONES.md`.

### ✅ 3b. Banner "Destacados": carrusel con wipe diagonal y transición animada
Archivos: `index.html` (reemplazó al `#hero`), `home.css`, `js/carousel.js`.
- El `<h1>` de la página ahora es "Destacados" (arriba de todo, visible).
- 4 slides con los juegos mejor puntuados de la API. Transición con
  `clip-path` animado (wipe diagonal, inspirado en el carrusel de
  [Glide.js en Dribbble](https://dribbble.com/shots/2178325-Glide-js-Simple-responsive-and-fast-jquery-carousel-slider)
  pero resuelto distinto — más simple que calcular el "peek" a mano).
- Autoplay cada 6s, dots para navegar manual. Se pausa con hover o con foco
  de teclado (sin botón de pausa visible). Es la única animación de
  transición entre imágenes de la Home (junto con la galería del juego en
  la etapa 4) — las filas de categorías/recomendados no la llevan.
- Sin badge de precio todavía (no hay sistema de compras armado, ver "Plus").

Detalle en `DECISIONES.md`.

### ⬜ 3c. Unificar menú hamburguesa y menú de usuario
Archivos: `index.html`, `header.css`, `js/menu.js` (nuevo).
- Mismo componente de dropdown para los dos, contenido a definir (propuesta:
  hamburguesa = navegación del sitio, usuario = cuenta).

---

## ⬜ Etapa 4 — Juego (Peg Solitaire)

Archivos: `juego.html`, `juego.css`, `js/juego.js`.

- Grilla del tablero (`#board` hoy está vacío, sin CSS).
- Definir y construir la "galería" (falta ver la captura de Figma para saber
  qué es exactamente).

---

## Plus (sin fecha todavía)

- ✅ Catálogo de juegos (`obtenerJuegos()` en `js/api.js`, usado por la Home).
- ⬜ Login/registro reales contra la API (`js/login.js` hoy solo valida el
  form, no llama a `api.js` todavía).
- ⬜ Guardado de puntajes.

## ⬜ Sistema de compras

Lo pide el enunciado, no es opcional — a diferencia de los ítems de "Plus".
Todavía no está planificado en detalle (qué se compra, con qué método, dónde
vive el carrito del header). Cuando se arme, el banner "Destacados" recupera
el badge de precio que tiene en el Figma pero que sacamos por ahora.
