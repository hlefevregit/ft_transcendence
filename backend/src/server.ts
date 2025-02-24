// src/server.ts
import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyCors from '@fastify/cors';
import fastifyWebsocket from '@fastify/websocket';
import fastifyStatic from '@fastify/static';
import path from 'path';

const fastify = Fastify({ logger: true });

// Configuration CORS pour autoriser le frontend
fastify.register(fastifyCors, {
  origin: 'http://localhost:8080' // ou ton URL de production
});

// Plugin JWT avec une clé secrète
fastify.register(fastifyJwt, {
  secret: 'supersecretkey'
});

// Plugin WebSocket
fastify.register(fastifyWebsocket);

fastify.register(fastifyStatic, {
  root: path.join(process.cwd(), 'public'),
  prefix: '/',
});

fastify.post('/api/login', async (request, reply) => {
  const { email, password } = request.body as { email: string; password: string };

  if (email === 'user@example.com' && password === 'password123') {
    const token = fastify.jwt.sign({ email });
    return reply.send({ success: true, token });
  } else {
    return reply.status(401).send({ success: false, message: 'Invalid credentials' });
  }
});

// Endpoint WebSocket pour la communication en temps réel
fastify.get('/ws', { websocket: true } as any, (connection, req) => {
  fastify.log.info('WebSocket connection established');
  connection.on('message', (message: any) => {
    fastify.log.info(`Received message: ${message}`);
    connection.send(`Server received: ${message}`);
  });
});

// Démarrage du serveur
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    fastify.log.info(`Server is running on port 3000`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();