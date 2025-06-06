// imports
import React from 'react';

import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';


export const	instantiateGUI = (pong: React.RefObject<game.pongStruct>): void =>
{
	pong.current.guiTexture = baby.AdvancedDynamicTexture.CreateFullscreenUI("GUI", true, pong.current.scene);
	// if (pong.current.guiTexture.layer) {
    //     pong.current.guiTexture.layer.renderingGroupId = 1;
    // }
}

export const	initializeAllGUIScreens = (pong: React.RefObject<game.pongStruct>, gameModes: React.RefObject<game.gameModes>, states: React.RefObject<game.states>, playerStates: React.RefObject<game.playerStates>, lang: React.RefObject<game.lang>, socketRef: React.RefObject<WebSocket | null>, navigate: (path: string) => void): void =>
{
	// Initialize the GUI texture
	console.log("initialized GUI texture...");
	game.instantiateGUI(pong);
	console.log("complete initializing GUI texture");
	
	// Initialize all the GUI screens
	console.log("initialized GUI screens...");
	game.instantiateMainMenuGUI(pong, states, gameModes, navigate);
	game.instantiateSettingsGUI(pong, states, lang);
	game.instentiatePongSettingsGUI(pong, states, gameModes, playerStates);
	game.instantiateArenaGUI(pong);
	game.instantiateCountdownGUI(pong);
	game.instantiateFinishedGameGUI(pong, states, gameModes);
	game.instantiateHostOrJoinGUI(pong, states, gameModes, playerStates);
	game.instantiateRoomListGUI(pong, states, gameModes, socketRef);
	game.instantiateWaitingScreenGUI(pong, states);
	game.instantiateWaitingTournamentToStartGUI(pong, states);
	// game.instantiateBracketGUI(pong, states, gameModes);
	game.instantiateDebugGUI(pong, states, gameModes, playerStates, lang);
	// etc.
	console.log("complete initializing GUI screens");
}

export const	updateGUIVisibilityStates = (pong: React.RefObject<game.pongStruct>, states: game.states): void =>
{
	// const	setUIState = (ui: any, stateToCheck: game.states): void =>
	// {
	// 	const newUI = ui instanceof baby.Rectangle
	// 	if (newUI)
	// 	{
	// 		const bool: boolean = states === stateToCheck;
	// 		ui.isEnabled = bool
	// 		ui.isVisible = bool;
	// 		// ui.notRenderable = !bool;
	// 	}
	// };
	const setUIState = (ui: baby.Container | undefined, stateToCheck: game.states): void =>
	{
        if (ui === undefined || !pong.current.guiTexture) return;
        
        const	shouldShow: boolean = states === stateToCheck;
        const	isCurrentlyAdded: boolean = pong.current.guiTexture.getDescendants().includes(ui);
        
        if (shouldShow && !isCurrentlyAdded) pong.current.guiTexture.addControl(ui);
        else if (!shouldShow && isCurrentlyAdded) pong.current.guiTexture.removeControl(ui);
    }
	setUIState(pong.current.mainMenuGUI, game.states.main_menu);
	setUIState(pong.current.settingsGUI, game.states.settings);
	setUIState(pong.current.pongSettingsGUI, game.states.game_settings);
	setUIState(pong.current.arenaGUI, game.states.in_game);
	setUIState(pong.current.countdownGUI, game.states.countdown);
	setUIState(pong.current.finishedGameGUI, game.states.game_finished);
	setUIState(pong.current.hostOrJoinGUI, game.states.host_or_join);
	setUIState(pong.current.roomListGUI, game.states.room_list);
	setUIState(pong.current.waitingRoundStartGUI, game.states.waiting_to_start);
	setUIState(pong.current.waitingTournamentToStartGUI, game.states.waiting_tournament_to_start);
	setUIState(pong.current.waitingScreenGUI, game.states.hosting_waiting_players);
	// setUIState(pong.current.bracketGUI, game.states.tournament_bracket_preview);

	pong.current.guiTexture?.removeControl(pong.current.debugGUI as baby.Container);
	pong.current.guiTexture?.addControl(pong.current.debugGUI as baby.Container);
}

