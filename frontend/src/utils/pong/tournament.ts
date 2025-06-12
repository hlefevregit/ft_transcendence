// imports
import React, { use } from 'react';
import { useNavigate } from 'react-router-dom';
import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';
import { stat } from 'fs';



export const useTournamentWebSocket = (pong: React.RefObject<game.pongStruct>,
	socketRef: React.RefObject<WebSocket | null>,
	gameModes: React.RefObject<game.gameModes>,
	states: React.RefObject<game.states>,
	lang: React.RefObject<game.lang>,
	userNameRef: React.RefObject<string>,
	ws: WebSocket | null,
	lastHandledState: React.RefObject<game.states>,
) => {
	socketRef.current = ws;

	console.log(userNameRef.current, "is hosting a tournament? ", gameModes.current === game.gameModes.tournament);


	function handleMatchUpdate({
		pong,
		data,
		isHost,

		ballUpdate = true
	}: {
		pong: React.RefObject<game.pongStruct>,
		data: any,
		isHost: boolean,

		ballUpdate?: boolean
	}) {
		// 🎯 Paddle interpolation
		if (isHost && typeof data.paddle2Z === 'number') {
			pong.current.paddle2TargetZ = data.paddle2Z;
		}
		if (!isHost && typeof data.paddle1Z === 'number') {
			pong.current.paddle1TargetZ = data.paddle1Z;
		}

		// 🎾 Ball update only if not host (host already moves it)
		if (!isHost && ballUpdate && data.ballPosition && pong.current.ball) {
			pong.current.ball.position.x = data.ballPosition.x;
			pong.current.ball.position.y = data.ballPosition.y;
			pong.current.ball.position.z = data.ballPosition.z;
		}
		if (!isHost && ballUpdate && data.ballDirection) {
			pong.current.ballDirection = data.ballDirection;
		}
		if (!isHost && ballUpdate && typeof data.ballSpeedModifier === 'number') {
			pong.current.ballSpeedModifier = data.ballSpeedModifier;
		}
	}

	const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));



	if (ws) {
		ws.onopen = () => {
			console.log("🆕 WebSocket connection opened");
		}

		ws.onerror = (error) => {
			console.error("❌ WebSocket error:", error);
		}
		ws.onclose = () => {
			console.log("❌ WebSocket connection closed");
			socketRef.current = null;
		}

		if (gameModes.current === game.gameModes.tournament) {
			ws.onmessage = async (event) => {
				const data = JSON.parse(event.data);
				console.log("📬 Message reçu:", data);

				switch (data.type) {
					case 'tournament_hosted': {
						console.log("🏠 Partie hébergée avec succès:", data.gameId)
						
						pong.current.isHost = true;
						const roomId = data.gameId;
						pong.current.lastHostedRoomId = roomId;
						pong.current.tournamentId = roomId;
						const roomName = `${userNameRef.current || 'Anonymous'}'s room`;

						console.log("🏠 Room name:", roomName, " Username = ", pong.current.username);
		

						const roomPanel = game.createRoomPanel(pong, lang, roomName, () => {
							if (socketRef.current) {
								socketRef.current.send(JSON.stringify({
									type: 'join_tournament',
									gameId: roomId,
									username: pong.current.username,
								}));
							}
						});
						console.log("🏠 Room panel created:", roomPanel?.name ?? 'undefined');

						pong.current.party.set(roomId, () => roomPanel);
						console.log("🏠 Party set for room:", roomId);
						lastHandledState.current = game.states.hosting_waiting_players;
						states.current = game.states.tournament_bracket_preview;
						break;
					}

					case 'room_list': {
						console.log("🏠 Liste des salles reçue:", data.rooms);
						pong.current.party.clear();

						data.rooms.forEach((room: any) => {
							const roomId = room.gameId;
							const roomName = room.name + 's tournament';

							const waitForUsername = () => {
								if (pong.current.username && pong.current.username.trim() !== '') {
									console.log("✅ Username prêt:", pong.current.username);
									if (socketRef.current) {
										socketRef.current.send(JSON.stringify({
											type: 'join_tournament',
											gameId: roomId,
											username: pong.current.username,
										}));
									}
								} else {
									console.log("⏳ En attente du username...");
									requestAnimationFrame(waitForUsername);
								}
							};

							const roomPanel = game.createRoomPanel(pong, lang, roomName, () => {
								states.current = game.states.input_username;
								game.updateGUIValues(pong, states, lang);
								console.log("📥 Passage à l'état input_username pour rejoindre:", roomId);
								waitForUsername(); // Lancement de la boucle d'attente
							});

							pong.current.party.set(roomId, () => roomPanel);
						});

						const updatedList = game.refreshTournamentRoomsEntries(pong, states, gameModes);
						const verticalStack = pong.current.roomListVerticalStackPanel;
						if (verticalStack) {
							const old = verticalStack.children[3];
							if (old) verticalStack.removeControl(old);
							verticalStack.addControl(updatedList);
						} else {
							console.warn("⚠️ roomListVerticalStackPanel introuvable");
						}

						break;
					}

					case 'joined_tournament': {
						console.log("🏠 Rejoint le tournoi avec succès:", data.gameId);
						pong.current.isHost = false;
						if (data.isHost2 === true) {
							pong.current.isHost2 = true;
							console.log("🏠 En attente de joueurs pour le tournoi:", data.gameId)
						}
					}

					// case 'waiting_for_players': {
					// 	console.log("🏠 En attente du tournoi à démarrer:", data.gameId);
					// 	pong.current.tournamentId = data.gameId;
					// 	pong.current.tournamentPlayer1Id = data.player1Id;
					// 	pong.current.tournamentPlayer2Id = data.player2Id;
					// 	pong.current.tournamentPlayer3Id = data.player3Id;
					// 	pong.current.tournamentPlayer4Id = data.player4Id;

					// 	states.current = game.states.tournament_bracket_preview;
					// 	break;
					// }


					case 'start_tournament': {
						console.log("🏠 Tournoi démarré:", data.gameId);

						pong.current.tournamentId = data.gameId;
						pong.current.tournamentPlayer1Id = data.player1Id;
						pong.current.tournamentPlayer2Id = data.player2Id;
						pong.current.tournamentPlayer3Id = data.player3Id;
						pong.current.tournamentPlayer4Id = data.player4Id;
						pong.current.requiredPointsToWin = data.points_to_win || 3; // Valeur par défaut si non spécifiée

						console.log(" USERNAME REF:", userNameRef.current);
						console.log(" PLAYER 1 ID:", pong.current.tournamentPlayer1Id);
						console.log(" PLAYER 2 ID:", pong.current.tournamentPlayer2Id);
						console.log(" PLAYER 3 ID:", pong.current.tournamentPlayer3Id);
						console.log(" PLAYER 4 ID:", pong.current.tournamentPlayer4Id);
						states.current = game.states.launch_games;
						break;
					}

					case 'start_round1_game1': {
						console.log("🏆 Démarrage du round 1, game 1 pour le tournoi:", data.gameId);
						pong.current.tournamentRound = 1;
						pong.current.tournamentGame = 1;
						states.current = game.states.tournament_round_1_game_1;
						break;
					}

					case 'start_round1_game2': {
						console.log("🏆 Démarrage du round 1, game 2 pour le tournoi:", data.gameId);
						pong.current.tournamentRound = 1;
						pong.current.tournamentGame = 2;
						states.current = game.states.tournament_round_1_game_2;
						break;
					}

					case 'state_update' : {
						switch(data.matchId) {
							case 'game1':
								handleMatchUpdate({ pong, data, isHost: pong.current.isHost ?? false });
								break;
							case 'game2':
								handleMatchUpdate({ pong, data, isHost: pong.current.isHost2 ?? false});
								break;
							case 'final':
								const isFinalHost = pong.current.tournamentFinalist1 === userNameRef.current;
								handleMatchUpdate({ pong, data, isHost: isFinalHost });
								break;
							default:
								console.warn('❓ matchId inconnu:', data.matchId);
						}
						break;
					}


					case 'game1_finished': {
						console.log("🏁 Game 1 finished, scores:", data.player1Score, data.player2Score)
						pong.current.tournamentPlayer1Score = data.player1Score;
						pong.current.tournamentPlayer2Score = data.player2Score;
						const winner = data.player1Score > data.player2Score ? pong.current.tournamentPlayer1Id : pong.current.tournamentPlayer2Id;
						pong.current.game1Finished = true;
						pong.current.tournamentRound = 2;
						pong.current.tournamentGame = 2;
						pong.current.tournamentFinalist1 = winner;
						states.current = game.states.waiting_to_start_final;
						break;
					}

					case 'game2_finished': {
						console.log("🏁 Game 2 finished, scores:", data.player3Score, data.player4Score)
						pong.current.tournamentPlayer3Score = data.player3Score;
						pong.current.tournamentPlayer4Score = data.player4Score;
						const winner = data.player3Score > data.player4Score ? pong.current.tournamentPlayer3Id : pong.current.tournamentPlayer4Id;
						pong.current.game2Finished = true;
						pong.current.tournamentRound = 2;
						pong.current.tournamentGame = 2;
						pong.current.tournamentFinalist2 = winner;
						states.current = game.states.waiting_to_start_final;
						break;
					}

					case 'start_final': {
						console.log("🏆 Démarrage de la finale pour le tournoi:", data.gameId);
						pong.current.tournamentFinalist1 = data.player1Id;
						pong.current.tournamentFinalist2 = data.player2Id;
						states.current = game.states.tournament_final;
						break;
					}



					case 'party_canceled': {
						console.log("🏠 Vous avez quitté la partie:", data.gameId);
						
						pong.current.tournamentId = undefined;
						pong.current.tournamentPlayer1Id = undefined;
						pong.current.tournamentPlayer1Score = 0;
						pong.current.tournamentPlayer2Id = undefined;
						pong.current.tournamentPlayer2Score = 0;
						pong.current.tournamentPlayer3Id = undefined;
						pong.current.tournamentPlayer3Score = 0;
						pong.current.tournamentPlayer4Id = undefined;
						pong.current.tournamentPlayer4Score = 0;
						pong.current.tournamentRound = 0;
						pong.current.tournamentGame = 0;
						pong.current.tournamentFinalist1 = undefined;
						pong.current.tournamentFinalist2 = undefined;
						pong.current.game1Finished = false;
						pong.current.game2Finished = false;
						pong.current.launched = false;


						pong.current.isHost = false;
						pong.current.isHost2 = false;





						pong.current.tournamentFinalist1 = undefined;
						pong.current.tournamentFinalist2 = undefined;



						pong.current.party.clear();

						

						break;
					}

					case 'player_disconnected': {
						console.log("⚠️ Un joueur a quitté la partie:", data.playerId);
						if (data.playerId === pong.current.tournamentPlayer1Id) {
							pong.current.tournamentPlayer1Id = undefined;
							pong.current.tournamentPlayer1Score = 0;
						} else if (data.playerId === pong.current.tournamentPlayer2Id) {
							pong.current.tournamentPlayer2Id = undefined;
							pong.current.tournamentPlayer2Score = 0;
						} else if (data.playerId === pong.current.tournamentPlayer3Id) {
							pong.current.tournamentPlayer3Id = undefined;
							pong.current.tournamentPlayer3Score = 0;
						} else if (data.playerId === pong.current.tournamentPlayer4Id) {
							pong.current.tournamentPlayer4Id = undefined;
							pong.current.tournamentPlayer4Score = 0;
						}
						break;
					}


					default:
						console.warn("⚠️ Type de message inconnu:", data.type);
				}
			}
		}
	}
}

