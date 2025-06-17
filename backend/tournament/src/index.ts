import Fastify from 'fastify';
import websocketPlugin from '@fastify/websocket';
import { setupWebsocketRoutes } from './webSocket';
import http from 'http';



const fastify = Fastify({ logger: true });
const server = http.createServer(fastify.server as any);

fastify.register(websocketPlugin);
setupWebsocketRoutes(fastify, server);

fastify.post('/host', async (req, res) => {
	const { userId, roomName } = req.body as { userId: string, roomName: string };
	// génère un gameId et stocke une entrée (même si pas encore de WS)
	const gameId = crypto.randomUUID();
	console.log(`🛠 Partie créée par ${userId} : ${roomName}`);
	return res.send({ gameId, roomName });
});

fastify.post('/join', async (req, res) => {
	const { gameId, userId } = req.body as { gameId: string, userId: string };
	// juste pour log ou vérif de disponibilité
	console.log(`👤 ${userId} veut rejoindre ${gameId}`);
	return res.send({ success: true });
});

server.listen(4002, '0.0.0.0', () => {
    fastify.log.info('🟢 Server (Fastify + WebSocket) listening on http://${LOCALHOST}:4002');
});