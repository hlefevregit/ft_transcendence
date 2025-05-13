// imports
import React from 'react';
import { useNavigate } from 'react-router-dom';

import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';

// Ball wall collision
export const	doBallCollideWithWall = (ballPos: baby.Vector3, collideAxis: number): Boolean =>
{
	const	collideAxisAbs: number = Math.abs(collideAxis)
	const	ballPosAbs: number = Math.abs(ballPos.x);	// X axis

	return ballPosAbs >= collideAxisAbs;
}

// Ball ceiling collision
export const	doBallCollideWithCeiling = (ballPos: baby.Vector3, collideAxis: number): Boolean =>
{
	const	collideAxisAbs: number = Math.abs(collideAxis)
	const	ballPosAbs: number = Math.abs(ballPos.z);	// Z axis

	return ballPosAbs >= collideAxisAbs;
}

// Ball bouncing
export const	makeBallBounce = (pong: game.pongGameRef): void =>
{
	if (!pong.ball) return;
	if (!pong.paddle1 || !pong.paddle2) return;

	// RESET CASE (TOUCHES WALL)
	if (doBallCollideWithWall(pong.ball.position, pong.arenaWidth))
	{
		game.resetPaddlesPosition(pong);
		game.resetBall(pong);
		game.setBallDirectionRandom(pong);
	}
	// BOUNCE OF CEILING
	if (doBallCollideWithCeiling(pong.ball.position, pong.arenaHeight)) game.reflectBallCeiling(pong);

	// BOUNCE OF PADDLES
	game.reflectBallPaddles(pong);

	// console.log("Ball speed: ", pong.ballSpeedModifier * pong.ballSpeed);
}

export const	collideWithPaddle = (pong: game.pongGameRef, paddlePos: baby.Vector3) : Boolean =>
{
	if (!pong.ball) return (false);
	
	return(
		   pong.ball.position.x + (pong.ballDiameter / 2) >= paddlePos.x - (pong.paddleWidth / 2)
		&& pong.ball.position.x - (pong.ballDiameter / 2) <= paddlePos.x + (pong.paddleWidth / 2)
		&& pong.ball.position.z + (pong.ballDiameter / 2) >= paddlePos.z - (pong.paddleHeight / 2)
		&& pong.ball.position.z - (pong.ballDiameter / 2) <= paddlePos.z + (pong.paddleHeight / 2)
	);
}

export const chooseBouncingAngle = (pong: game.pongGameRef, paddlePos: baby.Vector3): number =>
{
	if (!pong.ball) return 0;

	let	distance = (pong.ball.position.z - paddlePos.z) / distance2D(pong.ball.position, paddlePos) / 10;

	console.log("Angle :", distance);
	return distance;
};

export const	distance2D = (a: baby.Vector3, b: baby.Vector3): number =>
{
	return Math.sqrt((b.x - a.x) ** 2 + (b.z - a.z) ** 2);
}