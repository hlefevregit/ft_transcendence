import React from 'react';

import * as baby from '@/libs/babylonLibs';
import * as bj from '@/libs/bjLibs';
import * as game from '@/libs/pongLibs';
import { split } from 'postcss/lib/list';

// ****************************************************************************** //
//                                                                                //
//                                  MAIN MENU                                     //
//                                                                                //
// ****************************************************************************** //

export const    instantiateMainMenuGUI =
(
	bjRef: React.RefObject<bj.bjStruct>,
	states: React.RefObject<bj.States>,
	navigate: (path: string) => void,
): void =>
{
	// Canvas that will be used for the GUI
	const	mainMenuGUI = bj.createScreen("mainMenuGUI");
	// All GUI components needed
	const	mainMenuContainer = bj.createAdaptiveContainer("mainMenuContainer", "300px", "300px");
	const	mainMenuVerticalStackPanel = bj.createVerticalStackPanel("mainMenuVerticalStackPanel");
	const	mainMenuDynamicTitle = bj.createDynamicTitle("mainMenuDynamicTitle", "mainMenuTitle");
	const	mainMenuSettingsButton = bj.createDynamicButton("mainMenuSettingsButton", () =>
	{
		states.current = bj.States.settings;
	}, bjRef, "settings");
	const	returnToMuseumButton = bj.createDynamicButton("returnToMuseumButton", () => {
		bjRef.current.engine?.dispose();
		navigate("/game2");
	}, bjRef, "returnToMuseumButton");
			(returnToMuseumButton.children[0] as baby.Button).onPointerEnterObservable.add(() =>
			{
				(returnToMuseumButton.children[0] as baby.Button).color = bj.colorsScheme.dark1;
				(returnToMuseumButton.children[0] as baby.Button).background = bj.colorsScheme.auroraAccent1;
			});
			(returnToMuseumButton.children[0] as baby.Button).onPointerOutObservable.add(() =>
			{
				(returnToMuseumButton.children[0] as baby.Button).color = bj.colorsScheme.auroraAccent1;
				(returnToMuseumButton.children[0] as baby.Button).background = bj.colorsScheme.dark1;
			});
			(returnToMuseumButton.children[0] as baby.Button).color = bj.colorsScheme.auroraAccent1;
	const	mainMenuPlay = bj.createDynamicButton("mainMenuPlay", () =>
	{
		// if (!bjRef.current.scene) return;
		states.current = bj.States.game_mode_selection;
		bj.transitionToCamera(bjRef.current.scene?.activeCamera as baby.FreeCamera, bjRef.current.gameCamera, 1, bjRef, states);
	}, bjRef, "play");

	// Add GUI components to the main menu
	// The order of adding controls matters for the layout
	mainMenuVerticalStackPanel.addControl(bj.createSpacer(0, 4));
	mainMenuVerticalStackPanel.addControl(mainMenuDynamicTitle);
	mainMenuVerticalStackPanel.addControl(mainMenuPlay);
	mainMenuVerticalStackPanel.addControl(mainMenuSettingsButton);
	mainMenuVerticalStackPanel.addControl(returnToMuseumButton);
	mainMenuVerticalStackPanel.addControl(bj.createSpacer(0, 4));
	mainMenuContainer.addControl(mainMenuVerticalStackPanel);
	mainMenuGUI.addControl(mainMenuContainer);

	// Add the screen to the GUI texture
	bjRef.current.mainMenuGUI = mainMenuGUI;
	// pong.current.guiTexture?.addControl(mainMenuGUI);
}

// ****************************************************************************** //
//                                                                                //
//                                 GAMEMODE GUI                                   //
//                                                                                //
// ****************************************************************************** //

