# Build Stage
FROM node:20-slim as builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies para el build)
RUN npm ci

# Copiar el resto del código fuente
COPY . .

# Construir la aplicación React
RUN npm run build

# Production Stage
FROM node:20-slim

WORKDIR /app

# Instalar dependencias necesarias para producción (si las hay)
# apt-get update && apt-get install -y ... && rm -rf /var/lib/apt/lists/*

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production

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

# Healthcheck para asegurar que el servicio está listo
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Iniciar el servidor
CMD ["node", "server/index.js"]
