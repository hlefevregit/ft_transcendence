import * as React from 'react';
import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/bjLibs';

export const PlayGame = (
  bjRef: React.RefObject<game.bjStruct>,
  updateState: (newState: game.States) => void
): void => {;
};

// Debug function to rotate the camera
// const rotateCamera = async (
// 	bjRef: React.RefObject<game.bjStruct>,
// 	updateState: (newState: game.States) => void
// ): Promise<void> => {;
// 	for (let i = 0.01; i < 10; i += 0.01)
// 	{
// 		bjRef.current.scene.activeCamera.rotation = new baby.Vector3(0, i, 0);
// 		console.log("Camera rotation:", bjRef.current.scene.activeCamera.rotation.x, bjRef.current.scene.activeCamera.rotation.y, bjRef.current.scene.activeCamera.rotation.z);
// 		await new Promise(resolve => setTimeout(resolve, 25)); // Wait for 10ms
// 	}
// };
