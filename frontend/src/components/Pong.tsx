// imports
import React, { use } from 'react';
import { useNavigate } from 'react-router-dom';

import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';

// Function to debounce the resize event
// This will limit the number of times the resize function is called
// to once every `ms` milliseconds
function	debounce(fn: Function, ms: number)
{
	let	timer: NodeJS.Timeout;
	return (...args: any[]) =>
	{
		clearTimeout(timer);
		timer = setTimeout(() => { fn(...args); }, ms);
	};
}

const	Pong: React.FC = () =>
{
	const	canvasRef = React.useRef<HTMLCanvasElement | null>(null);
	const	pong = React.useRef<game.pongStruct>(game.initPongStruct());
	const	states = React.useRef<game.states>(game.states.main_menu);
	const	gameModes = React.useRef<game.gameModes>(game.gameModes.none);
	const	lang = React.useRef<game.lang>(game.lang.english);
	const	navigate = useNavigate();

	const userNameRef = React.useRef<string | null>(null);


	// const	[userName, getUserName] = React.useState<string | null>(null);
	const	socketRef = React.useRef<WebSocket | null>(null);
	const	lastHandledState = React.useRef<game.states>(game.states.main_menu);
	const [gameState, setGameState] = React.useState<'idle' | 'playing' | 'finished'>('idle');
	const [winner, setWinner] = React.useState<string | null>(null);
	const [reason, setReason] = React.useState<string | null>(null);

	React.useEffect(() =>
	{
		if (!canvasRef.current) return;
		canvasRef.current.focus();

		// Initialize the game
		game.instantiateArena(pong.current, canvasRef.current);
		

		// Initialize all the GUI
		if (!pong.current.engine || !pong.current.scene) return;
		console.log("Initializing GUI...");
		console.log("GUI initialization complete");
		
		
		const ws = new WebSocket('ws://localhost:4000/ws'); // adapte l'URL à ton cas
		socketRef.current = ws;
		
		ws.onopen = () => {
			console.log("✅ WebSocket connecté");
		};
		
		ws.onerror = (err) => {
			console.error("❌ WebSocket erreur :", err);
		};
		
		game.initializeAllGUIScreens(pong, gameModes, states, lang, socketRef, navigate);

		ws.onmessage = (event) => {
			console.log("📩 Message reçu :", event.data);

			let data;
			try {
				data = JSON.parse(event.data);
			} catch (err) {
				console.error("❌ Erreur parsing JSON :", err);
				return;
			}

			switch (data.type) {

				case 'game_hosted': {
					console.log('🎮 Game hosted with ID:', data.gameId);

					pong.current.isHost = true ;
					const roomId = data.gameId;
					pong.current.lastHostedRoomId = roomId;

					const roomName = `${userNameRef.current || 'Anonymous'}'s room`;
					console.log("🧠 userNameRef.current =", userNameRef.current);

					const roomPanel = game.createRoomPanel(pong, lang, roomName, () => {
						console.log("🧩 Creating GUI for", roomId);
						socketRef.current?.send(JSON.stringify({
							type: 'join_game',
							gameId: roomId,
							roomName: roomName,
						}));
					});
					console.log("📦 roomPanel créé :", roomPanel?.name ?? 'undefined');

					pong.current.rooms.set(roomId, () => roomPanel);
					console.log("🗂 Room ajoutée au Map avec ID:", roomId);
					break;
				}

				case 'room_list': {
					console.log("📜 Liste des rooms reçue:", data.rooms);

					// Réinitialise les rooms
					pong.current.rooms.clear();

					for (const room of data.rooms) {
						const roomPanel = game.createRoomPanel(pong, lang, room.roomName, () => {
							console.log("🔗 Joining room:", room.gameId);
							pong.current.isHost = false;
							socketRef.current?.send(JSON.stringify({
								type: 'join_game',
								gameId: room.gameId,
							}));
						});
						pong.current.rooms.set(room.gameId, () => roomPanel);
					}

					// MAJ de l’affichage GUI
					const updatedList = game.refreshRoomsEntries(pong, states, gameModes);
					const verticalStack = pong.current.roomListVerticalStackPanel;
					if (verticalStack) {
						const old = verticalStack.getChildByName("roomsVerticalPanel");
						if (old) verticalStack.removeControl(old);
						verticalStack.addControl(updatedList);
					} else {
						console.warn("⚠️ roomListVerticalStackPanel introuvable");
					}

					break;
				}

				case 'room_left': {
					const roomId = data.gameId;
					console.log("🚪 Room left:", roomId);

					const roomPanel = pong.current.rooms.get(roomId)?.();
					if (roomPanel) {
						roomPanel.dispose();
						pong.current.rooms.delete(roomId);
						console.log("🗑️ Room removed from Map:", roomId);
					} else {
						console.warn("⚠️ Room panel not found for ID:", roomId);
					}
					break;
				}

				case 'joined_game': {
					console.log('👥 Rejoint game:', data.gameId);

					break;
				}

				case 'start_game': {
					console.log("🚀 Start game triggered for:", data.gameId);
					states.current = game.states.waiting_to_start;
					break;
				}

				case 'state_update': {
					// console.log("🎮 Game update received:", data);

					if (gameModes.current === game.gameModes.online) {
						// 🎯 HOST: applique la position de l'adversaire (player 2)
						if (pong.current.isHost && typeof data.paddle2Z === 'number') {
							pong.current.paddle2TargetZ = data.paddle2Z;
						}

						if (!pong.current.isHost && typeof data.paddle1Z === 'number') {
							pong.current.paddle1TargetZ = data.paddle1Z;
						}

						// 🟢 Seul le host reçoit et met à jour la balle
						if (!pong.current.isHost && data.ballPosition && pong.current.ball) {
							pong.current.ball.position.x = data.ballPosition.x;
							pong.current.ball.position.y = data.ballPosition.y;
							pong.current.ball.position.z = data.ballPosition.z;
						}

						if (!pong.current.isHost && data.ballDirection) {
							pong.current.ballDirection = data.ballDirection;
						}

						if (!pong.current.isHost && typeof data.ballSpeedModifier === 'number') {
							pong.current.ballSpeedModifier = data.ballSpeedModifier;
						}
					}

					break;
				}

				case 'game_finished': {
					console.log("🏁 Game finished:", data.reason || "normal");

					// ✅ Mets à jour l'état interne de ton jeu
					states.current = game.states.game_finished;

					// ✅ Stocke les infos du gagnant et de la raison
					pong.current.lastGameWinner = data.winner;
					pong.current.lastGameReason = data.reason || 'normal';

					// ✅ Envoie les infos pour la DB (si pas déjà envoyé)
					if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
						socketRef.current.send(JSON.stringify({
							type: 'game_result',
							player1Score: pong.current.player1Score,
							player2Score: pong.current.player2Score,
							winner: pong.current.player1Score > pong.current.player2Score ? 'player1' : 'player2',
							reason: data.reason || 'normal'
						}));
					}

					break;
				}
				case 'error': {
					console.error('❗ Erreur serveur:', data.message);
					break;
				}

				default: {
					console.log('ℹ️ Message inconnu reçu:', data);
				}
			}
		};

		

		// Game loop
		if (!pong.current.engine || !pong.current.scene) return;
		
		if (gameModes.current === game.gameModes.online)
		{
			switch (states.current) {

				default: {
					if (
						socketRef.current &&
						socketRef.current.readyState === WebSocket.OPEN &&
						lastHandledState.current !== states.current
					) {
						console.log("Last handled state:", lastHandledState.current);
						console.log("Sending current state:", states.current);
						lastHandledState.current = states.current;
					}
					break;
				}
			}
		}
		else {
			game.manageLocalKeyboardInputs(pong.current);
		}


		const getUsernameFromBackend = async (userId: string): Promise<string | null> => {
			try {
				const res = await fetch(`https://localhost:3000/api/me`, {
					headers: {
						Authorization: `Bearer ${localStorage.getItem('authToken')}`, // adapte si tu n'utilises pas JWT
					},
				});
				if (!res.ok) throw new Error("Failed to fetch user");
				const data = await res.json();
				console.log("Username récupéré:", data.pseudo);
				return data.pseudo;
			} catch (err) {
				console.error("❌ Erreur récupération username:", err);
				return null;
			}
		};



		const userId = localStorage.getItem('userId');
		if (userId) {
			getUsernameFromBackend(userId).then(username => {
				userNameRef.current = username;
				console.log("✅ Username stocké:", username);
			});
		} else {
			console.warn("⚠️ Aucun userId dans le localStorage.");
		}

		pong.current.engine.runRenderLoop(() =>
		{
			// const	dummyTitle: baby.TextBlock = game.findComponentByName(pong, "mainMenuDummyTitle");
			// if (dummyTitle instanceof baby.TextBlock) {console.log("found"); dummyTitle.text =  "banane"; dummyTitle.markAsDirty(); if (pong.current.guiTexture) { pong.current.guiTexture.markAsDirty(); }}
			// if (pongTitle) {console.log("found"); pongTitle.text =  Math.random().toString(36).substring(2, 7).toUpperCase();}
			game.updateGUIVisibilityStates(pong, states.current);
			game.updateGUIVisibilityGameModes(pong, gameModes.current);
			game.updateGUIValues(pong, states, lang);
			if
			(
				!pong.current.scene ||
				!pong.current.engine ||
				!pong.current.paddle1 ||
				!pong.current.paddle2 ||
				!pong.current.ball
			) return;


			if (
				lastHandledState.current === game.states.hosting_waiting_players &&
				states.current !== game.states.hosting_waiting_players
				&& states.current !== game.states.in_game 
				&& states.current !== game.states.game_finished
				&& states.current !== game.states.countdown
				&& states.current !== game.states.waiting_to_start
			) {
				const roomId = pong.current.lastHostedRoomId;
				if (roomId && socketRef.current?.readyState === WebSocket.OPEN) {
					console.log("👋 Host a quitté la salle d'attente, envoi de leave_room pour", roomId);
					socketRef.current.send(JSON.stringify({
						type: 'leave_room',
						gameId: roomId,
					}));
					console.log("🗑️ Suppression de la room:", roomId);
					pong.current.lastHostedRoomId = 'none';
					pong.current.rooms.delete(roomId);
				}
			}
			if (gameModes.current === game.gameModes.online)
			{
				switch (states.current) {
					case game.states.hosting_waiting_players: {
						if (
							socketRef.current &&
							socketRef.current.readyState === WebSocket.OPEN &&
							lastHandledState.current !== game.states.hosting_waiting_players
						) {
							const name = userNameRef.current || 'Anonymous';
							console.log(`🎮 Hosting game as ${name}`);
							socketRef.current.send(JSON.stringify({
								type: 'host_game',
								roomName: `${name}'s room`,
							}));
							lastHandledState.current = game.states.hosting_waiting_players;
						}
						break;
					}

					case game.states.room_list: {
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


					case game.states.waiting_to_start: {
						if (
							socketRef.current &&
							socketRef.current.readyState === WebSocket.OPEN &&
							lastHandledState.current !== game.states.waiting_to_start
						) {
							console.log("Waiting for players to join...");
							// socketRef.current.send(JSON.stringify({ type: 'waiting_to_start' }));
							lastHandledState.current = game.states.waiting_to_start;
							pong.current.player1Score = 0;
							pong.current.player2Score = 0;
							game.resetPaddlesPosition(pong.current);
							game.resetBall(pong.current);
							game.setBallDirectionRandom(pong.current);
							game.fitCameraToArena(pong.current);
							states.current = game.states.countdown;
							game.transitionToCamera(pong.current.scene?.activeCamera as baby.FreeCamera, pong.current.arenaCam, 1, pong, states);
						}
						break;
					}

					case game.states.countdown: {

						pong.current.countdown -= pong.current.engine.getDeltaTime() / 1000;
						if (pong.current.countdown <= 0)
						{
							pong.current.countdown = 4;
							states.current = game.states.in_game;
						}
						break;
					}

					case game.states.game_finished: {
						if (
							socketRef.current &&
							socketRef.current.readyState === WebSocket.OPEN &&
							lastHandledState.current !== game.states.game_finished
						) {
							console.log("Game finished, sending scores");
							socketRef.current.send(JSON.stringify({
								type: 'game_finished',
								player1Score: pong.current.player1Score,
								player2Score: pong.current.player2Score,
							}));
							lastHandledState.current = game.states.game_finished;
						}
						break;
					}

					case game.states.in_game: {
						const now = Date.now();
						const timeSinceLastUpdate = now - (pong.current.lastUpdateSetAt || 0);

						if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
							game.fitCameraToArena(pong.current);

							// 1. Input du joueur local
							game.doPaddleMovement(pong, gameModes);

							// 2. Score check
							const maxScore = Math.max(pong.current.player1Score, pong.current.player2Score);
							if (maxScore >= pong.current.requiredPointsToWin)
							{
								states.current = game.states.game_finished;
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

							// console.log("Current Z:", myPaddleZ, "Last sent Z:", lastZ);


							const paddleMoved = lastZ === null || Math.abs(myPaddleZ - lastZ) > 0.01;

							if (paddleMoved) {
								const payload: any = {
									type: 'game_update',
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
									type: 'game_update',
								}
								pong.current.ball.position.x += pong.current.ballDirection.x * pong.current.ballSpeedModifier;
								pong.current.ball.position.z += pong.current.ballDirection.z * pong.current.ballSpeedModifier;
								game.makeBallBounce(pong.current, states);
								if (pong.current.ball) {
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


					default: {
						if (
							lastHandledState.current === game.states.hosting_waiting_players &&
							(states.current as game.states) !== game.states.hosting_waiting_players
							&& (states.current as game.states) !== game.states.in_game 
							&& (states.current as game.states) !== game.states.game_finished
							&& (states.current as game.states) !== game.states.countdown
							&& (states.current as game.states) !== game.states.waiting_to_start
						) {
							console.log("Sending current state:", states.current);
							console.log("Last handled state:", lastHandledState.current);

							// if (socketRef.current) {
							// 	socketRef.current.send(JSON.stringify({
							// 		type: 'state_update',
							// 		state: states.current,
							// 	}));
							// }
							lastHandledState.current = states.current;
							
						}
						break;
					}
				}
			}

			else 
			{
				switch (states.current)
				{
					default:
						if (states.current > (Object.keys(game.states).length / 2) - 1) states.current = 0;
						if (states.current < 0) states.current = (Object.keys(game.states).length / 2) - 1;
						break;
	
					case game.states.countdown:
						pong.current.countdown -= pong.current.engine.getDeltaTime() / 1000;
						if (pong.current.countdown <= 0)
						{
							pong.current.countdown = 4;
							states.current = game.states.in_game;
						}
						break;
						
					case game.states.waiting_to_start:
						pong.current.player1Score = 0;
						pong.current.player2Score = 0;
						game.resetPaddlesPosition(pong.current);
						game.resetBall(pong.current);
						game.setBallDirectionRandom(pong.current);
						game.fitCameraToArena(pong.current);
						states.current = game.states.countdown;
						game.transitionToCamera(pong.current.scene?.activeCamera as baby.FreeCamera, pong.current.arenaCam, 1, pong, states);
						break;
	
					case game.states.in_game:
						const	maxScore = Math.max(pong.current.player1Score, pong.current.player2Score);
						console.log("Max score: ", maxScore);
						if (maxScore >= pong.current.requiredPointsToWin)
							states.current = game.states.game_finished;
						game.doPaddleMovement(pong, gameModes);
						game.fitCameraToArena(pong.current);
						pong.current.ball.position.x += pong.current.ballDirection.x * pong.current.ballSpeedModifier;
						pong.current.ball.position.z += pong.current.ballDirection.z * pong.current.ballSpeedModifier;
						game.makeBallBounce(pong.current, states);
						break;
					
				
				}
			}
			
			pong.current.scene.render();
			document.title = `Pong - ${Object.keys(game.states).find(key => game.states[key as keyof typeof game.states] === states.current)}`;
		});

		// Debounced resize handler
		const	handleResize = debounce(() =>
		{
			if (!pong.current.engine) return;
			pong.current.engine.resize();
		}, 50); // 50ms debounce to skip crashes

		window.addEventListener('resize', handleResize);
		
		return () =>
		{
			if (!pong.current.engine) return;
			pong.current.engine.dispose();
		};
	}, [navigate]);


	return (
		<div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
			<canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
		</div>
	);
};

export default Pong;
