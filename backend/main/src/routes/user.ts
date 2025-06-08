import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

interface CustomFastifyInstance extends FastifyInstance {
  authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
}

export async function setupUserRoutes(fastify: CustomFastifyInstance) {
  // ✅ GET user from JWT token
  fastify.get('/api/me', { preValidation: [fastify.authenticate] }, async (req, reply) => {
    // console.log("Payload:", req.user);
    const userId = (req.user as any).id;

    const user = await fastify.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        pseudo: true,
        avatarUrl: true,
        status: true,
        twoFAEnabled: true,
      },
    });
    // console.log('id = ', userId);
    // console.log('✅ User found:', user);
    if (!user) {
      return reply.status(404).send({ message: 'User not found' });
    }

    // console.log('✅ User found');
    return reply.send(user);
  });

  // ✅ PUT update user (only self)
  fastify.put(
    '/api/user/me',
    { preValidation: [fastify.authenticate] },
    async (req, reply) => {
      const userId = (req.user as any).id;
      const { pseudo, avatarUrl, status } = req.body as {
        pseudo?: string;
        avatarUrl?: string;
        status?: string;
      };

      // 1) pseudo ≤ 16 chars
      if (pseudo && pseudo.length > 16) {
        return reply
          .status(400)
          .send({ message: 'Username too long (max 16 characters).' });
      }

      // 2) avatar must be either a data-URI (jpeg/png) OR a URL/path
      if (avatarUrl) {
        const isDataURI =
          avatarUrl.startsWith('data:image/jpeg') ||
          avatarUrl.startsWith('data:image/png');
        const isURL = avatarUrl.startsWith('http') || avatarUrl.startsWith('/');
        if (!isDataURI && !isURL) {
          return reply
            .status(400)
            .send({
              message:
                'Invalid avatar format: only JPG/PNG data-URIs or URLs are allowed.',
            });
        }
      }

      // 3) check pseudo uniqueness
      if (pseudo) {
        const existing = await fastify.prisma.user.findUnique({
          where: { pseudo },
        });
        if (existing && existing.id !== userId) {
          return reply.status(400).send({ message: 'Username already taken.' });
        }
      }

      // 4) perform the update
      try {
        const updated = await fastify.prisma.user.update({
          where: { id: userId },
          data: { pseudo, avatarUrl, status },
        });
        return reply.send(updated);
      } catch (err: any) {
        fastify.log.error(err);
        return reply
          .status(400)
          .send({ message: 'Update failed.', error: err.message });
      }
    }
  );



  fastify.delete(
    '/api/user/me',
    { preValidation: [fastify.authenticate] },
    async (req, reply) => {
      const userId = (req.user as any).id

      // 1) Supprime toutes les demandes d'ami
      try {
        const delReq = await fastify.prisma.friendRequest.deleteMany({
          where: {
            OR: [
              { fromUserId: userId },
              { toUserId: userId },
            ],
          },
        })
        fastify.log.info({ delReq }, 'friendRequest.deleteMany succeeded')
      } catch (e: any) {
        console.error('❌ Erreur deleteMany(friendRequest) :', e)
        return reply.status(500).send({
          message: 'Error deleting friend requests',
          detail: e.message,
        })
      }

      // 2) Vide la relation many-to-many et met à blanc le reste
      try {
        const upd = await fastify.prisma.user.update({
          where: { id: userId },
          data: {
            friends: { set: [] },
            email: `deleted_${userId}_${Date.now()}@deleted.local`,
            status: null,
            password: null,
            twoFAEnabled: false,
            twoFASecret: null,
          },
        })
        fastify.log.info({ upd }, 'user.update succeeded')
        return reply.status(204).send()
      } catch (e: any) {
        console.error('❌ Erreur user.update :', e)
        return reply.status(500).send({
          message: 'Error updating user record',
          detail: e.message,
        })
      }
    }
  )


}
