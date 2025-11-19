@echo off
REM 🚀 Script automático para crear proyecto Next.js + Express + TypeScript + Tailwind + PostgreSQL + Prisma
REM Solo ejecuta: setup.bat

echo 🎯 Creando proyecto de e-commerce moderno...
echo ================================================

REM Crear directorios
echo 📁 Creando estructura de directorios...
mkdir frontend 2>nul
mkdir backend 2>nul
mkdir shared 2>nul
mkdir shared\types 2>nul

REM Inicializar Git
echo 🔧 Inicializando Git...
git init
echo node_modules/ > .gitignore
echo .env >> .gitignore
echo dist/ >> .gitignore
echo .next/ >> .gitignore
echo *.log >> .gitignore

REM Crear docker-compose.yml
echo 🐳 Configurando Docker...
(
echo version: "3.8"
echo.
echo services:
echo   postgres:
echo     image: postgres:15-alpine
echo     container_name: shop_postgres
echo     environment:
echo       POSTGRES_DB: shop_db
echo       POSTGRES_USER: shop_user
echo       POSTGRES_PASSWORD: shop_password
echo     ports:
echo       - "5432:5432"
echo     volumes:
echo       - postgres_data:/var/lib/postgresql/data
echo.
echo volumes:
echo   postgres_data:
) > docker-compose.yml

REM Crear .env.example
echo 🔐 Creando variables de entorno...
(
echo # Database
echo DATABASE_URL="postgresql://shop_user:shop_password@localhost:5432/shop_db?schema=public"
echo.
echo # JWT
echo JWT_SECRET="your-super-secret-jwt-key-here"
echo JWT_EXPIRES_IN="7d"
echo.
echo # API
echo PORT=3001
echo NODE_ENV="development"
echo.
echo # CORS
echo FRONTEND_URL="http://localhost:3000"
echo.
echo # NextAuth
echo NEXTAUTH_SECRET="your-nextauth-secret"
echo NEXTAUTH_URL="http://localhost:3000"
) > .env.example

REM Crear tipos compartidos
echo 📝 Creando tipos compartidos...
(
echo export interface User {
echo   id: string;
echo   email: string;
echo   name: string;
echo   role: "USER" ^| "ADMIN";
echo   createdAt: Date;
echo   updatedAt: Date;
echo }
echo.
echo export interface Product {
echo   id: string;
echo   name: string;
echo   description: string;
echo   price: number;
echo   stock: number;
echo   category: string;
echo   images: string[];
echo   createdAt: Date;
echo   updatedAt: Date;
echo }
echo.
echo export interface ApiResponse^<T = any^> {
echo   success: boolean;
echo   data?: T;
echo   message?: string;
echo   errors?: string[];
echo }
) > shared\types\index.ts

REM Configurar Frontend (Next.js)
echo 🎨 Configurando Frontend (Next.js)...
cd frontend

REM Crear Next.js app
echo 📦 Creando Next.js app...
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes

REM Instalar dependencias adicionales
echo 📦 Instalando dependencias adicionales...
npm install @next-auth/prisma-adapter next-auth
npm install @hookform/resolvers react-hook-form zod
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-toast
npm install lucide-react
npm install zustand
npm install axios
npm install @tanstack/react-query

REM Configurar tsconfig.json
echo ⚙️ Configurando TypeScript...
(
echo {
echo   "compilerOptions": {
echo     "target": "es5",
echo     "lib": ["dom", "dom.iterable", "es6"],
echo     "allowJs": true,
echo     "skipLibCheck": true,
echo     "strict": true,
echo     "noEmit": true,
echo     "esModuleInterop": true,
echo     "module": "esnext",
echo     "moduleResolution": "bundler",
echo     "resolveJsonModule": true,
echo     "isolatedModules": true,
echo     "jsx": "preserve",
echo     "incremental": true,
echo     "plugins": [
echo       {
echo         "name": "next"
echo       }
echo     ],
echo     "baseUrl": ".",
echo     "paths": {
echo       "@/*": ["./src/*"],
echo       "@/shared/*": ["../shared/*"]
echo     }
echo   },
echo   "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
echo   "exclude": ["node_modules"]
echo }
) > tsconfig.json

cd ..

REM Configurar Backend (Express)
echo ⚙️ Configurando Backend (Express)...
cd backend

REM Inicializar npm
echo 📦 Inicializando proyecto Express...
npm init -y

