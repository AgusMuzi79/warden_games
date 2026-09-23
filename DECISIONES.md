# Decisiones de diseño e implementación — Warden (TPE2)

Cada decisión: **qué** hicimos, **por qué**, y qué **alternativa** descartamos.
Este archivo es la base para justificar los patrones de diseño en la defensa.

---

## Organización del proyecto

### Carpeta `tp2/` con un `index.html` en la raíz
- **Qué:** todo el TPE2 vive en `/tp2/`; la raíz tiene un index que lleva ahí.
- **Por qué:** separa cada entrega en el mismo repo. GitHub Pages sirve el `index.html`
  de la raíz, así que sin él el link de entrega daría 404.
- **Descartado:** todo en la raíz (se mezcla con futuras entregas).

### Ramas `main`, `agus`, `fran` y `gh-pages`
- **Qué:** cada uno trabaja en su rama, mergea seguido a `main`, y `gh-pages` se actualiza
  desde `main` solo para publicar.
- **Por qué:** trabajamos a la par sin pisarnos. Mergear seguido mantiene los conflictos chicos.
  El enunciado exige entregar por `gh-pages`.
- **Descartado:** trabajar los dos en `main` (conflictos constantes) y ramas por persona
  mergeadas solo al final (conflictos enormes cerca de la entrega).

### Rutas relativas en todo el sitio
- **Qué:** `css/base.css`, `index.html`, nunca `/css/...` ni `href="/"`.
- **Por qué:** en GitHub Pages el sitio vive en `usuario.github.io/repo/tp2/`;
  una ruta con `/` apunta a la raíz del dominio y se rompe.

---

## Arquitectura de CSS

### CSS en capas, cargadas de lo general a lo específico
- **Qué:** `variables → base → components → header → footer → [página]`.
- **Por qué:** aprovecha la cascada: ante reglas igual de específicas gana la última
  cargada, así lo específico de una página puede ajustar lo general sin `!important`.
- **Descartado:** un solo `styles.css` (difícil de navegar y fuente constante de conflictos en git).

### Design tokens en `variables.css`
- **Qué:** colores, espaciados, radios y fuentes como custom properties en `:root`,
  usadas con `var()`. Ningún valor escrito a mano en el resto del CSS.
- **Por qué:** una sola fuente de verdad. Aplicar las correcciones del TPE1 (paleta,
  tipografía) implica cambiar un valor, no buscar colores por todo el código.
  Mantiene el sitio consistente con el design system de Figma.

### Header y footer en archivos propios
- **Qué:** `header.css` y `footer.css`, separados de `components.css`.
- **Por qué:** no son componentes chicos y reutilizables sino secciones de layout,
  presentes una vez por página. Son grandes (el footer tiene más de 200 líneas) y,
  separados, reducen los conflictos en el archivo que más tocamos.
- **Descartado:** meterlos en `components.css`.

### Convención de nombres BEM
- **Qué:** `.bloque__elemento--variante` (ej: `.header__avatar--invitado`).
- **Por qué:** el nombre dice a qué pertenece cada clase y evita que estilos de una
  sección afecten otra sin querer. Mantiene la especificidad baja y pareja.

### Mobile first solo en la Home
- **Qué:** en la Home, estilos base para mobile y `@media (min-width)` para tablet
  (48rem) y desktop (64rem). Login y juego, solo desktop.
- **Por qué:** lo pide el enunciado. Empezar por mobile obliga a priorizar contenido
  y hace que lo que se agrega en pantallas grandes sea incremental.

---

## Tipografía

### Orbitron solo en títulos
- **Qué:** Orbitron para h1–h3 y logo; Roboto Flex para todo lo demás.
- **Por qué:** corrección del TPE1. Orbitron es decorativa y en textos chicos, labels
  e inputs pierde legibilidad. La reservamos para jerarquía y marca.
- **Antes:** usábamos Orbitron desde 18px, lo que igual la dejaba en demasiados lugares.

### Tildes y voseo
- **Qué:** corregimos textos de Figma sin tilde ("Últimos", "Documentación", "Botón", "menú").
- **Por qué:** consistencia y corrección del contenido; el diseño se actualizó igual.

---

## Accesibilidad (transversal)

### Foco visible global
- **Qué:** `:where(a, button, input, select, textarea, [tabindex]):focus-visible` con
  outline de color `--foco`.
