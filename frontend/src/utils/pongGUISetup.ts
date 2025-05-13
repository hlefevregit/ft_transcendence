// imports
import React from 'react';
import { useNavigate } from 'react-router-dom';

import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';

export const	instantiateGUI = (pongGUI: React.RefObject<game.pongGUIRef>, pong: game.pongGameRef): void =>
{
	pongGUI.current.guiTexture = baby.AdvancedDynamicTexture.CreateFullscreenUI("GUI", true, pong.scene);
}

export const	initializeAllGUIScreens = (pongGUI: React.RefObject<game.pongGUIRef>, pong: game.pongGameRef, states: React.RefObject<game.states>): void =>
{
	// Initialize the GUI texture
	console.log("initialized GUI texture...");
	game.instantiateGUI(pongGUI, pong);
	console.log("complete initializing GUI texture");
	
	// Initialize all the GUI screens
	console.log("initialized GUI screens...");
	game.instantiateMainMenuGUI(pongGUI.current, pong, states);
	game.instantiateSettingsGUI(pongGUI.current, pong, states);
	game.instentiatePongSettingsGUI(pongGUI.current, pong, states);
	game.instantiateArenaGUI(pongGUI.current, pong, states);
	// etc.
	console.log("complete initializing GUI screens");
}


export const	updateGUIVisibility = (pongGUI: game.pongGUIRef, states: game.states): void =>
{
	// console.log("updateGUIVisibility called with states: ", states);
	// Update main menu visibility
	if (pongGUI.mainMenuGUI) pongGUI.mainMenuGUI.isVisible = (states === game.states.main_menu);
	if (pongGUI.settingsGUI) pongGUI.settingsGUI.isVisible = (states === game.states.settings);
	if (pongGUI.pongSettingsGUI) pongGUI.pongSettingsGUI.isVisible = (states === game.states.game_settings);
	if (pongGUI.arenaGUI) pongGUI.arenaGUI.isVisible = (states === game.states.in_game);
	// etc. for other screens
}

export const    instantiateMainMenuGUI = (pongGUI: game.pongGUIRef, pong: game.pongGameRef, states: React.RefObject<game.states>): void =>
{
	// Canvas that will be used for the GUI
	const	mainMenuGUI = game.createStackPanel("mainMenuGUI");

	// All GUI components needed
	const	mainMenuTitle = game.createTitle("mainMenuTitle", "Pong Game");
	const	settingsButton = game.createButton("settingsButton", "Settings", () =>
	{
		states.current = game.states.settings;
		game.forceRender(pong);
	});
	const	localPong = game.createButton("localPong", "Play locally", () =>
	{
		states.current = game.states.game_settings;
		game.forceRender(pong);
	});
	const	remotePong = game.createButton("remotePong", "Play multiplayer", () =>
	{
		states.current = game.states.not_found;
		game.forceRender(pong);
	});


	// Add GUI components to the main menu
	// The order of adding controls matters for the layout
	mainMenuGUI.addControl(mainMenuTitle);
	mainMenuGUI.addControl(settingsButton);
	mainMenuGUI.addControl(localPong);
	mainMenuGUI.addControl(remotePong);

	// Add the screen to the GUI texture
	pongGUI.mainMenuGUI = mainMenuGUI;
	pongGUI.guiTexture?.addControl(mainMenuGUI);
}

export const    instantiateSettingsGUI = (pongGUI: game.pongGUIRef, pong: game.pongGameRef, states: React.RefObject<game.states>): void =>
{
	// Canvas that will be used for the GUI
	const	settingsGUI = game.createStackPanel("settingsGUI");

	// All GUI components needed
	const	settingsMenuTitle = game.createTitle("settingsMenuTitle", "Settings");
	const	backButton = game.createButton("settingsButton", "Back", () =>
	{
		states.current = game.states.main_menu;
		game.forceRender(pong);
	});
	const	musicSlider = game.createSlider("musicSlider", 0, 20, 1, 20, (value: number) =>
	{
		console.log("Music volume changed to: ", value);
		// state.current = game.states.settings;
		game.forceRender(pong);
	});
	const	soundSlider = game.createSlider("musicSlider", 0, 20, 1, 20, (value: number) =>
	{
		console.log("Music volume changed to: ", value);
		// state.current = game.states.settings;
		game.forceRender(pong);
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
	pongGUI.settingsGUI = settingsGUI;
	pongGUI.guiTexture?.addControl(settingsGUI);
	// updateGUIVisibility(pongGUI, states.current);
}

export const	instentiatePongSettingsGUI = (pongGUI: game.pongGUIRef, pong: game.pongGameRef, states: React.RefObject<game.states>): void =>
{
	// Main panel for the entire settings screen
	const	pongSettingsGUI = game.createStackPanel("pongSettingsGUI");

	// Create title and back button
	const	pongSettingsTitle = game.createTitle("pongSettingsTitle", "Pong Settings");
	const	backButton = game.createButton("settingsButton", "Back", () =>
	{
		states.current = game.states.main_menu;
		game.forceRender(pong);
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
	const	pongSettingsArenaWidthTextValue = game.createValueText("pongSettingsArenaWidthTextValue", pong.arenaWidth.toString());
	const	pongSettingsArenaWidth = game.createSlider("pongSettingsArenaWidth", 0, 20, 1, 20, (value: number) =>
	{
		pong.arenaWidth = value;
		console.log("Arena width changed to: ", value);
		pongSettingsArenaWidthTextValue.text = value.toString();
		game.forceRender(pong);
	});

	const	pongSettingsArenaHeightText = game.createText("pongSettingsArenaHeightText", "Arena height");
	const	pongSettingsArenaHeightTextValue = game.createValueText("pongSettingsArenaHeightTextValue", pong.arenaHeight.toString());
	const	pongSettingsArenaHeight = game.createSlider("pongSettingsArenaHeight", 0, 20, 1, pong.arenaHeight, (value: number) =>
	{
		pong.arenaHeight = value;
		console.log("Arena height changed to: ", value);
		pongSettingsArenaHeightTextValue.text = value.toString();
		
		game.forceRender(pong);
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
	pongGUI.pongSettingsGUI = pongSettingsGUI;
	pongGUI.guiTexture?.addControl(pongSettingsGUI);
}

export const    instantiateArenaGUI = (pongGUI: game.pongGUIRef, pong: game.pongGameRef, states: React.RefObject<game.states>): void =>
{
	
	// Ensure we have a valid scene and camera
	const camera = pong.scene?.activeCamera;
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

	pongGUI.arenaGUI = arenaGUI;
	updateGUIVisibility(pongGUI, states.current);
};
