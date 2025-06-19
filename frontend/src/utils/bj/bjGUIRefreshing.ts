// imports
import React from 'react';

import * as baby from '@/libs/babylonLibs';
import * as bj from '@/libs/bjLibs';

export const	instantiateGUI = (pong: React.RefObject<bj.bjStruct>): void =>
{
	pong.current.guiTexture = baby.AdvancedDynamicTexture.CreateFullscreenUI("GUI", true, pong.current.scene);
}

export const initializeAllGUIScreens =
(
	pong: React.RefObject<bj.bjStruct>,
	states: React.RefObject<bj.States>,
	lang: React.RefObject<bj.language>,
	navigate: (path: string) => void,
	lastState: React.RefObject<bj.States>,
): void =>
{
	// Initialize the GUI texture
	console.log("initialized GUI texture...");
	bj.instantiateGUI(pong);
	console.log("complete initializing GUI texture");

	// Initialize all the GUI screens
	console.log("initialized GUI screens...");
	bj.instantiateMainMenuGUI(pong, states, navigate);
	bj.instantiateSettingsGUI(pong, states, lang);
	// bj.instantiateArenaGUI(pong);
	bj.instantiateDebugGUI(pong, states, lang);
	// etc.
	console.log("complete initializing GUI screens");
}

export const	updateGUIVisibilityStates =
(
	bjRef: React.RefObject<bj.bjStruct>,
	states: bj.States
): void =>
{
	const setUIState =
	(
		ui: baby.Container | undefined,
		statesToCheck: bj.States | bj.States[]
	): void =>
	{
		if (ui === undefined || !bjRef.current.guiTexture) return;

		const	statesArray = Array.isArray(statesToCheck) ? statesToCheck : [statesToCheck];
		const	shouldShow: boolean = statesArray.includes(states);
		const	isCurrentlyAdded: boolean = bjRef.current.guiTexture.getDescendants().includes(ui);

		if		(shouldShow && !isCurrentlyAdded) bjRef.current.guiTexture.addControl(ui);
		else if	(!shouldShow && isCurrentlyAdded) bjRef.current.guiTexture.removeControl(ui);
	}
	setUIState(bjRef.current.mainMenuGUI, bj.States.main_menu);
	setUIState(bjRef.current.settingsGUI, bj.States.settings);
	setUIState(bjRef.current.arenaGUI,bj.States.in_game);

	bjRef.current.guiTexture?.removeControl(bjRef.current.debugGUI as baby.Container);
	bjRef.current.guiTexture?.addControl(bjRef.current.debugGUI as baby.Container);
	console.log("Updated GUI visibility based on states:", states);
	console.log("Current GUI texture children:", bjRef.current.guiTexture?.getDescendants().map(control => control.name));
}

// export const	updateGUIVisibilityPlayerStates =
// (
// 	bjRef: React.RefObject<bj.bjStruct>,
// ): void =>
// {

// }

export const	updateGUIValues =
(
	bjRef: React.RefObject<bj.bjStruct>,
	lang: React.RefObject<bj.language>
): void =>
{
	if (!bjRef.current.guiTexture) return;

	// Process text elements with metadata
	const allControls = bjRef.current.guiTexture.getDescendants();
	for (const control of allControls)
	{
		if (control.metadata?.labelKey)
		{
			// Update TextBlocks directly
			if (control instanceof baby.TextBlock)
				control.text = bj.getLabel(control.metadata.labelKey, lang.current);
			// Update Button labels (first child is typically the TextBlock)
			else if
			(
				   control instanceof baby.Button
				&& control.children.length > 0
				&& control.children[0] instanceof baby.TextBlock
			) (control.children[0] as baby.TextBlock).text = bj.getLabel(control.metadata.labelKey, lang.current);
		}
		// Check for nested TextBlocks with metadata in other controls
		else if
		(
			   control instanceof baby.Button
			&& control.children.length > 0
			&& control.children[0] instanceof baby.TextBlock
			&& control.children[0].metadata?.labelKey
		) (control.children[0] as baby.TextBlock).text = bj.getLabel(control.children[0].metadata.labelKey, lang.current);
	}
}

// export const	updatePlayerNames = (pong: React.RefObject<bj.bjStruct>, gameModes: React.RefObject<bj.gameModes>): void =>
// {
// 	switch (gameModes.current)
// 	{
// 		case bj.gameModes.tournament:
// 			const player1Name = bj.findComponentByName(pong, "player1ScoreText");
// 			const player2Name = bj.findComponentByName(pong, "player2ScoreText");

// 			if (player1Name && player2Name)
// 			{
// 				player1Name.text = pong.current.playerNameLeft;
// 				player2Name.text = pong.current.playerNameRight;
// 			}
// 			break;
// 	}
// }

// export const	refreshOnlineRoomsEntries = (pong: React.RefObject<bj.bjStruct>, states: React.RefObject<bj.States>, gameModes: React.RefObject<bj.gameModes>): baby.StackPanel =>
// {
// 	if (!pong.current.rooms)
// 	{
// 		console.warn("Rooms map is not initialized !");
// 		return (bj.createDynamicText("roomsText", "roomListEmpty"));
// 	}
// 	console.log("🔁 Refreshing room list, rooms =", Array.from(pong.current.rooms.keys()));

// 	const	roomsOnlineVerticalPanel = bj.createVerticalStackPanel("roomsOnlineVerticalPanel", 0);
// 	for (const [key, valueOrGetter] of pong.current.rooms.entries())
// 	{
// 		console.log("🧱 Rendering room:", key);
// 		const room = valueOrGetter();
// 		roomsOnlineVerticalPanel.addControl(room);
// 	}
// 	return roomsOnlineVerticalPanel;
// }

// export const	refreshTournamentRoomsEntries = (pong: React.RefObject<bj.bjStruct>, states: React.RefObject<bj.States>, gameModes: React.RefObject<bj.gameModes>): baby.StackPanel =>
// {
// 	if (!pong.current.party)
// 	{
// 		console.warn("Rooms map is not initialized !");
// 		return (bj.createDynamicText("roomsText", "roomListEmpty"));
// 	}
// 	console.log("🔁 Refreshing room list, rooms =", Array.from(pong.current.party.keys()));

// 	const	roomsTournamentVerticalPanel = bj.createVerticalStackPanel("roomsTournamentVerticalPanel", 0);
// 	for (const [key, valueOrGetter] of pong.current.party.entries())
// 	{
// 		console.log("🧱 Rendering room:", key);
// 		const party = valueOrGetter();
// 		roomsTournamentVerticalPanel.addControl(party);
// 	}
// 	return roomsTournamentVerticalPanel;
// }

export const	updateGUIsWhenNeeded =
(
	pong: React.RefObject<bj.bjStruct>,
	states: React.RefObject<bj.States>,
	lang: React.RefObject<bj.language>,
	lastState: React.RefObject<bj.States>,
	lastLang: React.RefObject<bj.language>
): void =>
{
	// Update GUI on state change
	if (lastState.current !== states.current)
	{
		bj.updateGUIVisibilityStates(pong, states.current);
		bj.updateGUIValues(pong, lang);
		lastState.current = states.current;
	}
	// Update GUI on language change
	if (lastLang.current !== lang.current)
	{
		bj.updateGUIValues(pong, lang);
		lastLang.current = lang.current;
	}
}

