import React from 'react';

import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';
import { stat } from 'fs';

// ****************************************************************************** //
//                                                                                //
//                                  MAIN MENU                                     //
//                                                                                //
// ****************************************************************************** //

export const    instantiateMainMenuGUI =
(
	pong: React.RefObject<game.pongStruct>,
	states: React.RefObject<game.states>,
	gameModes: React.RefObject<game.gameModes>,
	navigate: (path: string) => void,
	setGameModeTrigger: React.Dispatch<React.SetStateAction<number>>
): void =>
{
	// Canvas that will be used for the GUI
	const	mainMenuGUI = game.createScreen("mainMenuGUI");
	// All GUI components needed
	const	mainMenuContainer = game.createAdaptiveContainer("mainMenuContainer", "300px", "300px");
	const	mainMenuVerticalStackPanel = game.createVerticalStackPanel("mainMenuVerticalStackPanel");
	const	mainMenuHorizontalStackPanel = game.createHorizontalStackPanel("mainMenuHorizontalStackPanel", 0);
	const	mainMenuVerticalStackPanel1 = game.createVerticalStackPanel("mainMenuVerticalStackPanel1", 0);
	const	mainMenuVerticalStackPanel2 = game.createVerticalStackPanel("mainMenuVerticalStackPanel2", 0);
	const	mainMenuDynamicTitle = game.createDynamicTitle("mainMenuDynamicTitle", "mainMenuTitle");
	const	mainMenuSettingsButton = game.createDynamicButton("mainMenuSettingsButton", () =>
	{
		states.current = game.states.settings;
	}, pong, "settings");
	const	returnToMuseumButton = game.createDynamicButton("returnToMuseumButton", () => {
		pong.current.scene?.dispose();
		navigate("/game1");
	}, pong, "returnToMuseumButton");
			(returnToMuseumButton.children[0] as baby.Button).onPointerEnterObservable.add(() =>
			{
				(returnToMuseumButton.children[0] as baby.Button).color = game.colorsScheme.dark1;
				(returnToMuseumButton.children[0] as baby.Button).background = game.colorsScheme.auroraAccent1;
			});
			(returnToMuseumButton.children[0] as baby.Button).onPointerOutObservable.add(() =>
			{
				(returnToMuseumButton.children[0] as baby.Button).color = game.colorsScheme.auroraAccent1;
				(returnToMuseumButton.children[0] as baby.Button).background = game.colorsScheme.dark1;
			});
			(returnToMuseumButton.children[0] as baby.Button).color = game.colorsScheme.auroraAccent1;
	const	localPong = game.createDynamicButton("localPong", () =>
	{
		if (!pong.current.scene) return;
		gameModes.current = game.gameModes.local;
		states.current = game.states.game_settings;
		game.transitionToCamera(pong.current.scene.activeCamera as baby.FreeCamera, pong.current.pongSettingsCam, 1, pong, states);
	}, pong, "playLocally");
	const	AIPong = game.createDynamicButton("AIPong", () =>
	{
		if (!pong.current.scene) return;
		gameModes.current = game.gameModes.ai;
		states.current = game.states.game_settings;
		game.transitionToCamera(pong.current.scene.activeCamera as baby.FreeCamera, pong.current.pongSettingsCam, 1, pong, states);
	}, pong, "playAgainstAI");
	const	remotePong = game.createDynamicButton("remotePong", () =>
	{
		gameModes.current = game.gameModes.online;
		setGameModeTrigger((prev: number) => prev + 1);
		if (!pong.current.scene) return;
		states.current = game.states.host_or_join;
	}, pong, "playOnline");
	const	tournamentPong = game.createDynamicButton("tournamentPong", () =>
	{
		gameModes.current = game.gameModes.tournament;
		setGameModeTrigger((prev: number) => prev + 1);
		if (!pong.current.scene) return;
		states.current = game.states.input_username_1;
	}, pong, "playTournament");


	// Add GUI components to the main menu
	// The order of adding controls matters for the layout
	mainMenuVerticalStackPanel1.addControl(localPong);
	mainMenuVerticalStackPanel1.addControl(AIPong);
	mainMenuVerticalStackPanel1.addControl(remotePong);
	mainMenuVerticalStackPanel2.addControl(tournamentPong);
	mainMenuVerticalStackPanel2.addControl(mainMenuSettingsButton);
	mainMenuVerticalStackPanel2.addControl(returnToMuseumButton);
	mainMenuHorizontalStackPanel.addControl(mainMenuVerticalStackPanel1);
	mainMenuHorizontalStackPanel.addControl(mainMenuVerticalStackPanel2);
	mainMenuContainer.addControl(mainMenuVerticalStackPanel);
	mainMenuVerticalStackPanel.addControl(mainMenuDynamicTitle);
	mainMenuVerticalStackPanel.addControl(mainMenuHorizontalStackPanel);
	mainMenuGUI.addControl(mainMenuContainer);

	// Add the screen to the GUI texture
	pong.current.mainMenuGUI = mainMenuGUI;
	// pong.current.guiTexture?.addControl(mainMenuGUI);
}

// ****************************************************************************** //
//                                                                                //
//                                   SETTINGS                                     //
//                                                                                //
// ****************************************************************************** //

export const    instantiateSettingsGUI =
(
	pong: React.RefObject<game.pongStruct>,
	states: React.RefObject<game.states>,
	lang: React.RefObject<game.lang>,
	musicRef?: React.RefObject<HTMLAudioElement | null>,
	audioRef?: React.RefObject<HTMLAudioElement | null>,
): void =>
{
	// Canvas that will be used for the GUI
	const	settingsGUI = game.createScreen("settingsGUI");
	const	settingsContainer = game.createAdaptiveContainer("settingsContainer");
	const	settingsPanel = game.createVerticalStackPanel("settingsPanel");
	const	settingsLanguagePanel1 = game.createHorizontalStackPanel("settingsLanguagePanel1", 0);
	const	settingsLanguagePanel2 = game.createHorizontalStackPanel("settingsLanguagePanel2", 0);
	const	settingsVolumePanel1 = game.createHorizontalStackPanel("settingsVolumePanel1", 0);
	const	settingsVolumePanel2 = game.createHorizontalStackPanel("settingsVolumePanel2", 0);

	// All GUI components needed
	const	settingsMenuTitle = game.createDynamicTitle("settingsMenuTitle", "settings");
	const	backButton = game.createDynamicButton("settingsButton", () =>
	{
		states.current = game.states.main_menu;
	}, pong, "back");
	const	musicSlider = game.createSlider("musicSlider", 0, 1, 0.02, pong.current.musicVolume, (value: number) =>
	{
		pong.current.musicVolume = value;
		if (musicRef && musicRef.current)
		{
			console.debug("IL FÉ TARPING CHAUD");
			musicRef.current.volume = value;
		}
		console.log("music volume: ", pong.current.musicVolume);
		game.findComponentByName(pong, "musicSliderTextValue").text = pong.current.musicVolume.toFixed(2);
	});
	const	soundSlider = game.createSlider("soundSlider", 0, 1, 0.02, pong.current.soundVolume, (value: number) =>
	{
		pong.current.soundVolume = value;
		if (audioRef && audioRef.current) audioRef.current.volume = value;
		console.log("sound volume: ", pong.current.musicVolume);
		game.findComponentByName(pong, "soundSliderTextValue").text = pong.current.soundVolume.toFixed(2);
	});
	const	musicSliderText = game.createDynamicText("musicSliderText", "settingsMusic");
	const	soundSliderText = game.createDynamicText("soundSliderText", "settingsSound");
	const	musicSliderTextValue = game.createText("musicSliderTextValue", pong.current.musicVolume.toFixed(2));
	const	soundSliderTextValue = game.createText("soundSliderTextValue", pong.current.soundVolume.toFixed(2));

	// Language selection buttons
	const	englishButton = game.createButton("englishButton", "🇺🇸", () =>
	{
		lang.current = game.lang.english;
		game.updateGUIValues(pong, lang);
		game.findComponentByName(pong, "debugActiveLanguageTextValue").text = lang.current;
	}, pong);
			(englishButton.children[0] as baby.Button).fontSize = 36;
			(englishButton.children[0] as baby.Button).width = "100px";
			(englishButton.children[0] as baby.Button).height = "100px";

	const	frenchButton = game.createButton("frenchButton", "🇲🇫", () =>
	{
		lang.current = game.lang.french;
		game.updateGUIValues(pong, lang);
		game.findComponentByName(pong, "debugActiveLanguageTextValue").text = lang.current;
	}, pong);
			(frenchButton.children[0] as baby.Button).width = "100px";
			(frenchButton.children[0] as baby.Button).height = "100px";
			(frenchButton.children[0] as baby.Button).fontSize = 36;

	const	italianButton = game.createButton("italianButton", "🇮🇹", () =>
	{
		lang.current = game.lang.italian;
		game.updateGUIValues(pong, lang);
		game.findComponentByName(pong, "debugActiveLanguageTextValue").text = lang.current;
		game.findComponentByName(pong, "debugActiveLanguageTextValue").markAsDirty();
	}, pong);
			(italianButton.children[0] as baby.Button).width = "100px";
			(italianButton.children[0] as baby.Button).height = "100px";
			(italianButton.children[0] as baby.Button).fontSize = 36;

	const	brailButton = game.createButton("brailButton", "🦮", () =>
	{
		lang.current = game.lang.braille;
		game.updateGUIValues(pong, lang);
		game.findComponentByName(pong, "debugActiveLanguageTextValue").text = lang.current;
		game.findComponentByName(pong, "debugActiveLanguageTextValue").markAsDirty();
	}, pong);
			(brailButton.children[0] as baby.Button).width = "100px";
			(brailButton.children[0] as baby.Button).height = "100px";
			(brailButton.children[0] as baby.Button).fontSize = 36;

	// Add GUI components to the main menu
	// The order of adding controls matters for the layout
	settingsGUI.addControl(settingsContainer);
	settingsContainer.addControl(settingsPanel);
	settingsPanel.addControl(settingsMenuTitle);

	// Music and Sound sliders
	settingsVolumePanel1.addControl(musicSliderText);
	settingsVolumePanel1.addControl(musicSliderTextValue);
	settingsPanel.addControl(settingsVolumePanel1);
	settingsPanel.addControl(musicSlider);
	settingsVolumePanel2.addControl(soundSliderText);
	settingsVolumePanel2.addControl(soundSliderTextValue);
	settingsPanel.addControl(settingsVolumePanel2);
	settingsPanel.addControl(soundSlider);

	// language selection panels
	settingsPanel.addControl(settingsLanguagePanel1);
	settingsPanel.addControl(settingsLanguagePanel2);
	settingsLanguagePanel1.addControl(englishButton);
	settingsLanguagePanel1.addControl(frenchButton);
	settingsLanguagePanel2.addControl(italianButton);
	settingsLanguagePanel2.addControl(brailButton);

	// Back button
	settingsPanel.addControl(backButton);
	// Add the screen to the GUI texture
	pong.current.settingsGUI = settingsGUI;
}

