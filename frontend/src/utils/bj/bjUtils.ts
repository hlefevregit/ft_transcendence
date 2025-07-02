// imports
import React from 'react';

import * as baby from '@/libs/babylonLibs';
import * as bj from '@/libs/bjLibs';
import { stat } from 'fs';

// export function fitCameraToArena(pong: game.pongStruct): void
// {
// 	if (!pong.arenaCam || !pong.engine) return;

// 	// Get canvas size and compute aspect ratio
// 	const	canvasAspect = pong.engine.getRenderWidth() / pong.engine.getRenderHeight();

// 	// Compute arena aspect ratio
// 	const	arenaAspect = pong.arenaWidth / pong.arenaHeight;

// 	// Choose the limiting factor: width or height
// 	// We need to calculate how far the camera needs to be to fit the arena
// 	let		neededViewSize = 0;
// 	if (canvasAspect > arenaAspect)
// 	{
// 		// Canvas is wider than arena -> height is limiting
// 		neededViewSize = pong.arenaHeight;
// 	}
// 	else
// 	{
// 		// Canvas is taller than arena -> width is limiting
// 		// We need to scale height based on canvas/aspect ratio
// 		neededViewSize = pong.arenaWidth / canvasAspect;
// 	}

// 	// Camera FOV is vertical (by default it's PI/4)
// 	const	fov = pong.arenaCam.fov; // radians

// 	// Calculate required camera height to fit `neededViewSize` vertically
// 	const	requiredY = (neededViewSize / 2) / Math.tan(fov / 2);

// 	// Set the camera height
// 	pong.arenaCam.position.y = requiredY * 2.11111111;

// 	// Always look at the center
// 	pong.arenaCam.setTarget(baby.Vector3.Zero());
// }

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

export 	const	setState = (state: React.RefObject<bj.States>, newState: bj.States) => { state.current = newState; };

