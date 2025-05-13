import React from 'react';
import { useNavigate } from 'react-router-dom';

import { AdvancedDynamicTexture, Button, TextBlock, StackPanel } from "@babylonjs/gui/2D";
import { KeyboardInfo,
    Mesh,
    MeshBlock,
    Engine,
    Scene,
    Vector3,
    HemisphericLight,
    MeshBuilder,
    FreeCamera,
    KeyboardEventTypes
} from '@babylonjs/core';
import {
	states,
	pongGameRef,
	pongGUIRef,
	initpongArenaGUI,
	initPongStruct,
	setBallPosition,
	resetBall,
	setPaddleHeight,
	resetPaddlesHeight,
	setPaddlePosition,
	resetPaddlesPosition,
	setBallDirection,
	setBallDirectionRight,
	setBallDirectionLeft,
	setBallDirectionRandom,
	reflectBallCeiling,
	reflectBallWall,
	reflectBallPaddles,
} from '@/utils/pongSetup';

// Move paddle Up
export const	movePaddleUp = (pong: pongGameRef, paddleZ: number): number =>
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
export const	movePaddleDown = (pong: pongGameRef, paddleZ: number): number =>
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

export	const	doPaddleMovement = (pong: pongGameRef): void =>
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

export const	manageLocalKeyboardInputs = (pong: pongGameRef): void =>
{
	// Keyboard input
	pong.scene?.onKeyboardObservable.add((kbInfo) =>
	{
		const	key = kbInfo.event.key.toLowerCase();
		if (kbInfo.type === KeyboardEventTypes.KEYDOWN)
		{
			pong.pressedKeys.add(key);
		}
		else if (kbInfo.type === KeyboardEventTypes.KEYUP)
		{
			pong.pressedKeys.delete(key);
		}
	});
}