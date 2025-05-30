import React from 'react';
import { useNavigate } from 'react-router-dom';

import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';

// Move paddle Up
export const	movePaddleUp = (pong: React.RefObject<game.pongStruct>, paddleZ: number): number =>
{
	if (!pong.current.paddle1 ) return(0);
	return(
		Math.max
		(
			- pong.current.arenaHeight + (pong.current.paddleHeight / 2),
			Math.min
			(
				pong.current.arenaHeight - (pong.current.paddleHeight / 2),
				paddleZ - pong.current.paddleSpeed
			)
		)
	)
}

// Move paddle Down
export const	movePaddleDown = (pong: React.RefObject<game.pongStruct>, paddleZ: number): number =>
{
	if (!pong.current.paddle2 ) return(0);
	return(
		Math.max
		(
			- pong.current.arenaHeight + (pong.current.paddleHeight / 2),
			Math.min
			(
				pong.current.arenaHeight - (pong.current.paddleHeight / 2),
				paddleZ + pong.current.paddleSpeed
			)
		)
	)
}

let	timer = 1000;	// 1000 ms (1 second)
let	previousBallDirection = baby.Vector3.Zero();
let	previousBallPosition = baby.Vector3.Zero();
export const	AIMovePaddle = (pong: React.RefObject<game.pongStruct>): void =>
{
	if (   !pong.current.engine
		|| !pong.current.paddle1
		|| !pong.current.paddle2
		|| !pong.current.ball) return;


	// NEW AI LOGIC
	timer -= pong.current.engine.getDeltaTime();
	if (timer < 0)
	{
		// Get the need informations each seconds
		previousBallDirection = pong.current.ballDirection.clone();
		previousBallPosition = pong.current.ball.position.clone();
		timer = 1000; // Reset timer
	}
	if (previousBallDirection.x > 0)	// Ball is going to the player paddle
	{
		// Re-center the AI paddle in the arena
		if (pong.current.paddle1.position.z > 0.2) pong.current.paddle1.position.z = movePaddleUp(pong, pong.current.paddle1.position.z);
		else if (pong.current.paddle1.position.z < -0.2) pong.current.paddle1.position.z = movePaddleDown(pong, pong.current.paddle1.position.z);
	}
	else	// Ball is going to the AI paddle
	{
		// Move the AI paddle to the predicted position of the ball
		if (pong.current.paddle1.position.z > predictBallImpactZ(pong) + 0.2) pong.current.paddle1.position.z = movePaddleUp(pong, pong.current.paddle1.position.z);
		else if (pong.current.paddle1.position.z < predictBallImpactZ(pong) - 0.2) pong.current.paddle1.position.z = movePaddleDown(pong, pong.current.paddle1.position.z);
	}

	// OLD AI logic
	// if (pong.current.ballDirection.x < 0)	// Ball is going to the AI paddle
	// {
	// 	if (pong.current.ball.position.z + pong.current.paddleHeight / 2 < pong.current.paddle1.position.z) pong.current.paddle1.position.z = movePaddleUp(pong, pong.current.paddle1.position.z);
	// 	if (pong.current.ball.position.z - pong.current.paddleHeight / 2 > pong.current.paddle1.position.z) pong.current.paddle1.position.z = movePaddleDown(pong, pong.current.paddle1.position.z);
	// }
	// else	// Ball is going to the player paddle
	// {
	// 	console.log("ball moving away from AI paddle");
	// 	// Re-center the AI paddle in the arena
	// 	if (pong.current.paddle1.position.z > 0.2) pong.current.paddle1.position.z = movePaddleUp(pong, pong.current.paddle1.position.z);
	// 	else if (pong.current.paddle1.position.z < -0.2) pong.current.paddle1.position.z = movePaddleDown(pong, pong.current.paddle1.position.z);
	// }
}

