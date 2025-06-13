// imports
import React from 'react';

import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';

export const	instantiateGUI = (pong: React.RefObject<game.pongStruct>): void =>
{
	pong.current.guiTexture = baby.AdvancedDynamicTexture.CreateFullscreenUI("GUI", true, pong.current.scene);
}

export const initializeAllGUIScreens =
(
	pong: React.RefObject<game.pongStruct>,
	gameModes: React.RefObject<game.gameModes>,
	states: React.RefObject<game.states>,
	playerStates: React.RefObject<game.playerStates>,
	lang: React.RefObject<game.lang>,
	socketRef: React.RefObject<WebSocket | null>,
	navigate: (path: string) => void,
	setGameModeTrigger: React.Dispatch<React.SetStateAction<number>>,
	lastState: React.RefObject<game.states>
): void =>
{
	// Initialize the GUI texture
	console.log("initialized GUI texture...");
	game.instantiateGUI(pong);
	console.log("complete initializing GUI texture");
	
	// Initialize all the GUI screens
	console.log("initialized GUI screens...");
	game.instantiateMainMenuGUI(pong, states, gameModes, navigate, setGameModeTrigger);
	game.instantiateSettingsGUI(pong, states, lang);
	game.instentiatePongSettingsGUI(pong, states, gameModes, playerStates, lastState);
	game.instantiateArenaGUI(pong);
	game.instantiateCountdownGUI(pong);
	game.instantiateFinishedGameGUI(pong, states, gameModes);
	game.instantiateHostOrJoinGUI(pong, states, gameModes, playerStates);
	game.instantiateRoomListGUI(pong, states, gameModes, socketRef);
	game.instantiateWaitingScreenGUI(pong, states, gameModes);
	game.instantiateWaitingTournamentToStartGUI(pong, states);
	game.instantiateBracketGUI(pong, states, gameModes, socketRef);
	game.instantiateInputUsernameGUI(pong, states, gameModes, playerStates, lastState);
	game.instantiateDebugGUI(pong, states, gameModes, playerStates, lang);
	// etc.
	console.log("complete initializing GUI screens");
}