- **Por qué:** quien navega con teclado siempre ve dónde está. `:focus-visible` evita
  que aparezca al hacer click con el mouse. `:where()` tiene especificidad 0, así que
  cualquier componente lo puede ajustar sin pelear.

### Área táctil de 44px en controles de ícono
- **Qué:** hamburguesa, carrito, redes: el ícono mide 24px pero el control 44px.
- **Por qué:** objetivos más grandes son más fáciles de tocar (ley de Fitts), sobre todo
  en mobile. Visualmente no cambia nada.

### Labels en todos los inputs
- **Qué:** cada input tiene `<label>`; si el diseño no lo muestra, se oculta con `.sr-only`.
- **Por qué:** el placeholder no reemplaza al label: desaparece al escribir y muchos
  lectores de pantalla no lo leen.

### Íconos sin texto
- **Qué:** `aria-label` en el link o botón, `aria-hidden="true"` en el ícono.
- **Por qué:** el lector de pantalla anuncia "Carrito, link" en vez de nada o un
  carácter raro de la fuente de íconos.

---

## Header

### Una estructura, tres variantes
- **Qué:** Home con sesión, Home invitado y página del juego comparten `.header`;
  el juego usa el modificador `.header--juego`.
- **Por qué:** un solo componente con variantes es más fácil de mantener y mantiene
  la consistencia visual entre páginas.

### Grilla de 3 columnas iguales para centrar el buscador
- **Qué:** `grid-template-columns: 1fr minmax(0, 24rem) 1fr`, con menú + logo agrupados
  en `.header__start`.
- **Por qué:** con dos columnas laterales iguales, el buscador queda centrado respecto
  de la página, como en Figma, sin importar que la izquierda y la derecha tengan
  contenido de distinto ancho.
- **Descartado:** flex con `justify-content: space-between` (lo centra entre los
  vecinos, no en la página).

### En mobile el buscador baja a una segunda fila
- **Qué:** con `grid-template-areas`, el buscador ocupa el ancho completo debajo.
- **Por qué:** en una pantalla angosta no entra en la misma fila sin quedar diminuto.
  Se mantiene visible (no se esconde tras un ícono) porque buscar es una tarea
  principal en una plataforma de juegos.

### Header del juego sin menú ni buscador ("modo foco")
- **Qué:** solo logo, estado de guardado, "Volver al menú" y avatar.
- **Por qué:** mientras se juega, reducir distracciones. Se deja una salida clara
  (volver al menú) y feedback del estado del sistema (partida guardada).

### Estado de sesión en el avatar
- **Qué:** con sesión, foto del usuario → "Mi cuenta". Invitado, ícono genérico → `login.html`.
- **Por qué:** el avatar comunica el estado de sesión de un vistazo, y el del invitado
  es el punto de entrada natural al login.
- **Por ahora:** sin JS, cada página muestra un estado fijo (Home como invitado,
  juego con sesión).

