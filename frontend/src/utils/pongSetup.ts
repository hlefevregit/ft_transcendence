// imports
import React from 'react';

import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';

export enum	colorsScheme
{
	// BASIC COLORS
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
	frostAccent1 = "#5e81ac",
	frostAccent2 = "#81a1c1",
	frostAccent3 = "#88c0d0",
	frostAccent4 = "#8fbcbb",

	// Accent colors - Aurora
	auroraAccent1 = "#bf616a",
	auroraAccent2 = "#d08770",
	auroraAccent3 = "#ebcb8b",
	auroraAccent4 = "#a3be8c",
	auroraAccent5 = "#b48ead",

}

export enum	gameModes
{
	none,
	local,
	ai,
	online,
	tournament,
}

export enum states 
{
	main_menu,
	settings,
	host_or_join,
	game_settings,
	hosting_waiting_players,
	hosting_tournament_waiting_players,
	room_list,
	waiting_to_start,
	countdown,
	in_transition,
	in_game,
	game_finished,
	not_found,
}

export type pongStruct =
{
	// Engine and scene
	engine?: baby.Engine;
	scene?: baby.Scene;
	skybox?: baby.Mesh;

	// Cameras
	transitionCam?: baby.FreeCamera;
	mainMenuCam?: baby.FreeCamera;
	arenaCam?: baby.FreeCamera;
	notFoundCam?: baby.FlyCamera;
	pongSettingsCam?: baby.FreeCamera;
	map?: baby.AbstractMesh;
	
	// Pong objects
	paddle1?: baby.Mesh;
	paddle2?: baby.Mesh;
	ball?: baby.Mesh;

	ceiling?: baby.Mesh;
	floor?: baby.Mesh;
	wallLeft?: baby.Mesh;
	wallRight?: baby.Mesh;
	
	// Variables
	pressedKeys: Set<string>;
	arenaWidth: number;
	arenaHeight: number;
	ballDirection: baby.Vector3;
	ballSpeedModifier: number;
	ballSpeed: number;
	ballDiameter: number;
	maxBallSpeed: number;
	paddleSpeed: number;
	paddleHeight: number;
	paddleWidth: number;

	countdown: number;
	roundTime: number;
	requiredPointsToWin: number;

	player1Score: number;
	player2Score: number;
	// player1Name: string;
	// player2Name: string;

	tournamentPlayerCount: number;
	tournamentPlayerNames: string[];
	tournamentPlayerScores: number[];

	// Screens GUI
	mainMenuGUI?: baby.Container;
	settingsGUI?: baby.Container;
	arenaGUI?: baby.Container;
	pongSettingsGUI?: baby.Container;
	debugGUI?: baby.Container;
	testGUI?: baby.Container;
	waitingRoundStartGUI?: baby.Container;
	waitingScreenGUI?: baby.Container;
	countdownGUI?: baby.Container;
	finishedGameGUI?: baby.Container;
	hostOrJoinGUI?: baby.Container;
	roomListGUI?: baby.Container;
	// tournamentSettingsGUI?: baby.Container; // deprecated
	waitingTournamentGUI?: baby.Container;

	roomListVerticalStackPanel?: baby.StackPanel;

	isHost?: boolean;
	lastUpdateSetAt?: number;	// Used to avoid sending too many updates to the server
	
	// GUI's bindings
	rooms: Map<string, any>;
	lastRoomJoined?: string;
	lastHostedRoomId?: string;

	lastGameWinner?: string;
	lastGameReason?: string;

	paddle2TargetZ?: number;
	paddle1TargetZ?: number;
	lastSentPaddleZ?: number | null;

	// Other components bindings
	pongSettingsPlayButton?: baby.StackPanel;
	pongSettingsContinueButton?: baby.StackPanel;

	// Engine and scene
	guiTexture?: baby.AdvancedDynamicTexture;

	// Music and sound
	musicVolume: number;
	soundVolume: number;

	mainMenuMusic?: baby.Sound;
	playingMusic?: baby.Sound;
	waitingMusic?: baby.Sound;
};

export function initPongStruct(): pongStruct 
{
	return {
		// Variables
		pressedKeys: new Set<string>(),
		arenaWidth: 10,
		arenaHeight: 10,
		ballDirection: new baby.Vector3(0.1, 0, 0),
		ballSpeedModifier: 1,
		ballSpeed: 0.1,
		ballDiameter: 1,
		maxBallSpeed: 0.5,
		paddleSpeed: 0.25,
		paddleHeight: 4,
		paddleWidth: 0.25,

		countdown: 4,
		roundTime: 0,
		requiredPointsToWin: 3,

		player1Score: 0,
		player2Score: 0,
		// player1Name: "",
		// player2Name: "",

		tournamentPlayerCount: 3,
		tournamentPlayerNames: [],
		tournamentPlayerScores: [],

		rooms: new Map<string, React.RefObject<any>>(),

		musicVolume: 1,
		soundVolume: 1,
	};
}

