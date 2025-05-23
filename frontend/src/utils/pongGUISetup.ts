// imports
import React from 'react';
import { useNavigate } from 'react-router-dom';

import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';
import { text } from 'stream/consumers';

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
	game.instantiateCountdownGUI(pong, states);
	game.instantiateFinishedGameGUI(pong, states);
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
	setUIState(pong.current.countdownGUI, game.states.countdown);
	setUIState(pong.current.finishedGameGUI, game.states.game_finished);
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
	});
	const	localPong = game.createButton("localPong", "Play locally", () =>
	{
		states.current = game.states.game_settings;
	});
	const	AIPong = game.createButton("AIPong", "Play versus AI", () =>
	{
		states.current = game.states.game_settings;
	});
	const	remotePong = game.createButton("remotePong", "Play multiplayer", () =>
	{
		states.current = game.states.not_found;
	});


	// Add GUI components to the main menu
	// The order of adding controls matters for the layout
	mainMenuVerticalStackPanel.addControl(mainMenuTitle);
	mainMenuVerticalStackPanel.addControl(mainMenuSettingsButton);
	mainMenuVerticalStackPanel.addControl(localPong);
	mainMenuVerticalStackPanel.addControl(AIPong);
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
	});
	const	musicSlider = game.createSlider("musicSlider", 0, 20, 1, 20, (value: number) =>
	{
		console.log("Music volume changed to: ", value);
	});
	const	soundSlider = game.createSlider("musicSlider", 0, 20, 1, 20, (value: number) =>
	{
		console.log("Music volume changed to: ", value);
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
	const	pongSettingsHorizontalStackPanel3 = game.createHorizontalStackPanel("pongSettingsHorizontalStackPanel3", 0);
	const	pongSettingsHorizontalStackPanel4 = game.createHorizontalStackPanel("pongSettingsHorizontalStackPanel4", 0);
	const	pongSettingsHorizontalStackPanel5 = game.createHorizontalStackPanel("pongSettingsHorizontalStackPanel5", 0);
	const	pongSettingsHorizontalStackPanel6 = game.createHorizontalStackPanel("pongSettingsHorizontalStackPanel6", 0);
	const	pongSettingsHorizontalStackPanel7 = game.createHorizontalStackPanel("pongSettingsHorizontalStackPanel7", 0);
	const	pongSettingsHorizontalStackPanel8 = game.createHorizontalStackPanel("pongSettingsHorizontalStackPanel8", 0);
	const	pongSettingsHorizontalStackPanel9 = game.createHorizontalStackPanel("pongSettingsHorizontalStackPanel9");

	// All GUI components needed
	const	pongSettingsTitle = game.createTitle("pongSettingsTitle", "Pong Settings\n");
	const	backButton = game.createButton("settingsButton", "Back", () =>
	{
		states.current = game.states.main_menu;
	});
	const	playButton = game.createButton("playButton", "Play", () =>
	{
		states.current = game.states.waiting_to_start;
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

	const	pongSettingsTotalPointsToWinText = game.createText("pongSettingsTotalPointsToWinText", "Points required to win:");
	const	pongSettingsTotalPointsToWinTextValue = game.createDynamicText("pongSettingsTotalPointsToWinTextValue", () => pong.current.requiredPointsToWin, pong);
	const	pongSettingsTotalPointsToWin = game.createSlider("pongSettingsTotalPointsToWin", 1, 10, 1, pong.current.requiredPointsToWin, (value: number) =>
	{
		pong.current.requiredPointsToWin = value;
	});

	const	pongSettingsArenaWidthText = game.createText("pongSettingsArenaWidthText", "Arena width:");
	const	pongSettingsArenaWidthTextValue = game.createDynamicText("pongSettingsArenaWidthTextValue", () => pong.current.arenaWidth, pong);
	const	pongSettingsArenaWidth = game.createSlider("pongSettingsArenaWidth", 7, 20, 1, pong.current.arenaWidth, (value: number) =>
	{
		pong.current.arenaWidth = value;
	});

	const	pongSettingsArenaHeightText = game.createText("pongSettingsArenaHeightText", "Arena height:");
	const	pongSettingsArenaHeightTextValue = game.createDynamicText("pongSettingsArenaHeightTextValue", () => pong.current.arenaHeight, pong);
	const	pongSettingsArenaHeight = game.createSlider("pongSettingsArenaHeight", 7, 20, 1, pong.current.arenaHeight, (value: number) =>
	{
		pong.current.arenaHeight = value;
	});

	const	pongSettingsPaddleHeightsText = game.createText("pongSettingsPaddleHeightsText", "Paddle size:");
	const	pongSettingsPaddleHeightsTextValue = game.createDynamicText("pongSettingsPaddleHeightsTextValue", () => pong.current.paddleHeight, pong);
	const	pongSettingsPaddleHeights = game.createSlider("pongSettingsPaddleHeights", 1, 6, 1, pong.current.paddleHeight, (value: number) =>
	{
		if (!pong.current.paddle1 || !pong.current.paddle2) return;
		pong.current.paddleHeight = value;
		pong.current.paddle1.scaling.z = value;
		pong.current.paddle2.scaling.z = value;
	});

	const	pongSettingsPaddleSpeedText = game.createText("pongSettingsPaddleSpeedText", "Paddle movement speed:");
	const	pongSettingsPaddleSpeedTextValue = game.createDynamicText("pongSettingsPaddleSpeedTextValue", () => pong.current.paddleSpeed.toFixed(2), pong);
	const	pongSettingsPaddleSpeed = game.createSlider("pongSettingsPaddleSpeed", 0.1, 0.5, 0.05, pong.current.paddleSpeed, (value: number) =>
	{
		pong.current.paddleSpeed = value;
	});

	const	pongSettingsBallSpeedText = game.createText("pongSettingsBallSpeedText", "Ball speed:");
	const	pongSettingsBallSpeedTextValue = game.createDynamicText("pongSettingsBallSpeedTextValue", () => pong.current.ballSpeed.toFixed(2), pong);
	const	pongSettingsBallSpeed = game.createSlider("pongSettingsBallSpeed", 0.05, 0.2, 0.05, pong.current.ballSpeed, (value: number) =>
	{
		pong.current.ballSpeed = value;
	});

	const	pongSettingsMaxBallSpeedText = game.createText("pongSettingsMaxBallSpeedText", "Max ball speed:");
	const	pongSettingsMaxBallSpeedTextValue = game.createDynamicText("pongSettingsMaxBallSpeedTextValue", () => pong.current.maxBallSpeed.toFixed(2), pong);
	const	pongSettingsMaxBallSpeed = game.createSlider("pongSettingsMaxBallSpeed", 0.25, 1, 0.05, pong.current.maxBallSpeed, (value: number) =>
	{
		pong.current.maxBallSpeed = value;
	});

	// Ording of the GUI components
	pongSettingsGUI.addControl(pongSettingsContainer);
	pongSettingsContainer.addControl(pongSettingsVerticalStackPanel);
	pongSettingsVerticalStackPanel.addControl(pongSettingsTitle);
	
	pongSettingsVerticalStackPanel.addControl(pongSettingsHorizontalStackPanel1);
	pongSettingsVerticalStackPanel.addControl(pongSettingsTotalPointsToWin);
	pongSettingsVerticalStackPanel.addControl(pongSettingsHorizontalStackPanel2);
	pongSettingsVerticalStackPanel.addControl(pongSettingsArenaWidth);
	pongSettingsVerticalStackPanel.addControl(pongSettingsHorizontalStackPanel3);
	pongSettingsVerticalStackPanel.addControl(pongSettingsArenaHeight);
	pongSettingsVerticalStackPanel.addControl(pongSettingsHorizontalStackPanel4);
	pongSettingsVerticalStackPanel.addControl(pongSettingsPaddleHeights);
	pongSettingsVerticalStackPanel.addControl(pongSettingsHorizontalStackPanel5);
	pongSettingsVerticalStackPanel.addControl(pongSettingsPaddleSpeed);
	pongSettingsVerticalStackPanel.addControl(pongSettingsHorizontalStackPanel6);
	pongSettingsVerticalStackPanel.addControl(pongSettingsBallSpeed);
	pongSettingsVerticalStackPanel.addControl(pongSettingsHorizontalStackPanel7);
	pongSettingsVerticalStackPanel.addControl(pongSettingsMaxBallSpeed);
	pongSettingsVerticalStackPanel.addControl(pongSettingsHorizontalStackPanel9);


	pongSettingsHorizontalStackPanel1.addControl(pongSettingsTotalPointsToWinText);
	pongSettingsHorizontalStackPanel1.addControl(pongSettingsTotalPointsToWinTextValue);

	pongSettingsHorizontalStackPanel2.addControl(pongSettingsArenaWidthText);
	pongSettingsHorizontalStackPanel2.addControl(pongSettingsArenaWidthTextValue);

	pongSettingsHorizontalStackPanel3.addControl(pongSettingsArenaHeightText);
	pongSettingsHorizontalStackPanel3.addControl(pongSettingsArenaHeightTextValue);

	pongSettingsHorizontalStackPanel4.addControl(pongSettingsPaddleHeightsText);
	pongSettingsHorizontalStackPanel4.addControl(pongSettingsPaddleHeightsTextValue);

	pongSettingsHorizontalStackPanel5.addControl(pongSettingsPaddleSpeedText);
	pongSettingsHorizontalStackPanel5.addControl(pongSettingsPaddleSpeedTextValue);

	pongSettingsHorizontalStackPanel6.addControl(pongSettingsBallSpeedText);
	pongSettingsHorizontalStackPanel6.addControl(pongSettingsBallSpeedTextValue);

	pongSettingsHorizontalStackPanel7.addControl(pongSettingsMaxBallSpeedText);
	pongSettingsHorizontalStackPanel7.addControl(pongSettingsMaxBallSpeedTextValue);

	pongSettingsHorizontalStackPanel9.addControl(backButton);
	pongSettingsHorizontalStackPanel9.addControl(playButton);

	// Save and add to GUI texture
	pong.current.pongSettingsGUI = pongSettingsGUI;
	pong.current.guiTexture?.addControl(pongSettingsGUI);
}

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
	});
	const	debugDecrementStateButton = game.createButton("debugDecrementStateButton", "-", () =>
	{
		states.current--;
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

	const	debugActiveCamText = game.createText("debugActiveCamText", "Active camera");
			(debugActiveCamText.children[0] as baby.TextBlock).fontSize = 12;
	const	debugActiveCamTextValue = game.createDynamicText("debugActiveCamTextValue", () => pong.current.scene?.activeCamera?.name, pong);
			(debugActiveCamTextValue.children[0] as baby.TextBlock).fontSize = 12;

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

	debugVerticalStackPanel.addControl(debugActiveCamText);
	debugVerticalStackPanel.addControl(debugActiveCamTextValue);
	
	// Add the screen to the GUI texture
	pong.current.debugGUI = debugGUI;
	pong.current.guiTexture?.addControl(debugGUI);
}

export const	instantiateCountdownGUI = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>): void =>
{
	// Canvas that will be used for the GUI
	const	countdownGUI = game.createScreen("waitingRoundStartGUI", "top");

	// All GUI components needed
	const	waitingRoundStartContainer = game.createAdaptiveContainer("waitingRoundStartContainer", "300px", "300px", undefined, "top");
	const	waitingRoundStartVerticalStackPanel = game.createVerticalStackPanel("waitingRoundStartVerticalStackPanel");
	const	waitingRoundStartTitle = game.createTitle("waitingRoundStartTitle", "Starting in");
	const	countdown = game.createDynamicText("countdown", () => Math.trunc(pong.current.countdown), pong);
			(countdown.children[0] as baby.TextBlock).fontSize = 48;

	// Add GUI components to the main menu
	// The order of adding controls matters for the layout
	waitingRoundStartVerticalStackPanel.addControl(waitingRoundStartTitle);
	waitingRoundStartVerticalStackPanel.addControl(countdown);
	waitingRoundStartContainer.addControl(waitingRoundStartVerticalStackPanel);
	countdownGUI.addControl(waitingRoundStartContainer);

	// Add the screen to the GUI texture
	pong.current.countdownGUI = countdownGUI;
	pong.current.guiTexture?.addControl(countdownGUI);
}

export const	instantiateArenaGUI = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>): void =>
{
	// Canvas that will be used for the GUI
	const	arenaGUI = game.createScreen("scoresGUI", "top");

	// All GUI components needed
	const	arenaContainer = game.createAdaptiveContainer("arenaContainer", "300px", "300px", undefined, "top");
	const	arenaBotContainer = game.createAdaptiveContainer("arenaBotContainer", "300px", "300px", undefined, "bottom");
	const	arenaVerticalStackPanel = game.createVerticalStackPanel("arenaVerticalStackPanel");
	const	arenaHorizontalStackPanel1 = game.createHorizontalStackPanel("arenaHorizontalStackPanel1", 0);
	const	arenaHorizontalStackPanel2 = game.createHorizontalStackPanel("scoresHorizontalStackPanel2", 0);
	const	scoresTitle = game.createTitle("scoresTitle", "Scores");
	const	requiredPointsText = game.createTitle("requiredPointsText", "Required points to win: ");
	const	requiredPointsValue = game.createDynamicText("requiredPointsValue", () => pong.current.requiredPointsToWin, pong);
			(requiredPointsValue.children[0] as baby.TextBlock).fontSize = 48;
	const	player1ScoreText = game.createText("player1ScoreText", "P1:");
	const	player2ScoreText = game.createText("player2ScoreText", "P2:");
	const	playerSepartor = game.createText("playerSepartor", "    ");
	const	player1ScoreValue = game.createDynamicText("player1ScoreValue", () => pong.current.player1Score, pong);
	const	player2ScoreValue = game.createDynamicText("player2ScoreValue", () => pong.current.player2Score, pong);

	// Add GUI components to the main menu
	// The order of adding controls matters for the layout
	arenaVerticalStackPanel.addControl(scoresTitle);
	arenaVerticalStackPanel.addControl(arenaHorizontalStackPanel1);
	arenaHorizontalStackPanel1.addControl(player1ScoreText);
	arenaHorizontalStackPanel1.addControl(player1ScoreValue);
	arenaHorizontalStackPanel1.addControl(playerSepartor);
	arenaHorizontalStackPanel1.addControl(player2ScoreText);
	arenaHorizontalStackPanel1.addControl(player2ScoreValue);
	arenaContainer.addControl(arenaVerticalStackPanel);
	arenaGUI.addControl(arenaContainer);
	arenaBotContainer.addControl(arenaHorizontalStackPanel2);
	arenaHorizontalStackPanel2.addControl(requiredPointsText);
	arenaHorizontalStackPanel2.addControl(requiredPointsValue);
	arenaBotContainer.addControl(arenaHorizontalStackPanel2);
	arenaGUI.addControl(arenaBotContainer);

	// Add the screen to the GUI texture
	pong.current.arenaGUI = arenaGUI;
	pong.current.guiTexture?.addControl(arenaGUI);
}

