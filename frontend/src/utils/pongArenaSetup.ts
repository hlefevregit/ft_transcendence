// imports
import React from 'react';

import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';

import mapUrl from '@/assets/transcendence_map.gltf?url';

export const	setupBabylon = async (pong: game.pongStruct, canvasRef: any): Promise<void> =>
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
	
	const	cameraInstance = new baby.FreeCamera("mainMenuCam", new baby.Vector3(-40.0, 2.0, 25.0), sceneInstance);
	cameraInstance.setTarget(baby.Vector3.Zero());
	cameraInstance.inputs.clear();
	cameraInstance.rotation = new baby.Vector3(0, 2.3, 0);
	pong.mainMenuCam = cameraInstance;
	pong.scene.activeCamera = cameraInstance;

	const	arenaCamera = new baby.FreeCamera("arenaCam", new baby.Vector3(0, 30, 0), sceneInstance);
	arenaCamera.rotation = new baby.Vector3(Math.PI / 2, 0, Math.PI);
	pong.arenaCam = arenaCamera;
	
	const	pongSettingsCamera = new baby.FreeCamera("settingsCam", new baby.Vector3(-10, 1.5, -12), sceneInstance);
	pongSettingsCamera.rotation = new baby.Vector3(0, Math.PI , 0);
	pong.pongSettingsCam = pongSettingsCamera;

	const	transitionCamera = new baby.FreeCamera("transitionCam", baby.Vector3.Zero(), sceneInstance);
	pong.transitionCam = transitionCamera;

	const	notFoundCamera = new baby.FlyCamera("notFoundCam", new baby.Vector3(0, 1, 0), sceneInstance);
			notFoundCamera.position = new baby.Vector3(0, 10, 0);
			notFoundCamera.attachControl(canvasRef);
			notFoundCamera.keysUp = [87, 38];		// W, Up arrow
			notFoundCamera.keysDown = [83, 40];		// S, Down arrow
			notFoundCamera.keysLeft = [65, 37];		// A, Left arrow
			notFoundCamera.keysRight = [68, 39];	// D, Right arrow
	pong.notFoundCam = notFoundCamera;

	const	ballMesh = baby.MeshBuilder.CreateSphere("ball", { diameter: pong.ballDiameter }, sceneInstance);
	ballMesh.position = new baby.Vector3(0, 0, 0);
	pong.ball = ballMesh;

	try
	{
		const meshes = await game.importMap(pong.scene);
		if (meshes && meshes.length > 0) pong.map = meshes[0]; 
		else console.warn("Failed to load map");
	}
	catch (error) { console.error("Error while loading map:", error); }

	const	ceiling = baby.MeshBuilder.CreateBox("ceiling", { width: 1, height: 0.1, depth: 1 }, sceneInstance);
			ceiling.position.y = 0;
			pong.ceiling = ceiling;
	const	floor = baby.MeshBuilder.CreateBox("floor", { width: 1, height: 0.1, depth: 1 }, sceneInstance);
			floor.position.y = 0;
			pong.floor = floor;
	const	wallLeft = baby.MeshBuilder.CreateBox("wallLeft", { width: 1, height: 0.1, depth: 1 }, sceneInstance);
			wallLeft.position.y = 0;
			pong.wallLeft = wallLeft;
	const	wallRight = baby.MeshBuilder.CreateBox("wallRight", { width: 1, height: 0.1, depth: 1 }, sceneInstance);
			wallRight.position.y = 0;
			pong.wallRight = wallRight;

	pong.ceiling.scaling.x = pong.arenaWidth * 2 + 3;
	pong.ceiling.position.z = -pong.arenaWidth - 1;
	pong.floor.scaling.x = pong.arenaWidth * 2 + 3;
	pong.floor.position.z = pong.arenaWidth + 1;




	pong.wallLeft.scaling.z = pong.arenaHeight * 2 + 3;
	pong.wallLeft.position.x = pong.arenaHeight + 1;
	pong.wallRight.scaling.z = pong.arenaHeight * 2 + 3;
	pong.wallRight.position.x = -pong.arenaHeight - 1;

}

// Updated to use module-level import function instead of SceneLoader
export const importMap = async (scene: baby.Scene) =>
{
    try
	{
        // Make sure the scene is still valid
        if (scene.isDisposed)
		{
            console.error("Scene is disposed before loading model");
            return null;
        }
        
        // Use proper parameters for ImportMeshAsync
        const result = await baby.ImportMeshAsync(
            mapUrl, // URL from Vite import
			scene, // Scene to load into
        );
        
        if (!result || !result.meshes || result.meshes.length === 0)
		{
            console.warn("No meshes loaded");
            return null;
        }
        
        // Configure meshes
        result.meshes.forEach(mesh => {mesh.receiveShadows = true;});
        
        return result.meshes;
    }
	catch (error)
	{
        console.error("Error loading map model:", error);
        return null;
    }
};