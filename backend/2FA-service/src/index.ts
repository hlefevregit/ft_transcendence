import cors from 'cors';
import Fastify, { fastify } from 'fastify';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

const app = fastify({ logger: true});

const userSecret = new Map<string, string>();

app.post('/enable', {
    handler: async (req, reply) => {

        try {
            const { userId } = req.body as { userId: string };
            if (!userId) {
                return reply.status(400).send({ error: 'User ID is required' });
            }
            const secret = speakeasy.generateSecret({ name: `Transcendence (${userId})` });
            userSecret.set(userId, secret.base32);
            

            const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || '');

            return reply.send({
                secret: secret.base32,
                otpauthUrl: secret.otpauth_url,
                qrCode: qrCodeUrl,
            });
        }
        catch (err) {
            req.log.error(err);
            return reply.status(500).send({ error: 'Erreur activation 2FA' });
        }
    }
});

app.post('/verify', async (req, reply) => {
  const { userId, token } = req.body as { userId: string, token: string };

  const secret = userSecret.get(userId);
  if (!secret) {
    return reply.status(404).send({ error: 'No 2FA secret found for this user' });
  }

  const isValid = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1, // accepte les tokens un peu en avance ou en retard
  });

  if (!isValid) {
    return reply.status(401).send({ error: 'Invalid token' });
  }

  return reply.send({ success: true });
});

app.listen({ port: 4001, host: '0.0.0.0' }, () => {
	console.log('✅ 2FA service running on http://localhost:4001');
});