// ****************************************************************************** //
//                                                                                //
//                                PONG SETTINGS                                   //
//                                                                                //
// ****************************************************************************** //

export const	instentiatePongSettingsGUI =
(
	pong: React.RefObject<game.pongStruct>,
	states: React.RefObject<game.states>,
	gameModes: React.RefObject<game.gameModes>,
	playerStates: React.RefObject<game.playerStates>,
	lastHandledState: React.RefObject<game.states>
): void =>
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
	const	pongSettingsHorizontalStackPanel9 = game.createHorizontalStackPanel("pongSettingsHorizontalStackPanel9");

	// All GUI components needed
	const	pongSettingsTitle = game.createDynamicTitle("pongSettingsTitle");
	const	pongSettingsBackButton = game.createDynamicButton("pongSettingsBackButton", () =>
	{
		switch (gameModes.current)
		{
			case game.gameModes.online:
				states.current = game.states.host_or_join;
				game.transitionToCamera(pong.current.scene?.activeCamera as baby.FreeCamera, pong.current.mainMenuCam, 1, pong, states);
				break;
			case game.gameModes.tournament:
				states.current = game.states.input_username_4;
				game.transitionToCamera(pong.current.scene?.activeCamera as baby.FreeCamera, pong.current.mainMenuCam, 1, pong, states);
				break;
			default:
				states.current = game.states.main_menu;
				gameModes.current = game.gameModes.none;
				game.transitionToCamera(pong.current.scene?.activeCamera as baby.FreeCamera, pong.current.mainMenuCam, 1, pong, states);
				break;
		}
		playerStates.current = game.playerStates.none;
	}, pong, "back");
	const	pongSettingsPlayButton = game.createDynamicButton("pongSettingsPlayButton", () =>
	{
		if (gameModes.current === game.gameModes.online) states.current = game.states.hosting_waiting_players;
		else if (gameModes.current === game.gameModes.tournament)
		{
			states.current = game.states.tournament_bracket_preview;
			pong.current.tournamentState = game.tournamentStates.waiting_game_1;
		}
		else states.current = game.states.waiting_to_start;
	}, pong, "play");
			(pongSettingsPlayButton.children[0] as baby.Button).onPointerEnterObservable.add(() =>
			{
				(pongSettingsPlayButton.children[0] as baby.Button).color = game.colorsScheme.dark1;
				(pongSettingsPlayButton.children[0] as baby.Button).background = game.colorsScheme.auroraAccent4;
			});
			(pongSettingsPlayButton.children[0] as baby.Button).onPointerOutObservable.add(() =>
			{
				(pongSettingsPlayButton.children[0] as baby.Button).color = game.colorsScheme.auroraAccent4;
				(pongSettingsPlayButton.children[0] as baby.Button).background = game.colorsScheme.dark1;
			});
			(pongSettingsPlayButton.children[0] as baby.Button).color = game.colorsScheme.auroraAccent4;

	const	pongSettingsTotalPointsToWinText = game.createDynamicText("pongSettingsTotalPointsToWinText", "pointsRequiredToWin");
	const	pongSettingsTotalPointsToWinTextValue = game.createDynamicText("pongSettingsTotalPointsToWinTextValue");
			(pongSettingsTotalPointsToWinTextValue.children[0] as baby.TextBlock).onDirtyObservable.add(() =>
			{
				game.findComponentByName(pong, "pongSettingsTotalPointsToWinTextValue").text = pong.current.requiredPointsToWin.toString();
			});
	const	pongSettingsTotalPointsToWin = game.createSlider("pongSettingsTotalPointsToWin", 1, 10, 1, pong.current.requiredPointsToWin, (value: number) =>
	{
		pong.current.requiredPointsToWin = value;
		game.findComponentByName(pong, "pongSettingsTotalPointsToWinTextValue").text = value.toString();
	});

	const	pongSettingsArenaWidthText = game.createDynamicText("pongSettingsArenaWidthText", "arenaWidth");
	const	pongSettingsArenaWidthTextValue = game.createDynamicText("pongSettingsArenaWidthTextValue");
			(pongSettingsArenaWidthTextValue.children[0] as baby.TextBlock).onDirtyObservable.add(() =>
			{
				game.findComponentByName(pong, "pongSettingsArenaWidthTextValue").text = pong.current.arenaWidth.toString();
			});
	const	pongSettingsArenaWidth = game.createSlider("pongSettingsArenaWidth", 7, 80, 1, pong.current.arenaWidth, (value: number) =>
	{
		pong.current.arenaWidth = value;
		game.resizeArenaShell(pong);
		game.findComponentByName(pong, "pongSettingsArenaWidthTextValue").text = value.toString();
	});

	const	pongSettingsArenaHeightText = game.createDynamicText("pongSettingsArenaHeightText", "arenaHeight");
	const	pongSettingsArenaHeightTextValue = game.createDynamicText("pongSettingsArenaHeightTextValue");
			(pongSettingsArenaHeightTextValue.children[0] as baby.TextBlock).onDirtyObservable.add(() =>
			{
				game.findComponentByName(pong, "pongSettingsArenaHeightTextValue").text = pong.current.arenaHeight.toString();
			});
	const	pongSettingsArenaHeight = game.createSlider("pongSettingsArenaHeight", 7, 20, 1, pong.current.arenaHeight, (value: number) =>
	{
		pong.current.arenaHeight = value;
		game.resizeArenaShell(pong);
		game.findComponentByName(pong, "pongSettingsArenaHeightTextValue").text = value.toString();
	});

	const	pongSettingsPaddleHeightsText = game.createDynamicText("pongSettingsPaddleHeightsText", "paddleHeight");
	const	pongSettingsPaddleHeightsTextValue = game.createDynamicText("pongSettingsPaddleHeightsTextValue");
			(pongSettingsPaddleHeightsTextValue.children[0] as baby.TextBlock).onDirtyObservable.add(() =>
			{
				game.findComponentByName(pong, "pongSettingsPaddleHeightsTextValue").text = pong.current.paddleHeight.toString();
			});
	const	pongSettingsPaddleHeights = game.createSlider("pongSettingsPaddleHeights", 1, 6, 1, pong.current.paddleHeight, (value: number) =>
	{
		if (!pong.current.paddle1 || !pong.current.paddle2) return;
		pong.current.paddleHeight = value;
		pong.current.paddle1.scaling.z = value;
		pong.current.paddle2.scaling.z = value;
		game.findComponentByName(pong, "pongSettingsPaddleHeightsTextValue").text = value.toString();
	});

	const	pongSettingsPaddleSpeedText = game.createDynamicText("pongSettingsPaddleSpeedText", "paddleSpeed");
	const	pongSettingsPaddleSpeedTextValue = game.createDynamicText("pongSettingsPaddleSpeedTextValue");
			(pongSettingsPaddleSpeedTextValue.children[0] as baby.TextBlock).onDirtyObservable.add(() =>
			{
				game.findComponentByName(pong, "pongSettingsPaddleSpeedTextValue").text = pong.current.paddleSpeed.toFixed(2);
			});
	const	pongSettingsPaddleSpeed = game.createSlider("pongSettingsPaddleSpeed", 0.1, 0.5, 0.05, pong.current.paddleSpeed, (value: number) =>
	{
		pong.current.paddleSpeed = value;
		game.findComponentByName(pong, "pongSettingsPaddleSpeedTextValue").text = value.toFixed(2);
	});

	const	pongSettingsBallSpeedText = game.createDynamicText("pongSettingsBallSpeedText", "ballSpeed");
	const	pongSettingsBallSpeedTextValue = game.createDynamicText("pongSettingsBallSpeedTextValue");
			(pongSettingsBallSpeedTextValue.children[0] as baby.TextBlock).onDirtyObservable.add(() =>
			{
				game.findComponentByName(pong, "pongSettingsBallSpeedTextValue").text = pong.current.ballSpeed.toFixed(2);
			});
	const	pongSettingsBallSpeed = game.createSlider("pongSettingsBallSpeed", 0.05, 0.2, 0.05, pong.current.ballSpeed, (value: number) =>
	{
		pong.current.ballSpeed = value;
		game.findComponentByName(pong, "pongSettingsBallSpeedTextValue").text = value.toFixed(2);
	});

	const	pongSettingsMaxBallSpeedText = game.createDynamicText("pongSettingsMaxBallSpeedText", "maxBallSpeed");
	const	pongSettingsMaxBallSpeedTextValue = game.createDynamicText("pongSettingsMaxBallSpeedTextValue");
			(pongSettingsMaxBallSpeedTextValue.children[0] as baby.TextBlock).onDirtyObservable.add(() =>
			{
				game.findComponentByName(pong, "pongSettingsMaxBallSpeedTextValue").text = pong.current.maxBallSpeed.toFixed(2);
			});
	const	pongSettingsMaxBallSpeed = game.createSlider("pongSettingsMaxBallSpeed", 0.25, 1, 0.05, pong.current.maxBallSpeed, (value: number) =>
	{
		pong.current.maxBallSpeed = value;
		game.findComponentByName(pong, "pongSettingsMaxBallSpeedTextValue").text = value.toFixed(2);
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

	pongSettingsHorizontalStackPanel9.addControl(pongSettingsBackButton);
	pongSettingsHorizontalStackPanel9.addControl(pongSettingsPlayButton);

	// Save and add to GUI texture
	pong.current.pongSettingsGUI = pongSettingsGUI;
}

// ****************************************************************************** //
//                                                                                //
//                                    DEBUG                                       //
//                                                                                //
// ****************************************************************************** //

export const	instantiateDebugGUI =
(
	pong: React.RefObject<game.pongStruct>,
	states: React.RefObject<game.states>,
	gameModes: React.RefObject<game.gameModes>,
	playerStates: React.RefObject<game.playerStates>,
	lang: React.RefObject<game.lang>
): void =>
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
	const	debugFramerateValue = game.createDynamicText("debugFrameRateValue");
			// (debugFramerateValue.children[0] as baby.TextBlock).onTextChangedObservable.add(() =>
			(debugFramerateValue.children[0] as baby.TextBlock).onDirtyObservable.add(() =>
			{
				let value: string = "NA";
				if (pong.current.engine) value = pong.current.engine.getFps().toFixed(0);
				(debugFramerateValue.children[0] as baby.TextBlock).text = value;
			});

	const	debugStatesText = game.createText("debugStatesText", "Current State");
			(debugStatesText.children[0] as baby.TextBlock).fontSize = 12;
	const	debugStatesTextName = game.createDynamicText("debugStatesTextName");
			(debugStatesTextName.children[0] as baby.TextBlock).fontSize = 12;
			(debugStatesTextName.children[0] as baby.TextBlock).onTextChangedObservable.add(() =>
			{
				game.findComponentByName(pong, "debugStatesTextName").text = Object.keys(game.states).find(key => game.states[key as keyof typeof game.states] === states.current);
			});
	const	debugStatesValue = game.createDynamicText("debugStatesValue");
			(debugStatesValue.children[0] as baby.TextBlock).fontSize = 12;
			(debugStatesValue.children[0] as baby.TextBlock).onTextChangedObservable.add(() =>
			{
				(debugStatesValue.children[0] as baby.TextBlock).text = states.current.toString();
			});
	const	debugIncrementStateButton = game.createButton("debugIncrementStateButton", "+", () =>
	{
		states.current++;
		game.findComponentByName(pong, "debugStatesValue").text = states.current.toString();
	}, pong);
	const	debugDecrementStatesButton = game.createButton("debugDecrementStateButton", "-", () =>
	{
		states.current--;
		game.findComponentByName(pong, "debugStatesValue").text = states.current.toString();
	}, pong);
			(debugIncrementStateButton.children[0] as baby.Button).fontSize = 12;
			(debugDecrementStatesButton.children[0] as baby.Button).fontSize = 12;
			(debugIncrementStateButton.children[0] as baby.Button).cornerRadius = 10;
			(debugDecrementStatesButton.children[0] as baby.Button).cornerRadius = 10;
			(debugIncrementStateButton.children[0] as baby.Button).width = "50px";
			(debugDecrementStatesButton.children[0] as baby.Button).width = "50px";
			(debugIncrementStateButton.children[0] as baby.Button).height = "50px";
			(debugDecrementStatesButton.children[0] as baby.Button).height = "50px";

	const	debugStatesPanel = game.createHorizontalStackPanel("debugButtonPanel", 2.5);

	const	debugActiveCamText = game.createText("debugActiveCamText", "Active camera:");
			(debugActiveCamText.children[0] as baby.TextBlock).fontSize = 12;
	const	debugActiveCamTextValue = game.createDynamicText("debugActiveCamTextValue");
			(debugActiveCamTextValue.children[0] as baby.TextBlock).fontSize = 12;
			(debugActiveCamTextValue.children[0] as baby.TextBlock).onTextChangedObservable.add(() =>
			{
				game.findComponentByName(pong, "debugActiveCamTextValue").text = pong.current.scene?.activeCamera?.name;
			});

	// active languages
	const	debugActiveLanguageText = game.createText("debugActiveLanguageText", "Active language:");
			(debugActiveLanguageText.children[0] as baby.TextBlock).fontSize = 12;
	const	debugActiveLanguageTextValue = game.createDynamicText("debugActiveLanguageTextValue");
			(debugActiveLanguageTextValue.children[0] as baby.TextBlock).fontSize = 12;
			(debugActiveLanguageTextValue.children[0] as baby.TextBlock).onDirtyObservable.add(() =>
			{
				game.findComponentByName(pong, "debugActiveLanguageTextValue").text =
				Object.keys(game.lang).find(key => game.lang[key as keyof typeof game.lang] === lang.current);
			});

	// active game mode
	const	debugActiveGameModeText = game.createText("debugActiveGameModeText", "Active game mode:");
			(debugActiveGameModeText.children[0] as baby.TextBlock).fontSize = 12;
	const	debugActiveGameModeTextValue = game.createDynamicText("debugActiveGameModeTextValue");
			(debugActiveGameModeTextValue.children[0] as baby.TextBlock).fontSize = 12;
			(debugActiveGameModeTextValue.children[0] as baby.TextBlock).onDirtyObservable.add(() =>
			{
				game.findComponentByName(pong, "debugActiveGameModeTextValue").text =
				Object.keys(game.gameModes).find(key => game.gameModes[key as keyof typeof game.gameModes] === gameModes.current);
			});

	// active game mode
	const	debugActivePlayerStateText = game.createText("debugActivePlayerStateText", "Active player state:");
			(debugActivePlayerStateText.children[0] as baby.TextBlock).fontSize = 12;
	const	debugActivePlayerStateTextValue = game.createDynamicText("debugActivePlayerStateTextValue");
			(debugActivePlayerStateTextValue.children[0] as baby.TextBlock).fontSize = 12;
			(debugActivePlayerStateTextValue.children[0] as baby.TextBlock).onDirtyObservable.add(() =>
			{
				game.findComponentByName(pong, "debugActivePlayerStateTextValue").text =
				Object.keys(game.playerStates).find(key => game.playerStates[key as keyof typeof game.playerStates] === playerStates.current);
			});

	// active tournament state
	const	debugActiveTournamentText = game.createText("debugActiveTournamentText", "Active Tournament:");
			(debugActiveTournamentText.children[0] as baby.TextBlock).fontSize = 12;
	const	debugActiveTournamentTextValue = game.createDynamicText("debugActiveTournamentTextValue");
			(debugActiveTournamentTextValue.children[0] as baby.TextBlock).fontSize = 12;
			(debugActiveTournamentTextValue.children[0] as baby.TextBlock).onDirtyObservable.add(() =>
			{
				game.findComponentByName(pong, "debugActiveTournamentTextValue").text =
				Object.keys(game.tournamentStates).find(key => game.tournamentStates[key as keyof typeof game.tournamentStates] === pong.current.tournamentState);
			});


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
	debugVerticalStackPanel.addControl(debugStatesPanel);
	debugStatesPanel.addControl(debugIncrementStateButton);
	debugStatesPanel.addControl(debugStatesValue);
	debugStatesPanel.addControl(debugDecrementStatesButton);

	debugVerticalStackPanel.addControl(debugActiveCamText);
	debugVerticalStackPanel.addControl(debugActiveCamTextValue);

	debugVerticalStackPanel.addControl(debugActiveLanguageText);
	debugVerticalStackPanel.addControl(debugActiveLanguageTextValue);

	debugVerticalStackPanel.addControl(debugActiveGameModeText);
	debugVerticalStackPanel.addControl(debugActiveGameModeTextValue);

	debugVerticalStackPanel.addControl(debugActivePlayerStateText);
	debugVerticalStackPanel.addControl(debugActivePlayerStateTextValue);

	debugVerticalStackPanel.addControl(debugActiveTournamentText);
	debugVerticalStackPanel.addControl(debugActiveTournamentTextValue);

	// Add the screen to the GUI texture
	pong.current.debugGUI = debugGUI;
	pong.current.guiTexture?.addControl(debugGUI);
}

