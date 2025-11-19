# TypeScript avanzado (práctico para Nest/Next)

Explicaciones en español; términos y snippets en inglés.

## 1) Tipos base que sí usarás

### unknown > any

- **Qué hace**: obliga a validar antes de usar.
- **Cuándo**: todo lo externo (HTTP body, JSON, env vars).

```ts
function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const n = Number(value);
    if (!Number.isNaN(n)) return n;
  }
  throw new Error("Invalid number");
}
```

Con `any` te saltas el chequeo en compilación → errores en runtime. Con `unknown`, TypeScript te obliga a comprobar (narrowing).

### Narrowing (type guards)

- `typeof value === "string"`
- `Array.isArray(value)`
- `"prop" in obj`
- `value instanceof Error`

Ejemplo:

```ts
function formatId(id: string | number): string {
  if (typeof id === "number") return `#${id}`;
  return id.toUpperCase();
}
```

```ts
function process(data: string[] | string) {
  if (Array.isArray(data)) {
    // data es string[]
    return data.join(",");
  }
  // data es string
  return data;
}
```

```ts
function parse(input: unknown) {
  if (!Array.isArray(input)) {
    throw new Error("Not an array");
  }
  // input es now unknown[]
  return input;
}
```

```ts
type Success = { ok: true; data: string };
type Error = { ok: false; error: string };
type Result = Success | Error;

function handle(result: Result) {
  if ("data" in result) {
    // result es Success
    console.log(result.data);
  } else {
    // result es Error
    console.log(result.error);
  }
}
```

```ts
function validate(body: unknown) {
  if (typeof body !== "object" || body === null) {
    throw new Error("Not object");
  }

  if (!("userId" in body)) {
    throw new Error("Missing userId");
  }

  // Ahora sabes que body.userId existe
}
```

---

## 2) Interfaces vs types

- **interface**: contratos públicos (extensible, fusionable, mejor para objetos).
- **type**: utilidades, unions, mapped types, intersecciones complejas.

```ts
interface OrderItem {
  productId: number;
  quantity: number;
}
interface CreateOrder {
  userId: number;
  items: OrderItem[];
}

type Id = number | string; // utilidad/alias simple
type Status = "PENDING" | "PAID" | "CANCELLED"; // union literal
```

Regla: si defines un modelo de datos (entidad, DTO), usa `interface`. Si defines una transformación/union/alias, usa `type`.

---

## 3) Utility types clave (explicación completa)

Los utility types transforman tipos existentes para derivar DTOs, respuestas, validaciones. Aquí te explico **qué hace**, **cuándo usarlo** y ejemplos.

### Partial\<T\>

**Qué hace**: vuelve opcionales todas las propiedades de T.

**Cuándo**: PATCH/updates parciales, formularios incompletos.

```ts
interface User {
  id: number;
  email: string;
  name: string;
}
type UserUpdate = Partial<Omit<User, "id">>;
// Resultado: { email?: string; name?: string }
```

Uso:

```ts
function updateUser(id: number, patch: UserUpdate) {
  // patch puede tener solo email, solo name, ambos o ninguno
}
```

### Required\<T\>

**Qué hace**: vuelve requeridas todas las propiedades de T.

**Cuándo**: asegurar que un draft ya está completo antes de persistir.

```ts
type UserDraft = { email?: string; name?: string };
type UserComplete = Required<UserDraft>;
// Resultado: { email: string; name: string }
```

### Readonly\<T\>

**Qué hace**: propiedades inmutables (solo lectura).

**Cuándo**: config, constantes, datos que no deben cambiar.

```ts
interface Config {
  apiUrl: string;
  retries: number;
}
const cfg: Readonly<Config> = { apiUrl: "https://api.com", retries: 3 };
// cfg.apiUrl = 'x'; // Error: Cannot assign to 'apiUrl' because it is a read-only property
```

### Pick\<T, K\>

**Qué hace**: toma un subconjunto de propiedades K de T.

**Cuándo**: respuestas ligeras para UI, seleccionar campos específicos.

```ts
interface Product {
  id: number;
  name: string;
  price: number;
  sku: string;
  createdAt: Date;
}
type ProductCard = Pick<Product, "id" | "name" | "price">;
// Resultado: { id: number; name: string; price: number }
```

Uso:

```ts
// En vez de devolver el Product completo a la UI, devuelve ProductCard
function getProductsForCards(): ProductCard[] {
  /* ... */
}
```

### Omit\<T, K\>

**Qué hace**: excluye propiedades K de T.

**Cuándo**: crear DTOs de creación/actualización sin IDs o campos calculados.

```ts
interface Product {
  id: number;
  name: string;
  price: number;
}
type ProductCreate = Omit<Product, "id">;
// Resultado: { name: string; price: number }
```

Patrón típico para DTOs:

```ts
type ProductCreate = Omit<Product, "id">;
type ProductUpdate = Partial<ProductCreate>;
```

### Record\<K, V\>

**Qué hace**: objeto con claves K (string | number | symbol) y valores V.

**Cuándo**: mapas tipados (por id, por clave), feature flags, índices.

```ts
type PriceByProductId = Record<number, number>;
const prices: PriceByProductId = { 1: 9.99, 2: 19.99, 3: 29.99 };

