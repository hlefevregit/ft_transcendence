// imports
import React from 'react';

import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';

export function fitCameraToArena(pong: game.pongStruct): void
{
	if (!pong.arenaCam || !pong.engine) return;

	// Get canvas size and compute aspect ratio
	const	canvasAspect = pong.engine.getRenderWidth() / pong.engine.getRenderHeight();

	// Compute arena aspect ratio
	const	arenaAspect = pong.arenaWidth / pong.arenaHeight;

	// Choose the limiting factor: width or height
	// We need to calculate how far the camera needs to be to fit the arena
	let		neededViewSize = 0;
	if (canvasAspect > arenaAspect)
	{
		// Canvas is wider than arena -> height is limiting
		neededViewSize = pong.arenaHeight;
	}
	else
	{
		// Canvas is taller than arena -> width is limiting
		// We need to scale height based on canvas/aspect ratio
		neededViewSize = pong.arenaWidth / canvasAspect;
	}

	// Camera FOV is vertical (by default it's PI/4)
	const	fov = pong.arenaCam.fov; // radians

	// Calculate required camera height to fit `neededViewSize` vertically
	const	requiredY = (neededViewSize / 2) / Math.tan(fov / 2);

	// Set the camera height
	pong.arenaCam.position.y = requiredY * 2.11111111;

	// Always look at the center
	pong.arenaCam.setTarget(baby.Vector3.Zero());
}

export const	setPaddings = (button: baby.Button, paddingSize: string): void =>
{
	button.paddingTop = paddingSize;
	button.paddingBottom = paddingSize;
	button.paddingLeft = paddingSize;
	button.paddingRight = paddingSize;
}

/**
 * Converts a quaternion to Euler angles for Babylon.js FreeCamera
 * @param {string} alignment - "top", "bottom", "left", "right", "top-left", "top-right", "bottom-left", "bottom-right"
 */
export const	setAlignment = (control: baby.Control, alignment?: string): void =>
{
	switch (alignment)
	{
		default:
			control.verticalAlignment = baby.Control.VERTICAL_ALIGNMENT_CENTER;
			control.horizontalAlignment = baby.Control.HORIZONTAL_ALIGNMENT_CENTER;
			break;
		case "top":
			control.verticalAlignment = baby.Control.VERTICAL_ALIGNMENT_TOP;
			control.horizontalAlignment = baby.Control.HORIZONTAL_ALIGNMENT_CENTER;
			break;
		case "bottom":
			control.verticalAlignment = baby.Control.VERTICAL_ALIGNMENT_BOTTOM;
			control.horizontalAlignment = baby.Control.HORIZONTAL_ALIGNMENT_CENTER;
			break;
		case "left":
			control.verticalAlignment = baby.Control.VERTICAL_ALIGNMENT_CENTER;
			control.horizontalAlignment = baby.Control.HORIZONTAL_ALIGNMENT_LEFT;
			break;
		case "right":
			control.verticalAlignment = baby.Control.VERTICAL_ALIGNMENT_CENTER;
			control.horizontalAlignment = baby.Control.HORIZONTAL_ALIGNMENT_RIGHT;
			break;
		case "top-left":
			control.verticalAlignment = baby.Control.VERTICAL_ALIGNMENT_TOP;
			control.horizontalAlignment = baby.Control.HORIZONTAL_ALIGNMENT_LEFT;
			break;
		case "top-right":
			control.verticalAlignment = baby.Control.VERTICAL_ALIGNMENT_TOP;
			control.horizontalAlignment = baby.Control.HORIZONTAL_ALIGNMENT_RIGHT;
			break;
		case "bottom-left":
			control.verticalAlignment = baby.Control.VERTICAL_ALIGNMENT_BOTTOM;
			control.horizontalAlignment = baby.Control.HORIZONTAL_ALIGNMENT_LEFT;
			break;
		case "bottom-right":
			control.verticalAlignment = baby.Control.VERTICAL_ALIGNMENT_BOTTOM;
			control.horizontalAlignment = baby.Control.HORIZONTAL_ALIGNMENT_RIGHT;
			break;
	}
}

export const	forceRender = (pong: game.pongStruct):void => { if (pong.scene) pong.scene.render(); };

/**
 * Converts a quaternion to Euler angles for Babylon.js FreeCamera
 * @param {number} x - Quaternion x component
 * @param {number} y - Quaternion y component
 * @param {number} z - Quaternion z component
 * @param {number} w - Quaternion w component
 * @returns {baby.Vector3} Euler angles in radians (x: pitch, y: yaw, z: roll)
 */
export const	quaternionToEulerAngles = (x: number, y: number, z: number, w: number): baby.Vector3 =>
{
    const quaternion = new baby.Quaternion(x, y, z, w);
    return quaternion.toEulerAngles();
}

export const	changeCamera = (newCamera: baby.Camera | undefined, pong: React.RefObject<game.pongStruct>): void =>
{
	if (!pong.current.scene || newCamera === undefined) return;
	pong.current.scene.activeCamera = newCamera;
	// console.log("Camera changed to: ", newCamera.name);
	return;
}

