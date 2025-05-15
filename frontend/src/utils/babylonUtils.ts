// imports
import React from 'react';
import { useNavigate } from 'react-router-dom';

import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';
import { on } from 'events';

export function fitCameraToArena(pong: game.pongStruct): void
{
	if (!pong.camera || !pong.engine) return;

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
	const fov = pong.camera.fov; // radians

	// Calculate required camera height to fit `neededViewSize` vertically
	const requiredY = (neededViewSize / 2) / Math.tan(fov / 2);

	// Set the camera height
	pong.camera.position.y = requiredY * 2.11111111;

	// Always look at the center
	pong.camera.setTarget(baby.Vector3.Zero());
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

// export const	addControlToDummy = (dummy: baby.StackPanel, control: baby.Control): baby.Container =>
// {
// 	if (!dummy || !control) return;

// 	// Add the control to the dummy
// 	dummy.addControl(control);

// 	// // Set the dummy's width and height to fit the control
// 	// dummy.width = control.width;
// 	// dummy.height = control.height;

// 	// // Set the dummy's position to be centered
// 	// dummy.horizontalAlignment = baby.Control.HORIZONTAL_ALIGNMENT_CENTER;
// 	// dummy.verticalAlignment = baby.Control.VERTICAL_ALIGNMENT_CENTER;

// 	return dummy;
// }

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



export const	forceRender = (pong: game.pongStruct):void => {
  if (pong.scene) {
    pong.scene.render();
  }
};

