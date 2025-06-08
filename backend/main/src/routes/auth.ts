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
  // Google OAuth2 route
  fastify.post('/api/auth/google', async (request, reply) => {
    const { id_token } = request.body as { id_token: string };
    if (!id_token) return reply.status(400).send({ success: false, message: 'Missing token' });


    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({ idToken: id_token, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) return reply.status(400).send({ success: false, message: 'Information not found' });

    const { email, name } = payload;
    const existingUser = await fastify.prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      // if native account exists, block
      if (existingUser.password) {
        return reply
          .status(400)
          .send({ success: false, message: 'This email is already associated with a native account. Please login normally.' });
      }
      // existing Google user: return token
      const token = fastify.jwt.sign({
        id: existingUser.id,
        email: existingUser.email,
        pseudo: existingUser.pseudo,
        twoFAEnabled: existingUser.twoFAEnabled,
      });
      return reply.send({ success: true, token, user: existingUser });
    }

    // create new Google user, then set pseudo = 'user' + id
    const created = await fastify.prisma.$transaction(async (prisma) => {
      // initial create without pseudo
      const newUser = await prisma.user.create({
        data: {
          email,
          avatarUrl: defaultAvatarBase64,
          status: 'offline',
          twoFAEnabled: false,
          pseudo: '' // placeholder
        },
      });
      const userPseudo = `user${newUser.id}`.slice(0, 16);
      // update with generated pseudo
      return await prisma.user.update({
        where: { id: newUser.id },
        data: { pseudo: userPseudo },
      });
    });

    // generate lightweight token
    const token = fastify.jwt.sign({
      id: created.id,
      email: created.email,
      pseudo: created.pseudo,
      twoFAEnabled: created.twoFAEnabled,
    });

    return reply.send({
      success: true,
      token,
      user: created,
    });
  });

  // email/password login
  fastify.post('/api/auth/sign_in', async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string };
    const user = await fastify.prisma.user.findUnique({ where: { email } });
    if (!user) return reply.status(401).send({ success: false, message: 'User not found' });
    if (!user.password) return reply.status(400).send({ success: false, message: 'This account is linked to Google only.' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return reply.status(401).send({ success: false, message: 'Invalid password' });

    const token = fastify.jwt.sign({
      id: user.id,
      email: user.email,
      pseudo: user.pseudo,
      twoFAEnabled: user.twoFAEnabled,
    });

    return reply.send({ success: true, token, user });
  });
};
