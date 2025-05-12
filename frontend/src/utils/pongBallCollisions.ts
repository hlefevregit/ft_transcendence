// imports
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { KeyboardInfo, Mesh, MeshBlock } from 'babylonjs';
import { Engine, Scene } from 'babylonjs';
import { Vector3, HemisphericLight, MeshBuilder } from 'babylonjs';
import { FreeCamera, KeyboardEventTypes } from 'babylonjs';

import { pongGameRef } from '@/utils/pongSetup';

// Ball wall collision
export const	doBallCollideWithWall = (ballPos: Vector3, collideAxis: number): Boolean =>
{
	const	collideAxisAbs: number = Math.abs(collideAxis)
	const	ballPosAbs: number = Math.abs(ballPos.x);	// X axis

	return ballPosAbs >= collideAxisAbs;
}

// Ball ceiling collision
export const	doBallCollideWithCeiling = (ballPos: Vector3, collideAxis: number): Boolean =>
{
	const	collideAxisAbs: number = Math.abs(collideAxis)
	const	ballPosAbs: number = Math.abs(ballPos.z);	// Z axis

	return ballPosAbs >= collideAxisAbs;
}

// Ball bouncing
export const	makeBallBounce = (pong: pongGameRef): void =>
{
	if (!pong.ball) return;
	if (!pong.paddle1 || !pong.paddle2) return;

	// RESET CASE (TOUCHES WALL)
	if (doBallCollideWithWall(pong.ball.position, pong.arenaWidth))
	{
		// RESET BALL SPEED AN POSITION
		pong.ball.position = Vector3.Zero();
		pong.ballDirection = Vector3.Zero();
		pong.ballSpeedModifier = 1;

		// RANDOM DIRECTION
		pong.ballDirection = Math.random() > 0.5
			? new Vector3(pong.ballSpeed, 0, 0)
			: new Vector3(-pong.ballSpeed, 0, 0);
		return;
	}
	// BOUNCE OF CEILING
	if (doBallCollideWithCeiling(pong.ball.position, pong.arenaHeight))
	{
		pong.ballDirection.z *= -1;
		pong.ballSpeedModifier += pong.ballSpeedModifier * pong.ballSpeed >= pong.maxBallSpeed ? 0 : pong.ballSpeed;
		return;
	}

	// BOUNCE OF PADDLES
	let paddlePos: Vector3 = pong.paddle2.position;
	if (pong.ballDirection.x < 0) {paddlePos = pong.paddle1.position;} // Choose the right paddle to bounce off
	if (collideWithPaddle(pong, paddlePos))
	{
		console.log("Ball collided with paddle at ", pong.ball.position);
		pong.ballDirection.x *= -1;
		pong.ballDirection.z = (pong.ballDirection.z + chooseBouncingAngle(pong, paddlePos)) / 2;
		pong.ballSpeedModifier += pong.ballSpeedModifier * pong.ballSpeed >= pong.maxBallSpeed ? 0 : pong.ballSpeed;
		return;
	}

	// console.log("Ball speed: ", pong.ballSpeedModifier * pong.ballSpeed);
}

export const	collideWithPaddle = (pong: pongGameRef, paddlePos: Vector3) : Boolean =>
{
	if (!pong.ball) return (false);
	
	return(
		   pong.ball.position.x + (pong.ballDiameter / 2) >= paddlePos.x - (pong.paddleWidth / 2)
		&& pong.ball.position.x - (pong.ballDiameter / 2) <= paddlePos.x + (pong.paddleWidth / 2)
		&& pong.ball.position.z + (pong.ballDiameter / 2) >= paddlePos.z - (pong.paddleHeight / 2)
		&& pong.ball.position.z - (pong.ballDiameter / 2) <= paddlePos.z + (pong.paddleHeight / 2)
	);
}

export const chooseBouncingAngle = (pong: pongGameRef, paddlePos: Vector3): number =>
{
	if (!pong.ball) return 0;

	let	distance = (pong.ball.position.z - paddlePos.z) / distance2D(pong.ball.position, paddlePos) / 10;

	console.log("Angle :", distance);
	return distance;
};

export const	distance2D = (a: Vector3, b: Vector3): number =>
{
	return Math.sqrt((b.x - a.x) ** 2 + (b.z - a.z) ** 2);
}