type FeatureFlags = Record<string, boolean>;
const flags: FeatureFlags = { darkMode: true, betaFeatures: false };
```

Uso práctico (cálculo de precio en transacción):

```ts
const products = await prisma.product.findMany({
  select: { id: true, price: true },
});
const priceById: Record<number, number> = Object.fromEntries(
  products.map((p) => [p.id, Number(p.price)])
);
```

### NonNullable\<T\>

**Qué hace**: elimina `null` y `undefined` de T.

**Cuándo**: post‑validación, afirmar que un valor existe.

```ts
type MaybeUser = { id: number; name: string } | null | undefined;
type UserStrict = NonNullable<MaybeUser>;
// Resultado: { id: number; name: string }
```

Uso con assertion:

```ts
function assertPresent<T>(v: T): asserts v is NonNullable<T> {
  if (v === null || v === undefined) throw new Error("Missing value");
}
```

### ReturnType\<F\> y Parameters\<F\>

**Qué hacen**: extraen el tipo de retorno y de parámetros de una función.

**Cuándo**: tipar mocks, reutilizar tipos sin duplicar.

```ts
function makeOrder(
  userId: number,
  items: { productId: number; quantity: number }[]
) {
  return { id: 1, status: "PENDING" as const };
}
type MakeOrderParams = Parameters<typeof makeOrder>;
// [number, { productId: number; quantity: number }[]]

type MakeOrderReturn = ReturnType<typeof makeOrder>;
// { id: number; status: "PENDING" }
```

Útil para tests:

```ts
const mockMakeOrder: jest.MockedFunction<typeof makeOrder> = jest.fn();
mockMakeOrder.mockResolvedValue({ id: 123, status: "PENDING" });
```

### Exclude\<T, U\> y Extract\<T, U\>

**Qué hacen**: excluyen o extraen miembros de una union.

**Cuándo**: refinar unions (estados, eventos, tipos condicionales).

```ts
type Status = "PENDING" | "PAID" | "CANCELLED" | "REFUNDED";
type ActiveStatus = Exclude<Status, "CANCELLED" | "REFUNDED">;
// "PENDING" | "PAID"

