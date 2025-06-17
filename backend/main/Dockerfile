FROM node:20-slim

WORKDIR /app

# Copie les fichiers nécessaires
COPY package*.json ./
RUN npm install --omit=dev

# ✅ Ajout de OpenSSL dans l'image finale (nécessaire pour Prisma)
RUN apt-get update && apt-get install -y openssl

# 📦 Copie ce que tu as buildé en local
COPY dist ./dist
COPY node_modules/.prisma ./node_modules/.prisma
COPY node_modules/@prisma ./node_modules/@prisma
COPY config/prod.ecosystem.config.js ./

EXPOSE 3000

CMD ["node", "dist/server.js"]
