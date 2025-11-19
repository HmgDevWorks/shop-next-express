# Docker + Postgres

## docker-compose.yml

```yaml
version: "3.9"
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: shop
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  db_data:
```

---

## Comandos

```bash
docker-compose up -d           # levantar
docker-compose logs -f db      # logs
docker-compose down            # detener
docker exec -it <container> psql -U postgres -d shop  # entrar a psql
```

---

## Prisma

```bash
npx prisma migrate dev --name init
npx prisma generate
npx prisma studio
```

---

## Check

- [ ] Levantar DB? → docker-compose up -d
- [ ] Aplicar migrations? → npx prisma migrate dev

**Mini-reto**: levanta Postgres + Redis, aplica migrations, seed con 3 productos.
