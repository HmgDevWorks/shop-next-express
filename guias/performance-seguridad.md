# Performance + Seguridad

## Seguridad

```ts
// main.ts
import helmet from "helmet";

app.use(helmet());                    // headers seguros
app.enableCors({ origin: [...] });   // CORS mínimo

// Validation
@UsePipes(new ZodValidationPipe(schema))

// Passwords
await bcrypt.hash(password, 10);

// Rate limit
import { ThrottlerModule } from "@nestjs/throttler";
@Module({
  imports: [ThrottlerModule.forRoot([{ ttl: 60, limit: 100 }])],
})
```

---

## Performance

```ts
// Índices
@@index([userId])
@@index([status])

// Select mínimo
select: { id: true, email: true }

// Paginación
skip/take o cursor

// Cache
CacheService.getOrSet(key, 60, compute)

// No N+1
include: { user: true }
```

---

## Check

- [ ] Qué hace helmet? → Headers seguros
- [ ] Evitar N+1? → Include en vez de loop

**Mini-reto**: índices en Order (userId, status) + cache /products 60s.
