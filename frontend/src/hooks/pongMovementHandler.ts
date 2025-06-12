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

export	const	doPaddleMovement = (pong: React.RefObject<game.pongStruct>,
	gamemode: React.RefObject<game.gameModes>,
	states: React.RefObject<game.states>
): void => 
{
	if (((!pong.current.paddle1 || !pong.current.paddle2) ||
	(states.current !== game.states.in_game
		&& states.current !== game.states.in_game1
		&& states.current !== game.states.in_game2
		&& states.current !== game.states.tournament_final) )) return;
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
			if (pong.current.isHost) {
				// 🎮 Host contrôle paddle1
				if (pong.current.pressedKeys.has('arrowup')) {
					pong.current.paddle1.position.z = movePaddleUpOnline(pong, pong.current.paddle1);
				}
				if (pong.current.pressedKeys.has('arrowdown')) {
					pong.current.paddle1.position.z = movePaddleDownOnline(pong, pong.current.paddle1);
				}
			} else {
				// 🧑‍💻 Client contrôle paddle2
				if (pong.current.pressedKeys.has('w')) {
					pong.current.paddle2.position.z = movePaddleUpOnline(pong, pong.current.paddle2);
				}
				if (pong.current.pressedKeys.has('s')) {
					pong.current.paddle2.position.z = movePaddleDownOnline(pong, pong.current.paddle2);
				}
			}
			break;

		case game.gameModes.tournament: 
			console.log("In tournament mode");
			console.log("Key pressed : ", pong.current.pressedKeys);
			if (pong.current.isHost || pong.current.isHost2) {
				console.log("Host contrôle paddle1");
				// 🎮 Host contrôle paddle1
				if (pong.current.pressedKeys.has('arrowup')) {
					pong.current.paddle1.position.z = movePaddleUpOnline(pong, pong.current.paddle1);
				}
				if (pong.current.pressedKeys.has('arrowdown')) {
					pong.current.paddle1.position.z = movePaddleDownOnline(pong, pong.current.paddle1);
				}
			} else {
				console.log("Client contrôle paddle2");
				// 🧑‍💻 Client contrôle paddle2
				if (pong.current.pressedKeys.has('w')) {
					pong.current.paddle2.position.z = movePaddleUpOnline(pong, pong.current.paddle2);
				}
				if (pong.current.pressedKeys.has('s')) {
					pong.current.paddle2.position.z = movePaddleDownOnline(pong, pong.current.paddle2);
				}
			}
			break;
	}
}

export const	manageLocalKeyboardInputs = (pong: game.pongStruct): void =>
{
	// Adds or removes the currently pressed keys to the `pressedKeys` set
	pong.scene?.onKeyboardObservable.add((kbInfo) =>
	{
		const	key = kbInfo.event.key.toLowerCase();
		if (kbInfo.type === baby.KeyboardEventTypes.KEYDOWN)
		{
			pong.pressedKeys.add(key);
		}
		else if (kbInfo.type === baby.KeyboardEventTypes.KEYUP)
		{
			pong.pressedKeys.delete(key);
		}
	});
}