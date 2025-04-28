import fastifyWebsocket from '@fastify/websocket';
import { FastifyInstance } from 'fastify';

export const setupWebsocket = (fastify: FastifyInstance) => {
  fastify.register(fastifyWebsocket);
};
