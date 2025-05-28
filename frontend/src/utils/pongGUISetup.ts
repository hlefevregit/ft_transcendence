// imports
import React from 'react';

import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';


export const	instantiateGUI = (pong: React.RefObject<game.pongStruct>): void =>
{
	pong.current.guiTexture = baby.AdvancedDynamicTexture.CreateFullscreenUI("GUI", true, pong.current.scene);
}

export const	initializeAllGUIScreens = (pong: React.RefObject<game.pongStruct>, gameModes: React.RefObject<game.gameModes>, states: React.RefObject<game.states>, lang: React.RefObject<game.lang>, socketRef: React.RefObject<WebSocket | null>, navigate: (path: string) => void): void =>
{
	// Initialize the GUI texture
	console.log("initialized GUI texture...");
	game.instantiateGUI(pong);
	console.log("complete initializing GUI texture");
	
	// Initialize all the GUI screens
	console.log("initialized GUI screens...");
	game.instantiateMainMenuGUI(pong, states, gameModes, lang, navigate);
	game.instantiateSettingsGUI(pong, states, lang);
	game.instentiatePongSettingsGUI(pong, states, gameModes, lang);
	game.instantiateArenaGUI(pong, states, lang);
	game.instantiateCountdownGUI(pong, states, lang);
	game.instantiateFinishedGameGUI(pong, states, gameModes, lang);
	game.instantiateHostOrJoinGUI(pong, states, gameModes, lang);
	game.instantiateRoomListGUI(pong, states, gameModes, lang, socketRef);
	game.instantiateWaitingScreenGUI(pong, states, gameModes, lang);
	game.instantiateTournamentSettingsGUI(pong, states, gameModes, lang);
	game.instantiateDebugGUI(pong, states, gameModes, lang);
	// etc.
	console.log("complete initializing GUI screens");
}

export const	updateGUIVisibilityStates = (pong: React.RefObject<game.pongStruct>, states: game.states): void =>
{
	const	setUIState = (ui: any, stateToCheck: game.states): void => { if (ui) ui.isEnabled = ui.isVisible = (states === stateToCheck);}
	setUIState(pong.current.mainMenuGUI, game.states.main_menu);
	setUIState(pong.current.settingsGUI, game.states.settings);
	setUIState(pong.current.pongSettingsGUI, game.states.game_settings);
	setUIState(pong.current.arenaGUI, game.states.in_game);
	setUIState(pong.current.countdownGUI, game.states.countdown);
	setUIState(pong.current.finishedGameGUI, game.states.game_finished);
	setUIState(pong.current.hostOrJoinGUI, game.states.host_or_join);
	setUIState(pong.current.roomListGUI, game.states.room_list);
	setUIState(pong.current.waitingRoundStartGUI, game.states.waiting_to_start);
	setUIState(pong.current.tournamentSettingsGUI, game.states.tournament_settings);
	setUIState(pong.current.waitingScreenGUI, game.states.hosting_waiting_players);
}

export const	updateGUIVisibilityGameModes = (pong: React.RefObject<game.pongStruct>, gameModes: game.gameModes): void =>
{
	if (!pong.current.pongSettingsContinueButton || !pong.current.pongSettingsPlayButton) return;
	switch (gameModes)
	{
		case game.gameModes.tournament:
			pong.current.pongSettingsContinueButton.isEnabled = pong.current.pongSettingsContinueButton.isVisible = true;
			pong.current.pongSettingsPlayButton.isEnabled = pong.current.pongSettingsPlayButton.isVisible = false;
			break;

		// For all other game modes
		default:
			pong.current.pongSettingsContinueButton.isEnabled = pong.current.pongSettingsContinueButton.isVisible = false;
			pong.current.pongSettingsPlayButton.isEnabled = pong.current.pongSettingsPlayButton.isVisible = true;
			break;
	}
}

export const	updateGUIValues = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>, lang: React.RefObject<game.lang>): void =>
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
		
		if (control)
		{
			if (control instanceof baby.TextBlock)
			{
				if (typeof valueOrGetter === 'function') control.text = String(valueOrGetter());
			}
			else if (control instanceof baby.Button && control.children[0] instanceof baby.TextBlock)
			{
				if (typeof valueOrGetter === 'function') control.children[0].text = String(valueOrGetter());
			}
		}
	}
}

export const	refreshRoomsEntries = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>, gameModes: React.RefObject<game.gameModes>, lang: React.RefObject<game.lang>): baby.StackPanel =>
{
	if (!pong.current.rooms)
	{
		console.warn("Rooms map is not initialized !");
		return (game.createDynamicText("roomsText", () => game.getLabel("roomListEmpty", lang.current), pong));
	}
	console.log("🔁 Refreshing room list, rooms =", Array.from(pong.current.rooms.keys()));



	
	const	roomsVerticalPanel = game.createVerticalStackPanel("roomsVerticalPanel", 0);
	for (const [key, valueOrGetter] of pong.current.rooms.entries()) {
		console.log("🧱 Rendering room:", key);
		const room = valueOrGetter();
		roomsVerticalPanel.addControl(room);
	}
	return roomsVerticalPanel;
}

