import * as React from 'react';
import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/bjLibs';

export const PlayGame = (
  bjRef: React.RefObject<game.bjStruct>,
  updateState: (newState: game.States) => void
): void => {
  const playerMoney = bjRef.current?.playerMoney || 0;
  if (playerMoney <= 0) {
    updateState(game.States.game_over);
    return;
  }

  // Logic to handle card dealing, betting, win/loss resolution etc.
  // Example pseudo-logic
  if (bjRef.current.gameState === game.GameState.waiting) {
    dealInitialCards(bjRef); // You'll implement this
    bjRef.current.gameState = game.GameState.in_hand;
  } else if (bjRef.current.gameState === game.GameState.in_hand) {
    // Wait for player input
  }
};

export function dealInitialCards(bjRef: React.RefObject<game.bjStruct>) {
  const scene = bjRef.current?.scene;
  if (!scene) return;

  // Example: create 2 player and 2 dealer cards
  for (let i = 0; i < 2; i++) {
    const card = baby.MeshBuilder.CreatePlane(`card-${i}`, { width: 1, height: 1.5 }, scene);
    card.position = new baby.Vector3(i * 1.2, 0, 0);
    card.material = new baby.StandardMaterial(`mat-${i}`, scene);
    // Set texture here (e.g., card front)
    // Animate to position (optional)
  }
}

export function placeBet(bjRef: React.RefObject<game.bjStruct>, amount: number) {
  if (bjRef.current!.playerMoney >= amount) {
    bjRef.current!.playerMoney -= amount;
    // Display chip model or update GUI
  }
}
