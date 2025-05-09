import React from 'react';
import { useNavigate } from 'react-router-dom';

import { KeyboardInfo, Mesh, MeshBlock } from 'babylonjs';
import { Engine, Scene } from 'babylonjs';
import { Vector3, HemisphericLight, MeshBuilder } from 'babylonjs';
import { FreeCamera, KeyboardEventTypes } from 'babylonjs';
import { SceneLoader } from 'babylonjs';
import { pongGameRef } from '@/utils/pongSetup';

// Move paddle Up
const movePaddleUp = (pong: pongGameRef, paddleZ: number): number =>
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
const movePaddleDown = (pong: pongGameRef, paddleZ: number): number =>
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