export const    instantiateMainMenuGUI = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>, gameModes: React.RefObject<game.gameModes>, lang: React.RefObject<game.lang>, navigate: (path: string) => void): void =>
{
	// const	navigate = useNavigate();
	// Canvas that will be used for the GUI
	const	mainMenuGUI = game.createScreen("mainMenuGUI");
	// All GUI components needed
	const	mainMenuContainer = game.createAdaptiveContainer("mainMenuContainer", "300px", "300px");
	const	mainMenuVerticalStackPanel = game.createVerticalStackPanel("mainMenuVerticalStackPanel");
	const	mainMenuHorizontalStackPanel = game.createHorizontalStackPanel("mainMenuHorizontalStackPanel");
	const	mainMenuVerticalStackPanel1 = game.createVerticalStackPanel("mainMenuVerticalStackPanel1", 0);
	const	mainMenuVerticalStackPanel2 = game.createVerticalStackPanel("mainMenuVerticalStackPanel2", 0);
	const	mainMenuDynamicTitle = game.createDynamicTitle("mainMenuTitle", () => game.getLabel("mainMenuTitle", lang.current), pong);
	const	mainMenuSettingsButton = game.createDynamicButton("mainMenuSettingsButton", () => game.getLabel("settings", lang.current), pong, () =>
	{
		states.current = game.states.settings;
	});
	const	returnToMuseumButton = game.createDynamicButton("returnToMuseumButton", () => game.getLabel("returnToMuseumButton", lang.current), pong, () =>
	{
		navigate("/game1");
	});
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
	const	localPong = game.createDynamicButton("localPong", () => game.getLabel("playLocally", lang.current), pong, () =>
	{
		gameModes.current = game.gameModes.local;
		if (!pong.current.scene) return;
		states.current = game.states.game_settings;
		game.transitionToCamera(pong.current.scene.activeCamera as baby.FreeCamera, pong.current.pongSettingsCam, 1, pong, states);
	});
	const	AIPong = game.createDynamicButton("AIPong", () => game.getLabel("playAgainstAI", lang.current), pong, () =>
	{
		gameModes.current = game.gameModes.ai;
		if (!pong.current.scene) return;
		states.current = game.states.game_settings;
		game.transitionToCamera(pong.current.scene.activeCamera as baby.FreeCamera, pong.current.pongSettingsCam, 1, pong, states);
	});
	const	remotePong = game.createDynamicButton("remotePong", () => game.getLabel("playOnline", lang.current), pong, () =>
	{
		gameModes.current = game.gameModes.online;
		if (!pong.current.scene) return;
		states.current = game.states.host_or_join;
		states.current = game.states.host_or_join;
	});
	const	tournamentPong = game.createDynamicButton("tournamentPong", () => game.getLabel("playTournament", lang.current), pong, () =>
	{
		gameModes.current = game.gameModes.tournament;
		if (!pong.current.scene) return;
		states.current = game.states.host_or_join;
		states.current = game.states.host_or_join;
	});


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
	pong.current.guiTexture?.addControl(mainMenuGUI);
}

