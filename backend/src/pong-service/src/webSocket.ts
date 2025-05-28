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
				// console.log('📩 Message reçu:', data);

				switch (data.type) {
					case 'host_game': {
						const gameId = crypto.randomUUID();
						const session = new GameSession(gameId, ws, data.roomName || `${gameId}'s room`);
						games.set(gameId, session);

						ws.send(JSON.stringify({ type: 'game_hosted', gameId }));
						break;
					}
					case 'join_game': {
						const session = games.get(data.gameId);
						if (session && !session.player2) {
							session.setPlayer2(ws);

							const player2 = session.player2 as WebSocket | null;
							const message = {
								type: 'start_game', gameId: session.id,};
							
							session.player1.send(JSON.stringify(message));
							if (player2 && player2.readyState === WebSocket.OPEN)
								player2.send(JSON.stringify(message));


							ws.send(JSON.stringify({ type: 'joined_game', gameId: session.id }));
						} else {
							ws.send(JSON.stringify({ type: 'error', message: 'Invalid or full game' }));
						}
						break;
					}
					case 'room_list': {
						const roomList = [...games.entries()].map(([id, session]) => ({
							gameId: id,
							roomName: session.roomName || `${session.id}'s room`, // adapte selon ce que tu stockes
						}));

						ws.send(JSON.stringify({
							type: 'room_list',
							rooms: roomList,
						}));
						break;
					}
					case 'game_update': {
						const session = [...games.values()].find(s => s.hasSocket(ws));
						session?.handleGameUpdate(data);
						break;
					}
					case 'leave_room': {
						console.log("🚪 Client demande de quitter la room");
						if (!data.gameId) {
							ws.send(JSON.stringify({ type: 'error', message: 'Game ID is required to leave a room' }));
							break;
						}
						const session = games.get(data.gameId);
						if (session) {
							if (session.player1 === ws) {
								console.log(`🚪 Host quitte la room: ${data.gameId}`);
								games.delete(data.gameId);
								// ws.send(JSON.stringify({ type: 'room_left', gameId: data.gameId }));
							} else {
								console.warn(`⚠️ leave_room reçu, mais socket n'est pas le host actuel de ${data.gameId}`);
								console.warn(`socket reçu: ${ws}`);
								console.warn(`socket attendu: ${session.player1}`);
							}
						} else {
							console.warn(`⚠️ Aucun session trouvée pour gameId: ${data.gameId}`);
						}
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
		ws.on('close', () => {
			console.log("🔌 Client déconnecté");

			// Trouver la session où ce socket est le host
			const sessionToDelete = [...games.values()].find(
				session => session.player1 === ws
			);

			if (sessionToDelete) {
				console.log(`🗑️ Suppression de la room: ${sessionToDelete.id}`);
				games.delete(sessionToDelete.id);

				// Optionnel : prévenir les autres (par exemple le player2)
				if (sessionToDelete.player2 && sessionToDelete.player2.readyState === WebSocket.OPEN) {
					sessionToDelete.player2.send(JSON.stringify({
						type: 'room_closed',
						message: 'Host has left the game'
					}));
				}
			}
		});

	});
}
