// imports
import React from 'react';

import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';
import * as bj from '@/libs/bjLibs';

import pongMapUrl from '@/assets/transcendence_map_final.gltf?url';
import bjMapUrl from '@/assets/blackjack_map.gltf?url';
import cardUrl from '@/assets/models/card/Card.gltf?url';

export const	setupBabylonBJ = async (bjRef: bj.bjStruct, canvasRef: any): Promise<void> =>
{
	const	engineInstance = new baby.Engine(canvasRef, true);
	const	sceneInstance = new baby.Scene(engineInstance);
	bjRef.engine = engineInstance;
	bjRef.scene = sceneInstance;

	new baby.HemisphericLight("light", new baby.Vector3(1, 1, 0), sceneInstance);

	const	skyboxMesh = baby.MeshBuilder.CreateBox("skyBox", { size: 1000 }, sceneInstance);
	bjRef.skybox = skyboxMesh;

	const	cameraInstance = new baby.FreeCamera("mainMenuCam", new baby.Vector3(0, 1.5, 2.5), sceneInstance);
	cameraInstance.inputs.clear();
	cameraInstance.rotation = new baby.Vector3(0.1, Math.PI / 1.001, 0);
	bjRef.mainMenuCamera = cameraInstance;
	bjRef.scene.activeCamera = cameraInstance;

	sceneInstance.createDefaultEnvironment();
	const ssaoRenderingPipeline = new baby.SSAORenderingPipeline("ssao", sceneInstance,1);
	ssaoRenderingPipeline.scene.setRenderingOrder(0, null, null, null);
	sceneInstance.postProcessRenderPipelineManager.attachCamerasToRenderPipeline("ssao", sceneInstance.cameras);

	// Set rendering groups so GUI renders after post-processing
    sceneInstance.setRenderingAutoClearDepthStencil(1, false); // Don't clear depth for rendering group 1

	try
	{
		const mapMeshes = await importGLTF(bjRef.scene, bjMapUrl, true, true);
		if (mapMeshes && mapMeshes.length > 0) bjRef.map = mapMeshes[0];
			else console.warn("Failed to load map");
	}
	catch (error) { console.error("Error while loading map:", error); }
	try
	{
		const modelMeshes = await importGLTF(sceneInstance, cardUrl, false, false);
		if (modelMeshes && modelMeshes.length > 0)
		{
			modelMeshes[0].scaling = new baby.Vector3(1.35, 1.35, 1.35); // Make cards bigger
			modelMeshes[0].position = new baby.Vector3(0, 0.62, 0.4); // All cards sitting on the table
			modelMeshes[0].rotation = new baby.Vector3(Math.PI / -2, Math.PI, 0); // Cards are flat on the table
			modelMeshes[0].isVisible = true;
			modelMeshes[0].setEnabled(true);
		}
		  if (!bjRef.cards) {
			bjRef.cards = {};
		  }
		  for (const suit in bj.SuitMap) {
		  for (const value in bj.ValueMap) {
		  const key = bj.getCardKey(suit as keyof typeof bj.SuitMap, value as keyof typeof bj.ValueMap);
		  const meshName = `${suit}${value.charAt(0).toUpperCase() + value.slice(1)}`;
		  console.log(`Looking for mesh: ${meshName} with key: ${key}`);
		  const mesh: baby.AbstractMesh | undefined = bjRef.scene.meshes.find((mesh: baby.AbstractMesh) => mesh.name === meshName);
		  if (mesh) {
			bjRef.cards[key] = mesh as baby.Mesh;
		  }
		}
	  }
	}
	catch (error) { console.error("Error while loading card model:", error); }

	const	freeCamera = new baby.FlyCamera("freeCam", new baby.Vector3(0, 1, 0), sceneInstance);
	freeCamera.position = new baby.Vector3(0, 10, 0);
	freeCamera.attachControl(canvasRef);
	freeCamera.keysUp = [87, 38];		// W, Up arrow
	freeCamera.keysDown = [83, 40];		// S, Down arrow
	freeCamera.keysLeft = [65, 37];		// A, Left arrow
	freeCamera.keysRight = [68, 39];	// D, Right arrow
	bjRef.freeCamera = freeCamera;

	const	gameCamera = new baby.FreeCamera("mainMenuCam", new baby.Vector3(0, 1.5, 2.7), sceneInstance);
	gameCamera.inputs.clear();
	gameCamera.rotation = new baby.Vector3(0.5, Math.PI / 1.001, 0);
	bjRef.gameCamera = gameCamera;

	const	transitionCamera = new baby.FreeCamera("transitionCamera", baby.Vector3.Zero(), sceneInstance);
	bjRef.transitionCamera = transitionCamera;
}