export const	instantiateFinishedGameGUI = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>): void =>
{
	// Canvas that will be used for the GUI
	const	finishedGameGUI = game.createScreen("finishedGameGUI", "center");

	// All GUI components needed
	const	finishedGameContainer = game.createAdaptiveContainer("finishedGameContainer", "300px", "300px");
	const	finishedGameVerticalStackPanel = game.createVerticalStackPanel("finishedGameVerticalStackPanel");
	const	finishedGameHorizontalStackPanel1 = game.createHorizontalStackPanel("finishedGameHorizontalStackPanel1");
	const	finishedGameHorizontalStackPanel2 = game.createHorizontalStackPanel("finishedGameHorizontalStackPanel2");
	const	finishedGameTitle = game.createTitle("finishedGameTitle", "Game Over");

	const	scoredText1 = game.createText("scoredText", "| Scored:");
	const	scoredText2 = game.createText("scoredText", "| Scored:");

	const	finishedGameWinnerText = game.createText("finishedGameWinnerText", "Winner:");
			(finishedGameWinnerText.children[0] as baby.TextBlock).color = game.colorsScheme.auroraAccent4;
	const	finishedGameWinnerPlayer = game.createDynamicText("finishedGameWinnerPlayer", () => (pong.current.player1Score > pong.current.player2Score ? "Player 1" : "Player 2"), pong);
	const	finishedGameWinnerScore = game.createDynamicText("finishedGameWinnerScore", () => Math.max(pong.current.player1Score, pong.current.player2Score), pong);
	const	finishedGameLoserText = game.createText("finishedGameLoserText", "Looser:");
			(finishedGameLoserText.children[0] as baby.TextBlock).color = game.colorsScheme.auroraAccent1;
	const	finishedGameLoserPlayer = game.createDynamicText("finishedGameLoserPlayer", () => (pong.current.player1Score < pong.current.player2Score ? "Player 1" : "Player 2"), pong);
	const	finishedGameLoserScore = game.createDynamicText("finishedGameLoserScore", () => Math.min(pong.current.player1Score, pong.current.player2Score), pong);
	const	backButton = game.createButton("backButton", "Back to main menu", () =>
	{
		states.current = game.states.main_menu;
	});

	// Add GUI components to the main menu
	// The order of adding controls matters for the layout
	finishedGameVerticalStackPanel.addControl(finishedGameTitle);
	finishedGameVerticalStackPanel.addControl(finishedGameHorizontalStackPanel1);
	finishedGameVerticalStackPanel.addControl(finishedGameHorizontalStackPanel2);

	finishedGameHorizontalStackPanel1.addControl(finishedGameWinnerText);
	finishedGameHorizontalStackPanel1.addControl(finishedGameWinnerPlayer);
	finishedGameHorizontalStackPanel1.addControl(scoredText1);
	finishedGameHorizontalStackPanel1.addControl(finishedGameWinnerScore);

	finishedGameHorizontalStackPanel2.addControl(finishedGameLoserText);
	finishedGameHorizontalStackPanel2.addControl(finishedGameLoserPlayer);
	finishedGameHorizontalStackPanel2.addControl(scoredText2);
	finishedGameHorizontalStackPanel2.addControl(finishedGameLoserScore);

	finishedGameVerticalStackPanel.addControl(backButton);
	finishedGameContainer.addControl(finishedGameVerticalStackPanel);
	finishedGameGUI.addControl(finishedGameContainer);

	// Add the screen to the GUI texture
	pong.current.finishedGameGUI = finishedGameGUI;
	pong.current.guiTexture?.addControl(finishedGameGUI);
}