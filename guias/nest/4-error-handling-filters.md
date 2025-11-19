# Error Handling

## Exception Filter global

Mapea errores a respuestas HTTP.

```ts
// global-exception.filter.ts
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse();
    const req = host.switchToHttp().getRequest();

    if (exception instanceof HttpException) {
      return res.status(exception.getStatus()).json({
        statusCode: exception.getStatus(),
        message: exception.message,
      });
    }

    console.error(exception);
    return res.status(500).json({ statusCode: 500, message: "Internal error" });
  }
}

// main.ts
app.useGlobalFilters(new GlobalExceptionFilter());
```

---

## Uso en services

```ts
async getById(id: number) {
  const order = await this.prisma.order.findUnique({ where: { id } });
  if (!order) throw new NotFoundException("Order not found");
  return order;
}
```

**Nest convierte** `NotFoundException` → 404 HTTP automáticamente.

---

## Check

- [ ] Dónde mapeas errores? → Filter global
- [ ] Qué lanzar si no existe? → NotFoundException

**Mini-reto**: añade `requestId` (UUID) a respuestas de error.
