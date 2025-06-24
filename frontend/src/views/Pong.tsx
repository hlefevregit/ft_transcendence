import React, { use } from 'react';
import { useNavigate } from 'react-router-dom';

import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';
import BackgroundMusic from '@/components/BG';
import { useWebSocketOnline, useOnlineLoop } from '@/utils/pong/onlineWS';



const	Pong: React.FC = () =>
{
	// Refs
	const	canvasRef =			React.useRef<HTMLCanvasElement | null>(null);
	const	pong =				React.useRef<game.pongStruct>(game.initPongStruct());
	const	state =				React.useRef<game.states>(game.states.main_menu);
	const	lastState =			React.useRef<game.states>(state.current);
	const	gameModes =			React.useRef<game.gameModes>(game.gameModes.none);
	const	playerState =		React.useRef<game.playerStates>(game.playerStates.none);
	const	lastPlayerState =	React.useRef<game.playerStates>(playerState.current);
	const	lang =				React.useRef<game.lang>(game.lang.english);
	const	lastLang =			React.useRef<game.lang>(lang.current);
	const	userNameRef =		React.useRef<string>(null as unknown as string);
	const	musicRef =			React.useRef<HTMLAudioElement | null>(null);
	const	audioRef =			React.useRef<HTMLAudioElement | null>(null);
	const	socketRef =			React.useRef<WebSocket | null>(null);
	const	lastHandledState = React.useRef<game.states>(game.states.main_menu);
	// Hooks
	const	[gameModeTrigger, setGameModeTrigger] = React.useState<number>(0);
	const	navigate = useNavigate();



	React.useEffect(() => {
		if (
			gameModes.current === game.gameModes.online ||
			gameModes.current === game.gameModes.tournament
		) {
			const token = localStorage.getItem('authToken');
			const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
			const wsProtocol = isLocalhost ? 'ws:' : (window.location.protocol === 'https:' ? 'wss:' : 'ws:');

			const wsUrl =`${wsProtocol}//${window.location.hostname}:4000/ws?token=${token || ''}`;

			console.log("🌐 Connecting WebSocket to:", wsUrl);
			const ws = new WebSocket(wsUrl);
			socketRef.current = ws;

			ws.addEventListener('open', () => {
				console.log("✅ WebSocket connected successfully");
			});
			ws.addEventListener('error', (event) => {
				console.error("❌ WebSocket connection error:", event);
			});

			useWebSocketOnline(pong, socketRef, gameModes, state, lang, userNameRef, ws);

			// import('@/utils/pong/tournament').then(tournamentModule => {
			// 	tournamentModule.useTournamentWebSocket(
			// 		pong,
			// 		socketRef,
			// 		gameModes,
			// 		state,
			// 		lang,
			// 		userNameRef,
			// 		ws,
			// 		lastState,
			// 	);
			// });
		}
	}, [gameModeTrigger]);


	React.useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "F4") {
				console.log("🔍 F4 pressed, launching easter egg...");
				fetch('/api/launch-easter-egg'); // Appelle le backend
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, []);

	React.useEffect(() =>
	{



		if (!canvasRef.current) return;
		canvasRef.current.focus();

		// Initialize babylon
		game.setupBabylonPong(pong.current, canvasRef.current);
		// Initialize all the GUI screens
		game.initializeAllGUIScreens
		(
			pong,
			gameModes,
			state,
			playerState,
			lang,
			socketRef,
			navigate,
			setGameModeTrigger,
			lastHandledState,
			musicRef,
			audioRef,
		);
		game.updateScreensVisibilityStates(pong, state.current);
		game.updateGUIVisibilityPlayerStates(pong, playerState.current , gameModes.current);
		game.updateGUIValues(pong, lang);

		if (gameModes.current === game.gameModes.online)
		{
			if
			(
				   socketRef.current
				&& socketRef.current.readyState === WebSocket.OPEN
				&& lastHandledState.current !== state.current
			)
			{
				console.log("Last handled state:", lastHandledState.current);
				console.log("Sending current state:", state.current);
				lastHandledState.current = state.current;
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

		// show inspector
		// if (pong.current.scene)
		// {
		// 	pong.current.scene.debugLayer.show
		// 	({
		// 		showExplorer: true,
		// 		showInspector: true,
		// 		embedMode: true,
		// 	});
		// }

		// Game loop
		if (!pong.current.engine) return;
		pong.current.engine.runRenderLoop(() =>
		{
			game.updateGUIsWhenNeeded(pong, state, gameModes, playerState, lang, lastState, lastPlayerState, lastLang);
			if
			(
				   !pong.current.scene
				|| !pong.current.engine
				|| !pong.current.paddle1
				|| !pong.current.paddle2
				|| !pong.current.ball
			) return;

			// if
			// (
			// 	(
			// 		   lastState.current === game.states.hosting_waiting_players
			// 		&& state.current !== game.states.hosting_waiting_players
			// 		&& state.current !== game.states.in_game
			// 		&& state.current !== game.states.game_finished
			// 		&& state.current !== game.states.countdown
			// 		&& state.current !== game.states.tournament_bracket_preview
			// 		&& state.current !== game.states.in_transition
			// 		&& state.current !== game.states.not_found
			// 		&& state.current !== game.states.launch_games
			// 		&& state.current !== game.states.waiting_to_start
			// 	)
			// 	||
			// 	(
			// 		   lastState.current === game.states.tournament_bracket_preview
			// 		&& state.current !== game.states.tournament_bracket_preview
			// 		&& state.current !== game.states.in_game
			// 		&& state.current !== game.states.game_finished
			// 		&& state.current !== game.states.countdown
			// 		&& state.current !== game.states.in_transition
			// 		&& state.current !== game.states.not_found
			// 		&& state.current !== game.states.launch_games
			// 		&& state.current !== game.states.tournament_round_1_game_1
			// 		&& state.current !== game.states.tournament_round_1_game_2
			// 		&& state.current !== game.states.in_game1
			// 		&& state.current !== game.states.in_game2
			// 		&& state.current !== game.states.waiting_to_start
			// 		&& state.current !== game.states.hosting_waiting_players
			// 	)
			// )
			// {
			// 	// console.log("roomId:", pong.current.lastHostedRoomId);
			// 	const roomId = pong.current.lastHostedRoomId;
			// 	if (gameModes.current === game.gameModes.online && roomId !== 'none') {

			// 		if (roomId && socketRef.current?.readyState === WebSocket.OPEN) {
			// 			console.log("👋 Host a quitté la salle d'attente, envoi de leave_room pour", roomId);
			// 			socketRef.current.send(JSON.stringify({
			// 				type: 'leave_room',
			// 				gameId: roomId,
			// 			}));
			// 			console.log("🗑️ Suppression de la room:", roomId);
			// 			pong.current.lastHostedRoomId = 'none';
			// 			pong.current.rooms.delete(roomId);
			// 		}
			// 	}
			// }
			if (gameModes.current === game.gameModes.online)
			{
				useOnlineLoop(pong, socketRef, gameModes, state, userNameRef, lastHandledState);
			}
			// else if (gameModes.current === game.gameModes.tournament)
			// {
			// 	// Handle tournament gameplay loop
			// 	import('@/utils/pong/tournament').then(tournamentModule => {
			// 		tournamentModule.handleTournamentLoop(
			// 			pong,
			// 			socketRef,
			// 			gameModes,
			// 			state,
			// 			userNameRef,
			// 			lastHandledState,
			// 		);
			// 	});
			// }
			else
			{
				switch (state.current)
				{
					default:
						if (state.current > 25) state.current = 0;
						if (state.current < 0) state.current = 25;
						break;

					case game.states.not_found:
						if (pong.current.scene.activeCamera !== pong.current.notFoundCam)
							game.transitionToCamera(pong.current.scene?.activeCamera as baby.FreeCamera, pong.current.notFoundCam, 1, pong, state);
						break;

					case game.states.countdown:
						pong.current.countdown -= pong.current.engine.getDeltaTime() / 1000;
						if (pong.current.countdown <= 0)
						{
							pong.current.countdown = 4;
							state.current = game.states.in_game;
						}
						break;

					case game.states.waiting_to_start:
						pong.current.player1Score = 0;
						pong.current.player2Score = 0;
						game.resetPaddlesPosition(pong.current);
						game.resetBall(pong.current);
						game.setBallDirectionRandom(pong.current);
						game.fitCameraToArena(pong.current);
						state.current = game.states.countdown;
						game.transitionToCamera(pong.current.scene?.activeCamera as baby.FreeCamera, pong.current.arenaCam, 1, pong, state);
						break;

					case game.states.in_game:
						const	maxScore = Math.max(pong.current.player1Score, pong.current.player2Score);
						if (maxScore >= pong.current.requiredPointsToWin)
							state.current = game.states.game_finished;
						game.fitCameraToArena(pong.current);
						
						break;

					case game.states.game_finished:
						switch (pong.current.tournamentState)
						{
							// Finished first game
							case game.tournamentStates.game_1:
								pong.current.tournamentState = game.tournamentStates.waiting_game_2;
								pong.current.game1Finished = true;
								pong.current.tournamentPlayer1Score = pong.current.player1Score;
								pong.current.tournamentPlayer2Score = pong.current.player2Score;
								pong.current.tournamentFinalist1 =
									(pong.current.player1Score > pong.current.player2Score)
									? pong.current.tournamentPlayer1Name
									: pong.current.tournamentPlayer2Name;
								break;
							// Finished second game
							case game.tournamentStates.game_2:
								pong.current.tournamentState = game.tournamentStates.waiting_game_3;
								pong.current.game2Finished = true;
								pong.current.tournamentPlayer3Score = pong.current.player1Score;
								pong.current.tournamentPlayer4Score = pong.current.player2Score;
								pong.current.tournamentFinalist2 =
									(pong.current.player1Score > pong.current.player2Score)
									? pong.current.tournamentPlayer3Name
									: pong.current.tournamentPlayer4Name;
								break;
							// Finished final game
							case game.tournamentStates.game_3:
								pong.current.game3Finished = true;
								pong.current.tournamenFinalScore1 = pong.current.player1Score;
								pong.current.tournamenFinalScore2 = pong.current.player2Score;
								pong.current.tournamentState = game.tournamentStates.finished;
								break;
							default:
								break;
						}
						break;
				}
			}

			pong.current.scene.render();
			document.title = `Pong - ${Object.keys(game.states).find(key => game.states[key as keyof typeof game.states] === state.current)}`;
		});

		// Handle movement in the background
		const backgroundCalculations = setInterval(() =>
		{
			if (pong.current.ball && state.current === game.states.in_game)
			{
				pong.current.ball.position.x += pong.current.ballDirection.x * pong.current.ballSpeedModifier;
				pong.current.ball.position.z += pong.current.ballDirection.z * pong.current.ballSpeedModifier;
			}
			game.doPaddleMovement(pong, gameModes, state);
			game.makeBallBounce(pong, state, gameModes);
		}, 16.667);

		// Update GUI values every 200ms
		const updateGUIsValuesWhenNeeded = setInterval(() =>
		{
			game.updateGUIValues(pong, lang);
			game.updatePlayerNames(pong, gameModes);
			// game.updateGUIVisibilityStates(pong, state.current);
			game.updateGUIVisibilityPlayerStates(pong, playerState.current , gameModes.current);
		}, 200);

		// Handle resizing of the canvas
		const	handleResize = game.debounce(() =>
		{
			if (!pong.current.engine) return;
			pong.current.engine.resize();
		}, 50);

		window.addEventListener('resize', handleResize);

		return () =>
		{
			// clearInterval(updateMusicVolume);
			clearInterval(backgroundCalculations);
			clearInterval(updateGUIsValuesWhenNeeded);
			if (!pong.current.engine) return;
			pong.current.engine.dispose();
		};
	}, [navigate]);


	return (
		<div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
			<canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
			<BackgroundMusic
				pongRef={pong}
				musicRef={musicRef}
				audioRef={audioRef}
			/>
		</div>
	);
};

export default Pong;
