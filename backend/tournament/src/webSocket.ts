import { WebSocketServer, WebSocket } from 'ws';
import { tournamentSession } from './tournamentSession';
import crypto from 'crypto';
import { FastifyInstance } from 'fastify';
import { get, type Server } from 'http';
import jwt from 'jsonwebtoken';
import { URL } from 'url';

const games = new Map<string, tournamentSession>();

export function setupWebsocketRoutes(fastify: FastifyInstance, server: Server) {
	const wss = new WebSocketServer({ server, path: '/ws' });


	async function handleJoinTournament(ws: WebSocket, data: any, userID: string) {
		const session = games.get(data.gameId);

		console.log("🔍 Recherche de la session pour gameId:", data.gameId);
		if (session && session.player2 === null) {
			console.log("🚪 Player 2 rejoint le tournoi");
			session.setPlayer2(ws, userID, data.username);
			ws.send(JSON.stringify({ type: 'joined_tournament', gameId: session.id, isHost2: false }));
		}
		else if (session && session.player3 === null) {
			console.log("🚪 Player 3 rejoint le tournoi");
			session.setPlayer3(ws, userID, data.username);
			ws.send(JSON.stringify({ type: 'joined_tournament', gameId: session.id, isHost2: true}));
		}
		else if (session && session.player4 === null) {
			console.log("🚪 Player 4 rejoint le tournoi");
			session.setPlayer4(ws, userID, data.username);
			const player4 = session.player4 as WebSocket | null;
			ws.send(JSON.stringify({ type: 'joined_tournament', gameId: session.id , isHost2: false}));
		}
		else {
			ws.send(JSON.stringify({ type: 'error', message: 'Game is full or does not exist' }));
			return;
		}
		// if (session.player4 === null) {
		// 	ws.send(JSON.stringify({ type: 'waiting_for_players', gameId: session.id }));
		// }
		if (session.player4 && session.player4.readyState === WebSocket.OPEN) {

			await sleep(3000); // Attendre 3 secondes pour s'assurer que tous les joueurs sont connectés
			console.log("🚀 Tous les joueurs sont prêts, lancement du tournoi");
			const message = {
				type: 'start_tournament',
				gameId: session.id,
				player1Id: session.player1Id,
				player2Id: session.player2Id,
				player3Id: session.player3Id,
				player4Id: session.player4Id,
				points_to_win: session.points_to_win,
			};
			session.player1.send(JSON.stringify(message));
			if (session.player2 && session.player2.readyState === WebSocket.OPEN) {
				session.player2.send(JSON.stringify(message));
			}
			if (session.player3 && session.player3.readyState === WebSocket.OPEN) {
				session.player3.send(JSON.stringify(message));
			}
			if (session.player4 && session.player4.readyState === WebSocket.OPEN) {
				session.player4.send(JSON.stringify(message));
			}

		}
	}
		

	function sleep(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	wss.on('connection', (ws: WebSocket, req) => {
		// 🔐 Extraction du token depuis l'URL
		const url = new URL(req.url || '', `http://${req.headers.host}`);
		const token = url.searchParams.get('token');

		let userID = 'anonymous';
		if (token) {
			try {
				const payload: any = jwt.verify(token, 'supersecretkey');
				userID = payload.id || 'unknown';
			} catch (err) {
				console.error('❌ JWT invalide :', err);
			}
		}

		console.log('🆕 New WebSocket client connected as:', userID);

		ws.on('message', async (message) => {
			try {
				const data = JSON.parse(message.toString());
				console.log("📬 Message reçu tournoi:", data);

				switch (data.type) {

					case 'host_tournament': {
						const gameId = crypto.randomUUID();
						const session = new tournamentSession(gameId, ws, data.roomName || `${gameId}'s tournament`);
						session.setPlayer1(ws, userID, data.username);
						games.set(gameId, session);
						session.points_to_win = data.points_to_win || 3; // Points to win can be set by the host
						ws.send(JSON.stringify({ type: 'tournament_hosted', gameId, roomName: session.roomName }));
						break;
					}
					
					case 'join_tournament': {
						console.log("🚪 Client demande de rejoindre le tournoi, username = ", data.username);
						handleJoinTournament(ws, data, userID);
						
						break;

					}

					case 'waiting_for_players': {
						const session = games.get(data.gameId);
						if (session) {
							const message = {
								type: 'waiting_for_players',
								gameId: session.id,
								roomName: session.roomName || `${session.id}'s room`,
							};
							ws.send(JSON.stringify(message));
						} else {
							ws.send(JSON.stringify({ type: 'error', message: 'Game does not exist' }));
						}
						break;
					}

					
					case 'leave_tournament': {
						console.log("🚪 Client demande de quitter le tournoi");
						
						
						if (!data.gameId) {
							ws.send(JSON.stringify({ type: 'error', message: 'Game ID is required to leave a tournament' }));
							break;
						}
						const session = games.get(data.gameId);
						if (session) {
							if (session.player1 === ws) {
								console.log(`🚪 Host quitte le tournoi: ${data.gameId}`);
								games.delete(data.gameId);
							} else if (session.player2 === ws) {
								console.log(`🚪 Player 2 quitte le tournoi: ${data.gameId}`);
								session.player2 = null;
							}
							else if (session.player3 === ws) {
								console.log(`🚪 Player 3 quitte le tournoi: ${data.gameId}`);
								session.player3 = null;
							}
							else if (session.player4 === ws) {
								console.log(`🚪 Player 4 quitte le tournoi: ${data.gameId}`);
								session.player4 = null;
							}
							else {
								console.warn(`⚠️ leave_tournament reçu, mais socket n'est pas le host ou un joueur de ${data.gameId}`);
							}
						}
						else {
							console.warn(`⚠️ Aucun session trouvée pour gameId: ${data.gameId}`);
						}
						break;
					}
					
					case 'start_round1_game1' : {
						const session = games.get(data.gameId);
						console.log("🔍 Recherche de la session pour gameId:", data.gameId);
						if (session && session.player1 && session.player2) {
							const message = {
								type: 'start_round1_game1',
								gameId: session.id,
								player1Id: session.player1Id,
								player2Id: session.player2Id,
							};
							session.player1.send(JSON.stringify(message));
							if (session.player2 && session.player2.readyState === WebSocket.OPEN) {
								session.player2.send(JSON.stringify(message));
							}
						}
						else {
							ws.send(JSON.stringify({ type: 'error', message: 'Game is not ready or does not exist' }));
						}
						break;
					}

					case 'start_round1_game2' : {
						const session = games.get(data.gameId);
						if (session && session.player3 && session.player4) {
							const message = {
								type: 'start_round1_game2',
								gameId: session.id,
								player3Id: session.player3Id,
								player4Id: session.player4Id,
							};
							session.player3.send(JSON.stringify(message));
							if (session.player4 && session.player4.readyState === WebSocket.OPEN) {
								session.player4.send(JSON.stringify(message));
							}
						}
						else {
							ws.send(JSON.stringify({ type: 'error', message: 'Game is not ready or does not exist' }));
						}
						break;
					}

					case 'game1_update': {
						console.log("🔄 Mise à jour du jeu 1");
						const session = games.get(data.gameId);
						console.log("Game ID:", data.gameId);
						session?.game1.updateState(data);
						break;
					}
					
					case 'game2_update': {
						console.log("🔄 Mise à jour du jeu 2");
						const session = games.get(data.gameId);
						console.log("🔄 Mise à jour du jeu 2 pour la session:", session?.id);
						session?.game2.updateState(data);
						break;
					}

					case 'game1_finished': {
						const session = [...games.values()].find(s => s.hasSocket(ws));
						if (session) {
							const winner = data.winner || (session.player1 === ws ? session.player1Id : session.player2Id);
							session.broadCastGame1({
								type: 'game1_finished',
								player1Id: session.player1Id,
								player2Id: session.player2Id,
								player1Score: session.score1_game1,
								player2Score: session.score2_game1,
								reason: 'normal',
								winnerId: winner,
								
							});
						}
						break;
					}

					case 'game2_finished': {
						const session = [...games.values()].find(s => s.hasSocket(ws));
						if (session) {
							const winner = data.winner || (session.player3 === ws ? session.player3Id : session.player4Id);
							session.broadCastGame2({
								type: 'game2_finished',
								player3Id: session.player3Id,
								player4Id: session.player4Id,
								player3Score: session.score1_game2,
								player4Score: session.score2_game2,
								reason: 'normal',
								winnerId: winner,
								
							});
						}
						break;
					}

					case 'start_final': {
						const session = games.get(data.gameId);
						if (session)
						{
							data.player1Id = session.finalist1;
							data.player2Id = session.finalist2;
							const message = {
								type: 'start_final',
								gameId: session.id,
								player1Id: session.finalist1,
								player2Id: session.finalist2,
							};
							session.broadCastFinal(message);
						}
						else {
							ws.send(JSON.stringify({ type: 'error', message: 'Game is not ready or does not exist' }));
						}
						break;
					}

					case 'final_update': {
						const session = games.get(data.gameId);
						if (session) {
							session.final.updateState(data);
						} else {
							ws.send(JSON.stringify({ type: 'error', message: 'Game is not ready or does not exist' }));
						}
						break;
					}

					case 'final_finished': {
						const session = [...games.values()].find(s => s.hasSocket(ws));
						if (session) {
							const winner = data.winner || (session.finalist1 === ws ? session.finalist1 : session.finalist2);
							session.broadCastFinal({
								type: 'final_finished',
								player1Id: session.finalist1,
								player2Id: session.finalist2,
								reason: 'normal',
								winnerId: winner,
							});
							games.delete(session.id);
						}
						break;
					}
					case 'room_list': {
						const roomList = [...games.entries()].map(([id, session]) => ({
							gameId: id,
							roomName: session.roomName || `${session.id}'s room`,
						}));
						const roomListName = roomList.map(room => room.roomName).join(', ');
						ws.send(JSON.stringify({ type: 'room_list', rooms: roomList, roomName: roomListName }));
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
								session.broadcast({
									type: 'party_canceled',
									player1Id: session.player1Id,
									player2Id: session.player2Id,
									player1Score: session.score1_game1,
									player2Score: session.score2_game1,
									reason: 'forfeit',
									gameId: data.gameId,
								});
								games.delete(data.gameId);
								
							} else if (session.player2 === ws) {
								console.log(`🚪 Player 2 quitte la room: ${data.gameId}`);
								session.player2 = null;
								ws.send(JSON.stringify({ type: 'player_disconnected', gameId: data.gameId }))
							}
							else if (session.player3 === ws) {
								console.log(`🚪 Player 3 quitte la room: ${data.gameId}`);
								ws.send(JSON.stringify({ type: 'player_disconnected', gameId: data.gameId }))
								session.player3 = null;
							}
							else if (session.player4 === ws) {
								console.log(`🚪 Player 4 quitte la room: ${data.gameId}`);
								session.player4 = null;
								ws.send(JSON.stringify({ type: 'player_disconnected', gameId: data.gameId }))
							}
							else {
								console.warn(`⚠️ leave_room reçu, mais socket n'est pas le host ou un joueur de ${data.gameId}`);
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

			const session = [...games.values()].find(s => s.player1 === ws || s.player2 === ws);
			if (!session) return;

			// if (session.player1 === ws) {
			// 	console.log(`🚪 Host quitte la room: ${session.id}`);
			// 	games.delete(session.id);
			// } else if (session.player2 === ws) {
			// 	console.log(`🚪 Player 2 quitte la room: ${session.id}`);
			// 	session.player2 = null;
			// } else if (session.player3 === ws) {
			// 	console.log(`🚪 Player 3 quitte la room: ${session.id}`);
			// 	session.player3 = null;
			// } else if (session.player4 === ws) {
			// 	console.log(`🚪 Player 4 quitte la room: ${session.id}`);
			// 	session.player4 = null;
			// }
			// else {
			// 	console.warn(`⚠️ Client déconnecté, mais socket n'est pas le host ou un joueur de ${session.id}`);
			// }
			const gameId = session.id;
			const isHost = session.player1 === ws;
			if (isHost) {
				console.log(`❌ Host déconnecté — Victoire par forfait pour ${session.player2Id}`);
				session.broadcast({
					type: 'party_canceled',
					player1Id: session.player1Id,
					player2Id: session.player2Id,
					player1Score: session.score1_game1,
					player2Score: session.score2_game1,
					reason: 'forfeit'
				});
				games.delete(session.id);
			}
			else {
				const playerId = session.getPlayerId(ws);
				session.setPlayerToNull(ws);
				console.log(`❌ Player déconnecté — Victoire par forfait pour ${session.player1Id}`);
				session.broadcast({
					type: 'player_disconnected',
					playerId: playerId,
				});

			}
		
		});
	});
}