export const	changeCamera = (newCamera: baby.Camera | undefined, bjRef: React.RefObject<bj.bjStruct>): void =>
{
	if (!bjRef.current.scene || newCamera === undefined) return;
	bjRef.current.scene.activeCamera = newCamera;
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
const lerp = (start: number, end: number, alpha: number): number => {
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
const	smoothStepVector3 = (start: baby.Vector3, end: baby.Vector3, alpha: number): baby.Vector3 =>
{
	// Clamp alpha to 0-1 range
	alpha = Math.max(0, Math.min(1, alpha));

	// Apply smoothStep function: 3x^2 - 2x^3
	alpha = alpha * alpha * (3 - 2 * alpha);

	// Use Babylon's built-in lerp with our smoothed alpha
	return baby.Vector3.Lerp(start, end, alpha);
}

const	smoothStep = (start: number, end: number, alpha: number): number =>
{
	// Clamp alpha to 0-1 range
	alpha = Math.max(0, Math.min(1, alpha));

	// Apply smoothStep function: 3x^2 - 2x^3
	alpha = alpha * alpha * (3 - 2 * alpha);

	// Use our built-in lerp with our smoothed alpha
	return lerp(start, end, alpha);
}

export const	findComponentByName = (bjRef: React.RefObject<bj.bjStruct>, name: string): any =>
{
	const	component = bjRef.current.guiTexture?.getControlByName(name);
    return component as baby.TextBlock;
};

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

export const	forceRender = (bjRef: bj.bjStruct):void => { if (bjRef.scene) bjRef.scene.render(); };

let		time: number = 0;
export const	transitionToCamera = async (
	cameraA: baby.FreeCamera | baby.FlyCamera | undefined, 
	cameraB: baby.FreeCamera | baby.FlyCamera | undefined,
	duration: number, 
	bjRef: React.RefObject<bj.bjStruct>, 
	states: React.RefObject<bj.States>
): Promise<void> =>
{
	// console.log("Started transition");
	const	lastState = states.current;
	if (cameraA === undefined || cameraB === undefined || !bjRef.current) return;
	states.current = bj.States.in_transition;
	// console.log("STATES : ", states.current);
	duration *= 1000;	// Convert to milliseconds

	// Set transitionCamera to A
	bjRef.current.transitionCamera?.position.copyFrom(cameraA.position);
	bjRef.current.transitionCamera?.rotation.copyFrom(cameraA.rotation);
	bjRef.current.transitionCamera!.fov = cameraA.fov;

	// Set transitionCamera as the current active camera
	if (bjRef.current.scene?.activeCamera?.name !== bjRef.current.transitionCamera?.name)
		changeCamera(bjRef.current.transitionCamera, bjRef);
	forceRender(bjRef.current);

	// Animation loop
	while (time <= duration)
	{
		// if (states.current !== bj.States.in_transition) {
        //     console.error("🚨 STATE CHANGED FROM", bj.States.in_transition, "TO", states.current);
        //     // Force it back and continue
        //     states.current = bj.States.in_transition;
        // }
		// console.log("STATES : ", states.current);
		if (!bjRef.current.transitionCamera) break;
		const	alpha = time / duration;
		const	lerpedPosition = smoothStepVector3(cameraA.position.clone(), cameraB.position.clone(), alpha);
		const	lerpedRotation = smoothStepVector3(cameraA.rotation.clone(), cameraB.rotation.clone(), alpha);
		const	lerpedFOV = smoothStep(cameraA.fov, cameraB.fov, alpha);

		bjRef.current.transitionCamera.position.set(lerpedPosition.x, lerpedPosition.y, lerpedPosition.z);
		bjRef.current.transitionCamera.rotation.set(lerpedRotation.x, lerpedRotation.y, lerpedRotation.z);
		bjRef.current.transitionCamera.fov = lerpedFOV;

		const	deltaTime = bjRef.current.engine?.getDeltaTime() ?? 0;
		time += deltaTime;
		await sleep(deltaTime);
	}
	time = 0; // Reset time for next transition

	// Change back to the new camera
	changeCamera(cameraB, bjRef);
	states.current = lastState; // Restore previous state
	// console.log("STATES : ", states.current);
	// console.log("Transition complete");
	bj.updateGUIVisibilityStates(bjRef, states.current);
	return;
}

export const	manageLocalKeyboardInputs = (bjRef: bj.bjStruct): void =>
{
	// Adds or removes the currently pressed keys to the `pressedKeys` set
	bjRef.scene?.onKeyboardObservable.add((kbInfo) =>
	{
		const	key = kbInfo.event.key.toLowerCase();

		if (kbInfo.type === baby.KeyboardEventTypes.KEYDOWN)	bjRef.pressedKeys.add(key);
		else if (kbInfo.type === baby.KeyboardEventTypes.KEYUP)	bjRef.pressedKeys.delete(key);
	});
}

export	const	debugKeys =
(
	bjRef: React.RefObject<bj.bjStruct>,
	states: React.RefObject<bj.States>,
): void => 
{
	if (bjRef.current.debugGUI)
	{
		if (bjRef.current.pressedKeys.has('p'))
		{
			bjRef.current.debugMode = !bjRef.current.debugMode;
			bjRef.current.debugGUI.isVisible = bjRef.current.debugGUI.isEnabled = bjRef.current.debugMode;
			console.debug(`Debug mode: ${bjRef.current.debugMode}`);
			bj.transitionToCamera(bjRef.current.scene?.activeCamera as baby.FreeCamera, bjRef.current.scene?.activeCamera as baby.FreeCamera, 0.1, bjRef, states);
		}
		if (bjRef.current.pressedKeys.has('o') && states.current !== bj.States.in_transition)
		{
			console.debug(`free cam: ${bjRef.current.scene?.activeCamera !== bjRef.current.freeCamera}`);
			if (bjRef.current.scene?.activeCamera === bjRef.current.freeCamera)
			{
				states.current = bj.States.main_menu;
				bj.transitionToCamera(bjRef.current.scene?.activeCamera as baby.FreeCamera, bjRef.current.mainMenuCamera, 1, bjRef, states);
			}
			else
			{
				states.current = bj.States.not_found;
				bj.transitionToCamera(bjRef.current.scene?.activeCamera as baby.FreeCamera, bjRef.current.freeCamera, 1, bjRef, states);
			}
		}
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