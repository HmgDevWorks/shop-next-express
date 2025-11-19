# Live-coding Katas

## 1) CRUD Orders (20 min)

- `GET /orders?page=1&pageSize=20` → paginación
- `GET /orders/:id` → detalle con items + user email
- Service → Prisma directo
- ParseIntPipe para params
- 404 si no existe

---

## 2) POST /orders con Zod (25 min)

- Valida `{ userId, items: [{ productId, quantity }] }`
- Zod rechaza items vacío
- Transacción: crea order + items
- Calcula price desde product.price
- 201 con `{ id }`

---

## 3) Auth JWT (30 min)

- `POST /auth/login` → accessToken + refreshToken
- `JwtStrategy` + `JwtAuthGuard`
- Protege `POST /orders` con guard + roles
- 401 sin token, 403 sin rol

---

## 4) Server Action + revalidate (20 min)

- Form crear categoría
- Server Action con Zod
- revalidateTag tras crear
- Página lista categorías (cache por tag)

---

## 5) Cache Redis (25 min)

- Cache `GET /products` 60s
- Miss → DB → guarda cache
- Hit → devuelve cache
- Invalida tras `POST /products`

---

## Tips entrevista

- Lee criterios primero
- Valida inputs siempre (Zod)
- Tipos explícitos (no `any`)
- Piensa en voz alta
- Menciona trade-offs