REM Instalar dependencias
echo 📦 Instalando dependencias...
npm install express cors helmet morgan compression
npm install jsonwebtoken bcryptjs
npm install zod express-validator
npm install prisma @prisma/client
npm install dotenv

REM Dependencias de desarrollo
npm install -D typescript @types/node @types/express @types/cors
npm install -D @types/jsonwebtoken @types/bcryptjs
npm install -D @types/morgan @types/compression
npm install -D ts-node nodemon
npm install -D jest @types/jest supertest @types/supertest

REM Configurar tsconfig.json
echo ⚙️ Configurando TypeScript...
(
echo {
echo   "compilerOptions": {
echo     "target": "ES2020",
echo     "module": "commonjs",
echo     "lib": ["ES2020"],
echo     "outDir": "./dist",
echo     "rootDir": "./src",
echo     "strict": true,
echo     "esModuleInterop": true,
echo     "skipLibCheck": true,
echo     "forceConsistentCasingInFileNames": true,
echo     "resolveJsonModule": true,
echo     "declaration": true,
echo     "declarationMap": true,
echo     "sourceMap": true,
echo     "baseUrl": ".",
echo     "paths": {
echo       "@/*": ["./src/*"],
echo       "@/shared/*": ["../shared/*"]
echo     }
echo   },
echo   "include": ["src/**/*"],
echo   "exclude": ["node_modules", "dist", "**/*.test.ts"]
echo }
) > tsconfig.json

REM Configurar package.json scripts
echo 📝 Configurando scripts...
(
echo {
echo   "name": "backend",
echo   "version": "1.0.0",
echo   "description": "",
echo   "main": "index.js",
echo   "scripts": {
echo     "dev": "nodemon src/server.ts",
echo     "build": "tsc",
echo     "start": "node dist/server.js",
echo     "test": "jest",
echo     "test:watch": "jest --watch",
echo     "db:generate": "prisma generate",
echo     "db:push": "prisma db push",
echo     "db:migrate": "prisma migrate dev",
echo     "db:studio": "prisma studio"
echo   },
echo   "keywords": [],
echo   "author": "",
echo   "license": "ISC",
echo   "dependencies": {
echo     "express": "^4.18.2",
echo     "cors": "^2.8.5",
echo     "helmet": "^7.1.0",
echo     "morgan": "^1.10.0",
echo     "compression": "^1.7.4",
echo     "jsonwebtoken": "^9.0.2",
echo     "bcryptjs": "^2.4.3",
echo     "zod": "^3.22.4",
echo     "express-validator": "^7.0.1",
echo     "prisma": "^5.7.1",
echo     "@prisma/client": "^5.7.1",
echo     "dotenv": "^16.3.1"
echo   },
echo   "devDependencies": {
echo     "typescript": "^5.3.3",
echo     "@types/node": "^20.10.5",
echo     "@types/express": "^4.17.21",
echo     "@types/cors": "^2.8.17",
echo     "@types/jsonwebtoken": "^9.0.5",
echo     "@types/bcryptjs": "^2.4.6",
echo     "@types/morgan": "^1.9.9",
echo     "@types/compression": "^1.7.5",
echo     "ts-node": "^10.9.2",
echo     "nodemon": "^3.0.2",
echo     "jest": "^29.7.0",
echo     "@types/jest": "^29.5.8",
echo     "supertest": "^6.3.3",
echo     "@types/supertest": "^2.0.16"
echo   }
echo }
) > package.json

REM Crear estructura de directorios
echo 📁 Creando estructura de directorios...
mkdir src 2>nul
mkdir src\controllers 2>nul
mkdir src\services 2>nul
mkdir src\routes 2>nul
mkdir src\middleware 2>nul
mkdir src\types 2>nul
mkdir src\utils 2>nul

REM Crear servidor principal
echo 🚀 Creando servidor Express...
(
echo import express from "express";
echo import cors from "cors";
echo import helmet from "helmet";
echo import morgan from "morgan";
echo import compression from "compression";
echo import dotenv from "dotenv";
echo.
echo dotenv.config^(^);
echo.
echo const app = express^(^);
echo const PORT = process.env.PORT ^|^| 3001;
echo.
echo // Middleware global
echo app.use^(helmet^(^)^);
echo app.use^(compression^(^)^);
echo app.use^(morgan^("combined"^)^);
echo app.use^(
echo   cors^({
echo     origin: process.env.FRONTEND_URL ^|^| "http://localhost:3000",
echo     credentials: true,
echo   }^)
echo ^);
echo app.use^(express.json^({ limit: "10mb" }^)^);
echo app.use^(express.urlencoded^({ extended: true }^)^);
echo.
echo // Ruta de health check
echo app.get^("/api/health", ^(req, res^) =^> {
echo   res.json^({ status: "OK", timestamp: new Date^(^).toISOString^(^) }^);
echo }^);
echo.
echo // Manejo de rutas no encontradas
echo app.use^("*", ^(req, res^) =^> {
echo   res.status^(404^).json^({ message: "Route not found" }^);
echo }^);
echo.
echo app.listen^(PORT, ^(^) =^> {
echo   console.log^(`🚀 Server running on port ${PORT}`^);
echo   console.log^(`📊 Health check: http://localhost:${PORT}/api/health`^);
echo }^);
) > src\server.ts

