# Warden — TPE2 Interfaces de Usuario (TUDAI, UNICEN)

Plataforma de mini juegos online. Implementamos en código las 3 pantallas diseñadas
en Figma en el TPE1: **Home**, **Login/Registro** y **página del juego (Peg Solitaire)**.

Somos dos (Agus y Fran). Tenemos permitido usar IA para escribir el código, **pero en la
defensa tenemos que poder explicar cada línea**. Eso define cómo trabajamos con vos
(ver "Cómo trabajar con nosotros").

Entrega: 30/09/2026 23:59, desde el branch `gh-pages`.

Decisiones ya tomadas y su justificación: @DECISIONES.md
Etapas de la corrección en curso (qué está hecho, qué falta, quién puede tomarlo): @ETAPAS.md

---

## Referencias de diseño (capturas de Figma)

Te vamos a pasar capturas de Figma como referencia visual. **Figma no se actualiza:
el código y este archivo son la fuente de verdad.** Si una captura contradice lo que
ya está implementado o una regla de acá (tokens, Orbitron solo en títulos, tildes,
contraste), gana el código y la regla. Avisá la diferencia en lugar de copiarla.

---

## Restricciones del enunciado — TPE2 (no negociables)

> Estas restricciones son **de esta entrega**. El proyecto sigue en próximas entregas
> y cada enunciado nuevo puede sumar, cambiar o sacar requisitos (por ejemplo, la lógica
> del juego). Cuando empecemos una entrega nueva, actualizamos esta sección.
> Si un pedido nuestro parece contradecir algo de acá, preguntá antes de asumir cuál vale.

- Solo **HTML5, CSS3 y JavaScript vanilla**. Nada de React, Vue, Angular, Bootstrap,
  Tailwind ni librerías de UI. Íconos: Phosphor Icons por CDN. Fuentes: Google Fonts.
- **Loading simulado de 5 segundos** cada vez que carga la Home: con % de avance visible
  y una animación hecha en CSS (spinner, círculo o cuadrado). **No GIF, no spritesheet.**
  Keyframes con % están permitidos.
- **3 animaciones de hover distintas en botones.** El menú hamburguesa no cuenta como botón.
- **Carrusel/galería con transición animada** entre imágenes. Que solo se desplace
  NO alcanza: tiene que haber una animación (fade, scale, blur, clip-path, etc.).
- **Animación al registrarse correctamente** en Login/Registro.
- **Datos reales**: títulos de juegos reales, de largos distintos (cortos y largos),
  imágenes distintas y de colores variados. Nada de Lorem Ipsum ni datos genéricos.
