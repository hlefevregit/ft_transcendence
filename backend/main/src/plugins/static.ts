import fastifyStatic from '@fastify/static';
import path from 'path';
import fs from 'fs';
import { FastifyInstance } from 'fastify';

export const setupStaticFiles = (fastify: FastifyInstance) => {
  const staticDir = path.join(process.cwd(), 'public');

  if (fs.existsSync(staticDir)) {
    fastify.register(fastifyStatic, {
      root: staticDir,
      prefix: '/',
    });
    fastify.log.info("📂 Dossier public servi statiquement.");
  } else {
    fastify.log.warn(`⚠️ Dossier "public" introuvable à ${staticDir}`);
  }
};
