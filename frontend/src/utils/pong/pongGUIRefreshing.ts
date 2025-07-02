// imports
import React, { RefObject } from 'react';

import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';
import { pongStruct } from '@/libs/pongLibs';

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
	lastState: React.RefObject<game.states>,
	musicRef: React.RefObject<HTMLAudioElement | null>,
	audioRef: React.RefObject<HTMLAudioElement | null>,
): void =>
{
	// Initialize the GUI texture
	// console.log("initialized GUI texture...");
	game.instantiateGUI(pong);
	// console.log("complete initializing GUI texture");

	// Initialize all the GUI screens
	// console.log("initialized GUI screens...");
	game.instantiateMainMenuGUI(pong, states, gameModes, navigate, setGameModeTrigger);
	game.instantiateSettingsGUI(pong, states, lang, musicRef, audioRef);
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
	game.instantiateKeybindsLeftGUI(pong);
	game.instantiateKeybindsRightGUI(pong);
	// etc.
	// console.log("complete initializing GUI screens");
}

export const updateComponentControls =
(
	ui: baby.Container | baby.StackPanel | undefined,
	statesToCheck: game.states | game.states[],
	pong: React.RefObject<game.pongStruct>,
	states: game.states
): void =>
{
	if (ui === undefined || !pong.current.guiTexture) return;

	const	statesArray = Array.isArray(statesToCheck) ? statesToCheck : [statesToCheck];
	const	shouldShow: boolean = statesArray.includes(states);
	const	isCurrentlyAdded: boolean = pong.current.guiTexture.getDescendants().includes(ui);

	if		(shouldShow && !isCurrentlyAdded) pong.current.guiTexture.addControl(ui);
	else if	(!shouldShow && isCurrentlyAdded) pong.current.guiTexture.removeControl(ui);
}

export const updateComponentVisibilityBasedOnStates =
(
	ui: baby.Container | baby.StackPanel | undefined,
	statesToCheck: game.states | game.states[],
	states: game.states
): void =>
{
	if (ui === undefined) return;

	const	statesArray = Array.isArray(statesToCheck) ? statesToCheck : [statesToCheck];
	const	shouldShow: boolean = statesArray.includes(states);

	ui.isVisible = ui.isEnabled = shouldShow;
}

export const updateComponentVisibilityBasedOnGameMode =
(
	ui: baby.Container | baby.StackPanel | undefined,
	statesToCheck: game.gameModes | game.gameModes[],
	activeGameMode: game.gameModes
): void =>
{
	if (ui === undefined) return;

	const	statesArray = Array.isArray(statesToCheck) ? statesToCheck : [statesToCheck];
	const	shouldShow: boolean = statesArray.includes(activeGameMode);

	ui.isVisible = ui.isEnabled = shouldShow;
}

export const updateComponentVisibilityBasedOnTournamentStates =
(
	ui: baby.Container | baby.StackPanel | undefined,
	statesToCheck: game.tournamentStates | game.tournamentStates[],
	tournamentState: game.tournamentStates
): void =>
{
	if (ui === undefined) return;

	const	statesArray = Array.isArray(statesToCheck) ? statesToCheck : [statesToCheck];
	const	shouldShow: boolean = statesArray.includes(tournamentState);

	ui.isVisible = ui.isEnabled = shouldShow;
}

