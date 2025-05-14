// imports
import React from 'react';
import { useNavigate } from 'react-router-dom';

import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';

export const	instantiateGUI = (pong: React.RefObject<game.pongStruct>): void =>
{
	pong.current.guiTexture = baby.AdvancedDynamicTexture.CreateFullscreenUI("GUI", true, pong.current.scene);
}

export const	initializeAllGUIScreens = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>): void =>
{
	// Initialize the GUI texture
	console.log("initialized GUI texture...");
	game.instantiateGUI(pong);
	console.log("complete initializing GUI texture");
	
	// Initialize all the GUI screens
	console.log("initialized GUI screens...");
	game.instantiateMainMenuGUI(pong, states);
	game.instantiateSettingsGUI(pong, states);
	game.instentiatePongSettingsGUI(pong, states);
	game.instantiateArenaGUI(pong, states);
	game.instantiateDebugGUI(pong, states);
	// etc.
	console.log("complete initializing GUI screens");
}

export const	updateGUIVisibility = (pong: React.RefObject<game.pongStruct>, states: game.states): void =>
{
	const	setUIState = (ui: any, stateToCheck: game.states): void => { if (ui) ui.isEnabled = ui.isVisible = (states === stateToCheck);}
	setUIState(pong.current.mainMenuGUI, game.states.main_menu);
	setUIState(pong.current.settingsGUI, game.states.settings);
	setUIState(pong.current.pongSettingsGUI, game.states.game_settings);
	setUIState(pong.current.arenaGUI, game.states.in_game);
}

export const	updateGUIValues = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>): void =>
{
	if (!pong.current.bindings)
	{
        console.warn("Bindings map is not initialized !");
        return;
    }

    for (const [key, valueOrGetter] of pong.current.bindings.entries())
{
        // Try to find the control by name
        const control = pong.current.guiTexture?.getControlByName(key);
        
        if (control && control instanceof baby.TextBlock)
		{

			if (typeof valueOrGetter === 'function') control.text = String(valueOrGetter());
        }
    }
}

export const    instantiateMainMenuGUI = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>): void =>
{
	// Canvas that will be used for the GUI
	const	mainMenuGUI = game.createStackPanel("mainMenuGUI");

	// All GUI components needed
	const	mainMenuTitle = game.createTitle("mainMenuTitle", "Pong Game");
	const	settingsButton = game.createButton("settingsButton", "Settings", () =>
	{
		states.current = game.states.settings;
		game.forceRender(pong.current);
	});
	const	localPong = game.createButton("localPong", "Play locally", () =>
	{
		states.current = game.states.game_settings;
		game.forceRender(pong.current);
	});
	const	remotePong = game.createButton("remotePong", "Play multiplayer", () =>
	{
		states.current = game.states.not_found;
		game.forceRender(pong.current);
	});


	// Add GUI components to the main menu
	// The order of adding controls matters for the layout
	mainMenuGUI.addControl(mainMenuTitle);
	mainMenuGUI.addControl(settingsButton);
	mainMenuGUI.addControl(localPong);
	mainMenuGUI.addControl(remotePong);

	// Add the screen to the GUI texture
	pong.current.mainMenuGUI = mainMenuGUI;
	pong.current.guiTexture?.addControl(mainMenuGUI);
}

export const    instantiateSettingsGUI = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>): void =>
{
	// Canvas that will be used for the GUI
	const	settingsGUI = game.createStackPanel("settingsGUI");

	// All GUI components needed
	const	settingsMenuTitle = game.createTitle("settingsMenuTitle", "Settings");
	const	backButton = game.createButton("settingsButton", "Back", () =>
	{
		states.current = game.states.main_menu;
		game.forceRender(pong.current);
	});
	const	musicSlider = game.createSlider("musicSlider", 0, 20, 1, 20, (value: number) =>
	{
		console.log("Music volume changed to: ", value);
		game.forceRender(pong.current);
	});
	const	soundSlider = game.createSlider("musicSlider", 0, 20, 1, 20, (value: number) =>
	{
		console.log("Music volume changed to: ", value);
		game.forceRender(pong.current);
	});
	const	musicSliderText = game.createText("musicSliderText", "Music volume");
	const	soundSliderText = game.createText("soundSliderText", "Sound volume");

	// Add GUI components to the main menu
	// The order of adding controls matters for the layout
	settingsGUI.addControl(settingsMenuTitle);
	settingsGUI.addControl(backButton);
	settingsGUI.addControl(musicSliderText);
	settingsGUI.addControl(musicSlider);
	settingsGUI.addControl(soundSliderText);
	settingsGUI.addControl(soundSlider);

	// Add the screen to the GUI texture
	pong.current.settingsGUI = settingsGUI;
	pong.current.guiTexture?.addControl(settingsGUI);
	// updateGUIVisibility(pongGUI, states.current);
}

