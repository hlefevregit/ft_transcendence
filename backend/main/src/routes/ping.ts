import { FastifyInstance } from 'fastify';

export const setupPingRoute = (fastify: FastifyInstance) => {
  fastify.get('/api/ping', async (request, reply) => {
    reply.send({ success: true, message: 'pong' });
  });
};
