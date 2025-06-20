import React, { use } from 'react';
import { useNavigate } from 'react-router-dom';
import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';
import * as bj from '@/libs/bjLibs';

const	BlackJack: React.FC = () =>
{
	const	bjRef = React.useRef<bj.bjStruct>(bj.initBJStruct());
	const	state = React.useRef<bj.States>(bj.States.main_menu);
	const	gameState = React.useRef<bj.GameState>(bj.GameState.waiting);
	const	lastState = React.useRef<bj.States>(state.current);
	const	language = React.useRef<bj.language>(bj.language.english);
	const	lastLanguage = React.useRef<bj.language>(language.current);
	const	canvasRef = React.useRef<HTMLCanvasElement | null>(null);

	const setState = (newState: bj.States) => { state.current = newState; };

	const	navigate = useNavigate();
	React.useEffect(() =>
	{
		if (!canvasRef.current) return;
		canvasRef.current.focus();

		game.setupBabylonBJ(bjRef.current, canvasRef.current);
		bj.initializeAllGUIScreens
		(
			bjRef,
			state,
			language,
			navigate,
			lastState,
		);
		bj.updateGUIVisibilityStates(bjRef, state.current);
		bj.updateGUIValues(bjRef, language);

		// Game loop - 60 times per second
		bjRef.current.engine.runRenderLoop(() =>
		{
			bj.updateGUIsWhenNeeded(bjRef, state, language, lastState, lastLanguage);

			switch (state.current)
			{
				default:
					break;
				case bj.States.main_menu:
					// Que faire dans le menu principal ?
					break;
				case bj.States.settings:
					// Que faire dans les paramètres ?
					break;
				case bj.States.in_game:
					// if (bjRef.current.playerMoney <= 0 && GameState.current === bj.GameState.waiting)
					// 	state.current = bj.States.game_over;
					break;
			}
			if (bjRef.current.scene) bjRef.current.scene.render();
		});
		bj.PlayGame(bjRef, gameState, setState);

		// Handle resizing of the canvas
		const	handleResize = game.debounce(() =>
		{
				if (!bjRef.current.engine) return;
				bjRef.current.engine.resize();
			}, 50);
		window.addEventListener('resize', handleResize);

	});

	return (
		<div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
			<canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
		</div>
	);
}

export default BlackJack;