export const	predictBallImpactZ = (pong: React.RefObject<game.pongStruct>): number =>
{
	if (!pong.current.ball) return(0);

	// Always use current ball data
	const	ballPos = pong.current.ball.position.clone();
	const	ballDir = pong.current.ballDirection.clone();

	// Calculate time to reach paddle plane (either left or right wall)
	const	targetX = ballDir.x > 0 
		? pong.current.arenaWidth    // Right wall
		: -pong.current.arenaWidth;  // Left wall

	// Distance to travel along X axis
	const	distanceX = Math.abs(targetX - ballPos.x);

	// Time to reach the paddle plane (in game units)
	const	timeToReach = distanceX / (Math.abs(ballDir.x) * pong.current.ballSpeed);

	// Calculate the Z position without bounces
	let		predictedZ = ballPos.z + (ballDir.z * pong.current.ballSpeed * timeToReach);

	// Account for bounces off top and bottom
	const	topBound = pong.current.arenaHeight;
	const	bottomBound = -pong.current.arenaHeight;
	const	height = pong.current.arenaHeight * 2;
	
	// If the prediction is out of bounds, we need to calculate the bounces
	if (predictedZ > topBound || predictedZ < bottomBound)
	{
		// Map the predicted position to a continuous zigzag pattern
		// First, normalize to [0, 2*height] range and take modulo
		let	normalized = Math.abs((predictedZ - bottomBound) % (2 * height));
		
		// Then map back to the arena bounds with the zigzag pattern
		// We're in the "descending" part of the zigzag
		if (normalized > height) predictedZ = topBound - (normalized - height);
		// We're in the "ascending" part of the zigzag
		else predictedZ = bottomBound + normalized;
	}
	
	// For debugging
	console.log("HEIGHT: ", height);
	// console.log("Predicted Z: ", predictedZ.toFixed(2));
	// console.log("Ball Z:      ", pong.current.ball.position.z.toFixed(2));
	// console.log("Ball position: ", ballPos.toString());
	// console.log("Ball direction: ", ballDir.toString());
	
	return predictedZ;
}

export	const	doPaddleMovement = (pong: React.RefObject<game.pongStruct>, gamemode: React.RefObject<game.gameModes>): void =>
{
	if (!pong.current.paddle1 || !pong.current.paddle2) return;
	// console.log("gamemode: ", gamemode.current);
	switch (gamemode.current)
	{
		case game.gameModes.local:
			if (pong.current.pressedKeys.has('arrowup')) pong.current.paddle1.position.z = movePaddleUp(pong, pong.current.paddle1.position.z);
			if (pong.current.pressedKeys.has('arrowdown')) pong.current.paddle1.position.z = movePaddleDown(pong, pong.current.paddle1.position.z);
			if (pong.current.pressedKeys.has('w')) pong.current.paddle2.position.z = movePaddleUp(pong, pong.current.paddle2.position.z);
			if (pong.current.pressedKeys.has('s')) pong.current.paddle2.position.z = movePaddleDown(pong, pong.current.paddle2.position.z);
			break;
		case game.gameModes.ai:
			// setTimeout(() => {}, 200);	 // Simulate AI reaction time
			AIMovePaddle(pong);
		
		case game.gameModes.online:
		if (pong.current.isHost) {
			// 🎮 Host contrôle paddle1
			if (pong.current.pressedKeys.has('arrowup')) {
				pong.current.paddle1.position.z = movePaddleUpOnline(pong, pong.current.paddle1);
			}
			if (pong.current.pressedKeys.has('arrowdown')) {
				pong.current.paddle1.position.z = movePaddleDownOnline(pong, pong.current.paddle1);
			}
		} else {
			// 🧑‍💻 Client contrôle paddle2
			if (pong.current.pressedKeys.has('w')) {
				pong.current.paddle2.position.z = movePaddleUpOnline(pong, pong.current.paddle2);
			}
			if (pong.current.pressedKeys.has('s')) {
				pong.current.paddle2.position.z = movePaddleDownOnline(pong, pong.current.paddle2);
			}
		}
		break;

	}
	if(pong.current.scene)
	if (pong.current.pressedKeys.has('i'))
	{
		console.log("Toggling debug layer");
		if (pong.current.scene.debugLayer.isVisible() === true) pong.current.scene.debugLayer.hide();
		else pong.current.scene.debugLayer.show(); 
	}

	// console.log("Pressed keys: ", pong.current.pressedKeys);
}

export const	manageLocalKeyboardInputs = (pong: game.pongStruct): void =>
{
	// Keyboard input

	pong.scene?.onKeyboardObservable.add((kbInfo) =>
	{
		const	key = kbInfo.event.key.toLowerCase();
		if (kbInfo.type === baby.KeyboardEventTypes.KEYDOWN)
		{
			pong.pressedKeys.add(key);
		}
		else if (kbInfo.type === baby.KeyboardEventTypes.KEYUP)
		{
			pong.pressedKeys.delete(key);
		}
	});
}


export const movePaddleUpOnline = (pong: React.RefObject<game.pongStruct>, paddle: baby.Mesh): number => {
	return Math.max(
		- pong.current.arenaHeight + (pong.current.paddleHeight / 2),
		Math.min(
			pong.current.arenaHeight - (pong.current.paddleHeight / 2),
			paddle.position.z - pong.current.paddleSpeed
		)
	);
};

export const movePaddleDownOnline = (pong: React.RefObject<game.pongStruct>, paddle: baby.Mesh): number => {
	return Math.max(
		- pong.current.arenaHeight + (pong.current.paddleHeight / 2),
		Math.min(
			pong.current.arenaHeight - (pong.current.paddleHeight / 2),
			paddle.position.z + pong.current.paddleSpeed
		)
	);
};