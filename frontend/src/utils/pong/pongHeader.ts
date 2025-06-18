// imports
import React from 'react';

import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';

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

export enum playerStates
{
	none,
	isHost,
	isPlayer,
	isPlayer1,
	isPlayer2,
	isPlayer3,
	isPlayer4,
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
	room_list,
	waiting_to_start,
	countdown,
	in_transition,
	in_game,
	game_finished,
	not_found,
	waiting_tournament_to_start,
	tournament_bracket_preview,
	launch_games,
	tournament_round_1_game_1,
	tournament_round_1_game_2,
	in_game1,
	in_game2,
	input_username_1,
	input_username_2,
	input_username_3,
	input_username_4,
	game1_finished,
	game2_finished,
	waiting_to_start_final,
	tournament_final,
	in_final,
	in_final_countdown,
	tournament_final_game_finished,
	party_canceled,
	disconnecting,
}

export type pongStruct =
{
	// Engine and scene
	engine?: baby.Engine;
	scene?: baby.Scene;
	skybox?: baby.Mesh;
	PREDICT?: baby.Mesh;

	// Audio
	isButtonHovered?: boolean;

	// Cameras
	transitionCam?: baby.FreeCamera;
	mainMenuCam?: baby.FreeCamera;
	arenaCam?: baby.FreeCamera;
	pongSettingsCam?: baby.FreeCamera;
	notFoundCam?: baby.FlyCamera;
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

	username_1?:string;
	username_2?:string;
	username_3?:string;
	username_4?:string;
	
	// Tournament-specific properties
	tournamentPlayerCount: number;
	tournamentPlayerNames: string[];
	tournamentPlayerScores: number[];
	
	// Tournament game management
	tournamentId?: string;
	tournamentRound?: number;
	tournamentGame?: number;
	playerNameLeft?: string;
	playerNameRight?: string;
	tournamentPlayer1Id?: string;
	tournamentPlayer2Id?: string;
	tournamentPlayer3Id?: string;
	tournamentPlayer4Id?: string;
	tournamentPlayer1Name?: string;
	tournamentPlayer2Name?: string;
	tournamentPlayer3Name?: string;
	tournamentPlayer4Name?: string;
	tournamentPlayer1Score?: number;
	tournamentPlayer2Score?: number;
	tournamentPlayer3Score?: number;
	tournamentPlayer4Score?: number;
	tournamentFinalist1?: string;
	tournamentFinalist2?: string;
	tournamenFinalScore1?: number;
	tournamenFinalScore2?: number;
	game1Finished?: boolean;
	game2Finished?: boolean;
	isHost?: boolean;
	isHost2?: boolean;
	launched?: boolean;	// Used to know if the tournament has been launched
	waitingFinalSent?: boolean;	// Used to know if the waiting final has been sent to the server
	startFinalSent?: boolean;	// Used to know if the start final has been sent to the server
	isInGame1?: boolean;	// Used to know if the player is in game 1 of the tournament
	isInGame2?: boolean;	// Used to know if the player is in game 2 of the tournament
	isFinal?: boolean;	// Used to know if the player is in the final of the tournament
	// Room management


	rooms: Map<string, any>;
	party: Map<string, any>;
	lastRoomJoined?: string;
	lastHostedRoomId?: string;
	
	lastGameWinner?: string;
	lastGameReason?: string;

	paddle2TargetZ?: number;
	paddle1TargetZ?: number;
	lastSentPaddleZ?: number | null;
	
	lastUpdateSetAt?: number;	// Used to avoid sending too many updates to the server

	// GUI's bindings

	mainMenuGUI?: baby.Rectangle;
	settingsGUI?: baby.Rectangle;
	arenaGUI?: baby.Rectangle;
	pongSettingsGUI?: baby.Rectangle;
	debugGUI?: baby.Rectangle;
	testGUI?: baby.Rectangle;
	waitingRoundStartGUI?: baby.Rectangle;
	waitingScreenGUI?: baby.Rectangle;
	countdownGUI?: baby.Rectangle;
	finishedGameGUI?: baby.Rectangle;
	hostOrJoinGUI?: baby.Rectangle;
	roomListGUI?: baby.Rectangle;
	roomListVerticalStackPanel?: baby.StackPanel;
	roomListTournamentVerticalStackPanel?: baby.StackPanel;
	waitingTournamentToStartGUI?: baby.Rectangle;
	bracketGUI?: baby.Rectangle;
	inputUsernameGUI?: baby.Rectangle;

	inputUsernameTextBox1?: baby.StackPanel;
	inputUsernameTextBox2?: baby.StackPanel;
	inputUsernameTextBox3?: baby.StackPanel;
	inputUsernameTextBox4?: baby.StackPanel;

	// Other components bindings
	waitingTournamentToStartButtonBack?: baby.StackPanel;
	waitingTournamentToStartButtonPlay?: baby.StackPanel;
	waitingTournamentToStartButtonCancel?: baby.StackPanel;
	bracketPlayer1?: baby.StackPanel;
	bracketPlayer2?: baby.StackPanel;
	bracketPlayer3?: baby.StackPanel;
	bracketPlayer4?: baby.StackPanel;
	bracketFinalPlayer1?: baby.StackPanel;
	bracketFinalPlayer2?: baby.StackPanel;
	bracketWinnerPlayer?: baby.StackPanel;
	finishedGameBackButton?: baby.StackPanel;
	finishedGameReplayButton?: baby.StackPanel;

	// Engine and scene
	guiTexture?: baby.AdvancedDynamicTexture;

	// Music and sound
	audioEngine?: baby.AudioEngine;
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

		tournamentPlayerCount: 3,
		tournamentPlayerNames: [],
		tournamentPlayerScores: [],
		
		// Tournament game management initialized
		game1Finished: false,
		game2Finished: false,

		waitingFinalSent: false,	// Used to know if the waiting final has been sent to the server
		startFinalSent: false,
		

		rooms: new Map<string, any>(),
		party: new Map<string, any>(),
		launched: false,

		musicVolume: 1,
		soundVolume: 1,
	};
}

