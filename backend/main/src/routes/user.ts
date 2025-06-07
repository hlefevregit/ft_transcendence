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
  fastify.put('/api/user/me', { preValidation: [fastify.authenticate] }, async (req, reply) => {
    const userId = (req.user as any).id;
    const { pseudo, avatarUrl, status } = req.body as {
      pseudo?: string;
      avatarUrl?: string;
      status?: string;
    };
    console.log('✅ User routes registered');

    const existingPseudo = pseudo
      ? await fastify.prisma.user.findFirst({
        where: { pseudo },
      })
      : null;
    if (existingPseudo && existingPseudo.id !== userId) {
      return reply.status(400).send({ message: 'Pseudo already taken' });
    }

    const user = req.user as { id: number; email: string };
    const existingEmail = await fastify.prisma.user.findUnique({
      where: { email: (req.user as any).email },
    });
    if (existingEmail && existingEmail.id !== userId) {
      return reply.status(400).send({ message: 'Email already taken' });
    }

    try {

      const user = await fastify.prisma.user.update({
        where: { id: userId },
        data: { pseudo, avatarUrl, status },
      });
      console.log('✅ User updated');
      return reply.send(user);
    } catch (err) {
      console.error('❌ Error updating user:', err);
      return reply.status(400).send({ message: 'Update failed', error: err });
    }
  });


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
            friends: { set: [] },   // vide le join-table implicite
            email: '',            // ou une valeur factice
            avatarUrl: null,
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
