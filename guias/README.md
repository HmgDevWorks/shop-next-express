# Guías de Next.js + Nest.js (TypeScript) para entrevistas y proyectos

Estas guías están pensadas para acelerar tu preparación como Full‑Stack (Next + Nest) con foco en entrevistas técnicas (live‑coding) y buenas prácticas de producción. Explicaciones en español; términos y snippets en inglés.

## Cómo usar estas guías

- Lee en este orden recomendado y ejecuta los mini‑retos al final de cada guía.
- Mantén el repo corriendo con Docker para Postgres cuando practiques Prisma.
- Copia los snippets dentro de `backend/` (Nest/Express) y `frontend/` (Next) según corresponda.
- Si vienes de Express, compara patrones Express → Nest en las secciones indicadas.

## Orden recomendado (4–7 días)

1. `0-roadmap.md` — visión general de la semana y checklist
2. `typescript-avanzado.md` — TS práctico para Nest/Next
3. `nest/1-fundamentos.md` — módulos, controllers, providers, CRUD `orders`
4. `nest/2-pipes-guards-interceptors.md` — validación Zod, JWT Guard, Roles
5. `nest/3-auth-jwt-refresh-rbac.md` — login, refresh, RBAC
6. `nest/4-error-handling-filters.md` — excepciones y filtro global
7. `nest/5-testing.md` — unit (services) y e2e (Supertest)
8. `nest/6-patrones-avanzados.md` — Repository, CQRS, logging (para después)
9. `prisma/1-schema-relaciones-migraciones.md` — schema e‑commerce
10. `prisma/2-queries-transacciones-paginacion.md` — queries, tx, paginación
11. `next/1-app-router-server-client.md` — Server/Client Components
12. `next/2-server-actions-rsc-caching.md` — Server Actions y caching por tags
13. `next/3-auth-nextauth-middleware.md` — NextAuth y middleware de protección
14. `caching-redis.md` — cache con Redis `getOrSet` e invalidación
15. `performance-seguridad.md` — helmet, cors, rate limit, N+1
16. `docker-postgres.md` — compose, .env, healthcheck
17. `live-coding-katas.md` — ejercicios guiados 15–30 min
18. `preguntas-entrevista.md` — banco de preguntas/respuestas

## Convenciones y expectativas

- Snippets autocontenidos y con rutas claras. Comentarios concisos.
- Validación con Zod (puedes usar class‑validator si prefieres, aquí se prioriza Zod).
- **Nest básico (guías 1-5)**: Services llaman Prisma directo (sin Repository).
- **Patrones avanzados (guía 6)**: Repository, CQRS, logging estructurado (para después).
- Prisma con `$transaction` para operaciones compuestas (Order + OrderItems).
- Next App Router: preferir Server Components y Server Actions cuando aplique.
- Seguridad mínima en backend: helmet, cors, rate‑limit, JWT con refresh rotado.

## Requisitos previos

- Node >= 18, PNPM/NPM
- Docker y Docker Compose
- PostgreSQL (vía Docker)

## Íconos y notas

- "Check yourself": preguntas cortas para verificar comprensión
- "Mini‑reto": pequeña tarea con criterios de aceptación
- "Express → Nest": comparación rápida para migrar mentalmente

---

¿Dudas o mejoras? Abre un issue en tu repo o anota TODOs en cada guía.