// ****************************************************************************** //
//                                                                                //
//                                  COUNTDOWN                                     //
//                                                                                //
// ****************************************************************************** //

export const	instantiateCountdownGUI = (pong: React.RefObject<game.pongStruct>): void =>
{
	// Canvas that will be used for the GUI
	const	countdownGUI = game.createScreen("waitingRoundStartGUI", "top");

	// All GUI components needed
	const	waitingRoundStartContainer = game.createAdaptiveContainer("waitingRoundStartContainer", "300px", "300px", undefined, "top");
	const	waitingRoundStartVerticalStackPanel = game.createVerticalStackPanel("waitingRoundStartVerticalStackPanel");
	const	waitingRoundStartTitle = game.createDynamicTitle("waitingRoundStartTitle", "startingIn");
	// const	countdown = game.createDynamicText("countdown", () => Math.trunc(pong.current.countdown), pong);
	const	countdown = game.createText("countdown", "countdown");
			(countdown.children[0] as baby.TextBlock).fontSize = 48;
			// (countdown.children[0] as baby.TextBlock).onDirtyObservable.add(() =>
			(countdown.children[0] as baby.TextBlock).onDirtyObservable.add(() =>
			{
				game.findComponentByName(pong, "countdown").text = Math.trunc(pong.current.countdown).toString();
			});

	// Add GUI components to the main menu
	// The order of adding controls matters for the layout
	waitingRoundStartVerticalStackPanel.addControl(waitingRoundStartTitle);
	waitingRoundStartVerticalStackPanel.addControl(countdown);
	waitingRoundStartContainer.addControl(waitingRoundStartVerticalStackPanel);
	countdownGUI.addControl(waitingRoundStartContainer);

	// Add the screen to the GUI texture
	pong.current.countdownGUI = countdownGUI;
}

