import React from 'react';
import { useNavigate } from 'react-router-dom';

import { KeyboardInfo, Mesh, MeshBlock } from 'babylonjs';
import { Engine, Scene } from 'babylonjs';
import { Vector3, HemisphericLight, MeshBuilder } from 'babylonjs';
import { FreeCamera, KeyboardEventTypes } from 'babylonjs';
import { SceneLoader } from 'babylonjs';

// Paddle movement
export	const	doPaddleMovement = (pressedKeys: Set<string>, paddle1: Mesh, paddle2: Mesh, arenaHeight: number, paddleSpeed: number): void =>
{
	if (pressedKeys.has('arrowup'))
	{
		paddle1.position.z = Math.max(-arenaHeight, Math.min(arenaHeight, paddle1.position.z - paddleSpeed));
	}
	if (pressedKeys.has('arrowdown'))
	{
		paddle1.position.z = Math.max(-arenaHeight, Math.min(arenaHeight, paddle1.position.z + paddleSpeed));
	}
	if (pressedKeys.has('w'))
	{
		paddle2.position.z = Math.max(-arenaHeight, Math.min(arenaHeight, paddle2.position.z - paddleSpeed));
	}
	if (pressedKeys.has('s'))
	{
		paddle2.position.z = Math.max(-arenaHeight, Math.min(arenaHeight, paddle2.position.z + paddleSpeed));
	}
	// console.log("Pressed keys: ", pressedKeys);
	// console.log("Paddle2 position: ", paddle2.position.z);
}