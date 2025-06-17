import WebSocket from 'ws';

export class Match {
	matchId: 'game1' | 'game2' | 'final';
	playerA: WebSocket | null = null;
	playerB: WebSocket | null = null;
	session: tournamentSession;

	lastState: any = {
		paddle1Z: 0,
		paddle2Z: 0,
		ballPosition: { x: 0, y: 0, z: 0 },
		ballDirection: { x: 0, y: 0, z: 0 },
		ballSpeedModifier: 1,
	};

	constructor(matchId: 'game1' | 'game2' | 'final', session: tournamentSession, playerA?: WebSocket, playerB?: WebSocket) {
		this.matchId = matchId;
		this.session = session;
		if (playerA) this.playerA = playerA;
		if (playerB) this.playerB = playerB;
	}

	updateState(data: any) {
		const state: any = { type: 'state_update', matchId: this.matchId };

		if (typeof data.paddle1Z === 'number') state.paddle1Z = data.paddle1Z;
		if (typeof data.paddle2Z === 'number') state.paddle2Z = data.paddle2Z;
		if (data.ballPosition) {
			state.ballPosition = data.ballPosition;

			// 🎯 Logique de score uniquement pour la finale
			if (this.matchId === 'final') {
				const limitX = 8; // Limite à adapter à la taille réelle de ton terrain
				if (data.ballPosition.x < -limitX) {
					this.session.score2_final += 1;
					console.log(`🏓 Point pour Finalist 2! Score: ${this.session.score1_final} - ${this.session.score2_final}`);
				} else if (data.ballPosition.x > limitX) {
					this.session.score1_final += 1;
					console.log(`🏓 Point pour Finalist 1! Score: ${this.session.score1_final} - ${this.session.score2_final}`);
				}
			}
		}
		if (data.ballDirection) state.ballDirection = data.ballDirection;
		if (typeof data.ballSpeedModifier === 'number') state.ballSpeedModifier = data.ballSpeedModifier;

		this.lastState = {
			...this.lastState,
			...state,
		};

		state.lastState = this.lastState;
		console.log(`✅ Match ${this.matchId} state updated:`, this.lastState);

		this.broadcast(state);
	}

	broadcast(payload: any) {
		this.playerA?.send(JSON.stringify(payload));
		this.playerB?.send(JSON.stringify(payload));
	}
}



export class tournamentSession {
	id: string;
	player1: WebSocket;
	player2: WebSocket | null = null;
	player3: WebSocket | null = null;
	player4: WebSocket | null = null;

	roomName: string;

	// Données utilisateur pour report API
	player1Id: string = 'player1';
	player2Id: string = 'player2';
	player3Id: string = 'player3';
	player4Id: string = 'player4';

	player1Pseudo: string = 'Player 1';
	player2Pseudo: string = 'Player 2';
	player3Pseudo: string = 'Player 3';
	player4Pseudo: string = 'Player 4';


	finalist1: WebSocket | null = null;
	finalist2: WebSocket | null = null;
	finalist1Id: string = 'finalist1';
	finalist2Id: string = 'finalist2';


	finalist1Ready: boolean = false;
	finalist2Ready: boolean = false;

	score1_game1: number = 0;
	score2_game1: number = 0;

	score1_game2: number = 0;
	score2_game2: number = 0;

	score1_final: number = 0;
	score2_final: number = 0;


	points_to_win: number = 0;

	game1: Match = new Match('game1', this);
	game2: Match = new Match('game2', this);
	final: Match = new Match('final', this);


	reported: boolean = false;

	constructor(id: string, socket: WebSocket, roomName: string) {
		this.id = id;
		this.player1 = socket;
		this.roomName = roomName;

		this.game1 = new Match('game1', this);
		this.game2 = new Match('game2', this);
		this.final = new Match('final', this);
	}


	setPlayer1(socket: WebSocket, player1Id: string, player1Pseudo: string) {
		this.player1 = socket;
		this.player1Id = player1Id;	
		this.player1Pseudo = player1Pseudo;
	}
	
	setPlayer2(socket: WebSocket, player2Id: string, player2Pseudo: string) {
		this.player2 = socket;
		this.player2Id = player2Id;
		this.player2Pseudo = player2Pseudo;
		this.game1 = new Match('game1', this, this.player1, this.player2);
		// this.broadcast({ type: 'game_start' });
	}

	setPlayer3(socket: WebSocket, player3Id: string, player3Pseudo: string) {
		this.player3 = socket;
		this.player3Id = player3Id;
		this.player3Pseudo = player3Pseudo;
	}

	setPlayer4(socket: WebSocket, player4Id: string, player4Pseudo: string) {
		this.player4 = socket;
		this.player4Id = player4Id;
		this.player4Pseudo = player4Pseudo;
		this.game2 = new Match('game2', this, this.player3 ?? undefined, this.player4 ?? undefined);
	}

	getPlayerId(socket: WebSocket): string | null {
		if (this.player1 === socket) return this.player1Id;
		if (this.player2 === socket) return this.player2Id;
		if (this.player3 === socket) return this.player3Id;
		if (this.player4 === socket) return this.player4Id;
		return null;
	}
	setPlayerToNull(socket: WebSocket) {
		if (this.player1 === socket) {
			this.player1 = null as any; // Type assertion to allow setting to null
		} else if (this.player2 === socket) {
			this.player2 = null;
		} else if (this.player3 === socket) {
			this.player3 = null;
		} else if (this.player4 === socket) {
			this.player4 = null;
		} else if (this.finalist1 === socket) {
			this.finalist1 = null;
		} else if (this.finalist2 === socket) {
			this.finalist2 = null;
		} else {
			console.warn('Socket not found in session:', socket);
		}
	}


	broadcast(payload: any) {
		this.player1.send(JSON.stringify(payload));
		this.player2?.send(JSON.stringify(payload));
		this.player3?.send(JSON.stringify(payload));
		this.player4?.send(JSON.stringify(payload));
	}

	broadCastGame1(payload: any) {
		this.player1.send(JSON.stringify(payload));
		this.player2?.send(JSON.stringify(payload));
	}
	broadCastGame2(payload: any) {
		this.player3?.send(JSON.stringify(payload));
		this.player4?.send(JSON.stringify(payload));
	}
	broadCastFinal(payload: any) {
		this.finalist1?.send(JSON.stringify(payload));
		this.finalist2?.send(JSON.stringify(payload));

	}

	hasSocket(socket: WebSocket): boolean {
		return this.player1 === socket || this.player2 === socket || this.player3 === socket || this.player4 === socket;
	}


	getSocketById(playerId: string): WebSocket | null {
		if (this.player1Id === playerId) return this.player1;
		if (this.player2Id === playerId) return this.player2;
		if (this.player3Id === playerId) return this.player3;
		if (this.player4Id === playerId) return this.player4;
		return null;
	}

	getIdBySocket(socket: WebSocket): string | null {
		if (this.player1 === socket) return this.player1Id;
		if (this.player2 === socket) return this.player2Id;
		if (this.player3 === socket) return this.player3Id;
		if (this.player4 === socket) return this.player4Id;
		if (this.finalist1 === socket) return this.finalist1Id;
		if (this.finalist2 === socket) return this.finalist2Id;
		return null;
	}

	initializeFinalMatch() {
		if (this.finalist1 && this.finalist2) {
			this.final = new Match('final', this, this.finalist1, this.finalist2);
			console.log("✅ Finale initialisée avec", this.getIdBySocket(this.finalist1), "et", this.getIdBySocket(this.finalist2));
		}
	}

}