export const    instantiateSettingsGUI = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>, lang: React.RefObject<game.lang>): void =>
{
	// Canvas that will be used for the GUI
	const	settingsGUI = game.createScreen("settingsGUI");
	const	settingsContainer = game.createAdaptiveContainer("settingsContainer");
	const	settingsPanel = game.createVerticalStackPanel("settingsPanel");
	const	settingsLanguagePanel1 = game.createHorizontalStackPanel("settingsLanguagePanel1", 0);
	const	settingsLanguagePanel2 = game.createHorizontalStackPanel("settingsLanguagePanel2", 0);

	// All GUI components needed
	const	settingsMenuTitle = game.createDynamicTitle("settingsMenuTitle", () => game.getLabel("settings", lang.current), pong);
	const	backButton = game.createDynamicButton("settingsButton", () => game.getLabel("back", lang.current), pong, () =>
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
	const	musicSliderText = game.createDynamicText("musicSliderText", () => game.getLabel("settingsMusic", lang.current), pong);
	const	soundSliderText = game.createDynamicText("soundSliderText", () => game.getLabel("settingsSound", lang.current), pong);

	// Language selection buttons
	const	englishButton = game.createButton("englishButton", "🇺🇸", () =>
	{
		lang.current = game.lang.english;
	});
			(englishButton.children[0] as baby.Button).fontSize = 36;
			(englishButton.children[0] as baby.Button).width = "100px";
			(englishButton.children[0] as baby.Button).height = "100px";

	const	frenchButton = game.createButton("frenchButton", "🇲🇫", () =>
	{
		lang.current = game.lang.french;
	});
			(frenchButton.children[0] as baby.Button).width = "100px";
			(frenchButton.children[0] as baby.Button).height = "100px";
			(frenchButton.children[0] as baby.Button).fontSize = 36;

	const	italianButton = game.createButton("italianButton", "🇮🇹", () =>
	{
		lang.current = game.lang.italian;
	});
			(italianButton.children[0] as baby.Button).width = "100px";
			(italianButton.children[0] as baby.Button).height = "100px";
			(italianButton.children[0] as baby.Button).fontSize = 36;

	const	brailButton = game.createButton("brailButton", "🦮", () =>
	{
		lang.current = game.lang.brail;
	});
			(brailButton.children[0] as baby.Button).width = "100px";
			(brailButton.children[0] as baby.Button).height = "100px";
			(brailButton.children[0] as baby.Button).fontSize = 36;

	// Add GUI components to the main menu
	// The order of adding controls matters for the layout
	settingsGUI.addControl(settingsContainer);
	settingsContainer.addControl(settingsPanel);
	
	settingsPanel.addControl(settingsMenuTitle);
	settingsPanel.addControl(backButton);

	// Music and Sound sliders
	settingsPanel.addControl(musicSliderText);
	settingsPanel.addControl(musicSlider);
	settingsPanel.addControl(soundSliderText);
	settingsPanel.addControl(soundSlider);

	// language selection panels
	settingsPanel.addControl(settingsLanguagePanel1);
	settingsPanel.addControl(settingsLanguagePanel2);
	settingsLanguagePanel1.addControl(englishButton);
	settingsLanguagePanel1.addControl(frenchButton);
	settingsLanguagePanel2.addControl(italianButton);
	settingsLanguagePanel2.addControl(brailButton);

	// Add the screen to the GUI texture
	pong.current.settingsGUI = settingsGUI;
	pong.current.guiTexture?.addControl(settingsGUI);
}

export const	instentiatePongSettingsGUI = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>, gameModes: React.RefObject<game.gameModes>, lang: React.RefObject<game.lang>): void =>
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
	// const	pongSettingsHorizontalStackPanel8 = game.createHorizontalStackPanel("pongSettingsHorizontalStackPanel8", 0);
	const	pongSettingsHorizontalStackPanel9 = game.createHorizontalStackPanel("pongSettingsHorizontalStackPanel9");

	// All GUI components needed
	const	pongSettingsTitle = game.createDynamicTitle("pongSettingsTitle", () => game.getLabel("pongSettingsTitle", lang.current), pong);
	const	pongSettingsBackButton = game.createDynamicButton("pongSettingsBackButton", () => game.getLabel("back", lang.current), pong, () =>
	{
		switch (gameModes.current)
		{
			case game.gameModes.online:
				states.current = game.states.host_or_join;
				game.transitionToCamera(pong.current.scene?.activeCamera as baby.FreeCamera, pong.current.mainMenuCam, 1, pong, states);
				break;
			case game.gameModes.tournament:
				states.current = game.states.host_or_join;
				game.transitionToCamera(pong.current.scene?.activeCamera as baby.FreeCamera, pong.current.mainMenuCam, 1, pong, states);
				break;
			default:
				states.current = game.states.main_menu;
				gameModes.current = game.gameModes.none;
				game.transitionToCamera(pong.current.scene?.activeCamera as baby.FreeCamera, pong.current.mainMenuCam, 1, pong, states);
				break;
		}
	});
	const	pongSettingsPlayButton = game.createDynamicButton("pongSettingsPlayButton", () => game.getLabel("play", lang.current), pong, () =>
	{
		switch (gameModes.current)
		{
			case game.gameModes.online:
				states.current = game.states.hosting_waiting_players;
				break;
			case game.gameModes.tournament:
				states.current = game.states.tournament_settings;
				break;
			default:
				states.current = game.states.waiting_to_start;
				break;
		}
	});
	(pongSettingsPlayButton.children[0] as baby.Button).onPointerEnterObservable.add(() => {
			(pongSettingsPlayButton.children[0] as baby.Button).color = game.colorsScheme.dark1;
			(pongSettingsPlayButton.children[0] as baby.Button).background = game.colorsScheme.auroraAccent4;
	});
	(pongSettingsPlayButton.children[0] as baby.Button).onPointerOutObservable.add(() => {
			(pongSettingsPlayButton.children[0] as baby.Button).color = game.colorsScheme.auroraAccent4;
			(pongSettingsPlayButton.children[0] as baby.Button).background = game.colorsScheme.dark1;
	});
	(pongSettingsPlayButton.children[0] as baby.Button).color = game.colorsScheme.auroraAccent4;
	const	pongSettingsContinueButton = game.createDynamicButton("pongSettingsContinueButton", () => game.getLabel("continue", lang.current), pong, () =>
	{
		switch (gameModes.current)
		{
			case game.gameModes.online:
				states.current = game.states.hosting_waiting_players;
				break;
			case game.gameModes.tournament:
				states.current = game.states.tournament_settings;
				break;
			default:
				states.current = game.states.waiting_to_start;
				break;
		}
	});
	(pongSettingsContinueButton.children[0] as baby.Button).onPointerEnterObservable.add(() => {
			(pongSettingsContinueButton.children[0] as baby.Button).color = game.colorsScheme.dark1;
			(pongSettingsContinueButton.children[0] as baby.Button).background = game.colorsScheme.auroraAccent4;
	});
	(pongSettingsContinueButton.children[0] as baby.Button).onPointerOutObservable.add(() => {
			(pongSettingsContinueButton.children[0] as baby.Button).color = game.colorsScheme.auroraAccent4;
			(pongSettingsContinueButton.children[0] as baby.Button).background = game.colorsScheme.dark1;
	});
	(pongSettingsContinueButton.children[0] as baby.Button).color = game.colorsScheme.auroraAccent4;

	const	pongSettingsTotalPointsToWinText = game.createDynamicText("pongSettingsTotalPointsToWinText", () => game.getLabel("pointsRequiredToWin", lang.current), pong);
	const	pongSettingsTotalPointsToWinTextValue = game.createDynamicText("pongSettingsTotalPointsToWinTextValue", () => pong.current.requiredPointsToWin, pong);
	const	pongSettingsTotalPointsToWin = game.createSlider("pongSettingsTotalPointsToWin", 1, 10, 1, pong.current.requiredPointsToWin, (value: number) =>
	{
		pong.current.requiredPointsToWin = value;
	});

	const	pongSettingsArenaWidthText = game.createDynamicText("pongSettingsArenaWidthText", () => game.getLabel("arenaWidth", lang.current), pong);
	const	pongSettingsArenaWidthTextValue = game.createDynamicText("pongSettingsArenaWidthTextValue", () => pong.current.arenaWidth, pong);
	const	pongSettingsArenaWidth = game.createSlider("pongSettingsArenaWidth", 7, 20, 1, pong.current.arenaWidth, (value: number) =>
	{
		pong.current.arenaWidth = value;
	});

	const	pongSettingsArenaHeightText = game.createDynamicText("pongSettingsArenaHeightText", () => game.getLabel("arenaHeight", lang.current), pong);
	const	pongSettingsArenaHeightTextValue = game.createDynamicText("pongSettingsArenaHeightTextValue", () => pong.current.arenaHeight, pong);
	const	pongSettingsArenaHeight = game.createSlider("pongSettingsArenaHeight", 7, 20, 1, pong.current.arenaHeight, (value: number) =>
	{
		pong.current.arenaHeight = value;
	});

	const	pongSettingsPaddleHeightsText = game.createDynamicText("pongSettingsPaddleHeightsText", () => game.getLabel("paddleHeight", lang.current), pong);
	const	pongSettingsPaddleHeightsTextValue = game.createDynamicText("pongSettingsPaddleHeightsTextValue", () => pong.current.paddleHeight, pong);
	const	pongSettingsPaddleHeights = game.createSlider("pongSettingsPaddleHeights", 1, 6, 1, pong.current.paddleHeight, (value: number) =>
	{
		if (!pong.current.paddle1 || !pong.current.paddle2) return;
		pong.current.paddleHeight = value;
		pong.current.paddle1.scaling.z = value;
		pong.current.paddle2.scaling.z = value;
	});

	const	pongSettingsPaddleSpeedText = game.createDynamicText("pongSettingsPaddleSpeedText", () => game.getLabel("paddleSpeed", lang.current), pong);
	const	pongSettingsPaddleSpeedTextValue = game.createDynamicText("pongSettingsPaddleSpeedTextValue", () => pong.current.paddleSpeed.toFixed(2), pong);
	const	pongSettingsPaddleSpeed = game.createSlider("pongSettingsPaddleSpeed", 0.1, 0.5, 0.05, pong.current.paddleSpeed, (value: number) =>
	{
		pong.current.paddleSpeed = value;
	});

	const	pongSettingsBallSpeedText = game.createDynamicText("pongSettingsBallSpeedText", () => game.getLabel("ballSpeed", lang.current), pong);
	const	pongSettingsBallSpeedTextValue = game.createDynamicText("pongSettingsBallSpeedTextValue", () => pong.current.ballSpeed.toFixed(2), pong);
	const	pongSettingsBallSpeed = game.createSlider("pongSettingsBallSpeed", 0.05, 0.2, 0.05, pong.current.ballSpeed, (value: number) =>
	{
		pong.current.ballSpeed = value;
	});

	const	pongSettingsMaxBallSpeedText = game.createDynamicText("pongSettingsMaxBallSpeedText", () => game.getLabel("maxBallSpeed", lang.current), pong);
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

	pongSettingsHorizontalStackPanel9.addControl(pongSettingsBackButton);
	pongSettingsHorizontalStackPanel9.addControl(pongSettingsPlayButton);
	pongSettingsHorizontalStackPanel9.addControl(pongSettingsContinueButton);

	// Save and add to GUI texture
	pong.current.pongSettingsGUI = pongSettingsGUI;
	pong.current.pongSettingsPlayButton = pongSettingsPlayButton;
	pong.current.pongSettingsContinueButton = pongSettingsContinueButton;
	pong.current.guiTexture?.addControl(pongSettingsGUI);
}

