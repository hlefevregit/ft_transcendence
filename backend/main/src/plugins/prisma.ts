import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';
import { FastifyInstance } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
    systemUserId: number;
  }
}

export default fp(async (fastify: FastifyInstance, opts) => {
  // 1) Instanciation de Prisma
  const prisma = new PrismaClient();
  fastify.decorate('prisma', prisma);

  // 2) Décoration initiale de systemUserId
  //    on met une valeur temporaire, elle sera écrasée dans onReady
  fastify.decorate('systemUserId', 0);

  // 3) Au moment où Fastify est prêt, on crée (ou récupère) l’utilisateur « Système »
  fastify.addHook('onReady', async () => {
    const SYSTEM_PSEUDO = 'System';
    // Recherche d’un user existant
    let sys = await fastify.prisma.user.findUnique({
      where: { pseudo: SYSTEM_PSEUDO }
    });

    if (!sys) {
      // Création si absent
      sys = await fastify.prisma.user.create({
        data: {
          email:    'systeme@localhost',
          pseudo:   SYSTEM_PSEUDO,
          password: '' // ou null si tu acceptes
        }
      });
      fastify.log.info(`Utilisateur système créé avec id=${sys.id}`);
    } else {
      fastify.log.info(`Utilisateur système trouvé avec id=${sys.id}`);
    }

    // On garde l’ID dispo sur fastify
    fastify.systemUserId = sys.id;
  });

  // 4) Nettoyage à la fermeture
  fastify.addHook('onClose', async () => {
    await fastify.prisma.$disconnect();
  });
});
