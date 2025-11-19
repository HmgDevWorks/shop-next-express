# Prisma — Repositorios, transacciones, paginación e índices

Explicaciones en español; términos/snippets en inglés.

## 1) Patrón Repository

- Aísla Prisma del resto de la app
- Facilita test/mocks y cambios de almacenamiento

```ts
// src/db/prisma.ts
import { PrismaClient } from "@prisma/client";
export const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") (globalThis as any).prisma = prisma;
```

```ts
// src/orders/orders.repository.ts
import { Injectable } from "@nestjs/common";
import { prisma } from "../db/prisma";

@Injectable()
export class OrdersRepository {
  async paginate(page: number, pageSize: number) {
    const [items, total] = await Promise.all([
      prisma.order.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          status: true,
          userId: true,
          items: { select: { productId: true, quantity: true } },
        },
        orderBy: { id: "desc" },
      }),
      prisma.order.count(),
    ]);
    return { items, total, page, pageSize };
  }

  findById(id: number) {
    return prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        userId: true,
        items: { select: { productId: true, quantity: true, price: true } },
      },
    });
  }

  async create(input: {
    userId: number;
    items: { productId: number; quantity: number }[];
  }) {
    return prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: input.items.map((i) => i.productId) } },
        select: { id: true, price: true },
      });
      const priceById = new Map(products.map((p) => [p.id, p.price]));
      return tx.order.create({
        data: {
          userId: input.userId,
          items: {
            create: input.items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              price: priceById.get(i.productId)!,
            })),
          },
        },
        select: { id: true },
      });
    });
  }
}
```

## 2) Transacciones

- Usa `$transaction` para operaciones atómicas
- Considera bloqueos y consistencia según el caso

## 3) Paginación estable y cursores

- Offset: simple (`skip/take`); puede degradar con tablas grandes
- Cursor: estable (`cursor`, `take`, `orderBy`) mejor para listas infinitas

```ts
await prisma.order.findMany({
  cursor: { id: lastId },
  take: 20,
  orderBy: { id: "desc" },
  select: { id: true, status: true },
});
```

## 4) Índices y performance

- Crea índices para filtros frecuentes (`userId`, `productId`)
- Evita N+1 usando `select/include` correctos o DataLoader si aplica

## 5) Mini‑reto

- Implementa paginación por cursor para `/orders` y añade tests unit para el repositorio (mock de Prisma).