export const	instantiateDebugGUI = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>, gameModes: React.RefObject<game.gameModes>, lang: React.RefObject<game.lang>): void =>
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
	const	debugDecrementStatesButton = game.createButton("debugDecrementStateButton", "-", () =>
	{
		states.current--;
	});
			(debugIncrementStateButton.children[0] as baby.Button).fontSize = 12;
			(debugDecrementStatesButton.children[0] as baby.Button).fontSize = 12;
			(debugIncrementStateButton.children[0] as baby.Button).cornerRadius = 10;
			(debugDecrementStatesButton.children[0] as baby.Button).cornerRadius = 10;
			(debugIncrementStateButton.children[0] as baby.Button).width = "50px";
			(debugDecrementStatesButton.children[0] as baby.Button).width = "50px";
			(debugIncrementStateButton.children[0] as baby.Button).height = "50px";
			(debugDecrementStatesButton.children[0] as baby.Button).height = "50px";

	const	debugStatesPanel = game.createHorizontalStackPanel("debugButtonPanel", 2.5);
	const	debugRoomsPanel = game.createHorizontalStackPanel("debugRoomsPanel", 2.5);

	const	debugActiveCamText = game.createText("debugActiveCamText", "Active camera:");
			(debugActiveCamText.children[0] as baby.TextBlock).fontSize = 12;
	const	debugActiveCamTextValue = game.createDynamicText("debugActiveCamTextValue", () => pong.current.scene?.activeCamera?.name, pong);
			(debugActiveCamTextValue.children[0] as baby.TextBlock).fontSize = 12;

	// active languages
	const	debugActiveLanguageText = game.createText("debugActiveLanguageText", "Active language:");
			(debugActiveLanguageText.children[0] as baby.TextBlock).fontSize = 12;
	const	debugActiveLanguageTextValue = game.createDynamicText("debugActiveLanguageTextValue", () => lang.current, pong);
			(debugActiveLanguageTextValue.children[0] as baby.TextBlock).fontSize = 12;

	// active game mode
	const	debugActiveGameModeText = game.createText("debugActiveGameModeText", "Active game mode:");
			(debugActiveGameModeText.children[0] as baby.TextBlock).fontSize = 12;
	const	debugActiveGameModeTextValue = game.createDynamicText("debugActiveGameModeTextValue", () => gameModes.current, pong);
			(debugActiveGameModeTextValue.children[0] as baby.TextBlock).fontSize = 12;


	// debug add / remove rooms
	const	debugRoomsText = game.createText("debugRoomsText", "Current State");
			(debugRoomsText.children[0] as baby.TextBlock).fontSize = 12;
	const	debugRoomsTextName = game.createDynamicText("debugRoomsTextName", () => Object.keys(game.states).find(key => game.states[key as keyof typeof game.states] === states.current), pong);
			(debugRoomsTextName.children[0] as baby.TextBlock).fontSize = 12;
	const	debugRoomsValue = game.createDynamicText("debugRoomsValue", () => states.current, pong);
			(debugRoomsValue.children[0] as baby.TextBlock).fontSize = 12;
	const	debugIncrementRoomsButton = game.createButton("debugIncrementRoomsButton", "+", () =>
	{
		console.log("Adding a new room");
		pong.current.rooms?.set("room" + Math.random().toString(36), () => game.createRoomPanel(pong, lang, "room-" + Math.random().toString(36).substring(2, 15), null));
	});
	const	debugDecrementRoomsButton = game.createButton("debugDecrementRoomsButton", "-", () =>
	{
		console.log("Removing all rooms");
		for (const room of pong.current.rooms?.keys() || [])
		{
			pong.current.rooms?.delete(room);
		}
	});
			(debugIncrementRoomsButton.children[0] as baby.Button).fontSize = 12;
			(debugDecrementRoomsButton.children[0] as baby.Button).fontSize = 12;
			(debugIncrementRoomsButton.children[0] as baby.Button).cornerRadius = 10;
			(debugDecrementRoomsButton.children[0] as baby.Button).cornerRadius = 10;
			(debugIncrementRoomsButton.children[0] as baby.Button).width = "50px";
			(debugDecrementRoomsButton.children[0] as baby.Button).width = "50px";
			(debugIncrementRoomsButton.children[0] as baby.Button).height = "50px";
			(debugDecrementRoomsButton.children[0] as baby.Button).height = "50px";
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
	debugVerticalStackPanel.addControl(debugRoomsPanel);
	debugStatesPanel.addControl(debugIncrementStateButton);
	debugStatesPanel.addControl(debugStatesValue);
	debugStatesPanel.addControl(debugDecrementStatesButton);
	debugRoomsPanel.addControl(debugIncrementRoomsButton);
	debugRoomsPanel.addControl(debugRoomsValue);
	debugRoomsPanel.addControl(debugDecrementRoomsButton);

	debugVerticalStackPanel.addControl(debugActiveCamText);
	debugVerticalStackPanel.addControl(debugActiveCamTextValue);

	debugVerticalStackPanel.addControl(debugActiveLanguageText);
	debugVerticalStackPanel.addControl(debugActiveLanguageTextValue);

	debugVerticalStackPanel.addControl(debugActiveGameModeText);
	debugVerticalStackPanel.addControl(debugActiveGameModeTextValue);
	
	// Add the screen to the GUI texture
	pong.current.debugGUI = debugGUI;
	pong.current.guiTexture?.addControl(debugGUI);
}

