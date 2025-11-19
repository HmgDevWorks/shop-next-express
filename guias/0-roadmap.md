# Roadmap intensivo (4–7 días)

Guía de estudio enfocada a entrevista (live‑coding) y prácticas de producción con Next.js + Nest.js + Prisma. Ajusta horas según tu disponibilidad.

## Día 1 — TypeScript + Nest Fundamentals

- Repasar TS práctico: narrowing, generics, utility types, Result pattern
- Nest: módulos, controllers, providers (DI)
- CRUD básico `orders` (listar y `getById`)
- Mini‑reto: endpoint con paginación estable y validación

Checklist:

- [ ] Entiendes diferencia interface vs type y cuándo usar cada uno
- [ ] Puedes crear `OrdersModule` con controller y service
- [ ] Sabes inyectar un provider en Nest

## Día 2 — Validación + Auth + Guards/Interceptors

- Zod Pipe para validar `Body`, `Params`, `Query`
- JWT Auth: login, guard, roles (RBAC)
- Interceptor de logging y mapping de respuesta
- Mini‑reto: `POST /orders` con validación e IDs correctos

Checklist:

- [ ] Puedes montar `JwtStrategy` y `JwtAuthGuard`
- [ ] RolesGuard básico con lista de roles
- [ ] Interceptor que mide duración y loggea

## Día 3 — Prisma + PostgreSQL

- Schema e‑commerce, relaciones, migraciones
- Repository pattern, `$transaction` para crear `Order`+`OrderItems`
- Paginación, filtros por `userId`, índices
- Mini‑reto: `OrderRepository.create()` calcula precio desde `Product`

Checklist:

- [ ] Ejecutas `migrate dev` y `generate`
- [ ] Conoces `select`/`include` y cuándo usarlos
- [ ] Usas índices para consultas frecuentes

## Día 4 — Next App Router + Server Actions

- Server vs Client Components; patrón de datos
- Server Actions: mutaciones y `revalidateTag`
- Middleware de protección (redirecciones)
- Mini‑reto: página `/orders` (list + create + revalidate)

Checklist:

- [ ] Diferencias RSC vs Client claras
- [ ] Sabes usar `fetch({ next: { tags, revalidate } })`
- [ ] Implementas una Server Action con `revalidateTag`

## Día 5 — Testing

- Unit (Jest) para servicios Nest
- E2E API con Supertest y `TestingModule`
- Seeds y limpieza entre tests
- Mini‑reto: test e2e `GET /orders` (200, shape de respuesta)

Checklist:

- [ ] Sabes mockear repos con Jest
- [ ] Puedes levantar `INestApplication` para e2e
- [ ] Aíslas datos de test

## Día 6 — Caching/Performance/Seguridad

- Redis cache `getOrSet`, TTLs y claves
- Rate limiting, helmet, CORS mínimo
- Anti N+1, `select` estricto, consultas estables
- Mini‑reto: cache para lista de `products` con invalidación simple

Checklist:

- [ ] Integras IORedis como provider
- [ ] Decides TTLs según endpoint
- [ ] Detectas N+1 y lo corriges

## Día 7 — Repaso + Katas + Q&A

- 2 katas backend + 1 kata Next
- Banco de preguntas/respuestas
- Revisión de puntos flojos

Checklist:

- [ ] Dominas flujo JWT + Refresh + RBAC
- [ ] Controlas transacciones Prisma
- [ ] Entiendes Server Actions y caching por tags

---

Siguientes pasos: continúa con `typescript-avanzado.md` y luego `nest/1-fundamentos.md`. Ajusta el orden si tu entrevista prioriza backend o frontend.
