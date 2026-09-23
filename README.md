# Warden Games

Página web de mini juegos — Trabajo práctico de Interfaces de Usuario (TUDAI — UNICEN).
Grupo 24: Agustín Muzi y Francisco Fernández.

## Estructura del proyecto

```
/index.html              → landing mínima que linkea al TP1 y al TP2
/tpe1/index.html         → entrega del TPE1 (prototipo navegable + Figma)
/assets/                 → banners de juegos usados en el TPE1
/tp2/
  index.html             → Home (incluye el loading simulado)
  login.html             → Login / Registro
  juego.html             → Página del juego (Peg Solitaire)
  css/
    variables.css        → design tokens de Figma: colores, tipografía, espaciados, radios
    base.css             → reset y estilos globales
    components.css       → botones (con hovers), cards, header, inputs
    home.css
    login.css
    juego.css
  js/
    loading.js
    carousel.js
    api.js                → fetch a la API de la cátedra (api-vj-interfaces)
    home.js
    login.js
    juego.js
  assets/img/
```

HTML5, CSS3 y JS vanilla — sin frameworks ni Bootstrap. Rutas relativas en
todo el TP2 para que funcione correctamente en GitHub Pages dentro de `/tp2/`.

## Flujo de branches

- `main` — rama de integración. Todo el trabajo termina acá.
- `agus`, `fran` — ramas personales de cada integrante.
- `gh-pages` — rama que sirve GitHub Pages (se actualiza desde `main`).

**Antes de arrancar a trabajar:**
```
git checkout <tu-branch>
git pull origin main
```

**Cuando algo funciona:** abrir un PR a `main` (o mergear directo), idealmente
una vez por día para evitar conflictos grandes.

**Deploy a GitHub Pages:** actualizar `gh-pages` desde `main`:
```
git push origin main:gh-pages
```

GitHub Pages debe estar configurado en **Settings > Pages** con:
- Source: `Deploy from a branch`
- Branch: `gh-pages` / `/ (root)`

## Entrega

TPE2 — vence el 30/09. Se entrega desde el branch `gh-pages`.
