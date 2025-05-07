// imports
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { KeyboardInfo, Mesh, MeshBlock } from 'babylonjs';
import { Engine, Scene } from 'babylonjs';
import { Vector3, HemisphericLight, MeshBuilder } from 'babylonjs';
import { FreeCamera, KeyboardEventTypes } from 'babylonjs';
import { SceneLoader } from 'babylonjs';

import { doBallCollideWithWall, doBallCollideWithCeiling } from '../utils/pongBallCollisions';
import { doPaddleMovement } from '../hooks/pongKeyToPaddleMovement';

const Pong: React.FC = () =>
{
	const	canvasRef = React.useRef<HTMLCanvasElement | null>(null);

	const	engine = React.useRef<Engine | null>(null);
	const	scene = React.useRef<Scene | null>(null);
	const	skybox = React.useRef<Mesh | null>(null);
	const	ball = React.useRef<Mesh | null>(null);
	const	paddle1 = React.useRef<Mesh | null>(null);
	const	paddle2 = React.useRef<Mesh | null>(null);
	const	camera = React.useRef<FreeCamera | null>(null);

	const	pressedKeys = React.useRef<Set<string>>(new Set());

	const	ballDirection = React.useRef<Vector3>(new Vector3(0.1, 0, 0));
	const	ballSpeedModifier = React.useRef<number>(1);
	const	ballSpeed = React.useRef<number>(0.1);
	const	paddleSpeed = React.useRef<number>(0.25);
	const	arenaWidth = React.useRef<number>(10);
	const	arenaHeight = React.useRef<number>(10);

	React.useEffect(() =>
	{
		if (!canvasRef.current) return;
		canvasRef.current.focus();

		const	engineInstance = new Engine(canvasRef.current, true);
		const	sceneInstance = new Scene(engineInstance);
		engine.current = engineInstance;
		scene.current = sceneInstance;

		new HemisphericLight("light", new Vector3(1, 1, 0), sceneInstance);

		const	skyboxMesh = MeshBuilder.CreateBox("skyBox", { size: 1000 }, sceneInstance);
		skybox.current = skyboxMesh;

		const	paddle1Mesh = MeshBuilder.CreateBox("paddle1", { width: 0.25, height: 1, depth: 4 }, sceneInstance);
		const	paddle2Mesh = MeshBuilder.CreateBox("paddle2", { width: 0.25, height: 1, depth: 4 }, sceneInstance);
		paddle1Mesh.position = new Vector3(-(arenaWidth.current - 1), 0, 0);
		paddle2Mesh.position = new Vector3((arenaWidth.current - 1), 0, 0);
		paddle1.current = paddle1Mesh;
		paddle2.current = paddle2Mesh;

		const	cameraInstance = new FreeCamera("camera", new Vector3(0, 30, 0), sceneInstance);
		cameraInstance.setTarget(Vector3.Zero());
		cameraInstance.inputs.clear();
		cameraInstance.attachControl(canvasRef.current, true);
		camera.current = cameraInstance;

		const	ballMesh = MeshBuilder.CreateSphere("ball", { diameter: 1 }, sceneInstance);
		ballMesh.position = new Vector3(0, 0, 0);
		ball.current = ballMesh;

		// Initial ball direction
		ballDirection.current = Math.random() > 0.5
			? new Vector3(ballSpeed.current, 0, 0)
			: new Vector3(-ballSpeed.current, 0, 0);

		// Keyboard input
		sceneInstance.onKeyboardObservable.add((kbInfo) =>
		{
			const	key = kbInfo.event.key.toLowerCase();
			if (kbInfo.type === KeyboardEventTypes.KEYDOWN)
			{
				pressedKeys.current.add(key);
			}
			else if (kbInfo.type === KeyboardEventTypes.KEYUP)
			{
				pressedKeys.current.delete(key);
			}
		});

		// Game loop
		engineInstance.runRenderLoop(() =>
		{
			if (!paddle1.current || !paddle2.current || !ball.current) return;

			// Paddle movement
			doPaddleMovement
			(
				pressedKeys.current,
				paddle1.current,
				paddle2.current,
				arenaHeight.current,
				paddleSpeed.current
			);

			// Ball movement
			ball.current.position.x += ballDirection.current.x * ballSpeedModifier.current;
			ball.current.position.z += ballDirection.current.z * ballSpeedModifier.current;

			if (doBallCollideWithWall(ball.current.position, arenaWidth.current))
			{
				ballDirection.current.x *= -1;
				ballSpeedModifier.current += ballSpeed.current;
			}
			if (doBallCollideWithCeiling(ball.current.position, arenaHeight.current))
			{
				ballDirection.current.z *= -1;
				ballSpeedModifier.current += ballSpeed.current;
			}

			sceneInstance.render();
		});

		window.addEventListener('resize', () => engineInstance.resize());

		return () =>
		{
			engineInstance.dispose();
		};
	}, []);

	return (
		<div>
			<canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
		</div>
	);
};

// const Pong: React.FC = () =>
// {
// 	const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
// 	const	[pongSettings, setPongSettings] = React.useState({
		
// 	});
// 	const	[paddlesVars, setPaddlesVars] = React.useState({
		
// 	});
// 	React.useEffect(() =>
// 	{
// 		if (!canvasRef.current) return;

// 		canvasRef.current.focus()

// 		const engine = new Engine(canvasRef.current, true);
// 		const scene = new Scene(engine);

// 		// Import environment
// 		const skybox = MeshBuilder.CreateBox("skyBox", { size: 1000 }, scene);
		