// ****************************************************************************** //
//                                                                                //
//                                  ARENAGUI                                      //
//                                                                                //
// ****************************************************************************** //

export const	instantiateArenaGUI = (pong: React.RefObject<game.pongStruct>): void =>
{
	// Canvas that will be used for the GUI
	const	arenaGUI = game.createScreen("scoresGUI", "top");

	// All GUI components needed
	const	BGSemiTransparentColor: string = "#2e344080";
	const	arenaContainer = game.createAdaptiveContainer("arenaContainer", "300px", "300px", undefined, "top");
			(arenaContainer.children[0] as baby.Rectangle).background = BGSemiTransparentColor;
	const	arenaBotContainer = game.createAdaptiveContainer("arenaBotContainer", "300px", "300px", undefined, "bottom");
			(arenaBotContainer.children[0] as baby.Rectangle).background = BGSemiTransparentColor;
	const	arenaVerticalStackPanel = game.createVerticalStackPanel("arenaVerticalStackPanel");
	const	arenaHorizontalStackPanel1 = game.createHorizontalStackPanel("arenaHorizontalStackPanel1", 0);
	const	arenaHorizontalStackPanel2 = game.createHorizontalStackPanel("scoresHorizontalStackPanel2", 0);
	const	scoresTitle = game.createDynamicTitle("scoresTitle", "arenaScoreTitle");
	const	requiredPointsText = game.createDynamicTitle("requiredPointsText", "arenaRequiredPoints");
	const	requiredPointsValue = game.createDynamicText("requiredPointsValue");
			(requiredPointsValue.children[0] as baby.TextBlock).onDirtyObservable.add(() =>
			{
				game.findComponentByName(pong, "requiredPointsValue").text = pong.current.requiredPointsToWin.toString();
			});
			(requiredPointsValue.children[0] as baby.TextBlock).fontSize = 48;
	const	player1ScoreText = game.createDynamicText("player1ScoreText", "arenaPlayer1");
	const	player2ScoreText = game.createDynamicText("player2ScoreText", "arenaPlayer2");
	const	playerSepartor = game.createText("playerSepartor", "    ");
	const	player1ScoreValue = game.createDynamicText("player1ScoreValue");
			(player1ScoreValue.children[0] as baby.TextBlock).onDirtyObservable.add(() =>
			{
				game.findComponentByName(pong, "player1ScoreValue").text = pong.current.player1Score.toString();
			});
	const	player2ScoreValue = game.createDynamicText("player2ScoreValue");
			(player2ScoreValue.children[0] as baby.TextBlock).onDirtyObservable.add(() =>
			{
				game.findComponentByName(pong, "player2ScoreValue").text = pong.current.player2Score.toString();
			});

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
}

// ****************************************************************************** //
//                                                                                //
//                                FINISHED GAME                                   //
//                                                                                //
// ****************************************************************************** //

export const	instantiateFinishedGameGUI =
(
	pong: React.RefObject<game.pongStruct>,
	states: React.RefObject<game.states> ,
	gameModes: React.RefObject<game.gameModes>
): void =>
{
	// Canvas that will be used for the GUI
	const	finishedGameGUI = game.createScreen("finishedGameGUI", "center");

	// All GUI components needed
	const	finishedGameContainer = game.createAdaptiveContainer("finishedGameContainer", "300px", "300px");
	const	finishedGameVerticalStackPanel = game.createVerticalStackPanel("finishedGameVerticalStackPanel");
	const	finishedGameHorizontalStackPanel1 = game.createHorizontalStackPanel("finishedGameHorizontalStackPanel1");
	const	finishedGameHorizontalStackPanel2 = game.createHorizontalStackPanel("finishedGameHorizontalStackPanel2");
	const	finishedGameHorizontalStackPanel3 = game.createHorizontalStackPanel("finishedGameHorizontalStackPanel3", 0);
	const	finishedGameTitle = game.createDynamicTitle("finishedGameTitle", "finishedGameTitle");

	const	scoredText1 = game.createDynamicText("scoredText1", "scored");
	const	scoredText2 = game.createDynamicText("scoredText2", "scored");

	const	finishedGameWinnerText = game.createDynamicText("finishedGameWinnerText", "winner");
			(finishedGameWinnerText.children[0] as baby.TextBlock).color = game.colorsScheme.auroraAccent4;
	const	finishedGameWinnerPlayer = game.createDynamicText("finishedGameWinnerPlayer", (pong.current.player1Score > pong.current.player2Score ? "resultPlayer1" : "resultPlayer2"));
			finishedGameWinnerPlayer.onDirtyObservable.add(() =>
			{
				if (gameModes.current === game.gameModes.tournament && pong.current.playerNameLeft && pong.current.playerNameRight)
				{
					const winner = pong.current.player1Score > pong.current.player2Score ? pong.current!.playerNameLeft : pong.current!.playerNameRight;
					game.findComponentByName(pong, "finishedGameWinnerPlayer").text = winner;
					console.warn("❌❌❌❌ WINNER")
				}
			});

	const	finishedGameWinnerScore = game.createDynamicText("finishedGameWinnerScore");
			(finishedGameWinnerScore.children[0] as baby.TextBlock).onDirtyObservable.add(() =>
			{
				const winnerScore = Math.max(pong.current.player1Score, pong.current.player2Score);
				game.findComponentByName(pong, "finishedGameWinnerScore").text = winnerScore.toString();
			});
	const	finishedGameLooserText = game.createDynamicText("finishedGameLooserText", "looser");
			(finishedGameLooserText.children[0] as baby.TextBlock).color = game.colorsScheme.auroraAccent1;
	const	finishedGameLooserPlayer = game.createDynamicText("finishedGameLooserPlayer", (pong.current.player1Score < pong.current.player2Score ? "resultPlayer2" : "resultPlayer1"));
			finishedGameLooserPlayer.onDirtyObservable.add(() =>
			{
				if (gameModes.current === game.gameModes.tournament && pong.current.playerNameLeft && pong.current.playerNameRight)
				{
					const looser = pong.current.player1Score < pong.current.player2Score ? pong.current.playerNameLeft : pong.current.playerNameRight;
					game.findComponentByName(pong, "finishedGameLooserPlayer").text = looser;
					console.warn("❌❌❌❌ LOOSER")
				}
			});

	const	finishedGameLooserScore = game.createDynamicText("finishedGameLooserScore");
			(finishedGameLooserScore.children[0] as baby.TextBlock).onDirtyObservable.add(() =>
			{
				const loserScore = Math.min(pong.current.player1Score, pong.current.player2Score);
				game.findComponentByName(pong, "finishedGameLooserScore").text = loserScore.toString();
			});
	const	finishedGameBackButton = game.createDynamicButton("finishedGameBackButton", () =>
	{
		states.current = game.states.main_menu;
		gameModes.current = game.gameModes.none;
		game.transitionToCamera(pong.current.scene?.activeCamera as baby.FreeCamera, pong.current.mainMenuCam, 1, pong, states);
	}, pong, "back");
	pong.current.finishedGameBackButton = finishedGameBackButton;
	const	finishedGameReplayButton = game.createDynamicButton("finishedGameReplayButton", () =>
	{
		game.resetBall(pong.current);
		game.resetPaddlesPosition(pong.current);
		game.setBallDirectionRandom(pong.current);
		pong.current.player1Score = 0;
		pong.current.player2Score = 0;
		states.current = game.states.countdown;
	}, pong, "replay");
			(finishedGameReplayButton.children[0] as baby.Button).color = game.colorsScheme.auroraAccent4;
			(finishedGameReplayButton.children[0] as baby.Button).onPointerEnterObservable.add(() =>
			{
				(finishedGameReplayButton.children[0] as baby.Button).color = game.colorsScheme.dark1;
				(finishedGameReplayButton.children[0] as baby.Button).background = game.colorsScheme.auroraAccent4;
			});
			(finishedGameReplayButton.children[0] as baby.Button).onPointerOutObservable.add(() =>
			{
				(finishedGameReplayButton.children[0] as baby.Button).color = game.colorsScheme.auroraAccent4;
				(finishedGameReplayButton.children[0] as baby.Button).background = game.colorsScheme.dark1;
			});
			(finishedGameReplayButton.children[0] as baby.Button).onDirtyObservable.add(() =>
			{
				game.findComponentByName(pong, "finishedGameReplayButton").isEnabled = game.gameModes.online !== gameModes.current;
				game.findComponentByName(pong, "finishedGameReplayButton").isVisible = game.gameModes.online !== gameModes.current;
			});
	pong.current.finishedGameReplayButton = finishedGameReplayButton;
	const	finishedGameContinueButton = game.createDynamicButton("finishedGameContinueButton", () =>
	{
		states.current = game.states.tournament_bracket_preview;
		game.transitionToCamera(pong.current.scene?.activeCamera as baby.FreeCamera, pong.current.pongSettingsCam, 1, pong, states);
	}, pong, "continue");
			(finishedGameContinueButton.children[0] as baby.Button).color = game.colorsScheme.auroraAccent4;
			(finishedGameContinueButton.children[0] as baby.Button).onPointerEnterObservable.add(() =>
			{
				(finishedGameContinueButton.children[0] as baby.Button).color = game.colorsScheme.dark1;
				(finishedGameContinueButton.children[0] as baby.Button).background = game.colorsScheme.auroraAccent4;
			});
			(finishedGameContinueButton.children[0] as baby.Button).onPointerOutObservable.add(() =>
			{
				(finishedGameContinueButton.children[0] as baby.Button).color = game.colorsScheme.auroraAccent4;
				(finishedGameContinueButton.children[0] as baby.Button).background = game.colorsScheme.dark1;
			});
			(finishedGameContinueButton.children[0] as baby.Button).onDirtyObservable.add(() =>
			{
				game.findComponentByName(pong, "finishedGameContinueButton").isEnabled = game.gameModes.online !== gameModes.current;
				game.findComponentByName(pong, "finishedGameContinueButton").isVisible = game.gameModes.online !== gameModes.current;
			});
	pong.current.finishedGameContinueButton = finishedGameContinueButton;

	// Add GUI components to the main menu
	// The order of adding controls matters for the layout
	finishedGameVerticalStackPanel.addControl(finishedGameTitle);
	finishedGameVerticalStackPanel.addControl(finishedGameHorizontalStackPanel1);
	finishedGameVerticalStackPanel.addControl(finishedGameHorizontalStackPanel2);
	finishedGameVerticalStackPanel.addControl(finishedGameHorizontalStackPanel3);

	finishedGameHorizontalStackPanel1.addControl(finishedGameWinnerText);
	finishedGameHorizontalStackPanel1.addControl(finishedGameWinnerPlayer);
	finishedGameHorizontalStackPanel1.addControl(scoredText1);
	finishedGameHorizontalStackPanel1.addControl(finishedGameWinnerScore);

	finishedGameHorizontalStackPanel2.addControl(finishedGameLooserText);
	finishedGameHorizontalStackPanel2.addControl(finishedGameLooserPlayer);
	finishedGameHorizontalStackPanel2.addControl(scoredText2);
	finishedGameHorizontalStackPanel2.addControl(finishedGameLooserScore);

	finishedGameHorizontalStackPanel3.addControl(finishedGameBackButton);
	finishedGameHorizontalStackPanel3.addControl(finishedGameReplayButton);
	finishedGameHorizontalStackPanel3.addControl(finishedGameContinueButton);
	finishedGameContainer.addControl(finishedGameVerticalStackPanel);
	finishedGameGUI.addControl(finishedGameContainer);

	// Add the screen to the GUI texture
	pong.current.finishedGameGUI = finishedGameGUI;
}