export const	updateScreensVisibilityStates =
(
	pong: React.RefObject<game.pongStruct>,
	states: game.states
): void =>
{
	game.updateComponentControls(pong.current.mainMenuGUI, game.states.main_menu, pong, states);
	game.updateComponentControls(pong.current.settingsGUI, game.states.settings, pong, states);
	game.updateComponentControls(pong.current.pongSettingsGUI, game.states.game_settings, pong, states);
	game.updateComponentControls(pong.current.finishedGameGUI, game.states.game_finished, pong, states);
	game.updateComponentControls(pong.current.hostOrJoinGUI, game.states.host_or_join, pong, states);
	game.updateComponentControls(pong.current.roomListGUI, game.states.room_list, pong, states);
	game.updateComponentControls(pong.current.waitingRoundStartGUI, game.states.waiting_to_start, pong, states);
	game.updateComponentControls(pong.current.waitingTournamentToStartGUI, game.states.waiting_tournament_to_start, pong, states);
	game.updateComponentControls(pong.current.waitingScreenGUI, game.states.hosting_waiting_players, pong, states);
	game.updateComponentControls(pong.current.bracketGUI, game.states.tournament_bracket_preview, pong, states);
	game.updateComponentControls(pong.current.keybindsLeftGUI, game.states.in_game, pong, states);
	game.updateComponentControls(pong.current.keybindsRightGUI, game.states.in_game, pong, states);

	game.updateComponentControls(pong.current.countdownGUI,
	[
		game.states.countdown,
		game.states.in_final_countdown,
	], pong, states);
	game.updateComponentControls(pong.current.inputUsernameGUI,
	[
		game.states.input_username_1,
		game.states.input_username_2,
		game.states.input_username_3,
		game.states.input_username_4
	], pong, states);
	game.updateComponentControls(pong.current.arenaGUI, game.states.in_game, pong, states);

	if (pong.current.debugMode)
	{
		pong.current.guiTexture?.removeControl(pong.current.debugGUI as baby.Container);
		pong.current.guiTexture?.addControl(pong.current.debugGUI as baby.Container);
	}
	console.log("Updated GUI visibility based on states:", states);
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
		|| !pong.current.finishedGameContinueButton
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
			pong.current.finishedGameContinueButton.isEnabled = pong.current.finishedGameContinueButton.isVisible = false;
			break;
		case game.gameModes.online:
				pong.current.finishedGameBackButton.isEnabled = pong.current.finishedGameBackButton.isVisible = true;
				pong.current.finishedGameReplayButton.isEnabled = pong.current.finishedGameReplayButton.isVisible = false;
				pong.current.finishedGameContinueButton.isEnabled = pong.current.finishedGameContinueButton.isVisible = false;
			break;
		case game.gameModes.tournament:
			pong.current.finishedGameBackButton.isEnabled = pong.current.finishedGameBackButton.isVisible = false;
			pong.current.finishedGameReplayButton.isEnabled = pong.current.finishedGameReplayButton.isVisible = false;
			pong.current.finishedGameContinueButton.isEnabled = pong.current.finishedGameContinueButton.isVisible = true;
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

export const	updatePlayerNames = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>, gameModes: React.RefObject<game.gameModes>): void =>
{
	const player1Name = game.findComponentByName(pong, "player1ScoreText");
	const player2Name = game.findComponentByName(pong, "player2ScoreText");
	const winnerName = game.findComponentByName(pong, "finishedGameWinnerPlayer");
	const looserName = game.findComponentByName(pong, "finishedGameLooserPlayer");

	if (gameModes.current === game.gameModes.tournament && player1Name && player2Name)
	{
		// if (!player1Name || !player2Name) return;
		switch (pong.current.tournamentState)
		{
			case game.tournamentStates.game_1:
				player1Name.text = pong.current.tournamentPlayer1Name + ":";
				player2Name.text = pong.current.tournamentPlayer2Name + ":";
				break;
			case game.tournamentStates.game_2:
				if (player1Name && player2Name)
				{
				player1Name.text = pong.current.tournamentPlayer3Name + ":";
				player2Name.text = pong.current.tournamentPlayer4Name + ":";
				}
				break;
			case game.tournamentStates.game_3:
				player1Name.text = pong.current.tournamentFinalist1 + ":";
				player2Name.text = pong.current.tournamentFinalist2 + ":";
				break;
		}
	}

	if (states.current === game.states.game_finished && winnerName && looserName && player1Name && player2Name)
	{
		winnerName.text	= (pong.current.player1Score > pong.current.player2Score ? player1Name.text : player2Name.text)
		looserName.text	= (pong.current.player1Score < pong.current.player2Score ? player1Name.text : player2Name.text)
		// console.debug("🔨🔨🔨🔨🔨🔨Updated player names in finished game GUI:", winnerName.text, looserName.text);
	}
	return;
}

const getPlayerCardLabel = (bracketPlayer: any): baby.TextBlock | null =>
{
	try { return bracketPlayer?.children?.[0]?.children?.[1]?.children?.[0] as baby.TextBlock; }
	catch { return null; }
}

const getPlayerCardOutlineColor = (bracketPlayer: any): baby.Rectangle | null =>
{
	try { return bracketPlayer?.children?.[0]?.children?.[0]?.children?.[0] as baby.Rectangle; }
	catch { return null; }
}