- Plus: consumir la API de la cátedra (https://github.com/jimartinezabadias/api-vj-interfaces).
- **Mobile first solo en la Home** (mobile + desktop). Login y juego: solo desktop.
- Todas las correcciones del TPE1 aplicadas.

---

## Estructura

```
/index.html            → redirige o linkea a /tp2/
/tp2/
  index.html           → Home (incluye el loading)
  login.html           → Login / Registro
  juego.html           → Página del juego
  css/
    variables.css      → SOLO tokens (colores, espaciado, radios, fuentes) y clases .t-*
    base.css           → reset, estilos por etiqueta, .sr-only, [hidden]
    components.css     → piezas reutilizables: .btn, .card, .field
    header.css         → header (3 variantes)
    footer.css         → footer
    home.css / login.css / juego.css → solo lo de esa página
  js/                  → un archivo por responsabilidad (loading, carousel, api, etc.)
  assets/img/
```

### Orden de carga del CSS (siempre este)

```html
<link rel="stylesheet" href="css/variables.css">
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/components.css">
<link rel="stylesheet" href="css/header.css">
<link rel="stylesheet" href="css/footer.css">
<link rel="stylesheet" href="css/[pagina].css">
```

Lo general va primero y lo específico al final. No agregues estilos de una página en
`components.css` ni componentes en el CSS de una página.

### JS

- Cargar con `<script src="..." defer></script>`.
- Un archivo por responsabilidad. Nada de un `script.js` gigante.
- Sin `type="module"` salvo que lo pidamos (se complica abrir en local).

---

## Reglas de CSS

- **Nunca colores, fuentes, espaciados ni radios escritos a mano.** Siempre `var(--token)`
  de `variables.css`. Si falta un token, proponelo antes de inventar un valor.
- Tokens disponibles: `--fondo`, `--superficie`, `--primario-c3/c2/c1`, `--primario`,
  `--primario-o1/o2`, `--acento-c3`, `--acento`, `--acento-o2/o3`, `--error`, `--exito`,
  `--foco`, `--espaciado-1/2/3/4/6/8`, `--radio-sm/md/xl`, `--control-alto` (44px),
  `--control-target` (24px), `--font-display` (Orbitron), `--font-ui` (Roboto Flex).
- **Orbitron solo en títulos (h1–h3) y el logo.** Todo lo demás (labels, botones,
  inputs, menús, textos chicos) va en Roboto Flex. Corrección del profesor: priorizar
  accesibilidad sobre estética.
- Nombres de clases estilo BEM: `.bloque`, `.bloque__elemento`, `.bloque--variante`
  (ej: `.header__avatar--invitado`, `.btn--primario`).
- Evitar `!important`. Única excepción aceptada: `[hidden] { display: none !important; }`.
- Mobile first en la Home: estilos base para mobile y `@media (min-width: ...)` para
  agrandar. Breakpoints: `48rem` (tablet) y `64rem` (desktop).
- Toda animación tiene que respetar `@media (prefers-reduced-motion: reduce)`.

## Reglas de HTML y accesibilidad

- HTML semántico: `header`, `nav`, `main`, `section` (con título), `article`, `footer`,
  `address`, `figure`. `div` solo cuando el contenedor es puramente de layout.
- Un solo `h1` por página, sin saltear niveles de título.
- Todo input con `<label>` (visible o `.sr-only`).
- Botones o links de solo ícono: `aria-label` en el control y `aria-hidden="true"` en el ícono.
- Área táctil mínima de 44px (`--control-alto`) en controles de ícono.
- No sacar el foco global (`--foco`, definido en `variables.css`).
- Textos en español rioplatense (voseo) y **con tildes**.

## Rutas

- **Siempre relativas** (`css/base.css`, `login.html`). Nunca empezar con `/`:
  en GitHub Pages el sitio vive en `usuario.github.io/repo/tp2/` y `/` apunta a otro lado.
- Nombres de archivo en minúscula (GitHub Pages distingue mayúsculas).

---

## Git

- `main`: integración. `agus` y `fran`: ramas de trabajo. `gh-pages`: solo deploy.
- Antes de arrancar: `git pull origin main`. Mergear a `main` seguido (idealmente todos los días).
- Deploy: `git push origin main:gh-pages`.
- Commits chicos y en español, que digan qué cambia: "header: buscador en segunda fila en mobile".

---

## Cómo trabajar con nosotros

1. **Antes de escribir código, explicá el plan**: qué archivos vas a tocar, cómo lo vas
   a resolver y por qué. Esperá el ok.
2. **Cambios chicos**: una feature por pedido. Si algo pide tocar más de 3 archivos o
   más de ~150 líneas, proponé dividirlo.
3. **Al terminar, explicá lo que hiciste** bloque por bloque, en lenguaje simple.
   Estamos retomando HTML/CSS después de un tiempo: no des por sabido cascada,
   especificidad, grid/flex ni eventos de JS.
4. **Si tomás una decisión de diseño o arquitectura, sumala a `DECISIONES.md`**
   con el formato del archivo (qué, por qué, alternativa descartada).
5. Si algo del diseño de Figma rompe estas reglas (ej: Orbitron chico, poco contraste),
   avisá y proponé la corrección en lugar de copiarlo tal cual.

---

## Deuda conocida (revisar si ya está resuelta)

Sin pendientes por ahora.