export const	instantiateCountdownGUI = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>, lang: React.RefObject<game.lang>): void =>
{
	// Canvas that will be used for the GUI
	const	countdownGUI = game.createScreen("waitingRoundStartGUI", "top");

	// All GUI components needed
	const	waitingRoundStartContainer = game.createAdaptiveContainer("waitingRoundStartContainer", "300px", "300px", undefined, "top");
	const	waitingRoundStartVerticalStackPanel = game.createVerticalStackPanel("waitingRoundStartVerticalStackPanel");
	const	waitingRoundStartTitle = game.createDynamicTitle("waitingRoundStartTitle", () => game.getLabel("startingIn", lang.current), pong);
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

export const	instantiateArenaGUI = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>, lang: React.RefObject<game.lang>): void =>
{
	// Canvas that will be used for the GUI
	const	arenaGUI = game.createScreen("scoresGUI", "top");

	// All GUI components needed
	const	arenaContainer = game.createAdaptiveContainer("arenaContainer", "300px", "300px", undefined, "top");
	const	arenaBotContainer = game.createAdaptiveContainer("arenaBotContainer", "300px", "300px", undefined, "bottom");
	const	arenaVerticalStackPanel = game.createVerticalStackPanel("arenaVerticalStackPanel");
	const	arenaHorizontalStackPanel1 = game.createHorizontalStackPanel("arenaHorizontalStackPanel1", 0);
	const	arenaHorizontalStackPanel2 = game.createHorizontalStackPanel("scoresHorizontalStackPanel2", 0);
	const	scoresTitle = game.createDynamicTitle("scoresTitle", () => game.getLabel("arenaScoreTitle", lang.current), pong);
	const	requiredPointsText = game.createDynamicTitle("requiredPointsText", () => game.getLabel("arenaRequiredPoints", lang.current), pong);
	const	requiredPointsValue = game.createDynamicText("requiredPointsValue", () => pong.current.requiredPointsToWin, pong);
			(requiredPointsValue.children[0] as baby.TextBlock).fontSize = 48;
	const	player1ScoreText = game.createDynamicText("player1ScoreText", () => game.getLabel("arenaPlayer1", lang.current), pong);
	const	player2ScoreText = game.createDynamicText("player2ScoreText", () => game.getLabel("arenaPlayer2", lang.current), pong);
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

export const	instantiateFinishedGameGUI = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states> , gameModes: React.RefObject<game.gameModes>, lang: React.RefObject<game.lang>): void =>
{
	// Canvas that will be used for the GUI
	const	finishedGameGUI = game.createScreen("finishedGameGUI", "center");

	// All GUI components needed
	const	finishedGameContainer = game.createAdaptiveContainer("finishedGameContainer", "300px", "300px");
	const	finishedGameVerticalStackPanel = game.createVerticalStackPanel("finishedGameVerticalStackPanel");
	const	finishedGameHorizontalStackPanel1 = game.createHorizontalStackPanel("finishedGameHorizontalStackPanel1");
	const	finishedGameHorizontalStackPanel2 = game.createHorizontalStackPanel("finishedGameHorizontalStackPanel2");
	const	finishedGameHorizontalStackPanel3 = game.createHorizontalStackPanel("finishedGameHorizontalStackPanel3", 0);
	const	finishedGameTitle = game.createDynamicTitle("finishedGameTitle", () => game.getLabel("finishedGameTitle", lang.current), pong);

	const	scoredText1 = game.createDynamicText("scoredText1", () => game.getLabel("scored", lang.current), pong);
	const	scoredText2 = game.createDynamicText("scoredText2", () => game.getLabel("scored", lang.current), pong);

	const	finishedGameWinnerText = game.createDynamicText("finishedGameWinnerText", () => game.getLabel("winner", lang.current), pong);
			(finishedGameWinnerText.children[0] as baby.TextBlock).color = game.colorsScheme.auroraAccent4;
	const	finishedGameWinnerPlayer = game.createDynamicText("finishedGameWinnerPlayer", () => (pong.current.player1Score > pong.current.player2Score ? game.getLabel("resultPlayer1", lang.current) : game.getLabel("resultPlayer1", lang.current)), pong);
	const	finishedGameWinnerScore = game.createDynamicText("finishedGameWinnerScore", () => Math.max(pong.current.player1Score, pong.current.player2Score), pong);
	const	finishedGameLoserText = game.createDynamicText("finishedGameLoserText", () => game.getLabel("looser", lang.current), pong);
			(finishedGameLoserText.children[0] as baby.TextBlock).color = game.colorsScheme.auroraAccent1;
	const	finishedGameLoserPlayer = game.createDynamicText("finishedGameLoserPlayer", () => (pong.current.player1Score < pong.current.player2Score ? game.getLabel("resultPlayer2", lang.current) : game.getLabel("resultPlayer2", lang.current)), pong);
	const	finishedGameLoserScore = game.createDynamicText("finishedGameLoserScore", () => Math.min(pong.current.player1Score, pong.current.player2Score), pong);
	const	backButton = game.createDynamicButton("backButton", () => game.getLabel("back", lang.current), pong, () =>
	{
		states.current = game.states.main_menu;
		gameModes.current = game.gameModes.none;
		game.transitionToCamera(pong.current.scene?.activeCamera as baby.FreeCamera, pong.current.mainMenuCam, 1, pong, states);
	});
	const	replayButton = game.createDynamicButton("replayButton", () => game.getLabel("replay", lang.current), pong, () =>
	{
		game.resetBall(pong.current);
		game.resetPaddlesPosition(pong.current);
		game.setBallDirectionRandom(pong.current);
		pong.current.player1Score = 0;
		pong.current.player2Score = 0;
		states.current = game.states.countdown;
	});
			(replayButton.children[0] as baby.Button).onPointerEnterObservable.add(() => {
			(replayButton.children[0] as baby.Button).color = game.colorsScheme.dark1;
			(replayButton.children[0] as baby.Button).background = game.colorsScheme.auroraAccent4;
	});
			(replayButton.children[0] as baby.Button).onPointerOutObservable.add(() => {
			(replayButton.children[0] as baby.Button).color = game.colorsScheme.auroraAccent4;
			(replayButton.children[0] as baby.Button).background = game.colorsScheme.dark1;
	});
			(replayButton.children[0] as baby.Button).color = game.colorsScheme.auroraAccent4;

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

	finishedGameHorizontalStackPanel2.addControl(finishedGameLoserText);
	finishedGameHorizontalStackPanel2.addControl(finishedGameLoserPlayer);
	finishedGameHorizontalStackPanel2.addControl(scoredText2);
	finishedGameHorizontalStackPanel2.addControl(finishedGameLoserScore);

	finishedGameHorizontalStackPanel3.addControl(backButton);
	finishedGameHorizontalStackPanel3.addControl(replayButton);
	finishedGameContainer.addControl(finishedGameVerticalStackPanel);
	finishedGameGUI.addControl(finishedGameContainer);

	// Add the screen to the GUI texture
	pong.current.finishedGameGUI = finishedGameGUI;
	pong.current.guiTexture?.addControl(finishedGameGUI);
}

