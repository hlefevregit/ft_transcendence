import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
interface CustomFastifyInstance extends FastifyInstance {
    authenticate: (req: FastifyRequest, rep: FastifyReply) => Promise<void>;
}
export declare function setupFriendRoutes(fastify: CustomFastifyInstance): Promise<void>;
export {};
