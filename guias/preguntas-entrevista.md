# Preguntas de entrevista

## Nest

**Diferencia Controller vs Service?**
→ Controller maneja HTTP, service tiene lógica + Prisma.

**Qué es DI?**
→ Nest inyecta deps por constructor (no haces `new`).

**Pipe vs Guard?**
→ Pipe valida input, Guard verifica auth/roles.

**Orden ejecución?**
→ Guards → Pipes → Handler.

---

## Auth

**Access vs refresh token?**
→ Access corto (15m), refresh largo (7d).

**Por qué 2 secretos?**
→ Limita daño si comprometen uno.

**Proteger endpoint admin?**
→ `@UseGuards(JwtAuthGuard, new RolesGuard(["admin"]))`.

---

## Prisma

**Cuándo transacción?**
→ Múltiples tablas relacionadas (Order + Items).

**Evitar N+1?**
→ `include` en vez de queries en loop.

**Select vs include?**
→ Select campos, include relaciones.

**Tipo para precios?**
→ Decimal (no Float).

---

## Next

**Server vs Client Component?**
→ Server sin JS cliente, Client interactivo.

**Cuándo "use client"?**
→ Estado/efectos/eventos.

**Qué es Server Action?**
→ Función async "use server" invocable desde UI.

**revalidateTag?**
→ Invalida cache por tag.

---

## Seguridad

**3 medidas básicas?**
→ Helmet, validación Zod, rate limiting.

**Prevenir SQL injection?**
→ Prisma sanitiza automáticamente.

---

## Testing

**Unit vs E2E?**
→ Unit mockea deps, E2E testea HTTP + DB.

**Mockear Prisma?**
→ `{ order: { findMany: jest.fn() } } as any`.

---

## Docker

**Levantar Postgres?**
→ `docker-compose up -d`.

**Aplicar migrations?**
→ `npx prisma migrate dev`.

---

## Tips entrevista

- Dibuja flujos (login → JWT → guard → handler)
- Menciona trade-offs ("X es más simple, Y escala mejor")
- Code-thinking (explica mientras escribes)
- Admite desconocimiento honesto
- Pregunta contexto antes de responder
