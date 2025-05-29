import axios from 'axios';
import { FastifyInstance } from 'fastify';
export async function setupPongRoutes(fastify) {
	fastify.post('/api/pong/host', {
		preHandler: [fastify.authenticate],
		handler: async (req, res) => {
			try {
				const user = req.user as { id: number };
				const response = await axios.post('http://pong:4000/host', {
					userId: user.id,
					roomName: `${user.id}'s room`
				});

				return res.send(response.data);
			} catch (err) {
				req.log.error(err);
				return res.status(500).send({ error: 'Erreur création de partie' });
			}
		},
	});

	fastify.post('/api/pong/join', {
		preHandler: [fastify.authenticate],
		handler: async (req, res) => {
			try {
				const user = req.user as { id: number };
				const { gameId } = req.body;

				const response = await axios.post('http://pong:4000/join', {
					userId: user.id,
					gameId,
				});

				return res.send(response.data);
			} catch (err) {
				req.log.error(err);
				return res.status(500).send({ error: 'Erreur pour rejoindre la partie' });
			}
		},
	});
	
}