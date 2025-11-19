# Nest.js — Fundamentos (módulos, controllers, providers)

## ¿Qué problema resuelve Nest?

Imagina que estás construyendo una API con Express puro. Al principio es simple:

```js
// Express básico
app.get("/orders", (req, res) => {
  // validar params
  // consultar DB
  // formatear respuesta
  res.json({ orders: [] });
});
```

Funciona, pero cuando crece el proyecto enfrentas:

1. **Sin estructura clara**: ¿dónde va la lógica de negocio? ¿Validación? ¿Auth?
2. **Código duplicado**: validas lo mismo en 10 endpoints.
3. **Testing difícil**: ¿cómo testeas un handler que hace fetch, valida, guarda en DB?
4. **No hay DI nativa**: importas servicios manualmente, difícil mockear.

**Nest resuelve esto con**:

- **Arquitectura opinada**: módulos por dominio (orders, products, users).
- **Dependency Injection**: no haces `new Service()`; Nest lo inyecta automáticamente.
- **Decorators**: `@Get()`, `@Post()`, `@Body()` → código declarativo.
- **Ecosistema**: Pipes (validación), Guards (auth), Interceptors (logging), Filters (errores) → separación de responsabilidades.

**Trade-off**: más estructura y reglas → menos libertad que Express puro. Pero escala mejor en equipos.

---

## Conceptos fundamentales

### 1) Module — El contenedor

**Qué es**: un módulo agrupa todo lo relacionado con una feature o dominio (controllers, services, providers).

**Analogía**: piensa en un módulo como un **paquete independiente** de tu app. El módulo `OrdersModule` contiene todo lo de orders: el controller que expone endpoints, el service con lógica de negocio, etc.

**Por qué existen**:

- **Modularidad**: cada dominio (`orders`, `products`, `auth`) vive aislado.
- **Reutilización**: otros módulos pueden importar servicios exportados.
- **Lazy loading**: en apps muy grandes, puedes cargar módulos bajo demanda.

**Cuándo crear uno**:

- Un módulo por dominio de negocio (`orders`, `products`).
- Un módulo por capa técnica compartida (`auth`, `common`, `database`).

**Estructura básica**:

```ts
// src/orders/orders.module.ts
import { Module } from "@nestjs/common";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";

@Module({
  imports: [], // módulos que este módulo necesita
  controllers: [OrdersController], // controllers que exponen endpoints
  providers: [OrdersService], // servicios/providers disponibles en este módulo
  exports: [OrdersService], // servicios que otros módulos pueden importar
})
export class OrdersModule {}
```

**Explicación línea por línea**:

- `imports`: si `OrdersModule` necesita `PrismaModule`, lo importas aquí.
- `controllers`: clases que definen rutas HTTP (`@Get`, `@Post`).
- `providers`: servicios inyectables; solo visibles dentro de este módulo (salvo que los exportes).
- `exports`: permite que otros módulos usen `OrdersService` sin acceder a Prisma directamente.

**Ejemplo real con Prisma**:

```ts
import { Module } from "@nestjs/common";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule], // necesitamos Prisma
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService], // otros módulos pueden usar OrdersService
})
export class OrdersModule {}
```

---

### 2) Controller — Define las rutas HTTP

**Qué es**: clase con decoradores que mapean endpoints HTTP a métodos.

**Analogía**: el controller es como un **router de Express**, pero declarativo (usas `@Get()` en vez de `app.get()`).

**Por qué separar controller de lógica**:

- **Single Responsibility**: el controller solo maneja HTTP (params, body, response codes); la lógica va al service.
- **Testing**: puedes testear el service sin levantar un servidor HTTP.
- **Reutilización**: el mismo service puede usarse desde múltiples controllers o desde cron jobs/workers.

**Ejemplo básico**:

```ts
// src/orders/orders.controller.ts
import { Controller, Get } from "@nestjs/common";

@Controller("orders") // prefijo: todas las rutas empiezan con /orders
export class OrdersController {
  @Get() // GET /orders
  list() {
    return { message: "List of orders" };
  }

  @Get("recent") // GET /orders/recent
  recent() {
    return { message: "Recent orders" };
  }
}
```

**Con parámetros y queries**:

