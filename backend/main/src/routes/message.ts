// src/routes/message.ts
import type {
	FastifyInstance,
	FastifyRequest,
	FastifyReply,
} from 'fastify'
import type { PrismaClient } from '@prisma/client'
import { games } from '../plugins/websocket'; // Import de ta Map
/**
 * Étend FastifyInstance pour y déclarer authenticate()
 * et prisma (décoré dans le bootstrap).
 */
interface CustomFastifyInstance extends FastifyInstance {
	authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>
	prisma: PrismaClient
}

interface ApiMessage {
	id: number
	from: number
	to: number
	content: string
	createdAt: number
}

export async function setupMessageRoutes(fastify: CustomFastifyInstance) {
	// — POST /api/messages — envoyer un message
	fastify.post(
		'/api/messages',
		{ preValidation: [fastify.authenticate] },
		async (req, reply) => {
			const { to, content } = req.body as { to: number; content: string }
			const from = (req.user as any).id as number

			// 1) Vérifier blocage (unilatéral ou réciproque)
			const isBlocked = await fastify.prisma.block.findFirst({
				where: {
					OR: [
						{ blockerId: from, blockedId: to },
						{ blockerId: to, blockedId: from },
					],
				},
			})
			if (isBlocked) {
				// Silencieux côté front : on renvoie juste 403
				return reply.status(403).send()
			}

			// 2) Créer et retourner le message
			const created = await fastify.prisma.message.create({
				data: {
					fromId: from,
					toId: to,
					content,
					// createdAt par défaut via le schema Prisma
				},
			})

			const apiMsg: ApiMessage = {
				id: created.id,
				from: created.fromId,
				to: created.toId,
				content: created.content,
				createdAt: created.createdAt.getTime(),
			}

			return reply.status(201).send(apiMsg)
		}
	)

	// — GET /api/messages?with=&sinceId= — récupérer les messages
	fastify.get(
		'/api/messages',
		{ preValidation: [fastify.authenticate] },
		async (req, reply) => {
			const me = (req.user as any).id as number
			const other = Number((req.query as any).with)
			const sinceId = Number((req.query as any).sinceId) || 0

			// 1) Vérifier blocage
			const isBlocked = await fastify.prisma.block.findFirst({
				where: {
					OR: [
						{ blockerId: me, blockedId: other },
						{ blockerId: other, blockedId: me },
					],
				},
			})
			if (isBlocked) {
				return reply.status(403).send()
			}

			// 2) Récupérer les nouveaux messages depuis la base
			const msgs = await fastify.prisma.message.findMany({
				where: {
					id: { gt: sinceId },
					OR: [
						{ fromId: me, toId: other },
						{ fromId: other, toId: me },
					],
				},
				orderBy: { id: 'asc' },
			})

			const apiMsgs: ApiMessage[] = msgs.map(m => ({
				id: m.id,
				from: m.fromId,
				to: m.toId,
				content: m.content,
				createdAt: m.createdAt.getTime(),
			}))

			const lastId = apiMsgs.length > 0
				? apiMsgs[apiMsgs.length - 1].id
				: sinceId

			return reply.send({ lastId, messages: apiMsgs })
		}
	)

	// — POST /api/users/:id/block — bloquer l’utilisateur :id
	fastify.post(
		'/api/users/:id/block',
		{ preValidation: [fastify.authenticate] },
		async (
			req: FastifyRequest<{ Params: { id: string } }>,
			reply: FastifyReply
		) => {
			const blockerId = (req.user as any).id as number
			const blockedId = Number(req.params.id)

			if (blockerId === blockedId) {
				return reply
					.status(400)
					.send({ message: 'You cannot block yourself.' })
			}

			// Vérifier que la cible existe
			const target = await fastify.prisma.user.findUnique({
				where: { id: blockedId },
			})
			if (!target) {
				return reply.status(404).send({ message: 'User not found.' })
			}

			// Créer ou ignorer si déjà bloqué
			await fastify.prisma.block.upsert({
				where: { blockerId_blockedId: { blockerId, blockedId } },
				create: { blockerId, blockedId },
				update: {},
			})

			return reply.status(204).send()
		}
	)

	// — POST /api/users/:id/unblock — débloquer l’utilisateur :id (idem DELETE mais en POST)
	fastify.post(
		'/api/users/:id/unblock',
		{ preValidation: [fastify.authenticate] },
		async (
			req: FastifyRequest<{ Params: { id: string } }>,
			reply: FastifyReply
		) => {
			const blockerId = (req.user as any).id as number
			const blockedId = Number(req.params.id)

			// Supprime la ou les entrées block
			await fastify.prisma.block.deleteMany({
				where: { blockerId, blockedId },
			})

			return reply.status(204).send()
		}
	)


	// — GET /api/users/:id/blocked — récupérer les utilisateurs bloqués
	fastify.get(
		'/api/users/:id/blocked',
		{ preValidation: [fastify.authenticate] },
		async (
			req: FastifyRequest<{ Params: { id: string } }>,
			reply: FastifyReply
		) => {
			const userId = Number(req.params.id)

			// Vérifier que l'utilisateur existe
			const user = await fastify.prisma.user.findUnique({
				where: { id: userId },
				select: { id: true },
			})
			if (!user) {
				return reply.status(404).send({ message: 'User not found.' })
			}

			// Récupérer les utilisateurs bloqués
			const blocks = await fastify.prisma.block.findMany({
				where: { blockerId: userId },
				select: { blockedId: true },
			})

			return reply.send({
				blockedUsers: blocks.map(b => b.blockedId),
			})
		}
	)

	fastify.post(
		'/api/conversations/:otherId/read',
		{ preValidation: [fastify.authenticate] },
		async (
			req: FastifyRequest<{
				Params: { otherId: string }
				Body: { lastReadId: number }
			}>,
			reply: FastifyReply
		) => {
			const readerId = (req.user as any).id as number
			const otherId = Number(req.params.otherId)
			const { lastReadId } = req.body

			await fastify.prisma.conversationState.upsert({
				where: { readerId_otherId: { readerId, otherId } },
				create: { readerId, otherId, lastReadId },
				update: { lastReadId },
			})

			return reply.status(204).send()
		}
	)


	// — GET /api/conversations/unreadCounts — renvoyer les compteurs de non-lus
	fastify.get(
		'/api/conversations/unreadCounts',
		{ preValidation: [fastify.authenticate] },
		async (req, reply) => {
			const me = (req.user as any).id as number

			// 1) Récupérer la liste des blocks impliquant "me"
			const blocks = await fastify.prisma.block.findMany({
				where: {
					OR: [
						{ blockerId: me },
						{ blockedId: me },
					]
				},
				select: {
					blockerId: true,
					blockedId: true,
				}
			})

			// Construire l'ensemble des IDs à exclure
			const excluded = new Set<number>()
			for (const b of blocks) {
				if (b.blockerId === me) excluded.add(b.blockedId)
				if (b.blockedId === me) excluded.add(b.blockerId)
			}
			// Toujours exclure soi-même
			excluded.add(me)

			// 2) Identifier tous les expéditeurs de messages à « me », hors exclus
			const senders = await fastify.prisma.message.groupBy({
				by: ['fromId'],
				where: {
					toId: me,
					fromId: { notIn: Array.from(excluded) },
				}
			})

			// 3) Charger mes états de lecture normaux
			const states = await fastify.prisma.conversationState.findMany({
				where: { readerId: me },
			})

			// 4) Pour chaque expéditeur, compter ses messages non lus
			const unreadCounts: Record<number, number> = {}
			await Promise.all(
				senders.map(async ({ fromId }) => {
					const state = states.find(s => s.otherId === fromId)
					const lastRead = state?.lastReadId ?? 0

					const count = await fastify.prisma.message.count({
						where: {
							toId: me,
							fromId,
							id: { gt: lastRead },
						},
					})
					unreadCounts[fromId] = count
				})
			)

			return reply.send({ unreadCounts })
		}
	)

	// — GET /api/conversations/recentContacts — récupérer les contacts récents  // — GET /api/conversations/recent — liste des contacts “récents”
	fastify.get(
		'/api/conversations/recent',
		{ preValidation: [fastify.authenticate] },
		async (req, reply) => {
			const me = (req.user as any).id as number

			// 1) IDs des interlocuteurs auxquels j'ai envoyé un message
			const sentTo = await fastify.prisma.message.groupBy({
				by: ['toId'],
				where: { fromId: me },
			})

			// 2) IDs des interlocuteurs de qui j'ai reçu un message
			const receivedFrom = await fastify.prisma.message.groupBy({
				by: ['fromId'],
				where: { toId: me },
			})

			// 3) Union distincte de ces IDs
			const contactIds = Array.from(
				new Set([
					...sentTo.map((g) => g.toId),
					...receivedFrom.map((g) => g.fromId),
				])
			)

			if (contactIds.length === 0) {
				return reply.send({ recentContacts: [] })
			}

			// 4) Charger les infos utilisateur
			const users = await fastify.prisma.user.findMany({
				where: { id: { in: contactIds } },
				select: {
					id: true,
					pseudo: true,
					avatarUrl: true,
					status: true,
				},
			})

			// 5) Mapper sur ton type ChatUser attendu côté front
			const recentContacts = users.map((u) => ({
				id: u.id,
				username: u.pseudo,
				avatarUrl: u.avatarUrl,
				status: u.status,
			}))

			return reply.send({ recentContacts })
		}
	)

	fastify.get(
		'/api/conversations/recentIds',
		{ preValidation: [fastify.authenticate] },
		async (req, reply) => {
			const me = (req.user as any).id as number

			// IDs des destinataires de qui j'ai reçu ou à qui j'ai envoyé
			const sentTo = await fastify.prisma.message.groupBy({
				by: ['toId'],
				where: { fromId: me },
			})
			const receivedFrom = await fastify.prisma.message.groupBy({
				by: ['fromId'],
				where: { toId: me },
			})

			const ids = Array.from(
				new Set([
					...sentTo.map(g => g.toId),
					...receivedFrom.map(g => g.fromId),
				])
			)

			return reply.send({ ids })
		}
	)

	// 1) Créer ou recréer une invitation
	fastify.post('/api/invitations', { preValidation: [fastify.authenticate] }, async (req, reply) => {
		const inviterId = (req.user as any).id as number;
		const { inviteeId } = req.body as { inviteeId: number };
		if (inviteeId === inviterId) {
			return reply.code(400).send({ error: "Vous ne pouvez pas vous inviter vous-même." });
		}
		// optionnel : vérifier que l'utilisateur existe
		// const user = await fastify.prisma.user.findUnique({ where: { id: inviteeId } });
		// if (!user) return reply.code(404).send({ error: "Utilisateur introuvable." });

		const invite = await fastify.prisma.invitation.upsert({
			where: { inviterId_inviteeId: { inviterId, inviteeId } },
			update: {},  // met à jour updatedAt automatiquement si @updatedAt
			create: { inviterId, inviteeId },
		});

		return reply.code(201).send(invite);
	});

	fastify.post(
		'/api/invitations/confirm',      // nouvelle URL
		{ preValidation: [fastify.authenticate] },
		async (req, reply) => {
			const inviterId = (req.user as any).id as number;
			const { inviteeId, roomId } = req.body as {
				inviteeId: number;
				roomId: string;
			};

			const invite = await fastify.prisma.invitation.update({
				where: { inviterId_inviteeId: { inviterId, inviteeId } },
				data: { roomId, waitingForPlayer: true }
			});

			return reply.send(invite);
		}
	);

	// 3) Polling : lister les invitations actives pour l'utilisateur connecté
	fastify.get('/api/invitations', { preValidation: [fastify.authenticate] }, async (req, reply) => {
		const inviteeId = (req.user as any).id as number;
		const invites = await fastify.prisma.invitation.findMany({
			where: { inviteeId, waitingForPlayer: true, roomId: { not: null } },
			select: { inviterId: true, roomId: true },
		});
		return reply.send(invites);
	});


	// 4) Supprimer l'invitation (initiée par l’inviteur ou le destinataire)
	fastify.post(
		'/api/invitations/delete',
		{ preValidation: [fastify.authenticate] },
		async (req, reply) => {
			const inviterId = (req.user as any).id as number
			const { inviteeId } = req.body as { inviteeId: number }
			await fastify.prisma.invitation.delete({
				where: { inviterId_inviteeId: { inviterId, inviteeId } }
			})
			return reply.code(204).send()
		}
	)

	// Supprime toutes les invitations où je suis l'inviteur
	fastify.post(
		'/api/invitations/deleteAllMine',
		{ preValidation: [fastify.authenticate] },
		async (req, reply) => {
			const inviterId = (req.user as any).id as number
			await fastify.prisma.invitation.deleteMany({
				where: { inviterId }
			})
			return reply.code(204).send()
		}
	)

	// Remet l’invitation en “non-ready” (roomId à null, waitingForPlayer=false)
	fastify.post(
		'/api/invitations/reset',
		{ preValidation: [fastify.authenticate] },
		async (req, reply) => {
			const inviterId = (req.user as any).id as number;
			const { inviteeId } = req.body as { inviteeId: number };

			const invite = await fastify.prisma.invitation.update({
				where: { inviterId_inviteeId: { inviterId, inviteeId } },
				data: { roomId: null, waitingForPlayer: false }
			});

			return reply.send(invite);
		}
	);


	// — GET /api/match-notification — récupérer les notifications envoyées par l’utilisateur courant
	fastify.get(
		'/api/match-notification',
		{ preValidation: [fastify.authenticate] },
		async (req: FastifyRequest, reply: FastifyReply) => {
			const userId = (req.user as any).id as number

			const notifications = await fastify.prisma.matchNotification.findMany({
				where: { senderId: userId },
				orderBy: { createdAt: 'desc' },
			})

			return reply.status(200).send(notifications)
		}
	)

	// — POST /api/match-notification — créer une nouvelle notification de match
	fastify.post(
		'/api/match-notification',
		{ preValidation: [fastify.authenticate] },
		async (
			req: FastifyRequest<{
				Body: { player1: string; player2: string; isPrint: boolean }
			}>,
			reply: FastifyReply
		) => {
			const senderId = (req.user as any).id as number;
			const { player1, player2, isPrint } = req.body;

			// 1) on crée la notification en base
			const createdNotif = await fastify.prisma.matchNotification.create({
				data: { senderId, player1, player2, isPrint },
			});

			// 2) on écrit un message système dans le chat
			const content = `🎉 Tournament: ${player1} vs ${player2} is starting now!`;
			await fastify.prisma.message.create({
				data: {
					fromId: fastify.systemUserId,
					toId: senderId,       // tu peux envoyer à tous les participants si nécessaire
					content,
				}
			});

			return reply.status(201).send(createdNotif);
		}
	);


	// — GET /api/me/blocked — récupérer les bloqués avec leurs infos
	fastify.get(
		'/api/me/blocked',
		{ preValidation: [fastify.authenticate] },
		async (
			req: FastifyRequest,
			reply: FastifyReply
		) => {
			const blockerId = (req.user as any).id as number;

			// Récupère les entrées block et inclus les infos utilisateur
			const blocks = await fastify.prisma.block.findMany({
				where: { blockerId },
				include: {
					blocked: {
						select: { id: true, pseudo: true, avatarUrl: true }
					}
				}
			});

			// Renvoie directement le tableau d’utilisateurs bloqués
			const blockedUsers = blocks.map(b => b.blocked);
			return reply.send({ blockedUsers });
		}
	);

}
