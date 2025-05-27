import React from 'react';
import { useNavigate } from 'react-router-dom';

import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';

// Move paddle Up
export const	movePaddleUp = (pong: React.RefObject<game.pongStruct>, paddleZ: number): number =>
{
	if (!pong.current.paddle1 ) return(0);
	return(
		Math.max
		(
			- pong.current.arenaHeight + (pong.current.paddleHeight / 2),
			Math.min
			(
				pong.current.arenaHeight - (pong.current.paddleHeight / 2),
				paddleZ - pong.current.paddleSpeed
			)
		)
	)
}

// Move paddle Down
export const	movePaddleDown = (pong: React.RefObject<game.pongStruct>, paddleZ: number): number =>
{
	if (!pong.current.paddle2 ) return(0);
	return(
		Math.max
		(
			- pong.current.arenaHeight + (pong.current.paddleHeight / 2),
			Math.min
			(
				pong.current.arenaHeight - (pong.current.paddleHeight / 2),
				paddleZ + pong.current.paddleSpeed
			)
		)
	)
}

export const	AIMovePaddle = (pong: React.RefObject<game.pongStruct>): void =>
{
	if (!pong.current.paddle1 || !pong.current.paddle2 || !pong.current.ball) return;

	if (pong.current.ballDirection.x < 0)	// Ball is going to the AI paddle
	{
		if (pong.current.ball.position.z + pong.current.paddleHeight / 2 < pong.current.paddle1.position.z) pong.current.paddle1.position.z = movePaddleUp(pong, pong.current.paddle1.position.z);
		if (pong.current.ball.position.z - pong.current.paddleHeight / 2 > pong.current.paddle1.position.z) pong.current.paddle1.position.z = movePaddleDown(pong, pong.current.paddle1.position.z);
	}
	else	// Ball is going to the player paddle
	{
		console.log("ball moving away from AI paddle");
		// Re-center the AI paddle in the arena
		if (pong.current.paddle1.position.z > 0.2) pong.current.paddle1.position.z = movePaddleUp(pong, pong.current.paddle1.position.z);
		else if (pong.current.paddle1.position.z < -0.2) pong.current.paddle1.position.z = movePaddleDown(pong, pong.current.paddle1.position.z);
	}
}

export	const	doPaddleMovement = (pong: React.RefObject<game.pongStruct>, gamemode: React.RefObject<game.gameModes>): void =>
{
	if (!pong.current.paddle1 || !pong.current.paddle2) return;
	// console.log("gamemode: ", gamemode.current);
	switch (gamemode.current)
	{
		case game.gameModes.local:
			if (pong.current.pressedKeys.has('arrowup')) pong.current.paddle1.position.z = movePaddleUp(pong, pong.current.paddle1.position.z);
			if (pong.current.pressedKeys.has('arrowdown')) pong.current.paddle1.position.z = movePaddleDown(pong, pong.current.paddle1.position.z);
			break;
		case game.gameModes.ai:
			// setTimeout(() => {}, 200);	 // Simulate AI reaction time
			AIMovePaddle(pong);
	}
	if (pong.current.pressedKeys.has('w')) pong.current.paddle2.position.z = movePaddleUp(pong, pong.current.paddle2.position.z);
	if (pong.current.pressedKeys.has('s')) pong.current.paddle2.position.z = movePaddleDown(pong, pong.current.paddle2.position.z);
	// console.log("Pressed keys: ", pong.current.pressedKeys);
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