```ts
import { Controller, Get, Param, Query, ParseIntPipe } from "@nestjs/common";

@Controller("orders")
export class OrdersController {
  @Get(":id") // GET /orders/123
  getById(@Param("id", ParseIntPipe) id: number) {
    // ParseIntPipe convierte "123" (string) a 123 (number)
    // Si falla (ej. /orders/abc), lanza 400 automáticamente
    return { id, message: "Order details" };
  }

  @Get() // GET /orders?page=1&pageSize=20
  list(
    @Query("page", ParseIntPipe) page = 1,
    @Query("pageSize", ParseIntPipe) pageSize = 20
  ) {
    return { page, pageSize, items: [] };
  }
}
```

**Decoradores clave**:

- `@Controller(prefix)`: define el prefijo de rutas.
- `@Get(path)`, `@Post(path)`, `@Patch(path)`, `@Delete(path)`: métodos HTTP.
- `@Param(key)`: extrae parámetro de ruta (`:id`).
- `@Query(key)`: extrae query string (`?page=1`).
- `@Body()`: extrae body de POST/PATCH.
- `ParseIntPipe`: transforma y valida (string → number).

**Controller completo con service**:

```ts
import { Controller, Get, Param, ParseIntPipe, Query } from "@nestjs/common";
import { OrdersService } from "./orders.service";

@Controller("orders")
export class OrdersController {
  // DI: Nest inyecta OrdersService automáticamente
  constructor(private readonly orders: OrdersService) {}

  @Get()
  list(
    @Query("page", ParseIntPipe) page = 1,
    @Query("pageSize", ParseIntPipe) pageSize = 20
  ) {
    // Delega al service
    return this.orders.list({ page, pageSize });
  }

  @Get(":id")
  getById(@Param("id", ParseIntPipe) id: number) {
    return this.orders.getById(id);
  }
}
```

**Mental model**: el controller es **fino** (solo extrae datos de la request y llama al service); el service es **grueso** (lógica de negocio, reglas, DB).

---

### 3) Provider (Service) — La lógica de negocio

**Qué es**: clase marcada con `@Injectable()` que contiene lógica reutilizable.

**Por qué "provider"**: porque Nest "provee" (inyecta) instancias de estas clases donde se necesiten.

**Tipos de providers**:

- **Services**: lógica de negocio (ej. `OrdersService`).
- **Repositories**: acceso a datos (avanzado, ver guía 6).
- **Helpers/Utils**: funciones compartidas (ej. `EmailService`).

**Ejemplo sin lógica (skeleton)**:

```ts
// src/orders/orders.service.ts
import { Injectable } from "@nestjs/common";

@Injectable()
export class OrdersService {
  list(params: { page: number; pageSize: number }) {
    return {
      items: [],
      total: 0,
      page: params.page,
      pageSize: params.pageSize,
    };
  }

  getById(id: number) {
    return { id, status: "PENDING", items: [] };
  }
}
```

**Con Prisma real**:

```ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Paginated } from "../shared/types";

interface Order {
  id: number;
  userId: number;
  status: string;
  items: OrderItem[];
}
interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
}

@Injectable()
export class OrdersService {
  // DI: Nest inyecta PrismaService
  constructor(private readonly prisma: PrismaService) {}

  async list(p: { page: number; pageSize: number }): Promise<Paginated<Order>> {
    // Consulta DB en paralelo (findMany + count)
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        skip: (p.page - 1) * p.pageSize,
        take: p.pageSize,
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

    return { items, total, page: p.page, pageSize: p.pageSize };
  }

  async getById(id: number): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        status: true,
        items: { select: { productId: true, quantity: true, price: true } },
      },
    });

    if (!order) throw new NotFoundException("Order not found");
    return order;
  }
}
```

**Explicación paso a paso**:

1. **`constructor(private readonly prisma: PrismaService)`**:

   - Nest inyecta `PrismaService` automáticamente (no haces `new PrismaService()`).
   - `private readonly` crea la propiedad `this.prisma` automáticamente.

2. **`list()` con paginación**:

   - `Promise.all`: ejecuta `findMany` y `count` en paralelo → más rápido.
   - `skip/take`: paginación offset-based (simple).
   - `select`: solo trae campos necesarios (performance).
   - `orderBy: { id: "desc" }`: más recientes primero.

