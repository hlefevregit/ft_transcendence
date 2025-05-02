import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';
import { FastifyInstance } from 'fastify';


declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

export default fp(async (fastify: FastifyInstance, opts) => {
  const prisma = new PrismaClient();

  // Enregistre sur l'instance Fastify
  fastify.decorate('prisma', prisma);

  fastify.addHook('onClose', async () => {
    await fastify.prisma.$disconnect();
  });
});
