import * as React from 'react';
import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/bjLibs';

// Gamelogic:
// Player ->
// 	- Selects either "Solo" or "Duo".
// 	- Gets dealt hand(s) (2 cards) face up.
// 	- Player can choose to hit or stay.
// 	- If first round player can also double down and if first two cards are the same, player can split. These actions double the bet.
// 	- If player doubles down, they get one more card and must stay.
// 	- If player splits, they get two hands and can play each hand separately. (They can double down if first round of each hand.).
// Dealer ->
// 	- Dealer gets dealt two cards, one face up and one face down.
// 	- Dealer waits for player to finish their turn (player stands or busts).
// 	- Dealer reveals their face down card.
// 	- Dealer hits until they reach 17 or higher (soft 17 included).
// Bets ->
// 	- Player can place a bet at the start of the game.
// 	- If player wins, they get their bet back plus winnings (1:1 for normal win, 3:2 for blackjack).

export const PlayGame = (
  bjRef: React.RefObject<game.bjStruct>,
  updateState: (newState: game.States) => void
): void => {;
};

export const makeCardMap = (bjRef: React.RefObject<game.bjStruct>): void => {
  const scene = bjRef.current?.scene;
  if (!scene) return;
  for (const suit in suitMap) {
    for (const value in valueMap) {
      const key = getCardKey(suit as keyof typeof suitMap, value as keyof typeof valueMap);
      const meshName = `${suit}${value.charAt(0).toUpperCase() + value.slice(1)}`;
      const mesh = getMeshByName(meshName, bjRef);
      if (mesh) {
        bjRef.current!.cardMeshes[key] = mesh;
      }
    }
  }
};

export const getMeshByName = (name: string, bjRef: React.RefObject<game.bjStruct>): baby.AbstractMesh | null => {
  if (!bjRef.current.scene) return null;
  const mesh = bjRef.current.scene.find(mesh => mesh.name === name);
  return mesh || null;
};

export const getCardKey = (suit: keyof typeof suitMap, value: keyof typeof valueMap): number => {
  return (suitMap[suit] - 1) * 13 + valueMap[value];
};