export const	updateGUIVisibilityPlayerStates = (pong: React.RefObject<game.pongStruct>, playerStates: game.playerStates): void =>
{
	if
	(
		   !pong.current.waitingTournamentToStartButtonBack
		|| !pong.current.waitingTournamentToStartButtonCancel
		|| !pong.current.waitingTournamentToStartButtonPlay
	) return;
	switch (playerStates)
	{
		case game.playerStates.isHost:
			pong.current.waitingTournamentToStartButtonBack.isEnabled = pong.current.waitingTournamentToStartButtonBack.isVisible = false;
			pong.current.waitingTournamentToStartButtonCancel.isEnabled = pong.current.waitingTournamentToStartButtonCancel.isVisible = true;
			pong.current.waitingTournamentToStartButtonPlay.isEnabled = pong.current.waitingTournamentToStartButtonPlay.isVisible = true;
			break;
		case game.playerStates.isPlayer:
			pong.current.waitingTournamentToStartButtonBack.isEnabled = pong.current.waitingTournamentToStartButtonBack.isVisible = true;
			pong.current.waitingTournamentToStartButtonCancel.isEnabled = pong.current.waitingTournamentToStartButtonCancel.isVisible = false;
			pong.current.waitingTournamentToStartButtonPlay.isEnabled = pong.current.waitingTournamentToStartButtonPlay.isVisible = false;
			break;

		// For all other player states
		default:
			pong.current.waitingTournamentToStartButtonBack.isEnabled = pong.current.waitingTournamentToStartButtonBack.isVisible = false;
			pong.current.waitingTournamentToStartButtonCancel.isEnabled = pong.current.waitingTournamentToStartButtonCancel.isVisible = false;
			pong.current.waitingTournamentToStartButtonPlay.isEnabled = pong.current.waitingTournamentToStartButtonPlay.isVisible = false;
			break;
	}
}

export const	updateGUIValues = (
	pong: React.RefObject<game.pongStruct>,
	states: React.RefObject<game.states>,
	lang: React.RefObject<game.lang>): void =>
{
	if (!pong.current.guiTexture)
	{
		console.warn("guiTexture is not initialized !");
		return;
	}
	
	// Process text elements with metadata
	const allControls = pong.current.guiTexture.getDescendants();
	for (const control of allControls)
	{
		if (control.metadata?.labelKey)
		{
			// Update TextBlocks directly
			if (control instanceof baby.TextBlock)
			{
				control.text = game.getLabel(control.metadata.labelKey, lang.current);
				// control.markAsDirty();
			}
			// Update Button labels (first child is typically the TextBlock)
			else if (control instanceof baby.Button
					&& control.children.length > 0
					&& control.children[0] instanceof baby.TextBlock)
			{
				(control.children[0] as baby.TextBlock).text = game.getLabel(control.metadata.labelKey, lang.current);
				// control.markAsDirty();
			}
		}
		// Check for nested TextBlocks with metadata in other controls
		else if (control instanceof baby.Button 
				&& control.children.length > 0
				&& control.children[0] instanceof baby.TextBlock
				&& control.children[0].metadata?.labelKey)
		{
			(control.children[0] as baby.TextBlock).text = game.getLabel(control.children[0].metadata.labelKey, lang.current);
			// control.markAsDirty();
		}
	}
}

export const	refreshOnlineRoomsEntries = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>, gameModes: React.RefObject<game.gameModes>): baby.StackPanel =>
{
	if (!pong.current.rooms)
	{
		console.warn("Rooms map is not initialized !");
		return (game.createDynamicText("roomsText", "roomListEmpty"));
	}
	console.log("🔁 Refreshing room list, rooms =", Array.from(pong.current.rooms.keys()));

	const	roomsOnlineVerticalPanel = game.createVerticalStackPanel("roomsOnlineVerticalPanel", 0);
	for (const [key, valueOrGetter] of pong.current.rooms.entries())
	{
		console.log("🧱 Rendering room:", key);
		const room = valueOrGetter();
		roomsOnlineVerticalPanel.addControl(room);
	}
	return roomsOnlineVerticalPanel;
}

export const	refreshTournamentRoomsEntries = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>, gameModes: React.RefObject<game.gameModes>): baby.StackPanel =>
{
	if (!pong.current.rooms)
	{
		console.warn("Rooms map is not initialized !");
		return (game.createDynamicText("roomsText", "roomListEmpty"));
	}
	console.log("🔁 Refreshing room list, rooms =", Array.from(pong.current.rooms.keys()));

	const	roomsTournamentVerticalPanel = game.createVerticalStackPanel("roomsTournamentVerticalPanel", 0);
	for (const [key, valueOrGetter] of pong.current.rooms.entries())
	{
		console.log("🧱 Rendering room:", key);
		const room = valueOrGetter();
		roomsTournamentVerticalPanel.addControl(room);
	}
	return roomsTournamentVerticalPanel;
}

export const    instantiateMainMenuGUI = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>, gameModes: React.RefObject<game.gameModes>, navigate: (path: string) => void): void =>
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
	}, "settings");
	const	returnToMuseumButton = game.createDynamicButton("returnToMuseumButton", () =>
	{
		navigate("/game1");
	}, "returnToMuseumButton");
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
	}, "playLocally");
	const	AIPong = game.createDynamicButton("AIPong", () =>
	{
		if (!pong.current.scene) return;
		gameModes.current = game.gameModes.ai;
		states.current = game.states.game_settings;
		game.transitionToCamera(pong.current.scene.activeCamera as baby.FreeCamera, pong.current.pongSettingsCam, 1, pong, states);
	}, "playAgainstAI");
	const	remotePong = game.createDynamicButton("remotePong", () =>
	{
		gameModes.current = game.gameModes.online;
		if (!pong.current.scene) return;
		states.current = game.states.host_or_join;
		states.current = game.states.host_or_join;
	}, "playOnline");
	const	tournamentPong = game.createDynamicButton("tournamentPong", () =>
	{
		gameModes.current = game.gameModes.tournament;
		if (!pong.current.scene) return;
		states.current = game.states.host_or_join;
		states.current = game.states.host_or_join;
	}, "playTournament");


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