export const	label =
{
	// Actions
	back: ["Back ↩", "Retour ↩", "Indietro ↩", "⠨⠃⠁⠉⠅ ↩"],
	play: ["Play ▸", "Jouer ▸", "Giaoca ▸", "⠨⠏⠇⠁⠽ ▸"],
	replay: ["Replay ↻", "Rejouer ↻", "Rigioca ↻", "⠨⠗⠑⠏⠇⠁⠽ ↻"],
	join: ["Join ⬇", "Rejoindre ⬇", "Unisciti ⬇", "⠨⠚⠕⠊⠝ ⬇"],
	host: ["Host 🏠︎", "Héberger 🏠︎", "Hosta 🏠︎", "⠨⠓⠕⠎⠞ 🏠︎"],
	refresh: ["Refresh ⟳", "Rafraîchir ⟳", "Aggiorna ⟳", "⠨⠗⠑⠋⠗⠑⠎⠓ ⟳"],
	continue: ["Continue ▸", "Continuer ▸", "Continua ▸", "⠨⠉⠕⠝⠞⠊⠝⠥⠑ ▸"],
	cancel: ["Cancel ×", "Annuler ×", "Annulla ×", "⠨⠉⠁⠝⠉⠑⠇ ×"],
	next: ["Next ▸", "Suivant ▸", "Avanti ▸", "⠨⠝⠑⠭⠞ ▸"],
	previous: ["Previous ◂", "Précédent ◂", "Precedente ◂", "⠨⠏⠗⠑⠧⠊⠕⠥⠎ ◂"],
	abandon: ["Abandon ×", "Abandonner ×", "Abbandona ×", "⠨⠁⠃⠁⠝⠙⠕⠝ ×"],
	versus: ["Versus", "Contre", "Contro", "⠨⠧⠑⠗⠎⠥⠎"],


	// Main menu
	mainMenuTitle: ["Pong Game", "Jeu Pong", "Gioco Pong", "⠨⠏⠕⠝⠛ ⠨⠛⠁⠍⠑"],
	mainMenu: ["Main Menu", "Menu Principal", "Menu Principale", "⠨⠍⠁⠊⠝ ⠨⠍⠑⠝⠥"],
	playLocally: ["Play Locally ⌨", "Jouer en local ⌨", "Gioca in locale ⌨", "⠨⠏⠇⠁⠽ ⠨⠇⠕⠉⠁⠇⠇⠽ ⌨"],
	playAgainstAI: ["Play against\nAI ☹", "Jouer contre\nl'IA ☹", "Gioca contro\nl'IA ☹", "⠨⠏⠇⠁⠽ ⠁⠛⠁⠊⠝⠎⠞\n⠨⠁⠊ ☹"],
	playOnline: ["Play Online 🖧", "Jouer en ligne 🖧", "Gioca online 🖧", "⠨⠏⠇⠁⠽ ⠨⠕⠝⠇⠊⠝⠑ 🖧"],
	playTournament: ["Play Tournament 🎖", "Jouer au tournoi 🎖", "Gioca al torneo 🎖", "⠨⠏⠇⠁⠽ ⠨⠞⠕⠥⠗⠝⠁⠍⠑⠝⠞ 🎖"],
	settings:["Settings ⚙", "Paramètres ⚙", "Impostazioni ⚙", "⠨⠎⠑⠞⠞⠊⠝⠛⠎ ⚙"],
	gameSettings: ["Game Settings ⚙", "Paramètres ⚙", "Impostazioni ⚙", "⠨⠛⠁⠍⠑ ⠨⠎⠑⠞⠞⠊⠝⠛⠎ ⚙"],
	returnToMuseumButton: ["Return to Museum 🏛︎", "Retour au musée 🏛︎", "Torna al museo 🏛︎", "⠨⠗⠑⠞⠥⠗⠝ ⠞⠕ ⠨⠍⠥⠎⠑⠥⠍ 🏛︎"],

	// Settings
	settingsMusic: ["♫ Music:", "♫ Musique:", "♫ Musica:", "♫ ⠨⠍⠥⠎⠊⠉⠒: "],
	settingsSound: ["🗣 Sound:", "🗣 Son:", "🗣 Suono:", "🗣 ⠨⠎⠕⠥⠝⠙⠒"],

	// Pong Settings
	pongSettingsTitle: ["Pong Settings", "Paramètres du Pong", "Impostazioni Pong", "⠨⠏⠕⠝⠛ ⠨⠎⠑⠞⠞⠊⠝⠛⠎"],
	pointsRequiredToWin: ["Points required to win:", "Points requis pour gagner:", "Punti richiesti per vincere:", "⠨⠏⠕⠊⠝⠞⠎ ⠗⠑⠟⠥⠊⠗⠑⠙ ⠞⠕ ⠺⠊⠝⠒"],
	arenaHeight: ["Arena height:", "Hauteur de l'arène:", "Altezza dell'arena:", "⠨⠁⠗⠑⠝⠁ ⠓⠑⠊⠛⠓⠞⠒"],
	arenaWidth: ["Arena width:", "Largeur de l'arène:", "Larghezza dell'arena:", "⠨⠁⠗⠑⠝⠁ ⠺⠊⠙⠞⠓⠒"],
	paddleHeight: ["Paddle height:", "Hauteur de la raquette:", "Altezza della racchetta:", "⠨⠏⠁⠙⠙⠇⠑ ⠓⠑⠊⠛⠓⠞⠒"],
	paddleSpeed: ["Paddle speed:", "Vitesse de la raquette:", "Velocità della racchetta:", "⠨⠏⠁⠙⠙⠇⠑ ⠎⠏⠑⠑⠙⠒"],
	ballSpeed: ["Ball speed:", "Vitesse de la balle:", "Velocità della palla:", "⠨⠃⠁⠇⠇ ⠎⠏⠑⠑⠙⠒"],
	maxBallSpeed: ["Max ball speed:", "Vitesse maximale de la balle:", "Velocità massima della palla:", "⠨⠍⠁⠭ ⠃⠁⠇⠇ ⠎⠏⠑⠑⠙⠒"],

	// Coutdown
	startingIn: ["Starting in", "Début dans", "Inizio tra", "⠨⠎⠞⠁⠗⠞⠊⠝⠛ ⠊⠝"],

	// Arena
	arenaScoreTitle: ["Score", "Score", "Punteggio", "⠨⠎⠉⠕⠗⠑"],
	arenaPlayer1: ["Player 1:", "Joueur 1:", "Giocatore 1:", "⠨⠏⠇⠁⠽⠑⠗ ⠼⠁⠒"],
	arenaPlayer2: ["Player 2:", "Joueur 2:", "Giocatore 2:", "⠨⠏⠇⠁⠽⠑⠗ ⠼⠃⠒"],
	arenaRequiredPoints: ["Required points to win:", "Points requis pour gagner:", "Punti richiesti per vincere:", "⠨⠗⠑⠟⠥⠊⠗⠑⠙ ⠏⠕⠊⠝⠞⠎ ⠞⠕ ⠺⠊⠝⠒"],

	// Finished Game
	resultPlayer1: ["Player 1", "Joueur 1", "Giocatore 1", "⠨⠏⠇⠁⠽⠑⠗ ⠼⠁"],
	resultPlayer2: ["Player 2", "Joueur 2", "Giocatore 2", "⠨⠏⠇⠁⠽⠑⠗ ⠼⠃"],
	finishedGameTitle: ["Game Finished", "Partie terminée", "Gioco terminato", "⠨⠛⠁⠍⠑ ⠨⠋⠊⠝⠊⠎⠓⠑⠙"],
	winner: ["Winner:", "Gagnant:", "Vincitore:", "⠨⠺⠊⠝⠝⠑⠗⠒"],
	looser: ["Loser:", "Perdant:", "Perdente:", "⠨⠇⠕⠎⠑⠗⠒"],
	scored: ["| Scored:", "| A marqué:", "| Ha segnato:", "⠨⠎⠉⠕⠗⠑⠙⠒"],

	// Host or Join
	hostText: ["Host", "Héberger", "Hosta", "⠨⠓⠕⠎⠞"],
	joinText: ["Join", "Rejoindre", "Unisciti", "⠨⠚⠕⠊⠝"],

	// Room List
	roomListTitle: ["Room List", "Liste des salles", "Elenco delle stanze", "⠨⠗⠕⠕⠍ ⠨⠇⠊⠎⠞"],
	roomListEmpty: ["No rooms available", "Aucune salle disponible", "Nessuna stanza disponibile",, "⠨⠝⠕ ⠗⠕⠕⠍⠎ ⠁⠧⠁⠊⠇⠁⠃⠇⠑" ],
	roomListJoin: ["Join Room", "Rejoindre la salle", "Unisciti alla stanza", "⠨⠚⠕⠊⠝ ⠨⠗⠕⠕⠍"],

	// Waiting Screen
	waitingForPlayers: ["Waiting for players...", "En attente de joueurs...", "In attesa di giocatori...", "⠨⠺⠁⠊⠞⠊⠝⠛ ⠋⠕⠗ ⠏⠇⠁⠽⠑⠗⠎⠲⠲⠲"],

	// Tournament Settings
	waitingTournamentToStartTitle: ["Waiting for tournament to start", "En attente du tournoi", "In attesa dell'inizio del torneo", "⠨⠺⠁⠊⠞⠊⠝⠛ ⠋⠕⠗ ⠞⠕⠥⠗⠝⠁⠍⠑⠝⠞ ⠞⠕ ⠎⠞⠁⠗⠞"],
	waitingTournamentToStartPlayerText: ["Players:", "Joueurs:", "Giocatori:", "⠨⠏⠇⠁⠽⠑⠗⠎⠒"],
	bracketTitle: ["Tournament Bracket", "Tableau du tournoi", "Tabellone del torneo", "⠨⠞⠕⠥⠗⠝⠁⠍⠑⠝⠞ ⠨⠃⠗⠁⠉⠅⠑⠞"],
	bracketRound1: ["First round", "Premier tour", "Primo turno", "⠨⠋⠊⠗⠎⠞"],
	bracketRound2: ["Finals", "Finales", "Finali", "⠨⠋⠊⠝⠁⠇⠎"],
	bracketRound3: ["Winner", "Gagnant", "Vincitore", "⠨⠺⠊⠝⠝⠑⠗"],

	// Username Input
	inputUsernameTitle: ["Enter your username", "Entrez votre nom d'utilisateur", "Inserisci il tuo nome utente", "⠨⠑⠝⠞⠑⠗ ⠽⠕⠥⠗ ⠥⠎⠑⠗⠝⠁⠍⠑"],
	
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
		case lang.braille:
			return label[key][3] || "⠨⠇⠁⠝⠛ ⠨⠝⠕⠞ ⠨⠋⠕⠥⠝⠙"; // Fallback to English if Brail translation is not available
		default:
			return "❌ language not found ❌";
	}
}

