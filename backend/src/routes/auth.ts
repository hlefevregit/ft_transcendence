import { FastifyInstance } from 'fastify';
import { dbPromise } from '../db/database';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { GOOGLE_CLIENT_ID } from '../config/env';

export const setupAuthRoutes = (fastify: FastifyInstance) => {
  fastify.post('/api/auth/google', async (request, reply) => {
    const { id_token } = request.body as { id_token: string };
    if (!id_token) return reply.status(400).send({ success: false, message: "Token manquant" });

    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({ idToken: id_token, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) return reply.status(400).send({ success: false, message: "Informations introuvables" });

    const db = await dbPromise;
    let user = await db.get(`SELECT * FROM users WHERE email = ?`, [payload.email]);
    if (!user) {
      await db.run(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`, [payload.name || 'Utilisateur', payload.email, '']);
      user = await db.get(`SELECT * FROM users WHERE email = ?`, [payload.email]);
    }

    const token = fastify.jwt.sign({ id: user.id, email: user.email });
    reply.send({ success: true, token });
  });

  fastify.post('/api/auth/sign_in', async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string };
    const db = await dbPromise;
    const user = await db.get(`SELECT * FROM users WHERE email = ?`, [email]);
    if (!user) return reply.status(401).send({ success: false, message: "Utilisateur non trouvé" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return reply.status(401).send({ success: false, message: "Mot de passe invalide" });

    const token = fastify.jwt.sign({ id: user.id, email: user.email });
    reply.send({ success: true, token });
  });
};
