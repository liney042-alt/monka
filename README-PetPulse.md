# PetPulse — paquete del proyecto

Este paquete contiene el código fuente actual del prototipo y los documentos para continuar su implementación con Claude Pro.

## Archivos de orientación

- `docs/PetPulse-Documento-Maestro.md` — intención, alcance, funcionalidades, requisitos y etapas de implementación.
- `docs/PetPulse-Prompt-Claude-Pro.md` — prompt de seguimiento listo para copiar en Claude Pro.
- `docs/deployment/PetPulse-Despliegue-Portatil.md` — guía para recrear la web en Vercel, la API en Render y PostgreSQL en Supabase.
- `artifacts/pet-pulse/` — interfaz web del prototipo.
- `artifacts/api-server/` y `lib/db/` — API, autenticación, permisos y persistencia reales.

## Estado del prototipo

PetPulse conserva una demostración interactiva con datos ficticios en el navegador y una base real de cuentas, roles y persistencia de mascotas y proveedores. El directorio, las citas, el mapa/GPS, las notificaciones y otros flujos de producción siguen pendientes. Consulta el Documento Maestro y la guía de despliegue antes de tratar una interacción de demostración como una capacidad real.

## Tecnologías

- Web: React, TypeScript/TSX, Vite, CSS/Tailwind CSS 4, Wouter y Lucide React.
- API: Node.js, TypeScript, Express 5, Clerk y contratos OpenAPI con cliente generado.
- Datos: PostgreSQL, Drizzle ORM y migraciones SQL.
- Workspace/deployment: pnpm monorepo; manifiestos para Vercel, Render y Supabase.

## Ejecución en el workspace

Desde la raíz del workspace, con pnpm instalado:

```bash
pnpm install
pnpm --filter @workspace/pet-pulse run dev
```

Las instrucciones de despliegue portátil están en `docs/deployment/PetPulse-Despliegue-Portatil.md`; las instrucciones del entorno Replit están en `replit.md`. No se incluyen dependencias instaladas, `.git`, archivos de secretos ni herramientas internas del agente.
