# Next App Router — Server vs Client

## Server Components (por defecto)

**Qué**: se ejecutan solo en servidor, sin JS al cliente.

```tsx
// app/products/page.tsx
async function getProducts() {
  const res = await fetch(`${process.env.API_URL}/products`, {
    next: { revalidate: 60 },
  });
  return res.json();
}

export default async function ProductsPage() {
  const products = await getProducts();
  return (
    <div>
      {products.items.map((p: any) => (
        <div key={p.id}>{p.name} - ${p.price}</div>
      ))}
    </div>
  );
}
```

**No pueden**: hooks (`useState`, `useEffect`), eventos (`onClick`), browser APIs.

---

## Client Components

**Cuándo**: estado, efectos, eventos.

```tsx
// AddToCartButton.tsx
"use client";
import { useState } from "react";

export function AddToCartButton({ productId }: { productId: number }) {
  const [loading, setLoading] = useState(false);

  return (
    <button
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await fetch("/api/cart", { method: "POST", body: JSON.stringify({ productId }) });
        setLoading(false);
      }}
    >
      Add to cart
    </button>
  );
}
```

---

## Composición

Server Component (datos) + Client Component (interactividad).

```tsx
// products/page.tsx (Server)
import { AddToCartButton } from "../components/AddToCartButton";

export default async function ProductsPage() {
  const products = await getProducts();
  return (
    <div>
      {products.items.map(p => (
        <div key={p.id}>
          {p.name}
          <AddToCartButton productId={p.id} />
        </div>
      ))}
    </div>
  );
}
```

---

## Check

- [ ] Server vs Client? → Server sin JS cliente, Client interactivo
- [ ] Cuándo "use client"? → Estado/efectos/eventos

**Mini-reto**: página `/orders` (Server) con botón cancel (Client con `useState`).
