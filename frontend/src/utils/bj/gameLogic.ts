import * as React from 'react';
import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/bjLibs';

export const PlayGame = async (
  bjRef: React.RefObject<game.bjStruct>,
  updateState: (newState: game.States) => void,
  players: number
): Promise<void> => {
  if (!bjRef.current) return;

  const player1Cards: number[] = [];
  const player2Cards: number[] = [];
  const dealerCards: number[] = [];

  dealInitialCards(bjRef, updateState, player1Cards, player2Cards, dealerCards, players);

  await playerTurn(bjRef, updateState, player1Cards);
  if (players === 2) {
    await playerTurn(bjRef, updateState, player2Cards);
  }
  await dealerTurn(bjRef, updateState, dealerCards);
};

export const dealInitialCards = (
	bjRef: React.RefObject<game.bjStruct>,
	updateState: (newState: game.States) => void,
	player1Cards: number[],
	player2Cards: number[],
	dealerCards: number[],
	players: number
): void => {
	if (!bjRef.current) return;
	const scene = bjRef.current.scene;
	if (!scene) return;

	// Deal two cards to each player and one card to the dealer
	for (let i = 0; i < 2; i++) {
		const player1Card = dealCard(bjRef);
		const player2Card = players === 2 ? dealCard(bjRef) : 0;
		const dealerCard = dealCard(bjRef);

		if (player1Card) {
			player1Cards.push(player1Card);
			const value = ((player1Card - 1) % 13) + 1;
			const suit = Math.floor((player1Card - 1) / 13) + 1;
			console.log(`Dealt ${game.ReverseValueMap[value]} of ${game.ReverseSuitMap[suit]} to player 1`);
		} else {
			console.error('Failed to deal card to player 1');
			return;
		}

		if (player2Card && players === 2) {
			player2Cards.push(player2Card);
			const value = ((player2Card - 1) % 13) + 1;
			const suit = Math.floor((player2Card - 1) / 13) + 1;
			console.log(`Dealt ${game.ReverseValueMap[value]} of ${game.ReverseSuitMap[suit]} to player 2`);
		} else if (players === 2) {
			console.error('Failed to deal card to player 2');
			return;
		}

		if (dealerCard) {
			dealerCards.push(dealerCard);
			const value = ((dealerCard - 1) % 13) + 1;
			const suit = Math.floor((dealerCard - 1) / 13) + 1;
			if (i === 0) {
				console.log(`Dealt ${game.ReverseValueMap[value]} of ${game.ReverseSuitMap[suit]} to dealer`);
			} else {
				console.log(`Dealt hidden card to dealer`);
			}
		} else {
			console.error('Failed to deal card to dealer');
			return;
		}
	}

	console.log(`Player 1's total value: ${getCardValues(player1Cards)}`);
	if (players === 2) {
		console.log(`Player 2's total value: ${getCardValues(player2Cards)}`);
	}
	console.log(`Dealer's total value: ${getCardValues(dealerCards)}`);
};

export const playerTurn = async (
  bjRef: React.RefObject<game.bjStruct>,
  updateState: (newState: game.States) => void,
  playerCards: number[],
): Promise<void> => {
  if (!bjRef.current) return;
  const scene = bjRef.current.scene;
  if (!scene) return;
  while (true) {
    const playerChoice = await waitForPlayerChoice(bjRef);
    if (!playerChoice) continue;
    switch (playerChoice) {
      case game.PlayerChoices.hit:
      case game.PlayerChoices.double: {
        const card = dealCard(bjRef);
        const value = ((card - 1) % 13) + 1;
        const suit = Math.floor((card - 1) / 13) + 1;
        if (!card) {
          console.error("Failed to deal card");
          return;
        }
        playerCards.push(card);
        console.log(`Dealt ${game.ReverseValueMap[value]} of ${game.ReverseSuitMap[suit]} to player${playerChoice === game.PlayerChoices.double ? " (double)" : ""}`);
        bjRef.current.playerChoice = null;
        console.log(`Player's total value: ${getCardValues(playerCards)}`);
        if (getCardValues(playerCards) > 21) {
          console.log("Player busts!");
          return;
        }
        if (playerChoice === game.PlayerChoices.double) {
          return;
        }

        break;
      }
      case game.PlayerChoices.stand:
        console.log("Player stands");
        bjRef.current.playerChoice = null;
        return;
    }
  }
};

export const dealerTurn = (
	bjRef: React.RefObject<game.bjStruct>,
	updateState: (newState: game.States) => void,
	dealerCards: number[],
): void => {
	if (!bjRef.current) return;
	const scene = bjRef.current.scene;
	if (!scene) return;

	while (dealerCards.length < 2 || getCardValues(dealerCards) < 17) {
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
		console.log(`Dealer's total value: ${getCardValues(dealerCards)}`);
	}
};

export const getCardValues = (cards: number[]): number => {
	let totalValue = 0;
	let acesCount = 0;

	for (const card of cards) {
		const value = ((card - 1) % 13) + 1;
		if (value > 10) {
			totalValue += 10;
		} else if (value === 1) {
			totalValue += 11;
			acesCount++;
		} else {
			totalValue += value;
		}
	}
	while (totalValue > 21 && acesCount > 0) {
		totalValue -= 10;
		acesCount--;
	}
	return totalValue;
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

export const waitForPlayerChoice = (bjRef: React.RefObject<game.bjStruct>): Promise<game.PlayerChoices> => {
	return new Promise((resolve) => {
		const interval = setInterval(() => {
			if (!bjRef.current) return;
			if (bjRef.current.playerChoice !== null && bjRef.current.playerChoice !== undefined) {
				clearInterval(interval);
				resolve(bjRef.current.playerChoice);
			}
		}, 100);
	});
};
