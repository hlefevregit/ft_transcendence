import fastifyCors from '@fastify/cors';
import { FastifyInstance } from 'fastify';

export const setupCors = (fastify: FastifyInstance) => {
  fastify.register(fastifyCors, {
    origin: ["https://localhost:8080", "https://localhost:5173"],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  });
};
