# Étape 1 : Build avec Vite
FROM node:20-slim AS builder

WORKDIR /app

# Installer les dépendances
COPY package*.json ./
RUN npm ci

# Copier le reste et construire le frontend
COPY . .
RUN npm run build

# Étape 2 : Serveur statique minimal (nginx)
FROM nginx:alpine

# Copier les fichiers buildés vers le dossier nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# (Facultatif) Remplacer config nginx par une version custom si besoin
# COPY nginx.prod.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