export const	label =
{
	// Actions
	back: ["Back ↩", "Retour ↩", "Indietro ↩", "⠨⠗⠑⠞⠕⠥⠗ ↩"],
	play: ["Play ▸", "Jouer ▸", "Giaoca ▸", "⠨⠚⠕⠥⠑⠗ ▸"],
	replay: ["Replay ↻", "Rejouer ↻", "Rigioca ↻", "⠨⠗⠑⠚⠕⠥⠑⠗ ↻"],
	join: ["Join ⬇", "Rejoindre ⬇", "Unisciti ⬇", "⠨⠗⠑⠚⠕⠊⠝⠙⠗⠑ ⬇"],
	host: ["Host 🏠︎", "Héberger 🏠︎", "Hosta 🏠︎", "⠨⠓⠿⠃⠑⠗⠛⠑⠗ 🏠︎"],
	refresh: ["Refresh ⟳", "Rafraîchir ⟳", "Aggiorna ⟳", "⠨⠗⠑⠋⠗⠑⠎⠓ ⟳"],
	cancel: ["Cancel ×", "Annuler ×", "Annulla ×", "⠨⠉⠁⠝⠉⠑⠇ ×"],
	continue: ["Continue ▸", "Continuer ▸", "Continua ▸", "⠨⠉⠕⠝⠞⠊⠝⠥⠑⠗ ▸"],


	// Main menu
	mainMenuTitle: ["Pong Game", "Jeu Pong", "Gioco Pong", "⠨⠚⠑⠥ ⠨⠏⠕⠝⠛"],
	mainMenu: ["Main Menu", "Menu Principal", "Menu Principale", "⠨⠍⠑⠝⠥ ⠨⠏⠗⠊⠝⠉⠊⠏⠁⠇⠑"],
	playLocally: ["Play Locally ⌨", "Jouer en local ⌨", "Gioca in locale ⌨", "⠨⠚⠕⠥⠑⠗ ⠨⠇⠕⠉⠁⠇ ⌨"],
	playAgainstAI: ["Play against\nAI ☹", "Jouer contre\nl'IA ☹", "Gioca contro\nl'IA ☹", "⠨⠚⠕⠥⠑⠗ ⠨⠉⠕⠝⠞⠗⠑\n ⠨⠁⠊ ☹"],
	playOnline: ["Play Online 🖧", "Jouer en ligne 🖧", "Gioca online 🖧", "⠨⠚⠕⠥⠑⠗ ⠑⠝ ⠇⠊⠛⠝⠑ 🖧"],
	playTournament: ["Play Tournament 🎖", "Jouer au tournoi 🎖", "Gioca al torneo 🎖", "⠨⠚⠕⠥⠑⠗ ⠁⠥ ⠞⠕⠥⠗⠝⠕⠊ 🎖"],
	settings:["Settings ⚙", "Paramètres ⚙", "Impostazioni ⚙", "⠨⠎⠑⠞⠞⠊⠝⠛⠎ ⚙"],
	gameSettings: ["Game Settings ⚙", "Paramètres ⚙", "Impostazioni ⚙", "⠨⠛⠁⠍⠑ ⠨⠎⠑⠞⠞⠊⠝⠛⠎ ⚙"],
	returnToMuseumButton: ["Return to Museum 🏛︎", "Retour au musée 🏛︎", "Torna al museo 🏛︎", "⠨⠗⠑⠞⠕⠥⠗ ⠁⠥ ⠍⠥⠎⠿⠑ 🏛︎"],

	// Settings
	settingsMusic: ["♫ Music:", "♫ Musique:", "♫ Musica:", "♫ ⠨⠍⠥⠎⠊⠉: "],
	settingsSound: ["🗣 Sound:", "🗣 Son:", "🗣 Suono:", "🗣 ⠨⠎⠕⠝⠒"],

	// Pong Settings
	pongSettingsTitle: ["Pong Settings", "Paramètres du Pong", "Impostazioni Pong", "⠨⠏⠕⠝⠛ ⠨⠎⠑⠞⠞⠊⠝⠛⠎"],
	pointsRequiredToWin: ["Points required to win:", "Points requis pour gagner:", "Punti richiesti per vincere:", "⠨⠏⠕⠝⠞ ⠨⠗⠑⠟⠥⠊ ⠨⠋⠕⠥⠗ ⠨⠛⠁⠝⠝⠑⠗:"],
	arenaHeight: ["Arena height:", "Hauteur de l'arène:", "Altezza dell'arena:", "⠨⠁⠗⠑⠝⠁ ⠨⠓⠑⠊⠛⠓⠞:"],
	arenaWidth: ["Arena width:", "Largeur de l'arène:", "Larghezza dell'arena:", "⠨⠁⠗⠑⠝⠁ ⠨⠺⠊⠙⠞⠓:"],
	paddleHeight: ["Paddle height:", "Hauteur de la raquette:", "Altezza della racchetta:", "⠨⠏⠁⠙⠙⠇⠑ ⠨⠓⠑⠊⠛⠓⠞:"],
	paddleSpeed: ["Paddle speed:", "Vitesse de la raquette:", "Velocità della racchetta:", "⠨⠏⠁⠙⠙⠇⠑ ⠨⠎⠏⠑⠑⠙:"],
	ballSpeed: ["Ball speed:", "Vitesse de la balle:", "Velocità della palla:", "⠨⠃⠁⠇⠇ ⠨⠎⠏⠑⠑⠙:"],
	maxBallSpeed: ["Max ball speed:", "Vitesse maximale de la balle:", "Velocità massima della palla:", "⠨⠍⠁⠭ ⠨⠃⠁⠇⠇ ⠨⠎⠏⠑⠑⠙:"],

	// Coutdown
	startingIn: ["Starting in", "Début dans", "Inizio tra", "⠨⠎⠞⠁⠗⠞ ⠨⠊⠝"],

	// Arena
	arenaScoreTitle: ["Score", "Score", "Punteggio", "⠨⠎⠉⠕⠗⠑"],
	arenaPlayer1: ["Player 1:", "Joueur 1:", "Giocatore 1:", "⠨⠏⠇⠁⠽⠑⠗ 1:"],
	arenaPlayer2: ["Player 2:", "Joueur 2:", "Giocatore 2:", "⠨⠏⠇⠁⠽⠑⠗ 2:"],
	arenaRequiredPoints: ["Required points to win:", "Points requis pour gagner:", "Punti richiesti per vincere:", "⠨⠏⠕⠝⠞ ⠨⠗⠑⠟⠥⠊ ⠨⠋⠕⠥⠗ ⠨⠛⠁⠝⠝⠑⠗:"],

	// Finished Game
	resultPlayer1: ["Player 1", "Joueur 1", "Giocatore 1", "⠨⠏⠇⠁⠽⠑⠗ 1"],
	resultPlayer2: ["Player 2", "Joueur 2", "Giocatore 2", "⠨⠏⠇⠁⠽⠑⠗ 2"],
	finishedGameTitle: ["Game Finished", "Partie terminée", "Gioco terminato", "⠨⠛⠁⠍⠑ ⠨⠞⠑⠗⠍⠊⠝é"],
	winner: ["Winner:", "Gagnant:", "Vincitore:", "⠨⠺⠊⠝⠝⠑⠗:"],
	looser: ["Loser:", "Perdant:", "Perdente:", "⠨⠇⠕⠕⠎⠑⠗:"],
	scored: ["| Scored:", "| A marqué:", "| Ha segnato:", "| ⠨⠎⠉⠕⠗⠑⠙⠒"],

	// Host or Join
	hostText: ["Host", "Héberger", "Hosta", "⠨⠓⠕⠎⠞"],
	joinText: ["Join", "Rejoindre", "Unisciti", "⠨⠗⠑⠚⠕⠊⠝"],

	// Room List
	roomListTitle: ["Room List", "Liste des salles", "Elenco delle stanze", "⠨⠗⠕⠕⠍ ⠨⠇⠊⠎⠞"],
	roomListEmpty: ["No rooms available", "Aucune salle disponible", "Nessuna stanza disponibile",, "⠨⠝⠕ ⠗⠕⠕⠍⠎ ⠁⠧⠁⠊⠇⠁⠃⠇⠑" ],
	roomListJoin: ["Join Room", "Rejoindre la salle", "Unisciti alla stanza", "⠨⠗⠑⠚⠕⠊⠝ ⠨⠗⠕⠕⠍"],

	// Waiting Screen
	waitingForPlayers: ["Waiting for players...", "En attente de joueurs...", "In attesa di giocatori...", "⠨⠺⠁⠊⠞⠊⠝⠛ ⠨⠋⠕⠗ ⠨⠏⠇⠁⠽⠑⠗⠎..."],

	// Tournament Settings
	tournamentSettingsTitle: ["Tournament Settings", "Paramètres du tournoi", "Impostazioni del torneo", "⠨⠞⠕⠥⠗⠝⠕ ⠨⠎⠑⠞⠞⠊⠝⠛⠎"],
	tournamentSettingsPlayerCount: ["Player count:", "Nombre de joueurs:", "Numero di giocatori:", "⠨⠏⠇⠁⠽⠑⠗ ⠨⠉⠕⠥⠝⠞:"],
	
} as const;

