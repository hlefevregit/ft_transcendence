import * as React from 'react';
import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/bjLibs';

export const PlayGame = (
  bjRef: React.RefObject<game.bjStruct>,
  updateState: (newState: game.States) => void
): void => {
	if (!bjRef.current) return;
	const playerCards: number[] = [];
	const dealerCards: number[] = [];
	playerTurn(bjRef, updateState, playerCards);
	dealerTurn(bjRef, updateState, playerCards, dealerCards);
};

export const playerTurn = (
	bjRef: React.RefObject<game.bjStruct>,
	updateState: (newState: game.States) => void,
	playerCards: number[],
): void => {
	if (!bjRef.current) return;
	const scene = bjRef.current.scene;
	if (!scene) return;

	while (playerCards.length < 2) {
		const card = dealCard(bjRef);
		const value = ((card - 1) % 13) + 1;
		const suit = Math.floor((card - 1) / 13) + 1;
		if (card) {
			playerCards.push(card);
			console.log(`Dealt ${game.ReverseValueMap[value]} of ${game.ReverseSuitMap[suit]} to player`);
		}
		else {
			console.error('Failed to deal card');
			return;
		}
	}
};

export const dealerTurn = (
	bjRef: React.RefObject<game.bjStruct>,
	updateState: (newState: game.States) => void,
	playerCards: number[],
	dealerCards: number[],
): void => {
	if (!bjRef.current) return;
	const scene = bjRef.current.scene;
	if (!scene) return;

	while (dealerCards.length < 2) {
		const card = dealCard(bjRef);
		const value = ((card - 1) % 13) + 1;
		const suit = Math.floor((card - 1) / 13) + 1;
		if (card) {
			dealerCards.push(card);
			console.log(`Dealt ${game.ReverseValueMap[value]} of ${game.ReverseSuitMap[suit]} to dealer`);
		}
		else {
			console.error('Failed to deal card');
			return;
		}
	}
};

export const dealCard = (
	bjRef: React.RefObject<game.bjStruct>,
): number => {
	const scene = bjRef.current?.scene;
	if (!scene) return 0;

	return Math.floor(Math.random() * 52) + 1;
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
