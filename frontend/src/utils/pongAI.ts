import React from 'react';

import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';

let	timer = 1000;	// 1000 ms (1 second)
let	previousBallDirection = baby.Vector3.Zero();
let	previousBallPosition = baby.Vector3.Zero();
let	lastZ = 0;	// Last Z position of the ball
export const	AIMovePaddle = (pong: React.RefObject<game.pongStruct>): void =>
{
	if (   !pong.current.engine
		|| !pong.current.paddle1
		|| !pong.current.paddle2
		|| !pong.current.ball) return;


	timer -= pong.current.engine.getDeltaTime();
	if (timer <= 0 && pong.current.ballDirection.x < 0)
	{
		// Get the need informations each seconds
		previousBallDirection = pong.current.ballDirection.clone();
		previousBallPosition = pong.current.ball.position.clone();
		timer = 1000; // Reset timer
	}
	if (previousBallDirection.x > 0)	// Ball is going to the player paddle
	{
		// Re-center the AI paddle in the arena
		if (pong.current.paddle1.position.z > 0.2) pong.current.paddle1.position.z = game.movePaddleUp(pong, pong.current.paddle1.position.z);
		else if (pong.current.paddle1.position.z < -0.2) pong.current.paddle1.position.z = game.movePaddleDown(pong, pong.current.paddle1.position.z);
	}
	else	// Ball is going to the AI paddle
	{
		// Move the AI paddle to the predicted position of the ball
		lastZ = predictBallImpactZ(pong);
		if (pong.current.paddle1.position.z > lastZ + 0.2) pong.current.paddle1.position.z = game.movePaddleUp(pong, pong.current.paddle1.position.z);
		else if (pong.current.paddle1.position.z < lastZ - 0.2) pong.current.paddle1.position.z = game.movePaddleDown(pong, pong.current.paddle1.position.z);
	}
}


export const predictBallImpactZ = (pong: React.RefObject<game.pongStruct>): number =>
{
	const targetX = (-pong.current.arenaWidth + 1);
	const step = (targetX - previousBallPosition.x) / previousBallDirection.x;

	const rawZ = previousBallPosition.z + step * previousBallDirection.z;
	const shiftedZ = rawZ + pong.current.arenaHeight;

	const period = 4 * pong.current.arenaHeight;
	const mod = ((shiftedZ % period) + period) % period;
	let zFolded = 0;
	if (mod <= period / 2)
		zFolded = mod;
	else
		zFolded = period - mod;
	const predictedZ = zFolded - pong.current.arenaHeight;

	// DEBUG SQUARE
	if (pong.current.PREDICT) {
		pong.current.PREDICT.position.x = targetX + 0.5;
		pong.current.PREDICT.position.z = predictedZ;
		pong.current.PREDICT.position.y = 0.8;
	}

	return predictedZ;
}