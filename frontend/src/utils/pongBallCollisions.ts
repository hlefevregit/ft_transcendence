// imports
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { KeyboardInfo, Mesh, MeshBlock } from 'babylonjs';
import { Engine, Scene } from 'babylonjs';
import { Vector3, HemisphericLight, MeshBuilder } from 'babylonjs';
import { FreeCamera, KeyboardEventTypes } from 'babylonjs';

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