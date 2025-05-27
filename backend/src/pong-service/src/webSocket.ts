import { WebSocketServer, WebSocket } from 'ws';
import { GameSession } from './gameSession';
import crypto from 'crypto';
import { FastifyInstance } from 'fastify';
import type { Server } from 'http';

const games = new Map<string, GameSession>();

export function setupWebsocketRoutes(fastify: FastifyInstance, server: Server) {
	const wss = new WebSocketServer({ server, path: '/ws' });

	wss.on('connection', (ws: WebSocket) => {
		console.log('🆕 New WebSocket client connected');

		ws.on('message', (message) => {
			try {
				const data = JSON.parse(message.toString());
				console.log('📩 Message reçu:', data);

				switch (data.type) {
					case 'host_game': {
						const gameId = crypto.randomUUID();
						const session = new GameSession(gameId, ws);
						games.set(gameId, session);

						ws.send(JSON.stringify({ type: 'game_hosted', gameId }));
						break;
					}
					case 'join_game': {
						const session = games.get(data.gameId);
						if (session && !session.player2) {
							session.setPlayer2(ws);
							ws.send(JSON.stringify({ type: 'joined_game', gameId: session.id }));
						} else {
							ws.send(JSON.stringify({ type: 'error', message: 'Invalid or full game' }));
						}
						break;
					}
					case 'game_update': {
						const session = [...games.values()].find(s => s.hasSocket(ws));
						session?.handleGameUpdate(data);
						break;
					}
					default:
						ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
						break;
				}
			} catch (err) {
				console.error("❌ Erreur parsing message:", err);
				ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON format' }));
			}
		});
	});
}
