// imports
import React from 'react';
import { useNavigate } from 'react-router-dom';

import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';

export function fitCameraToArena(pong: game.pongStruct): void
{
	if (!pong.arenaCam || !pong.engine) return;

	// Get canvas size and compute aspect ratio
	const canvasAspect = pong.engine.getRenderWidth() / pong.engine.getRenderHeight();

	// Compute arena aspect ratio
	const arenaAspect = pong.arenaWidth / pong.arenaHeight;

	// Choose the limiting factor: width or height
	// We need to calculate how far the camera needs to be to fit the arena
	let neededViewSize = 0;
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
	const fov = pong.arenaCam.fov; // radians

	// Calculate required camera height to fit `neededViewSize` vertically
	const requiredY = (neededViewSize / 2) / Math.tan(fov / 2);

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

export const	createButton = (buttonName: string, buttonText: string, functionToExecute: () => void): baby.StackPanel =>
{
	const block = game.createDummyBlock();
	const button = baby.Button.CreateSimpleButton(buttonName, buttonText);
	button.width = "200px";
	button.height = "100px";
	button.color = game.colorsScheme.light1;
	button.background = game.colorsScheme.dark1
	button.fontSize = 24;
	button.thickness = 0;
	button.cornerRadius = 20;
	setPaddings(button, "10px");

	// button.onPointerUpObservable.add(functionToExecute);
	button.onPointerClickObservable.add(functionToExecute);
	button.onPointerEnterObservable.add(() => {
		button.color = game.colorsScheme.auroraAccent1;
		button.background = game.colorsScheme.light3;
	});
	button.onPointerOutObservable.add(() => {
		button.color = game.colorsScheme.light3;
		button.background = game.colorsScheme.dark1;
	});

	block.addControl(button);
	return block;
}

export const	createSlider = (sliderName: string, minValue: number, maxValue: number, step: number, initialValue: number, functionToExecute: (value: number) => void): baby.StackPanel =>
{
	const	block = game.createDummyBlock();

	const	slider = new baby.Slider(sliderName);
	slider.color = game.colorsScheme.light1;
	slider.background = game.colorsScheme.dark1;
	slider.thumbColor = game.colorsScheme.auroraAccent1;
	slider.borderColor = game.colorsScheme.auroraAccent1;
	slider.thumbWidth = 20;
	slider.isThumbCircle = true;
	slider.displayThumb = true;

	slider.minimum = minValue;
	slider.maximum = maxValue;
	slider.value = initialValue;
	slider.step = step;
	slider.width = "200px";
	slider.height = "20px";
	slider.horizontalAlignment = baby.Control.HORIZONTAL_ALIGNMENT_CENTER;
	slider.verticalAlignment = baby.Control.VERTICAL_ALIGNMENT_CENTER;
	slider.onValueChangedObservable.add(functionToExecute);

	block.addControl(slider);
	return block;
}

export const	createTitle = (titleName: string, titleText: string): baby.StackPanel =>
{
	const	block = game.createDummyBlock();
	const	title = new baby.TextBlock(titleName, titleText);
	title.width = "50px";
	title.height = "25px";
	title.color = game.colorsScheme.light1;
	title.resizeToFit = true;
	title.fontSize = 48;

	block.addControl(title);
	return block;
}

export const	createText = (textName: string, textText: string): baby.StackPanel =>
{
	const	block = game.createDummyBlock();
	const	text = new baby.TextBlock(textName, textText);
	text.color = game.colorsScheme.light1;
	text.resizeToFit = true;
	text.fontSize = 24;

	block.addControl(text);
	return block;
}

export const	createDynamicText = (textName: string, valueGetter: () => any, bindings: React.RefObject<game.pongStruct>): baby.StackPanel =>
{
	const	block = game.createDummyBlock();
	const	text = new baby.TextBlock(textName, String(valueGetter()));
	text.width = "50px";
	text.height = "25px";
	text.color = game.colorsScheme.light1;
	text.resizeToFit = true;
	text.fontSize = 24;

	// Bind the text to the value in the bindings map
	bindings.current.bindings.set(textName, valueGetter);

	block.addControl(text);
	return block;
}

export const	createAdaptiveContainer = (folderName: string, width?: string, height?: string, BackgroundColor?: string, alignment?: string): baby.Container =>
{
	width = width ?? "100%";
	height = height ?? "100%";
	BackgroundColor = BackgroundColor ?? game.colorsScheme.dark2;

	// Create a container with FIXED dimensions
	const container = new baby.Container(folderName + "Container");
	container.width = width;
	container.height = height;
	container.adaptWidthToChildren = true;
    container.adaptHeightToChildren = true;
	container.horizontalAlignment = baby.Control.HORIZONTAL_ALIGNMENT_CENTER;
	container.verticalAlignment = baby.Control.VERTICAL_ALIGNMENT_CENTER;
	container.background = "transparent";
	container.zIndex = 0;

	// Create background with FIXED dimensions
	const background = new baby.Rectangle(folderName + "Background");
	background.width = "100%";
	background.height = "100%";
	background.background = BackgroundColor;
	background.thickness = 0;
	background.cornerRadius = 20;
	background.zIndex = 0;
		
	container.addControl(background);

	setAlignment(container, alignment);

	return container;
}

export const	createHorizontalStackPanel = (panelName: string, paddings?: number, alignment?: string): baby.StackPanel =>
{
	paddings = paddings ?? 5;
	const	GUI = new baby.StackPanel(panelName);
	GUI.isVertical = false;
	GUI.spacing = paddings;
	GUI.paddingTop = paddings * 2 + "px";
	GUI.paddingBottom = paddings * 2 + "px";
	GUI.paddingLeft = paddings * 2 + "px";
	GUI.paddingRight = paddings * 2 + "px";
	// GUI.width = "parent";
	// GUI.height = "parent";
	GUI.adaptWidthToChildren = true;
	GUI.adaptHeightToChildren = true;
	GUI.horizontalAlignment = baby.Control.HORIZONTAL_ALIGNMENT_CENTER;
	GUI.verticalAlignment = baby.Control.VERTICAL_ALIGNMENT_CENTER;
	GUI.background = "transparent";
	GUI.zIndex = 1;

	setAlignment(GUI, alignment);

	return GUI;
}

export const	createVerticalStackPanel = (panelName: string, paddings?: number, alignment?: string): baby.StackPanel =>
{
	paddings = paddings ?? 5;
	const	GUI = new baby.StackPanel(panelName);
	GUI.isVertical = true;
	GUI.spacing = paddings;
	GUI.paddingTop = paddings * 2 + "px";
	GUI.paddingBottom = paddings * 2 + "px";
	GUI.paddingLeft = paddings * 2 + "px";
	GUI.paddingRight = paddings * 2 + "px";
	// GUI.width = "parent";
	// GUI.height = "parent";
	GUI.adaptWidthToChildren = true;
	GUI.adaptHeightToChildren = true;
	GUI.horizontalAlignment = baby.Control.HORIZONTAL_ALIGNMENT_CENTER;
	GUI.verticalAlignment = baby.Control.VERTICAL_ALIGNMENT_CENTER;
	GUI.background = "transparent";
	GUI.zIndex = 1;
	
	setAlignment(GUI, alignment);

	return GUI;
}

export const	createDummyBlock = (): baby.StackPanel =>
{
	const	dummy = new baby.StackPanel("dummy-" + Math.random());

	dummy.spacing = 0;
	dummy.paddingTop = 0;
	dummy.paddingBottom = 0;
	dummy.paddingLeft = 0;
	dummy.paddingRight = 0;
	dummy.adaptWidthToChildren = true;
	dummy.adaptHeightToChildren = true;
	dummy.horizontalAlignment = baby.Control.HORIZONTAL_ALIGNMENT_CENTER;
	dummy.verticalAlignment = baby.Control.VERTICAL_ALIGNMENT_CENTER;
	dummy.background = "transparent";
	dummy.zIndex = 1;

	return dummy;
}

export const	createScreen = (screenName: string, alignment?: string): baby.Rectangle =>
{
	const	screen = new baby.Rectangle(screenName);
	screen.width = "100%";
	screen.height = "100%";
	screen.background = "transparent";
	screen.isPointerBlocker = false;
	screen.thickness = 1;

	setAlignment(screen, alignment);

	return screen;
}

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
	console.log("Camera changed to: ", newCamera.name);
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
	
	// Use Babylon's built-in lerp with our smoothed alpha
	return game.lerp(start, end, alpha);
}

