// imports
import React from 'react';
import { useNavigate } from 'react-router-dom';

import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';

export function fitCameraToArena(pong: game.pongGameRef): void
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

export const	createButton = (buttonName: string, buttonText: string, functionToExecute: () => void): baby.Button =>
{
	const button = baby.Button.CreateSimpleButton(buttonName, buttonText);
	button.width = "200px";
	button.height = "100px";
	button.color = game.colorsScheme.light1;
	button.background = game.colorsScheme.dark1
	button.fontSize = 24;
	// button.horizontalAlignment = baby.Control.HORIZONTAL_ALIGNMENT_CENTER;
	// button.verticalAlignment = baby.Control.VERTICAL_ALIGNMENT_CENTER;
	button.thickness = 0;
	button.cornerRadius = 20;
	setPaddings(button, "10px");

	button.onPointerUpObservable.add(functionToExecute);

	return button;
}

export const	createSlider = (sliderName: string, minValue: number, maxValue: number, step: number, initialValue: number, functionToExecute: (value: number) => void): baby.Slider =>
{
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


	return slider;
}

export const	createTitle = (titleName: string, titleText: string): baby.TextBlock =>
{
	const	title = new baby.TextBlock(titleName, titleText);
	title.width = "50px";
	title.height = "25px";
	title.color = game.colorsScheme.light1;
	title.resizeToFit = true;
	title.fontSize = 48;

	return title;
}

export const	createText = (textName: string, textText: string): baby.TextBlock =>
{
	const	text = new baby.TextBlock(textName, textText);
	text.width = "50px";
	text.height = "25px";
	text.color = game.colorsScheme.light1;
	text.resizeToFit = true;
	text.fontSize = 24;

	return text;
}

export const	createStackPanel = (panelName: string): baby.StackPanel =>
{
	const	GUI = new baby.StackPanel(panelName);
	GUI.width = "100%";
	GUI.height = "100%";
	GUI.horizontalAlignment = baby.Control.HORIZONTAL_ALIGNMENT_CENTER;
	GUI.verticalAlignment = baby.Control.VERTICAL_ALIGNMENT_CENTER;
	GUI.background = "transparent";

	return GUI;
}

export const	createValueText = (textName: string, textValue: string): baby.TextBlock =>
{
	const	text = new baby.TextBlock(textName, textValue);
	text.width = "50px";
	text.height = "25px";
	text.color = game.colorsScheme.light1;
	text.resizeToFit = true;
	text.fontSize = 24;
	text.horizontalAlignment = baby.Control.HORIZONTAL_ALIGNMENT_LEFT;
	text.verticalAlignment = baby.Control.VERTICAL_ALIGNMENT_CENTER;

	return text;
}

export const	createPanel = (folderName: string, width: string, height: string): baby.Container =>
{
	// Create a container to hold both the background and content
	const container = new baby.Container(folderName + "Container");
	container.width = width;
	container.height = height;
	container.horizontalAlignment = baby.Control.HORIZONTAL_ALIGNMENT_CENTER;
	container.verticalAlignment = baby.Control.VERTICAL_ALIGNMENT_CENTER;

	// Create background rectangle and add it FIRST
	const background = new baby.Rectangle(folderName + "Background");
	background.width = "100%";
	background.height = "100%";
	background.background = game.colorsScheme.dark2; 
	background.thickness = 0;
	background.cornerRadius = 20;

	// Create content panel for items that should appear above background
	const contentPanel = new baby.StackPanel(folderName + "Content");
	contentPanel.width = "100%";
	contentPanel.height = "100%";
	contentPanel.background = "transparent";

	// Add background FIRST, then the content panel
	container.addControl(background);
	container.addControl(contentPanel);

	// Store content panel as a property for easy access
	(container as any).contentPanel = contentPanel;

	return container;
}

export const	forceRender = (pong: game.pongGameRef):void => {
  if (pong.scene) {
    pong.scene.render();
  }
};