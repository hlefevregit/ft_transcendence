// imports
import React from 'react';
import { useNavigate } from 'react-router-dom';

import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';



const Pong: React.FC = () =>
{
	const	states = React.useRef<game.states>(game.states.main_menu);
	const	canvasRef = React.useRef<HTMLCanvasElement | null>(null);
	const	pong = React.useRef<game.pongGameRef>(game.initPongStruct());
	const	pongGUI = React.useRef<game.pongGUIRef>(game.initpongArenaGUI());

	React.useEffect(() =>
	{
		if (!canvasRef.current) return;
		canvasRef.current.focus();

		// Initialize the game
		game.instantiateArena(pong.current, canvasRef.current);

		// Initialize all the GUI
		if (!pong.current.engine || !pong.current.scene) return;
		console.log("Initializing GUI...");
		game.initializeAllGUIScreens(pongGUI, pong.current, states);
		console.log("GUI initialization complete");

		// Keyboard input
		game.manageLocalKeyboardInputs(pong.current);

		// Game loop
		if (!pong.current.engine || !pong.current.scene) return;
		pong.current.engine.runRenderLoop(() =>
		{
			game.updateGUIVisibility(pongGUI.current, states.current);
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

			console.log("Current game state: ", states.current);
			
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