let		time: number = 0;
export const	transitionToCamera = async (cameraA: baby.FreeCamera | undefined, cameraB: baby.FreeCamera | undefined, duration: number, pong: React.RefObject<game.pongStruct>): Promise<void> =>
{
	if (cameraA === undefined || cameraB === undefined || !pong.current) return;
	duration *= 1000;	// Convert to milliseconds

	// Set transitionCam to A
	pong.current.transitionCam?.position.copyFrom(cameraA.position);
	pong.current.transitionCam?.rotation.copyFrom(cameraA.rotation);

	// Set transitionCam as the current active camera
	if (pong.current.scene?.activeCamera?.name !== pong.current.transitionCam?.name)
		changeCamera(pong.current.transitionCam, pong);
	forceRender(pong.current);
	
	// Animation loop
	while (time <= duration)
	{
		const	lerpedPosition = smoothStepVector3(cameraA.position.clone(), cameraB.position.clone(), time / duration);
		const	lerpedRotation = smoothStepVector3(cameraA.rotation.clone(), cameraB.rotation.clone(), time / duration);
		const	lerpedFOV = smoothStep(cameraA.fov, cameraB.fov, time / duration);
		pong.current.transitionCam?.position.set(lerpedPosition.x, lerpedPosition.y, lerpedPosition.z);
		pong.current.transitionCam?.rotation.set(lerpedRotation.x, lerpedRotation.y, lerpedRotation.z);
		const	deltaTime = pong.current.engine?.getDeltaTime() ?? 0;
		time += deltaTime;
		await sleep(deltaTime);
	}

	// Change back to the new camera
	changeCamera(cameraB, pong);

	return;
}