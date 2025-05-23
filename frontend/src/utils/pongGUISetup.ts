// imports
import React from 'react';
import { useNavigate } from 'react-router-dom';

import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';
import { debug } from 'console';

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
	game.instantiateWaitingRoundStartGUI(pong, states);
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
	setUIState(pong.current.waitingRoundStartGUI, game.states.waiting_to_start);
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
	const	mainMenuGUI = game.createScreen("mainMenuGUI");

	// All GUI components needed
	const	mainMenuContainer = game.createAdaptiveContainer("mainMenuContainer", "300px", "300px");
	const	mainMenuVerticalStackPanel = game.createVerticalStackPanel("mainMenuVerticalStackPanel");
	const	mainMenuTitle = game.createTitle("mainMenuTitle", "Pong Game");
	const	mainMenuSettingsButton = game.createButton("mainMenuSettingsButton", "Settings", () =>
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
	mainMenuVerticalStackPanel.addControl(mainMenuTitle);
	mainMenuVerticalStackPanel.addControl(mainMenuSettingsButton);
	mainMenuVerticalStackPanel.addControl(localPong);
	mainMenuVerticalStackPanel.addControl(remotePong);
	mainMenuContainer.addControl(mainMenuVerticalStackPanel);
	mainMenuGUI.addControl(mainMenuContainer);

	// Add the screen to the GUI texture
	pong.current.mainMenuGUI = mainMenuGUI;
	pong.current.guiTexture?.addControl(mainMenuGUI);
}

export const    instantiateSettingsGUI = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>): void =>
{
	// Canvas that will be used for the GUI
	const	settingsGUI = game.createScreen("settingsGUI");
	const	settingsContainer = game.createAdaptiveContainer("settingsContainer");
	const	settingsPanel = game.createVerticalStackPanel("settingsPanel");

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
	settingsGUI.addControl(settingsContainer);
	settingsContainer.addControl(settingsPanel);
	settingsPanel.addControl(settingsMenuTitle);
	settingsPanel.addControl(backButton);
	settingsPanel.addControl(musicSliderText);
	settingsPanel.addControl(musicSlider);
	settingsPanel.addControl(soundSliderText);
	settingsPanel.addControl(soundSlider);

	// Add the screen to the GUI texture
	pong.current.settingsGUI = settingsGUI;
	pong.current.guiTexture?.addControl(settingsGUI);
}