// 		new HemisphericLight("light", new Vector3(1, 1, 0), scene);
		
// 		// Pong settings
// 		var	ballSpeedModifier: number = 1;
// 		var	ballSpeed: number = 0.05;
// 		var	paddleSpeed: number = 0.25;
// 		var	paddle1Speed: number = paddleSpeed;
// 		var	paddle2Speed: number = paddleSpeed;
		
// 		var	arenaWidth = Math.abs(10);
// 		var	arenaHeight = Math.abs(10);
		
// 		// Paddles
// 		var	paddle1: Mesh = MeshBuilder.CreateBox("pad1", { width: .25, height: 1, depth: 4 }, scene);
// 		var	paddle2: Mesh = MeshBuilder.CreateBox("pad2", { width: .25, height: 1, depth: 4 }, scene);
// 		paddle1.position = new Vector3(-(arenaWidth - 1), 0, 0);
// 		paddle2.position = new Vector3((arenaWidth - 1), 0, 0);

// 		// Camera
// 		var	camera: FreeCamera = new FreeCamera("camera", new Vector3(0, 30, 0), scene);
// 		camera.setTarget(Vector3.Zero());
// 		camera.inputs.clear();
// 		camera.attachControl(canvasRef.current, true);

// 		// Keyboard input observable
// 		const pressedKeys = new Set<string>(); // tracks currently held keys
// 		scene.onKeyboardObservable.add((kbInfo) =>
// 		{
// 			const key = kbInfo.event.key.toLowerCase();
		
// 			if (kbInfo.type === KeyboardEventTypes.KEYDOWN)
// 			{
// 				pressedKeys.add(key);
// 			}
// 			else if (kbInfo.type === KeyboardEventTypes.KEYUP)
// 			{
// 				pressedKeys.delete(key);
// 			}
// 		});

// 		// Ball
// 		const ball = MeshBuilder.CreateSphere("ball", { diameter: 1 }, scene);
// 		ball.position = new Vector3(0, 0, 0);
	
// 		// Ball initial direction
// 		const	ballGoRight: Vector3 = new Vector3(ballSpeed, 0, 0);
// 		const	ballGoLeft: Vector3 = new Vector3(-ballSpeed, 0, 0);
// 		var		ballDirection: Vector3 = Math.random() > 0.5 ? ballGoRight : ballGoLeft;

// 		// Ball wall collision
// 		const	doBallCollideWithWall = (ballPos: Vector3, collideAxis: number): Boolean =>
// 		{
// 			const	collideAxisAbs: number = Math.abs(collideAxis)
// 			const	ballPosAbs: number = Math.abs(ballPos.x);	// X axis

// 			var		doCollide: Boolean = false;
// 			doCollide = ballPosAbs >= collideAxisAbs ? true : false;
// 			return doCollide;
// 		}
// 		// Ball ceiling collision
// 		const	doBallCollideWithCeiling = (ballPos: Vector3, collideAxis: number): Boolean =>
// 		{
// 			const	collideAxisAbs: number = Math.abs(collideAxis)
// 			const	ballPosAbs: number = Math.abs(ballPos.z);	// Z axis

// 			var		doCollide: Boolean = false;
// 			doCollide = ballPosAbs >= collideAxisAbs ? true : false;
// 			return doCollide;
// 		}

// 		// Ball reflection


// 		// Paddle movement
// 		const	paddleMovement = (): void =>
// 		{
// 			if (pressedKeys.has('arrowup'))
// 			{
// 				paddle1.position.z = Math.max(-arenaHeight, Math.min(arenaHeight, paddle1.position.z -= paddleSpeed));
// 			}
// 			if (pressedKeys.has('arrowdown'))
// 			{
// 				paddle1.position.z = Math.max(-arenaHeight, Math.min(arenaHeight, paddle1.position.z += paddleSpeed));
// 			}
// 			if (pressedKeys.has('w'))
// 			{
// 				paddle2.position.z = Math.max(-arenaHeight, Math.min(arenaHeight, paddle2.position.z -= paddleSpeed));
// 			}
// 			if (pressedKeys.has('s'))
// 			{
// 				paddle2.position.z = Math.max(-arenaHeight, Math.min(arenaHeight, paddle2.position.z += paddleSpeed));
// 			}
// 		}

// 		// Loop
// 		engine.runRenderLoop(() =>
// 		{
// 			// Check pressed keys each frame and apply movement to each paddles
// 			paddleMovement();

// 			// Ball movement
// 			ball.position.x += ballDirection.x * ballSpeedModifier;
// 			ball.position.z += ballDirection.z * ballSpeedModifier;
// 			// console.log(ball.position.x, ball.position.z);

// 			// Ball wall collision
// 			if (doBallCollideWithWall(ball.position, arenaWidth))
// 			{
// 				ballDirection.x *= -1;
// 				ballSpeedModifier += ballSpeed;
// 				console.log("Ball collided with wall");
// 			}
// 			if (doBallCollideWithCeiling(ball.position, arenaHeight))
// 			{
// 				ballDirection.z *= -1;
// 				ballSpeedModifier += ballSpeed;
// 				console.log("Ball collided with ceiling");
// 			}
// 			scene.render();
// 		});

// 		window.addEventListener('resize', () =>
// 		{
// 			engine.resize();
// 		});

// 		return () =>
// 		{
// 			engine.dispose();
// 		};
// 	}, []);

// 	return (
// 		<div>
// 			<canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
// 		</div>
// 	);
// }

export default Pong;