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

## ⬜ Etapa 4 — Juego (Peg Solitaire)

Archivos: `juego.html`, `juego.css`, `js/juego.js`.

- Grilla del tablero (`#board` hoy está vacío, sin CSS).
- Definir y construir la "galería" (falta ver la captura de Figma para saber
  qué es exactamente).

---

## Plus (sin fecha todavía)

- `js/api.js`: consumir la API de la cátedra (login/registro reales, catálogo
  de juegos, puntajes). Hoy es un stub sin lógica.
