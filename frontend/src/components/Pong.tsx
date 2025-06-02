// imports
import React, { use } from 'react';
import { useNavigate } from 'react-router-dom';

import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';
import BackgroundMusic from '@/components/BG';
import { useWebSocketOnline, useOnlineLoop } from '@/utils/pong/onlineWS';

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

	const	userNameRef = React.useRef<string>(null as unknown as string);
	const	audioRef = React.useRef<HTMLAudioElement | null>(null);


	// const	[userName, getUserName] = React.useState<string | null>(null);
	const	socketRef = React.useRef<WebSocket | null>(null);
	const	lastHandledState = React.useRef<game.states>(game.states.main_menu);

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
		if (!pong.current.engine || !pong.current.scene) return;
		console.log("Initializing GUI...");
		console.log("GUI initialization complete");
		

		const token = localStorage.getItem('authToken');
    	const ws = new WebSocket(`ws://localhost:4000/ws?token=${token || ''}`);
    

		useWebSocketOnline(pong, socketRef, gameModes, states, lang, userNameRef, ws);
	
		
		game.initializeAllGUIScreens(pong, gameModes, states, lang, socketRef, navigate);

		

		

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
				if (username !== null) {
					userNameRef.current = username;
					console.log("✅ Username stocké:", username);
				}
			});
		} else {
			console.warn("⚠️ Aucun userId dans le localStorage.");
		}

		pong.current.engine.runRenderLoop(() =>
		{
			// console.log("mainMenuMusic is ready:", pong.current.mainMenuMusic?.isReady());
			if (pong.current.mainMenuMusic && pong.current.mainMenuMusic.isReady() && !pong.current.mainMenuMusic.isPlaying) {pong.current.mainMenuMusic.play();}
			// const	dummyTitle: baby.TextBlock = game.findComponentByName(pong, "mainMenuDummyTitle");
			// if (dummyTitle instanceof baby.TextBlock) {Eg("found"); dummyTitle.text =  "banane"; dummyTitle.markAsDirty(); if (pong.current.guiTexture) { pong.current.guiTexture.markAsDirty(); }}
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
				useOnlineLoop(pong, socketRef, gameModes, states, userNameRef, lastHandledState);
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
			<BackgroundMusic/>
		</div>
	);
};

export default Pong;
