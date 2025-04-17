#!/bin/bash

# Installe nodemon globalement pour être sûr
npm install -g typescript ts-node ts-node-dev pm2 fastify

# Installe les dépendances, y compris nodemon
npm install

npm run dev

# npx ts-node src/server.ts