3. **`getById()` con error handling**:
   - `findUnique`: busca por clave única.
   - `if (!order)`: lanza `NotFoundException` (Nest lo convierte en 404 HTTP).

**Mental model**: el service **orquesta** (consulta DB, aplica reglas de negocio, lanza errores de dominio).

---

## Dependency Injection (DI) — El corazón de Nest

**Qué es**: patrón donde **no instancias dependencias manualmente**; las declaras en el constructor y el framework las inyecta.

**Sin DI (Express típico)**:

```ts
// orders.controller.ts
import { OrdersService } from "./orders.service";

const ordersService = new OrdersService(); // instancias manualmente

app.get("/orders", (req, res) => {
  const orders = ordersService.list();
  res.json(orders);
});
```

Problemas:

- Difícil mockear en tests.
- Si `OrdersService` necesita `PrismaService`, tienes que pasarlo manualmente.
- No hay control de ciclo de vida (singleton vs request-scoped).

**Con DI (Nest)**:

```ts
// orders.controller.ts
@Controller("orders")
export class OrdersController {
  // Declaras la dependencia; Nest la inyecta
  constructor(private readonly orders: OrdersService) {}

  @Get()
  list() {
    return this.orders.list();
  }
}
```

**Cómo funciona internamente**:

1. Registras providers en el módulo:

```ts
@Module({
  providers: [OrdersService, PrismaService],
})
```

2. Nest crea un **contenedor de DI** al arrancar:

```
OrdersService (singleton)
  ↳ depende de PrismaService (singleton)
```

3. Cuando crea `OrdersController`, ve `constructor(private orders: OrdersService)`:
   - Busca `OrdersService` en el contenedor.
   - Lo inyecta automáticamente.

**Ventajas**:

- **Testing**: puedes pasar un mock en tests.

```ts
const mockService = { list: jest.fn() };
const controller = new OrdersController(mockService);
```

- **Single Responsibility**: `OrdersController` no sabe cómo construir `OrdersService`.

- **Scope management**: por defecto singleton (una instancia compartida); puedes cambiar a request-scoped si necesitas contexto por usuario.

**Tokens de inyección**: por defecto, la clase es el token. Avanzado: puedes usar strings/symbols para abstraer interfaces (ver guía 6).

---

## PrismaService — Singleton compartido

Prisma necesita una instancia única compartida en toda la app. Nest usa un módulo para esto:

```ts
// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect(); // conecta cuando Nest inicializa el módulo
  }
}
```

**Explicación**:

- `extends PrismaClient`: heredas todos los métodos de Prisma (`order.findMany`, etc.).
- `OnModuleInit`: hook de Nest; se ejecuta cuando el módulo se inicializa.
- `$connect()`: establece conexión a la DB.

**PrismaModule (global)**:

```ts
// src/prisma/prisma.module.ts
import { Module, Global } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Global() // hace PrismaService disponible en TODOS los módulos
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

**Por qué `@Global()`**:

- Sin `@Global()`: cada módulo que necesite Prisma debe importar `PrismaModule`.
- Con `@Global()`: solo importas `PrismaModule` una vez en `AppModule`, y todos los módulos pueden inyectar `PrismaService`.

**Trade-off**: `@Global()` es conveniente pero reduce explicitidad (no ves en el módulo qué depende de qué). Úsalo solo para servicios muy compartidos (DB, cache, config).

---

## Estructura de carpetas (opinada)

```
backend/src/
├── orders/                    # Dominio Orders
│   ├── orders.module.ts       # Módulo
│   ├── orders.controller.ts   # Endpoints HTTP
│   ├── orders.service.ts      # Lógica de negocio
│   └── dto.ts                 # Zod schemas + tipos
├── products/                  # Dominio Products
│   └── ...
├── users/                     # Dominio Users
│   └── ...
├── auth/                      # Autenticación
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── jwt.strategy.ts
│   └── jwt.guard.ts
├── common/                    # Compartido entre dominios
│   ├── filters/               # Exception filters
│   │   └── global-exception.filter.ts
│   ├── guards/                # Guards reutilizables
│   │   └── roles.guard.ts
│   ├── interceptors/          # Logging, transform
│   │   └── logging.interceptor.ts
│   └── pipes/                 # Validación
│       └── zod.pipe.ts
├── prisma/                    # Database
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── shared/                    # Tipos compartidos
│   └── types.ts               # Paginated, Result, etc.
├── app.module.ts              # Módulo raíz
└── main.ts                    # Bootstrap de la app
```

**Principio**: cada dominio es autosuficiente; `common/` tiene utilidades cross-cutting.

---

## AppModule — La raíz del árbol

```ts
// src/app.module.ts
import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { OrdersModule } from "./orders/orders.module";
import { ProductsModule } from "./products/products.module";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [
    PrismaModule, // @Global, disponible para todos
    OrdersModule,
    ProductsModule,
    AuthModule,
  ],
})
export class AppModule {}
```

**Mental model**: `AppModule` es el **árbol de dependencias**. Importas todos los módulos de features; Nest los inicializa en orden.

---

## main.ts — Bootstrap de la aplicación

```ts
// src/main.ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import helmet from "helmet";

