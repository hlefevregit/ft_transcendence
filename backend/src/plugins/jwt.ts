import fastifyJwt from '@fastify/jwt';
import { FastifyInstance } from 'fastify';
import { JWT_SECRET } from '../config/env';

export const setupJwt = (fastify: FastifyInstance) => {
  fastify.register(fastifyJwt, { secret: JWT_SECRET });
};
