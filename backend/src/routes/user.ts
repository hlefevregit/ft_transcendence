import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

interface CustomFastifyInstance extends FastifyInstance {
  authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
}

export async function setupUserRoutes(fastify: CustomFastifyInstance) {
  // ✅ GET user from JWT token
  fastify.get('/api/me', { preValidation: [fastify.authenticate] }, async (req, reply) => {
    console.log("Payload:", req.user);
    const userId = (req.user as any).id;

    console.log('✅ User routes registered');
    const user = await fastify.prisma.user.findUnique({
      where: { id: userId },
    });

    console.log('id = ', userId);
    console.log('✅ User found:', user);
    if (!user) {
      return reply.status(404).send({ message: 'User not found' });
    }

    console.log('✅ User found');
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
}
