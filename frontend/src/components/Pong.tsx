// imports
import React from 'react';
import { useNavigate } from 'react-router-dom';

import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';
import { FreeCamera } from 'babylonjs';

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


	React.useEffect(() =>
	{
		if (!canvasRef.current) return;
		canvasRef.current.focus();

		// Initialize the game
		game.instantiateArena(pong.current, canvasRef.current);
		

		// Initialize all the GUI
		if (!pong.current.engine || !pong.current.scene) return;
		console.log("Initializing GUI...");
		game.initializeAllGUIScreens(pong, gameModes, states, lang, navigate);
		console.log("GUI initialization complete");

		// Keyboard input
		game.manageLocalKeyboardInputs(pong.current);

		// Game loop
		if (!pong.current.engine || !pong.current.scene) return;
		pong.current.engine.runRenderLoop(() =>
		{
			game.updateGUIVisibility(pong, states.current);
			game.updateGUIValues(pong, states, lang);
			if
			(
				!pong.current.scene ||
				!pong.current.engine ||
				!pong.current.paddle1 ||
				!pong.current.paddle2 ||
				!pong.current.ball
			) return;

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
