# Prisma Schema + Migraciones

## Schema básico

```prisma
model User {
  id       Int      @id @default(autoincrement())
  email    String   @unique
  password String
  roles    String[] @default(["user"])
  orders   Order[]
}

model Product {
  id    Int     @id @default(autoincrement())
  name  String
  price Decimal @db.Decimal(10, 2)
  sku   String  @unique
  items OrderItem[]

  @@index([sku])
}

model Order {
  id        Int         @id @default(autoincrement())
  user      User        @relation(fields: [userId], references: [id])
  userId    Int
  items     OrderItem[]
  status    String      @default("PENDING")
  createdAt DateTime    @default(now())

  @@index([userId])
  @@index([status])
}

model OrderItem {
  id        Int     @id @default(autoincrement())
  order     Order   @relation(fields: [orderId], references: [id])
  orderId   Int
  product   Product @relation(fields: [productId], references: [id])
  productId Int
  quantity  Int
  price     Decimal

  @@index([orderId])
  @@index([productId])
}
```

---

## Tipos clave

- `Decimal`: precios (nunca Float)
- `String[]`: arrays (roles)
- `DateTime`: timestamps
- `@@index([col])`: acelera WHERE/JOIN

---

## Migrations

```bash
npx prisma migrate dev --name init    # crea migración
npx prisma generate                    # regenera cliente
npx prisma studio                      # UI para ver datos
```

---

## Check

- [ ] Tipo para precios? → Decimal
- [ ] Cuándo índice? → Columnas en WHERE frecuente

**Mini-reto**: añade campo `phone` a User y crea migración.
