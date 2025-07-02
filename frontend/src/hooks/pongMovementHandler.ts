import React from 'react';
import { useNavigate } from 'react-router-dom';

import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';

// Move paddle Up
export const	movePaddleUp = (pong: React.RefObject<game.pongStruct>, paddleZ: number): number =>
{
	if (!pong.current.paddle1) return(0);
	return Math.max
	(
		- pong.current.arenaHeight + (pong.current.paddleHeight / 2),
		Math.min
		(
			pong.current.arenaHeight - (pong.current.paddleHeight / 2),
			paddleZ - pong.current.paddleSpeed
		)
	)

}

export const movePaddleUpOnline = (pong: React.RefObject<game.pongStruct>, paddle: baby.Mesh): number =>
{
	return Math.max
	(
		- pong.current.arenaHeight + (pong.current.paddleHeight / 2),
		Math.min
		(
			pong.current.arenaHeight - (pong.current.paddleHeight / 2),
			paddle.position.z - pong.current.paddleSpeed
		)
	);
};

// Move paddle Down
export const	movePaddleDown = (pong: React.RefObject<game.pongStruct>, paddleZ: number): number =>
{
	if (!pong.current.paddle2 ) return(0);
	return Math.max
	(
		- pong.current.arenaHeight + (pong.current.paddleHeight / 2),
		Math.min
		(
			pong.current.arenaHeight - (pong.current.paddleHeight / 2),
			paddleZ + pong.current.paddleSpeed
		)
	)
}

export const movePaddleDownOnline = (pong: React.RefObject<game.pongStruct>, paddle: baby.Mesh): number =>
{
	return Math.max
	(
		- pong.current.arenaHeight + (pong.current.paddleHeight / 2),
		Math.min
		(
			pong.current.arenaHeight - (pong.current.paddleHeight / 2),
			paddle.position.z + pong.current.paddleSpeed
		)
	);
};

export	const	doPaddleMovement =
(
	pong: React.RefObject<game.pongStruct>,
	gamemode: React.RefObject<game.gameModes>,
	states: React.RefObject<game.states>
): void => 
{
	if (((!pong.current.paddle1 || !pong.current.paddle2) ||
	(states.current !== game.states.in_game
		&& states.current !== game.states.in_game1
		&& states.current !== game.states.in_game2
		&& states.current !== game.states.tournament_final
		&& states.current !== game.states.main_menu
		&& states.current !== game.states.not_found) )) return;
	switch (gamemode.current)
	{
		case game.gameModes.local:
			if (pong.current.pressedKeys.has('arrowup')) pong.current.paddle1.position.z = movePaddleUp(pong, pong.current.paddle1.position.z);
			if (pong.current.pressedKeys.has('arrowdown')) pong.current.paddle1.position.z = movePaddleDown(pong, pong.current.paddle1.position.z);
			if (pong.current.pressedKeys.has('w')) pong.current.paddle2.position.z = movePaddleUp(pong, pong.current.paddle2.position.z);
			if (pong.current.pressedKeys.has('s')) pong.current.paddle2.position.z = movePaddleDown(pong, pong.current.paddle2.position.z);
			break;
		case game.gameModes.ai:
			if (pong.current.pressedKeys.has('w')) pong.current.paddle2.position.z = movePaddleUp(pong, pong.current.paddle2.position.z);
			if (pong.current.pressedKeys.has('s')) pong.current.paddle2.position.z = movePaddleDown(pong, pong.current.paddle2.position.z);
			game.AIMovePaddle(pong);
			break;

		case game.gameModes.online:
			if (pong.current.isHost)
			{
				// 🎮 Host contrôle paddle1
				if (pong.current.pressedKeys.has('arrowup'))
					pong.current.paddle1.position.z = movePaddleUpOnline(pong, pong.current.paddle1);
				if (pong.current.pressedKeys.has('arrowdown'))
					pong.current.paddle1.position.z = movePaddleDownOnline(pong, pong.current.paddle1);
			}
			else
			{
				// 🧑‍💻 Client contrôle paddle2
				if (pong.current.pressedKeys.has('w'))
					pong.current.paddle2.position.z = movePaddleUpOnline(pong, pong.current.paddle2);
				if (pong.current.pressedKeys.has('s'))
					pong.current.paddle2.position.z = movePaddleDownOnline(pong, pong.current.paddle2);
			}
			break;

		case game.gameModes.tournament: 
			// if (pong.current.isHost || pong.current.isHost2)
			// {
			// 	// 🎮 Host contrôle paddle1
			// 	if (pong.current.pressedKeys.has('arrowup'))
			// 		pong.current.paddle1.position.z = movePaddleUpOnline(pong, pong.current.paddle1);
			// 	if (pong.current.pressedKeys.has('arrowdown'))
			// 		pong.current.paddle1.position.z = movePaddleDownOnline(pong, pong.current.paddle1);
			// }
			// else
			// {
			// 	// 🧑‍💻 Client contrôle paddle2
			// 	if (pong.current.pressedKeys.has('w'))
			// 		pong.current.paddle2.position.z = movePaddleUpOnline(pong, pong.current.paddle2);
			// 	if (pong.current.pressedKeys.has('s'))
			// 		pong.current.paddle2.position.z = movePaddleDownOnline(pong, pong.current.paddle2);
			// }
			if (pong.current.pressedKeys.has('arrowup')) pong.current.paddle1.position.z = movePaddleUp(pong, pong.current.paddle1.position.z);
			if (pong.current.pressedKeys.has('arrowdown')) pong.current.paddle1.position.z = movePaddleDown(pong, pong.current.paddle1.position.z);
			if (pong.current.pressedKeys.has('w')) pong.current.paddle2.position.z = movePaddleUp(pong, pong.current.paddle2.position.z);
			if (pong.current.pressedKeys.has('s')) pong.current.paddle2.position.z = movePaddleDown(pong, pong.current.paddle2.position.z);
			break;
	}
	if (pong.current.debugGUI)
	{
		if (pong.current.pressedKeys.has('p'))
		{
			pong.current.debugMode = !pong.current.debugMode;
			pong.current.debugGUI.isVisible = pong.current.debugGUI.isEnabled = pong.current.debugMode;
			console.debug(`Debug mode: ${pong.current.debugMode}`);
			game.transitionToCamera(pong.current.scene?.activeCamera as baby.FreeCamera, pong.current.scene?.activeCamera as baby.FreeCamera, 0.1, pong, states);
		}
		if (pong.current.pressedKeys.has('o'))
		{
			console.debug(`free cam: ${pong.current.scene?.activeCamera !== pong.current.notFoundCam}`);
			if (pong.current.scene?.activeCamera === pong.current.notFoundCam)
			{
				states.current = game.states.main_menu;
				game.transitionToCamera(pong.current.scene?.activeCamera as baby.FreeCamera, pong.current.mainMenuCam, 1, pong, states);
			}
			else
			{
				states.current = game.states.not_found;
				game.transitionToCamera(pong.current.scene?.activeCamera as baby.FreeCamera, pong.current.notFoundCam, 1, pong, states);
			}
		}
	}
}

export const	manageLocalKeyboardInputs = (pong: game.pongStruct): void =>
{
	// Adds or removes the currently pressed keys to the `pressedKeys` set
	pong.scene?.onKeyboardObservable.add((kbInfo) =>
	{
		const	key = kbInfo.event.key.toLowerCase();

		if (kbInfo.type === baby.KeyboardEventTypes.KEYDOWN)	pong.pressedKeys.add(key);
		else if (kbInfo.type === baby.KeyboardEventTypes.KEYUP)	pong.pressedKeys.delete(key);
	});
}