export const	setupBabylonPong = async (pong: React.RefObject<game.pongStruct>, canvasRef: React.RefObject<HTMLCanvasElement | null>): Promise<void> =>
{
	const	engineInstance = new baby.Engine(canvasRef.current, true);
	const	sceneInstance = new baby.Scene(engineInstance);
	pong.current.engine = engineInstance;
	pong.current.scene = sceneInstance;

	new baby.HemisphericLight("light", new baby.Vector3(1, 1, 0), sceneInstance);

	const	skyboxMesh = baby.MeshBuilder.CreateBox("skyBox", { size: 1000 }, sceneInstance);
	pong.current.skybox = skyboxMesh;

	const	cameraInstance = new baby.FreeCamera("mainMenuCam", new baby.Vector3(-40.0, 2.0, 25.0), sceneInstance);
	cameraInstance.setTarget(baby.Vector3.Zero());
	cameraInstance.inputs.clear();
	cameraInstance.rotation = new baby.Vector3(0, 2.3, 0);
	pong.current.mainMenuCam = cameraInstance;
	pong.current.scene.activeCamera = cameraInstance;

	try
	{
		const meshes = await importGLTF(pong.current.scene, pongMapUrl, true, true);
		if (meshes && meshes.length > 0) pong.current.map = meshes[0];
		else console.warn("Failed to load map");
	}
	catch (error) { console.error("Error while loading map:", error); }

	//                                                            width: width,           height: depth, depth: height
	const	paddle1Mesh = baby.MeshBuilder.CreateBox("paddle1", { width: pong.current.paddleWidth, height: 0.75, depth: 1 }, sceneInstance);
	const	paddle2Mesh = baby.MeshBuilder.CreateBox("paddle2", { width: pong.current.paddleWidth, height: 0.75, depth: 1 }, sceneInstance);
	paddle1Mesh.scaling.z = pong.current.paddleHeight;
	paddle2Mesh.scaling.z = pong.current.paddleHeight;
	pong.current.paddle1 = paddle1Mesh;
	pong.current.paddle2 = paddle2Mesh;
	game.resetPaddlesPosition(pong.current);
	const	PREDICT = baby.MeshBuilder.CreateBox("predict", { width: .2, height: 0.75, depth: .2 }, sceneInstance);
	const	predictMaterial = new baby.StandardMaterial("predictMaterial", sceneInstance);
			predictMaterial.diffuseColor = new baby.Color3(1, 0, 0); // Red color (R=1, G=0, B=0)
			PREDICT.material = predictMaterial;
	pong.current.PREDICT = PREDICT;


	const	arenaCamera = new baby.FreeCamera("arenaCam", new baby.Vector3(0, 30, 0), sceneInstance);
	arenaCamera.rotation = new baby.Vector3(Math.PI / 2, 0, Math.PI);
	pong.current.arenaCam = arenaCamera;

	const	pongSettingsCamera = new baby.FreeCamera("settingsCam", new baby.Vector3(-10, 1.5, -25), sceneInstance);
	pongSettingsCamera.rotation = new baby.Vector3(0, Math.PI , 0);
	pong.current.pongSettingsCam = pongSettingsCamera;

	const	transitionCamera = new baby.FreeCamera("transitionCamera", baby.Vector3.Zero(), sceneInstance);
	pong.current.transitionCam = transitionCamera;

	const	notFoundCamera = new baby.FlyCamera("notFoundCam", new baby.Vector3(0, 1, 0), sceneInstance);
	notFoundCamera.position = new baby.Vector3(0, 10, 0);
	notFoundCamera.attachControl(true);
	notFoundCamera.keysUp = [87, 38];		// W, Up arrow
	notFoundCamera.keysDown = [83, 40];		// S, Down arrow
	notFoundCamera.keysLeft = [65, 37];		// A, Left arrow
	notFoundCamera.keysRight = [68, 39];	// D, Right arrow
	pong.current.notFoundCam = notFoundCamera;

	const	ballMesh = baby.MeshBuilder.CreateSphere("ball", { diameter: pong.current.ballDiameter }, sceneInstance);
	ballMesh.position = new baby.Vector3(0, 0, 0);
	pong.current.ball = ballMesh;


	const	ceiling = baby.MeshBuilder.CreateBox("ceiling", { width: 1, height: 0.1, depth: 1 }, sceneInstance);
	ceiling.position.y = 0;
	pong.current.ceiling = ceiling;
	const	floor = baby.MeshBuilder.CreateBox("floor", { width: 1, height: 0.1, depth: 1 }, sceneInstance);
	floor.position.y = 0;
	pong.current.floor = floor;
	const	wallLeft = baby.MeshBuilder.CreateBox("wallLeft", { width: 1, height: 0.1, depth: 1 }, sceneInstance);
	wallLeft.position.y = 0;
	pong.current.wallLeft = wallLeft;
	const	wallRight = baby.MeshBuilder.CreateBox("wallRight", { width: 1, height: 0.1, depth: 1 }, sceneInstance);
	wallRight.position.y = 0;
	pong.current.wallRight = wallRight;

	pong.current.ceiling.scaling.x = pong.current.arenaWidth * 2 + 3;
	pong.current.ceiling.position.z = -pong.current.arenaWidth - 1;
	pong.current.floor.scaling.x = pong.current.arenaWidth * 2 + 3;
	pong.current.floor.position.z = pong.current.arenaWidth + 1;

	pong.current.wallLeft.scaling.z = pong.current.arenaHeight * 2 + 3;
	pong.current.wallLeft.position.x = pong.current.arenaHeight + 1;
	pong.current.wallRight.scaling.z = pong.current.arenaHeight * 2 + 3;
	pong.current.wallRight.position.x = -pong.current.arenaHeight - 1;

	// Enable ambient occlusion
	sceneInstance.createDefaultEnvironment();
	const ssaoRenderingPipeline = new baby.SSAORenderingPipeline("ssao", sceneInstance,  1);
	ssaoRenderingPipeline.scene.setRenderingOrder(0, null, null, null);
	sceneInstance.postProcessRenderPipelineManager.attachCamerasToRenderPipeline("ssao", sceneInstance.cameras);

	// Set rendering groups so GUI renders after post-processing
    sceneInstance.setRenderingAutoClearDepthStencil(1, false); // Don't clear depth for rendering group 1
}

export const importGLTF = async (scene: baby.Scene, modelUrl: string, visible: boolean, enabled: boolean) => {
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
	  mesh.isVisible = !!visible;
	  mesh.setEnabled(!!enabled);
	});


    return result.meshes;
  } catch (error) {
    console.error("Error loading model:", error);
    return null;
  }
};
