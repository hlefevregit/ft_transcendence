import * as React from 'react';
import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/bjLibs';
import * as camLib from '@/libs/pongLibs';

let x = 0;
let y = 0;
let z = 0;

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
	x = 0;
	y = 0.62;
	z = 1.4;

	const res = await fetch('/api/bj/lose', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${localStorage.getItem('authToken')}`,
		},
		body: JSON.stringify({
			bet: 10,
		})
	});
	if (!res.ok) {
		console.error("Failed to update player money after Blackjack loss");
	}
	if (players === 2) {
		x = -2
		const res = await fetch('/api/bj/lose', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('authToken')}`,
			},
			body: JSON.stringify({
				bet: 10,
			})
		});
		if (!res.ok) {
			console.error("Failed to update player money after Blackjack loss");
		}
	}

  bjRef.current.player1Cards = player1Cards;
  bjRef.current.player2Cards = player2Cards;

  bjRef.current.playerChoice = null;
  dealInitialCards(bjRef, state, player1Cards, player2Cards, dealerCards, players, cardMeshes);
  if (getCardValues(player1Cards) === 21 && player1Cards.length === 2) {
    console.log("Player 1 has a Blackjack!");
  }
  if (players === 2 && getCardValues(player2Cards) === 21 && player2Cards.length === 2) {
    console.log("Player 2 has a Blackjack!");
  }

  bjRef.current.playerChoice = null;
  await playerTurn(bjRef, state, player1Cards, cardMeshes);
  if (players === 2) {
	bjRef.current.playerChoice = null;
	x = 2;
	y = 0.62;
	z = 1.4;
    await playerTurn(bjRef, state, player2Cards, cardMeshes);
	if (getCardValues(player2Cards) > 21) {
	  console.log("Player 2 has busted!");
	  player2Busted = true;
	}
  }
  if (getCardValues(player1Cards) > 21) {
	console.log("Player 1 has busted!");
	player1Busted = true;
	if (players === 1) {
		console.log("Dealer wins by default since Player 1 has busted!");
		state.current = game.States.main_menu;
		camLib.transitionToCamera(bjRef.current.scene?.activeCamera as baby.FreeCamera, bjRef.current.mainMenuCamera, 1, bjRef, state);
		return;
	}
  }
  if (player1Busted && (players === 2 && player2Busted)) {
	console.log("Both players have busted! Dealer wins by default.");
	state.current = game.States.main_menu;
	camLib.transitionToCamera(bjRef.current.scene?.activeCamera as baby.FreeCamera, bjRef.current.mainMenuCamera, 1, bjRef, state);
	return;
  }
  await dealerTurn(bjRef, state, dealerCards, cardMeshes);
  const player1Value = getCardValues(player1Cards);
  const player2Value = players === 2 ? getCardValues(player2Cards) : 0;
  const dealerValue = getCardValues(dealerCards);
  if (dealerValue > 21) {
    if (!player1Busted) {
        console.log("Dealer busted! Player 1 wins by default.");
        const res = await fetch('/api/bj/win', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
            body: JSON.stringify({
                bet: 20,
            })
        });
        if (!res.ok) {
            console.error("Failed to update player money after Blackjack win");
        }
    }
    if (players === 2 && !player2Busted) {
        console.log("Dealer busted! Player 2 wins by default.");
        const res = await fetch('/api/bj/win', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
            body: JSON.stringify({
                bet: 20,
            })
        });
        if (!res.ok) {
            console.error("Failed to update player money after Blackjack win");
        }
    }
    destroyMeshes(cardMeshes);
    state.current = game.States.main_menu;
    camLib.transitionToCamera(bjRef.current.scene?.activeCamera as baby.FreeCamera, bjRef.current.mainMenuCamera, 1, bjRef, state);
    return;
	}
  if (!player1Busted) {
    if (player1Value > dealerValue && player1Value <= 21) {
		if (player1Value === 21 && player1Cards.length === 2) {
			console.log("Player 1 has a Blackjack! Player 1 wins against the dealer!");
			const res = await fetch('/api/bj/win', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
				body: JSON.stringify({
					bet: 25,
				})
			});
			if (!res.ok) {
				console.error("Failed to update player money after Blackjack win");
			}
		}
		else {
			const res = await fetch('/api/bj/win', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
				body: JSON.stringify({
					bet: 20,
				})
			});
			if (!res.ok) {
				console.error("Failed to update player money after Blackjack win");
			}
			console.log("Player 1 wins against the dealer!");
		}
      } else if (player1Value < dealerValue && dealerValue <= 21) {
		const res = await fetch('/api/bj/lose', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('authToken')}`,
			},
			body: JSON.stringify({
				bet: 20,
			})
		});
		if (!res.ok) {
			console.error("Failed to update player money after Blackjack loss");
		}
	    console.log("Dealer wins against Player 1!");
      } else if (player1Value === dealerValue && player1Value <= 21) {
  	    console.log("It's a tie between Player 1 and the dealer!");
      }
  }
  if (players === 2 && !player2Busted) {
      if (player2Value > dealerValue && player2Value <= 21) {
		if (player2Value === 21 && player2Cards.length === 2) {
			console.log("Player 2 has a Blackjack! Player 2 wins against the dealer!");
			const res = await fetch('/api/bj/win', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
				body: JSON.stringify({
					bet: 25,
				})
			});
			if (!res.ok) {
				console.error("Failed to update player money after Blackjack win");
			}
		} else {
			const res = await fetch('/api/bj/win', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
				body: JSON.stringify({
					bet: 20,
				})
			});
			if (!res.ok) {
				console.error("Failed to update player money after Blackjack win");
			}
			console.log("Player 2 wins against the dealer!");
		}
  	  } else if (player2Value < dealerValue && dealerValue <= 21) {
	    console.log("Dealer wins against Player 2!");
	  } else if (player2Value === dealerValue && player2Value <= 21) {
			const res = await fetch('/api/bj/win', {
				method: 'POST',
				headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
				body: JSON.stringify({
				bet: 10,
				})
			});
			if (!res.ok) {
				console.error("Failed to update player money after Blackjack win");
			}
	    console.log("It's a tie between Player 2 and the dealer!");
	  }
	}
  destroyMeshes(cardMeshes);
  state.current = game.States.main_menu;
  camLib.transitionToCamera(bjRef.current.scene?.activeCamera as baby.FreeCamera, bjRef.current.mainMenuCamera, 1, bjRef, state);
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
		const player1Card = dealCard(meshes, bjRef);
		const player2Card = players === 2 ? dealCard(meshes, bjRef) : 0;
		const dealerCard = dealCard(meshes, bjRef);
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
  while (getCardValues(playerCards) < 21) {
    const playerChoice = await waitForPlayerChoice(bjRef);
    switch (playerChoice) {
      case game.PlayerChoices.hit: {
        const card = dealCard(meshes, bjRef);
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
		  if (getCardValues(playerCards) === 21) {
			console.log("Player has reached 21!");
		  } else {
			console.log("Player has busted!");
		  }
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
		const card = dealCard(meshes, bjRef);
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
	meshes: baby.Mesh[],
	bjRef: React.RefObject<game.bjStruct>
): number => {
	const scene = bjRef.current?.scene;
	if (!scene) return 0;

	const card = Math.floor(Math.random() * 52) + 1;
	const originalMesh = bjRef.current!.cards[card];
	if (originalMesh)
	{
		console.log(`Dealing card: ${originalMesh.name} with key: ${card}`);
		const clonedMesh = originalMesh.clone(`${originalMesh.name}_clone`, originalMesh.parent);
		clonedMesh.position = new baby.Vector3(x, y, z);
	    clonedMesh.isVisible = true;
	    clonedMesh.setEnabled = true;

		meshes.push(clonedMesh);
	}
	return card;
};

export const getCardKey = (suit: keyof typeof suitMap, value: keyof typeof valueMap): number => {
  return (game.SuitMap[suit] - 1) * 13 + game.ValueMap[value];
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

const	getBalance = async (bjRef: React.RefObject<game.bjStruct>) =>
{
	const res = await fetch
	(
		"api/balance",
		{
			method: "GET",
			headers:
			{
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem('authToken')}`,
			},
		}
	);
	if (!res.ok)
	{
		console.error("Failed to fetch balance");
		return;
	}
	const data = await res.json();
	bjRef.current.player1Money = data.balance;
};