async function bootstrap() {
  // Crea la app Nest a partir del módulo raíz
  const app = await NestFactory.create(AppModule);

  // Seguridad: headers HTTP seguros
  app.use(helmet());

  // CORS: permite requests de orígenes específicos
  app.enableCors({
    origin: [/localhost:\d+$/], // regex: localhost con cualquier puerto
    credentials: true, // permite cookies
  });

  // Escucha en puerto
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Server running on http://localhost:${process.env.PORT ?? 3000}`);
}

bootstrap();
```

**Explicación**:

- `NestFactory.create(AppModule)`: inicializa DI container, carga módulos, crea providers.
- `helmet()`: middleware que añade headers de seguridad (X-Frame-Options, CSP, etc.) para prevenir XSS, clickjacking.
- `enableCors()`: configura CORS; en desarrollo permite localhost; en producción ajusta `origin` a tu dominio.
- `listen()`: levanta servidor HTTP.

**Nota sobre filtros globales**: por ahora no añadimos `GlobalExceptionFilter`; lo verás en la guía 4 (error handling).

---

## Flujo completo de una request

```
Cliente hace GET /orders?page=1
  ↓
Middleware (helmet, CORS)
  ↓
Router de Nest
  ↓
OrdersController.list() → extrae params con ParseIntPipe
  ↓
OrdersService.list({ page: 1, pageSize: 20 })
  ↓
Prisma.order.findMany(...) + count()
  ↓
Service devuelve { items, total, page, pageSize }
  ↓
Controller devuelve JSON
  ↓
Cliente recibe respuesta
```

---

## Ejemplo completo: POST /orders con validación

Ahora armamos un endpoint completo con:

- Validación de input (Zod).
- Transacción en DB (Order + OrderItems).
- Cálculo de precio desde DB (seguridad).

### 1) DTO con Zod

```ts
// src/orders/dto.ts
import { z } from "zod";

export const CreateOrderSchema = z.object({
  userId: z.number().int().positive(),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "At least one item required"),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
```

**Explicación**:

- `z.object()`: define la estructura del objeto.
- `z.number().int().positive()`: número entero positivo.
- `z.array(...).min(1)`: array con mínimo 1 elemento.
- `z.infer<typeof Schema>`: TypeScript infiere el tipo del schema.

### 2) Zod Validation Pipe

```ts
// src/common/pipes/zod.pipe.ts
import { PipeTransform, BadRequestException } from "@nestjs/common";
import { ZodSchema } from "zod";

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    const parsed = this.schema.safeParse(value);
    if (!parsed.success) {
      throw new BadRequestException({
        message: "Validation failed",
        errors: parsed.error.format(),
      });
    }
    return parsed.data;
  }
}
```

**Explicación**:

- `PipeTransform`: interfaz de Nest; debes implementar `transform()`.
- `safeParse()`: valida sin lanzar error (retorna `{ success, data }` o `{ success: false, error }`).
- `throw BadRequestException`: Nest lo convierte en respuesta `400`.

### 3) Controller POST

```ts
// src/orders/orders.controller.ts
import { Body, Post, UsePipes, HttpCode } from "@nestjs/common";
import { ZodValidationPipe } from "../common/pipes/zod.pipe";
import { CreateOrderSchema, CreateOrderInput } from "./dto";