export type	labelKey = keyof typeof label;

export enum	lang
{
	english,
	french,
	italian,
	braille,
};

export const	getLabel = (key: labelKey, currentLanguage: lang): string =>
{
	if (!label[key]) return "label not found";
	switch (currentLanguage)
	{
		case lang.english:
			return label[key][0];
		case lang.french:
			return label[key][1];
		case lang.italian:
			return label[key][2];
		case lang.brail:
			return label[key][3] || "⠨⠇⠁⠝⠛ ⠨⠝⠕⠞ ⠨⠋⠕⠥⠝⠙"; // Fallback to English if Brail translation is not available
		default:
			return "❌ language not found ❌";
	}
}

export const	setBallPosition = (ball: baby.Mesh, position: baby.Vector3): void =>
{
	if (!ball) return;
	ball.position = position;
}

export const	resetBall = (pong: pongStruct): void =>
{
	if (!pong.ball) return;
	pong.ball.position = baby.Vector3.Zero();
	pong.ballDirection = baby.Vector3.Zero();
	pong.ballSpeedModifier = 1;
}

export const	setPaddleHeight = (paddle: baby.Mesh, height: number): void =>
{
	if (!paddle) return;
	paddle.scaling.z = height;
}

export const	resetPaddlesHeight = (pong: pongStruct): void =>
{
	if (!pong.paddle1 || !pong.paddle2) return;
	setPaddleHeight(pong.paddle1, pong.paddleHeight);
	setPaddleHeight(pong.paddle2, pong.paddleHeight);
}

