import fastify from 'fastify';
import axios from 'axios';


export async function setup2FARoutes(fastify) {
    fastify.post('/api/2fa/enable', {
        preHandler: [fastify.authenticate],
        handler: async (req, res) => {
        
            console.log("🔍 user dans req:", req.user);
            try {
                const user = req.user as { id: number };
                const response = await axios.post('http://twofa:4001/enable', { userId: user.id });
                return response.data;
            } catch (err) {
                req.log.error(err);
                return res.status(500).send({ error: 'Erreur activation 2FA' });
            }
        },

    });
    fastify.post('/api/2fa/verify', {
        preHandler: [fastify.authenticate],
        handler: async (req, res) => {
            const user = req.user as { id: number };
            const { token } = req.body as { token: string };

            try {
                const verifyRes = await axios.post('http://twofa:4001/verify', {
                    userId: user.id,
                    token,
                });

                if (verifyRes.data.success) {
                    // Sauvegarde dans la DB que 2FA est activé
                    await fastify.prisma.user.update({
                    where: { id: user.id },
                    data: { twoFAEnabled: true },
                    });

                    return res.send({ success: true });
                } else {
                    return res.status(401).send({ error: 'Code invalide' });
                }
            } catch (err) {
            req.log.error(err);
            return res.status(500).send({ error: 'Erreur vérification 2FA' });
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

                return reply.send({ message: '2FA désactivée' });
            } catch (err) {
                req.log.error(err);
                return reply.status(500).send({ message: 'Erreur désactivation 2FA' });
            }

        },
    });
}