@Post()
@HttpCode(201) // devuelve 201 en vez de 200 por defecto
@UsePipes(new ZodValidationPipe(CreateOrderSchema))
create(@Body() body: CreateOrderInput) {
  // body ya está validado y tipado
  return this.orders.create(body);
}
```

**Explicación**:

- `@UsePipes(pipe)`: aplica el pipe a este handler.
- `@Body()` extrae el body de la request.
- Después de pasar por el pipe, `body` es `CreateOrderInput` (tipado y validado).

### 4) Service con transacción

```ts
// src/orders/orders.service.ts
async create(input: CreateOrderInput) {
  return this.prisma.$transaction(async (tx) => {
    // 1. Obtener precios de productos desde DB
    const products = await tx.product.findMany({
      where: { id: { in: input.items.map((i) => i.productId) } },
      select: { id: true, price: true },
    });

    // 2. Mapear productId → price
    const priceById: Record<number, number> = Object.fromEntries(
      products.map((p) => [p.id, Number(p.price)])
    );

    // 3. Crear order + items en una sola transacción
    return tx.order.create({
      data: {
        userId: input.userId,
        items: {
          create: input.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            price: priceById[i.productId], // precio desde DB, no del cliente
          })),
        },
      },
      select: { id: true, status: true },
    });
  });
}
```

**Explicación paso a paso**:

1. **`$transaction(async tx => ...)`**: todo lo que hagas con `tx` es atómico; si falla algo, rollback completo.

2. **Obtener precios desde DB**:

   - **Por qué**: nunca confíes en el precio que envía el cliente (puede manipularlo).
   - `findMany({ where: { id: { in: [...] } } })`: busca múltiples productos en una query.

3. **Mapear precios**:

   - `Record<number, number>`: tipo para `{ productId: price }`.
   - `Object.fromEntries`: convierte array de `[key, value]` a objeto.

4. **Crear order con nested write**:
   - `items: { create: [...] }`: crea `OrderItems` relacionados en la misma operación.
   - `select: { id: true, status: true }`: solo devuelve id y status (no todo el order).

**Mental model**: transacción = "todo o nada". Si falla crear `OrderItem`, el `Order` tampoco se crea.

---

## Express → Nest (comparación práctica)

### Express

```js
const express = require("express");
const app = express();

