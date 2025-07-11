import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';
import * as bj from '@/libs/bjLibs';

const BlackJack: React.FC = () => {
	const bjRef = React.useRef<bj.bjStruct>(bj.initBJStruct());
	const state = React.useRef<bj.States>(bj.States.main_menu);
	const gameState = React.useRef<bj.GameState>(bj.GameState.waiting);
	const lastState = React.useRef<bj.States>(state.current);
	const language = React.useRef<bj.language>(bj.language.english);
	const lastLanguage = React.useRef<bj.language>(language.current);
	const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

	const navigate = useNavigate();

	React.useEffect(() => {
		if (!canvasRef.current) return;

		canvasRef.current.focus();
		game.setupBabylonBJ(bjRef.current, canvasRef.current);

		bj.initializeAllGUIScreens(
			bjRef,
			state,
			language,
			navigate,
			lastState
		);

		bj.updateGUIVisibilityStates(bjRef, state.current);
		bj.updateGUIValues(bjRef, language);

		if (!bjRef.current.engine) return;
		bjRef.current.engine.runRenderLoop(() =>
		{
			// if (state.current !== bj.States.in_transition)
				bj.updateGUIsWhenNeeded(bjRef, state, language, lastState, lastLanguage);

			if (bjRef.current.scene) bjRef.current.scene.render();
		});

		const handleResize = game.debounce(() => {
			if (bjRef.current.engine) {
				bjRef.current.engine.resize();
			}
		}, 50);

		window.addEventListener('resize', handleResize);

		const	backgroundCalculations = setInterval(() =>
		{
			// if (state.current !== bj.States.in_transition)
				bj.updateGUIValues(bjRef, language);
			if (state.current === bj.States.in_game && bjRef.current.cards)
			{
				bjRef.current.player1Score = bj.getCardValues(bjRef.current.player1Cards);
				bjRef.current.player2Score = bj.getCardValues(bjRef.current.player2Cards);
				bjRef.current.dealerScore = bj.getCardValues(Array.isArray(bjRef.current.cards['dealer']) ? bjRef.current.cards['dealer'] : [] );
			}
		}, 200);

		// Cleanup on unmount
		return () => {
			clearInterval(backgroundCalculations);
			window.removeEventListener('resize', handleResize);
			if (bjRef.current.engine) {
				bjRef.current.engine.stopRenderLoop();
			}
			if (bjRef.current.scene) {
				bjRef.current.scene.dispose();
			}
			if (bjRef.current.engine) {
				bjRef.current.engine.dispose();
			}
		};
	}, []); // Run only once on mount

	return (
		<div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
			<canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
		</div>
	);
};

export default BlackJack;
