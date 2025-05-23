// imports
import React from 'react';
import { useNavigate } from 'react-router-dom';

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

export enum states 
{
	main_menu,
	settings,
	game_settings,
	waiting_lobby,
	waiting_to_start,
	waiting_new_round,
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
	camera?: baby.FreeCamera;	// deprecated
	transitionCam?: baby.FreeCamera;
	mainMenuCam?: baby.FreeCamera;
	arenaCam?: baby.FreeCamera;
	pongSettingsCam?: baby.FreeCamera;
	map?: baby.AbstractMesh;
	
	// Pong objects
	paddle1?: baby.Mesh;
	paddle2?: baby.Mesh;
	ball?: baby.Mesh;
	
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

	// Screens GUI
	mainMenuGUI?: baby.Container;
	settingsGUI?: baby.Container;
	arenaGUI?: baby.Container;
	pongSettingsGUI?: baby.Container;
	debugGUI?: baby.Container;
	testGUI?: baby.Container;
	waitingRoundStartGUI?: baby.Container;
	countdownGUI?: baby.Container;
	finishedGameGUI?: baby.Container;
	
	// GUI's bindings
	bindings: Map<string, any>;

	// Engine and scene
	guiTexture?: baby.AdvancedDynamicTexture;
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

		bindings: new Map<string, React.RefObject<any>>(),
	};
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