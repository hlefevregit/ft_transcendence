// imports
import React from 'react';
import { useNavigate } from 'react-router-dom';

import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';



const Pong: React.FC = () =>
{
	const	canvasRef = React.useRef<HTMLCanvasElement | null>(null);
	const	pong = React.useRef<game.pongStruct>(game.initPongStruct());
	const	states = React.useRef<game.states>(game.states.main_menu);

	React.useEffect(() =>
	{
		if (!canvasRef.current) return;
		canvasRef.current.focus();

		// Initialize the game
		game.instantiateArena(pong.current, canvasRef.current);

		// Initialize all the GUI
		if (!pong.current.engine || !pong.current.scene) return;
		console.log("Initializing GUI...");
		game.initializeAllGUIScreens(pong, states);
		console.log("GUI initialization complete");

		// Keyboard input
		game.manageLocalKeyboardInputs(pong.current);

		// Game loop
		if (!pong.current.engine || !pong.current.scene) return;
		pong.current.engine.runRenderLoop(() =>
		{
			game.updateGUIVisibility(pong, states.current);
			game.updateGUIValues(pong, states);
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
					if (states.current > Object.keys(game.states).length / 2 - 1) states.current = 0;
					if (states.current < 0) states.current = Object.keys(game.states).length / 2 - 1;
					break;
				case game.states.waiting_to_start:
					game.setBallDirectionRandom(pong.current);
					break;
				case game.states.in_game:
					game.doPaddleMovement(pong.current);
					game.fitCameraToArena(pong.current);
					pong.current.ball.position.x += pong.current.ballDirection.x * pong.current.ballSpeedModifier;
					pong.current.ball.position.z += pong.current.ballDirection.z * pong.current.ballSpeedModifier;
					game.makeBallBounce(pong.current);
					break;
			}

			pong.current.scene.render();
		});

		window.addEventListener('resize', () => 
		{
			if (!pong.current.engine) return;
			pong.current.engine.resize();
		})
		
		return () =>
		{
			if (!pong.current.engine) return;
			pong.current.engine.dispose();
		};
	}, []);

	return (
		<div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
			<canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
		</div>
	);
};

export default Pong;