export const	instantiateHostOrJoinGUI = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>, gameModes: React.RefObject<game.gameModes>, lang: React.RefObject<game.lang>): void =>
{
	// Canvas that will be used for the GUI
	const	hostOrJoinGUI = game.createScreen("hostOrJoinGUI", "center");

	// All GUI components needed
	const	hostOrJoinContainer = game.createAdaptiveContainer("hostOrJoinContainer", "300px", "300px");
	const	hostOrJoinVerticalStackPanel = game.createVerticalStackPanel("hostOrJoinVerticalStackPanel");

	const	hostButton = game.createDynamicButton("hostButton", () => game.getLabel("host", lang.current), pong, () =>
	{
		states.current = game.states.game_settings;
		game.transitionToCamera(pong.current.scene?.activeCamera as baby.FreeCamera, pong.current.pongSettingsCam, 1, pong, states);
	});
	const	joinButton = game.createDynamicButton("joinButton", () => game.getLabel("join", lang.current), pong, () =>
	{
		states.current = game.states.room_list;
		game.transitionToCamera(pong.current.scene?.activeCamera as baby.FreeCamera, pong.current.pongSettingsCam, 1, pong, states);
	});
	const	hostOrJoinBackButton = game.createDynamicButton("hostOrJoinBackButton", () => game.getLabel("back", lang.current), pong, () =>
	{
		states.current = game.states.main_menu;
		gameModes.current = game.gameModes.none;
	});

	// Add GUI components to the main menu
	// The order of adding controls matters for the layout
	hostOrJoinVerticalStackPanel.addControl(hostButton);
	hostOrJoinVerticalStackPanel.addControl(joinButton);
	hostOrJoinVerticalStackPanel.addControl(hostOrJoinBackButton);
	hostOrJoinContainer.addControl(hostOrJoinVerticalStackPanel);
	hostOrJoinGUI.addControl(hostOrJoinContainer);

	// Add the screen to the GUI texture
	pong.current.hostOrJoinGUI = hostOrJoinGUI;
	pong.current.guiTexture?.addControl(hostOrJoinGUI);
}

