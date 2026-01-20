# Build Stage
FROM node:22-slim as builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies para el build)
RUN npm ci --prefer-offline --no-audit

# Copiar el resto del código fuente
COPY . .

# Construir la aplicación React
RUN npm run build

# Production Stage
FROM node:22-slim

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production --prefer-offline --no-audit

# Copiar el build de React desde el stage anterior
COPY --from=builder /app/build ./build

# Copiar el código del servidor
COPY server ./server

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Exponer el puerto
EXPOSE 3000

# Healthcheck simple sin curl
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Iniciar el servidor
CMD ["node", "server/index.js"]
