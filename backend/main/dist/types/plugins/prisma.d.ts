import { PrismaClient } from '@prisma/client';
import { FastifyInstance } from 'fastify';
declare module 'fastify' {
    interface FastifyInstance {
        prisma: PrismaClient;
    }
}
declare const _default: (fastify: FastifyInstance, opts: Record<never, never>) => Promise<void>;
export default _default;
