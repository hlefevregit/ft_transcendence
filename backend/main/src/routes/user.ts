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
			const userId = (req.user as any).id as number;

			// 1) Récupérer mes infos
			const me = await fastify.prisma.user.findUnique({
				where: { id: userId },
				select: { pseudo: true, avatarUrl: true }
			});
			if (!me) return reply.status(404).send({ message: 'User not found' });

			// 2) Récupérer toutes mes parties
			const games = await fastify.prisma.gameResult.findMany({
				where: {
					OR: [{ player1Id: userId }, { player2Id: userId }]
				},
				orderBy: { createdAt: 'desc' }
			});

			let wins = 0;
			let losses = 0;
			const trophies = 0; // placeholder

			// 3) Construire le tableau de matches
			const matches = await Promise.all(
				games.map(async g => {
					const isP1 = g.player1Id === userId;
					const userScore = isP1 ? g.player1Score : g.player2Score;
					const opponentScore = isP1 ? g.player2Score : g.player1Score;
					const opponentId = isP1 ? g.player2Id : g.player1Id;

					// on récupère l'adversaire PAR SON id
					const opp = await fastify.prisma.user.findUnique({
						where: { id: opponentId },
						select: { pseudo: true, avatarUrl: true }
					});

					// —> caster winnerId en nombre
					const winnerNum = Number(g.winnerId);

					let result: 'win' | 'loss' | 'draw';
					if (winnerNum === userId) {
						result = 'win';
						wins++;
					} else if (winnerNum === opponentId) {
						result = 'loss';
						losses++;
					} else {
						result = 'draw';
					}

					// formater la date jj/MM/yy
					const d = g.createdAt;
					const day = String(d.getDate()).padStart(2, '0');
					const month = String(d.getMonth() + 1).padStart(2, '0');
					const year = String(d.getFullYear()).slice(-2);
					const date = `${day}/${month}/${year}`;

					return {
						id: g.id,
						user: {
							pseudo: me.pseudo,
							avatarUrl: me.avatarUrl
						},
						opponent: {
							pseudo: opp?.pseudo || 'Unknown',
							avatarUrl: opp?.avatarUrl
						},
						userScore,
						opponentScore,
						result,
						date,
						reason: g.reason
					};
				})
			);

			return reply.send({
				stats: { wins, losses, trophies },
				matches
			});
		}
	);

	// ─── GET /api/users/:pseudo/history ───
	fastify.get(
		'/api/users/:pseudo/history',
		{ preValidation: [fastify.authenticate] },
		async (req, reply) => {
			const targetPseudo = (req.params as any).pseudo as string;

			// 1) trouver l'utilisateur cible
			const target = await fastify.prisma.user.findUnique({
				where: { pseudo: targetPseudo },
				select: { id: true }
			});
			if (!target) return reply.status(404).send({ message: 'User not found' });

			// 2) récupérer ses parties
			const games = await fastify.prisma.gameResult.findMany({
				where: {
					OR: [{ player1Id: target.id }, { player2Id: target.id }]
				},
				orderBy: { createdAt: 'desc' }
			});

			// 3) formater la réponse
			const matches = games.map(g => {
				const isP1 = g.player1Id === target.id;
				const userScore = isP1 ? g.player1Score : g.player2Score;
				const oppScore = isP1 ? g.player2Score : g.player1Score;
				const opponentId = isP1 ? g.player2Id : g.player1Id;

				// caster winnerId en nombre
				const winnerNum = Number(g.winnerId);

				let result: 'win' | 'loss' | 'draw';
				if (winnerNum === target.id) result = 'win';
				else if (winnerNum === opponentId) result = 'loss';
				else result = 'draw';

				return {
					id: g.id,
					userScore,
					opponentScore: oppScore,
					result,
					date: g.createdAt.toISOString()
				};
			});

			return reply.send({ matches });
		}
	);

	fastify.get(
		'/api/users/:pseudo',
		{ preValidation: [fastify.authenticate] },
		async (req, reply) => {
			const pseudo = (req.params as any).pseudo as string

			const u = await fastify.prisma.user.findUnique({
				where: { pseudo },
				select: { id: true, pseudo: true },
			})

			if (!u) {
				return reply.status(404).send({ message: 'Utilisateur introuvable' })
			}

			return reply.send({
				id: u.id,
				username: u.pseudo,
				trophies: 0,
			})
		}
	)

	// POST /api/users/batch
	fastify.post(
		'/api/users/batch',
		{ preValidation: [fastify.authenticate] },
		async (
			req: FastifyRequest<{ Body: { ids: number[] } }>,
			reply: FastifyReply
		) => {
			const { ids } = req.body
			if (!ids?.length) {
				return reply.send({ users: [] })
			}
			const users = await fastify.prisma.user.findMany({
				where: { id: { in: ids } },
				select: {
					id: true,
					pseudo: true,
					avatarUrl: true,
					status: true,
				},
			})

			const chatUsers = users.map(u => ({
				id: u.id,
				username: u.pseudo,
				avatarUrl: u.avatarUrl,
				status: u.status,
			}))

			return reply.send({ users: chatUsers })
		}
	)

}
