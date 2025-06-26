import * as React from 'react';
import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/bjLibs';

export const PlayGame = async (
  bjRef: React.RefObject<game.bjStruct>,
  state: React.RefObject<game.States>,
  players: number
): Promise<void> => {
  if (!bjRef.current) return;

	const cardMeshes: baby.Mesh[] = [];
	const player1Cards: number[] = [];
	const player2Cards: number[] = [];
	const dealerCards: number[] = [];
  let player1Busted = false;
  let player2Busted = false;

  dealInitialCards(bjRef, state, player1Cards, player2Cards, dealerCards, players, cardMeshes);

  await playerTurn(bjRef, state, player1Cards, cardMeshes);
  if (players === 2) {
    await playerTurn(bjRef, state, player2Cards, cardMeshes);
	if (getCardValues(player2Cards) > 21) {
	  console.log("Player 2 has busted!");
	  player2Busted = true;
	}
  }
  if (getCardValues(player1Cards) > 21) {
	console.log("Player 1 has busted!");
	player1Busted = true;
  }
  if (player1Busted && (players === 2 && player2Busted)) {
	console.log("Both players have busted! Dealer wins by default.");
	state.current = game.States.main_menu;
	return;
  }
  await dealerTurn(bjRef, state, dealerCards, cardMeshes);
  const player1Value = getCardValues(player1Cards);
  const player2Value = players === 2 ? getCardValues(player2Cards) : 0;
  const dealerValue = getCardValues(dealerCards);
  if (!player1Busted) {
    if (player1Value > dealerValue && player1Value <= 21) {
	    console.log("Player 1 wins against the dealer!");
      } else if (player1Value < dealerValue && dealerValue <= 21) {
	    console.log("Dealer wins against Player 1!");
      } else if (player1Value === dealerValue && player1Value <= 21) {
  	    console.log("It's a tie between Player 1 and the dealer!");
      }
  }
  if (players === 2 && !player2Busted) {
      if (player2Value > dealerValue && player2Value <= 21) {
	    console.log("Player 2 wins against the dealer!");
	  } else if (player2Value < dealerValue && dealerValue <= 21) {
	    console.log("Dealer wins against Player 2!");
	  } else if (player2Value === dealerValue && player2Value <= 21) {
	    console.log("It's a tie between Player 2 and the dealer!");
	  }
  }
  destroyMeshes(cardMeshes);
  state.current = game.States.main_menu;
};

export const dealInitialCards = (
	bjRef: React.RefObject<game.bjStruct>,
	state: React.RefObject<game.States>,
	player1Cards: number[],
	player2Cards: number[],
	dealerCards: number[],
	players: number,
	meshes: baby.Mesh[]
): void => {
	if (!bjRef.current) return;
	const scene = bjRef.current.scene;
	if (!scene) return;
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
  state: React.RefObject<game.States>,
  playerCards: number[],
  meshes: baby.Mesh[]
): Promise<void> => {
  if (!bjRef.current) return;
  const scene = bjRef.current.scene;
  if (!scene) return;
  while (true) {
    const playerChoice = await waitForPlayerChoice(bjRef);
    switch (playerChoice) {
      case game.PlayerChoices.hit: {
        const card = dealCard(bjRef);
        const value = ((card - 1) % 13) + 1;
        const suit = Math.floor((card - 1) / 13) + 1;
        if (!card) {
          console.error("Failed to deal card");
          return;
        }
        playerCards.push(card);
        console.log(`Dealt ${game.ReverseValueMap[value]} of ${game.ReverseSuitMap[suit]} to player${playerChoice === game.PlayerChoices.double ? " (double)" : ""}`);
        console.log(`Player's total value: ${getCardValues(playerCards)}`);
        if (getCardValues(playerCards) >= 21) {
          return;
        }
        if (playerChoice === game.PlayerChoices.double) {
          return;
        }
        break;
      }
      case game.PlayerChoices.stand:
        console.log("Player stands");
        return;
    }
	bjRef.current.playerChoice = null;
  }
};

export const dealerTurn = (
	bjRef: React.RefObject<game.bjStruct>,
    state: React.RefObject<game.States>,
	dealerCards: number[],
	meshes: baby.Mesh[]
): void => {
	if (!bjRef.current) return;
	const scene = bjRef.current.scene;
	if (!scene) return;

	if (dealerCards.length >= 2) {
		console.log(`Dealer reveals ${game.ReverseValueMap[((dealerCards[1] - 1) % 13) + 1]} of ${game.ReverseSuitMap[Math.floor((dealerCards[1] - 1) / 13) + 1]}`);
	}

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
	meshes: baby.Mesh[]
): number => {
	const scene = bjRef.current?.scene;
	if (!scene) return 0;

	const card = Math.floor(Math.random() * 52) + 1;
	const originalMesh = bjRef.current!.cards[card];
	if (originalMesh)
	{
		const clonedMesh = originalMesh.clone(`${originalMesh.name}_clone`, originalMesh.parent);
		meshes.push(clonedMesh);
	}
	return card;
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
        bjRef.current!.cards[key] = mesh;
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

export const destroyMeshes = (meshes: baby.Mesh[]): void => {
  for (const mesh of meshes) {
    mesh.dispose();
  }
  meshes.length = 0;
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
