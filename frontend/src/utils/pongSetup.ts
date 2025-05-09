// imports
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { KeyboardInfo, Mesh, MeshBlock } from 'babylonjs';
import { Engine, Scene } from 'babylonjs';
import { Vector3, HemisphericLight, MeshBuilder } from 'babylonjs';
import { FreeCamera, KeyboardEventTypes } from 'babylonjs';

export type pongGameRef =
{
	// Engine and scene
	engine: Engine | null;
	scene: Scene | null;
	skybox: Mesh | null;
	camera: FreeCamera | null;
	
	// Pong objects
	paddle1: Mesh | null;
	paddle2: Mesh | null;
	ball: Mesh | null;
	
	// Variables
	pressedKeys: Set<string>;
	arenaWidth: number;
	arenaHeight: number;
	ballDirection: Vector3;
	ballSpeedModifier: number;
	ballSpeed: number;
	maxBallSpeed: number;
	paddleSpeed: number;
	paddleHeight: number;
};

export function initPongStruct(): pongGameRef
{
	return {
		// Engine and scene
		engine: null,
		scene: null,
		skybox: null,
		camera: null,
		
		// Pong objects
		paddle1: null,
		paddle2: null,
		ball: null,
		
		// Variables
		pressedKeys: new Set<string>(),
		arenaWidth: 10,
		arenaHeight: 10,
		ballDirection: new Vector3(0.1, 0, 0),
		ballSpeedModifier: 1,
		ballSpeed: 0.1,
		maxBallSpeed: 0.5,
		paddleSpeed: 0.25,
		paddleHeight: 4
	};
}

