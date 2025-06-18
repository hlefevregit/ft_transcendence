import React from 'react';

import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';



export const	createButton =
(buttonName: string,
	buttonText: string,
	functionToExecute: () => void,
	pong: React.RefObject<game.pongStruct>
): baby.StackPanel =>
{
	const	block = game.createDummyBlock();
	const	button = baby.Button.CreateSimpleButton(buttonName, buttonText);
			button.width = "200px";
			button.height = "100px";
			button.color = game.colorsScheme.light1;
			button.background = game.colorsScheme.dark1
			button.fontSize = 24;
			button.thickness = 0;
			button.cornerRadius = 20;
			button.onPointerClickObservable.add(functionToExecute);
			
			button.onPointerEnterObservable.add(() =>
			{
				button.color = game.colorsScheme.auroraAccent1;
				button.background = game.colorsScheme.light3;
				pong.current.isButtonHovered = true;
			});
			button.onPointerOutObservable.add(() =>
			{
				button.color = game.colorsScheme.light3;
				button.background = game.colorsScheme.dark1;
				pong.current.isButtonHovered = false;
			});

	game.setPaddings(button, "10px");
	block.addControl(button);
	return block;
}

export const	createSlider =
(
	sliderName: string,
	minValue: number,
	maxValue: number,
	step: number,
	initialValue: number,
	functionToExecute: (value: number) => void
): baby.StackPanel =>
{
	const	block = game.createDummyBlock();

	const	slider = new baby.Slider(sliderName);
	slider.color = game.colorsScheme.light1;
	slider.background = game.colorsScheme.dark1;
	slider.thumbColor = game.colorsScheme.auroraAccent1;
	slider.borderColor = game.colorsScheme.auroraAccent1;
	slider.thumbWidth = 10;
	slider.isThumbCircle = true;
	slider.displayThumb = true;
	slider.isThumbClamped = true;

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

export const	createTitle =
(
	titleName: string,
	titleText: string
): baby.StackPanel =>
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

export const	createText =
(
	textName: string,
	textText: string
): baby.StackPanel =>
{
	const	block = game.createDummyBlock();
	const	text = new baby.TextBlock(textName, textText);
	text.color = game.colorsScheme.light1;
	text.resizeToFit = true;
	text.fontSize = 24;

	block.addControl(text);
	return block;
}

export const	createAdaptiveContainer =
(
	folderName: string,
	width?: string,
	height?: string,
	BackgroundColor?: string,
	alignment?: string
): baby.Container =>
{
	width = width ?? "100%";
	height = height ?? "100%";
	BackgroundColor = BackgroundColor ?? game.colorsScheme.dark2;

	// Create container
	const	container = new baby.Container(folderName + "Container");
			container.width = width;
			container.height = height;
			container.adaptWidthToChildren = true;
			container.adaptHeightToChildren = true;
			container.horizontalAlignment = baby.Control.HORIZONTAL_ALIGNMENT_CENTER;
			container.verticalAlignment = baby.Control.VERTICAL_ALIGNMENT_CENTER;
			container.background = "transparent";
			container.zIndex = 0;

	// Create background with dimensions tied to the container
	const	background = new baby.Rectangle(folderName + "Background");
			background.width = "100%";
			background.height = "100%";
			background.background = BackgroundColor;
			background.thickness = 0;
			background.cornerRadius = 40;
			background.zIndex = 0;
		
	game.setAlignment(container, alignment);
	container.addControl(background);
	return container;
}

export const	createHorizontalStackPanel =
(
	panelName: string,
	paddings?: number,
	alignment?: string
): baby.StackPanel =>
{
	paddings = paddings ?? 5;
	const	GUI = new baby.StackPanel(panelName);
			GUI.isVertical = false;
			GUI.spacing = paddings;
			GUI.paddingTop = paddings * 2 + "px";
			GUI.paddingBottom = paddings * 2 + "px";
			GUI.paddingLeft = paddings * 2 + "px";
			GUI.paddingRight = paddings * 2 + "px";
			GUI.adaptWidthToChildren = true;
			GUI.adaptHeightToChildren = true;
			GUI.horizontalAlignment = baby.Control.HORIZONTAL_ALIGNMENT_CENTER;
			GUI.verticalAlignment = baby.Control.VERTICAL_ALIGNMENT_CENTER;
			GUI.background = "transparent";
			GUI.zIndex = 1;

	game.setAlignment(GUI, alignment);
	return GUI;
}

export const	createVerticalStackPanel =
(
	panelName: string,
	paddings?: number,
	alignment?: string
): baby.StackPanel =>
{
	paddings = paddings ?? 5;
	const	GUI = new baby.StackPanel(panelName);
			GUI.isVertical = true;
			GUI.spacing = paddings;
			GUI.paddingTop = paddings * 2 + "px";
			GUI.paddingBottom = paddings * 2 + "px";
			GUI.paddingLeft = paddings * 2 + "px";
			GUI.paddingRight = paddings * 2 + "px";
			GUI.adaptWidthToChildren = true;
			GUI.adaptHeightToChildren = true;
			GUI.horizontalAlignment = baby.Control.HORIZONTAL_ALIGNMENT_CENTER;
			GUI.verticalAlignment = baby.Control.VERTICAL_ALIGNMENT_CENTER;
			GUI.background = "transparent";
			GUI.zIndex = 1;
	
	game.setAlignment(GUI, alignment);
	return GUI;
}

export const	createDummyBlock = (): baby.StackPanel =>
{
	const	dummy = new baby.StackPanel("dummy-" + Math.random().toString(36).substring(2, 15));
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

export const	createScreen =
(
	screenName: string,
	alignment?: string
): baby.Rectangle =>
{
	const	screen = new baby.Rectangle(screenName);
	screen.width = "100%";
	screen.height = "100%";
	screen.background = "transparent";
	screen.isPointerBlocker = false;
	screen.thickness = 1;

	game.setAlignment(screen, alignment);

	return screen;
}

export const createRoomPanel =
(
	pong: React.RefObject<game.pongStruct>,
	lang: React.RefObject<game.lang>,
	roomName: string,
	join: () => void,
): baby.StackPanel =>
{
	const	safeRoomName = roomName || "Unnamed Room";
	const	panelName = `roomPanel_${safeRoomName.replace(/\s+/g, '_')}_${Math.random().toString(36).substring(2)}`;
	const	roomPanel = game.createHorizontalStackPanel(panelName, 0);

	const	roomPanelNameText = game.createText("roomPanelNameText", safeRoomName);
			(roomPanelNameText.children[0] as baby.TextBlock).fontSize = 48;

	const	roomPanelJoinButton = game.createDynamicButton
	(
		"roomPanelJoinButton",
		join,
		pong,
		"join"
	);

	
	// console.log("✅ Panel créé pour room:", safeRoomName, "| name =", roomPanel.name);
	
	roomPanel.addControl(roomPanelNameText);
	roomPanel.addControl(roomPanelJoinButton);
	return roomPanel;
};

export const	createDynamicText =
(
	textName: string,
	labelKey?: game.labelKey
): baby.StackPanel =>
{
	const	block = game.createDummyBlock();
	
	// Use the provided labelKey if available, otherwise use textName
	const	keyToUse = labelKey || textName as game.labelKey;
	
	// Create the text with initial value
	const	text = new baby.TextBlock(textName, "caca");
	text.color = game.colorsScheme.light1;
	text.resizeToFit = true;
	text.fontSize = 24;
	
	// Store the label key in metadata for language updates
	text.metadata = { labelKey: keyToUse };
	
	block.addControl(text);
	return block;
}

export const	createDynamicTitle =
(
	titleName: string,
	labelKey?: game.labelKey
): baby.StackPanel =>
{
	const	block = game.createDummyBlock();
	
	// Use the provided labelKey if available, otherwise use titleName
	const	keyToUse = labelKey || titleName as game.labelKey;
	
	// Create the title with initial value
	const	title = new baby.TextBlock(titleName, "caca");
			title.width = "50px";
			title.height = "25px";
			title.color = game.colorsScheme.light1;
			title.resizeToFit = true;
			title.fontSize = 48;
			title.metadata = { labelKey: keyToUse };	// Store the label key in metadata for language updates
	
	block.addControl(title);
	return block;
}

export const	createDynamicButton =
(
	buttonName: string,
	functionToExecute: () => void,
	pong: React.RefObject<game.pongStruct>,
	labelKey?: game.labelKey
): baby.StackPanel =>
{
	const	block = game.createDummyBlock();
	
	// Use the provided labelKey if available, otherwise use buttonName
	const	keyToUse = labelKey || buttonName as game.labelKey;
	
	// Create the button with initial text value
	const	button = baby.Button.CreateSimpleButton(buttonName, "caca");
			button.width = "200px";
			button.height = "100px";
			button.color = game.colorsScheme.light1;
			button.background = game.colorsScheme.dark1;
			button.fontSize = 24;
			button.thickness = 0;
			button.cornerRadius = 20;
			button.metadata = { labelKey: keyToUse };	// Store the label key in button's metadata for language updates
	
			// Add button functionality
			button.onPointerClickObservable.add(functionToExecute);
			button.onPointerEnterObservable.add(() =>
			{
				button.color = game.colorsScheme.auroraAccent1;
				button.background = game.colorsScheme.light3;
				pong.current.isButtonHovered = true;
			});
			button.onPointerOutObservable.add(() =>
			{
				button.color = game.colorsScheme.light3;
				button.background = game.colorsScheme.dark1;
				pong.current.isButtonHovered = false;
			});




	game.setPaddings(button, "10px");
	block.addControl(button);
	return block;
}

export const	createCard =
(
	cardName: string,
	cardText: string
): baby.StackPanel =>
{
	const	block = game.createDummyBlock();
	const	container = new baby.Container(cardName + "Container");
			container.width = "200px";
			container.height = "60px";
			container.horizontalAlignment = baby.Control.HORIZONTAL_ALIGNMENT_CENTER;
			container.verticalAlignment = baby.Control.VERTICAL_ALIGNMENT_CENTER;
			container.background = "transparent";

	const	cardBackground = new baby.Rectangle(cardName + "Background");
			cardBackground.width = "100%";
			cardBackground.height = "100%";
			cardBackground.background = game.colorsScheme.dark3;
			cardBackground.color = "transparent";
			cardBackground.cornerRadius = 20;
			cardBackground.thickness = 2;
			cardBackground.zIndex = 0;

	const	cardLabel = createText(cardName + "Label", cardText);

	container.addControl(cardBackground);
	container.addControl(cardLabel);
	block.addControl(container);
	return block;
}

export const	createLine =
(
	x1: string,
	y1: string,
	x2: string,
	y2: string
): baby.Container =>
{
	const	thickness: number = 6;
	const	color: string = game.colorsScheme.light1;

	const	x1Num = parseFloat(x1);
	const	y1Num = parseFloat(y1);
	const	x2Num = parseFloat(x2);
	const	y2Num = parseFloat(y2);

	const	container = new baby.Container("lineContainer-" + Math.random().toString(36).substring(2, 15));

	// Create a line between two points
	const	line = new baby.Line("line-" + Math.random().toString(36).substring(2, 15));
			line.x1 = x1Num;
			line.y1 = y1Num;

			line.x2 = x2Num;
			line.y2 = y2Num;

			line.color = color;
			line.lineWidth = thickness;
			line.zIndex = 1;
	
	// Create spheres at the start and end of the line for rounding

	const	sphereStart = new baby.Ellipse("sphereStart-" + Math.random().toString(36).substring(2, 15));
			sphereStart.width = thickness + "px";
			sphereStart.height = thickness + "px";
			sphereStart.background = color;
			sphereStart.horizontalAlignment = baby.Control.HORIZONTAL_ALIGNMENT_LEFT;
			sphereStart.verticalAlignment = baby.Control.VERTICAL_ALIGNMENT_TOP;
			sphereStart.thickness = 0;
			sphereStart.zIndex = 1;
			sphereStart.left = x1Num - (thickness / 2) + "px";
			sphereStart.top = y1Num - (thickness / 2) + "px";
			sphereStart.zIndex = 1;
	const	sphereEnd = new baby.Ellipse("sphereEnd-" + Math.random().toString(36).substring(2, 15));
			sphereEnd.width = thickness + "px";
			sphereEnd.height = thickness + "px";
			sphereEnd.background = color;
			sphereEnd.horizontalAlignment = baby.Control.HORIZONTAL_ALIGNMENT_LEFT;
			sphereEnd.verticalAlignment = baby.Control.VERTICAL_ALIGNMENT_TOP;
			sphereEnd.thickness = 0;
			sphereEnd.zIndex = 1;
			sphereEnd.left = x2Num - (thickness / 2) + "px";
			sphereEnd.top = y2Num - (thickness / 2) + "px";
			sphereEnd.zIndex = 1;

	container.addControl(line);
	container.addControl(sphereStart);
	container.addControl(sphereEnd);
	return container;
}

export const	createBracketLines = (bracketName: string): baby.StackPanel =>
{
	const	block = game.createDummyBlock();
			block.top = "24px";
	const	container = new baby.Container(bracketName + "Container");
			container.width = "100px";
			container.height = "365px";
			container.background = "transparent";

	const	verticalLine1 = createLine("50px", "30px", "50px", "130px");
	const	verticalLine2 = createLine("50px", "230px", "50px", "335px");

	const	horizontalLine1 = createLine("5px", "30px", "50px", "30px");
	const	horizontalLine2 = createLine("5px", "130px", "95px", "130px");

	const	horizontalLine3 = createLine("5px", "230px", "95px", "230px");
	const	horizontalLine4 = createLine("5px", "335px", "50px", "335px");

	container.addControl(verticalLine1);
	container.addControl(verticalLine2);

	container.addControl(horizontalLine1);
	container.addControl(horizontalLine2);
	container.addControl(horizontalLine3);
	container.addControl(horizontalLine4);

	block.addControl(container);
	return block;
}

export const	createBracketLines2 = (bracketName: string): baby.StackPanel =>
{
	const	block = game.createDummyBlock();
			block.top = "20px";
	const	container = new baby.Container(bracketName + "Container");
			container.width = "100px";
			container.height = "200px";
			container.background = "transparent";

	const	verticalLine1 = createLine("50px", "50px", "50px", "150px");

	const	horizontalLine1 = createLine("5px", "50px", "50px", "50px");
	const	horizontalLine2 = createLine("5px", "150px", "50px", "150px");
	const	horizontalLine3 = createLine("50px", "100px", "95px", "100px");

	container.addControl(verticalLine1);

	container.addControl(horizontalLine1);
	container.addControl(horizontalLine2);
	container.addControl(horizontalLine3);

	block.addControl(container);
	return block;
}

export const	createSpacer =
(
	witdh: number,
	height: number
): baby.StackPanel =>
{
	const	block = game.createDummyBlock();

	const	container = new baby.Container("container-" + Math.random().toString(36).substring(2, 15));
			container.width = witdh + "px";
			container.height = height + "px";
			container.horizontalAlignment = baby.Control.HORIZONTAL_ALIGNMENT_CENTER;
			container.verticalAlignment = baby.Control.VERTICAL_ALIGNMENT_CENTER;
			container.background = "transparent";
			container.zIndex = 0;

	block.addControl(container);
	return block;
}

export const	createInputText =
(
	inputName: string,
	initialValue: string,
	onChange: (value: string) => void
): baby.StackPanel =>
{
	const	block = game.createDummyBlock();
	
	// Create a container for the rounded background
	const	container = new baby.Container(inputName + "Container");
			container.width = "200px";
			container.height = "40px";
			container.horizontalAlignment = baby.Control.HORIZONTAL_ALIGNMENT_CENTER;
			container.verticalAlignment = baby.Control.VERTICAL_ALIGNMENT_CENTER;
	
	// Create rounded background rectangle
	const	background = new baby.Rectangle(inputName + "Background");
			background.width = "100%";
			background.height = "100%";
			background.background = game.colorsScheme.dark1;
			background.thickness = 0;
			background.cornerRadius = 20; // This gives you rounded corners
	
	// Create the input text
	const	input = new baby.InputText(inputName);
			input.text = initialValue;
			input.width = "100%";
			input.height = "100%";
			input.color = game.colorsScheme.light1;
			input.background = "transparent"; // Make input background transparent
			input.focusedBackground = "transparent"; // Keep transparent on focus
			input.fontSize = 24;
			input.thickness = 0;
			input.paddingLeft = "10px";
			input.paddingRight = "10px";

			// Handle focus states by changing the background rectangle
			input.onFocusObservable.add(() =>
			{
				background.background = game.colorsScheme.dark3;
			});
			
			input.onBlurObservable.add(() =>
			{
				background.background = game.colorsScheme.dark1;
			});

			input.onTextChangedObservable.add(() =>
			{
				const	value = input.text.trim();
				if (value.length > 0) onChange(value);
				else onChange("Unnamed");
			});
			input.onPointerOutObservable.add(() =>
			{
				const	value = input.text.trim();
				if (value.length > 0) onChange(value);
				else onChange("Unnamed");
			});
			input.onPointerEnterObservable.add(() =>
			{
				const	value = input.text.trim();
				if (value.length > 0) onChange(value);
				else onChange("Unnamed");
			});

	// Add background first, then input on top
	container.addControl(background);
	container.addControl(input);
	block.addControl(container);
	return block;
}