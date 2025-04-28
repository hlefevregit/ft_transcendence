import Fastify from 'fastify';
import fs from 'fs';
import path from 'path';

import { setupGlobalErrorHandling } from './utils/errorHandler';
import { setupCors } from './plugins/cors';
import { setupJwt } from './plugins/jwt';
import { setupWebsocket } from './plugins/websocket';
import { setupStaticFiles } from './plugins/static';
import { setupAuthRoutes } from './routes/auth';
import { setupRegisterRoute } from './routes/register';
import { setupPingRoute } from './routes/ping';
import { dbPromise } from './db/database'; // assure l'init DB
import './config/env'; // charge .env

setupGlobalErrorHandling();

const fastify = Fastify({
  logger: true,
  https: {
	key: fs.readFileSync(path.join(__dirname, '../certs/key.pem')),
	cert: fs.readFileSync(path.join(__dirname, '../certs/cert.pem')),
  }
});

// Plugins
setupCors(fastify);
setupJwt(fastify);
setupWebsocket(fastify);
setupStaticFiles(fastify);

// Routes
setupAuthRoutes(fastify);
setupRegisterRoute(fastify);
setupPingRoute(fastify);

// Lancement du serveur
const start = async () => {
  try {
	await fastify.listen({ port: 3000, host: '0.0.0.0' });
	fastify.log.info('✅ Server running at https://localhost:3000');
  } catch (err) {
	fastify.log.error(err);
	process.exit(1);
  }
};

start();
