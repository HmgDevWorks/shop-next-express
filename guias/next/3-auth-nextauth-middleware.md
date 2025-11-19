# NextAuth + Middleware

## Setup

```ts
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: { email: {}, password: {} },
      async authorize(creds) {
        const res = await fetch(`${process.env.API_URL}/auth/login`, {
          method: "POST",
          body: JSON.stringify(creds),
        });
        if (!res.ok) return null;
        const { accessToken } = await res.json();
        return { id: "1", email: creds.email, accessToken };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.accessToken = (user as any).accessToken;
      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
```

---

## Uso Server Component

```tsx
import { getServerSession } from "next-auth";

export default async function DashboardPage() {
  const session = await getServerSession();
  if (!session) return <div>Not authenticated</div>;
  return <div>Welcome {session.user?.email}</div>;
}
```

---

## Middleware protección

```ts
// middleware.ts
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (req.nextUrl.pathname.startsWith("/dashboard") && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*"] };
```

---

## Fetch con token

```tsx
async function getOrders() {
  const session = await getServerSession();
  const token = (session as any).accessToken;

  const res = await fetch(`${process.env.API_URL}/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}
```

---

## Check

- [ ] Callback jwt para qué? → Adjuntar accessToken al token
- [ ] Middleware para qué? → Redirigir si no autenticado

**Mini-reto**: protege `/dashboard` y muestra email + roles.
