import { FastifyInstance } from 'fastify';
import { dbPromise } from '../db/database';
import bcrypt from 'bcrypt';

export const setupRegisterRoute = (fastify: FastifyInstance) => {
  fastify.post('/api/register', async (request, reply) => {
    const { name, email, password } = request.body as { name: string; email: string; password: string };
    const db = await dbPromise;
    const existing = await db.get(`SELECT * FROM users WHERE email = ?`, [email]);
    if (existing) return reply.status(400).send({ success: false, message: "Email déjà utilisé" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.run(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`, [name, email, hashedPassword]);

    reply.send({ success: true, message: "Inscription réussie" });
  });
};
