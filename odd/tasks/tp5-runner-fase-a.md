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
- [ ] T1b. `tp5/runner.html` mínima (header, footer, #game vacío).
- [ ] T2. `docs/tp5-contrato.md`.
- [ ] T3. Base: config, loop (rAF + dt con tope), input, main (precarga, pantallas inicio/selector), player (gravedad, impulso, rotación, techo/suelo), runner.css.
- [ ] T4. Parallax 4 capas desde una velocidad base; suelo factor 1.
- [ ] T5. Spawner + obstáculos + colisión AABB + debug H + puntaje + borrado.
- [ ] T6. Drone, coleccionable, vidas/modos, invulnerabilidad, victoria/derrota, pausa, HUD.
- [ ] T7. Cierre: docs/tp5-estado.md, línea en CLAUDE.md, tp5/DECISIONES.md, resumen para la defensa.

## Progreso
- T1a hecho. Siguiente: T1b–T6 delegadas a un writer (trigger: 2+ archivos no triviales).
