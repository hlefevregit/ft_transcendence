import 'fastify';
import { PrismaClient } from '@prisma/client';
import '@fastify/jwt';
import { FastifyRequest, FastifyReply } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;

    // 👇 Ajout de la méthode authenticate (nécessaire pour TypeScript)
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }

}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      id: number;
      email: string;
      pseudo: string;
      avatarUrl?: string;
      status?: string;
    };
    user: {
      id: number;
      email: string;
      pseudo: string;
      avatarUrl?: string;
      status?: string;
    };
  }
}
