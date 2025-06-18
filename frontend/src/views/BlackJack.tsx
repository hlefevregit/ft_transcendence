import React, { use } from 'react';
import { useNavigate } from 'react-router-dom';
import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';
import * as bj from '@/libs/bjLibs';

const	BlackJack: React.FC = () =>
{
	const	bjRef = React.useRef<bj.bjStruct>(bj.initBJStruct());
	const	state = React.useRef<bj.bjStates>(bj.bjStates.main_menu);
	const	lastState = React.useRef<bj.bjStates>(state.current);
	const	language = React.useRef<bj.language>(bj.language.english);
	const	lastLanguage = React.useRef<bj.language>(language.current);
	const	canvasRef = React.useRef<HTMLCanvasElement | null>(null);

	const	navigate = useNavigate();
	React.useEffect(() =>
	{
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
		bjRef.current.engine?.runRenderLoop(() =>
		{
			bj.updateGUIsWhenNeeded(bjRef, state, language, lastState, lastLanguage);

			switch (state.current)
			{
				default:
					break;
				case bj.bjStates.main_menu:
					// Que faire dans le menu principal ?
					break;
				case bj.bjStates.settings:
					// Que faire dans les paramètres ?
					break;
			}
			if (bjRef.current.scene) bjRef.current.scene.render();
		});
	});
	return (
		<div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
			<canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
		</div>
	);
}

export default BlackJack;