export const    instantiateSettingsGUI = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>, lang: React.RefObject<game.lang>): void =>
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
	}, "back");
	const	musicSlider = game.createSlider("musicSlider", 0, 100, 2, pong.current.musicVolume * 100, (value: number) =>
	{
		pong.current.musicVolume = value / 100;
		game.findComponentByName(pong, "musicSliderTextValue").text = pong.current.musicVolume.toFixed(2);
	});
	const	soundSlider = game.createSlider("soundSlider", 0, 100, 2, pong.current.soundVolume * 100, (value: number) =>
	{
		pong.current.soundVolume = value / 100;
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
		game.updateGUIValues(pong, states, lang);
		game.findComponentByName(pong, "debugActiveLanguageTextValue").text = lang.current;
	});
			(englishButton.children[0] as baby.Button).fontSize = 36;
			(englishButton.children[0] as baby.Button).width = "100px";
			(englishButton.children[0] as baby.Button).height = "100px";

	const	frenchButton = game.createButton("frenchButton", "🇲🇫", () =>
	{
		lang.current = game.lang.french;
		game.updateGUIValues(pong, states, lang);
		game.findComponentByName(pong, "debugActiveLanguageTextValue").text = lang.current;
	});
			(frenchButton.children[0] as baby.Button).width = "100px";
			(frenchButton.children[0] as baby.Button).height = "100px";
			(frenchButton.children[0] as baby.Button).fontSize = 36;

	const	italianButton = game.createButton("italianButton", "🇮🇹", () =>
	{
		lang.current = game.lang.italian;
		game.updateGUIValues(pong, states, lang);
		game.findComponentByName(pong, "debugActiveLanguageTextValue").text = lang.current;
		game.findComponentByName(pong, "debugActiveLanguageTextValue").markAsDirty();
	});
			(italianButton.children[0] as baby.Button).width = "100px";
			(italianButton.children[0] as baby.Button).height = "100px";
			(italianButton.children[0] as baby.Button).fontSize = 36;

	const	brailButton = game.createButton("brailButton", "🦮", () =>
	{
		lang.current = game.lang.braille;
		game.updateGUIValues(pong, states, lang);
		game.findComponentByName(pong, "debugActiveLanguageTextValue").text = lang.current;
		game.findComponentByName(pong, "debugActiveLanguageTextValue").markAsDirty();
	});
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
	// pong.current.guiTexture?.addControl(settingsGUI);
}

export const	instentiatePongSettingsGUI = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>, gameModes: React.RefObject<game.gameModes>, playerStates: React.RefObject<game.playerStates>): void =>
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
				states.current = game.states.host_or_join;
				game.transitionToCamera(pong.current.scene?.activeCamera as baby.FreeCamera, pong.current.mainMenuCam, 1, pong, states);
				break;
			default:
				states.current = game.states.main_menu;
				gameModes.current = game.gameModes.none;
				game.transitionToCamera(pong.current.scene?.activeCamera as baby.FreeCamera, pong.current.mainMenuCam, 1, pong, states);
				break;
		}
		playerStates.current = game.playerStates.none;
	}, "back");
	const	pongSettingsPlayButton = game.createDynamicButton("pongSettingsPlayButton", () =>
	{
		switch (gameModes.current)
		{
			case game.gameModes.online:
				states.current = game.states.hosting_waiting_players;
				break;
			case game.gameModes.tournament:
				states.current = game.states.waiting_tournament_to_start;
				console.log("🚀🚀🚀 switching to waiting_tournament_to_start 🚀🚀🚀");
				break;
			default:
				states.current = game.states.waiting_to_start;
				break;
		}
	}, "play");
	(pongSettingsPlayButton.children[0] as baby.Button).onPointerEnterObservable.add(() => {
			(pongSettingsPlayButton.children[0] as baby.Button).color = game.colorsScheme.dark1;
			(pongSettingsPlayButton.children[0] as baby.Button).background = game.colorsScheme.auroraAccent4;
	});
	(pongSettingsPlayButton.children[0] as baby.Button).onPointerOutObservable.add(() => {
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
	const	pongSettingsArenaWidth = game.createSlider("pongSettingsArenaWidth", 7, 20, 1, pong.current.arenaWidth, (value: number) =>
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
	// pong.current.guiTexture?.addControl(pongSettingsGUI);
}

export const	instantiateDebugGUI = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>, gameModes: React.RefObject<game.gameModes>, playerStates: React.RefObject<game.playerStates>, lang: React.RefObject<game.lang>): void =>
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
			(debugFramerateValue.children[0] as baby.TextBlock).onTextChangedObservable.add(() =>
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
	});
	const	debugDecrementStatesButton = game.createButton("debugDecrementStateButton", "-", () =>
	{
		states.current--;
		game.findComponentByName(pong, "debugStatesValue").text = states.current.toString();
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
				game.findComponentByName(pong, "debugActiveLanguageTextValue").text = Object.keys(game.lang).find(key => game.lang[key as keyof typeof game.lang] === lang.current);
			});

	// active game mode
	const	debugActiveGameModeText = game.createText("debugActiveGameModeText", "Active game mode:");
			(debugActiveGameModeText.children[0] as baby.TextBlock).fontSize = 12;
	const	debugActiveGameModeTextValue = game.createDynamicText("debugActiveGameModeTextValue");
			(debugActiveGameModeTextValue.children[0] as baby.TextBlock).fontSize = 12;
			(debugActiveGameModeTextValue.children[0] as baby.TextBlock).onDirtyObservable.add(() =>
			{
				game.findComponentByName(pong, "debugActiveGameModeTextValue").text = Object.keys(game.gameModes).find(key => game.gameModes[key as keyof typeof game.gameModes] === gameModes.current);
			});