export const	instantiateRoomListGUI = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>, gameModes: React.RefObject<game.gameModes>, lang: React.RefObject<game.lang>, socketRef: React.RefObject<WebSocket | null>): void =>
{
	// Canvas that will be used for the GUI
	const	roomListGUI = game.createScreen("roomListGUI", "center");

	// All GUI components needed
	const	roomListContainer = game.createAdaptiveContainer("roomListContainer", "1200px", "600px");
	const	roomListVerticalStackPanel = game.createVerticalStackPanel("roomListVerticalStackPanel");
	const	roomListHorizontalStackPanel = game.createHorizontalStackPanel("roomListHorizontalStackPanel");
	const	roomListTitle = game.createDynamicTitle("roomListTitle", () => game.getLabel("roomListTitle", lang.current), pong);
	const	roomListBackButton = game.createDynamicButton("roomListBackButton", () => game.getLabel("back", lang.current), pong, () =>
	{
		states.current = game.states.host_or_join;
		game.transitionToCamera(pong.current.scene?.activeCamera as baby.FreeCamera, pong.current.mainMenuCam, 1, pong, states);
	});
	let		roomListDynamicRoomList = game.refreshRoomsEntries(pong, states, gameModes, lang);
	const roomListRefreshButton = game.createDynamicButton(
	"roomListRefreshButton",
	() => game.getLabel("refresh", lang.current),
	pong,
	() => {
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
		}
	);

	// Add GUI components to the main menu
	// The order of adding controls matters for the layout
	roomListVerticalStackPanel.addControl(roomListTitle);
	roomListVerticalStackPanel.addControl(roomListHorizontalStackPanel);
	roomListVerticalStackPanel.addControl(roomListDynamicRoomList);
	roomListHorizontalStackPanel.addControl(roomListBackButton);
	roomListHorizontalStackPanel.addControl(roomListRefreshButton);
	roomListContainer.addControl(roomListVerticalStackPanel);
	roomListGUI.addControl(roomListContainer);


	// Add the screen to the GUI texture
	pong.current.roomListGUI = roomListGUI;
	pong.current.guiTexture?.addControl(roomListGUI);
	pong.current.roomListVerticalStackPanel = roomListVerticalStackPanel;

}