type FailedStatus = Extract<Status, "CANCELLED" | "REFUNDED">;
// "CANCELLED" | "REFUNDED"
```

### Awaited\<T\>

**Qué hace**: obtiene el tipo resuelto de una Promise.

**Cuándo**: helpers que devuelven Promises; tipar resultados de `fetch` wrappers.

```ts
async function getUser() {
  return { id: 1, email: "u@example.com" };
}
type User = Awaited<ReturnType<typeof getUser>>;
// { id: number; email: string }
```

Uso combinado:

```ts
async function fetchJson<T>(url: string): Promise<T> {
  /* ... */
}
type Categories = Awaited<ReturnType<typeof fetchJson<{ items: any[] }>>>;
```

---

## 4) Generics útiles

### Result pattern

- **Qué hace**: representa éxito/error sin lanzar excepciones.
- **Cuándo**: operaciones con fallo probable (DB, external APIs).

```ts
export type Result<T, E = Error> =
  | { ok: true; data: T }
  | { ok: false; error: E };
```

Uso:

```ts
async function getProductById(id: number): Promise<Result<Product | null>> {
  try {
    const p = await prisma.product.findUnique({ where: { id } });
    return { ok: true, data: p };
  } catch (e) {
    return { ok: false, error: e as Error };
  }
}

const res = await getProductById(1);
if (!res.ok) {
  // manejar error: log, mapear a HttpException
} else {
  // res.data es Product | null
}
```

### Paginated\<T\>

- **Qué hace**: contenedor tipado para listas paginadas.

```ts
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

Uso:

```ts
async function listProducts(
  page: number,
  pageSize: number
): Promise<Paginated<Product>> {
  const [items, total] = await Promise.all([
    prisma.product.findMany({ skip: (page - 1) * pageSize, take: pageSize }),
    prisma.product.count(),
  ]);
  return { items, total, page, pageSize };
}
```

---

## 5) Tipos para errores y domain exceptions

```ts
export class NotFoundError extends Error {
  constructor(msg = "Not found") {
    super(msg);
    this.name = "NotFoundError";
  }
}
export class ValidationError extends Error {
  constructor(msg = "Validation error") {
    super(msg);
    this.name = "ValidationError";
  }
}
```

En Nest, mapea a `HttpException` en un Exception Filter global (ver `guias/nest/4-error-handling-filters.md`).

---

## 6) Narrowing de DTOs con Zod

**Ventaja**: validas y obtienes el tipo al mismo tiempo con `z.infer`.

```ts
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
    .min(1),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
```

Uso:

```ts
function parseCreateOrder(body: unknown): CreateOrderInput {
  const r = CreateOrderSchema.safeParse(body);
  if (!r.success) throw new ValidationError(JSON.stringify(r.error.format()));
  return r.data;
}
```

---

## 7) Types para Next (RSC + Actions)

### Fetch tipado

```ts
async function getJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

interface Category {
  id: number;
  name: string;
}

export async function getCategories(): Promise<Paginated<Category>> {
  return getJson(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
}
```

---

## 8) Tipos para Prisma (select mínimo)

```ts
export interface OrderSummary {
  id: number;
  userId: number;
  itemsCount: number;
}

// Al consultar con Prisma, usa select y mapea al tipo anterior
const orders = await prisma.order.findMany({
  select: { id: true, userId: true, items: { select: { id: true } } },
});
// Mapea a OrderSummary manualmente o con un helper
```

---

## 9) Cómo hacerlo en la práctica (antes → después)

### A) De `any` a `unknown` + Zod

**Antes (frágil)**:

```ts
function createOrder(body: any) {
  return { userId: body.userId, items: body.items };
}
```

**Después (seguro)**:

```ts
import { z } from "zod";

const CreateOrderSchema = z.object({
  userId: z.number().int().positive(),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});
type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

function parseCreateOrder(body: unknown): CreateOrderInput {
  const r = CreateOrderSchema.safeParse(body);
  if (!r.success) throw new Error("Validation error");
  return r.data;
}
```

### B) Result pattern sin try/catch en el caller

**Utilidad**:

```ts
type Result<T, E = Error> = { ok: true; data: T } | { ok: false; error: E };
async function safe<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    return { ok: false, error: e as Error };
  }
}
```

**Uso**:

```ts
const res = await safe(async () =>
  prisma.product.findMany({ select: { id: true, name: true } })
);
if (!res.ok) {
  /* log + map a HttpException */
} else {
  /* res.data */
}
```

