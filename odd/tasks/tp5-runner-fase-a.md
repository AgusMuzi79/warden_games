# TP5 Runner — Fase A (lógica jugable)

Locator: `odd/tasks/tp5-runner-fase-a.md` · Engram: `odd/tp5-runner-fase-a/tasks`

## Objetivo
Runner horizontal tipo Flappy ("Neon Rider") en `tp5/`, DOM + CSS + JS (sin canvas),
jugable de punta a punta en Fácil/Normal/Difícil, con vista mínima. La vista pulida y
la integración web son Fase B (Fran). Prompt completo: `docs/prompt-tp5-runner.md`.

## Decisiones (aprobadas por Agus, 2026-11-16)
- `tp5/DECISIONES.md` propio y corto (no la copia de 47 KB de tp4).
- Sin JetBrains Mono: HUD en Roboto Flex con tabular-nums.
- ES modules permitidos (la regla "sin type=module" era de otra entrega).
- Trabajo en tareas chicas, un commit en `agus` por tarea (Conventional Commits, en español, sin co-author).
- Área de juego 960×540; capas del pack escaladas x2 (448 px) + suelo CSS.

## Tareas
- [x] T1a. Copiar tp4/ a tp5/ (no pisa assets/game/); DECISIONES.md nuevo. Ruta: inline (mecánico).
- [x] T1b. `tp5/runner.html` mínima (header, footer, #game vacío). Evidencia: head/header/footer copiados de juego.html; carga runner.css al final.
- [x] T2. `docs/tp5-contrato.md`. Evidencia: estructura, quién escribe qué, clases de estado con duración, pantallas, HUD y entrada.
- [x] T3. Base: config, loop (rAF + dt con tope), input, main (precarga, pantallas inicio/selector), player (gravedad, impulso, rotación, techo/suelo), runner.css. Evidencia: node --check ok en los 7 módulos; en Chrome (localhost:8085) carga → selector → la moto cae, choca el suelo (explosión .is-hit) y aparece #screen-lose con el foco en Reintentar. Suma game.js (orquesta update/render) y preload.js.
- [x] T4. Parallax 4 capas desde una velocidad base; suelo factor 1. Evidencia: transforms medidos en Chrome -10/-29/-57/-(95 mod 64) px = 0,1/0,3/0,6/1 x 95 px recorridos. Se sumó `<meta name="darkreader-lock">`: la extensión Dark Reader invertía los PNG.
- [x] T5. Spawner + obstáculos + colisión AABB + debug H + puntaje + borrado. Evidencia: prueba en Node del spawner (2000 pares x 3 modos: 0 violaciones de salto ±150, márgenes y separación 280–420; hueco 220→180→130 Normal, 190→130 Difícil) y de seTocan; en Chrome con piloto automático: puntaje sube, hitboxes con H, nunca más de 3 `.obstacle` en el DOM. Bug corregido: url() en variable CSS se resolvía contra css/ → se pasa a URL absoluta.
- [ ] T6. Drone, coleccionable, vidas/modos, invulnerabilidad, victoria/derrota, pausa, HUD.
- [ ] T7. Cierre: docs/tp5-estado.md, línea en CLAUDE.md, tp5/DECISIONES.md, resumen para la defensa.

## Progreso
- T1a hecho. Siguiente: T1b–T6 delegadas a un writer (trigger: 2+ archivos no triviales).
