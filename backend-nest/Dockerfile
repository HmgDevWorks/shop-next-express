FROM node:22

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
# RUN npm ci --only=production
RUN pnpm install --frozen-lockfile --shamefully-hoist

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN pnpm run build

# Ahora instalamos SOLO las dependencias de producción
# Esto reemplaza node_modules con solo las de producción
# Usamos --shamefully-hoist para crear node_modules plano (como npm)
#RUN rm -rf node_modules && \
#    pnpm install --prod --frozen-lockfile --shamefully-hoist

# Verificar que @nestjs/core está instalado (para debug)
RUN ls -la node_modules/@nestjs/ || (echo "ERROR: @nestjs no encontrado" && ls -la node_modules/ | head -20)

# Expose port
EXPOSE 3001

# Start the application
CMD ["pnpm", "start:dev"]