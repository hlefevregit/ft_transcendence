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

		ws.on('message', async (message) => {
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
					case 'game_finished': {
						const session = [...games.values()].find(s => s.hasSocket(ws));
						if (session) {
							const winner = data.winner || (session.player1 === ws ? 'player1' : 'player2');
							session.broadcast({
								type: 'game_finished',
								reason: data.reason || 'normal',
								winner: winner,
							});
							games.delete(session?.id || '');
							console.log(`🏁 Partie terminée pour ${session.id}, gagnant: ${winner}`);
						}
						break;
					}
					case 'game_result': {
						const session = [...games.values()].find(s => s.hasSocket(ws));

						if (session) {
							const winner = data.winner || (session.player1 === ws ? 'player1' : 'player2');

							session.broadcast({
								type: 'game_finished',
								reason: data.reason || 'normal',
								winner: winner,
							});

							console.log(`🏁 Partie terminée pour ${session.id}, gagnant: ${winner}`);

							// ✅ Appeler une fonction async "fire and forget"
							await session.reportGameToApi({
								player1Id: data.player1Id,
								player2Id: data.player2Id,
								player1Score: data.player1Score,
								player2Score: data.player2Score,
								winnerId: data.winnerId,
								reason: data.reason || 'normal',
							});
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

			// Trouver la session à laquelle ce client appartient
			const session = [...games.values()].find(
				s => s.player1 === ws || s.player2 === ws
			);

			if (!session) return;

			const gameId = session.id;
			const isHost = session.player1 === ws;

			// Déterminer le gagnant par forfait
			const winnerSocket = isHost ? session.player2 : session.player1;
			const winner = isHost ? 'player2' : 'player1';

			console.log(`❌ ${isHost ? 'Host' : 'Player 2'} disconnected — Forfeit win for ${winner}`);

			// Envoyer message de fin de partie au gagnant
			if (winnerSocket && winnerSocket.readyState === WebSocket.OPEN) {
				winnerSocket.send(JSON.stringify({
					type: 'game_finished',
					reason: 'forfeit',
					winner: winner
				}));
			}

			// Nettoyer la session
			// games.delete(gameId);
		});

	});
}