app.get("/orders", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 20;

  const orders = await prisma.order.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  res.json({ orders });
});
```

### Nest equivalente

```ts
@Controller("orders")
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  list(
    @Query("page", ParseIntPipe) page = 1,
    @Query("pageSize", ParseIntPipe) pageSize = 20
  ) {
    return this.orders.list({ page, pageSize });
  }
}

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(p: { page: number; pageSize: number }) {
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        skip: (p.page - 1) * p.pageSize,
        take: p.pageSize,
      }),
      this.prisma.order.count(),
    ]);
    return { items, total, page: p.page, pageSize: p.pageSize };
  }
}
```

**Ventajas de Nest**:

- Validación automática (`ParseIntPipe`).
- Separación controller/service (testing más fácil).
- DI (mockeas `OrdersService` en tests del controller).
- Tipos estrictos (TypeScript nativo).

---

## Errores comunes y debugging

### Error: "Cannot resolve dependencies of OrdersService"

**Síntoma**: al arrancar la app:

```
Error: Nest can't resolve dependencies of the OrdersService (?).
Please make sure that the argument PrismaService at index [0] is available in the OrdersModule context.
```

**Causas**:

1. `PrismaModule` no está importado en `OrdersModule`.
2. `PrismaService` no está en `providers` de `PrismaModule`.
3. `PrismaService` no está exportado en `PrismaModule`.

**Fix**:

```ts
// orders.module.ts
@Module({
  imports: [PrismaModule], // ← asegúrate de importar
  providers: [OrdersService],
})
```

**Debug**: lee el error; Nest te dice qué dependencia falta y en qué módulo.

---

### Error: "Circular dependency between modules"

**Síntoma**:

```
Nest cannot create the OrdersModule instance.
The module at index [0] of the OrdersModule "imports" array is undefined.
```

**Causa**: `ModuleA` importa `ModuleB` y `ModuleB` importa `ModuleA` → ciclo.

**Fix**:

1. Refactoriza para extraer lógica común a un tercer módulo.
2. O usa `forwardRef`:

```ts
@Module({
  imports: [forwardRef(() => ProductsModule)],
})
```

**Consejo**: evita ciclos; rediseña arquitectura si aparecen.

---

### Validación no funciona (400 no se lanza)

**Síntoma**: envías body inválido pero el endpoint no rechaza.

**Causas**:

1. Olvidaste `@UsePipes(new ZodValidationPipe(schema))`.
2. El pipe está aplicado al controller, pero el handler específico lo sobrescribe.

**Fix**:

```ts
@Post()
@UsePipes(new ZodValidationPipe(CreateOrderSchema)) // ← aquí
create(@Body() body: CreateOrderInput) { /* ... */ }
```

---

### 404 en todos los endpoints

**Síntoma**: `GET /orders` devuelve 404.

**Causa**: olvidaste importar `OrdersModule` en `AppModule`.

**Fix**:

```ts
// app.module.ts
@Module({
  imports: [OrdersModule], // ← añade aquí
})
```

---

## Tips para aprender Nest viniendo de Express

1. **Piensa en capas**: Controller (HTTP) → Service (lógica) → Prisma (DB).
2. **DI es tu amigo**: no instancies nada con `new`; declara en constructor.
3. **Decoradores son declarativos**: `@Get()` es más legible que `app.get()`.
4. **Errores tipados**: usa `NotFoundException`, `BadRequestException` en vez de `res.status(404)`.
5. **Testing mental**: pregunta "¿cómo mockeo esto?" al escribir código; si es difícil, refactoriza.

---

## Comparación rápida Express vs Nest

| Aspecto    | Express                       | Nest                               |
| ---------- | ----------------------------- | ---------------------------------- |
| Routing    | `app.get('/orders', handler)` | `@Controller('orders')` + `@Get()` |
| Validación | Manual en handler             | Pipes (`ParseIntPipe`, Zod)        |
| DI         | Manual (imports)              | Automática (constructor)           |
| Errores    | `res.status(404).json()`      | `throw NotFoundException()`        |
| Testing    | Difícil (acoplado a req/res)  | Fácil (mockeas services)           |
| Estructura | Libre (decides tú)            | Opinada (módulos por dominio)      |

---

## Check yourself (responde antes de continuar)

- [ ] ¿Qué hace un módulo y cuándo crear uno nuevo?

  - **Respuesta**: agrupa feature/dominio; crea uno por dominio (orders, products) o capa técnica (auth).

- [ ] ¿Diferencia entre controller y service?

  - **Respuesta**: controller maneja HTTP (params, validación, response); service tiene lógica de negocio.

- [ ] ¿Cómo inyecta Nest las dependencias?

  - **Respuesta**: registras providers en módulo; Nest crea instancias y las inyecta por constructor.

- [ ] ¿Por qué `PrismaModule` es `@Global()`?

  - **Respuesta**: para no importarlo en cada módulo; todos pueden inyectar `PrismaService`.

- [ ] ¿Cómo validas un body con Zod en Nest?
  - **Respuesta**: `@UsePipes(new ZodValidationPipe(schema))` + `@Body()`.

---

## Mini‑reto (hazlo ahora)

Implementa `PATCH /orders/:id/status` que actualice el estado de un pedido:

**Requisitos**:

1. Validación con Zod: `status` debe ser `"PENDING" | "PAID" | "CANCELLED"`.
2. Service: verifica que el pedido existe (lanza `NotFoundException` si no).
3. Usa `prisma.order.update()` directo.
4. Responde con el pedido actualizado (solo `id` y `status`).

**Criterios de aceptación**:

- [ ] `PATCH /orders/1/status` con body `{ "status": "PAID" }` devuelve 200
- [ ] Body con `{ "status": "INVALID" }` devuelve 400
- [ ] `PATCH /orders/999/status` devuelve 404 si no existe

**Hints**:

- Zod enum: `z.enum(["PENDING", "PAID", "CANCELLED"])`.
- Verifica existencia con `findUnique` antes de `update`, o maneja el error de Prisma (mejor).
- `update` con `select: { id: true, status: true }`.

**Tiempo sugerido**: 15 min.

---

**Siguiente paso**: continúa con `nest/2-pipes-guards-interceptors.md` para profundizar en validación y auth.
