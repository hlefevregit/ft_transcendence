import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
interface CustomFastifyInstance extends FastifyInstance {
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
}
export declare function setupUserRoutes(fastify: CustomFastifyInstance): Promise<void>;
export {};
