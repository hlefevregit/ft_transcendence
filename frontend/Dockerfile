# Étape 1 : Build avec Vite
FROM node:20-slim AS builder

WORKDIR /app

# Installer les dépendances
COPY package*.json ./
RUN npm ci

# Copier le reste et construire le frontend
COPY . .

# Build avec Vite (génère /dist)
RUN npm run build

# Étape 2 : Serveur statique avec nginx
FROM nginx:alpine

# Copier les fichiers buildés vers le dossier nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Facultatif : copie d’un nginx.conf custom
COPY ./nginx_conf/nginx.prod.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
