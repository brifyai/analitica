# Build Stage
FROM node:20-alpine as builder

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
FROM node:20-alpine

WORKDIR /app

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

# Exponer el puerto
EXPOSE 3000

# Iniciar el servidor
CMD ["node", "server/index.js"]
