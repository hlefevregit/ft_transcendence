// imports
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { KeyboardInfo } from 'babylonjs';
import { Engine, Scene } from 'babylonjs';
import { Vector3, HemisphericLight, MeshBuilder } from 'babylonjs';
import { FreeCamera, KeyboardEventTypes } from 'babylonjs';
import { SceneLoader } from 'babylonjs';



const Pong: React.FC = () =>
{

	const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
	React.useEffect(() =>
	{
		if (!canvasRef.current) return;

		canvasRef.current.focus()

		const engine = new Engine(canvasRef.current, true);
		const scene = new Scene(engine);

		// Import environment
		const skybox = MeshBuilder.CreateBox("skyBox", { size: 1000 }, scene);

		// Camera
		const camera = new FreeCamera("camera1", new Vector3(0, 30, 0), scene);
		camera.setTarget(Vector3.Zero());
		camera.inputs.clear();
		camera.attachControl(canvasRef.current, true);

		new HemisphericLight("light", new Vector3(1, 1, 0), scene);

		// Pong settings
		const ballSpeed = 0.15;
		const paddleSpeed = 0.25;
		const paddle1Speed = paddleSpeed;
		const paddle2Speed = paddleSpeed;

		const arenaWidth = Math.abs(10);
		const arenaHeight = Math.abs(10);

		// Paddles
		const paddle1 = MeshBuilder.CreateBox("pad1", { width: 1, height: 1, depth: 4 }, scene);
		paddle1.position = new Vector3(-arenaWidth, 1, 0);

		const paddle2 = MeshBuilder.CreateBox("pad2", { width: 1, height: 1, depth: 4 }, scene);
		paddle2.position = new Vector3(arenaWidth, 1, 0);


		// Keyboard input observable
		const pressedKeys = new Set<string>(); // tracks currently held keys
		scene.onKeyboardObservable.add((kbInfo) =>
		{
			const key = kbInfo.event.key.toLowerCase();
		
			if (kbInfo.type === KeyboardEventTypes.KEYDOWN)
			{
				pressedKeys.add(key);
			}
			else if (kbInfo.type === KeyboardEventTypes.KEYUP)
			{
				pressedKeys.delete(key);
			}
		});


		// Loop
		engine.runRenderLoop(() =>
		{
			// Check pressed keys each frame and apply movement
			if (pressedKeys.has('arrowup'))
			{
				paddle1.position.z = Math.max(-arenaHeight, Math.min(arenaHeight, paddle1.position.z -= paddleSpeed));
			}
			if (pressedKeys.has('arrowdown'))
			{
				paddle1.position.z = Math.max(-arenaHeight, Math.min(arenaHeight, paddle1.position.z += paddleSpeed));
			}
			if (pressedKeys.has('w'))
			{
				paddle2.position.z = Math.max(-arenaHeight, Math.min(arenaHeight, paddle2.position.z -= paddleSpeed));
			}
			if (pressedKeys.has('s'))
			{
				paddle2.position.z = Math.max(-arenaHeight, Math.min(arenaHeight, paddle2.position.z += paddleSpeed));
			}
			scene.render();
		});

		window.addEventListener('resize', () =>
		{
			engine.resize();
		});

		return () =>
		{
			engine.dispose();
		};
	}, []);


	return (
		<div>
			<canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
		</div>
	);
}

export default Pong;