// ****************************************************************************** //
//                                                                                //
//                                HOST OR JOIN                                    //
//                                                                                //
// ****************************************************************************** //

export const	instantiateHostOrJoinGUI =
(
	pong: React.RefObject<game.pongStruct>,
	states: React.RefObject<game.states>,
	gameModes: React.RefObject<game.gameModes>,
	playerStates: React.RefObject<game.playerStates>
): void =>
{
	// Canvas that will be used for the GUI
	const	hostOrJoinGUI = game.createScreen("hostOrJoinGUI", "center");

	// All GUI components needed
	const	hostOrJoinContainer = game.createAdaptiveContainer("hostOrJoinContainer", "300px", "300px");
	const	hostOrJoinVerticalStackPanel = game.createVerticalStackPanel("hostOrJoinVerticalStackPanel");

	const	hostButton = game.createDynamicButton("hostButton", () =>
	{
		playerStates.current = game.playerStates.isHost;
		states.current = game.states.game_settings;
		game.transitionToCamera(pong.current.scene?.activeCamera as baby.FreeCamera, pong.current.pongSettingsCam, 1, pong, states);
	}, pong, "host");
	const	joinButton = game.createDynamicButton("joinButton", () =>
	{
		states.current = game.states.room_list;
		game.transitionToCamera(pong.current.scene?.activeCamera as baby.FreeCamera, pong.current.pongSettingsCam, 1, pong, states);
	}, pong, "join");
	const	hostOrJoinBackButton = game.createDynamicButton("hostOrJoinBackButton", () =>
	{
		states.current = game.states.main_menu;
		gameModes.current = game.gameModes.none;
	}, pong, "back");

	// Add GUI components to the main menu
	// The order of adding controls matters for the layout
	hostOrJoinVerticalStackPanel.addControl(hostButton);
	hostOrJoinVerticalStackPanel.addControl(joinButton);
	hostOrJoinVerticalStackPanel.addControl(hostOrJoinBackButton);
	hostOrJoinContainer.addControl(hostOrJoinVerticalStackPanel);
	hostOrJoinGUI.addControl(hostOrJoinContainer);

	// Add the screen to the GUI texture
	pong.current.hostOrJoinGUI = hostOrJoinGUI;
}

// ****************************************************************************** //
//                                                                                //
//                                  ROOM LIST                                     //
//                                                                                //
// ****************************************************************************** //

export const	instantiateRoomListGUI =
(
	pong: React.RefObject<game.pongStruct>,
	states: React.RefObject<game.states>,
	gameModes: React.RefObject<game.gameModes>,
	socketRef: React.RefObject<WebSocket | null>
): void =>
{
	// Canvas that will be used for the GUI
	const	roomListGUI = game.createScreen("roomListGUI", "center");

	// All GUI components needed
	const	roomListContainer = game.createAdaptiveContainer("roomListContainer", "1200px", "600px");
	const	roomListVerticalStackPanel = game.createVerticalStackPanel("roomListVerticalStackPanel");
	const	roomListHorizontalStackPanel = game.createHorizontalStackPanel("roomListHorizontalStackPanel");
	const	roomListTitle = game.createDynamicTitle("roomListTitle", "roomListTitle");
	const	roomListBackButton = game.createDynamicButton("roomListBackButton", () =>
	{
		states.current = game.states.host_or_join;
		game.transitionToCamera(pong.current.scene?.activeCamera as baby.FreeCamera, pong.current.mainMenuCam, 1, pong, states);
	}, pong, "back");
	let		roomListOnlineRoomList = game.refreshOnlineRoomsEntries(pong, states, gameModes);
	let		roomListTournamentRoomList = game.refreshTournamentRoomsEntries(pong, states, gameModes);
	const	roomListRefreshButton = game.createDynamicButton(
	"roomListRefreshButton",
	() =>
		{
			const ws = socketRef.current;
			if (ws && ws.readyState === WebSocket.OPEN) {
			console.log("🔄 Demande de mise à jour de la liste des rooms");
			ws.send(JSON.stringify({ type: "room_list" }));

			// Nettoie l'ancien affichage
			const verticalStack = pong.current.roomListGUI?.getChildByName("roomListVerticalStackPanel") as baby.StackPanel;
			if (verticalStack) {
				const old = verticalStack.getChildByName("roomsVerticalPanel");
				if (old) verticalStack.removeControl(old);
			}
			} else {
			console.warn("❌ socketRef n'est pas prêt");
			}
		}, pong, "refresh");

	// Add GUI components to the main menu
	// The order of adding controls matters for the layout
	roomListVerticalStackPanel.addControl(roomListTitle);
	roomListVerticalStackPanel.addControl(roomListHorizontalStackPanel);
	roomListVerticalStackPanel.addControl(roomListOnlineRoomList);
	roomListVerticalStackPanel.addControl(roomListTournamentRoomList);
	roomListHorizontalStackPanel.addControl(roomListBackButton);
	roomListHorizontalStackPanel.addControl(roomListRefreshButton);
	roomListContainer.addControl(roomListVerticalStackPanel);
	roomListGUI.addControl(roomListContainer);

	pong.current.roomListVerticalStackPanel = roomListVerticalStackPanel;

	// Add the screen to the GUI texture
	pong.current.roomListGUI = roomListGUI;
}

// ****************************************************************************** //
//                                                                                //
//                                   WAITING                                      //
//                                                                                //
// ****************************************************************************** //

export const	instantiateWaitingScreenGUI =
(
	pong: React.RefObject<game.pongStruct>,
	states: React.RefObject<game.states>,
	gameModes: React.RefObject<game.gameModes>
): void =>
{
	// Canvas that will be used for the GUI

	const	waitingScreenGUI = game.createScreen("waitingScreenGUI", "center");
	// All GUI components needed
	const	waitingScreenContainer = game.createAdaptiveContainer("waitingScreenContainer", "300px", "300px");
	const	waitingScreenVerticalStackPanel = game.createVerticalStackPanel("waitingScreenVerticalStackPanel");
	const	waitingScreenTitle = game.createDynamicTitle("waitingScreenTitle", "waitingForPlayers");
	const	waitingScreenCancelButton = game.createDynamicButton("waitingScreenCancelButton", () =>
	{
		states.current = game.states.game_settings;
	}, pong, "cancel");

	// Add GUI components to the main menu
	// The order of adding controls matters for the layout
	waitingScreenVerticalStackPanel.addControl(waitingScreenTitle);
	waitingScreenVerticalStackPanel.addControl(waitingScreenCancelButton);
	waitingScreenContainer.addControl(waitingScreenVerticalStackPanel);
	waitingScreenGUI.addControl(waitingScreenContainer);

	// Add the screen to the GUI texture
	pong.current.waitingScreenGUI = waitingScreenGUI;
}

