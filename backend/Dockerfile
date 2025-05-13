# Étape 1 : Build avec TypeScript
FROM node:20-slim AS builder

WORKDIR /app

# Dépendances système minimales
RUN apt-get update && apt-get install -y \
  openssl \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Copier package.json et lock pour cache npm
COPY package*.json ./
RUN npm ci --omit=dev

# Copier le code et build
COPY . .

# Génération des Prisma clients + build
RUN npm run build && npx prisma generate

# Étape 2 : Exécution prod allégée
FROM node:20-slim

WORKDIR /app

COPY --from=builder /app /app

# Réutiliser uniquement les dépendances prod
RUN npm ci --omit=dev && npm cache clean --force

# Expose le port d'écoute
EXPOSE 3000

CMD ["npm", "start"]
