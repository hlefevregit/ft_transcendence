import React from 'react';
import { useNavigate } from 'react-router-dom';

import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';

// Move paddle Up
export const	movePaddleUp = (pong: game.pongStruct, paddleZ: number): number =>
{
	if (!pong.paddle1 ) return(0);
	return(
		Math.max
		(
			- pong.arenaHeight + (pong.paddleHeight / 2),
			Math.min
			(
				pong.arenaHeight - (pong.paddleHeight / 2),
				paddleZ - pong.paddleSpeed
			)
		)
	)
}

// Move paddle Down
export const	movePaddleDown = (pong: game.pongStruct, paddleZ: number): number =>
{
	if (!pong.paddle2 ) return(0);
	return(
		Math.max
		(
			- pong.arenaHeight + (pong.paddleHeight / 2),
			Math.min
			(
				pong.arenaHeight - (pong.paddleHeight / 2),
				paddleZ + pong.paddleSpeed
			)
		)
	)
}

export	const	doPaddleMovement = (pong: game.pongStruct): void =>
{
	if (!pong.paddle1 || !pong.paddle2) return;
	if (pong.pressedKeys.has('arrowup'))
	{
		pong.paddle1.position.z = movePaddleUp(pong, pong.paddle1.position.z);
	}
	if (pong.pressedKeys.has('arrowdown'))
	{
		pong.paddle1.position.z = movePaddleDown(pong, pong.paddle1.position.z);
	}
	if (pong.pressedKeys.has('w'))
	{
		pong.paddle2.position.z = movePaddleUp(pong, pong.paddle2.position.z);
	}
	if (pong.pressedKeys.has('s'))
	{
		pong.paddle2.position.z = movePaddleDown(pong, pong.paddle2.position.z);
	}
	// console.log("Pressed keys: ", pong.pressedKeys);
	// console.log("Paddle2 position: ", pong.paddle2.position.z);
}

export const	manageLocalKeyboardInputs = (pong: game.pongStruct): void =>
{
	// Keyboard input
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