export const	instantiateGameModeGUI =
(
	bjRef: React.RefObject<bj.bjStruct>,
	states: React.RefObject<bj.States>,
	gameMode: React.RefObject<bj.gameMode>,
	winState: React.RefObject<bj.winState>,
): void =>
{
	const	gameModeGUI = bj.createScreen("gameModeGUI", "center");
	const	gameModeContainer = bj.createAdaptiveContainer("gameModeContainer");

	const	gameModeVerticalStackPanel = bj.createVerticalStackPanel("gameModeVerticalStackPanel");

	// const	gameModeTitle = bj.createDynamicTitle("gameModeTitle", "gameModeTitle");

	const gameModeSoloButton = bj.createDynamicButton("gameModeSoloButton", async () =>
	{
		states.current = bj.States.in_game;
		bjRef.current.gameState = bj.GameState.waiting;
		gameMode.current = bj.gameMode.solo;
		await bj.PlayGame(bjRef, states, winState, 1);
	}, bjRef, "solo");
	const gameModeDuoButton = bj.createDynamicButton("gameModeDuoButton", async () =>
	{
		states.current = bj.States.in_game;
		bjRef.current.gameState = bj.GameState.waiting;
		gameMode.current = bj.gameMode.duo;
		await bj.PlayGame(bjRef, states, winState, 2);
	}, bjRef, "duo");
	const	gameModeBackButton = bj.createDynamicButton("gameModeBackButton", () =>
	{
		states.current = bj.States.main_menu;
		bj.transitionToCamera(bjRef.current.scene?.activeCamera as baby.FreeCamera, bjRef.current.mainMenuCamera, 1, bjRef, states);
	}, bjRef, "back");

	// Add GUI components to the game mode GUI
	gameModeGUI.addControl(gameModeContainer);
	gameModeContainer.addControl(gameModeVerticalStackPanel);

	// Buttons
	gameModeVerticalStackPanel.addControl(gameModeSoloButton);
	gameModeVerticalStackPanel.addControl(gameModeDuoButton);
	gameModeVerticalStackPanel.addControl(gameModeBackButton);

	// Add the game mode GUI to the bjRef
	bjRef.current.gameModeGUI = gameModeGUI;
}

// ****************************************************************************** //
//                                                                                //
//                                   SETTINGS                                     //
//                                                                                //
// ****************************************************************************** //

export const    instantiateSettingsGUI =
(
	bjRef: React.RefObject<bj.bjStruct>,
	states: React.RefObject<bj.States>,
	lang: React.RefObject<bj.language>,
): void =>
{
	// Canvas that will be used for the GUI
	const	settingsGUI = bj.createScreen("settingsGUI");
	const	settingsContainer = bj.createAdaptiveContainer("settingsContainer");
	const	settingsPanel = bj.createVerticalStackPanel("settingsPanel");
	const	settingsLanguagePanel1 = bj.createHorizontalStackPanel("settingsLanguagePanel1", 0);
	const	settingsLanguagePanel2 = bj.createHorizontalStackPanel("settingsLanguagePanel2", 0);

	// All GUI components needed
	const	settingsMenuTitle = bj.createDynamicTitle("settingsMenuTitle", "settings");
	const	backButton = bj.createDynamicButton("settingsButton", () =>
	{
		states.current = bj.States.main_menu;
	}, bjRef, "back");

	// Language selection buttons
	const	englishButton = bj.createButton("englishButton", "🇺🇸", () =>
	{
		lang.current = bj.language.english;
		bj.updateGUIValues(bjRef, lang);
		bj.findComponentByName(bjRef, "debugActiveLanguageTextValue").text = lang.current;
	}, bjRef);
			(englishButton.children[0] as baby.Button).fontSize = 36;
			(englishButton.children[0] as baby.Button).width = "100px";
			(englishButton.children[0] as baby.Button).height = "100px";

	const	frenchButton = bj.createButton("frenchButton", "🇲🇫", () =>
	{
		lang.current = bj.language.french;
		bj.updateGUIValues(bjRef, lang);
		bj.findComponentByName(bjRef, "debugActiveLanguageTextValue").text = lang.current;
	}, bjRef);
			(frenchButton.children[0] as baby.Button).width = "100px";
			(frenchButton.children[0] as baby.Button).height = "100px";
			(frenchButton.children[0] as baby.Button).fontSize = 36;

	const	italianButton = bj.createButton("italianButton", "🇮🇹", () =>
	{
		lang.current = bj.language.italian;
		bj.updateGUIValues(bjRef, lang);
		bj.findComponentByName(bjRef, "debugActiveLanguageTextValue").text = lang.current;
		bj.findComponentByName(bjRef, "debugActiveLanguageTextValue").markAsDirty();
	}, bjRef);
			(italianButton.children[0] as baby.Button).width = "100px";
			(italianButton.children[0] as baby.Button).height = "100px";
			(italianButton.children[0] as baby.Button).fontSize = 36;

	const	brailButton = bj.createButton("brailButton", "🦮", () =>
	{
		lang.current = bj.language.braille;
		bj.updateGUIValues(bjRef, lang);
		bj.findComponentByName(bjRef, "debugActiveLanguageTextValue").text = lang.current;
		bj.findComponentByName(bjRef, "debugActiveLanguageTextValue").markAsDirty();
	}, bjRef);
			(brailButton.children[0] as baby.Button).width = "100px";
			(brailButton.children[0] as baby.Button).height = "100px";
			(brailButton.children[0] as baby.Button).fontSize = 36;

	// Add GUI components to the main menu
	// The order of adding controls matters for the layout
	settingsGUI.addControl(settingsContainer);
	settingsContainer.addControl(settingsPanel);
	settingsPanel.addControl(settingsMenuTitle);

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
	bjRef.current.settingsGUI = settingsGUI;
}

