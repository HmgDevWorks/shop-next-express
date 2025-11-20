# 🔥 Common TypeScript Utilities

Utilidades TypeScript **genéricas** para copiar en **cualquier** proyecto.

## 📦 ¿Qué incluye?

### Result Pattern
```typescript
type Result<T, E = Error> = { ok: true; data: T } | { ok: false; error: E }
async function safe<T>(fn: () => Promise<T>): Promise<Result<T>>
function trySafe<T>(fn: () => T): Result<T>
```

### Paginación
```typescript
interface Paginated<T>
interface PaginationParams
function createPaginated<T>(...)
```

### Helpers de DTOs
```typescript
type CreateDTO<T> // Omit<T, "id" | "createdAt" | "updatedAt">
type UpdateDTO<T> // Partial<CreateDTO<T>>
interface WithTimestamps
interface WithId
```

### Custom Errors
```typescript
NotFoundError
ValidationError
UnauthorizedError
ForbiddenError
ConflictError
```

### Type Guards
```typescript
isDefined, isString, isNumber, isObject, isArray
```

### Assertion Functions
```typescript
assertPresent, assertString, assertNumber
```

### Parsing & Validation
```typescript
toIntId, toNumber, toBoolean, notEmptyString, isValidEmail
```

### Utility Types
```typescript
RequireFields<T, K>
PartialFields<T, K>
ApiResponse<T>
ApiSuccess<T>
ApiError
```

### API Helpers
```typescript
fetchJson<T>, safeFetch<T>
successResponse<T>, errorResponse
```

### Array & Object Helpers
```typescript
sleep, retry, compact, groupBy, keyBy, unique, chunk
```

### Constantes
```typescript
HTTP_STATUS
DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE
```

---

## 🚀 Uso Rápido

### 1. Copia el archivo
```bash
cp common-types.ts /tu/proyecto/src/
```

### 2. Importa lo que necesites
```typescript
import { safe, Result, Paginated, toIntId } from './common-types';
```

---

## 📚 Ejemplos

### Result Pattern
```typescript
async function getUser(id: number): Promise<Result<User>> {
  return safe(async () => {
    const user = await db.findUser(id);
    if (!user) throw new NotFoundError('User not found');
    return user;
  });
}

const result = await getUser(1);
if (!result.ok) {
  console.error(result.error);
} else {
  console.log(result.data);
}
```

### Paginación
```typescript
const paginated = createPaginated(items, total, page, pageSize);
// { items, total, page, pageSize, totalPages }
```

### DTOs Genéricos
```typescript
interface User { id: number; name: string; createdAt: Date; updatedAt: Date }

type UserCreate = CreateDTO<User>; // { name: string }
type UserUpdate = UpdateDTO<User>; // { name?: string }
```

### Type Guards
```typescript
const users = [user1, null, user2, undefined];
const validUsers = users.filter(isDefined); // User[]
```

### Parsing
```typescript
// En Express params
const userId = toIntId(req.params.id); // Valida y convierte a number
```

---

## ✅ Ventajas

- ✅ **100% genérico** - funciona en cualquier proyecto
- ✅ **Type-safe** - sin `any`
- ✅ **Copy-paste ready** - solo copia y usa
- ✅ **Sin dependencias** (excepto fetch)
- ✅ **Documentado** con JSDoc

---

**💡 Tip:** Guarda este archivo como plantilla y cópialo en cada nuevo proyecto TypeScript.