// ****************************************************************************** //
//                                                                                //
//                             TOURNAMENT TO START                                //
//                                                                                //
// ****************************************************************************** //

export const	instantiateWaitingTournamentToStartGUI =
(
	pong: React.RefObject<game.pongStruct>,
	states: React.RefObject<game.states>
): void =>
{
	const	waitingTournamentToStartGUI = game.createScreen("waitingTournamentToStartGUI", "center");
	const	waitingTournamentToStartContainer = game.createAdaptiveContainer("waitingTournamentToStartContainer");

	// Stack panels
	const	waitingTournamentToStartVerticalStackPanel = game.createVerticalStackPanel("waitingTournamentToStartVerticalStackPanel");
	const	waitingTournamentToStartHorizontalStackPanel = game.createHorizontalStackPanel("waitingTournamentToStartHorizontalStackPanel");
	const	waitingTournamentToStartHorizontalStackPanel1 = game.createHorizontalStackPanel("waitingTournamentToStartHorizontalStackPanel1", 0);

	// Title and player count
	const	waitingTournamentToStartTitle = game.createDynamicTitle("waitingTournamentToStartTitle");
	const	waitingTournamentToStartPlayerText1 = game.createDynamicText("waitingTournamentToStartPlayerText1");
	const	waitingTournamentToStartPlayerText2 = game.createText("waitingTournamentToStartPlayerText2", "/4");
	const	waitingTournamentToStartPlayerTextValue = game.createText("waitingTournamentToStartPlayerTextValue", "0");

	// Player list
	const	waitingTournamentToStartPlayer1 = game.createText("waitingTournamentToStartPlayer1", "player1");
	const	waitingTournamentToStartPlayer2 = game.createText("waitingTournamentToStartPlayer2", "player2");
	const	waitingTournamentToStartPlayer3 = game.createText("waitingTournamentToStartPlayer3", "player3");
	const	waitingTournamentToStartPlayer4 = game.createText("waitingTournamentToStartPlayer4", "player4");

	// Buttons
	const	waitingTournamentToStartButtonBack = game.createDynamicButton("waitingTournamentToStartButtonBack", () =>
	{
		states.current = game.states.host_or_join;
		game.transitionToCamera(pong.current.scene?.activeCamera as baby.FreeCamera, pong.current.mainMenuCam, 1, pong, states);
	}, pong, "back");
	pong.current.waitingTournamentToStartButtonBack = waitingTournamentToStartButtonBack;
	const	waitingTournamentToPlayButtonStart = game.createDynamicButton("waitingTournamentToPlayButtonStart", () =>
	{
		states.current = game.states.countdown;
		game.transitionToCamera(pong.current.scene?.activeCamera as baby.FreeCamera, pong.current.arenaCam, 1, pong, states);
	}, pong, "play");
	pong.current.waitingTournamentToStartButtonPlay = waitingTournamentToPlayButtonStart;
	const	waitingTournamentToStartButtonCancel = game.createDynamicButton("waitingTournamentToStartButtonCancel", () =>
	{
		states.current = game.states.game_settings;
	}, pong, "cancel");
	pong.current.waitingTournamentToStartButtonCancel = waitingTournamentToStartButtonCancel;

	// Add GUI components to the main menu
	waitingTournamentToStartGUI.addControl(waitingTournamentToStartContainer);
	waitingTournamentToStartContainer.addControl(waitingTournamentToStartVerticalStackPanel);

	// Title and player count
	waitingTournamentToStartVerticalStackPanel.addControl(waitingTournamentToStartTitle);
	waitingTournamentToStartVerticalStackPanel.addControl(waitingTournamentToStartHorizontalStackPanel);
	waitingTournamentToStartHorizontalStackPanel.addControl(waitingTournamentToStartPlayerText1);
	waitingTournamentToStartHorizontalStackPanel.addControl(waitingTournamentToStartPlayerTextValue);
	waitingTournamentToStartHorizontalStackPanel.addControl(waitingTournamentToStartPlayerText2);

	// Player list
	waitingTournamentToStartVerticalStackPanel.addControl(waitingTournamentToStartPlayer1);
	waitingTournamentToStartVerticalStackPanel.addControl(waitingTournamentToStartPlayer2);
	waitingTournamentToStartVerticalStackPanel.addControl(waitingTournamentToStartPlayer3);
	waitingTournamentToStartVerticalStackPanel.addControl(waitingTournamentToStartPlayer4);

	// Buttons
	waitingTournamentToStartVerticalStackPanel.addControl(waitingTournamentToStartHorizontalStackPanel1);
	waitingTournamentToStartHorizontalStackPanel1.addControl(waitingTournamentToStartButtonCancel);
	waitingTournamentToStartHorizontalStackPanel1.addControl(waitingTournamentToStartButtonBack);
	waitingTournamentToStartHorizontalStackPanel1.addControl(waitingTournamentToPlayButtonStart);

	// Add GUI to the GUI texture
	pong.current.waitingTournamentToStartGUI = waitingTournamentToStartGUI;
}

// ****************************************************************************** //
//                                                                                //
//                                   BRACKET                                      //
//                                                                                //
// ****************************************************************************** //