export const	updateGUIVisibilityStates =
(
	pong: React.RefObject<game.pongStruct>,
	states: game.states
): void =>
{
	const setUIState = (ui: baby.Container | undefined, stateToCheck: game.states): void =>
	{
        if (ui === undefined || !pong.current.guiTexture) return;
        
        const	shouldShow: boolean = states === stateToCheck;
        const	isCurrentlyAdded: boolean = pong.current.guiTexture.getDescendants().includes(ui);
        
        if		(shouldShow && !isCurrentlyAdded) pong.current.guiTexture.addControl(ui);
        else if	(!shouldShow && isCurrentlyAdded) pong.current.guiTexture.removeControl(ui);
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
	setUIState(pong.current.bracketGUI, game.states.tournament_bracket_preview);
	setUIState(pong.current.inputUsernameGUI, game.states.input_username);

	pong.current.guiTexture?.removeControl(pong.current.debugGUI as baby.Container);
	pong.current.guiTexture?.addControl(pong.current.debugGUI as baby.Container);
	console.log("Updated GUI visibility based on states:", states);
	console.log("Current GUI texture children:", pong.current.guiTexture?.getDescendants().map(control => control.name));
}

export const	updateGUIVisibilityPlayerStates =
(
	pong: React.RefObject<game.pongStruct>,
	playerStates: game.playerStates,
	gameModes: game.gameModes,
): void =>
{
	if
	(
		   !pong.current.waitingTournamentToStartButtonBack
		|| !pong.current.waitingTournamentToStartButtonCancel
		|| !pong.current.waitingTournamentToStartButtonPlay
		|| !pong.current.finishedGameBackButton
		|| !pong.current.finishedGameReplayButton
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
		default:
			pong.current.waitingTournamentToStartButtonBack.isEnabled = pong.current.waitingTournamentToStartButtonBack.isVisible = false;
			pong.current.waitingTournamentToStartButtonCancel.isEnabled = pong.current.waitingTournamentToStartButtonCancel.isVisible = false;
			pong.current.waitingTournamentToStartButtonPlay.isEnabled = pong.current.waitingTournamentToStartButtonPlay.isVisible = false;
			break;
	}
	switch (gameModes)
	{
		default:
			pong.current.finishedGameBackButton.isEnabled = pong.current.finishedGameBackButton.isVisible = true;
			pong.current.finishedGameReplayButton.isEnabled = pong.current.finishedGameReplayButton.isVisible = true;
			break;
		case game.gameModes.online:
			pong.current.finishedGameBackButton.isEnabled = pong.current.finishedGameBackButton.isVisible = true;
			pong.current.finishedGameReplayButton.isEnabled = pong.current.finishedGameReplayButton.isVisible = false;
			break;
		case game.gameModes.tournament:
			pong.current.finishedGameBackButton.isEnabled = pong.current.finishedGameBackButton.isVisible = true;
			pong.current.finishedGameReplayButton.isEnabled = pong.current.finishedGameReplayButton.isVisible = false;
			break;
	}
}

export const	updateGUIValues =
(
	pong: React.RefObject<game.pongStruct>,
	lang: React.RefObject<game.lang>
): void =>
{
	if (!pong.current.guiTexture) return;
	
	// Process text elements with metadata
	const allControls = pong.current.guiTexture.getDescendants();
	for (const control of allControls)
	{
		if (control.metadata?.labelKey)
		{
			// Update TextBlocks directly
			if (control instanceof baby.TextBlock) 
				control.text = game.getLabel(control.metadata.labelKey, lang.current);
			// Update Button labels (first child is typically the TextBlock)
			else if 
			(
				   control instanceof baby.Button
				&& control.children.length > 0
				&& control.children[0] instanceof baby.TextBlock
			) (control.children[0] as baby.TextBlock).text = game.getLabel(control.metadata.labelKey, lang.current);
		}
		// Check for nested TextBlocks with metadata in other controls
		else if 
		(
			   control instanceof baby.Button 
			&& control.children.length > 0
			&& control.children[0] instanceof baby.TextBlock
			&& control.children[0].metadata?.labelKey
		) (control.children[0] as baby.TextBlock).text = game.getLabel(control.children[0].metadata.labelKey, lang.current);
	}
}

export const	updatePlayerNames = (pong: React.RefObject<game.pongStruct>, gameModes: React.RefObject<game.gameModes>): void =>
{
	switch (gameModes.current)
	{
		case game.gameModes.tournament:
			const player1Name = game.findComponentByName(pong, "player1ScoreText");
			const player2Name = game.findComponentByName(pong, "player2ScoreText");

			if (player1Name && player2Name)
			{
				player1Name.text = pong.current.playerNameLeft;
				player2Name.text = pong.current.playerNameRight;
			}
			break;
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
	if (!pong.current.party)
	{
		console.warn("Rooms map is not initialized !");
		return (game.createDynamicText("roomsText", "roomListEmpty"));
	}
	console.log("🔁 Refreshing room list, rooms =", Array.from(pong.current.party.keys()));

	const	roomsTournamentVerticalPanel = game.createVerticalStackPanel("roomsTournamentVerticalPanel", 0);
	for (const [key, valueOrGetter] of pong.current.party.entries())
	{
		console.log("🧱 Rendering room:", key);
		const party = valueOrGetter();
		roomsTournamentVerticalPanel.addControl(party);
	}
	return roomsTournamentVerticalPanel;
}

export const	updateGUIsWhenNeeded =
(
	pong: React.RefObject<game.pongStruct>,
	states: React.RefObject<game.states>,
	gameModes: React.RefObject<game.gameModes>,
	playerStates: React.RefObject<game.playerStates>,
	lang: React.RefObject<game.lang>,
	lastState: React.RefObject<game.states>,
	lastPlayerState: React.RefObject<game.playerStates>,
	lastLang: React.RefObject<game.lang>
): void =>
{
	// Update GUI on state change
	if (lastState.current !== states.current)
	{
		game.updateGUIVisibilityStates(pong, states.current);
		game.updateGUIValues(pong, lang);
		lastState.current = states.current;
	}
	// Update GUI on game mode change
	if (lastPlayerState.current !== playerStates.current)
	{
		game.updateGUIVisibilityPlayerStates(pong, playerStates.current, gameModes.current);
		lastPlayerState.current = playerStates.current;
	}
	// Update GUI on language change
	if (lastLang.current !== lang.current)
	{
		game.updateGUIValues(pong, lang);
		lastLang.current = lang.current;
	}
}