export const handleTournamentLoop = (
	pong: React.RefObject<game.pongStruct>,
	socketRef: React.RefObject<WebSocket | null>,
	gameModes: React.RefObject<game.gameModes>,
	states: React.RefObject<game.states>,
	userNameRef: React.RefObject<string>,
	lastHandledState: React.RefObject<game.states>,
) => {
	console.log("🔄 Exécution de la boucle de tournoi, state.current = ", states.current);
	switch (states.current) {
		case game.states.hosting_waiting_players: {
			// console.log("🏠 current state = hosting_waiting_players");
			
			if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN
				&& lastHandledState.current !== game.states.hosting_waiting_players
			) {
				socketRef.current.send(JSON.stringify({
					type: 'host_tournament',
					roomName: `${userNameRef.current}'s tournament`,
					username: pong.current.username,
					points_to_win: pong.current.requiredPointsToWin,
				}));
				lastHandledState.current = game.states.hosting_waiting_players;
				console.log("🏠 Envoi de la demande d'hébergement de tournoi");
			}
			break;
		}

		case game.states.disconnecting: {
			console.log("🏠 current state = disconnecting");
			if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
				console.log("🏠 Envoi de la demande de déconnexion");
				socketRef.current.send(JSON.stringify({
					type: 'leave_room',
					gameId: pong.current.tournamentId,
				}));
			}
			break;
			// states.current = game.states.main_menu;
		}

		case game.states.room_list: {
					// console.log("💡 socketRef:", socketRef.current);
					// console.log("💡 socketRef.readyState:", socketRef.current?.readyState);

			if (
				socketRef.current &&
				socketRef.current.readyState === WebSocket.OPEN &&
				lastHandledState.current !== game.states.room_list
			) {
				console.log("Requesting list of rooms");
				socketRef.current.send(JSON.stringify({ type: 'room_list' }));
				lastHandledState.current = game.states.room_list;
			}
			break;
		}


		case game.states.tournament_bracket_preview: {
			// Handle tournament bracket preview logic here
			// This could involve rendering the tournament tree, updating player states, etc.
			lastHandledState.current = game.states.tournament_bracket_preview;
			// states.current = game.states.launch_games;
			break;
		}

		case game.states.waiting_tournament_to_start: {
			
			// AFFICHER LE PANEL D'ATTENTE
			console.log("🏆 En attente du début du tournoi");
			if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
				socketRef.current.send(JSON.stringify({
					type: 'waiting_for_players',
					gameId: pong.current.tournamentId,
					player1Id: pong.current.tournamentPlayer1Id,
					player2Id: pong.current.tournamentPlayer2Id,
					player3Id: pong.current.tournamentPlayer3Id,
					player4Id: pong.current.tournamentPlayer4Id,
				}));
			}
			break;
		}

		case game.states.launch_games: {
			console.log("🏆 current state = launch_games");
			if (!pong.current.launched)
			{
				if (pong.current.tournamentPlayer1Id === userNameRef.current) {
					console.log("🏆 Lancement du premier round game 1");
					if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
						socketRef.current.send(JSON.stringify({
							type: 'start_round1_game1',
							gameId: pong.current.tournamentId,
						}));
					} else if (pong.current.tournamentPlayer3Id === userNameRef.current) {
						console.log("🏆 Lancement du premier round game 2");
						if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
							socketRef.current.send(JSON.stringify({
								type: 'start_round1_game2',
								gameId: pong.current.tournamentId,
							}));
						}
					}
				}
				pong.current.launched = true;
			}
				
			break;
		}
		case game.states.tournament_round_1_game_1: {
			if (
				socketRef.current &&
				socketRef.current.readyState === WebSocket.OPEN &&
				lastHandledState.current !== game.states.waiting_to_start
			) {
				console.log("Waiting for players to join game1...");
				// socketRef.current.send(JSON.stringify({ type: 'waiting_to_start' }));
				lastHandledState.current = game.states.waiting_to_start;
				pong.current.tournamentPlayer1Score = 0;
				pong.current.tournamentPlayer2Score = 0;
				pong.current.isInGame1 = true;
				game.resetPaddlesPosition(pong.current);
				game.resetBall(pong.current);
				game.setBallDirectionRandom(pong.current);
				game.fitCameraToArena(pong.current);
				states.current = game.states.countdown;
				game.transitionToCamera(pong.current.scene?.activeCamera as baby.FreeCamera, pong.current.arenaCam, 1, pong, states);
			}
			break;
		}

		case game.states.tournament_round_1_game_2: {
			if (
				socketRef.current &&
				socketRef.current.readyState === WebSocket.OPEN &&
				lastHandledState.current !== game.states.waiting_to_start
			) {
				console.log("Waiting for players to join game2...");
				// socketRef.current.send(JSON.stringify({ type: 'waiting_to_start' }));
				lastHandledState.current = game.states.waiting_to_start;
				pong.current.tournamentPlayer3Score = 0;
				pong.current.tournamentPlayer4Score = 0;
				pong.current.isInGame2 = true;
				game.resetPaddlesPosition(pong.current);
				game.resetBall(pong.current);
				game.setBallDirectionRandom(pong.current);
				game.fitCameraToArena(pong.current);
				states.current = game.states.countdown;
				game.transitionToCamera(pong.current.scene?.activeCamera as baby.FreeCamera, pong.current.arenaCam, 1, pong, states);
			}
			break;
		}
		case game.states.countdown: 
		{
			if (pong.current.engine) {
				pong.current.countdown -= pong.current.engine.getDeltaTime() / 1000;
			}
			// console.log(" USERNAME REF:", userNameRef.current);
			
			if (pong.current.countdown <= 0)
			{
				pong.current.countdown = 4;
				if (userNameRef.current === pong.current.tournamentPlayer1Id || userNameRef.current === pong.current.tournamentPlayer2Id) {
					console.log("🏆 Démarrage de partie 1 en cours");
					states.current = game.states.in_game1;
				}
				else if (userNameRef.current === pong.current.tournamentPlayer3Id || userNameRef.current === pong.current.tournamentPlayer4Id) {
					console.log("🏆 Démarrage de partie 2 en cours");
					states.current = game.states.in_game2;
				}
				// console.log("🏆 Démarrage du jeu après le compte à rebours");
			}
			break;
		}

		case game.states.in_game1: {
			const now = Date.now();
			const timeSinceLastUpdate = now - (pong.current.lastUpdateSetAt || 0);
			// console.log("🔄 In game1, time since last update:", timeSinceLastUpdate, "ms");
			if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
				game.fitCameraToArena(pong.current);

				// 1. Input du joueur local
				// game.doPaddleMovement(pong, gameModes, states);

				// 2. Score check
				const maxScore = Math.max(pong.current.player1Score, pong.current.player2Score);
				if (maxScore >= pong.current.requiredPointsToWin)
				{
					console.log("🏁 Game 1 finished, max score reached:", maxScore);
					states.current = game.states.game1_finished;
				}

				// 3. Interpolation position de l’adversaire
				const smoothFactor = 0.9;
				if (pong.current.isHost && typeof pong.current.paddle2TargetZ === 'number' && pong.current.paddle2) {
					const cur = pong.current.paddle2.position.z;
					const tgt = pong.current.paddle2TargetZ;
					pong.current.paddle2.position.z += (tgt - cur) * smoothFactor;
				}
				if (!pong.current.isHost && typeof pong.current.paddle1TargetZ === 'number' && pong.current.paddle1) {
					const cur = pong.current.paddle1.position.z;
					const tgt = pong.current.paddle1TargetZ;
					pong.current.paddle1.position.z += (tgt - cur) * smoothFactor;
				}

				// 4. Préparation de l’envoi WebSocket (si mouvement)
				const isHost = pong.current.isHost;
				const myPaddle = isHost ? pong.current.paddle1 : pong.current.paddle2;
				const myPaddleZ = myPaddle?.position.z ?? 0;
				const lastZ = pong.current.lastSentPaddleZ ?? null;

				console.log("Mypaddle is ", myPaddle, "isHost:", isHost);
				console.log("Current Z:", myPaddleZ, "Last sent Z:", lastZ);


				const paddleMoved = lastZ === null || Math.abs(myPaddleZ - lastZ) > 0.01;

				if (paddleMoved) {
					const payload: any = {
						type: 'game1_update',
						gameId: pong.current.tournamentId,
					};
					// console.log("Paddle moved, preparing payload...");
					if (isHost) {
						payload.paddle1Z = myPaddleZ;
					} else {
						payload.paddle2Z = myPaddleZ;
					}
					// console.log("📤 Envoi game_update:", payload);
					socketRef.current.send(JSON.stringify(payload));
					pong.current.lastSentPaddleZ = myPaddleZ;
					pong.current.lastUpdateSetAt = now;
				}
				if (isHost) {
					const payload: any = {
						type: 'game1_update',
						gameId: pong.current.tournamentId,
					}
					if (pong.current.ball) {
						pong.current.ball.position.x += pong.current.ballDirection.x * pong.current.ballSpeedModifier;
						pong.current.ball.position.z += pong.current.ballDirection.z * pong.current.ballSpeedModifier;
						game.makeBallBounce(pong, states, gameModes);
						payload.ballPosition = {
							x: pong.current.ball.position.x,
							y: pong.current.ball.position.y,
							z: pong.current.ball.position.z,
						};
						payload.ballDirection = {
							x: pong.current.ballDirection.x,
							y: pong.current.ballDirection.y,
							z: pong.current.ballDirection.z,
						};
						payload.ballSpeedModifier = pong.current.ballSpeedModifier;
					}
					// console.log("📤 Envoi game_update Ball:", payload);
					socketRef.current.send(JSON.stringify(payload));
					pong.current.lastUpdateSetAt = now;
				}
			}
			break;
		}

		case game.states.in_game2: {
			const now = Date.now();
			const timeSinceLastUpdate = now - (pong.current.lastUpdateSetAt || 0);

			if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
				game.fitCameraToArena(pong.current);

				// 1. Input du joueur local
				game.doPaddleMovement(pong, gameModes, states);

				// 2. Score check
				const maxScore = Math.max(pong.current.player1Score, pong.current.player2Score);
				if (maxScore >= pong.current.requiredPointsToWin)
				{
					states.current = game.states.game2_finished;
					// console.log("🏁 Game finished, max score reached:", maxScore);
					// socketRef.current.send(JSON.stringify({
					// 	type: 'game_finished',
					// 	player1Score: pong.current.player1Score,
					// 	player2Score: pong.current.player2Score,
					// 	reason: 'normal',
					// }));
					// return;
				}

				// 3. Interpolation position de l’adversaire
				const smoothFactor = 0.9;
				if (pong.current.isHost2 && typeof pong.current.paddle2TargetZ === 'number' && pong.current.paddle2) {
					const cur = pong.current.paddle2.position.z;
					const tgt = pong.current.paddle2TargetZ;
					pong.current.paddle2.position.z += (tgt - cur) * smoothFactor;
				}
				if (!pong.current.isHost2 && typeof pong.current.paddle1TargetZ === 'number' && pong.current.paddle1) {
					const cur = pong.current.paddle1.position.z;
					const tgt = pong.current.paddle1TargetZ;
					pong.current.paddle1.position.z += (tgt - cur) * smoothFactor;
				}

				// 4. Préparation de l’envoi WebSocket (si mouvement)
				const isHost = pong.current.isHost2;
				const myPaddle = isHost ? pong.current.paddle1 : pong.current.paddle2;
				const myPaddleZ = myPaddle?.position.z ?? 0;
				const lastZ = pong.current.lastSentPaddleZ ?? null;

				// console.log("Current Z:", myPaddleZ, "Last sent Z:", lastZ);


				const paddleMoved = lastZ === null || Math.abs(myPaddleZ - lastZ) > 0.01;

				if (paddleMoved) {
					const payload: any = {
						type: 'game2_update',
						gameId: pong.current.tournamentId,
					};
					// console.log("Paddle moved, preparing payload...");
					if (isHost) {
						payload.paddle1Z = myPaddleZ;
					} else {
						payload.paddle2Z = myPaddleZ;
					}
					// console.log("📤 Envoi game_update:", payload);
					socketRef.current.send(JSON.stringify(payload));
					pong.current.lastSentPaddleZ = myPaddleZ;
					pong.current.lastUpdateSetAt = now;
				}
				if (isHost) {
					const payload: any = {
						type: 'game2_update',
						gameId: pong.current.tournamentId,
					}
					if (pong.current.ball) {
						pong.current.ball.position.x += pong.current.ballDirection.x * pong.current.ballSpeedModifier;
						pong.current.ball.position.z += pong.current.ballDirection.z * pong.current.ballSpeedModifier;
						game.makeBallBounce(pong, states, gameModes);
						payload.ballPosition = {
							x: pong.current.ball.position.x,
							y: pong.current.ball.position.y,
							z: pong.current.ball.position.z,
						};
						payload.ballDirection = {
							x: pong.current.ballDirection.x,
							y: pong.current.ballDirection.y,
							z: pong.current.ballDirection.z,
						};
						payload.ballSpeedModifier = pong.current.ballSpeedModifier;
					}
					// console.log("📤 Envoi game_update Ball:", payload);
					socketRef.current.send(JSON.stringify(payload));
					pong.current.lastUpdateSetAt = now;
				}
			}
			break;
		}

		case game.states.game1_finished: {
			if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
				console.log("🏁 Game 1 finished, sending scores...");
				socketRef.current.send(JSON.stringify({
					type: 'game1_finished',
					player1Score: pong.current.tournamentPlayer1Score,
					player2Score: pong.current.tournamentPlayer2Score,
					reason: 'normal',
				}));
			}
			// states.current = game.states.tournament_round_1_game_2;
			break;
		}

		case game.states.game2_finished: {
			if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
				console.log("🏁 Game 2 finished, sending scores...");
				socketRef.current.send(JSON.stringify({
					type: 'game2_finished',
					player3Score: pong.current.tournamentPlayer3Score,
					player4Score: pong.current.tournamentPlayer4Score,
					reason: 'normal',
				}));
			}
			// states.current = game.states.tournament_round_1_game_1;
			break;
		}

		case game.states.waiting_to_start_final: {
			if (pong.current.game1Finished && pong.current.game2Finished) {
				console.log("🏆 Les deux jeux sont terminés, en attente du début de la finale");
				if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
					socketRef.current.send(JSON.stringify({
						type: 'start_final',
						gameId: pong.current.tournamentId,
						player1Id: pong.current.tournamentFinalist1,
						player2Id: pong.current.tournamentFinalist2,
					}));
					pong.current.isFinal = true;
				}
			}
			else {
				console.log("🏆 En attente de la fin des jeux pour démarrer la finale");
			}
			break;
		}

		case game.states.tournament_final: {
			const now = Date.now();
			const timeSinceLastUpdate = now - (pong.current.lastUpdateSetAt || 0);

			if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
				game.fitCameraToArena(pong.current);

				// 1. Input du joueur local
				game.doPaddleMovement(pong, gameModes, states);

				// 2. Score check
				const maxScore = Math.max(pong.current.player1Score, pong.current.player2Score);
				if (maxScore >= pong.current.requiredPointsToWin)
				{
					states.current = game.states.tournament_final_game_finished;
					// console.log("🏁 Game finished, max score reached:", maxScore);
					// socketRef.current.send(JSON.stringify({
					// 	type: 'game_finished',
					// 	player1Score: pong.current.player1Score,
					// 	player2Score: pong.current.player2Score,
					// 	reason: 'normal',
					// }));
					// return;
				}

				// 3. Interpolation position de l’adversaire
				const smoothFactor = 0.9;
				if (pong.current.tournamentFinalist1 && typeof pong.current.paddle2TargetZ === 'number' && pong.current.paddle2) {
					const cur = pong.current.paddle2.position.z;
					const tgt = pong.current.paddle2TargetZ;
					pong.current.paddle2.position.z += (tgt - cur) * smoothFactor;
				}
				if (!pong.current.tournamentFinalist1 && typeof pong.current.paddle1TargetZ === 'number' && pong.current.paddle1) {
					const cur = pong.current.paddle1.position.z;
					const tgt = pong.current.paddle1TargetZ;
					pong.current.paddle1.position.z += (tgt - cur) * smoothFactor;
				}

				// 4. Préparation de l’envoi WebSocket (si mouvement)
				const isHost = pong.current.tournamentFinalist1 === userNameRef.current;
				const myPaddle = isHost ? pong.current.paddle1 : pong.current.paddle2;
				const myPaddleZ = myPaddle?.position.z ?? 0;
				const lastZ = pong.current.lastSentPaddleZ ?? null;

				// console.log("Current Z:", myPaddleZ, "Last sent Z:", lastZ);


				const paddleMoved = lastZ === null || Math.abs(myPaddleZ - lastZ) > 0.01;

				if (paddleMoved) {
					const payload: any = {
						type: 'final_update',
						gameId: pong.current.tournamentId,
					};
					// console.log("Paddle moved, preparing payload...");
					if (isHost) {
						payload.paddle1Z = myPaddleZ;
					} else {
						payload.paddle2Z = myPaddleZ;
					}
					// console.log("📤 Envoi game_update:", payload);
					socketRef.current.send(JSON.stringify(payload));
					pong.current.lastSentPaddleZ = myPaddleZ;
					pong.current.lastUpdateSetAt = now;
				}
				if (isHost) {
					const payload: any = {
						type: 'final_update',
						gameId: pong.current.tournamentId,
					}
					if (pong.current.ball) {
						pong.current.ball.position.x += pong.current.ballDirection.x * pong.current.ballSpeedModifier;
						pong.current.ball.position.z += pong.current.ballDirection.z * pong.current.ballSpeedModifier;
						game.makeBallBounce(pong, states, gameModes);
						payload.ballPosition = {
							x: pong.current.ball.position.x,
							y: pong.current.ball.position.y,
							z: pong.current.ball.position.z,
						};
						payload.ballDirection = {
							x: pong.current.ballDirection.x,
							y: pong.current.ballDirection.y,
							z: pong.current.ballDirection.z,
						};
						payload.ballSpeedModifier = pong.current.ballSpeedModifier;
					}
					// console.log("📤 Envoi game_update Ball:", payload);
					socketRef.current.send(JSON.stringify(payload));
					pong.current.lastUpdateSetAt = now;
				}
			}
			break;
		}

		case game.states.tournament_final_game_finished: {
			if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
				console.log("🏁 Finale terminée, envoi des scores...");
				socketRef.current.send(JSON.stringify({
					type: 'final_finished',
					player1Score: pong.current.tournamenFinalScore1,
					player2Score: pong.current.tournamenFinalScore2,
					reason: 'normal',
				}));
			}
			break;
		}

		default:
			// console.warn("⚠️ État de tournoi inconnu:", states.current);
			break;

	}
}