// imports
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { KeyboardInfo, Mesh, MeshBlock } from 'babylonjs';
import { Engine, Scene } from 'babylonjs';
import { Vector3, HemisphericLight, MeshBuilder } from 'babylonjs';
import { FreeCamera, KeyboardEventTypes } from 'babylonjs';
import { SceneLoader } from 'babylonjs';


// import { pongGame } from '../utils/pongSetup';
import { pongGameRef, initPongStruct } from '@/utils/pongSetup';
import { fitCameraToArena } from '@/utils/babylonUtils';
import { doBallCollideWithWall, doBallCollideWithCeiling, makeBallBounce } from '@/utils/pongBallCollisions';
import { doPaddleMovement } from '@/hooks/pongKeyToPaddleMovement';

const Pong: React.FC = () =>
{
	const	canvasRef = React.useRef<HTMLCanvasElement | null>(null);
	const	pong = React.useRef<pongGameRef>(initPongStruct());

	/* GAME LOGIC / GAME STATE SHOULD USE React.useState() or React.useReducer() !!! */
	/* WHAT TO CHOOSE BETWEEN React.useState() or React.useReducer() */
	/* WHAT TO CHOOSE BETWEEN React.useState() or React.useReducer() */

	// Simple values (toggle, input) should use React.useState()
	// Multiple related values should use React.useReducer()
	// Complex logic or conditionals should use React.useReducer()
	// Game state (like "paused", "running", "scored") should use React.useReducer()
	// You need debugging-friendly logic should use React.useReducer()

	// React.useState
	// <{
		
	// }>
	// ({

	// })
	// React.useReducer
	// <{
		
	// }>
	// ({

	// })

	React.useEffect(() =>
	{
		if (!canvasRef.current) return;
		canvasRef.current.focus();

		const	engineInstance = new Engine(canvasRef.current, true);
		const	sceneInstance = new Scene(engineInstance);
		pong.current.engine = engineInstance;
		pong.current.scene = sceneInstance;

		new HemisphericLight("light", new Vector3(1, 1, 0), sceneInstance);

		const	skyboxMesh = MeshBuilder.CreateBox("skyBox", { size: 1000 }, sceneInstance);
		pong.current.skybox = skyboxMesh;

		const	paddle1Mesh = MeshBuilder.CreateBox("paddle1", { width: 0.25, height: 1, depth: pong.current.paddleHeight }, sceneInstance);
		const	paddle2Mesh = MeshBuilder.CreateBox("paddle2", { width: 0.25, height: 1, depth: pong.current.paddleHeight }, sceneInstance);
		paddle1Mesh.position = new Vector3(-(pong.current.arenaHeight - 1), 0, 0);
		paddle2Mesh.position = new Vector3((pong.current.arenaWidth - 1), 0, 0);
		pong.current.paddle1 = paddle1Mesh;
		pong.current.paddle2 = paddle2Mesh;

		const	cameraInstance = new FreeCamera("camera", new Vector3(0, 30, 0), sceneInstance);
		cameraInstance.setTarget(Vector3.Zero());
		cameraInstance.inputs.clear();
		pong.current.camera = cameraInstance;

		const	ballMesh = MeshBuilder.CreateSphere("ball", { diameter: 1 }, sceneInstance);
		ballMesh.position = new Vector3(0, 0, 0);
		pong.current.ball = ballMesh;

		// Initial ball direction
		pong.current.ballDirection = Math.random() > 0.5
			? new Vector3(pong.current.ballSpeed, 0, 0)
			: new Vector3(-pong.current.ballSpeed, 0, 0);

		// Keyboard input
		sceneInstance.onKeyboardObservable.add((kbInfo) =>
		{
			const	key = kbInfo.event.key.toLowerCase();
			if (kbInfo.type === KeyboardEventTypes.KEYDOWN)
			{
				pong.current.pressedKeys.add(key);
			}
			else if (kbInfo.type === KeyboardEventTypes.KEYUP)
			{
				pong.current.pressedKeys.delete(key);
			}
		});

		// Game loop
		engineInstance.runRenderLoop(() =>
		{
			if (!pong.current.paddle1 || !pong.current.paddle2 || !pong.current.ball) return;

			// Paddle movement
			doPaddleMovement(pong.current);

			// Ball movement
			pong.current.ball.position.x += pong.current.ballDirection.x * pong.current.ballSpeedModifier;
			pong.current.ball.position.z += pong.current.ballDirection.z * pong.current.ballSpeedModifier;

			makeBallBounce(pong.current);
			

			sceneInstance.render();
			fitCameraToArena(pong.current);
		});


		// const handleResize = (): void =>
		// {
		// 	engineInstance.resize(); // Resize engine
		// 	const aspectRatio = engineInstance.getRenderWidth() / engineInstance.getRenderHeight();
		// 	const newFOV = Math.atan(Math.tan(Math.PI / 4) / aspectRatio); // This is just one approach
		// 	cameraInstance.fov = newFOV;
		// 	cameraInstance.position.y = 30 + (aspectRatio - 1) * 5;
		// }

		// const handleResize = () => {
		// 	if (!pong.current.engine || !pong.current.scene) return;
		
		// 	// Resize engine
		// 	pong.current.engine.resize();
		
		// 	// Get the current aspect ratio of the window
		// 	const aspectRatio = window.innerWidth / window.innerHeight;
		
		// 	// Adjust camera's Y offset based on the aspect ratio
		// 	if (pong.current.camera) {
		// 		const camera = pong.current.camera;
		
		// 		// Adjust the camera's Y position to maintain a consistent view of the scene
		// 		camera.position.y = 30 * aspectRatio; // Scaling the Y offset based on the aspect ratio
		
		// 		// Optionally, adjust the FOV to maintain a consistent field of view with the new aspect ratio
		// 		camera.fov = Math.atan(Math.tan(Math.PI / 4) / aspectRatio); // Optional adjustment of FOV
		// 		camera.update(); // Update camera to apply the changes
		// 	}
		// };
		
		
	

		window.addEventListener('resize', () => engineInstance.resize());
		window.addEventListener('orientationchange', () => engineInstance.resize());
		window.addEventListener('visibilitychange', () => engineInstance.resize());

		return () =>
		{
			engineInstance.dispose();
		};
	}, []);

	return (
		<div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
			<canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
		</div>
	);
};

export default Pong;