// active game mode
	const	debugActivePlayerStateText = game.createText("debugActivePlayerStateText", "Active player state:");
			(debugActivePlayerStateText.children[0] as baby.TextBlock).fontSize = 12;
	const	debugActivePlayerStateTextValue = game.createDynamicText("debugActivePlayerStateTextValue");
			(debugActivePlayerStateTextValue.children[0] as baby.TextBlock).fontSize = 12;
			(debugActivePlayerStateTextValue.children[0] as baby.TextBlock).onDirtyObservable.add(() =>
			{
				game.findComponentByName(pong, "debugActivePlayerStateTextValue").text = Object.keys(game.playerStates).find(key => game.playerStates[key as keyof typeof game.playerStates] === playerStates.current);
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

	// Add the screen to the GUI texture
	pong.current.debugGUI = debugGUI;
	pong.current.guiTexture?.addControl(debugGUI);
}

export const	instantiateCountdownGUI = (pong: React.RefObject<game.pongStruct>): void =>
{
	// Canvas that will be used for the GUI
	const	countdownGUI = game.createScreen("waitingRoundStartGUI", "top");

	// All GUI components needed
	const	waitingRoundStartContainer = game.createAdaptiveContainer("waitingRoundStartContainer", "300px", "300px", undefined, "top");
	const	waitingRoundStartVerticalStackPanel = game.createVerticalStackPanel("waitingRoundStartVerticalStackPanel");
	const	waitingRoundStartTitle = game.createDynamicTitle("waitingRoundStartTitle", "startingIn");
	// const	countdown = game.createDynamicText("countdown", () => Math.trunc(pong.current.countdown), pong);
	const	countdown = game.createDynamicText("countdown");
			(countdown.children[0] as baby.TextBlock).fontSize = 48;
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
	// pong.current.guiTexture?.addControl(countdownGUI);
}

export const	instantiateArenaGUI = (pong: React.RefObject<game.pongStruct>): void =>
{
	// Canvas that will be used for the GUI
	const	arenaGUI = game.createScreen("scoresGUI", "top");

	// All GUI components needed
	const	arenaContainer = game.createAdaptiveContainer("arenaContainer", "300px", "300px", undefined, "top");
	const	arenaBotContainer = game.createAdaptiveContainer("arenaBotContainer", "300px", "300px", undefined, "bottom");
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
	// pong.current.guiTexture?.addControl(arenaGUI);
}

export const	instantiateFinishedGameGUI = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states> , gameModes: React.RefObject<game.gameModes>): void =>
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

	const	finishedGameWinnerScore = game.createDynamicText("finishedGameWinnerScore");
			(finishedGameWinnerScore.children[0] as baby.TextBlock).onDirtyObservable.add(() =>
			{
				const winnerScore = Math.max(pong.current.player1Score, pong.current.player2Score);
				game.findComponentByName(pong, "finishedGameWinnerScore").text = winnerScore.toString();
			});
	const	finishedGameLoserText = game.createDynamicText("finishedGameLoserText", "looser");
			(finishedGameLoserText.children[0] as baby.TextBlock).color = game.colorsScheme.auroraAccent1;
	const	finishedGameLoserPlayer = game.createDynamicText("finishedGameLoserPlayer", (pong.current.player1Score < pong.current.player2Score ? "resultPlayer2" : "resultPlayer1"));
	const	finishedGameLoserScore = game.createDynamicText("finishedGameLoserScore");
			(finishedGameLoserScore.children[0] as baby.TextBlock).onDirtyObservable.add(() =>
			{
				const loserScore = Math.min(pong.current.player1Score, pong.current.player2Score);
				game.findComponentByName(pong, "finishedGameLoserScore").text = loserScore.toString();
			});
	const	backButton = game.createDynamicButton("backButton", () =>
	{
		states.current = game.states.main_menu;
		gameModes.current = game.gameModes.none;
		game.transitionToCamera(pong.current.scene?.activeCamera as baby.FreeCamera, pong.current.mainMenuCam, 1, pong, states);
	}, "back");
	const	replayButton = game.createDynamicButton("replayButton", () =>
	{
		game.resetBall(pong.current);
		game.resetPaddlesPosition(pong.current);
		game.setBallDirectionRandom(pong.current);
		pong.current.player1Score = 0;
		pong.current.player2Score = 0;
		states.current = game.states.countdown;
	}, "replay");
			(replayButton.children[0] as baby.Button).onPointerEnterObservable.add(() => {
			(replayButton.children[0] as baby.Button).color = game.colorsScheme.dark1;
			(replayButton.children[0] as baby.Button).background = game.colorsScheme.auroraAccent4;
	});
			(replayButton.children[0] as baby.Button).onPointerOutObservable.add(() => {
			(replayButton.children[0] as baby.Button).color = game.colorsScheme.auroraAccent4;
			(replayButton.children[0] as baby.Button).background = game.colorsScheme.dark1;
	});
			(replayButton.children[0] as baby.Button).color = game.colorsScheme.auroraAccent4;
			(replayButton.children[0] as baby.Button).onDirtyObservable.add(() =>
			{
				game.findComponentByName(pong, "replayButton").isEnabled = game.gameModes.online !== gameModes.current;
				game.findComponentByName(pong, "replayButton").isVisible = game.gameModes.online !== gameModes.current;
			});

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
	// pong.current.guiTexture?.addControl(finishedGameGUI);
}

