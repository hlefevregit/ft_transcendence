// imports
import React from 'react';
import { useNavigate } from 'react-router-dom';

import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';

import mapUrl from '@/assets/transcendence_map.gltf?url';

export const	instantiateArena = async (pong: game.pongStruct, canvasRef: any): Promise<void> =>
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
	
	const	transitionCamera = new baby.FreeCamera("transitionCam", baby.Vector3.Zero(), sceneInstance);
	pong.transitionCam = transitionCamera;

	
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