export const	updateBracketGUI = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>): void =>
{
	if
	(
		   !pong.current.bracketPlayer1
		|| !pong.current.bracketPlayer2
		|| !pong.current.bracketPlayer3
		|| !pong.current.bracketPlayer4
	) return;
	if (states.current === game.states.tournament_bracket_preview)
	{
		// Update Bracket Aliases
		const	bracketPlayer1 = getPlayerCardLabel(pong.current.bracketPlayer1)
		const	bracketPlayer2 = getPlayerCardLabel(pong.current.bracketPlayer2)
		const	bracketPlayer3 = getPlayerCardLabel(pong.current.bracketPlayer3)
		const	bracketPlayer4 = getPlayerCardLabel(pong.current.bracketPlayer4)
		const	bracketFinalist1 = getPlayerCardLabel(pong.current.bracketFinalPlayer1)
		const	bracketFinalist2 = getPlayerCardLabel(pong.current.bracketFinalPlayer2)
		const	bracketWinner = getPlayerCardLabel(pong.current.bracketWinnerPlayer)

		if (bracketPlayer1 && pong.current.tournamentPlayer1Name) bracketPlayer1.text = pong.current.tournamentPlayer1Name;
		if (bracketPlayer2 && pong.current.tournamentPlayer2Name) bracketPlayer2.text = pong.current.tournamentPlayer2Name;
		if (bracketPlayer3 && pong.current.tournamentPlayer3Name) bracketPlayer3.text = pong.current.tournamentPlayer3Name;
		if (bracketPlayer4 && pong.current.tournamentPlayer4Name) bracketPlayer4.text = pong.current.tournamentPlayer4Name;
		if (bracketFinalist1 && pong.current.tournamentFinalist1) bracketFinalist1.text = pong.current.tournamentFinalist1;
		if (bracketFinalist2 && pong.current.tournamentFinalist2) bracketFinalist2.text = pong.current.tournamentFinalist2;
		if (bracketWinner && pong.current.tournamentWinner) bracketWinner.text = pong.current.tournamentWinner;

		// First Match
		if (pong.current.tournamentState === game.tournamentStates.waiting_game_1)
		{
			// Next Match
			const	player1Outline = game.findComponentByName(pong, "bracketPlayer1CardBackground");
			const	player2Outline = game.findComponentByName(pong, "bracketPlayer2CardBackground");
					player1Outline.color = game.colorsScheme.auroraAccent3;
					player2Outline.color = game.colorsScheme.auroraAccent3;

			pong.current.bracketPlayButton!.isEnabled = pong.current.bracketPlayButton!.isVisible = true;
			pong.current.bracketAbandonButton!.isEnabled = pong.current.bracketAbandonButton!.isVisible = true;
			pong.current.bracketFinishButton!.isEnabled = pong.current.bracketFinishButton!.isVisible = false;
		}

		// Second Match
		if (pong.current.tournamentState === game.tournamentStates.waiting_game_2)
		{
			// Next Match
			const	player3Outline = game.findComponentByName(pong, "bracketPlayer3CardBackground");
			const	player4Outline = game.findComponentByName(pong, "bracketPlayer4CardBackground");
					player3Outline.color = game.colorsScheme.auroraAccent3;
					player4Outline.color = game.colorsScheme.auroraAccent3;

			// Win/Lose outline
			const	player1Outline = game.findComponentByName(pong, "bracketPlayer1CardBackground");
			const	player2Outline = game.findComponentByName(pong, "bracketPlayer2CardBackground");
					player1Outline.color = (pong.current.player1Score < pong.current.player2Score ? game.colorsScheme.auroraAccent1 : game.colorsScheme.auroraAccent4);
					player2Outline.color = (pong.current.player1Score > pong.current.player2Score ? game.colorsScheme.auroraAccent1 : game.colorsScheme.auroraAccent4);

			pong.current.bracketPlayButton!.isEnabled = pong.current.bracketPlayButton!.isVisible = true;
			pong.current.bracketAbandonButton!.isEnabled = pong.current.bracketAbandonButton!.isVisible = true;
			pong.current.bracketFinishButton!.isEnabled = pong.current.bracketFinishButton!.isVisible = false;
		}

		// Third Match
		if (pong.current.tournamentState === game.tournamentStates.waiting_game_3)
		{
			// Next Match
			const	finalPlayer1CardOutline = game.findComponentByName(pong, "finalPlayer1CardBackground");
			const	finalPlayer2CardOutline = game.findComponentByName(pong, "finalPlayer2CardBackground");
					finalPlayer1CardOutline.color = game.colorsScheme.auroraAccent3;
					finalPlayer2CardOutline.color = game.colorsScheme.auroraAccent3;

			// Win/Lose outline
			const	player3Outline = game.findComponentByName(pong, "bracketPlayer3CardBackground");
			const	player4Outline = game.findComponentByName(pong, "bracketPlayer4CardBackground");
					player3Outline.color = (pong.current.player1Score < pong.current.player2Score ? game.colorsScheme.auroraAccent1 : game.colorsScheme.auroraAccent4);
					player4Outline.color = (pong.current.player1Score > pong.current.player2Score ? game.colorsScheme.auroraAccent1 : game.colorsScheme.auroraAccent4);

			pong.current.bracketPlayButton!.isEnabled = pong.current.bracketPlayButton!.isVisible = true;
			pong.current.bracketAbandonButton!.isEnabled = pong.current.bracketAbandonButton!.isVisible = true;
			pong.current.bracketFinishButton!.isEnabled = pong.current.bracketFinishButton!.isVisible = false;
		}

		// Finished Tournament
		if (pong.current.tournamentState === game.tournamentStates.finished)
		{
			pong.current.bracketPlayButton!.isEnabled = pong.current.bracketPlayButton!.isVisible = false;
			pong.current.bracketAbandonButton!.isEnabled = pong.current.bracketAbandonButton!.isVisible = false;
			pong.current.bracketFinishButton!.isEnabled = pong.current.bracketFinishButton!.isVisible = true;

			// Win/Lose outline
			const	finalPlayer1CardOutline = game.findComponentByName(pong, "finalPlayer1CardBackground");
			const	finalPlayer2CardOutline = game.findComponentByName(pong, "finalPlayer2CardBackground");
					finalPlayer1CardOutline.color = (pong.current.player1Score < pong.current.player2Score ? game.colorsScheme.auroraAccent1 : game.colorsScheme.auroraAccent4);
					finalPlayer2CardOutline.color = (pong.current.player1Score > pong.current.player2Score ? game.colorsScheme.auroraAccent1 : game.colorsScheme.auroraAccent4);

			const	winnerCardOutline = game.findComponentByName(pong, "winnerPlayerBackground");
					winnerCardOutline.color = game.colorsScheme.auroraAccent5;
		}
	}
}

