"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setup2FARoutes = setup2FARoutes;
const axios_1 = __importDefault(require("axios"));
async function setup2FARoutes(fastify) {
    fastify.post('/api/2fa/enable', {
        preHandler: [fastify.authenticate],
        handler: async (req, res) => {
            try {
                const user = req.user;
                const response = await axios_1.default.post('http://twofa:4001/enable', { userId: user.id });
                return response.data;
            }
            catch (err) {
                req.log.error(err);
                return res.status(500).send({ error: 'Error enabling 2FA' });
            }
        },
    });
    fastify.post('/api/2fa/verify', {
        preHandler: [fastify.authenticate],
        handler: async (req, reply) => {
            const userId = req.user.id;
            const { token: totp } = req.body;
            try {
                // Appel au microservice 2FA
                const verifyRes = await axios_1.default.post('http://twofa:4001/verify', {
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
                    id: updated.id,
                    email: updated.email,
                    pseudo: updated.pseudo,
                    twoFAEnabled: updated.twoFAEnabled,
                });
                // Renvoie token + user pour le front
                return reply.send({
                    success: true,
                    token: newToken,
                    user: {
                        id: updated.id,
                        email: updated.email,
                        pseudo: updated.pseudo,
                        avatarUrl: updated.avatarUrl,
                        status: updated.status,
                        twoFAEnabled: updated.twoFAEnabled,
                    },
                });
            }
            catch (err) {
                req.log.error(err);
                return reply.status(500).send({ success: false, message: 'Error verifying 2FA' });
            }
        },
    });
    fastify.post('/api/2fa/disable', {
        preHandler: [fastify.authenticate],
        handler: async (req, reply) => {
            try {
                const userId = req.user.id;
                await fastify.prisma.user.update({
                    where: { id: userId },
                    data: {
                        twoFAEnabled: false,
                        twoFASecret: null, // On efface le secret
                    },
                });
                return reply.send({ message: '2FA disabled' });
            }
            catch (err) {
                req.log.error(err);
                return reply.status(500).send({ message: 'Error disabling 2FA' });
            }
        },
    });
}
