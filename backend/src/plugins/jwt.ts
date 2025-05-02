// backend/src/plugins/jwt.ts
import fastifyJwt from '@fastify/jwt';
import { FastifyInstance } from 'fastify';
import { JWT_SECRET } from '../config/env';

export const setupJwt = (fastify: FastifyInstance) => {
  // Enregistre le plugin JWT avec ta clé secrète
  fastify.register(fastifyJwt, { secret: JWT_SECRET });

  // Décore l'instance Fastify avec une méthode `authenticate` utilisable comme middleware
  fastify.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });
};