export const	setPaddlePosition = (paddle: baby.Mesh, position: baby.Vector3): void =>
{
	if (!paddle) return;
	paddle.position = position;
}

export const	resetPaddlesPosition = (pong: pongStruct): void =>
{
	if (!pong.paddle1 || !pong.paddle2) return;
	setPaddlePosition(pong.paddle1, new baby.Vector3(-(pong.arenaWidth - 1), 0, 0));
	setPaddlePosition(pong.paddle2, new baby.Vector3((pong.arenaWidth - 1), 0, 0));
}

export const	setBallDirection = (pong: pongStruct, direction: baby.Vector3): void =>
{
	if (!pong.ball) return;
	pong.ballDirection = direction;
}

export const	setBallDirectionRight = (pong: pongStruct): void =>
{
	if (!pong.ball) return;
	setBallDirection(pong, new baby.Vector3(pong.ballSpeed, 0, 0));
}

export const	setBallDirectionLeft = (pong: pongStruct): void =>
{
	if (!pong.ball) return;
	setBallDirection(pong, new baby.Vector3(-pong.ballSpeed, 0, 0));
}

export const	setBallDirectionRandom = (pong: pongStruct): void =>
{
	if (!pong.ball) return;
	setBallDirection(pong, Math.random() > 0.5
		? new baby.Vector3(pong.ballSpeed, 0, 0)
		: new baby.Vector3(-pong.ballSpeed, 0, 0));
}

export const	reflectBallCeiling = (pong: pongStruct): void =>
{
	if (!pong.ball) return;
	if (pong.ballDirection.z < 0 && pong.ball.position.z <= -pong.arenaHeight)
	{
		pong.ballDirection.z *= -1;
		pong.ballSpeedModifier += pong.ballSpeedModifier * pong.ballSpeed >= pong.maxBallSpeed ? 0 : pong.ballSpeed;
	}
	if (pong.ballDirection.z > 0 && pong.ball.position.z >= pong.arenaHeight)
	{
		pong.ballDirection.z *= -1;
		pong.ballSpeedModifier += pong.ballSpeedModifier * pong.ballSpeed >= pong.maxBallSpeed ? 0 : pong.ballSpeed;
	}
	return;
}

export const	reflectBallPaddles = (pong: pongStruct): void =>
{
	if (!pong.ball || !pong.paddle1 || !pong.paddle2) return;
	let	paddlePos: baby.Vector3 = pong.paddle2.position;
	if (pong.ballDirection.x < 0) { paddlePos = pong.paddle1.position; } // Choose the right paddle to bounce off
	if (game.collideWithPaddle(pong, paddlePos))
	{
		pong.ballDirection.z = (pong.ballDirection.z + game.chooseBouncingAngle(pong, paddlePos)) / 2;
		pong.ballDirection.x *= -1;
		pong.ballSpeedModifier += pong.ballSpeedModifier * pong.ballSpeed >= pong.maxBallSpeed ? 0 : pong.ballSpeed;
		return;
	}
}

export	const	setAreanWidth = (pong: pongStruct, width: number): void =>
{
	pong.arenaWidth = width;
}

export	const	setAreanHeight = (pong: pongStruct, height: number): void =>
{
	pong.arenaHeight = height;
}