### C) DTOs con Utility Types

```ts
interface Product {
  id: number;
  name: string;
  price: number;
}

type ProductCreate = Omit<Product, "id">;
type ProductUpdate = Partial<ProductCreate>;
```

Evitas duplicar propiedades y reduces errores al renombrar campos.

### D) Narrowing de IDs y params

```ts
function toIntId(id: string | number): number {
  if (typeof id === "number") return id;
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) throw new Error("Invalid id");
  return n;
}
```

Usa esto para `@Param('id')` en Express/Nest cuando no tengas `ParseIntPipe`.

### E) Fetch tipado en Next

```ts
async function getJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

type ProductLite = { id: number; name: string };
const products = await getJson<ProductLite[]>(
  `${process.env.NEXT_PUBLIC_API_URL}/products?select=id,name`
);
```

---

## 10) Patrones prácticos con utility types (Nest/Prisma/Next)

**DTO de creación/actualización**:

```ts
interface Product {
  id: number;
  name: string;
  price: number;
  sku: string;
}
export type ProductCreate = Omit<Product, "id">;
export type ProductUpdate = Partial<ProductCreate>;
```

**Respuestas ligeras para UI**:

```ts
type ProductCard = Pick<Product, "id" | "name" | "price">;
```

**Mapas de lookup (cálculo de precio)**:

```ts
type PriceById = Record<number, number>;
const priceById: PriceById = Object.fromEntries(
  products.map((p) => [p.id, p.price])
);
```

**Afirmar valores no nulos tras validación**:

```ts
function assertPresent<T>(v: T): asserts v is NonNullable<T> {
  if (v === null || v === undefined) throw new Error("Missing value");
}
```

---

## 11) Ejercicios guiados (con solución base)

**Ejercicio A**: valida body con Zod y tipa la función

```ts
// Entrada: unknown → salida: CreateOrderInput
const input = parseCreateOrder(body);
```

**Ejercicio B**: envuelve una llamada a DB en `Result`

```ts
async function getProductById(
  id: number
): Promise<Result<{ id: number; name: string } | null>> {
  return safe(async () => {
    // const p = await prisma.product.findUnique({ select: { id: true, name: true }, where: { id } });
    const p = null;
    return p;
  });
}
```

**Ejercicio C**: define DTOs con utility types

```ts
interface User {
  id: number;
  email: string;
  name: string;
  roles: string[];
}
type UserCreate = Omit<User, "id" | "roles">;
type UserUpdate = Partial<UserCreate>;
```

**Ejercicio D**: convierte `id: string | number` a `number` seguro

```ts
const userId = toIntId(query.userId as string | number);
```

**Ejercicio E** (Next): fetch tipado

```ts
type ProductLite = { id: number; name: string };
const products = await getJson<ProductLite[]>(
  `${process.env.NEXT_PUBLIC_API_URL}/products?select=id,name`
);
```

---

## 12) Checklist de aplicación inmediata

- [ ] Todo input externo es `unknown` → validar con Zod
- [ ] Servicios devuelven `Result<T>` en operaciones con fallo probable
- [ ] DTOs derivados con `Omit`/`Partial` en vez de duplicados
- [ ] Selects mínimos en Prisma → tipos de salida explícitos
- [ ] `fetch` centralizado y tipado en Next

---

## 13) Tips rápidos

- Evita `any`; usa `unknown` + validación/Zod
- Exporta tipos de dominio desde `shared/` si son comunes a front/back
- Nombra tipos y variables de forma descriptiva (legibles)
- Usa `ReturnType`/`Parameters` para evitar duplicar firmas en tests
- Combina utility types: `Partial<Omit<T, 'id'>>` es tu amigo

---

**Mini‑reto**: convierte un servicio que retorna `any` a `Result<Paginated<T>>` con errores tipados y valida la entrada con Zod. Añade una prueba que verifique que la validación rechaza `items: []`.
