// src/routes/message.ts
import type {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
} from 'fastify'

/**
 * Étend FastifyInstance pour y déclarer authenticate()
 * (défini par ton plugin JWT).
 */
interface CustomFastifyInstance extends FastifyInstance {
  authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>
}

interface Message {
  id: number
  from: number
  to: number
  content: string
  createdAt: number
}

export async function setupMessageRoutes(
  fastify: CustomFastifyInstance  // <-- utilise le type étendu
) {
  const store: Message[] = []
  let nextId = 1

  fastify.post(
    '/api/messages',
    { preValidation: [fastify.authenticate] }, // TS sait maintenant que authenticate existe
    async (req, reply) => {
      const { to, content } = req.body as { to: number; content: string }
      const from = (req.user as any).id
      const msg: Message = { id: nextId++, from, to, content, createdAt: Date.now() }
      store.push(msg)
      return reply.status(201).send(msg)
    }
  )

  fastify.get(
    '/api/messages',
    { preValidation: [fastify.authenticate] },
    async (req, reply) => {
      const me    = (req.user as any).id
      const other = Number((req.query as any).with)
      const sinceId = Number((req.query as any).sinceId) || 0

      const convo = store.filter(
        m =>
          (m.from === me && m.to === other) ||
          (m.from === other && m.to === me)
      )
      const news = convo.filter(m => m.id > sinceId)
      const lastId = news.length ? Math.max(...news.map(m => m.id)) : sinceId
      return reply.send({ lastId, messages: news })
    }
  )
}