export const	instantiateHostOrJoinGUI = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>, gameModes: React.RefObject<game.gameModes>, playerStates: React.RefObject<game.playerStates>): void =>
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
	}, "host");
	const	joinButton = game.createDynamicButton("joinButton", () =>
	{
		states.current = game.states.room_list;
		game.transitionToCamera(pong.current.scene?.activeCamera as baby.FreeCamera, pong.current.pongSettingsCam, 1, pong, states);
	}, "join");
	const	hostOrJoinBackButton = game.createDynamicButton("hostOrJoinBackButton", () =>
	{
		states.current = game.states.main_menu;
		gameModes.current = game.gameModes.none;
	}, "back");

	// Add GUI components to the main menu
	// The order of adding controls matters for the layout
	hostOrJoinVerticalStackPanel.addControl(hostButton);
	hostOrJoinVerticalStackPanel.addControl(joinButton);
	hostOrJoinVerticalStackPanel.addControl(hostOrJoinBackButton);
	hostOrJoinContainer.addControl(hostOrJoinVerticalStackPanel);
	hostOrJoinGUI.addControl(hostOrJoinContainer);

	// Add the screen to the GUI texture
	pong.current.hostOrJoinGUI = hostOrJoinGUI;
	// pong.current.guiTexture?.addControl(hostOrJoinGUI);
}

export const	instantiateRoomListGUI = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>, gameModes: React.RefObject<game.gameModes>, socketRef: React.RefObject<WebSocket | null>): void =>
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
	}, "back");
	let		roomListOnlineRoomList = game.refreshOnlineRoomsEntries(pong, states, gameModes);
	let		roomListTournamentRoomList = game.refreshTournamentRoomsEntries(pong, states, gameModes);
	const	roomListRefreshButton = game.createDynamicButton(
	"roomListRefreshButton",
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
		}, "refresh");

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

	pong.current.roomListOnlineVerticalStackPanel = roomListVerticalStackPanel;

	// Add the screen to the GUI texture
	pong.current.roomListGUI = roomListGUI;
	// pong.current.guiTexture?.addControl(roomListGUI);

}

export const	instantiateWaitingScreenGUI = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>): void =>
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
	}, "cancel");

	// Add GUI components to the main menu
	// The order of adding controls matters for the layout
	waitingScreenVerticalStackPanel.addControl(waitingScreenTitle);
	waitingScreenVerticalStackPanel.addControl(waitingScreenCancelButton);
	waitingScreenContainer.addControl(waitingScreenVerticalStackPanel);
	waitingScreenGUI.addControl(waitingScreenContainer);

	// Add the screen to the GUI texture
	pong.current.waitingScreenGUI = waitingScreenGUI;
	// pong.current.guiTexture?.addControl(waitingScreenGUI);
}

