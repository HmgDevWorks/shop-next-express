# Server Actions + Caching

## Server Action básica

```ts
// app/actions.ts
"use server";
import { revalidateTag } from "next/cache";
import { z } from "zod";

const CreateProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  sku: z.string().min(1),
});

export async function createProduct(formData: FormData) {
  const parsed = CreateProductSchema.safeParse({
    name: formData.get("name"),
    price: Number(formData.get("price")),
    sku: formData.get("sku"),
  });

  if (!parsed.success) return { error: "Invalid data" };

  await fetch(`${process.env.API_URL}/products`, {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });

  revalidateTag("products:list");
  return { success: true };
}
```

---

## Uso en form

```tsx
// app/products/new/page.tsx
import { createProduct } from "../../actions";

export default function NewProductPage() {
  return (
    <form action={createProduct}>
      <input name="name" required />
      <input name="price" type="number" required />
      <input name="sku" required />
      <button type="submit">Create</button>
    </form>
  );
}
```

---

## Revalidación

```tsx
// Fetch con tag
async function getProducts() {
  const res = await fetch(`${process.env.API_URL}/products`, {
    next: { tags: ["products:list"], revalidate: 60 },
  });
  return res.json();
}

// Action invalida
revalidateTag("products:list");
```

---

## Loading state

```tsx
"use client";
import { useFormStatus } from "react-dom";

export function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? "Creating..." : "Create"}</button>;
}
```

---

## Check

- [ ] Qué es Server Action? → Función async "use server"
- [ ] revalidateTag para qué? → Invalidar cache

**Mini-reto**: form crear categoría con validación Zod + revalidación.
