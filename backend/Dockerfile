# Étape de build
FROM node:18-alpine AS builder
WORKDIR /app

# Copier les fichiers du backend
COPY backend/package*.json ./
RUN npm install

# Copier le code backend
COPY backend ./
RUN npx tsc --pretty

# Étape de production
FROM node:18-alpine
WORKDIR /app

# Copier uniquement les dépendances de production
COPY backend/package*.json ./
RUN npm install --production

# Copier le code compilé depuis l'étape de build
COPY --from=builder /app/dist ./dist

# Copier les fichiers du frontend (depuis le contexte racine)
COPY frontend /app/public

EXPOSE 3000
CMD [ "node", "dist/server.js" ]