// imports
import React from 'react';

import * as baby from '@/libs/babylonLibs';
import * as bj from '@/libs/bjLibs';

export const	instantiateGUI = (bjRef: React.RefObject<bj.bjStruct>): void =>
{
	bjRef.current.guiTexture = baby.AdvancedDynamicTexture.CreateFullscreenUI("GUI", true, bjRef.current.scene);
}

export const initializeAllGUIScreens =
(
	bjRef: React.RefObject<bj.bjStruct>,
	states: React.RefObject<bj.States>,
	lang: React.RefObject<bj.language>,
	navigate: (path: string) => void,
	lastState: React.RefObject<bj.States>,
): void =>
{
	// Initialize the GUI texture
	// console.log("initialized GUI texture...");
	bj.instantiateGUI(bjRef);
	// console.log("complete initializing GUI texture");

	// Initialize all the GUI screens
	// console.log("initialized GUI screens...");
	bj.instantiateMainMenuGUI(bjRef, states, navigate);
	bj.instantiateSettingsGUI(bjRef, states, lang);
	bj.instantiateGameModeGUI(bjRef, states);
	bj.instantiateActionGUI(bjRef, states);
	bj.instantiateBalanceGUI(bjRef);
	bj.instantiatePlayerScoreGUI(bjRef);
	bj.instantiateFinishedGameGUI(bjRef, states,lang);
	// bj.instantiateArenaGUI(pong);
	bj.instantiateDebugGUI(bjRef, states, lang);
	// etc.
	// console.log("complete initializing GUI screens");
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
	setUIState(bjRef.current.gameModeGUI, bj.States.game_mode_selection);
	setUIState(bjRef.current.arenaGUI,bj.States.in_game);
	setUIState(bjRef.current.actionGUI,bj.States.in_game);
	setUIState(bjRef.current.balanceGUI, bj.States.in_game);
	setUIState(bjRef.current.playerScoreGUI, bj.States.in_game);
	setUIState(bjRef.current.finishedGameGUI, bj.States.game_over);

	bjRef.current.guiTexture?.removeControl(bjRef.current.debugGUI as baby.Container);
	bjRef.current.guiTexture?.addControl(bjRef.current.debugGUI as baby.Container);
	// console.log("Updated GUI visibility based on states:", states);
	// console.log("Current GUI texture children:", bjRef.current.guiTexture?.getDescendants().map(control => control.name));
}

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

export const	updateGUIsWhenNeeded =
(
	bjRef: React.RefObject<bj.bjStruct>,
	states: React.RefObject<bj.States>,
	lang: React.RefObject<bj.language>,
	lastState: React.RefObject<bj.States>,
	lastLang: React.RefObject<bj.language>
): void =>
{
	// if (states.current > bj.States.game_over) states.current = bj.States.main_menu; // Roll over to main menu if past game over
	// else if (states.current < bj.States.main_menu) states.current = bj.States.game_over; // Roll over to game over if before main menu
	// Update GUI on state change
	if (lastState.current !== states.current)
	{
		bj.updateGUIVisibilityStates(bjRef, states.current);
		bj.updateGUIValues(bjRef, lang);
		// bj.updateActionsVisibility(bjRef, bjRef.current.gameState!);
		lastState.current = states.current;
	}
	// Update GUI on language change
	if (lastLang.current !== lang.current)
	{
		bj.updateGUIValues(bjRef, lang);
		lastLang.current = lang.current;
	}
}

export const updateComponentVisibilityBasedOnStates =
(
	ui: baby.Container | baby.StackPanel | undefined,
	statesToCheck: bj.States | bj.States[],
	activeState: bj.States
): void =>
{
	if (ui === undefined) return;

	const	statesArray = Array.isArray(statesToCheck) ? statesToCheck : [statesToCheck];
	const	shouldShow: boolean = statesArray.includes(activeState);

	ui.isVisible = ui.isEnabled = shouldShow;
}