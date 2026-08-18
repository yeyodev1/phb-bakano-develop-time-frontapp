# PHB Develop Time — Panel

Panel de solicitudes, horas y métricas del equipo de tecnología.
**PowerHouse Biotech × Bakano**

- Producción: https://desarrollo.powerhousebiotech.com
- API: https://api-desarrollo.powerhousebiotech.com

## Stack

Vue 3 · Vite · TypeScript · Pinia · vue-router · SCSS · Font Awesome

## Desarrollo

```bash
pnpm install
cp .env.example .env
pnpm dev      # http://localhost:5173
pnpm build    # verificación estándar (vue-tsc + vite build)
```

## Convenciones

- **Mobile-first** y **solo flexbox** — nada de CSS Grid
- Tokens y mixins de `src/styles/index.scss` inyectados globalmente por Vite:
  no re-importar variables en componentes
- Paleta monocroma, acento blanco, iconos Font Awesome

## Despliegue

Automático: cada push a `main` despliega a producción en Vercel.
