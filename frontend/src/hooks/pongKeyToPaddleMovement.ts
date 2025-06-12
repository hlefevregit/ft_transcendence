import React from 'react';
import { useNavigate } from 'react-router-dom';

import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';

// Move paddle Up
export const	movePaddleUp = (pong: React.RefObject<game.pongStruct>, paddleZ: number): number =>
{
	if (!pong.current.paddle1) return(0);
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
		if (pong.current.paddle1.position.z > 0.2) pong.current.paddle1.position.z = movePaddleUp(pong, pong.current.paddle1.position.z);
		else if (pong.current.paddle1.position.z < -0.2) pong.current.paddle1.position.z = movePaddleDown(pong, pong.current.paddle1.position.z);
	}
	else	// Ball is going to the AI paddle
	{
		// Move the AI paddle to the predicted position of the ball
		lastZ = predictBallImpactZ(pong);
		if (pong.current.paddle1.position.z > lastZ + 0.2) pong.current.paddle1.position.z = movePaddleUp(pong, pong.current.paddle1.position.z);
		else if (pong.current.paddle1.position.z < lastZ - 0.2) pong.current.paddle1.position.z = movePaddleDown(pong, pong.current.paddle1.position.z);
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


// export const	predictBallImpactZ = (pong: React.RefObject<game.pongStruct>): number =>
// {
// 	let		ballPos:	baby.Vector3 = previousBallPosition.clone();
// 	let		ballDir:	baby.Vector3 = previousBallDirection.clone();

// 	const	arenaHeight:	number = pong.current.arenaHeight;
// 	const	arenaWidth:		number = pong.current.arenaWidth;
// 	const	paddleXAxis:	number = -(arenaWidth - 1);

// 	// let		i = 0;

// 	// while (i < stepsToReachPaddleXAxis && ballPos.x <= paddleXAxis && ballDir.x <= 0)
// 	if (ballDir.x < 0)	// Ball is moving towards the AI paddle
// 	{
// 		while (Math.abs(ballPos.x) <= Math.abs(paddleXAxis))
// 		{
// 			ballPos.x += ballDir.x;
// 			ballPos.z += ballDir.z;
// 			if (ballPos.z >= arenaHeight || ballPos.z <= -arenaHeight)
// 				ballDir.z *= -1;
// 			// i++;
// 			// console.log("Ball position:", ballPos);
// 		}
// 	}
// 	if (pong.current.PREDICT)
// 	{
// 		pong.current.PREDICT.position.x = ballPos.x;
// 		pong.current.PREDICT.position.z = ballPos.z;
// 	}
// 	return (ballPos.z)
// }

export	const	doPaddleMovement = (pong: React.RefObject<game.pongStruct>,
	gamemode: React.RefObject<game.gameModes>,
	states: React.RefObject<game.states>
): void => 
{
	if (((!pong.current.paddle1 || !pong.current.paddle2) ||
	(states.current !== game.states.in_game
		&& states.current !== game.states.in_game1
		&& states.current !== game.states.in_game2
		&& states.current !== game.states.tournament_final) )) return;
	switch (gamemode.current)
	{
		case game.gameModes.local:
			if (pong.current.pressedKeys.has('arrowup')) pong.current.paddle1.position.z = movePaddleUp(pong, pong.current.paddle1.position.z);
			if (pong.current.pressedKeys.has('arrowdown')) pong.current.paddle1.position.z = movePaddleDown(pong, pong.current.paddle1.position.z);
			if (pong.current.pressedKeys.has('w')) pong.current.paddle2.position.z = movePaddleUp(pong, pong.current.paddle2.position.z);
			if (pong.current.pressedKeys.has('s')) pong.current.paddle2.position.z = movePaddleDown(pong, pong.current.paddle2.position.z);
			break;
		case game.gameModes.ai:
			if (pong.current.pressedKeys.has('w')) pong.current.paddle2.position.z = movePaddleUp(pong, pong.current.paddle2.position.z);
			if (pong.current.pressedKeys.has('s')) pong.current.paddle2.position.z = movePaddleDown(pong, pong.current.paddle2.position.z);
			AIMovePaddle(pong);
			break;

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

		case game.gameModes.tournament: 
			console.log("In tournament mode");
			console.log("Key pressed : ", pong.current.pressedKeys);
			if (pong.current.isHost || pong.current.isHost2) {
				console.log("Host contrôle paddle1");
				// 🎮 Host contrôle paddle1
				if (pong.current.pressedKeys.has('arrowup')) {
					pong.current.paddle1.position.z = movePaddleUpOnline(pong, pong.current.paddle1);
				}
				if (pong.current.pressedKeys.has('arrowdown')) {
					pong.current.paddle1.position.z = movePaddleDownOnline(pong, pong.current.paddle1);
				}
			} else {
				console.log("Client contrôle paddle2");
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
	return Math.max
	(
		- pong.current.arenaHeight + (pong.current.paddleHeight / 2),
		Math.min
		(
			pong.current.arenaHeight - (pong.current.paddleHeight / 2),
			paddle.position.z - pong.current.paddleSpeed
		)
	);
};

export const movePaddleDownOnline = (pong: React.RefObject<game.pongStruct>, paddle: baby.Mesh): number => {
	return Math.max
	(
		- pong.current.arenaHeight + (pong.current.paddleHeight / 2),
		Math.min
		(
			pong.current.arenaHeight - (pong.current.paddleHeight / 2),
			paddle.position.z + pong.current.paddleSpeed
		)
	);
};
