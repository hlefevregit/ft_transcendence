import * as baby from '@/libs/babylonLibs';

export enum	colorsScheme
{
	// BASIC COLORS - Should not be used
	red = "#FF0000",
	green = "#00FF00",
	blue = "#0000FF",
	yellow = "#FFFF00",
	cyan = "#00FFFF",
	magenta = "#FF00FF",
	white = "#FFFFFF",
	black = "#000000",
	grey = "#808080",

	// Dark theme
	dark1 = "#2e3440",	// darkest
	dark2 = "#3b4252",
	dark3 = "#434c5e",
	dark4 = "#4c566a",	// lightest

	// Light theme
	light1 = "#d8dee9",	// darkest
	light2 = "#e5e9f0",
	light3 = "#eceff4",	// lightest


	// Accent colors - Frost
	frostAccent1 = "#5e81ac",	// turquoise
	frostAccent2 = "#81a1c1",	// light blue
	frostAccent3 = "#88c0d0",	// sky blue
	frostAccent4 = "#8fbcbb",	// water blue

	// Accent colors - Aurora
	auroraAccent1 = "#bf616a",	// red
	auroraAccent2 = "#d08770",	// orange
	auroraAccent3 = "#ebcb8b",	// yellow
	auroraAccent4 = "#a3be8c",	// green
	auroraAccent5 = "#b48ead",	// mauve

}

export enum States
{
	main_menu,
	game_mode_selection,
	settings,
	in_game,
	game_over,
}

export enum GameState
{
	in_hand,
	waiting,
}

export type bjStruct =
{
	// Engine and scene
	engine?: baby.Engine;
	scene?: baby.Scene;
	skybox?: baby.Mesh;

	// Cameras
	camera?: baby.FreeCamera;
	map?: baby.AbstractMesh;

	// BlackJack objects
	card?: baby.Mesh;
	chips?: baby.Mesh;

	// Variables
	player1Money: number;
	player2Money: number;
	playerMoney: number;
	splitButton?: baby.StackPanel;
	canSplit?: boolean;
	doubleButton?: baby.StackPanel;
	canDouble?: boolean;

	// GUIs
	mainMenuGUI?: baby.Rectangle;
	gameModeGUI?: baby.Rectangle;
	settingsGUI?: baby.Rectangle;
	arenaGUI?: baby.Rectangle;
	debugGUI?: baby.Rectangle;
	actionGUI?: baby.Rectangle;

	// Textures
	guiTexture?: baby.AdvancedDynamicTexture;

	// Game state
	gameState?: GameState;
};

export function initBJStruct(): bjStruct
{
	return {
		player1Money: 1000, // Starting money for player 1
		player2Money: 1000, // Starting money for player 2
		playerMoney: 1000, // Starting money for the player
	};
}

export const	translations =
{
	// Actions
	back: ["Back ↩", "Retour ↩", "Indietro ↩", "⠨⠃⠁⠉⠅ ↩"],
	play: ["Play ▸", "Jouer ▸", "Giaoca ▸", "⠨⠏⠇⠁⠽ ▸"],
	replay: ["Replay ↻", "Rejouer ↻", "Rigioca ↻", "⠨⠗⠑⠏⠇⠁⠽ ↻"],
	abandon: ["Abandon ×", "Abandonner ×", "Abbandona ×", "⠨⠁⠃⠁⠝⠙⠕⠝ ×"],
	versus: ["Versus", "Contre", "Contro", "⠨⠧⠑⠗⠎⠥⠎"],

	// Main menu
	mainMenuTitle: ["BlackJack", "BlackJack", "BlackJack", "⠨⠃⠇⠁⠉⠅ ⠠⠚⠁⠉⠅"],
	mainMenu: ["Main Menu", "Menu Principal", "Menu Principale", "⠨⠍⠁⠊⠝ ⠨⠍⠑⠝⠥"],
	settings:["Settings ⚙", "Paramètres ⚙", "Impostazioni ⚙", "⠨⠎⠑⠞⠞⠊⠝⠛⠎ ⚙"],
	returnToMuseumButton: ["Return to Museum 🏛︎", "Retour au musée 🏛︎", "Torna al museo 🏛︎", "⠨⠗⠑⠞⠥⠗⠝ ⠞⠕ ⠨⠍⠥⠎⠑⠥⠍ 🏛︎"],

	// Game modes
	solo: ["Solo", "Solo", "Solo", "⠨⠎⠕⠇⠕"],
	duo: ["Duo", "Duo", "Duo", "⠨⠙⠥⠕"],

	// Game
	actionTitle: ["Choose an action:", "Choisissez une action :", "Scegli un'azione:", "⠨⠉⠓⠕⠊⠎⠊ ⠁⠝ ⠁⠉⠞⠊⠕⠝ :"],
	stand: ["Stand", "Rester", "Stare", "⠨⠎⠞⠁⠝⠙"],
	split: ["Split", "Diviser", "Dividi", "⠨⠎⠉⠊⠝⠙⠑⠗"],
	doubleDown: ["Double Down", "Doubler", "Raddoppia", "⠨⠙⠕⠥⠃⠇⠑ ⠙⠕⠺⠝"],
	hit: ["Hit", "Prendre", "Prendi", "⠨⠓⠊⠞"],
} as const;

export type	labelKey = keyof typeof translations;

export enum	language
{
	english,
	french,
	italian,
	braille,
};

export const	getLabel = (key: labelKey, currentLanguage: language): string =>
{
	if (!translations[key]) return "label not found";
	switch (currentLanguage)
	{
		case language.english:
			return translations[key][0];
		case language.french:
			return translations[key][1];
		case language.italian:
			return translations[key][2];
		case language.braille:
			return translations[key][3] || "⠨⠇⠁⠝⠛ ⠨⠝⠕⠞ ⠨⠋⠕⠥⠝⠙"; // Fallback to English if Brail translation is not available
		default:
			return "❌ language not found ❌";
	}
}