export const	instantiateWaitingTournamentToStartGUI = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>): void =>
{
	const	waitingTournamentToStartGUI = game.createScreen("waitingTournamentToStartGUI", "center");
	const	waitingTournamentToStartContainer = game.createAdaptiveContainer("waitingTournamentToStartContainer");

	// Stack panels
	const	waitingTournamentToStartVerticalStackPanel = game.createVerticalStackPanel("waitingTournamentToStartVerticalStackPanel");
	// const	waitingTournamentToStartVerticalStackPanel1 = game.createVerticalStackPanel("waitingTournamentToStartVerticalStackPanel1", 0);
	// const	waitingTournamentToStartVerticalStackPanel2 = game.createVerticalStackPanel("waitingTournamentToStartVerticalStackPanel2", 0);
	const	waitingTournamentToStartHorizontalStackPanel = game.createHorizontalStackPanel("waitingTournamentToStartHorizontalStackPanel");
	const	waitingTournamentToStartHorizontalStackPanel1 = game.createHorizontalStackPanel("waitingTournamentToStartHorizontalStackPanel1", 0);
	// const	waitingTournamentToStartHorizontalStackPanel2 = game.createHorizontalStackPanel("waitingTournamentToStartHorizontalStackPanel2", 0);

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
	}, "back");
			pong.current.waitingTournamentToStartButtonBack = waitingTournamentToStartButtonBack;
	const	waitingTournamentToPlayButtonStart = game.createDynamicButton("waitingTournamentToPlayButtonStart", () =>
	{
		states.current = game.states.countdown;
		game.transitionToCamera(pong.current.scene?.activeCamera as baby.FreeCamera, pong.current.arenaCam, 1, pong, states);
	}, "play");
			pong.current.waitingTournamentToStartButtonPlay = waitingTournamentToPlayButtonStart;
	const	waitingTournamentToStartButtonCancel = game.createDynamicButton("waitingTournamentToStartButtonCancel", () =>
	{
		states.current = game.states.game_settings;
	}, "cancel");
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
	// pong.current.guiTexture?.addControl(waitingTournamentToStartGUI);
}

// export const	instantiateBracketGUI = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>, gameModes: React.RefObject<game.gameModes>): void =>
// {
// 	const	bracketGUI = game.createScreen("bracketGUI", "center");
// 	const	bracketContainer = game.createAdaptiveContainer("bracketContainer");

// 	const	bracketVerticalStackPanel = game.createVerticalStackPanel("bracketVerticalStackPanel");
// 	const	bracketVerticalStackPanel1 = game.createVerticalStackPanel("bracketVerticalStackPanel1", 0);
// 	const	bracketVerticalStackPanel2 = game.createVerticalStackPanel("bracketVerticalStackPanel2", 0);
// 	const	bracketHorizontalStackPanel = game.createHorizontalStackPanel("bracketHorizontalStackPanel");
// 	const	bracketHorizontalStackPanel1 = game.createHorizontalStackPanel("bracketHorizontalStackPanel1", 0);

// 	// VS text separator
// 	const	versusText1 = game.createDynamicText("versusText1", "versus");
// 	const	versusText2 = game.createDynamicText("versusText2", "versus");
// 	const	versusText3 = game.createDynamicText("versusText3", "versus");

// 	// Lines vertical separators

// 	// Title and texts
// 	const	bracketTitle = game.createDynamicTitle("bracketTitle");
// 	const	breacketRound1Text = game.createDynamicTitle("breacketRound1Text", "bracketRound1");
// 	const	breacketRound2Text = game.createDynamicTitle("breacketRound2Text", "bracketRound2");

// 	// Player cardslet	
// 	let		bracketPlayer1Container = game.createAdaptiveContainer("bracketPlayer1Container", "100%", "100%");
// 	let		bracketPlayer1 = game.createText("bracketPlayer1", "player1");
// 			pong.current.bracketPlayer1 = bracketPlayer1;
// 			bracketPlayer1Container.addControl(bracketPlayer1);
// 	let		bracketPlayer2Container = game.createAdaptiveContainer("bracketPlayer2Container", "100px", "100px", game.colorsScheme.dark4);
// 	let		bracketPlayer2 = game.createText("bracketPlayer2", "player2");
// 			pong.current.bracketPlayer2 = bracketPlayer2;
// 			bracketPlayer2Container.addControl(bracketPlayer2);
// 	let		bracketPlayer3Container = game.createAdaptiveContainer("bracketPlayer3Container", "100px", "100px", game.colorsScheme.dark4);
// 	let		bracketPlayer3 = game.createText("bracketPlayer3", "player3");
// 			pong.current.bracketPlayer3 = bracketPlayer3;
// 			bracketPlayer3Container.addControl(bracketPlayer3);
// 	let		bracketPlayer4Container = game.createAdaptiveContainer("bracketPlayer4Container", "100px", "100px", game.colorsScheme.dark4);
// 	let		bracketPlayer4 = game.createText("bracketPlayer4", "player4");
// 			pong.current.bracketPlayer4 = bracketPlayer4;
// 			bracketPlayer4Container.addControl(bracketPlayer4);