export const	updateInputUsername = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>): void =>
{
	game.updateComponentVisibilityBasedOnStates(pong.current.inputUsernameTextBox1, game.states.input_username_1, states.current)
	game.updateComponentVisibilityBasedOnStates(pong.current.inputUsernameTextBox2, game.states.input_username_2, states.current)
	game.updateComponentVisibilityBasedOnStates(pong.current.inputUsernameTextBox3, game.states.input_username_3, states.current)
	game.updateComponentVisibilityBasedOnStates(pong.current.inputUsernameTextBox4, game.states.input_username_4, states.current)
}

export const	refreshOnlineRoomsEntries = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>, gameModes: React.RefObject<game.gameModes>): baby.StackPanel =>
{
	if (!pong.current.rooms)
	{
		// console.warn("Rooms map is not initialized !");
		return (game.createDynamicText("roomsText", "roomListEmpty"));
	}
	// console.log("🔁 Refreshing room list, rooms =", Array.from(pong.current.rooms.keys()));

	const	roomsOnlineVerticalPanel = game.createVerticalStackPanel("roomsOnlineVerticalPanel", 0);
	for (const [key, valueOrGetter] of pong.current.rooms.entries())
	{
		// console.log("🧱 Rendering room:", key);
		const room = valueOrGetter();
		roomsOnlineVerticalPanel.addControl(room);
	}
	return roomsOnlineVerticalPanel;
}

export const	refreshTournamentRoomsEntries = (pong: React.RefObject<game.pongStruct>, states: React.RefObject<game.states>, gameModes: React.RefObject<game.gameModes>): baby.StackPanel =>
{
	if (!pong.current.party)
	{
		// console.warn("Rooms map is not initialized !");
		return (game.createDynamicText("roomsText", "roomListEmpty"));
	}
	// console.log("🔁 Refreshing room list, rooms =", Array.from(pong.current.party.keys()));

	const	roomsTournamentVerticalPanel = game.createVerticalStackPanel("roomsTournamentVerticalPanel", 0);
	for (const [key, valueOrGetter] of pong.current.party.entries())
	{
		// console.log("🧱 Rendering room:", key);
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
	if (states.current > game.states.disconnecting) states.current = game.states.main_menu; // Roll over to main menu if past disconnecting
	else if (states.current < game.states.main_menu) states.current = game.states.disconnecting; // Roll over to disconnecting if before main menu
	// Update GUI on state change
	if (lastState.current !== states.current)
	{
		game.updateInputUsername(pong, states);
		game.updateScreensVisibilityStates(pong, states.current);
		game.updateGUIValues(pong, lang);
		game.updateBracketGUI(pong, states);
		game.updatePlayerNames(pong, states, gameModes);
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

