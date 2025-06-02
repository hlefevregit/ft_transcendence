import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';



interface CustomFastifyInstance extends FastifyInstance {
  authenticate: (req: FastifyRequest, rep: FastifyReply) => Promise<void>;
}

export async function setupFriendRoutes(fastify: CustomFastifyInstance) {
  // Middleware de protection
  const auth = { preValidation: [fastify.authenticate] };

  // Envoyer une demande d'ami
  fastify.post('/api/friends/request', auth, async (req, reply) => {
    
	const { pseudo } = req.body as { pseudo: string };
	const user = req.user as { id: number };

	const fromUserId = user.id;

	const targetUser = await fastify.prisma.user.findUnique({
		where: { pseudo },
	});

	if (!targetUser) {
		return reply.status(404).send({ message: "Utilisateur cible introuvable." });
	}

	const toUserId = targetUser.id;

	if (fromUserId === toUserId) {
		return reply.status(400).send({ message: 'Vous ne pouvez pas vous envoyer une demande d\'ami.' });
	}

	const existingRequest = await fastify.prisma.friendRequest.findFirst({
		where : {
			OR : [
				{ fromUserId, toUserId },
				{ fromUserId: toUserId, toUserId: fromUserId },	
			],

		},
	});

	if (existingRequest) {
		return reply.status(400).send({ message: 'Une demande d\'ami existe déjà.' });
	}

	const request = await fastify.prisma.friendRequest.create({
		data:{
			fromUserId,
			toUserId,
		},
	});

	return reply.send({ message: 'Demande d\'ami envoyée.', request });

  });

fastify.post('/api/friends/request/:id/accept', auth, async (req, reply) => {
	const { id } = req.params as { id: string };
	const requestId = parseInt(id, 10);
	const user = req.user as { id: number };
	const toUserId = user.id;
  
	// 🧠 Récupérer la demande avec son ID
	const request = await fastify.prisma.friendRequest.findUnique({
	  where: { id: requestId },
	});
  
	if (!request) {
	  return reply.status(404).send({ message: 'Demande introuvable.' });
	}
  
	// ✅ Vérifier que c’est bien ce user qui est censé l’accepter
	if (request.toUserId !== toUserId) {
	  return reply.status(403).send({ message: 'Accès non autorisé.' });
	}
  
	const fromUserId = request.fromUserId;
  
	// ✅ Connexion bidirectionnelle
	await fastify.prisma.user.update({
	  where: { id: fromUserId },
	  data: {
		friends: {
		  connect: { id: toUserId },
		},
	  },
	});
  
	await fastify.prisma.user.update({
	  where: { id: toUserId },
	  data: {
		friends: {
		  connect: { id: fromUserId },
		},
	  },
	});
  
	// ✅ Mettre à jour le statut ou supprimer la requête (au choix)
	await fastify.prisma.friendRequest.update({
	  where: { id: request.id },
	  data: { status: 'accepted' },
	});
  
	return reply.send({ message: 'Demande d\'ami acceptée.' });
  });

  // Supprimer ou refuser une demande d'ami
  fastify.delete('/api/friends/:id', auth, async (req, reply) => {

	const { id } = req.params as { id: string };
	const userId = parseInt(id, 10);
	const meId = (req.user as { id: number }).id;

	try {
		// Supprime relation d’amitié si elle existe
		await fastify.prisma.user.update({
		  where: { id: meId },
		  data: {
			friends: { disconnect: { id: userId } },
		  },
		});
	
		await fastify.prisma.user.update({
		  where: { id: userId },
		  data: {
			friends: { disconnect: { id: meId } },
		  },
		});
	
		// Supprime toutes demandes entre les deux
		await fastify.prisma.friendRequest.deleteMany({
		  where: {
			OR: [
			  { fromUserId: meId, toUserId: userId },
			  { fromUserId: userId, toUserId: meId },
			],
		  },
		});

		return reply.send({ message: 'Relation supprimée.' });
	} catch (err) {
		console.error('❌ Error deleting friend:', err);
		return reply.status(500).send({ message: 'Erreur lors de la suppression de la relation.' });
	}

  });

  // Récupérer les amis et demandes
  fastify.get('/api/friends', auth, async (req, reply) => {
	const userx = req.user as { id: number }; // Ajoute ce cast localement

    const userId = userx.id as number;

    const user = await fastify.prisma.user.findUnique({
      where: { id: userId },
      include: {
        friends: true,
        sentRequests: {
          where: { status: 'pending' },
          include: { toUser: true },
        },
        receivedRequests: {
          where: { status: 'pending' },
          include: { fromUser: true },
        },
      },
    });

    if (!user) return reply.status(404).send({ message: 'Utilisateur introuvable' });

    return reply.send({
      friends: user.friends,
      sentRequests: user.sentRequests.map((r) => r.toUser),
      receivedRequests: user.receivedRequests.map((r) => r.fromUser),
    });
  });

  // Récupérer les requests

  fastify.get('/api/friends/requests/received', auth, async (req, reply) => {

	const user = req.user as { id: number };
	const userId = user.id as number;
	const requests = await fastify.prisma.friendRequest.findMany({
		where: {
			toUserId: userId,
			status: 'pending',
		},
		include: {
			fromUser: true,
		},
	});
	if (!requests) return reply.status(404).send({ message: 'Aucune demande trouvée' });
	return requests.map((request) => ({
		id: request.id,
		from: {
			id: request.fromUser.id,
			pseudo: request.fromUser.pseudo,
			avatarUrl: request.fromUser.avatarUrl,
		},
	}));
  });

  fastify.get('/api/friends/requests/sent', { preValidation: [fastify.authenticate] }, async (req, reply) => {
	const user = req.user as { id: number };
	const userId = user.id as number;
  
	const requests = await fastify.prisma.friendRequest.findMany({
	  where: { fromUserId: userId },
	  include: { toUser: true },
	});
	return requests.map((r) => ({
	  id: r.id,
	  to: {
		id: r.toUser.id,
		pseudo: r.toUser.pseudo,
		avatarUrl: r.toUser.avatarUrl,
	  },
	}));
  });
  fastify.post('/api/games', async (req, res) => {
		try {
			const { player1Id, player2Id, player1Score, player2Score, winnerId, reason, gameId } = req.body as any;

			console.log("📥 API received game result:", req.body);

			const result = await fastify.prisma.gameResult.create({
			data: {
				id: gameId || undefined, // Si gameId est fourni, l'utiliser, sinon laisser Prisma en générer un 
				player1Id: player1Id,
				player2Id: player2Id,
				player1Score: player1Score,
				player2Score: player2Score,
				winnerId: winnerId,
				reason: reason || 'normal',
				
			},
			});

			console.log("✅ Game saved:", result);
			return res.status(201).send(result);

		} catch (err: any) {
			console.error("❌ Error in /api/games:", err);

			// Sécurité : renvoie toujours une réponse
			return res.status(500).send({
			error: 'Internal server error',
			detail: err?.message || 'Unknown error',
			});
		}
  	});

}

