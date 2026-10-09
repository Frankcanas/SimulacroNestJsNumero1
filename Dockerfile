# Etapa 1: Construcción
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

# Etapa 2: Imagen de ejecución para producción
FROM node:22-alpine AS production

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --omit=dev --legacy-peer-deps && npm cache clean --force

COPY --from=builder /usr/src/app/dist ./dist

USER node

EXPOSE 3000

CMD ["node", "dist/main.js"]
