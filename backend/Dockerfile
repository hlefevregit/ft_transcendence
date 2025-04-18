FROM node:18-slim AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx tsc --pretty

FROM node:18-slim

WORKDIR /app
COPY --from=builder /app/dist /app
COPY package*.json ./
RUN npm install --only=production

EXPOSE 3000
CMD ["node", "server.js"]