REM Configurar Prisma
echo 🗄️ Configurando Prisma...
npx prisma init

REM Configurar .env
echo 🔐 Configurando variables de entorno...
(
echo # Database
echo DATABASE_URL="postgresql://shop_user:shop_password@localhost:5432/shop_db?schema=public"
echo.
echo # JWT
echo JWT_SECRET="your-super-secret-jwt-key-here"
echo JWT_EXPIRES_IN="7d"
echo.
echo # API
echo PORT=3001
echo NODE_ENV="development"
echo.
echo # CORS
echo FRONTEND_URL="http://localhost:3000"
) > .env

REM Configurar Prisma schema
echo 📝 Configurando Prisma schema...
(
echo generator client {
echo   provider = "prisma-client-js"
echo }
echo.
echo datasource db {
echo   provider = "postgresql"
echo   url      = env^("DATABASE_URL"^)
echo }
echo.
echo // Los modelos se agregarán después
) > prisma\schema.prisma

cd ..

REM Crear script de desarrollo
echo 🚀 Creando script de desarrollo...
(
echo @echo off
echo echo 🐳 Starting Docker containers...
echo docker-compose up -d
echo.
echo echo ⏳ Waiting for PostgreSQL...
echo timeout /t 10 /nobreak ^>nul
echo.
echo echo 🔧 Generating Prisma client...
echo cd backend
echo npm run db:generate
echo.
echo echo 🚀 Starting backend...
echo start "Backend" cmd /k "npm run dev"
echo.
echo echo 🎨 Starting frontend...
echo cd ../frontend
echo start "Frontend" cmd /k "npm run dev"
echo.
echo echo ✅ Development servers started!
echo echo Backend: http://localhost:3001
echo echo Frontend: http://localhost:3000
echo echo Database: localhost:5432
echo pause
) > start-dev.bat

REM Crear README
echo 📝 Creando README...
(
echo # 🛍️ E-commerce Moderno
echo.
echo Proyecto de e-commerce con Next.js + Express + TypeScript + Tailwind + PostgreSQL + Prisma
echo.
echo ## 🚀 Inicio rápido
echo.
echo ```bash
echo # 1. Iniciar base de datos
echo docker-compose up -d
echo.
echo # 2. Generar cliente de Prisma
echo cd backend ^&^& npm run db:generate
echo.
echo # 3. Iniciar todo el entorno
echo start-dev.bat
echo ```
echo.
echo ## 📋 URLs
echo.
echo - **Frontend**: http://localhost:3000
echo - **Backend**: http://localhost:3001
echo - **Database**: localhost:5432
echo - **Health Check**: http://localhost:3001/api/health
echo.
echo ## 🛠️ Comandos útiles
echo.
echo ```bash
echo # Solo base de datos
echo docker-compose up -d
echo.
echo # Solo backend
echo cd backend ^&^& npm run dev
echo.
echo # Solo frontend
echo cd frontend ^&^& npm run dev
echo.
echo # Prisma Studio
echo cd backend ^&^& npm run db:studio
echo ```
echo.
echo ## 🎯 Próximos pasos
echo.
echo 1. Configurar modelos de Prisma
echo 2. Implementar autenticación
echo 3. Crear API endpoints
echo 4. Desarrollar frontend
) > README.md

echo.
echo 🎉 ¡Proyecto creado exitosamente!
echo ================================================
echo.
echo 📋 Para empezar:
echo 1. docker-compose up -d
echo 2. cd backend ^&^& npm run db:generate
echo 3. start-dev.bat
echo.
echo 🌐 URLs:
echo - Frontend: http://localhost:3000
echo - Backend: http://localhost:3001
echo - Database: localhost:5432
echo.
echo ¡Listo para desarrollar! 🚀
pause