export const instantiateBracketGUI =
(
	pong: React.RefObject<game.pongStruct>,
	states: React.RefObject<game.states>,
	gameModes: React.RefObject<game.gameModes>,
	socketRef: React.RefObject<WebSocket | null>
): void =>
{
	const	bracketGUI = game.createScreen("bracketGUI", "center");
	const	bracketContainer = game.createAdaptiveContainer("bracketContainer", "800px", "600px");

	const	bracketVerticalStackPanel = game.createVerticalStackPanel("bracketVerticalStackPanel");
	const	bracketVerticalStackPanel1 = game.createVerticalStackPanel("bracketVerticalStackPanel1", 10);
	const	bracketVerticalStackPanel2 = game.createVerticalStackPanel("bracketVerticalStackPanel2", 10);
	const	bracketVerticalStackPanel3 = game.createVerticalStackPanel("bracketVerticalStackPanel3", 10);
	const	bracketHorizontalStackPanel1 = game.createHorizontalStackPanel("bracketHorizontalStackPanel1", 0);
	const	bracketHorizontalStackPanel2 = game.createHorizontalStackPanel("bracketHorizontalStackPanel2", 0);

	const	bracketLines1 = game.createBracketLines("bracketLines1");
	const	bracketLines2 = game.createBracketLines2("bracketLines2");

	// VS text separator
	const	versusText1 = game.createDynamicText("versusText1", "versus");
	const	versusText2 = game.createDynamicText("versusText2", "versus");
	const	versusText3 = game.createDynamicText("versusText3", "versus");

	// Style VS text
	(versusText1.children[0] as baby.TextBlock).fontSize = 16;
	(versusText2.children[0] as baby.TextBlock).fontSize = 16;
	(versusText3.children[0] as baby.TextBlock).fontSize = 16;

	// Title and texts
	const	bracketTitle = game.createDynamicTitle("bracketTitle", "bracketTitle");
	const	bracketRound1Text = game.createDynamicTitle("bracketRound1Text", "bracketRound1");
	const	bracketRound2Text = game.createDynamicTitle("bracketRound2Text", "bracketRound2");
	const	bracketRound3Text = game.createDynamicTitle("bracketRound3Text", "bracketRound3");

	// Style round titles
	(bracketRound1Text.children[0] as baby.TextBlock).fontSize = 32;
	(bracketRound2Text.children[0] as baby.TextBlock).fontSize = 32;
	(bracketRound3Text.children[0] as baby.TextBlock).fontSize = 32;

	// Create player cards with the new function
	const	bracketPlayer1Card = game.createCard("bracketPlayer1Card", "player1");
	const	bracketPlayer2Card = game.createCard("bracketPlayer2Card", "player2");
	const	bracketPlayer3Card = game.createCard("bracketPlayer3Card", "player3");
	const	bracketPlayer4Card = game.createCard("bracketPlayer4Card", "player4");

	// Finals cards
	const	finalPlayer1Card = game.createCard("finalPlayer1Card", "finalPlayer1");
	const	finalPlayer2Card = game.createCard("finalPlayer2Card", "finalPlayer2");

	// Winner card
	const	winnerPlayer = game.createCard("winnerPlayer", "winnerPlayer");

	// Play button
	const	bracketPlayButton = game.createDynamicButton("bracketPlayButton", () =>
	{
		if (gameModes.current !== game.gameModes.tournament)
		{
			console.warn("❌ Cannot start the game, not in tournament mode");
			return;
		}
		switch (pong.current.tournamentState)
		{
			case game.tournamentStates.waiting_game_1:
				pong.current.tournamentState = game.tournamentStates.game_1;
				// states.current = game.states.waiting_to_start;
				break;
			case game.tournamentStates.waiting_game_2:
				pong.current.tournamentState = game.tournamentStates.game_2;
				// states.current = game.states.waiting_to_start;
				break;
			case game.tournamentStates.waiting_game_3:
				pong.current.tournamentState = game.tournamentStates.game_3;
				// states.current = game.states.waiting_to_start;
				break;
		}
		states.current = game.states.waiting_to_start;
		// game.transitionToCamera(pong.current.scene?.activeCamera as baby.FreeCamera, pong.current.arenaCam, 1, pong, states);
	}, pong, "play");
			(bracketPlayButton.children[0] as baby.Button).onPointerEnterObservable.add(() =>
			{
				(bracketPlayButton.children[0] as baby.Button).color = game.colorsScheme.dark1;
				(bracketPlayButton.children[0] as baby.Button).background = game.colorsScheme.auroraAccent4;
			});
			(bracketPlayButton.children[0] as baby.Button).onPointerOutObservable.add(() =>
			{
				(bracketPlayButton.children[0] as baby.Button).color = game.colorsScheme.auroraAccent4;
				(bracketPlayButton.children[0] as baby.Button).background = game.colorsScheme.dark1;
			});
			(bracketPlayButton.children[0] as baby.Button).color = game.colorsScheme.auroraAccent4;

	// Abandon button
	const	bracketAbandonButton = game.createDynamicButton("bracketAbandonButton", () =>
	{
		// if (gameModes.current !== game.gameModes.none) {
		// 	// ✅ Envoie le leave_room au serveur
		// 	if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN)
		// 	{
		// 		socketRef.current.send
		// 		(
		// 			JSON.stringify({
		// 			type: 'leave_room',
		// 			gameId: pong.current.tournamentId, // Assure-toi que tournamentId est bien set !
		// 		}));
		// 	}
		// }
		// states.current = game.states.main_menu;
		// gameModes.current = game.gameModes.none;
		// pong.current.tournamentState = game.tournamentStates.none;
		// game.transitionToCamera(pong.current.scene?.activeCamera as baby.FreeCamera, pong.current.mainMenuCam, 1, pong, states);
		states.current = game.states.main_menu;
		gameModes.current = game.gameModes.none;
		pong.current.tournamentState = game.tournamentStates.none;
		game.transitionToCamera(pong.current.scene?.activeCamera as baby.FreeCamera, pong.current.mainMenuCam, 1, pong, states);

		// Reset tournament state
		pong.current.tournamentState = game.tournamentStates.none;
		// Reset player scores
		pong.current.tournamenFinalScore1 = 0;
		pong.current.tournamentPlayer1Score = 0;
		pong.current.tournamentPlayer2Score = 0;
		pong.current.tournamentPlayer3Score = 0;
		pong.current.tournamentPlayer4Score = 0;
		// Reset player labels
		pong.current.tournamentPlayer1Name = undefined;
		pong.current.tournamentPlayer2Name = undefined;
		pong.current.tournamentPlayer3Name = undefined;
		pong.current.tournamentPlayer4Name = undefined;
		pong.current.tournamentFinalist1 = undefined;
		pong.current.tournamentFinalist2 = undefined;
		pong.current.tournamentWinner = undefined;
		// Reset player borders
		const	player1 = bracketPlayer1Card.children[0] as baby.Container;
		const	player1Rectangle = player1.children[0] as baby.Rectangle;
				player1Rectangle.color = "transparent";
		const	player2 = bracketPlayer2Card.children[0] as baby.Container;
		const	player2Rectangle = player2.children[0] as baby.Rectangle;
				player2Rectangle.color = "transparent";
		const	player3 = bracketPlayer3Card.children[0] as baby.Container;
		const	layer3Rectangle = player3.children[0] as baby.Rectangle;
				layer3Rectangle.color = "transparent";
		const	player4 = bracketPlayer4Card.children[0] as baby.Container;
		const	player4Rectangle = player4.children[0] as baby.Rectangle;
				player4Rectangle.color = "transparent";
		const	finalPlayer1 = finalPlayer1Card.children[0] as baby.Container;
		const	finalPlayer1Rectangle = finalPlayer1.children[0] as baby.Rectangle;
				finalPlayer1Rectangle.color = "transparent";
		const	finalPlayer2 = finalPlayer2Card.children[0] as baby.Container;
		const	finalPlayer2Rectangle = finalPlayer2.children[0] as baby.Rectangle;
				finalPlayer2Rectangle.color = "transparent";
		const	winner = winnerPlayer.children[0] as baby.Container;
		const	winnerRectangle = winner.children[0] as baby.Rectangle;
				winnerRectangle.color = "transparent";
	}, pong, "abandon");
			(bracketAbandonButton.children[0] as baby.Button).onPointerEnterObservable.add(() =>
			{
				(bracketAbandonButton.children[0] as baby.Button).color = game.colorsScheme.dark1;
				(bracketAbandonButton.children[0] as baby.Button).background = game.colorsScheme.auroraAccent1;
			});
			(bracketAbandonButton.children[0] as baby.Button).onPointerOutObservable.add(() =>
			{
				(bracketAbandonButton.children[0] as baby.Button).color = game.colorsScheme.auroraAccent1;
				(bracketAbandonButton.children[0] as baby.Button).background = game.colorsScheme.dark1;
			});
			(bracketAbandonButton.children[0] as baby.Button).color = game.colorsScheme.auroraAccent1;

	// Finish button
	const	bracketFinishButton = game.createDynamicButton("bracketFinishButton", () =>
	{
		states.current = game.states.main_menu;
		gameModes.current = game.gameModes.none;
		pong.current.tournamentState = game.tournamentStates.none;
		game.transitionToCamera(pong.current.scene?.activeCamera as baby.FreeCamera, pong.current.mainMenuCam, 1, pong, states);

		// Reset tournament state
		pong.current.tournamentState = game.tournamentStates.none;
		// Reset player scores
		pong.current.tournamenFinalScore1 = 0;
		pong.current.tournamentPlayer1Score = 0;
		pong.current.tournamentPlayer2Score = 0;
		pong.current.tournamentPlayer3Score = 0;
		pong.current.tournamentPlayer4Score = 0;
		// Reset player labels
		pong.current.tournamentPlayer1Name = undefined;
		pong.current.tournamentPlayer2Name = undefined;
		pong.current.tournamentPlayer3Name = undefined;
		pong.current.tournamentPlayer4Name = undefined;
		pong.current.tournamentFinalist1 = undefined;
		pong.current.tournamentFinalist2 = undefined;
		pong.current.tournamentWinner = undefined;
		// Reset player borders
		const	player1 = bracketPlayer1Card.children[0] as baby.Container;
		const	player1Rectangle = player1.children[0] as baby.Rectangle;
				player1Rectangle.color = "transparent";
		const	player2 = bracketPlayer2Card.children[0] as baby.Container;
		const	player2Rectangle = player2.children[0] as baby.Rectangle;
				player2Rectangle.color = "transparent";
		const	player3 = bracketPlayer3Card.children[0] as baby.Container;
		const	layer3Rectangle = player3.children[0] as baby.Rectangle;
				layer3Rectangle.color = "transparent";
		const	player4 = bracketPlayer4Card.children[0] as baby.Container;
		const	player4Rectangle = player4.children[0] as baby.Rectangle;
				player4Rectangle.color = "transparent";
		const	finalPlayer1 = finalPlayer1Card.children[0] as baby.Container;
		const	finalPlayer1Rectangle = finalPlayer1.children[0] as baby.Rectangle;
				finalPlayer1Rectangle.color = "transparent";
		const	finalPlayer2 = finalPlayer2Card.children[0] as baby.Container;
		const	finalPlayer2Rectangle = finalPlayer2.children[0] as baby.Rectangle;
				finalPlayer2Rectangle.color = "transparent";
		const	winner = winnerPlayer.children[0] as baby.Container;
		const	winnerRectangle = winner.children[0] as baby.Rectangle;
				winnerRectangle.color = "transparent";
	}, pong, "finish");
			(bracketFinishButton.children[0] as baby.Button).onPointerEnterObservable.add(() =>
			{
				(bracketFinishButton.children[0] as baby.Button).color = game.colorsScheme.dark1;
				(bracketFinishButton.children[0] as baby.Button).background = game.colorsScheme.auroraAccent4;
			});
			(bracketFinishButton.children[0] as baby.Button).onPointerOutObservable.add(() =>
			{
				(bracketFinishButton.children[0] as baby.Button).color = game.colorsScheme.auroraAccent4;
				(bracketFinishButton.children[0] as baby.Button).background = game.colorsScheme.dark1;
			});
			(bracketFinishButton.children[0] as baby.Button).color = game.colorsScheme.auroraAccent4;

	// Store references for updating later
	pong.current.bracketPlayer1 = bracketPlayer1Card;
	pong.current.bracketPlayer2 = bracketPlayer2Card;
	pong.current.bracketPlayer3 = bracketPlayer3Card;
	pong.current.bracketPlayer4 = bracketPlayer4Card;

	pong.current.bracketFinalPlayer1 = finalPlayer1Card;
	pong.current.bracketFinalPlayer2 = finalPlayer2Card;

	pong.current.bracketWinnerPlayer = winnerPlayer;

	pong.current.bracketPlayButton = bracketPlayButton;
	pong.current.bracketAbandonButton = bracketAbandonButton;
	pong.current.bracketFinishButton = bracketFinishButton;

	// // Style the player cards
	// const	bracketPlayer1Container = pong.current.bracketPlayer1.children[0] as baby.Container;
	// const	bracketPlayer1Rectangle = bracketPlayer1Container.children[0] as baby.Rectangle;
	// 		bracketPlayer1Rectangle.color = game.colorsScheme.auroraAccent4;

	// const	bracketPlayer2Container = pong.current.bracketPlayer2.children[0] as baby.Container;
	// const	bracketPlayer2Rectangle = bracketPlayer2Container.children[0] as baby.Rectangle;
	// 		bracketPlayer2Rectangle.color = game.colorsScheme.auroraAccent1;

	// const	bracketPlayer3Container = pong.current.bracketPlayer3.children[0] as baby.Container;
	// const	bracketPlayer3Rectangle = bracketPlayer3Container.children[0] as baby.Rectangle;
	// 		bracketPlayer3Rectangle.color = game.colorsScheme.auroraAccent3;

	// const	bracketPlayer4Container = pong.current.bracketPlayer4.children[0] as baby.Container;
	// const	bracketPlayer4Rectangle = bracketPlayer4Container.children[0] as baby.Rectangle;
	// 		bracketPlayer4Rectangle.color = game.colorsScheme.auroraAccent3;

	// const	finalPlayer1Container = pong.current.bracketFinalPlayer1.children[0] as baby.Container;
	// const	finalPlayer1Rectangle = finalPlayer1Container.children[0] as baby.Rectangle;
	// 		finalPlayer1Rectangle.color = game.colorsScheme.auroraAccent3;

	// const	finalPlayer1Container = pong.current.bracketFinalPlayer1.children[0] as baby.Container;
	// const	finalPlayer1Stack = finalPlayer1Container.children[1] as baby.StackPanel;
	// const	finalPlayer1Label = finalPlayer1Stack.children[0] as baby.TextBlock;
	// 	finalPlayer1Label.text = "caca";
	//  game.colorsScheme.auroraAccent3;

	// // approche plus rapide mais se reset à un changement de menu, il faudra donc resend l'info depuis le serveur (chose qu'on ne fera pas mdr)
	// // Alors ca marche pas parceque dans ma situation, cette GUI n'est pas affichée au lancement du jeu, mais seulement quand cette UI est actuellement affichée
	// const test: baby.Rectangle = game.findComponentByName(pong, "finalPlayer2Background");
	// if (test) test.color = game.colorsScheme.frostAccent1;

	// Add GUI components
	bracketGUI.addControl(bracketContainer);
	bracketContainer.addControl(bracketVerticalStackPanel);
	bracketVerticalStackPanel.addControl(bracketTitle);

	// Triple column bracket layout
	bracketVerticalStackPanel.addControl(bracketHorizontalStackPanel1);
	bracketHorizontalStackPanel1.addControl(bracketVerticalStackPanel1);
	bracketHorizontalStackPanel1.addControl(bracketLines1);
	bracketHorizontalStackPanel1.addControl(bracketVerticalStackPanel2);
	bracketHorizontalStackPanel1.addControl(bracketLines2);
	bracketHorizontalStackPanel1.addControl(bracketVerticalStackPanel3);

	// First bracket entry - Player 1 vs Player 2
	bracketVerticalStackPanel1.addControl(bracketRound1Text);
	bracketVerticalStackPanel1.addControl(bracketPlayer1Card);
	bracketVerticalStackPanel1.addControl(versusText1);
	bracketVerticalStackPanel1.addControl(bracketPlayer2Card);

	// Vertical spacer
	bracketVerticalStackPanel1.addControl(game.createSpacer(0, 24));

	// First bracket entry - Player 3 vs Player 4
	bracketVerticalStackPanel1.addControl(bracketPlayer3Card);
	bracketVerticalStackPanel1.addControl(versusText2);
	bracketVerticalStackPanel1.addControl(bracketPlayer4Card);

	// Finals
	bracketVerticalStackPanel2.addControl(bracketRound2Text);
	bracketVerticalStackPanel2.addControl(finalPlayer1Card);
	bracketVerticalStackPanel2.addControl(versusText3);
	bracketVerticalStackPanel2.addControl(finalPlayer2Card);

	// Winner
	bracketVerticalStackPanel3.addControl(bracketRound3Text);
	bracketVerticalStackPanel3.addControl(winnerPlayer);

	// Add the abandon button
	bracketHorizontalStackPanel2.addControl(bracketAbandonButton);
	bracketHorizontalStackPanel2.addControl(bracketPlayButton);
	bracketHorizontalStackPanel2.addControl(bracketFinishButton);
	bracketVerticalStackPanel.addControl(bracketHorizontalStackPanel2);

	// Add GUI to the GUI texture
	pong.current.bracketGUI = bracketGUI;
}

