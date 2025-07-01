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

    // ─── GET /api/user/history ───
  fastify.get(
    '/api/user/history',
    { preValidation: [fastify.authenticate] },
    async (req, reply) => {
      const userId = (req.user as any).id;

      // 1) Récupérer pseudo et avatar de l'utilisateur
      const meUser = await fastify.prisma.user.findUnique({
        where: { id: userId },
        select: { pseudo: true, avatarUrl: true }
      });
      if (!meUser) {
        return reply.status(404).send({ message: 'User not found' });
      }
      const myPseudo = meUser.pseudo;
      const myAvatar = meUser.avatarUrl;

      // 2) Récupérer toutes les parties où il a joué
      const games = await fastify.prisma.gameResult.findMany({
        where: {
          OR: [
            { player1Id: userId },
            { player2Id: userId }
          ]
        },
        orderBy: { createdAt: 'desc' }
      });

      // 3) Calculer stats
      let wins = 0;
      let losses = 0;
      const trophies = 0; // placeholder

      // 4) Construire le tableau de matches
      const matches = await Promise.all(
        games.map(async (g) => {
          const isP1 = g.player1Id === userId;
          const userScore     = isP1 ? g.player1Score   : g.player2Score;
          const opponentScore = isP1 ? g.player2Score   : g.player1Score;
          const opponentPseudo = String(isP1 ? g.player2Id : g.player1Id);

          // avatar de l'adversaire
          const oppUser = await fastify.prisma.user.findUnique({
            where: { pseudo: opponentPseudo },
            select: { avatarUrl: true }
          });

          // récupérer les IDs numériques pour la comparaison
          const meUserId = userId;
          // On suppose que g.player1Id et g.player2Id sont des pseudos, donc il faut récupérer l'ID de l'adversaire
          const opponentUser = await fastify.prisma.user.findUnique({
            where: { pseudo: opponentPseudo },
            select: { id: true }
          });
          const opponentUserId = opponentUser?.id;

          // déterminer résultat d'après winnerId, pas le score
          let result: 'win' | 'loss' | 'draw';
          if (g.winnerId === meUserId) {
            result = 'win';
            wins++;
          } else if (String(g.winnerId) === String(opponentUserId)) {
            result = 'loss';
            losses++;
          } else {
            result = 'draw';
          }

          // formater la date jj/MM/yy
          const d = g.createdAt;
          const day   = String(d.getDate()).padStart(2, '0');
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const year  = String(d.getFullYear()).slice(-2);
          const date  = `${day}/${month}/${year}`;

          return {
            id: g.id,
            user: {
              pseudo: myPseudo,
              avatarUrl: myAvatar
            },
            opponent: {
              pseudo: opponentPseudo,
              avatarUrl: oppUser?.avatarUrl
            },
            userScore,
            opponentScore,
            result,
            date,
            reason: g.reason
          };
        })
      );

      // 5) Envoyer la réponse
      return reply.send({
        stats: { wins, losses, trophies },
        matches
      });
    }
  );
}
