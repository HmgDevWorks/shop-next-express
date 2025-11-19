# Patrones avanzados en Nest (para después)

**Cuándo leer esto**: después de dominar las guías 1-5. Estos patrones son útiles en producción/equipos grandes, pero complican el aprendizaje inicial.

---

## 1) Repository Pattern

### Qué es

Capa adicional entre Service y Prisma que encapsula acceso a datos.

### Por qué

- Aislar la DB del resto; si cambias de Prisma a TypeORM/raw SQL, solo tocas el repo.
- Testing: mockear repo es más fácil que mockear todo Prisma.
- DDD: los repositorios son parte del patrón Domain-Driven Design.

### Cuándo usar

- Proyectos grandes con múltiples servicios que acceden a la misma entidad.
- Equipos que siguen DDD estricto.
- Necesitas cambiar de ORM sin reescribir services.

### Estructura

```
orders/
├── orders.module.ts
├── orders.controller.ts
├── orders.service.ts
├── orders.repository.ts  # nueva capa
└── dto.ts
```

### Implementación

```ts
// src/orders/orders.repository.ts
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Paginated } from "../shared/types";

interface Order {
  id: number;
  userId: number;
  status: string;
  items: OrderItem[];
}

@Injectable()
export class OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async paginate(
    page: number,
    pageSize: number
  ): Promise<Paginated<Order>> {
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          userId: true,
          status: true,
          items: { select: { productId: true, quantity: true, price: true } },
        },
        orderBy: { id: "desc" },
      }),
      this.prisma.order.count(),
    ]);
    return { items, total, page, pageSize };
  }

  findById(id: number) {
    return this.prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        status: true,
        items: { select: { productId: true, quantity: true, price: true } },
      },
    });
  }

  create(input: { userId: number; items: any[] }) {
    return this.prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: input.items.map((i) => i.productId) } },
        select: { id: true, price: true },
      });
      const priceById: Record<number, number> = Object.fromEntries(
        products.map((p) => [p.id, Number(p.price)])
      );
      return tx.order.create({
        data: {
          userId: input.userId,
          items: {
            create: input.items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              price: priceById[i.productId],
            })),
          },
        },
        select: { id: true, status: true },
      });
    });
  }
}
```

```ts
// src/orders/orders.service.ts (ahora usa repo)
import { Injectable, NotFoundException } from "@nestjs/common";
import { OrdersRepository } from "./orders.repository";

@Injectable()
export class OrdersService {
  constructor(private readonly repo: OrdersRepository) {}

  list(p: { page: number; pageSize: number }) {
    return this.repo.paginate(p.page, p.pageSize);
  }

  async getById(id: number) {
    const order = await this.repo.findById(id);
    if (!order) throw new NotFoundException("Order not found");
    return order;
  }

  create(input: any) {
    return this.repo.create(input);
  }
}
```

### Trade-off

- **Pro**: aislamiento, testeable, DDD-friendly.
- **Contra**: una capa más (complexity), overkill para proyectos pequeños.

---

## 2) CQRS (Command Query Responsibility Segregation)

### Qué es

Separa operaciones de **escritura** (commands) y **lectura** (queries) en clases distintas.

### Por qué

- Escalabilidad: reads y writes pueden usar DBs distintas (read replicas).
- Claridad: cada comando/query tiene una responsabilidad única.

### Cuándo usar

- Sistemas con alta carga de lectura vs escritura desbalanceada.
- Event sourcing o arquitecturas complejas.

### Implementación básica

```bash
npm install @nestjs/cqrs
```

```ts
// src/orders/commands/create-order.command.ts
export class CreateOrderCommand {
  constructor(
    public readonly userId: number,
    public readonly items: any[]
  ) {}
}
```

```ts
// src/orders/commands/create-order.handler.ts
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateOrderCommand } from "./create-order.command";
import { PrismaService } from "../../prisma/prisma.service";

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler
  implements ICommandHandler<CreateOrderCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CreateOrderCommand) {
    // lógica de creación
    return this.prisma.order.create({
      /* ... */
    });
  }
}
```

```ts
// src/orders/orders.service.ts
import { CommandBus } from "@nestjs/cqrs";

@Injectable()
export class OrdersService {
  constructor(private readonly commandBus: CommandBus) {}

  create(input: any) {
    return this.commandBus.execute(
      new CreateOrderCommand(input.userId, input.items)
    );
  }
}
```

### Trade-off

- **Pro**: separación clara, escalable, testeable.
- **Contra**: mucho boilerplate, overkill para CRUDs simples.

---

## 3) Logging estructurado (Winston/Pino)

### Por qué

`console.log` no es suficiente en producción; necesitas niveles (info, warn, error), formato JSON, rotación de archivos.

### Implementación con Winston

```bash
npm install winston nest-winston
```

```ts
// src/common/logger.ts
import { WinstonModule } from "nest-winston";
import * as winston from "winston";

export const winstonConfig = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: winston.format.json(),
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      format: winston.format.json(),
    }),
  ],
});
```

```ts
// main.ts
import { winstonConfig } from "./common/logger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: winstonConfig,
  });
  // ...
}
```

Uso:

```ts
import { Logger } from "@nestjs/common";

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  async create(input: any) {
    this.logger.log(`Creating order for user ${input.userId}`);
    // ...
  }
}
```

---

## 4) Rotación de Refresh Tokens (seguridad)

### Implementación

Guarda refresh tokens hasheados en DB; bórralos al usarlos (rotación).

```prisma
model User {
  id                 Int       @id @default(autoincrement())
  email              String    @unique
  password           String?
  refreshTokenHash   String?
  refreshTokenExpiry DateTime?
  // ...
}
```

```ts
// src/auth/auth.service.ts
async saveRefreshToken(userId: number, token: string) {
  const hash = await bcrypt.hash(token, 10);
  await this.prisma.user.update({
    where: { id: userId },
    data: {
      refreshTokenHash: hash,
      refreshTokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
}

async validateRefreshToken(
  userId: number,
  token: string
): Promise<boolean> {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: { refreshTokenHash: true, refreshTokenExpiry: true },
  });
  if (
    !user?.refreshTokenHash ||
    !user.refreshTokenExpiry ||
    user.refreshTokenExpiry < new Date()
  )
    return false;
  return bcrypt.compare(token, user.refreshTokenHash);
}

async revokeRefreshToken(userId: number) {
  await this.prisma.user.update({
    where: { id: userId },
    data: { refreshTokenHash: null, refreshTokenExpiry: null },
  });
}
```

En `refresh()`:

```ts
const isValid = await this.validateRefreshToken(decoded.sub, refreshToken);
if (!isValid) throw new UnauthorizedException("Invalid refresh token");

const newRefreshToken = this.signRefreshToken({ sub: user.id });
await this.saveRefreshToken(user.id, newRefreshToken);
```

---

## 5) Event-driven architecture (eventos internos)

### Por qué

Desacoplar lógica: cuando creas un order, emites `OrderCreatedEvent` y otros módulos reaccionan (enviar email, actualizar stock).

### Implementación

```bash
npm install @nestjs/event-emitter
```

```ts
// app.module.ts
import { EventEmitterModule } from "@nestjs/event-emitter";

@Module({
  imports: [EventEmitterModule.forRoot()],
})
export class AppModule {}
```

```ts
// src/orders/events/order-created.event.ts
export class OrderCreatedEvent {
  constructor(
    public readonly orderId: number,
    public readonly userId: number
  ) {}
}
```

```ts
// src/orders/orders.service.ts
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async create(input: any) {
    const order = await this.prisma.order.create({
      /* ... */
    });
    this.eventEmitter.emit(
      "order.created",
      new OrderCreatedEvent(order.id, input.userId)
    );
    return order;
  }
}
```

```ts
// src/notifications/notifications.service.ts
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class NotificationsService {
  @OnEvent("order.created")
  async handleOrderCreated(event: OrderCreatedEvent) {
    // enviar email, notificación push, etc.
    console.log(`Sending email for order ${event.orderId}`);
  }
}
```

---

## 6) Rate limiting (Throttler)

```bash
npm install @nestjs/throttler
```

```ts
// app.module.ts
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";

@Module({
  imports: [ThrottlerModule.forRoot([{ ttl: 60, limit: 100 }])],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
```

Customizar por endpoint:

```ts
import { Throttle } from "@nestjs/throttler";

@Throttle({ default: { limit: 5, ttl: 60 } })
@Post("login")
login(@Body() body: any) {
  /* ... */
}
```

---

## 7) Feature flags

```ts
// src/common/feature-flags.service.ts
@Injectable()
export class FeatureFlagsService {
  private flags: Record<string, boolean> = {
    newCheckout: process.env.FEATURE_NEW_CHECKOUT === "true",
    betaFeatures: process.env.FEATURE_BETA === "true",
  };

  isEnabled(flag: string): boolean {
    return this.flags[flag] ?? false;
  }
}
```

Uso:

```ts
if (this.featureFlags.isEnabled("newCheckout")) {
  // nueva lógica
} else {
  // lógica antigua
}
```

---

## 8) Cuándo usar cada patrón

| Patrón              | Proyecto pequeño | Proyecto mediano | Proyecto grande/empresa |
| ------------------- | ---------------- | ---------------- | ----------------------- |
| Repository          | ❌ overkill       | ⚠️  opcional      | ✅ recomendado          |
| CQRS                | ❌ overkill       | ❌ overkill       | ✅ si hay carga alta    |
| Logging estructurado| ⚠️  opcional      | ✅ recomendado    | ✅ obligatorio          |
| Event-driven        | ❌ overkill       | ⚠️  si desacoplas | ✅ recomendado          |
| Rate limiting       | ⚠️  auth endpoints| ✅ todos los endpoints | ✅ + WAF externo   |

---

## Resumen

- **Repository**: úsalo cuando el proyecto crece o sigues DDD.
- **CQRS**: solo si tienes desbalance read/write o event sourcing.
- **Logging**: Winston/Pino desde el principio en producción.
- **Refresh rotación**: seguridad extra; implementa si manejas datos sensibles.
- **Eventos**: desacopla módulos; útil cuando creces.
- **Rate limiting**: básico en auth, global en producción.

**Para entrevista**: menciona que conoces estos patrones pero que empiezas simple (Service → Prisma directo) y añades capas según necesidad.

