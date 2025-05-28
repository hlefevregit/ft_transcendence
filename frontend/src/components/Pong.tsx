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
	const	userNameRef = React.useRef<string | null>(null);
	const	navigate = useNavigate();

	// const	[userName, getUserName] = React.useState<string | null>(null);
	const	socketRef = React.useRef<WebSocket | null>(null);
	const	lastHandledState = React.useRef<game.states>(states.current);


	React.useEffect(() =>
	{
		if (!canvasRef.current) return;
		canvasRef.current.focus();

		// Initialize the game assets and map
		game.instantiateArena(pong.current, canvasRef.current);
		

		// Initialize all the GUI
		if (!pong.current.engine || !pong.current.scene) return;
		console.log("Initializing GUI...");
		console.log("GUI initialization complete");
		
		
		const ws = new WebSocket('ws://localhost:4000/ws'); // adapte l'URL à ton cas
		socketRef.current = ws;
		
		ws.onopen = () => { console.log("✅ WebSocket connecté"); };
		
		ws.onerror = (err) => { console.error("❌ WebSocket erreur :", err); };
		
		game.initializeAllGUIScreens(pong, gameModes, states, lang, socketRef, navigate);

		ws.onmessage = (event) => {
			console.log("📩 Message reçu :", event.data);

			let data;
			try { data = JSON.parse(event.data); }
			catch (err) {
				console.error("❌ Erreur parsing JSON :", err);
				return;
			}

			switch (data.type) {

				case 'game_hosted': {
					console.log('🎮 Game hosted with ID:', data.gameId);

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
							socketRef.current?.send(JSON.stringify({
								type: 'join_game',
								gameId: room.gameId,
							}));
						});
						pong.current.rooms.set(room.gameId, () => roomPanel);
					}

					// MAJ de l’affichage GUI
					const updatedList = game.refreshRoomsEntries(pong, states, gameModes, lang);
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
							socketRef.current.send(JSON.stringify({ type: 'waiting_to_start' }));
							lastHandledState.current = game.states.waiting_to_start;
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
						if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
							const paddle1Y = pong.current.paddle1?.position.y;
							const paddle2Y = pong.current.paddle2?.position.y;
							const ballPosition = pong.current.ball?.position;
							const ballDirection = pong.current.ballDirection;
							const ballSpeedModifier = pong.current.ballSpeedModifier;

							socketRef.current.send(JSON.stringify({
								type: 'game_update',
								paddle1Y,
								paddle2Y,
								ballPosition,
								ballDirection,
								ballSpeedModifier,
							}));
						}
						break;
					}

					default: {
						if (
							lastHandledState.current === game.states.hosting_waiting_players &&
							(states.current as game.states) !== game.states.hosting_waiting_players
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
