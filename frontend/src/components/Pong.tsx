// imports
import React, { use } from 'react';
import { useNavigate } from 'react-router-dom';

import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';
import BackgroundMusic from '@/components/BG';
import { useWebSocketOnline, useOnlineLoop } from '@/utils/pong/onlineWS';
import { get } from 'http';

// Limits the number of times the resizing can be called in a given time frame
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
	const	playerState = React.useRef<game.playerStates>(game.playerStates.none);
	const	lang = React.useRef<game.lang>(game.lang.english);
	const	navigate = useNavigate();

	const	userNameRef = React.useRef<string>(null as unknown as string);
	const	audioRef = React.useRef<HTMLAudioElement | null>(null);

	const [gameModeTrigger, setGameModeTrigger] = React.useState<number>(0);

	// const	[userName, getUserName] = React.useState<string | null>(null);
	const	socketRef = React.useRef<WebSocket | null>(null);
	const	lastHandledState = React.useRef<game.states>(game.states.main_menu);

	// lastState, lastPlayerState, and lastLang
	const	lastState = React.useRef<game.states>(states.current);
	const	lastPlayerState = React.useRef<game.playerStates>(playerState.current);
	const	lastLang = React.useRef<game.lang>(lang.current);


	React.useEffect(() => {
		if (
			gameModes.current === game.gameModes.online ||
			gameModes.current === game.gameModes.tournament
		) {
			const token = localStorage.getItem('authToken');
			const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
			const wsProtocol = isLocalhost ? 'ws:' : (window.location.protocol === 'https:' ? 'wss:' : 'ws:');

			const wsUrl =
				gameModes.current === game.gameModes.tournament
					? `${wsProtocol}//${window.location.hostname}:4002/ws?token=${token || ''}`
					: `${wsProtocol}//${window.location.hostname}:4000/ws?token=${token || ''}`;

			console.log("🌐 Connecting WebSocket to:", wsUrl);
			const ws = new WebSocket(wsUrl);
			socketRef.current = ws;

			ws.addEventListener('open', () => {
				console.log("✅ WebSocket connected successfully");
			});
			ws.addEventListener('error', (event) => {
				console.error("❌ WebSocket connection error:", event);
			});

			useWebSocketOnline(pong, socketRef, gameModes, states, lang, userNameRef, ws);

			import('@/utils/pong/tournament').then(tournamentModule => {
				tournamentModule.useTournamentWebSocket(
					pong,
					socketRef,
					gameModes,
					states,
					lang,
					userNameRef,
					ws,
					lastHandledState,
				);
			});
		}
	}, [gameModeTrigger]);

	React.useEffect(() =>
	{
		const audio = new Audio("/assets/vaporwave.mp3");
		audio.loop = true;
		audio.volume = 1; // Ajuste le volume
		audioRef.current = audio;
		console.log("🎵 Musique de fond chargée");

		const playAudio = () =>
		{
			console.log("🎵 Tentative de lecture de la musique de fond");
			audio.play().catch((e) => { console.warn("🎵 Autoplay bloqué : interaction utilisateur requise."); });
		};

		document.addEventListener("click", playAudio, { once: true });

		if (!canvasRef.current) return;
		canvasRef.current.focus();

		// Initialize the game
		game.setupBabylon(pong.current, canvasRef.current);
		// Initialize all the GUI
		game.initializeAllGUIScreens(pong, gameModes, states, playerState, lang, socketRef, navigate, setGameModeTrigger, lastHandledState);
		game.updateGUIVisibilityStates(pong, states.current);
		game.updateGUIVisibilityPlayerStates(pong, playerState.current);
		game.updateGUIValues(pong, states, lang);
		

		console.log("Initializing GUI...");
		console.log("GUI initialization complete");
		

		// const token = localStorage.getItem('authToken');
		// const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		// const wsUrl =
		// 	gameModes.current === game.gameModes.tournament
		// 		? `${wsProtocol}//${window.location.hostname}:4002/ws?token=${token || ''}`
		// 		: `${wsProtocol}//${window.location.hostname}:4000/ws?token=${token || ''}`;
		// console.log("🌐 Connecting WebSocket to:", wsUrl);
		// const ws = new WebSocket(wsUrl);

		// // Add event listeners for better debugging
		// ws.addEventListener('open', () => {
		// 	console.log("✅ WebSocket connected successfully");
		// });
		
		// ws.addEventListener('error', (event) => {
		// 	console.error("❌ WebSocket connection error:", event);
		// });


		// // Register WebSocket handlers for both online and tournament modes
		// useWebSocketOnline(pong, socketRef, gameModes, states, lang, userNameRef, ws);
		
		// // Add tournament WebSocket integration
		// import('@/utils/pong/tournament').then(tournamentModule => {
		// 	tournamentModule.useTournamentWebSocket(
		// 		pong, 
		// 		socketRef, 
		// 		gameModes, 
		// 		states, 
		// 		lang, 
		// 		userNameRef, 
		// 		ws
		// 	);
		// });
		
		if (gameModes.current === game.gameModes.online)
		{
			if
			(
				socketRef.current &&
				socketRef.current.readyState === WebSocket.OPEN &&
				lastHandledState.current !== states.current
			)
			{
				console.log("Last handled state:", lastHandledState.current);
				console.log("Sending current state:", states.current);
				lastHandledState.current = states.current;
			}
		}
		else game.manageLocalKeyboardInputs(pong.current);

		const getIdnameFromBackend = async (): Promise<string | null> => {
			try {
				const res = await fetch(`/api/me`, {
					headers: {
						Authorization: `Bearer ${localStorage.getItem('authToken')}`, // adapte si tu n'utilises pas JWT
					},
				});
				if (!res.ok) throw new Error("Failed to fetch user");
				const data = await res.json();
				console.log("Username récupéré:", data.id);
				return data.id;
			} catch (err) {
				console.error("❌ Erreur récupération username:", err);
				return null;
			}
		};



		getIdnameFromBackend().then((id) => {
			if (id) {
				userNameRef.current = id;
				console.log("✅ Username set to:", userNameRef.current);
			} else {
				console.warn("⚠️ Username not found, fallback to 'Player'");
				userNameRef.current = 'Player';
			}
		}).catch((err) => {
			console.error("❌ Erreur récupération du nom d'utilisateur:", err);
			userNameRef.current = 'Player'; // fallback
		});

		// userId.then((name) => {
		// 	if (name) {
		// 		userNameRef.current = name;
		// 		console.log("Username set to:", userNameRef.current);
		// 	} else {
		// 		console.warn("Username not found, using default 'Player'");
		// 		userNameRef.current = 'Player';
		// 	}
		// }).catch((err) => {
		// 	console.error("❌ Erreur lors de la récupération du nom d'utilisateur:", err);
		// 	userNameRef.current = 'Player'; // Fallback to default name
		// });

		// if (!pong.current.scene) return;
		// pong.current.scene.debugLayer.show
		// ({
		// 	embedMode: true,
		// 	handleResize: true,
		// 	overlay: true,
		// });


		// Game loop
		if (!pong.current.engine) return;
		pong.current.engine.runRenderLoop(() =>
		{
			game.updateGUIsWhenNeeded(pong, states, gameModes, playerState, lang, lastState, lastPlayerState, lastLang);
			if
			(
				!pong.current.scene ||
				!pong.current.engine ||
				!pong.current.paddle1 ||
				!pong.current.paddle2 ||
				!pong.current.ball
			) return;


			if (
				(lastHandledState.current === game.states.hosting_waiting_players &&
				states.current !== game.states.hosting_waiting_players
				&& states.current !== game.states.in_game 
				&& states.current !== game.states.game_finished
				&& states.current !== game.states.countdown
				&& states.current !== game.states.tournament_bracket_preview
				&& states.current !== game.states.waiting_to_start) || (
				lastHandledState.current === game.states.tournament_bracket_preview &&
				states.current !== game.states.tournament_bracket_preview
				&& states.current !== game.states.in_game
				&& states.current !== game.states.game_finished
				&& states.current !== game.states.countdown
				&& states.current !== game.states.waiting_to_start
				&& states.current !== game.states.hosting_waiting_players
				)
			) {
				console.log("roomId:", pong.current.lastHostedRoomId);
				const roomId = pong.current.lastHostedRoomId;
				if (gameModes.current === game.gameModes.online && roomId !== 'none') {

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
				else if (gameModes.current === game.gameModes.tournament && pong.current.isHost)
				{
					console.log("🏆 Tournament mode active, checking if host is leaving tournament room");
					if (roomId && roomId !== 'none' && socketRef.current?.readyState === WebSocket.OPEN)
					{
						console.log("||||||||||||||||||||||||||||||| roomId:", roomId);
						
						console.log("👋 Host a quitté la salle d'attente, envoi de leave_room pour tournoi");
						if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
							socketRef.current.send(JSON.stringify({
								type: 'leave_tournament',
								gameId: roomId,
							}));
						}
						console.log("🗑️ Suppression de la room de tournoi:", roomId);
						pong.current.lastHostedRoomId = 'none';
						pong.current.party.delete(roomId);
					}
				}
				lastHandledState.current = states.current;
			}
			if (gameModes.current === game.gameModes.online)
			{
				useOnlineLoop(pong, socketRef, gameModes, states, userNameRef, lastHandledState);
			}
			else if (gameModes.current === game.gameModes.tournament)
			{
				// Handle tournament gameplay loop
				import('@/utils/pong/tournament').then(tournamentModule => {
					tournamentModule.handleTournamentLoop(
						pong,
						socketRef,
						gameModes,
						states,
						userNameRef,
						lastHandledState
					);
				});
			}
			else 
			{
				switch (states.current)
				{
					default:
						// if (states.current > (Object.keys(game.states).length / 2) - 1) states.current = 0;
						// if (states.current < 0) states.current = (Object.keys(game.states).length / 2) - 1;
						break;

					case game.states.not_found:
						if (pong.current.scene.activeCamera !== pong.current.notFoundCam)
							{ game.transitionToCamera(pong.current.scene?.activeCamera as baby.FreeCamera, pong.current.notFoundCam, 1, pong, states); }
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
						if (maxScore >= pong.current.requiredPointsToWin)
							states.current = game.states.game_finished;
						// game.doPaddleMovement(pong, gameModes);
						game.fitCameraToArena(pong.current);
						pong.current.ball.position.x += pong.current.ballDirection.x * pong.current.ballSpeedModifier;
						pong.current.ball.position.z += pong.current.ballDirection.z * pong.current.ballSpeedModifier;
						// game.makeBallBounce(pong.current, states);
						break;
				}
			}

			pong.current.scene.render();
			document.title = `Pong - ${Object.keys(game.states).find(key => game.states[key as keyof typeof game.states] === states.current)}`;
		});

		// Handle movement in the background
		const backgroundCalculations = setInterval(() =>
		{
			game.doPaddleMovement(pong, gameModes, states);
			game.makeBallBounce(pong.current, states);
		}, 16.667);

		// Update GUI values every 200ms
		const updateGUIsValuesWhenNeeded = setInterval(() =>
		{
			game.updateGUIValues(pong, states, lang);
		}, 200);

		// Handle resizing of the canvas
		const	handleResize = debounce(() =>
		{
			if (!pong.current.engine) return;
			pong.current.engine.resize();
		}, 50);

		window.addEventListener('resize', handleResize);
		
		return () =>
		{
			clearInterval(backgroundCalculations);
			clearInterval(updateGUIsValuesWhenNeeded);
			if (!pong.current.engine) return;
			pong.current.engine.dispose();
		};
	}, [navigate]);


	return (
		<div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
			<canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
			<BackgroundMusic/>
		</div>
	);
};

export default Pong;