export const	instentiatePongSettingsGUI = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>): void =>
{
	// Main panel for the entire settings screen
	const	pongSettingsGUI = game.createStackPanel("pongSettingsGUI");

	// Create title and back button
	const	pongSettingsTitle = game.createTitle("pongSettingsTitle", "Pong Settings");
	const	backButton = game.createButton("settingsButton", "Back", () =>
	{
		states.current = game.states.main_menu;
		// pong.current.bindings.set("debugStatesValue", states.current);
		game.forceRender(pong.current);
	});

	// Add these to the main panel
	pongSettingsGUI.addControl(pongSettingsTitle);
	pongSettingsGUI.addControl(backButton);

	// Create the settings panel container with background
	const	settingsPanel = game.createPanel("pongSettingsPanel", "300px", "600px");

	// Get the content panel (this is where we'll add controls)
	const	contentPanel = (settingsPanel as any).contentPanel;

	// Create sliders and text
	const	pongSettingsArenaWidthText = game.createText("pongSettingsArenaWidthText", "Arena width");
	const	pongSettingsArenaWidthTextValue = game.createDynamicText("pongSettingsArenaWidthTextValue", () => pong.current.arenaWidth, pong);
	const	pongSettingsArenaWidth = game.createSlider("pongSettingsArenaWidth", 7, 20, 1, pong.current.arenaWidth, (value: number) =>
	{
		pong.current.arenaWidth = value;
		game.forceRender(pong.current);
	});

	const	pongSettingsArenaHeightText = game.createText("pongSettingsArenaHeightText", "Arena height");
	const	pongSettingsArenaHeightTextValue = game.createDynamicText("pongSettingsArenaHeightTextValue", () => pong.current.arenaHeight, pong);
	const	pongSettingsArenaHeight = game.createSlider("pongSettingsArenaHeight", 7, 20, 1, pong.current.arenaHeight, (value: number) =>
	{
		pong.current.arenaHeight = value;
		game.forceRender(pong.current);
	});


	// Add controls to the content panel (not directly to the container)
	contentPanel.addControl(pongSettingsArenaWidthText);
	contentPanel.addControl(pongSettingsArenaWidthTextValue);
	contentPanel.addControl(pongSettingsArenaWidth);
	contentPanel.addControl(pongSettingsArenaHeightText);
	contentPanel.addControl(pongSettingsArenaHeightTextValue);
	contentPanel.addControl(pongSettingsArenaHeight);

	// Add the entire panel to the main settings GUI
	pongSettingsGUI.addControl(settingsPanel);

	// Save and add to GUI texture
	pong.current.pongSettingsGUI = pongSettingsGUI;
	pong.current.guiTexture?.addControl(pongSettingsGUI);
}

export const    instantiateArenaGUI = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>): void =>
{
	
	// Ensure we have a valid scene and camera
	const camera = pong.current.scene?.activeCamera;
	if (!camera)
	{
		console.error("No active camera found in the scene!");
		return;
	}

	// Canvas that will be used for the GUI
	const	arenaGUI = game.createStackPanel("arenaGUI");


	// Add GUI components to the main menu
	// The order of adding controls matters for the layout
	// arenaGUI.addControl(startButton);
	// arenaGUI.addControl(textBlock);
	// arenaGUI.addControl(button);

	pong.current.arenaGUI = arenaGUI;
	updateGUIVisibility(pong, states.current);
};

export const	instantiateDebugGUI = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>): void =>
{
	const	debugGUI = game.createStackPanel("debugGUI");
			debugGUI.horizontalAlignment = baby.Control.HORIZONTAL_ALIGNMENT_LEFT;
			debugGUI.verticalAlignment = baby.Control.VERTICAL_ALIGNMENT_TOP;
			debugGUI.width = "200px";
			debugGUI.height = "800px";
	const	debugText = game.createTitle("debugText", "Debug Info");
			debugText.fontSize = 24;

	const	debugFramerateText = game.createText("debugFrameRateText", "FPS");
			debugFramerateText.fontSize = 12;
	const	debugFramerateValue = game.createDynamicText("debugFrameRateValue", () => pong.current.engine?.getFps().toFixed(0), pong);

	const	debugStatesText = game.createText("debugStatesText", "Current State");
			debugStatesText.fontSize = 12;
	const	debugStatesValue = game.createDynamicText("debugStatesValue", () => states.current, pong);
			debugStatesValue.fontSize = 12;

	const	debugIncrementStateButton = game.createButton("debugIncrementStateButton", "+", () =>
	{
		states.current++;
		game.forceRender(pong.current);
	});
	const	debugDecrementStateButton = game.createButton("debugDecrementStateButton", "-", () =>
	{
		states.current--;
		game.forceRender(pong.current);
	});
			debugIncrementStateButton.fontSize = 12;
			debugDecrementStateButton.fontSize = 12;
			debugIncrementStateButton.cornerRadius = 10;
			debugDecrementStateButton.cornerRadius = 10;
			debugIncrementStateButton.width = "50px";
			debugDecrementStateButton.width = "50px";
			debugIncrementStateButton.height = "50px";
			debugDecrementStateButton.height = "50px";

	const	debugContainer = game.createStackPanel("debugContainer");
			debugContainer.isVertical = false;
			debugContainer.spacing = 5;
			debugContainer.width = "125px";
			debugContainer.height = "60px";
			debugContainer.horizontalAlignment = baby.Control.HORIZONTAL_ALIGNMENT_CENTER;
			debugContainer.background = game.colorsScheme.dark2;

	// Add GUI components to the debug GUI
	// The order of adding controls matters for the layout
	debugGUI.addControl(debugText);
	debugGUI.addControl(debugStatesText);
	debugGUI.addControl(debugContainer);
	debugGUI.addControl(debugFramerateText);
	debugGUI.addControl(debugFramerateValue);
	debugContainer.addControl(debugIncrementStateButton);
	debugContainer.addControl(debugStatesValue);
	debugContainer.addControl(debugDecrementStateButton);

	// Add the screen to the GUI texture
	pong.current.debugGUI = debugGUI;
	pong.current.guiTexture?.addControl(debugGUI);
}