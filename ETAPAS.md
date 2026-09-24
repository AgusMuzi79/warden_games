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

## ✅ Etapa 2 — Login: splash de 2 columnas (a cargo de Fran)

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

## ✅ Etapa 3 — Home (a cargo de Agus)

La Home queda con: banner "Destacados" arriba (carrusel coverflow), y
abajo, según el estado del avatar del header (`data-sesion="usuario"`
oculto o no): filas por categoría para invitado, o una fila "Recomendados"
para quien tiene sesión. El menú hamburguesa y el de cuenta, en el header
de todas las páginas, comparten el mismo estilo de dropdown.

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

### ✅ 3b. Banner "Destacados": carrusel coverflow (perspective + rotateY)
Archivos: `index.html` (reemplazó al `#hero`), `home.css`, `js/carousel.js`.
- El `<h1>` de la página ahora es "Destacados" (arriba de todo, visible).
- 5 cards con los juegos mejor puntuados de la API. La activa queda de
  frente al centro; las de los costados se corren, se achican y giran en 3D
  (`perspective` + `rotateY` + `translateZ`), como si se alejaran hacia el
  fondo — el clásico carrusel "coverflow" (tipo iTunes viejo).
- Autoplay cada 6s, dots para navegar manual, y también se puede clickear
  cualquier card visible del costado para saltar directo a ella. Se pausa
  con hover o con foco de teclado (sin botón de pausa visible). Es la única
  animación de transición entre imágenes de la Home (junto con la galería
  del juego en la etapa 4) — las filas de categorías/recomendados no la
  llevan.
- Sin badge de precio todavía (no hay sistema de compras armado, ver "Plus").
- Las cards no se recortan a los costados (`.banner__viewport` sin
  `overflow: hidden`) y las imágenes van con `background-size: cover`
  (llenan la card, sin dejar franjas vacías).
- (Hubo dos versiones anteriores que no se parecían a la referencia: un wipe
  de `clip-path` en un solo slide, y después slides en paralelogramo plano
  con `clip-path` diagonal — ninguna de las dos es en realidad "3D". Se
  rehizo con la técnica correcta, ver `DECISIONES.md`.)

Detalle en `DECISIONES.md`.

### ✅ 3c. Unificar menú hamburguesa y menú de usuario
Archivos: `index.html`, `components.css` (el componente `.menu-dropdown`
compartido), `header.css` (posicionamiento), `js/menu.js` (nuevo).
- Ninguno de los dos existía en el código todavía. Se construyeron los dos
  con el mismo componente visual (card redondeada, divisores, mismo
  espaciado) — antes tenían estructuras distintas (panel ancho vs. card
  angosta), calcado del estilo del menú de cuenta.
- Hamburguesa: 3 secciones — "Jugar" (5 links, iguales al footer),
  "Categorías" (4, iguales a las de `home.js`) y un botón "Contáctanos"
  (`mailto:`). Cada item con ícono, estilo CrazyGames simplificado.
- Cuenta: cabecera (avatar + nombre + @usuario), items de cuenta, redes
  sociales, "Cerrar sesión" — calcado de la captura de Figma.
- El avatar con sesión pasa de `<a>` a `<button>` (ahora abre un menú, no
  navega). `js/menu.js` maneja abrir/cerrar, click afuera, Escape (con
  foco de vuelta al botón), y que solo un menú esté abierto a la vez.
- Bug real encontrado al probarlo: el dropdown (z-index 50) quedaba tapado
  por las cards del banner coverflow (z-index hasta 100) donde se
  superponían. Se subió a z-index 200.

Detalle en `DECISIONES.md`.

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

- ✅ Catálogo de juegos (`obtenerJuegos()` en `js/api.js`, usado por la Home).
- ✅ Sesión simulada persistida (`js/sesion.js`): login/registro exitosos
  guardan el estado en `localStorage` y la Home ya arranca mostrando el
  avatar y "Recomendados" al volver. Sigue sin ser una cuenta real (no hay
  backend ni `api.js` de por medio todavía en el login).
- ⬜ Login/registro reales contra la API (`js/login.js` hoy solo valida el
  form, no llama a `api.js` todavía).
- ⬜ Guardado de puntajes.

## ⬜ Sistema de compras

Lo pide el enunciado, no es opcional — a diferencia de los ítems de "Plus".
Todavía no está planificado en detalle (qué se compra, con qué método, dónde
vive el carrito del header). Cuando se arme, el banner "Destacados" recupera
el badge de precio que tiene en el Figma pero que sacamos por ahora.
