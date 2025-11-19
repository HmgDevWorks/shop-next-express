# 🛍️ GUÍA COMPLETA: Next.js + Express + TypeScript + Tailwind + PostgreSQL + Prisma

## 🎯 LO QUE VAS A CREAR

Un proyecto de e-commerce con:

- **Frontend**: Next.js 14+ con TypeScript y Tailwind CSS
- **Backend**: Express.js con TypeScript
- **Base de datos**: PostgreSQL con Prisma ORM
- **Contenedores**: Docker para la base de datos

## 🚀 PASO A PASO

### 1. Crear estructura básica

```bash
mkdir shop-next-express
cd shop-next-express
mkdir frontend backend shared
git init
```

### 2. Docker para PostgreSQL

Crear `docker-compose.yml`:

```yaml
version: "3.8"
services:
  postgres:
    image: postgres:15-alpine
    container_name: shop_postgres
    environment:
      POSTGRES_DB: shop_db
      POSTGRES_USER: shop_user
      POSTGRES_PASSWORD: shop_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
volumes:
  postgres_data:
```

### 3. Frontend (Next.js)

```bash
cd frontend
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes
```

### 4. Backend (Express)

```bash
cd ../backend
npm init -y
npm install express cors helmet morgan compression jsonwebtoken bcryptjs zod express-validator prisma @prisma/client dotenv
npm install -D typescript @types/node @types/express @types/cors @types/jsonwebtoken @types/bcryptjs @types/morgan @types/compression ts-node nodemon
```

### 5. Configurar TypeScript (backend/tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/shared/*": ["../shared/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### 6. Configurar package.json (backend/package.json)

```json
{
  "name": "backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio"
  }
}
```

### 7. Crear estructura de directorios (backend)

```bash
mkdir -p src/{controllers,services,routes,middleware,types,utils}
```

### 8. Crear servidor Express (backend/src/server.ts)

```typescript
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware global
app.use(helmet());
app.use(compression());
app.use(morgan("combined"));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Ruta de health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Manejo de rutas no encontradas
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
```

### 9. Prisma

```bash
cd backend
npx prisma init
```

### 10. Configurar .env (backend/.env)

```env
DATABASE_URL="postgresql://shop_user:shop_password@localhost:5432/shop_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

### 11. Configurar Prisma schema (backend/prisma/schema.prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Los modelos se agregarán después
```

### 12. Tipos compartidos (shared/types/index.ts)

```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}
```

## 🚀 PARA INICIAR EL PROYECTO

### 1. Iniciar base de datos

```bash
docker-compose up -d
```

### 2. Generar cliente de Prisma

```bash
cd backend
npm run db:generate
```

### 3. Iniciar backend

```bash
cd backend
npm run dev
```

### 4. Iniciar frontend (en otra terminal)

```bash
cd frontend
npm run dev
```

## 📋 URLs

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Database**: localhost:5432
- **Health Check**: http://localhost:3001/api/health

## 🎯 Próximos pasos

1. Configurar modelos de Prisma
2. Implementar autenticación
3. Crear API endpoints
4. Desarrollar frontend

---

**¡Listo para desarrollar!** 🚀