// ****************************************************************************** //
//                                                                                //
//                                    DEBUG                                       //
//                                                                                //
// ****************************************************************************** //

export const	instantiateDebugGUI =
(
	bjRef: React.RefObject<bj.bjStruct>,
	states: React.RefObject<bj.States>,
	winState: React.RefObject<bj.winState>,
	lang: React.RefObject<bj.language>
): void =>
{
	const	debugGUI = bj.createScreen("debugGUI", "top-left");
			debugGUI.width = "150px";
			debugGUI.height = "500px";

	const	debugContainer = bj.createAdaptiveContainer("debugContainer", "100%", "100%", undefined, "top-left");
	const	debugVerticalStackPanel = bj.createVerticalStackPanel("debugVerticalStackPanel");

	const	debugTitle = bj.createTitle("debugTitle", "Debug Info");
			(debugTitle.children[0] as baby.TextBlock).fontSize = 24;

	const	debugFrameratePanel = bj.createHorizontalStackPanel("debugFrameratePanel", 0);
	const	debugFramerateText = bj.createText("debugFrameRateText", "FPS: ");
	const	debugFramerateValue = bj.createDynamicText("debugFrameRateValue");
			(debugFramerateValue.children[0] as baby.TextBlock).onTextChangedObservable.add(() =>
			{
				let value: string = "NA";
				if (bjRef.current.engine) value = bjRef.current.engine.getFps().toFixed(0);
				(debugFramerateValue.children[0] as baby.TextBlock).text = value;
			});

	const	debugStatesText = bj.createText("debugStatesText", "Current State");
			(debugStatesText.children[0] as baby.TextBlock).fontSize = 12;
	const	debugStatesTextName = bj.createDynamicText("debugStatesTextName");
			(debugStatesTextName.children[0] as baby.TextBlock).fontSize = 12;
			(debugStatesTextName.children[0] as baby.TextBlock).onTextChangedObservable.add(() =>
			{
				bj.findComponentByName(bjRef, "debugStatesTextName").text = Object.keys(bj.States).find(key => bj.States[key as keyof typeof bj.States] === states.current);
			});
	const	debugStatesValue = bj.createDynamicText("debugStatesValue");
			(debugStatesValue.children[0] as baby.TextBlock).fontSize = 12;
			(debugStatesValue.children[0] as baby.TextBlock).onTextChangedObservable.add(() =>
			{
				(debugStatesValue.children[0] as baby.TextBlock).text = states.current.toString();
			});
	const	debugIncrementStateButton = bj.createButton("debugIncrementStateButton", "+", () =>
	{
		states.current++;
		bj.findComponentByName(bjRef, "debugStatesValue").text = states.current.toString();
	}, bjRef);
	const	debugDecrementStatesButton = bj.createButton("debugDecrementStateButton", "-", () =>
	{
		states.current--;
		bj.findComponentByName(bjRef, "debugStatesValue").text = states.current.toString();
	}, bjRef);
			(debugIncrementStateButton.children[0] as baby.Button).fontSize = 12;
			(debugDecrementStatesButton.children[0] as baby.Button).fontSize = 12;
			(debugIncrementStateButton.children[0] as baby.Button).cornerRadius = 10;
			(debugDecrementStatesButton.children[0] as baby.Button).cornerRadius = 10;
			(debugIncrementStateButton.children[0] as baby.Button).width = "50px";
			(debugDecrementStatesButton.children[0] as baby.Button).width = "50px";
			(debugIncrementStateButton.children[0] as baby.Button).height = "50px";
			(debugDecrementStatesButton.children[0] as baby.Button).height = "50px";

	const	debugStatesPanel = bj.createHorizontalStackPanel("debugButtonPanel", 2.5);

	const	debugActiveCamText = bj.createText("debugActiveCamText", "Active camera:");
			(debugActiveCamText.children[0] as baby.TextBlock).fontSize = 12;
	const	debugActiveCamTextValue = bj.createDynamicText("debugActiveCamTextValue");
			(debugActiveCamTextValue.children[0] as baby.TextBlock).fontSize = 12;
			(debugActiveCamTextValue.children[0] as baby.TextBlock).onTextChangedObservable.add(() =>
			{
				bj.findComponentByName(bjRef, "debugActiveCamTextValue").text = bjRef.current.scene?.activeCamera?.name;
			});

	// active languages
	const	debugActiveLanguageText = bj.createText("debugActiveLanguageText", "Active language:");
			(debugActiveLanguageText.children[0] as baby.TextBlock).fontSize = 12;
	const	debugActiveLanguageTextValue = bj.createDynamicText("debugActiveLanguageTextValue");
			(debugActiveLanguageTextValue.children[0] as baby.TextBlock).fontSize = 12;
			(debugActiveLanguageTextValue.children[0] as baby.TextBlock).onDirtyObservable.add(() =>
			{
				bj.findComponentByName(bjRef, "debugActiveLanguageTextValue").text =
				Object.keys(bj.language).find(key => bj.language[key as keyof typeof bj.language] === lang.current);
			});

	// active winState
	const	debugActiveWinStateText = bj.createText("debugActiveWinStateText", "Active winState:");
			(debugActiveWinStateText.children[0] as baby.TextBlock).fontSize = 12;
	const	debugActiveWinStateTextValue = bj.createDynamicText("debugActiveWinStateTextValue");
			(debugActiveWinStateTextValue.children[0] as baby.TextBlock).fontSize = 12;
			(debugActiveWinStateTextValue.children[0] as baby.TextBlock).onDirtyObservable.add(() =>
			{
				bj.findComponentByName(bjRef, "debugActiveWinStateTextValue").text =
				Object.keys(bj.winState).find(key => bj.winState[key as keyof typeof bj.winState] === winState.current);
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

	debugVerticalStackPanel.addControl(debugActiveWinStateText);
	debugVerticalStackPanel.addControl(debugActiveWinStateTextValue);

	// Add the screen to the GUI texture
	bjRef.current.debugGUI = debugGUI;
	bjRef.current.guiTexture?.addControl(debugGUI);
}

// ****************************************************************************** //
//                                                                                //
//                                 ACTION GUI                                     //
//                                                                                //
// ****************************************************************************** //

export const instantiateActionGUI =
(
	bjRef: React.RefObject<bj.bjStruct>,
): void =>
{
	// Canvas that will be used for the GUI
	const	actionGUI = bj.createScreen("actionGUI", "top");

	// All GUI components needed
	const	actionContainer = bj.createAdaptiveContainer("actionContainer");
			actionContainer.top = "200px";
	const	actionVerticalStackPanel = bj.createVerticalStackPanel("actionVerticalStackPanel");
	const	actionHorizontalStackPanel = bj.createHorizontalStackPanel("actionHorizontalStackPanel", 0);
	const	actionTitle = bj.createDynamicTitle("actionTitle", "actionTitle");

	const	standButton = bj.createDynamicButton("standButton", () =>
	{
		bjRef.current.playerChoice = bj.PlayerChoices.stand;
		console.log("STAND")
	}, bjRef, "stand");
	const	hitButton = bj.createDynamicButton("hitButton", () =>
	{
		bjRef.current.playerChoice = bj.PlayerChoices.hit;
		console.log("HIT")
	}, bjRef, "hit");

	// Add GUI components to the action GUI
	actionVerticalStackPanel.addControl(actionTitle);

	actionHorizontalStackPanel.addControl(hitButton);
	actionHorizontalStackPanel.addControl(standButton);

	actionVerticalStackPanel.addControl(actionHorizontalStackPanel);
	actionContainer.addControl(actionVerticalStackPanel);
	actionGUI.addControl(actionContainer);

	// Add the screen to the GUI texture
	bjRef.current.actionGUI = actionGUI;
}

// ****************************************************************************** //
//                                                                                //
//                                    BALANCE                                     //
//                                                                                //
// ****************************************************************************** //

export const	instantiateBalanceGUI =
(
	bjRef: React.RefObject<bj.bjStruct>,
): void =>
{
	const	balanceGUI = bj.createScreen("balanceGUI", "top-right");
			balanceGUI.width = "400px";
			balanceGUI.height = "75px";
	const	balanceContainer = bj.createAdaptiveContainer("balanceContainer", undefined, undefined, undefined, "top-right");
	const	balanceHorizontalStackPanel = bj.createHorizontalStackPanel("balanceVerticalStackPanel");
	const	balanceTitle = bj.createDynamicTitle("balanceTitle", "balance");

	// getBalance();

	const	balanceValue = bj.createTitle("balanceValue", "NaN");
			(balanceValue.children[0] as baby.TextBlock).onDirtyObservable.add(() =>
			{
				if (bjRef.current.balance !== undefined)
					(balanceValue.children[0] as baby.TextBlock).text = bjRef.current.balance.toString() + "$";
				else
					(balanceValue.children[0] as baby.TextBlock).text = "NaN";
			});

	// Add GUI components to the balance GUI
	balanceHorizontalStackPanel.addControl(balanceTitle);
	balanceHorizontalStackPanel.addControl(balanceValue);
	balanceContainer.addControl(balanceHorizontalStackPanel);
	balanceGUI.addControl(balanceContainer);

	bjRef.current.balanceGUI = balanceGUI;
}

// ****************************************************************************** //
//                                                                                //
//                                PLAYER SCORE                                    //
//                                                                                //
// ****************************************************************************** //

export const	instantiatePlayerScoreGUI =
(
	bjRef: React.RefObject<bj.bjStruct>,
): void =>
{
	const	playerScoreGUI = bj.createScreen("playerScoreGUI", "bottom");
			playerScoreGUI.width = "800px";
			playerScoreGUI.height = "75px";
	const	playerScoreContainer = bj.createAdaptiveContainer("playerScoreContainer", "800px", "75px", undefined, "bottom");

	const	playerScoreHorizontalStackPanel = bj.createHorizontalStackPanel("playerScoreHorizontalStackPanel");
	const	playerScorePlayer1Panel1 = bj.createHorizontalStackPanel("playerScorePlayer1Panel1");
	const	playerScorePlayer1Panel2 = bj.createHorizontalStackPanel("playerScorePlayer1Panel2");
	const	playerScoreCroupierPanel = bj.createHorizontalStackPanel("playerScoreCroupierPanel");

	const	playerScorePlayer1Text = bj.createDynamicText("playerScorePlayer1Text", "player1");
			// playerScorePlayer1Text.children[0]
	const	playerScorePlayer1Value = bj.createDynamicText("playerScorePlayer1Value");
			(playerScorePlayer1Value.children[0] as baby.TextBlock).onDirtyObservable.add(() =>
			{
				bj.findComponentByName(bjRef, "playerScorePlayer1Value").text = ": " + bjRef.current.player1Score.toString();
			});
	const	playerScorePlayer2Text = bj.createDynamicText("playerScorePlayer2Text", "player2");

	const	playerScorePlayer2Value = bj.createDynamicText("playerScorePlayer2Value");
			(playerScorePlayer2Value.children[0] as baby.TextBlock).onDirtyObservable.add(() =>
			{
				bj.findComponentByName(bjRef, "playerScorePlayer2Value").text = ": " + bjRef.current.player2Score.toString();
			});

	const	playerScoreCroupierText = bj.createDynamicText("playerScoreCroupierText", "dealer");
	const	playerScoreCroupierValue = bj.createDynamicText("playerScoreCroupierValue");
			(playerScoreCroupierValue.children[0] as baby.TextBlock).onDirtyObservable.add(() =>
			{
				bj.findComponentByName(bjRef, "playerScoreCroupierValue").text = ": " + bjRef.current.dealerScore.toString();
			});

	// Add GUI components to the player score GUI
	// Layout
	playerScoreGUI.addControl(playerScoreContainer);
	playerScoreContainer.addControl(playerScoreHorizontalStackPanel);
	playerScoreHorizontalStackPanel.addControl(playerScorePlayer1Panel1);
	playerScoreHorizontalStackPanel.addControl(bj.createSpacer(20, 0));
	playerScoreHorizontalStackPanel.addControl(playerScoreCroupierPanel);
	playerScoreHorizontalStackPanel.addControl(bj.createSpacer(20, 0));
	playerScoreHorizontalStackPanel.addControl(playerScorePlayer1Panel2);

	// Dealer Score
	playerScoreCroupierPanel.addControl(playerScoreCroupierText);
	playerScoreCroupierPanel.addControl(playerScoreCroupierValue);

	// Player 1 Score
	playerScorePlayer1Panel1.addControl(playerScorePlayer1Text);
	playerScorePlayer1Panel1.addControl(playerScorePlayer1Value);

	// Player 2 Score
	playerScorePlayer1Panel2.addControl(playerScorePlayer2Text);
	playerScorePlayer1Panel2.addControl(playerScorePlayer2Value);

	// Add the screen to the GUI texture
	bjRef.current.playerScoreGUI = playerScoreGUI;
}

// ****************************************************************************** //
//                                                                                //
//                                FINISHED GAME                                   //
//                                                                                //
// ****************************************************************************** //

export const	instantiateFinishedGameGUI =
(
	bjRef: React.RefObject<bj.bjStruct>,
	states: React.RefObject<bj.States>,
	gameMode: React.RefObject<bj.gameMode>,
	winState: React.RefObject<bj.winState>,
	lang: React.RefObject<bj.language>
): void =>
{
	const	finishedGameGUI = bj.createScreen("finishedGameGUI", "center");
	const	finishedGameContainer = bj.createAdaptiveContainer("finishedGameContainer");

	const	finishedGameVerticalStackPanel = bj.createVerticalStackPanel("finishedGameVerticalStackPanel");
	const	finishedGameHorizontalStackPanel1 = bj.createHorizontalStackPanel("finishedGameHorizontalStackPanel1", 0);
	const	finishedGameHorizontalStackPanel2 = bj.createHorizontalStackPanel("finishedGameHorizontalStackPanel2", 0);
	const	finishedGameTitle = bj.createDynamicTitle("finishedGameTitle", "gameFinishedTitle");
	const	finishedGameBackButton = bj.createDynamicButton("finishedGameBackButton", () =>
	{
		states.current = bj.States.main_menu;
		gameMode.current = bj.gameMode.none;
		winState.current = bj.winState.none;
		bj.transitionToCamera(bjRef.current.scene?.activeCamera as baby.FreeCamera, bjRef.current.mainMenuCamera, 1, bjRef, states);
	}, bjRef, "back");

	const	finishedGameReplayButton = bj.createDynamicButton("finishedGameReplayButton", () =>
	{
		if (gameMode.current === bj.gameMode.solo) bj.PlayGame(bjRef, states, winState, 1);
		if (gameMode.current === bj.gameMode.duo) bj.PlayGame(bjRef, states, winState, 2);
		states.current = bj.States.in_game;
		winState.current = bj.winState.none;
		// bj.transitionToCamera(bjRef.current.scene?.activeCamera as baby.FreeCamera, bjRef.current.mainMenuCamera, 1, bjRef, states);
	}, bjRef, "replay");
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

	const	finishedGameDealerWin = bj.createDynamicText("finishedGameDealerWin", "dealer_win");
			finishedGameDealerWin.isEnabled = finishedGameDealerWin.isVisible = false;
	const	finishedGamePlayer1Win = bj.createDynamicText("finishedGamePlayer1Win", "player_1_win");
			finishedGamePlayer1Win.isEnabled = finishedGamePlayer1Win.isVisible = false;
	const	finishedGamePlayer2Win = bj.createDynamicText("finishedGamePlayer2Win", "player_2_win");
			finishedGamePlayer2Win.isEnabled = finishedGamePlayer2Win.isVisible = false;
	const	finishedGamePlayer1Blackjack = bj.createDynamicText("finishedGamePlayer1Blackjack", "player_1_blackjack");
			finishedGamePlayer1Blackjack.isEnabled = finishedGamePlayer1Blackjack.isVisible = false;
	const	finishedGamePlayer2Blackjack = bj.createDynamicText("finishedGamePlayer2Blackjack", "player_2_blackjack");
			finishedGamePlayer2Blackjack.isEnabled = finishedGamePlayer2Blackjack.isVisible = false;
	const	finishedGameTie = bj.createDynamicText("finishedGameTie", "tie");
			finishedGameTie.isEnabled = finishedGameTie.isVisible = false;

	bjRef.current.finishedGameDealerWin = finishedGameDealerWin;
	bjRef.current.finishedGamePlayer1Win = finishedGamePlayer1Win;
	bjRef.current.finishedGamePlayer2Win = finishedGamePlayer2Win;
	bjRef.current.finishedGamePlayer1Blackjack = finishedGamePlayer1Blackjack;
	bjRef.current.finishedGamePlayer2Blackjack = finishedGamePlayer2Blackjack;
	bjRef.current.finishedGameTie = finishedGameTie;

	// Winner
	// const	winnerText = bj.createDynamicText("winnerText", "winner");
	// const	winnerName = bj.createText("winnerName", "prout");
	// 		(winnerName.children[0] as baby.TextBlock).onDirtyObservable.add(() =>
	// 		{
	// 			if (bjRef.current.player1Score > bjRef.current.player2Score)
	// 				bj.findComponentByName(bjRef, "winnerName").text = bj.getLabel("player1", lang.current);
	// 			else if (bjRef.current.player1Score < bjRef.current.player2Score)
	// 				bj.findComponentByName(bjRef, "winnerName").text = bj.getLabel("player2", lang.current);
	// 			else if (bjRef.current.player1Score < bjRef.current.dealerScore && bjRef.current.player2Score < bjRef.current.dealerScore)
	// 				bj.findComponentByName(bjRef, "winnerName").text = bj.getLabel("dealer", lang.current);
	// 		});
	// const	winnerScore = bj.createText("winnerScore", "prout");
	// 		(winnerScore.children[0] as baby.TextBlock).onDirtyObservable.add(() =>
	// 		{
	// 			bj.findComponentByName(bjRef, "winnerScore").text = ": " + Math.max(bjRef.current.player1Score, bjRef.current.player2Score, bjRef.current.dealerScore).toString();
	// 		});

	// Add GUI components to the finished game GUI
	// Layout
	finishedGameVerticalStackPanel.addControl(finishedGameTitle);
	finishedGameVerticalStackPanel.addControl(bj.createSpacer(0, 10));
	finishedGameVerticalStackPanel.addControl(finishedGameHorizontalStackPanel1);
	finishedGameVerticalStackPanel.addControl(bj.createSpacer(0, 10));
	finishedGameVerticalStackPanel.addControl(finishedGameHorizontalStackPanel2);
	finishedGameContainer.addControl(finishedGameVerticalStackPanel);
	finishedGameGUI.addControl(finishedGameContainer);
	
	// Winner
	// finishedGameHorizontalStackPanel1.addControl(winnerText);
	// finishedGameHorizontalStackPanel1.addControl(winnerName);
	// finishedGameHorizontalStackPanel1.addControl(winnerScore);

	// Win texts
	finishedGameHorizontalStackPanel1.addControl(finishedGameDealerWin);
	finishedGameHorizontalStackPanel1.addControl(finishedGamePlayer1Win);
	finishedGameHorizontalStackPanel1.addControl(finishedGamePlayer2Win);
	finishedGameHorizontalStackPanel1.addControl(finishedGamePlayer1Blackjack);
	finishedGameHorizontalStackPanel1.addControl(finishedGamePlayer2Blackjack);
	finishedGameHorizontalStackPanel1.addControl(finishedGameTie);

	// Buttons
	finishedGameHorizontalStackPanel2.addControl(finishedGameBackButton);
	finishedGameHorizontalStackPanel2.addControl(finishedGameReplayButton);

	// Add the screen to the GUI texture
	bjRef.current.finishedGameGUI = finishedGameGUI;
}

// ****************************************************************************** //
//                                                                                //
//                                  ARENAGUI                                      //
//                                                                                //
// ****************************************************************************** //

// export const	instantiateArenaGUI = (bjRef: React.RefObject<bj.bjStruct>): void =>
// {
// 	// Canvas that will be used for the GUI
// 	const	arenaGUI = bj.createScreen("scoresGUI", "top");

// 	// All GUI components needed
// 	const	BGSemiTransparentColor: string = "#2e344080";
// 	const	arenaContainer = bj.createAdaptiveContainer("arenaContainer", "300px", "300px", undefined, "top");
// 			(arenaContainer.children[0] as baby.Rectangle).background = BGSemiTransparentColor;
// 	const	arenaBotContainer = bj.createAdaptiveContainer("arenaBotContainer", "300px", "300px", undefined, "bottom");
// 			(arenaBotContainer.children[0] as baby.Rectangle).background = BGSemiTransparentColor;
// 	const	arenaVerticalStackPanel = bj.createVerticalStackPanel("arenaVerticalStackPanel");
// 	const	arenaHorizontalStackPanel1 = bj.createHorizontalStackPanel("arenaHorizontalStackPanel1", 0);
// 	const	arenaHorizontalStackPanel2 = bj.createHorizontalStackPanel("scoresHorizontalStackPanel2", 0);
// 	const	scoresTitle = bj.createDynamicTitle("scoresTitle", "arenaScoreTitle");
// 	const	requiredPointsText = bj.createDynamicTitle("requiredPointsText", "arenaRequiredPoints");
// 	const	requiredPointsValue = bj.createDynamicText("requiredPointsValue");
// 			(requiredPointsValue.children[0] as baby.TextBlock).onDirtyObservable.add(() =>
// 			{
// 				bj.findComponentByName(bjRef, "requiredPointsValue").text = bjRef.current.requiredPointsToWin.toString();
// 			});
// 			(requiredPointsValue.children[0] as baby.TextBlock).fontSize = 48;
// 	const	player1ScoreText = bj.createDynamicText("player1ScoreText", "arenaPlayer1");
// 	const	player2ScoreText = bj.createDynamicText("player2ScoreText", "arenaPlayer2");
// 	const	playerSepartor = bj.createText("playerSepartor", "    ");
// 	const	player1ScoreValue = bj.createDynamicText("player1ScoreValue");
// 			(player1ScoreValue.children[0] as baby.TextBlock).onDirtyObservable.add(() =>
// 			{
// 				bj.findComponentByName(bjRef, "player1ScoreValue").text = bjRef.current.player1Score.toString();
// 			});
// 	const	player2ScoreValue = bj.createDynamicText("player2ScoreValue");
// 			(player2ScoreValue.children[0] as baby.TextBlock).onDirtyObservable.add(() =>
// 			{
// 				bj.findComponentByName(bjRef, "player2ScoreValue").text = bjRef.current.player2Score.toString();
// 			});

// 	// Add GUI components to the main menu
// 	// The order of adding controls matters for the layout
// 	arenaVerticalStackPanel.addControl(scoresTitle);
// 	arenaVerticalStackPanel.addControl(arenaHorizontalStackPanel1);
// 	arenaHorizontalStackPanel1.addControl(player1ScoreText);
// 	arenaHorizontalStackPanel1.addControl(player1ScoreValue);
// 	arenaHorizontalStackPanel1.addControl(playerSepartor);
// 	arenaHorizontalStackPanel1.addControl(player2ScoreText);
// 	arenaHorizontalStackPanel1.addControl(player2ScoreValue);
// 	arenaContainer.addControl(arenaVerticalStackPanel);
// 	arenaGUI.addControl(arenaContainer);
// 	arenaBotContainer.addControl(arenaHorizontalStackPanel2);
// 	arenaHorizontalStackPanel2.addControl(requiredPointsText);
// 	arenaHorizontalStackPanel2.addControl(requiredPointsValue);
// 	arenaBotContainer.addControl(arenaHorizontalStackPanel2);
// 	arenaGUI.addControl(arenaBotContainer);

// 	// Add the screen to the GUI texture
// 	bjRef.current.arenaGUI = arenaGUI;
// }
