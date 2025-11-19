# Prisma Queries + Transacciones

## Queries básicas

```ts
// Lista
const orders = await prisma.order.findMany({
  where: { userId: 1 },
  orderBy: { id: "desc" },
  take: 20,
  skip: 0,
});

// Por ID
const order = await prisma.order.findUnique({ where: { id: 1 } });

// Crear
const user = await prisma.user.create({
  data: { email: "u@ex.com", name: "User", password: "hash" },
});

// Actualizar
await prisma.order.update({
  where: { id: 1 },
  data: { status: "PAID" },
});
```

---

## Select (performance)

```ts
// ❌ Trae todo (incluye password)
const users = await prisma.user.findMany();

// ✅ Solo necesario
const users = await prisma.user.findMany({
  select: { id: true, email: true, name: true },
});
```

---

## Include (relaciones)

```ts
const order = await prisma.order.findUnique({
  where: { id: 1 },
  include: {
    items: { select: { productId: true, quantity: true, price: true } },
    user: { select: { id: true, email: true } },
  },
});
```

---

## Transacciones

```ts
await prisma.$transaction(async (tx) => {
  const products = await tx.product.findMany({
    where: { id: { in: [1, 2] } },
    select: { id: true, price: true },
  });

  const order = await tx.order.create({
    data: {
      userId: 1,
      items: {
        create: [{ productId: 1, quantity: 2, price: products[0].price }],
      },
    },
  });

  await tx.product.update({
    where: { id: 1 },
    data: { stock: { decrement: 2 } },
  });

  return order;
});
```

**Por qué**: atomicidad (si falla algo, todo rollback).

---

## Paginación

```ts
const [items, total] = await Promise.all([
  prisma.order.findMany({ skip: (page - 1) * pageSize, take: pageSize }),
  prisma.order.count(),
]);
return { items, total, page, pageSize };
```

---

## Check

- [ ] Select vs include? → Select campos, include relaciones
- [ ] Cuándo transacción? → Múltiples tablas relacionadas
- [ ] Evitar N+1? → Include en vez de queries en loop

**Mini-reto**: implementa `getOrderWithDetails(id)` con items + product name + user email usando include/select.