export const	instentiatePongSettingsGUI = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>): void =>
{
	// Main panel for the entire settings screen
	const	pongSettingsGUI = game.createScreen("pongSettingsGUI");
	const	pongSettingsContainer = game.createAdaptiveContainer("pongSettingsContainer");
	const	pongSettingsVerticalStackPanel = game.createVerticalStackPanel("pongSettingsVerticalStackPanel");
	const	pongSettingsHorizontalStackPanel1 = game.createHorizontalStackPanel("pongSettingsHorizontalStackPanel1", 0);
	const	pongSettingsHorizontalStackPanel2 = game.createHorizontalStackPanel("pongSettingsHorizontalStackPanel2", 0);

	// All GUI components needed
	const	pongSettingsTitle = game.createTitle("pongSettingsTitle", "Pong Settings");
	const	backButton = game.createButton("settingsButton", "Back", () =>
	{
		states.current = game.states.main_menu;
		game.forceRender(pong.current);
	});
	const	playButton = game.createButton("playButton", "Play", () =>
	{
		states.current = game.states.countdown;
		game.forceRender(pong.current);
	});
	(playButton.children[0] as baby.Button).onPointerEnterObservable.add(() => {
			(playButton.children[0] as baby.Button).color = game.colorsScheme.dark1;
			(playButton.children[0] as baby.Button).background = game.colorsScheme.auroraAccent4;
	});
	(playButton.children[0] as baby.Button).onPointerOutObservable.add(() => {
			(playButton.children[0] as baby.Button).color = game.colorsScheme.auroraAccent4;
			(playButton.children[0] as baby.Button).background = game.colorsScheme.dark1;
	});
	(playButton.children[0] as baby.Button).color = game.colorsScheme.auroraAccent4;

	const	pongSettingsArenaWidthText = game.createText("pongSettingsArenaWidthText", "Arena width:");
	const	pongSettingsArenaWidthTextValue = game.createDynamicText("pongSettingsArenaWidthTextValue", () => pong.current.arenaWidth, pong);
	const	pongSettingsArenaWidth = game.createSlider("pongSettingsArenaWidth", 7, 20, 1, pong.current.arenaWidth, (value: number) =>
	{
		pong.current.arenaWidth = value;
		game.forceRender(pong.current);
	});

	const	pongSettingsArenaHeightText = game.createText("pongSettingsArenaHeightText", "Arena height:");
	const	pongSettingsArenaHeightTextValue = game.createDynamicText("pongSettingsArenaHeightTextValue", () => pong.current.arenaHeight, pong);
	const	pongSettingsArenaHeight = game.createSlider("pongSettingsArenaHeight", 7, 20, 1, pong.current.arenaHeight, (value: number) =>
	{
		pong.current.arenaHeight = value;
		game.forceRender(pong.current);
	});

	// Ording of the GUI components
	pongSettingsGUI.addControl(pongSettingsContainer);
	pongSettingsContainer.addControl(pongSettingsVerticalStackPanel);
	pongSettingsVerticalStackPanel.addControl(pongSettingsTitle);
	pongSettingsVerticalStackPanel.addControl(backButton);
	pongSettingsVerticalStackPanel.addControl(pongSettingsHorizontalStackPanel1);
	pongSettingsVerticalStackPanel.addControl(pongSettingsArenaWidth);
	pongSettingsVerticalStackPanel.addControl(pongSettingsHorizontalStackPanel2);
	pongSettingsVerticalStackPanel.addControl(pongSettingsArenaHeight);

	pongSettingsHorizontalStackPanel1.addControl(pongSettingsArenaWidthText);
	pongSettingsHorizontalStackPanel1.addControl(pongSettingsArenaWidthTextValue);

	pongSettingsHorizontalStackPanel2.addControl(pongSettingsArenaHeightText);
	pongSettingsHorizontalStackPanel2.addControl(pongSettingsArenaHeightTextValue);

	pongSettingsVerticalStackPanel.addControl(playButton);

	// Save and add to GUI texture
	pong.current.pongSettingsGUI = pongSettingsGUI;
	pong.current.guiTexture?.addControl(pongSettingsGUI);
}

export const    instantiateArenaGUI = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>): void =>
{
	// Canvas that will be used for the GUI
	const	arenaGUI = game.createScreen("arenaGUI", "top");


	// All GUI components needed
	const	arenaContainer = game.createAdaptiveContainer("arenaContainer", "400px", "150px", undefined, "top");
	const	arenaHorizontalStackPanel = game.createHorizontalStackPanel("arenaHorizontalStackPanel");
	const	arenaRoundText = game.createTitle("arenaRoundText", "Round");
	// const	arenaRoundValue = game.createDynamicText("arenaRoundValue", () => pong.current.round, pong);
	const	arenaScoreText = game.createTitle("arenaScoreText", "Score");

	pong.current.arenaGUI = arenaGUI;
	updateGUIVisibility(pong, states.current);
};

