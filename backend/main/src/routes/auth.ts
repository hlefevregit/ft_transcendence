import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { GOOGLE_CLIENT_ID } from '../config/env';
import fs from 'fs';
import path from 'path';

const stevePath = path.join(__dirname, '../assets/steve.jpg');
const steveBuffer = fs.readFileSync(stevePath);
const defaultAvatarBase64 = `data:image/jpeg;base64,${steveBuffer.toString('base64')}`;

export const setupAuthRoutes = (fastify: FastifyInstance) => {
  // Google OAuth2
  fastify.post('/api/auth/google', async (request, reply) => {
    const { id_token } = request.body as { id_token: string };
    if (!id_token) {
      return reply.status(400).send({ success: false, message: "Token manquant" });
    }

    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({ idToken: id_token, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return reply.status(400).send({ success: false, message: "Informations introuvables" });
    }

    const { email, name } = payload;

    const existingUser = await fastify.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      // compte natif déjà existant
      if (existingUser.password) {
        return reply
          .status(400)
          .send({ success: false, message: "This email is already associated with a native account. Please use your password or sign up with a different address." });
      }
      // ancien compte Google → on renvoie simplement id/email/pseudo/2FA
      const token = fastify.jwt.sign({
        id: existingUser.id,
        email: existingUser.email,
        pseudo: existingUser.pseudo,
        twoFAEnabled: existingUser.twoFAEnabled,
      });
      return reply.send({ success: true, token, user: existingUser });
    }

    // nouveau compte Google
    const newUser = await fastify.prisma.user.create({
      data: {
        email,
        pseudo: name.slice(0, 16),
        avatarUrl: defaultAvatarBase64,
        status: 'offline',
        twoFAEnabled: false,
      },
    });

    // token « léger »
    const token = fastify.jwt.sign({
      id: newUser.id,
      email: newUser.email,
      pseudo: newUser.pseudo,
      twoFAEnabled: newUser.twoFAEnabled,
    });

    return reply.send({
      success: true,
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        pseudo: newUser.pseudo,
        avatarUrl: newUser.avatarUrl,
        status: newUser.status,
        twoFAEnabled: newUser.twoFAEnabled,
      },
    });
  });

  // Connexion email/password
  fastify.post('/api/auth/sign_in', async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string };

    const user = await fastify.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return reply.status(401).send({ success: false, message: "Utilisateur non trouvé" });
    }

    // interdit si compte Google-only
    if (!user.password) {
      return reply
        .status(400)
        .send({ success: false, message: "Account linked to Google only. Please use Google login." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return reply.status(401).send({ success: false, message: "Mot de passe invalide" });
    }

    // token « léger »
    const token = fastify.jwt.sign({
      id: user.id,
      email: user.email,
      pseudo: user.pseudo,
      twoFAEnabled: user.twoFAEnabled,
    });

    return reply.send({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        pseudo: user.pseudo,
        avatarUrl: user.avatarUrl,
        status: user.status,
        twoFAEnabled: user.twoFAEnabled,
      },
    });
  });
};
