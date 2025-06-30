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
export const	makeBallBounce =
(
	pong: React.RefObject<game.pongStruct>,
	states: React.RefObject<game.states>,
	gameModes: React.RefObject<game.gameModes>
): void =>
{
	if
	(
		   !pong.current.ball
		|| !pong.current.paddle1
		|| !pong.current.paddle2
	) return;

	// RESET CASE (TOUCHES WALLS)
	if (doBallCollideWithWall(pong.current.ball.position, pong.current.arenaWidth))
	{
		game.resetPaddlesPosition(pong.current);
		
		if (pong.current.ball.position.x < 0)
		{
			game.resetBall(pong.current);
			game.setBallDirectionLeft(pong.current);
			pong.current.player1Score += 1;
		}
		else
		{
			game.resetBall(pong.current);
			game.setBallDirectionRight(pong.current);
			pong.current.player2Score += 1;
		}

		// if (gameModes.current === game.gameModes.tournament)
		// {
		// 	if (pong.current.isInGame1)
		// 		states.current = game.states.in_game1;
		// 	else if (pong.current.isInGame2)
		// 		states.current = game.states.in_game2;
		// 	else if (pong.current.isFinal)
		// 		states.current = game.states.in_final;
		// }
		// else
		// 	states.current = game.states.in_game;
	}

	// MAKE BALL BOUNCE
	game.reflectBallCeiling(pong.current);
	game.reflectBallPaddles(pong.current);
}

export const	collideWithPaddle = (pong: game.pongStruct, paddlePos: baby.Vector3) : Boolean =>
{
	if (!pong.ball) return (false);
	
	return(
		   pong.ball.position.x + (pong.ballDiameter / 2) >= paddlePos.x - (pong.paddleWidth / 2)
		&& pong.ball.position.x - (pong.ballDiameter / 2) <= paddlePos.x + (pong.paddleWidth / 2)
		&& pong.ball.position.z + (pong.ballDiameter / 2) >= paddlePos.z - (pong.paddleHeight / 2)
		&& pong.ball.position.z - (pong.ballDiameter / 2) <= paddlePos.z + (pong.paddleHeight / 2)
	);
}

export const chooseBouncingAngle = (pong: game.pongStruct, paddlePos: baby.Vector3): number =>
{
	if (!pong.ball) return 0;

	let	distance = (pong.ball.position.z - paddlePos.z) / distance2D(pong.ball.position, paddlePos) / 10;

	return distance;
};

export const	distance2D = (a: baby.Vector3, b: baby.Vector3): number =>
{
	return Math.sqrt((b.x - a.x) ** 2 + (b.z - a.z) ** 2);
}

