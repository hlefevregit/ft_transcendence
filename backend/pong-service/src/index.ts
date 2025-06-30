// File: backend/pong-service/src/index.ts
import Fastify from 'fastify';
import websocketPlugin from '@fastify/websocket';
import { setupWebsocketRoutes } from './webSocket';
import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET;


const fastify = Fastify({ logger: true });
const server = fastify.server as http.Server;

fastify.register(websocketPlugin);
setupWebsocketRoutes(server);

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

server.listen(4000, '0.0.0.0', () => {
    fastify.log.info('🟢 Server (Fastify + WebSocket) listening on http://localhost:4000');
});