export const	lerpVector3 = (start: baby.Vector3, end: baby.Vector3, midPoint: number): baby.Vector3 =>
{
	midPoint = Math.max(0, Math.min(1, midPoint));	// Clamp

	return new baby.Vector3(
		(start.x, end.x, midPoint),
	)
}

export const	sleep = (ms: number): Promise<void> =>
{
	return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Linearly interpolates between two numbers
 * @param {number} start - Starting value
 * @param {number} end - Target value
 * @param {number} alpha - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 */
export const lerp = (start: number, end: number, alpha: number): number => {
    // Clamp alpha to 0-1 range
    alpha = Math.max(0, Math.min(1, alpha));
    
    // Linear interpolation formula: start + (end - start) * alpha
    return start + (end - start) * alpha;
}

/**
 * Applies a smooth step interpolation between two Vector3 values
 * @param {baby.Vector3} start - Starting vector
 * @param {baby.Vector3} end - Target vector 
 * @param {number} alpha - Interpolation factor (0-1)
 * @returns {baby.Vector3} Smoothly interpolated vector
 */
export const	smoothStepVector3 = (start: baby.Vector3, end: baby.Vector3, alpha: number): baby.Vector3 =>
{
	// Clamp alpha to 0-1 range
	alpha = Math.max(0, Math.min(1, alpha));
	
	// Apply smoothStep function: 3x^2 - 2x^3
	alpha = alpha * alpha * (3 - 2 * alpha);
	
	// Use Babylon's built-in lerp with our smoothed alpha
	return baby.Vector3.Lerp(start, end, alpha);
}

export const	smoothStep = (start: number, end: number, alpha: number): number =>
{
	// Clamp alpha to 0-1 range
	alpha = Math.max(0, Math.min(1, alpha));
	
	// Apply smoothStep function: 3x^2 - 2x^3
	alpha = alpha * alpha * (3 - 2 * alpha);
	
	// Use our built-in lerp with our smoothed alpha
	return game.lerp(start, end, alpha);
}

let		time: number = 0;
/**
 * Smoothly transitions between two cameras over a specified duration
 * @param {baby.FreeCamera | baby.FlyCamera} cameraA - Starting camera
 * @param {baby.FreeCamera | baby.FlyCamera} cameraB - Target camera
 * @param {number} duration - Transition duration in seconds
 * @param {React.RefObject<game.pongStruct>} pong - Reference to the pong game structure
 * @param {React.RefObject<game.states>} states - Reference to the current game state
 * */
export const	transitionToCamera = async (
	cameraA: baby.FreeCamera | baby.FlyCamera | undefined,
	cameraB: baby.FreeCamera | baby.FlyCamera | undefined,
	duration: number,
	pong: React.RefObject<game.pongStruct>,
	states: React.RefObject<game.states>
): Promise<void> =>
{
	// console.log("Started transition");
	const	lastState = states.current;
	if (cameraA === undefined || cameraB === undefined || !pong.current) return;
	states.current = game.states.in_transition;
	duration *= 1000;	// Convert to milliseconds

	// Set transitionCam to A
	pong.current.transitionCam?.position.copyFrom(cameraA.position);
	pong.current.transitionCam?.rotation.copyFrom(cameraA.rotation);
	pong.current.transitionCam!.fov = cameraA.fov;

	// Set transitionCam as the current active camera
	if (pong.current.scene?.activeCamera?.name !== pong.current.transitionCam?.name)
		changeCamera(pong.current.transitionCam, pong);
	forceRender(pong.current);
	
	// Animation loop
	while (time <= duration)
	{
		if (!pong.current.transitionCam) break;
		const	lerpedPosition = smoothStepVector3(cameraA.position.clone(), cameraB.position.clone(), time / duration);
		const	lerpedRotation = smoothStepVector3(cameraA.rotation.clone(), cameraB.rotation.clone(), time / duration);
		const	lerpedFOV = smoothStep(cameraA.fov, cameraB.fov, time / duration);

		pong.current.transitionCam.position.set(lerpedPosition.x, lerpedPosition.y, lerpedPosition.z);
		pong.current.transitionCam.rotation.set(lerpedRotation.x, lerpedRotation.y, lerpedRotation.z);
		pong.current.transitionCam.fov = lerpedFOV;

		const	deltaTime = pong.current.engine?.getDeltaTime() ?? 0;
		time += deltaTime;
		await sleep(deltaTime);
	}
	time = 0; // Reset time for next transition

	// Change back to the new camera
	changeCamera(cameraB, pong);
	states.current = lastState; // Restore previous state
	// console.log("Transition complete");
	game.updateScreensVisibilityStates(pong, states.current);
	return;
}

export const	findComponentByName = (pong: React.RefObject<game.pongStruct>, name: string): any =>
{
	const	component = pong.current.guiTexture?.getControlByName(name);
    return component as baby.TextBlock;
};

export const	resizeArenaShell = (pong: React.RefObject<game.pongStruct>): void =>
{
	if
	(
		   !pong.current.ceiling
		|| !pong.current.floor
		|| !pong.current.wallLeft
		|| !pong.current.wallRight
	) return;

	if (pong.current.arenaWidth > pong.current.arenaHeight)
		pong.current.floor.scaling.x = Math.max(pong.current.arenaWidth, pong.current.arenaHeight) * 2 + 3;
	else
		pong.current.floor.scaling.x = Math.min(pong.current.arenaWidth, pong.current.arenaHeight) * 2 + 3;

	pong.current.floor.position.z = pong.current.arenaHeight + 1;
	pong.current.ceiling.scaling.x = pong.current.floor.scaling.x;
	pong.current.ceiling.position.z = -pong.current.floor.position.z;

	if (pong.current.arenaWidth < pong.current.arenaHeight)
		pong.current.wallLeft.scaling.z = Math.max(pong.current.arenaWidth, pong.current.arenaHeight) * 2 + 3;
	else
		pong.current.wallLeft.scaling.z = Math.min(pong.current.arenaWidth, pong.current.arenaHeight) * 2 + 3;

	pong.current.wallLeft.position.x = pong.current.arenaWidth + 1;
	pong.current.wallRight.scaling.z = pong.current.wallLeft.scaling.z;
	pong.current.wallRight.position.x = -pong.current.wallLeft.position.x;
}

// Limits the number of times the resizing can be called in a given time frame
export function	debounce(fn: Function, ms: number)
{
	let	timer: NodeJS.Timeout;
	return (...args: any[]) =>
	{
		clearTimeout(timer);
		timer = setTimeout(() => { fn(...args); }, ms);
	};
}

export const	resetBall = (pong: game.pongStruct): void =>
{
	if (!pong.ball) return;
	pong.ball.position = baby.Vector3.Zero();
	pong.ballDirection = baby.Vector3.Zero();
	pong.ballSpeedModifier = 1;
}

export const	setPaddlePosition = (paddle: baby.Mesh, position: baby.Vector3): void =>
{
	if (!paddle) return;
	paddle.position = position;
}

export const	resetPaddlesPosition = (pong: game.pongStruct): void =>
{
	if (!pong.paddle1 || !pong.paddle2) return;
	setPaddlePosition(pong.paddle1, new baby.Vector3(-(pong.arenaWidth - 1), 0, 0));
	setPaddlePosition(pong.paddle2, new baby.Vector3((pong.arenaWidth - 1), 0, 0));
}

export const	setBallDirection = (pong: game.pongStruct, direction: baby.Vector3): void =>
{
	if (!pong.ball) return;
	pong.ballDirection = direction;
}

export const	setBallDirectionRight = (pong: game.pongStruct): void =>
{
	if (!pong.ball) return;
	setBallDirection(pong, new baby.Vector3(pong.ballSpeed, 0, 0));
}

export const	setBallDirectionLeft = (pong: game.pongStruct): void =>
{
	if (!pong.ball) return;
	setBallDirection(pong, new baby.Vector3(-pong.ballSpeed, 0, 0));
}

export const	setBallDirectionRandom = (pong: game.pongStruct): void =>
{
	if (!pong.ball) return;
	setBallDirection(pong, Math.random() > 0.5
		? new baby.Vector3(pong.ballSpeed, 0, 0)
		: new baby.Vector3(-pong.ballSpeed, 0, 0));
}

export const	reflectBallCeiling = (pong: game.pongStruct): void =>
{
	if (!pong.ball) return;
	if (pong.ballDirection.z < 0 && pong.ball.position.z <= -pong.arenaHeight)
	{
		pong.ballDirection.z *= -1;
		pong.ballSpeedModifier += pong.ballSpeedModifier * pong.ballSpeed >= pong.maxBallSpeed ? 0 : pong.ballSpeed;
	}
	if (pong.ballDirection.z > 0 && pong.ball.position.z >= pong.arenaHeight)
	{
		pong.ballDirection.z *= -1;
		pong.ballSpeedModifier += pong.ballSpeedModifier * pong.ballSpeed >= pong.maxBallSpeed ? 0 : pong.ballSpeed;
	}
	return;
}

export const	reflectBallPaddles = (pong: game.pongStruct): void =>
{
	if
	(
		   !pong.ball
		|| !pong.paddle1 
		|| !pong.paddle2
	) return;
	let	paddlePos: baby.Vector3 = pong.paddle2.position;
	if (pong.ballDirection.x < 0) { paddlePos = pong.paddle1.position; } // Choose the right paddle to bounce off
	if (game.collideWithPaddle(pong, paddlePos))
	{
		pong.ballDirection.z = (pong.ballDirection.z + game.chooseBouncingAngle(pong, paddlePos)) / 2;
		pong.ballDirection.x *= -1;
		pong.ballSpeedModifier += pong.ballSpeedModifier * pong.ballSpeed >= pong.maxBallSpeed ? 0 : pong.ballSpeed;
		return;
	}
}

// Language utility functions
export const	getLanguageFromStorage = (): string =>
{
	return localStorage.getItem('i18nextLng') || 'en';
};

export const	setLanguageInStorage = (language: string): void =>
{
	localStorage.setItem('i18nextLng', language);
	// Optionally trigger a storage event for other components to react
	window.dispatchEvent(new Event('storage'));
};