### "Partida guardada" con `role="status"`
- **Qué:** el texto de estado tiene `role="status"` y la hora en `<time>`.
- **Por qué:** cuando JS actualice la hora, el lector de pantalla lo anuncia sin
  interrumpir. Es feedback del estado del sistema (heurística de Nielsen #1).

### Placeholder "Buscar juegos"
- **Qué:** se agregó aunque en Figma el buscador está vacío.
- **Por qué:** deja claro qué se busca. El label oculto sigue estando para accesibilidad.

---

## Footer

### Fat footer con estructura semántica
- **Qué:** `nav` por cada columna de links (con `aria-labelledby` a su título),
  `section` para sponsors y newsletter, `address` para los datos de la empresa,
  `div` solo para la grilla y la franja de abajo.
- **Por qué:** un lector de pantalla puede saltar entre navegaciones ("navegación Jugar",
  "navegación Ayuda") y entiende qué es cada bloque. Los `div` quedan para layout puro.

### Títulos de columna como `h2` con estilo de label
- **Qué:** son `h2` en el HTML pero se ven como labels chicos.
- **Por qué:** la jerarquía la define el HTML y el tamaño visual el CSS. Así el
  outline del documento queda correcto.

### Layout mobile first
- **Qué:** en mobile la marca arriba y las columnas de a dos; desde tablet, 4 columnas;
  desde desktop, marca + 4 columnas como en Figma.
- **Por qué:** el footer está en la Home, que es mobile first.

---

## Loading de la Home

### Spinner circular con el % adentro
- **Qué:** un aro (`::before` con borde, uno de sus lados de otro color) que gira con
  `@keyframes`, con el número de 0 a 100 centrado adentro.
- **Por qué:** es la forma más simple de las permitidas por el enunciado (spinner, círculo
  o cuadrado) y la más asociada a "cargando" para quien lo ve. El número va adentro en vez
  de debajo para que ocupe menos alto y quede más compacto.
- **Cómo:** el aro que gira es un `::before` absoluto que ocupa todo el spinner; el texto
  del % es un elemento aparte con `z-index: 1` para quedar siempre arriba, así no hace
  falta contra-rotarlo para que no gire con el aro.

### Contador real de 0 a 100% en 5 segundos
- **Qué:** `loading.js` suma 1% cada 50ms (100 pasos × 50ms = 5000ms) y al llegar a 100
  oculta el overlay con el atributo `hidden`.
- **Por qué:** el enunciado pide "loading simulado de 5 segundos con % de avance visible";
  un contador reproducible es más simple de explicar que una animación por `requestAnimationFrame`.

### El resto de la página queda `inert` mientras carga
- **Qué:** mientras el loading está visible, el header, el `main` y el footer tienen el
  atributo `inert`.
- **Por qué:** sin esto, alguien podría tabular o hacer click en contenido tapado por el
  overlay. `inert` es nativo de HTML, no hace falta JS para bloquear foco elemento por elemento.

### El % es decorativo para lectores de pantalla
- **Qué:** el spinner y el número tienen `aria-hidden="true"`; en cambio hay un texto fijo
  ("Cargando catálogo de juegos…") dentro del `role="status"` que se lee una sola vez.
- **Por qué:** anunciar el número cambiando 100 veces en 5 segundos sería spam para quien
  usa lector de pantalla. Un solo anuncio al aparecer el loading alcanza.

---

## Componentes

### Cards que se elevan sobre las vecinas en hover
- **Qué:** `transform: scale(1.06)` + `z-index: 1` en hover y `:focus-within`.
- **Por qué:** feedback claro de qué card está activa; `:focus-within` hace que funcione
  también con teclado. En Figma no se puede mostrar el z-index dinámico; en código sí.
- **Movimiento reducido:** se desactiva con `prefers-reduced-motion`.

### Las 3 animaciones de hover de los botones
- **Qué:** primario y destructivo se elevan (`translateY` + sombra) al pasar el mouse;
  secundario tiene un relleno que entra deslizando de izquierda a derecha (`::before`
  con `scaleX`); terciario tiene un subrayado que crece de izquierda a derecha (`::after`
  con `scaleX`). Son 3 animaciones distintas repartidas en los 4 estilos de botón.
- **Por qué:** el enunciado pide 3 animaciones de hover distintas en botones. Elegimos
  variantes con significado (elevar = "esto es la acción principal", rellenar y subrayar
  = variantes de menor jerarquía) en vez de 3 efectos arbitrarios sin relación con el uso
  de cada botón.
- **Token nuevo:** `--sombra-elevacion` en `variables.css` (un `rgba` con transparencia)
  para la sombra del hover, porque ningún token de color existente tiene alfa.
- **`appearance: none` en `.btn`:** lo agregamos porque, sin él, algunos navegadores le
  aplican su propio estilo nativo de botón (bordes, colores) por encima del nuestro. Con
  `appearance: none` el botón se ve igual en todos lados y depende solo de nuestro CSS.
- **Movimiento reducido:** con `prefers-reduced-motion`, ninguna transición corre —el
  relleno y el subrayado aparecen de golpe en vez de animados, y los botones no se elevan.
- **Descartado:** un shake/vibración en destructivo (más llamativo para "acción peligrosa"
  pero sumaba una 4ª animación distinta cuando el enunciado pide 3, y hacía más difícil
  de explicar por qué solo ese botón tiembla).

---

## Pendientes de decidir

- Hex de `--superficie` (fondo de header y footer).
- Tipo de transición del carrusel de recomendados.
- Animación de registro exitoso.
- Estilo final del componente `.link` (falta ver la captura de Figma).
- Qué contenido lleva el menú hamburguesa, y cómo unificarlo visualmente con el
  menú de usuario (hoy son muy distintos entre sí).
- Qué va en el panel de marca del splash de login de 2 columnas.
- Qué es la "galería" de la página del juego (falta ver la captura de Figma;
  hoy el tablero y la galería no están construidos todavía).
