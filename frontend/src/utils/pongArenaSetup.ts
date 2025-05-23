// imports
import React from 'react';
import { useNavigate } from 'react-router-dom';

import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';

export const	instantiateArena = (pong: game.pongStruct, canvasRef: any): void =>
{
	const	engineInstance = new baby.Engine(canvasRef, true);
	const	sceneInstance = new baby.Scene(engineInstance);
	pong.engine = engineInstance;
	pong.scene = sceneInstance;

	new baby.HemisphericLight("light", new baby.Vector3(1, 1, 0), sceneInstance);

	const	skyboxMesh = baby.MeshBuilder.CreateBox("skyBox", { size: 1000 }, sceneInstance);
	pong.skybox = skyboxMesh;

	//                                                            width: width,           height: depth, depth: height
	const	paddle1Mesh = baby.MeshBuilder.CreateBox("paddle1", { width: pong.paddleWidth, height: 0.75, depth: 1 }, sceneInstance);
	const	paddle2Mesh = baby.MeshBuilder.CreateBox("paddle2", { width: pong.paddleWidth, height: 0.75, depth: 1 }, sceneInstance);
	paddle1Mesh.scaling.z = pong.paddleHeight;
	paddle2Mesh.scaling.z = pong.paddleHeight;
	pong.paddle1 = paddle1Mesh;
	pong.paddle2 = paddle2Mesh;
	game.resetPaddlesPosition(pong);

	const	cameraInstance = new baby.FreeCamera("camera", new baby.Vector3(0, 30, 0), sceneInstance);
	cameraInstance.setTarget(baby.Vector3.Zero());
	cameraInstance.inputs.clear();
	pong.camera = cameraInstance;

	const	ballMesh = baby.MeshBuilder.CreateSphere("ball", { diameter: pong.ballDiameter }, sceneInstance);
	ballMesh.position = new baby.Vector3(0, 0, 0);
	pong.ball = ballMesh;
}