// 	// Unknown player cards
// 	const	bracketUnknownPlayer1 = game.createText("bracketUnknownPlayer1", "None");
// 	const	bracketUnknownPlayer2 = game.createText("bracketUnknownPlayer2", "None");

// 	// Abandon button
// 	const	bracketAbandonButton = game.createDynamicButton("bracketAbandonButton", () =>
// 	{
// 		states.current = game.states.main_menu;
// 		gameModes.current = game.gameModes.none;
// 		game.transitionToCamera(pong.current.scene?.activeCamera as baby.FreeCamera, pong.current.mainMenuCam, 1, pong, states);
// 	}, "abandon");
// 			(bracketAbandonButton.children[0] as baby.Button).onPointerEnterObservable.add(() => {
// 			(bracketAbandonButton.children[0] as baby.Button).color = game.colorsScheme.dark1;
// 			(bracketAbandonButton.children[0] as baby.Button).background = game.colorsScheme.auroraAccent1;
// 	});
// 			(bracketAbandonButton.children[0] as baby.Button).onPointerOutObservable.add(() => {
// 			(bracketAbandonButton.children[0] as baby.Button).color = game.colorsScheme.auroraAccent1;
// 			(bracketAbandonButton.children[0] as baby.Button).background = game.colorsScheme.dark1;
// 	});
// 			(bracketAbandonButton.children[0] as baby.Button).color = game.colorsScheme.auroraAccent1;

// 	// Add GUI components to the main menu
// 	bracketGUI.addControl(bracketContainer);
// 	bracketContainer.addControl(bracketVerticalStackPanel);
// 	bracketVerticalStackPanel.addControl(bracketTitle);

// 	// Double column bracket layout
// 	bracketVerticalStackPanel.addControl(bracketHorizontalStackPanel);
// 	bracketHorizontalStackPanel.addControl(bracketVerticalStackPanel1);
// 	bracketHorizontalStackPanel.addControl(bracketVerticalStackPanel2);

// 	// First bracket entry - Player 1 vs Player 2
// 	bracketVerticalStackPanel1.addControl(breacketRound1Text);
// 	bracketVerticalStackPanel1.addControl(bracketPlayer1Container);
// 	bracketVerticalStackPanel1.addControl(versusText1);
// 	bracketVerticalStackPanel1.addControl(bracketPlayer2Container);

// 	// First bracket entry - Player 3 vs Player 4
// 	bracketVerticalStackPanel1.addControl(breacketRound2Text);
// 	bracketVerticalStackPanel1.addControl(bracketPlayer3Container);
// 	bracketVerticalStackPanel1.addControl(versusText2);
// 	bracketVerticalStackPanel1.addControl(bracketPlayer4Container);

// 	// Second bracket entry - Finals
// 	bracketVerticalStackPanel2.addControl(breacketRound2Text);
// 	bracketVerticalStackPanel2.addControl(bracketUnknownPlayer1);
// 	bracketVerticalStackPanel2.addControl(versusText3);
// 	bracketVerticalStackPanel2.addControl(bracketUnknownPlayer2);

// 	// Add the abandon button
// 	bracketVerticalStackPanel.addControl(bracketAbandonButton);

// 	// Add GUI to the GUI texture
// 	pong.current.bracketGUI = bracketGUI;
	// pong.current.guiTexture?.addControl(bracketGUI);
// }

// export const instantiateBracketGUI = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>, gameModes: React.RefObject<game.gameModes>): void =>
// {
//     const bracketGUI = game.createScreen("bracketGUI", "center");
//     const bracketContainer = game.createAdaptiveContainer("bracketContainer", "800px", "600px");

//     const bracketVerticalStackPanel = game.createVerticalStackPanel("bracketVerticalStackPanel");
//     const bracketVerticalStackPanel1 = game.createVerticalStackPanel("bracketVerticalStackPanel1", 10);
//     const bracketVerticalStackPanel2 = game.createVerticalStackPanel("bracketVerticalStackPanel2", 10);
//     const bracketHorizontalStackPanel = game.createHorizontalStackPanel("bracketHorizontalStackPanel", 20);
//     const bracketHorizontalStackPanel1 = game.createHorizontalStackPanel("bracketHorizontalStackPanel1", 0);

//     // VS text separator
//     const versusText1 = game.createDynamicText("versusText1", "versus");
//     const versusText2 = game.createDynamicText("versusText2", "versus");
//     const versusText3 = game.createDynamicText("versusText3", "versus");
    
//     // Style VS text
//     (versusText1.children[0] as baby.TextBlock).fontSize = 16;
//     (versusText2.children[0] as baby.TextBlock).fontSize = 16;
//     (versusText3.children[0] as baby.TextBlock).fontSize = 16;

