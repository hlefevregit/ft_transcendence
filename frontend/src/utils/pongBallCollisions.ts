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
	if (doBallCollideWithWall(pong.ball.position, pong.arenaWidth))
	{
		pong.ballDirection.x *= -1;
		pong.ballSpeedModifier += pong.ballSpeedModifier * pong.ballSpeed >= pong.maxBallSpeed ? 0 : pong.ballSpeed;
	}
	if (doBallCollideWithCeiling(pong.ball.position, pong.arenaHeight))
	{
		pong.ballDirection.z *= -1;
		pong.ballSpeedModifier += pong.ballSpeed;
	}
	// console.log("Ball speed: ", pong.ballSpeedModifier * pong.ballSpeed);
}