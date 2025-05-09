// imports
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { KeyboardInfo, Mesh, MeshBlock } from 'babylonjs';
import { Engine, Scene } from 'babylonjs';
import { Vector3, HemisphericLight, MeshBuilder, Quaternion } from 'babylonjs';
import { FreeCamera, KeyboardEventTypes } from 'babylonjs';

import { pongGameRef } from '@/utils/pongSetup';

export function fitCameraToArena(pong: pongGameRef): void
{
	if (!pong.camera || !pong.engine) return;

	// Get canvas size and compute aspect ratio
	const canvasAspect = pong.engine.getRenderWidth() / pong.engine.getRenderHeight();

	// Compute arena aspect ratio
	const arenaAspect = pong.arenaWidth / pong.arenaHeight;

	// Choose the limiting factor: width or height
	// We need to calculate how far the camera needs to be to fit the arena
	let neededViewSize = 0;
	if (canvasAspect > arenaAspect)
	{
		// Canvas is wider than arena -> height is limiting
		neededViewSize = pong.arenaHeight;
	}
	else
	{
		// Canvas is taller than arena -> width is limiting
		// We need to scale height based on canvas/aspect ratio
		neededViewSize = pong.arenaWidth / canvasAspect;
	}

	// Camera FOV is vertical (by default it's PI/4)
	const fov = pong.camera.fov; // radians

	// Calculate required camera height to fit `neededViewSize` vertically
	const requiredY = (neededViewSize / 2) / Math.tan(fov / 2);

	// Set the camera height
	pong.camera.position.y = requiredY * 2.11111111;

	// Always look at the center
	pong.camera.setTarget(Vector3.Zero());
}