export const	instantiateWaitingScreenGUI = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>, gameModes: React.RefObject<game.gameModes>, lang: React.RefObject<game.lang>): void =>
{
	// Canvas that will be used for the GUI
	const	waitingScreenGUI = game.createScreen("waitingScreenGUI", "center");

	// All GUI components needed
	const	waitingScreenContainer = game.createAdaptiveContainer("waitingScreenContainer", "300px", "300px");
	const	waitingScreenVerticalStackPanel = game.createVerticalStackPanel("waitingScreenVerticalStackPanel");
	const	waitingScreenTitle = game.createDynamicTitle("waitingScreenTitle", () => game.getLabel("waitingForPlayers", lang.current), pong);
	const	waitingScreenCancelButton = game.createDynamicButton("waitingScreenCancelButton", () => game.getLabel("cancel", lang.current), pong, () => 
	{
		states.current = game.states.game_settings;
	});

	// Add GUI components to the main menu
	// The order of adding controls matters for the layout
	waitingScreenVerticalStackPanel.addControl(waitingScreenTitle);
	waitingScreenVerticalStackPanel.addControl(waitingScreenCancelButton);
	waitingScreenContainer.addControl(waitingScreenVerticalStackPanel);
	waitingScreenGUI.addControl(waitingScreenContainer);

	// Add the screen to the GUI texture
	pong.current.waitingScreenGUI = waitingScreenGUI;
	pong.current.guiTexture?.addControl(waitingScreenGUI);
}

export const	instantiateTournamentSettingsGUI = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>, gameModes: React.RefObject<game.gameModes>, lang: React.RefObject<game.lang>): void =>
{
	const	tournamentSettingsGUI = game.createScreen("tournamentSettingsGUI", "center");
	const	tournamentSettingsContainer = game.createAdaptiveContainer("tournamentSettingsContainer", "300px", "300px");
	const	tournamentSettingsVerticalStackPanel1 = game.createVerticalStackPanel("tournamentSettingsVerticalStackPanel1");
	const	tournamentSettingsHorizontalStackPanel1 = game.createHorizontalStackPanel("tournamentSettingsHorizontalStackPanel1", 0);
	const	tournamentSettingsHorizontalStackPanel2 = game.createHorizontalStackPanel("tournamentSettingsHorizontalStackPanel2", 0);
	
	// All GUI components needed
	const	tournamentSettingsTitle = game.createDynamicTitle("tournamentSettingsTitle", () => game.getLabel("tournamentSettingsTitle", lang.current), pong);

	const	tournamentSettingsPlayerCountText = game.createDynamicText("tournamentSettingsPlayerCountText", () => game.getLabel("tournamentSettingsPlayerCount", lang.current), pong);
	const	tournamentSettingsPlayerCountValue = game.createDynamicText("tournamentSettingsPlayerCountValue", () => pong.current.tournamentPlayerCount, pong);
	const	tournamentSettingsPlayerCountSlider = game.createSlider("tournamentSettingsPlayerCountSlider", 3, 8, 1, pong.current.tournamentPlayerCount, (value: number) => 
	{
		pong.current.tournamentPlayerCount = value;
	});
	const	tournamentSettingsBackButton = game.createDynamicButton("tournamentSettingsBackButton", () => game.getLabel("back", lang.current), pong, () =>
	{
		states.current = game.states.game_settings;
		gameModes.current = game.gameModes.tournament;
	});
	const	tournamentSettingsPlayButton = game.createDynamicButton("tournamentSettingsPlayButton", () => game.getLabel("play", lang.current), pong, () =>
	{
		states.current = game.states.waiting_to_start;
		game.transitionToCamera(pong.current.scene?.activeCamera as baby.FreeCamera, pong.current.arenaCam, 1, pong, states);
	});
	(tournamentSettingsPlayButton.children[0] as baby.Button).onPointerEnterObservable.add(() => {
			(tournamentSettingsPlayButton.children[0] as baby.Button).color = game.colorsScheme.dark1;
			(tournamentSettingsPlayButton.children[0] as baby.Button).background = game.colorsScheme.auroraAccent4;
	});
	(tournamentSettingsPlayButton.children[0] as baby.Button).onPointerOutObservable.add(() => {
			(tournamentSettingsPlayButton.children[0] as baby.Button).color = game.colorsScheme.auroraAccent4;
			(tournamentSettingsPlayButton.children[0] as baby.Button).background = game.colorsScheme.dark1;
	});
	(tournamentSettingsPlayButton.children[0] as baby.Button).color = game.colorsScheme.auroraAccent4;

	// Add GUI components to the main menu
	// The order of adding controls matters for the layout
	tournamentSettingsVerticalStackPanel1.addControl(tournamentSettingsTitle);
	tournamentSettingsVerticalStackPanel1.addControl(tournamentSettingsHorizontalStackPanel1);
	
	tournamentSettingsHorizontalStackPanel1.addControl(tournamentSettingsPlayerCountText);
	tournamentSettingsHorizontalStackPanel1.addControl(tournamentSettingsPlayerCountValue);
	tournamentSettingsVerticalStackPanel1.addControl(tournamentSettingsHorizontalStackPanel1);
	tournamentSettingsVerticalStackPanel1.addControl(tournamentSettingsPlayerCountSlider);
	
	
	tournamentSettingsHorizontalStackPanel2.addControl(tournamentSettingsBackButton);
	tournamentSettingsHorizontalStackPanel2.addControl(tournamentSettingsPlayButton);
	
	tournamentSettingsVerticalStackPanel1.addControl(tournamentSettingsHorizontalStackPanel2);
	tournamentSettingsContainer.addControl(tournamentSettingsVerticalStackPanel1);
	tournamentSettingsGUI.addControl(tournamentSettingsContainer);



	// Add the screen to the GUI texture
	pong.current.tournamentSettingsGUI = tournamentSettingsGUI;
	pong.current.guiTexture?.addControl(tournamentSettingsGUI);
}