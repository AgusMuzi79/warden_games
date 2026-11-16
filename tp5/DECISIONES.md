# Decisiones de diseño e implementación — Warden (TPE5: Neon Rider)

Acá se documenta todo lo de la entrega TPE5 (`tp5/`): un runner horizontal tipo
Flappy Bird ("Neon Rider"), hecho con DOM, CSS y JS (sin canvas). `tp5/` es una
copia de `tp4/`. Las decisiones de las entregas anteriores siguen en su lugar:
TPE1 y TPE2 en `../tp2/DECISIONES.md`, TPE3 (Blocka) en `../tp3/DECISIONES.md` y
TPE4 (Peg en canvas) en `../tp4/DECISIONES.md`.
Cada decisión: **qué** hicimos, **por qué**, y qué **alternativa** descartamos.

El detalle de la implementación (fases, contrato DOM, valores de config) está en
`../docs/tp5-estado.md` y `../docs/tp5-contrato.md`.

---

## Organización

### Este archivo es solo del TPE5
- **Qué:** `tp5/DECISIONES.md` arranca vacío en vez de copiar el de `tp4/`.
- **Por qué:** el de `tp4/` ya pesa unos 47 KB; copiarlo duplicaba todo y hacía
  difícil encontrar lo nuevo.
- **Descartado:** seguir sumando entradas al archivo copiado.

### Sin JetBrains Mono
- **Qué:** los números del HUD van en Roboto Flex con `font-variant-numeric:
  tabular-nums`, no en JetBrains Mono.
- **Por qué:** decisión de Agus, igual que en el TPE4: solo se usan las fuentes
  del sitio (Orbitron en títulos, Roboto Flex en el resto).
