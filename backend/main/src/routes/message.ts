// src/routes/message.ts
import type {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
} from 'fastify'
import type { PrismaClient } from '@prisma/client'

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

  // — DELETE /api/users/:id/block — débloquer l’utilisateur :id
  fastify.delete(
    '/api/users/:id/block',
    { preValidation: [fastify.authenticate] },
    async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const blockerId = (req.user as any).id as number
      const blockedId = Number(req.params.id)

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

      // 1) Identifier tous les expéditeurs de messages à moi
      const senders = await fastify.prisma.message.groupBy({
        by: ['fromId'],
        where: { toId: me },
      })

      // 2) Charger mes états de lecture
      const states = await fastify.prisma.conversationState.findMany({
        where: { readerId: me },
      })

      // 3) Pour chaque expéditeur, compter les messages non lus
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
}
