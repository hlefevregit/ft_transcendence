// imports
import React from 'react';

import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';
import * as bjLib from '@/libs/bjLibs';

import pongMapUrl from '@/assets/transcendence_map.gltf?url';
import bjMapUrl from '@/assets/blackjack_map.gltf?url';
import cardUrl from '@/assets/models/card/Card.gltf?url';

export const	setupBabylonBJ = async (BJ: bj.BJStruct, canvasRef: any): Promise<void> =>
{
	const	engineInstance = new baby.Engine(canvasRef, true);
	const	sceneInstance = new baby.Scene(engineInstance);
	BJ.engine = engineInstance;
	BJ.scene = sceneInstance;

	new baby.HemisphericLight("light", new baby.Vector3(1, 1, 0), sceneInstance);

	const	skyboxMesh = baby.MeshBuilder.CreateBox("skyBox", { size: 1000 }, sceneInstance);
	BJ.skybox = skyboxMesh;

	const	cameraInstance = new baby.FreeCamera("mainMenuCam", new baby.Vector3(0, 5, 7), sceneInstance);
	cameraInstance.inputs.clear();
	cameraInstance.rotation = new baby.Vector3(0.6, Math.PI / 1.001, 0);
	BJ.mainMenuCam = cameraInstance;
	BJ.scene.activeCamera = cameraInstance;

	try
	{
		const modelMeshes = await importGLTF(sceneInstance, cardUrl);
		if (modelMeshes && modelMeshes.length > 0)
		{
			modelMeshes[0].scaling = new baby.Vector3(3.5, 3.5, 3.5);
			modelMeshes[0].position = new baby.Vector3(0, 2, 3);
			modelMeshes[0].rotation = new baby.Vector3(0, 0, 0);
		}
		// Following line is an example of how to call a method on a specific card mesh if it exists
		// BJ.scene.meshes.find(mesh => mesh.name === "diamondsSeven")?.method()
	}
	catch (error) { console.error("Error while loading card model:", error); }
	try
	{
		const mapMeshes = await importGLTF(BJ.scene, bjMapUrl);
		if (mapMeshes && mapMeshes.length > 0) BJ.map = mapMeshes[0];
		else console.warn("Failed to load map");
		if (BJ.map) BJ.map.scaling = new baby.Vector3(25, 25, -25);
	}
	catch (error) { console.error("Error while loading map:", error); }

	sceneInstance.createDefaultEnvironment();
	const ssaoRenderingPipeline = new baby.SSAORenderingPipeline("ssao", sceneInstance,1);
	ssaoRenderingPipeline.scene.setRenderingOrder(0, null, null, null);
	sceneInstance.postProcessRenderPipelineManager.attachCamerasToRenderPipeline("ssao", sceneInstance.cameras);

	// Set rendering groups so GUI renders after post-processing
    sceneInstance.setRenderingAutoClearDepthStencil(1, false); // Don't clear depth for rendering group 1
}

export const	setupBabylonPong = async (pong: game.pongStruct, canvasRef: any): Promise<void> =>
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
	const	PREDICT = baby.MeshBuilder.CreateBox("predict", { width: .2, height: 0.75, depth: .2 }, sceneInstance);
	const	predictMaterial = new baby.StandardMaterial("predictMaterial", sceneInstance);
			predictMaterial.diffuseColor = new baby.Color3(1, 0, 0); // Red color (R=1, G=0, B=0)
			PREDICT.material = predictMaterial;
	pong.PREDICT = PREDICT;

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
		const meshes = await importGLTF(pong.scene, pongMapUrl);
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

	// Enable ambient occlusion
	sceneInstance.createDefaultEnvironment();
	const ssaoRenderingPipeline = new baby.SSAORenderingPipeline("ssao", sceneInstance,  1);
	ssaoRenderingPipeline.scene.setRenderingOrder(0, null, null, null);
	sceneInstance.postProcessRenderPipelineManager.attachCamerasToRenderPipeline("ssao", sceneInstance.cameras);

	// Set rendering groups so GUI renders after post-processing
    sceneInstance.setRenderingAutoClearDepthStencil(1, false); // Don't clear depth for rendering group 1
}

export const importGLTF = async (scene: baby.Scene, modelUrl: string) => {
  try {
    if (scene.isDisposed) {
      console.error("Scene was disposed before loading model");
      return null;
    }

    const lastSlashIndex = modelUrl.lastIndexOf('/');
    const rootUrl = modelUrl.substring(0, lastSlashIndex + 1);
    const sceneFileName = modelUrl.substring(lastSlashIndex + 1);

    const result = await baby.SceneLoader.ImportMeshAsync(
      null,
      rootUrl,
      sceneFileName,
      scene
    );

    if (!result || !result.meshes || result.meshes.length === 0) {
      console.warn("No meshes loaded");
      return null;
    }

    result.meshes.forEach(mesh => {
      mesh.receiveShadows = true;
    });

    return result.meshes;
  } catch (error) {
    console.error("Error loading model:", error);
    return null;
  }
};