//     // Title and texts
//     const bracketTitle = game.createDynamicTitle("bracketTitle", "bracketTitle");
//     const bracketRound1Text = game.createDynamicTitle("bracketRound1Text", "bracketRound1");
//     const bracketRound2Text = game.createDynamicTitle("bracketRound2Text", "bracketRound2");
//     // const bracketFinalsText = game.createDynamicTitle("bracketFinalsText", "bracketFinals");
    
//     // Style round titles
//     (bracketRound1Text.children[0] as baby.TextBlock).fontSize = 32;
//     (bracketRound2Text.children[0] as baby.TextBlock).fontSize = 32;
//     (bracketFinalsText.children[0] as baby.TextBlock).fontSize = 32;

//     // Create player cards with the new function
//     const bracketPlayer1Card = game.createCard("Player 1", "bracketPlayer1");
//     const bracketPlayer2Card = game.createCard("Player 2", "bracketPlayer2");
//     const bracketPlayer3Card = game.createCard("Player 3", "bracketPlayer3");
//     const bracketPlayer4Card = game.createCard("Player 4", "bracketPlayer4");
    
//     // Store references for updating later
//     pong.current.bracketPlayer1 = bracketPlayer1Card.getChildByName("bracketPlayer1Text") as baby.TextBlock;
//     pong.current.bracketPlayer2 = bracketPlayer2Card.getChildByName("bracketPlayer2Text") as baby.TextBlock;
//     pong.current.bracketPlayer3 = bracketPlayer3Card.getChildByName("bracketPlayer3Text") as baby.TextBlock;
//     pong.current.bracketPlayer4 = bracketPlayer4Card.getChildByName("bracketPlayer4Text") as baby.TextBlock;

//     // Finals cards
//     const bracketSemiFinal1Winner = game.createCard("TBD", "bracketSemiFinal1Winner", false, false);
//     const bracketSemiFinal2Winner = game.createCard("TBD", "bracketSemiFinal2Winner", false, false);

//     // Abandon button
//     const bracketAbandonButton = game.createDynamicButton("bracketAbandonButton", () =>
//     {
//         states.current = game.states.main_menu;
//         gameModes.current = game.gameModes.none;
//         game.transitionToCamera(pong.current.scene?.activeCamera as baby.FreeCamera, pong.current.mainMenuCam, 1, pong, states);
//     }, "abandon");
//     (bracketAbandonButton.children[0] as baby.Button).onPointerEnterObservable.add(() => {
//         (bracketAbandonButton.children[0] as baby.Button).color = game.colorsScheme.dark1;
//         (bracketAbandonButton.children[0] as baby.Button).background = game.colorsScheme.auroraAccent1;
//     });
//     (bracketAbandonButton.children[0] as baby.Button).onPointerOutObservable.add(() => {
//         (bracketAbandonButton.children[0] as baby.Button).color = game.colorsScheme.auroraAccent1;
//         (bracketAbandonButton.children[0] as baby.Button).background = game.colorsScheme.dark1;
//     });
//     (bracketAbandonButton.children[0] as baby.Button).color = game.colorsScheme.auroraAccent1;

//     // Add GUI components
//     bracketGUI.addControl(bracketContainer);
//     bracketContainer.addControl(bracketVerticalStackPanel);
//     bracketVerticalStackPanel.addControl(bracketTitle);

//     // Double column bracket layout
//     bracketVerticalStackPanel.addControl(bracketHorizontalStackPanel);
//     bracketHorizontalStackPanel.addControl(bracketVerticalStackPanel1);
//     bracketHorizontalStackPanel.addControl(bracketVerticalStackPanel2);

//     // First bracket entry - Semifinals
//     bracketVerticalStackPanel1.addControl(bracketRound1Text);
//     bracketVerticalStackPanel1.addControl(bracketPlayer1Card);
//     bracketVerticalStackPanel1.addControl(versusText1);
//     bracketVerticalStackPanel1.addControl(bracketPlayer2Card);

//     // Second semifinal
//     bracketVerticalStackPanel1.addControl(bracketRound2Text);
//     bracketVerticalStackPanel1.addControl(bracketPlayer3Card);
//     bracketVerticalStackPanel1.addControl(versusText2);
//     bracketVerticalStackPanel1.addControl(bracketPlayer4Card);

//     // Finals
//     bracketVerticalStackPanel2.addControl(bracketFinalsText);
//     bracketVerticalStackPanel2.addControl(bracketSemiFinal1Winner);
//     bracketVerticalStackPanel2.addControl(versusText3);
//     bracketVerticalStackPanel2.addControl(bracketSemiFinal2Winner);

//     // Add the abandon button
//     bracketVerticalStackPanel.addControl(bracketAbandonButton);

//     // Add GUI to the GUI texture
//     pong.current.bracketGUI = bracketGUI;
//     // pong.current.guiTexture?.addControl(bracketGUI);
// }