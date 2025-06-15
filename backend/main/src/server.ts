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
import './config/env'; // charge .env
import prismaPlugin from './plugins/prisma'; // Prisma DB
import { setupUserRoutes } from './routes/user';
import { setupFriendRoutes } from './routes/friends';
import metricsPlugin from 'fastify-metrics';
import { setup2FARoutes } from './routes/2fa';
import { setupPongRoutes } from './routes/pong';
import { setupMessageRoutes } from './routes/message';




setupGlobalErrorHandling();

const fastify = Fastify({
  logger: true,
  https: {
	key: fs.readFileSync(path.join(__dirname, '../certs/key.pem')),
	cert: fs.readFileSync(path.join(__dirname, '../certs/cert.pem')),
  }
});

fastify.register(metricsPlugin, {
  endpoint: '/metrics',
});



// Lancement du serveur
const start = async () => {
  try {
    // Plugins
    setupCors(fastify);
    setupJwt(fastify);
    setupWebsocket(fastify);
    fastify.register(prismaPlugin);
    await fastify.register(setupUserRoutes as any);
    
    // Routes
    setupAuthRoutes(fastify);
    setupRegisterRoute(fastify);
    setupPingRoute(fastify);
    await fastify.register(setupFriendRoutes as any);
    await fastify.register(setup2FARoutes as any);
    await fastify.register(setupPongRoutes as any); // Assurez-vous que cette fonction est définie dans votre code
    await fastify.register(setupMessageRoutes as any);

    setupStaticFiles(fastify);
    await fastify.ready(); // ✅ après tous les .register()
    console.log(fastify.printRoutes());
    
    fastify.ready().then(() => {
      console.log(fastify.printRoutes());
    });
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    fastify.log.info('✅ Server running at https://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
