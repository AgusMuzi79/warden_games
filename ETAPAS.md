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

### ✅ 3a. Catálogo real desde la API de la cátedra
Archivos: `js/api.js`, `js/home.js`, `home.css`, `index.html`.
- `api.js` pide `https://vj.interfaces.jima.com.ar/api` (la API de
  jimartinezabadias, ~80 juegos reales con nombre/imagen/rating).
- `home.js` arma las cards (`.card.game-card`) dentro de `.carousel__grid`,
  con datos de respaldo hardcodeados si la API falla.
- Grilla mobile-first (2 → 3 → 4 columnas). Todavía NO es el carrusel con
  transición — eso es la 3b.
- Se sumó `<h2>Recomendados</h2>` antes de las cards para no saltear niveles
  de título.

Detalle en `DECISIONES.md`.

### ⬜ 3b. Convertir la grilla en carrusel con transición animada
Archivos: `home.css`, `js/carousel.js`.
- Recorrer las cards de a una/pocas con controles prev/next accesibles.
- Definir la transición (fade, scale o clip-path).

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
