# TP5 Neon Rider — Modo Infinito con récords arcade

Locator: `odd/tasks/tp5-modo-infinito-records.md` · Engram: `odd/tp5-modo-infinito-records/tasks`

## Objetivo
El modo Difícil pasa a ser **Infinito**: 1 vida, sin meta de puntaje (no hay victoria), la
partida termina al chocar. Los puntajes se guardan en una tabla de récords tipo arcade,
con iniciales de 3 letras.

## Decisiones (Agus, 2026-11-18)
- Infinito reemplaza a Difícil (no se suma un 4.º modo). 1 vida.
- Iniciales de 3 letras, A–Z, como en las máquinas arcade.

## Decisiones por defecto (del orquestador; avisar a Agus)
- Top 10 en `localStorage` (`warden-neon-rider-records`), ordenado de mayor a menor; en
  empate queda primero el más viejo. Fácil y Normal no guardan récords.
- Entrada arcade: ↑/↓ cambian la letra, ←/→ cambian de casilla, tipear una letra la pone
  y avanza, Enter guarda. También con mouse (flechas por casilla y botón Guardar).
- Las últimas iniciales usadas quedan de valor inicial.
- Se pide el nombre solo si el puntaje entra en el top 10 (y es > 0).

## Tareas
- [x] T1. Modo Infinito: config, sin victoria, HUD sin barra de progreso, textos de la página.
- [x] T2. Récords: módulo puro de tabla, pantalla de iniciales, tabla en el game over de
  Infinito y botón Récords en el inicio.
- [x] T3. Docs: `tp5/DECISIONES.md`, `docs/tp5-contrato.md`, `docs/tp5-estado.md`.

Ruta: delegado (writer único) — trigger: 2+ archivos no triviales (config, game, main,
input, html, css, módulo nuevo).

## Verificación
- `node --check` de todos los módulos tocados.
- Script de Node sobre el módulo de récords (insertar, ordenar, top 10, empate, > 0).
- Chrome (orquestador): partida Infinito → choque → iniciales → tabla persistida tras recargar.

## Progreso
- Creado el documento.
- T1 hecho: commit 59c8398 (`feat(tp5): modo Infinito reemplaza a Difícil`).
- T2 hecho: commit f2d8554 (`feat(tp5): récords arcade con iniciales en el modo Infinito`).
- T3 hecho: commit de docs (ver `git log`), con este documento.
- Verificado: `node --check` de los módulos tocados y script de Node sobre `records.js` (orden, top 10, empate, puntaje 0, JSON roto, storage que falla): OK.
- Pendiente: prueba en Chrome (orquestador) y rehacer la captura `inicio.jpg` (muestra "Difícil").
