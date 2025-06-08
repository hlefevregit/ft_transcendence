import fastify from 'fastify';
import axios from 'axios';


export async function setup2FARoutes(fastify) {
    fastify.post('/api/2fa/enable', {
        preHandler: [fastify.authenticate],
        handler: async (req, res) => {
            try {
                const user = req.user as { id: number };
                const response = await axios.post('http://twofa:4001/enable', { userId: user.id });
                return response.data;
            } catch (err) {
                req.log.error(err);
                return res.status(500).send({ error: 'Error enabling 2FA' });
            }
        },

    });
    fastify.post('/api/2fa/verify', {
    preHandler: [fastify.authenticate],
    handler: async (req, reply) => {
        const userId = (req.user as any).id;
        const { token: totp } = req.body as { token: string };

        try {
        // Appel au microservice 2FA
        const verifyRes = await axios.post('http://twofa:4001/verify', {
            userId,
            token: totp,
        });

        if (!verifyRes.data.success) {
            return reply.status(401).send({ success: false, message: 'Invalid 2FA code' });
        }

        // Active la 2FA en base
        const updated = await fastify.prisma.user.update({
            where: { id: userId },
            data: { twoFAEnabled: true },
        });

        // Génère un nouveau JWT “léger”
        const newToken = fastify.jwt.sign({
            id:          updated.id,
            email:       updated.email,
            pseudo:      updated.pseudo,
            twoFAEnabled: updated.twoFAEnabled,
        });

        // Renvoie token + user pour le front
        return reply.send({
            success: true,
            token: newToken,
            user: {
            id:            updated.id,
            email:         updated.email,
            pseudo:        updated.pseudo,
            avatarUrl:     updated.avatarUrl,
            status:        updated.status,
            twoFAEnabled:  updated.twoFAEnabled,
            },
        });
        } catch (err) {
        req.log.error(err);
        return reply.status(500).send({ success: false, message: 'Error verifying 2FA' });
        }
    },
    });

    
    fastify.post('/api/2fa/disable', {
        preHandler: [fastify.authenticate],
        handler: async (req, reply) => {

            try {
                const userId = (req.user as any).id;

                await fastify.prisma.user.update({
                    where: { id: userId },
                    data: {
                        twoFAEnabled: false,
                        twoFASecret: null, // On efface le secret
                    },
                });

                return reply.send({ message: '2FA disabled' });
            } catch (err) {
                req.log.error(err);
                return reply.status(500).send({ message: 'Error disabling 2FA' });
            }

        },
    });
}