// ****************************************************************************** //
//                                                                                //
//                               INPUT USERNAME                                   //
//                                                                                //
// ****************************************************************************** //

export const instantiateInputUsernameGUI =
(
	pong: React.RefObject<game.pongStruct>,
	states: React.RefObject<game.states>,
	gameModes: React.RefObject<game.gameModes>,
	playerStates: React.RefObject<game.playerStates>,
	lastHandledState: React.RefObject<game.states>
): void =>
{
	// Canvas that will be used for the GUI
	const	inputUsernameGUI = game.createScreen("inputUsernameGUI", "center");
	let tmp: string = "Tabarnak69";
	// All GUI components needed
	const	inputUsernameContainer = game.createAdaptiveContainer("inputUsernameContainer", "300px", "300px");
	const	inputUsernameVerticalStackPanel = game.createVerticalStackPanel("inputUsernameVerticalStackPanel");
	const	inputUsernameHorizontalStackPanel = game.createHorizontalStackPanel("inputUsernameHorizontalStackPanel", 0);
	const	inputUsernameTitle = game.createDynamicTitle("inputUsernameTitle", "inputUsernameTitle");
	const	inputUsernameTextBox1 = game.createInputText("inputUsernameTextBox1", "Tabarnak69", (value: string) =>
	{
		tmp = value;
		tmp = tmp.trim();
		if (tmp.length == 0) tmp = "Tabarnak69";
		pong.current.tournamentPlayer1Name = tmp;
	});
	pong.current.inputUsernameTextBox1 = inputUsernameTextBox1;
	const	inputUsernameTextBox2 = game.createInputText("inputUsernameTextBox2", "HOMERU", (value: string) =>
	{
		tmp = value;
		tmp = tmp.trim();
		if (tmp.length == 0) tmp = "HOMERU";
		pong.current.tournamentPlayer2Name = tmp;
	});
	pong.current.inputUsernameTextBox2 = inputUsernameTextBox2;
	const	inputUsernameTextBox3 = game.createInputText("inputUsernameTextBox3", "SteveLePoisson", (value: string) =>
	{
		tmp = value;
		tmp = tmp.trim();
		if (tmp.length == 0) tmp = "SteveLePoisson";
		pong.current.tournamentPlayer3Name = tmp;
	});
	pong.current.inputUsernameTextBox3 = inputUsernameTextBox3;
	const	inputUsernameTextBox4 = game.createInputText("inputUsernameTextBox4", "Anyme023", (value: string) =>
	{
		tmp = value;
		tmp = tmp.trim();
		if (tmp.length == 0) tmp = "Anyme023";
		pong.current.tournamentPlayer4Name = tmp;
	});
	pong.current.inputUsernameTextBox4 = inputUsernameTextBox4;

	const	inputUsernameBackButton = game.createDynamicButton("inputUsernameBackButton", () =>
	{
		switch (states.current)
		{
			default:
				states.current = game.states.main_menu;
				gameModes.current = game.gameModes.none;
				break;
			case game.states.input_username_1:
				states.current = game.states.main_menu;
				break;
			case game.states.input_username_2:
				states.current = game.states.input_username_1;
				break;
			case game.states.input_username_3:
				states.current = game.states.input_username_2;
				break;
			case game.states.input_username_4:
				states.current = game.states.input_username_3;
				break;
		}
	}, pong, "previous");

	const	inputUsernameNextButton = game.createDynamicButton("inputUsernameNextButton", () =>
	{
		switch (states.current)
		{
			default:
				break;
			case game.states.input_username_1:
				pong.current.username_1 = tmp as string;
				states.current = game.states.input_username_2;
				break;
			case game.states.input_username_2:
				pong.current.username_2 = tmp as string;
				states.current = game.states.input_username_3;
				break;
			case game.states.input_username_3:
				pong.current.username_3 = tmp as string;
				states.current = game.states.input_username_4;
				break;
			case game.states.input_username_4:
				pong.current.username_4 = tmp as string;
				states.current = game.states.game_settings;
				game.transitionToCamera(pong.current.scene?.activeCamera as baby.FreeCamera, pong.current.pongSettingsCam, 1, pong, states);
				break;
		}
	}, pong, "next");

	// Add GUI components to the main menu
	// The order of adding controls matters for the layout
	inputUsernameVerticalStackPanel.addControl(inputUsernameTitle);
	inputUsernameVerticalStackPanel.addControl(inputUsernameTextBox1);
	inputUsernameVerticalStackPanel.addControl(inputUsernameTextBox2);
	inputUsernameVerticalStackPanel.addControl(inputUsernameTextBox3);
	inputUsernameVerticalStackPanel.addControl(inputUsernameTextBox4);
	inputUsernameHorizontalStackPanel.addControl(inputUsernameBackButton);
	inputUsernameHorizontalStackPanel.addControl(inputUsernameNextButton);

	inputUsernameVerticalStackPanel.addControl(inputUsernameHorizontalStackPanel);
	inputUsernameVerticalStackPanel.addControl(game.createSpacer(0, 16)); // Add some space at the bottom
	inputUsernameContainer.addControl(inputUsernameVerticalStackPanel);
	inputUsernameGUI.addControl(inputUsernameContainer);

	// Add the screen to the GUI texture
	pong.current.inputUsernameGUI = inputUsernameGUI;
}
