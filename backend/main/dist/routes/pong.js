"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupPongRoutes = setupPongRoutes;
const axios_1 = __importDefault(require("axios"));
async function setupPongRoutes(fastify) {
    fastify.post('/api/pong/host', {
        preHandler: [fastify.authenticate],
        handler: async (req, res) => {
            try {
                const user = req.user;
                const response = await axios_1.default.post('http://pong:4000/host', {
                    userId: user.id,
                    roomName: `${user.id}'s room`
                });
                return res.send(response.data);
            }
            catch (err) {
                req.log.error(err);
                return res.status(500).send({ error: 'Erreur création de partie' });
            }
        },
    });
    fastify.post('/api/pong/join', {
        preHandler: [fastify.authenticate],
        handler: async (req, res) => {
            try {
                const user = req.user;
                const { gameId } = req.body;
                const response = await axios_1.default.post('http://pong:4000/join', {
                    userId: user.id,
                    gameId,
                });
                return res.send(response.data);
            }
            catch (err) {
                req.log.error(err);
                return res.status(500).send({ error: 'Erreur pour rejoindre la partie' });
            }
        },
    });
}
