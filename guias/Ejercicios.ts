/*****************************************************************
 ** Ejercicio A: valida body con Zod y tipa la función
 *****************************************************************/

// Entrada: unknown → salida: CreateOrderInput
// const input = parseCreateOrder(body);

import { z } from "zod";

const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
  userId: z.string().uuid(),
  total: z.number().positive(),
  status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const createOrderInput = z.infer<typeof createOrderSchema>;

const parseCreateOrder = (body: unknown): typeof createOrderInput => {
  if (!body) throw new Error("Body is required");
  return createOrderSchema.parse(body) as typeof createOrderInput;
};

const body: unknown = null;
const input = parseCreateOrder(body);

// CORRECCION EJERCICIO A
// const createOrderSchema = z.object({
//   items: z
//     .array(
//       z.object({
//         productId: z.string().uuid(),
//         quantity: z.number().int().positive(),
//       })
//     )
//     .min(1),
//   userId: z.string().uuid(),
//   total: z.number().positive(),
//   status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
//   createdAt: z.date(),
//   updatedAt: z.date(),
// });

// type CreateOrderInput = z.infer<typeof createOrderSchema>;

// const parseCreateOrder = (body: unknown): CreateOrderInput => {
//   const result = createOrderSchema.safeParse(body);

//   if (!result.success)
//     throw new Error(
//       `Validation error: ${JSON.stringify(result.error.format())} `
//     );

//   return result.data;
// };

// const body: unknown = null;
// const input = parseCreateOrder(body);

/*****************************************************************
 **Ejercicio B**: envuelve una llamada a DB en `Result`
 *****************************************************************/

//  async function getProductById(
//     id: number
//   ): Promise<Result<{ id: number; name: string } | null>> {
//     return safe(async () => {
//       // const p = await prisma.product.findUnique({ select: { id: true, name: true }, where: { id } });
//       const p = null;
//       return p;
//     });
//   }

interface Product {
  id: number;
  name: string;
}

// interface Result<T, E = Error> {
//   isOk: boolean;
//   value: T | null;
//   error: E | null;
// }
type Result<T, E = Error> =
  | { isOk: true; value: T }
  | { isOk: false; error: E };

function getProductById(id: number): Promise<Result<Product | null>> {
  return safe(async () => {
    const product = await prisma.product.findUnique({ where: { id } });
    return product;
  });
}

const safe = <T>(fn: () => Promise<T>): Promise<Result<T>> => {
  return fn()
    .then((value) => ({ isOk: true, value, error: null }))
    .catch((error) => ({ isOk: false, value: null, error }));
};

const product = await getProductById(1);

// CORRECCION EJERCICIO B
//   type Result<T, E = Error> =
//     | { isOk: true; value: T }
//     | { isOk: false; error: E };

//   const safe = async <T>(fn: () => Promise<T>): Promise<Result<T>> => {
//     try {
//       const value = await fn();
//       return { isOk: true, value };
//     } catch (error) {
//       return { isOk: false, error: error as Error };
//     }
//   };

//   function getProductById(id: number): Promise<Result<Product | null>> {
//     return safe(async () => {
//       const product = await prisma.product.findUnique({ where: { id } });
//       return product;
//     });
//   }

//   const product = await getProductById(1);

/*****************************************************************
 **Ejercicio C**: define DTOs con utility types
 *****************************************************************/

//  interface User {
//     id: number;
//     email: string;
//     name: string;
//     roles: string[];
//   }
//   type UserCreate = Omit<User, "id" | "roles">;
//   type UserUpdate = Partial<UserCreate>;

type ProductCreate = Omit<Product, "id">;
type ProductUpdate = Partial<ProductCreate>;
type ProductGet = Pick<Product, "id" | "name">;

/*****************************************************************
 **Ejercicio D: convierte id: string | number a number seguro
 *****************************************************************/

//  const userId = toIntId(query.userId as string | number);

const toIntId = (unknownId: unknown): number => {
  if (typeof unknownId !== "string" && typeof unknownId !== "number") {
    throw new Error("Invalid ID");
  }

  const num =
    typeof unknownId === "string" ? parseInt(unknownId) : Number(unknownId);

  if (!Number.isInteger(num) || num <= 0) {
    throw new Error("Invalid ID: must be a positive number");
  }

  return num;
};

const userId = toIntId("123");

/*****************************************************************
 ** Ejercicio E: fetch tipado (versión Axios) SOLO SOLUCIÓN
 *****************************************************************/

async function getJson<T>(url: string): Promise<Result<T>> {
  try {
    const response = await axios.get<T>(url);
    return { isOk: true, value: response.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        isOk: false,
        error: new Error(`HTTP ${error.response?.status}: ${error.message}`),
      };
    }
    return { isOk: false, error: error as Error };
  }
}

// ✅ Uso con narrowing
const result = await getJson<ProductGet[]>(`${API_URL}/products`);

if (!result.isOk) {
  console.error(result.error.message);
} else {
  console.log(result.value); // ✅ ProductLite[]
}