export const	instantiateDebugGUI = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>): void =>
{
	const	debugGUI = game.createScreen("debugGUI", "top-left");
			debugGUI.width = "250px";
			debugGUI.height = "500px";

	const	debugContainer = game.createAdaptiveContainer("debugContainer", "100%", "100%", undefined, "top-left");
	const	debugVerticalStackPanel = game.createVerticalStackPanel("debugVerticalStackPanel");

	const	debugTitle = game.createTitle("debugTitle", "Debug Info");
			(debugTitle.children[0] as baby.TextBlock).fontSize = 24;

	const	debugFrameratePanel = game.createHorizontalStackPanel("debugFrameratePanel", 0);
	const	debugFramerateText = game.createText("debugFrameRateText", "FPS: ");
	const	debugFramerateValue = game.createDynamicText("debugFrameRateValue", () => pong.current.engine?.getFps().toFixed(0), pong);

	const	debugStatesText = game.createText("debugStatesText", "Current State");
			(debugStatesText.children[0] as baby.TextBlock).fontSize = 12;
	const	debugStatesTextName = game.createDynamicText("debugStatesTextName", () => Object.keys(game.states).find(key => game.states[key as keyof typeof game.states] === states.current), pong);
			(debugStatesTextName.children[0] as baby.TextBlock).fontSize = 12;
	const	debugStatesValue = game.createDynamicText("debugStatesValue", () => states.current, pong);
			(debugStatesValue.children[0] as baby.TextBlock).fontSize = 12;
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
			(debugIncrementStateButton.children[0] as baby.Button).fontSize = 12;
			(debugDecrementStateButton.children[0] as baby.Button).fontSize = 12;
			(debugIncrementStateButton.children[0] as baby.Button).cornerRadius = 10;
			(debugDecrementStateButton.children[0] as baby.Button).cornerRadius = 10;
			(debugIncrementStateButton.children[0] as baby.Button).width = "50px";
			(debugDecrementStateButton.children[0] as baby.Button).width = "50px";
			(debugIncrementStateButton.children[0] as baby.Button).height = "50px";
			(debugDecrementStateButton.children[0] as baby.Button).height = "50px";

	const	debugButtonPanel = game.createHorizontalStackPanel("debugButtonPanel", 2.5);

	// Add GUI components to the debug GUI
	// The order of adding controls matters for the layout
	debugVerticalStackPanel.clearControls();
	debugGUI.addControl(debugContainer);
	debugContainer.addControl(debugVerticalStackPanel);
	
	// debugVerticalStackPanel ordering
	debugVerticalStackPanel.addControl(debugTitle);
	debugVerticalStackPanel.addControl(debugFrameratePanel);
	
	// debugFrameratePanel ordering
	debugFrameratePanel.addControl(debugFramerateText);
	debugFrameratePanel.addControl(debugFramerateValue);
	
	// debugButtonPanel ordering
	debugVerticalStackPanel.addControl(debugStatesText);
	debugVerticalStackPanel.addControl(debugStatesTextName);
	debugVerticalStackPanel.addControl(debugButtonPanel);
	debugButtonPanel.addControl(debugIncrementStateButton);
	debugButtonPanel.addControl(debugStatesValue);
	debugButtonPanel.addControl(debugDecrementStateButton);
	
	// Add the screen to the GUI texture
	pong.current.debugGUI = debugGUI;
	pong.current.guiTexture?.addControl(debugGUI);
}

export const	instantiateWaitingRoundStartGUI = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>): void =>
{
	// Canvas that will be used for the GUI
	const	waitingRoundStartGUI = game.createScreen("waitingRoundStartGUI", "center");

	// All GUI components needed
	const	waitingRoundStartContainer = game.createAdaptiveContainer("waitingRoundStartContainer");
	const	waitingRoundStartVerticalStackPanel = game.createVerticalStackPanel("waitingRoundStartVerticalStackPanel");
	const	waitingRoundStartTitle = game.createTitle("waitingRoundStartTitle", "Starting in");
	const	text3 = game.createText("text3", "3");
	const	text2 = game.createText("text2", "2");
	const	text1 = game.createText("text1", "1");

	// Add GUI components to the main menu
	// The order of adding controls matters for the layout
	waitingRoundStartVerticalStackPanel.addControl(waitingRoundStartTitle);
	waitingRoundStartContainer.addControl(waitingRoundStartVerticalStackPanel);
	waitingRoundStartGUI.addControl(waitingRoundStartContainer);

	// Add the screen to the GUI texture
	pong.current.waitingRoundStartGUI = waitingRoundStartGUI;
	pong.current.guiTexture?.addControl(waitingRoundStartGUI);
}
