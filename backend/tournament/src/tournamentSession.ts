import WebSocket from 'ws';


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

	score1_game1: number = 0;
	score2_game1: number = 0;

	score1_game2: number = 0;
	score2_game2: number = 0;

	score1_final: number = 0;
	score2_final: number = 0;

	lastStateGame1 = {
		paddle1Z: 0,
		paddle2Z: 0,
		ballPosition: { x: 0, y: 0, z: 0 },
		ballDirection: { x: 0, y: 0, z: 0 },
		ballSpeedModifier: 1,
	};
	lastStateGame2 = {
		paddle3Z: 0,
		paddle4Z: 0,
		ballPosition: { x: 0, y: 0, z: 0 },
		ballDirection: { x: 0, y: 0, z: 0 },
		ballSpeedModifier: 1,
	};
	lastStateFinal = {
		paddle1Z: 0,
		paddle2Z: 0,
		ballPosition: { x: 0, y: 0, z: 0 },
		ballDirection: { x: 0, y: 0, z: 0 },
		ballSpeedModifier: 1,
	};

	reported: boolean = false;

	constructor(id: string, socket: WebSocket, roomName: string) {
		this.id = id;
		this.player1 = socket;
		this.roomName = roomName;
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
	// handleGameUpdate(data: any) {
	// 	const state: any = { type: 'state_update' };

	// 	if (typeof data.paddle1Z === 'number') state.paddle1Z = data.paddle1Z;
	// 	if (typeof data.paddle2Z === 'number') state.paddle2Z = data.paddle2Z;
	// 	if (data.ballPosition) state.ballPosition = data.ballPosition;
	// 	if (data.ballDirection) state.ballDirection = data.ballDirection;
	// 	if (typeof data.ballSpeedModifier === 'number') state.ballSpeedModifier = data.ballSpeedModifier;

	// 	this.lastState = {
	// 		...this.lastState,
	// 		...state,
	// 	};

	// 	state.lastState = this.lastState;
	// 	this.broadcast(state);
	// }

	hanfleGameUpdateGame1(data: any) {
		const state: any = { type: 'state_update_game1' };
		if (typeof data.paddle1Z === 'number') state.paddle1Z = data.paddle1Z;
		if (typeof data.paddle2Z === 'number') state.paddle2Z = data.paddle2Z;
		if (data.ballPosition) state.ballPosition = data.ballPosition;
		if (data.ballDirection) state.ballDirection = data.ballDirection;
		if (typeof data.ballSpeedModifier === 'number') state.ballSpeedModifier = data.ballSpeedModifier;
		this.lastStateGame1 = {
			...this.lastStateGame1,
			...state,
		};
		state.lastStateGame1 = this.lastStateGame1;
		this.broadCastGame1(state);
	}
	hanfleGameUpdateGame2(data: any) {
		const state: any = { type: 'state_update_game2' };
		if (typeof data.paddle3Z === 'number') state.paddle3Z = data.paddle3Z;
		if (typeof data.paddle4Z === 'number') state.paddle4Z = data.paddle4Z;
		if (data.ballPosition) state.ballPosition = data.ballPosition;
		if (data.ballDirection) state.ballDirection = data.ballDirection;
		if (typeof data.ballSpeedModifier === 'number') state.ballSpeedModifier = data.ballSpeedModifier;
		this.lastStateGame2 = {
			...this.lastStateGame2,
			...state,
		};
		state.lastStateGame2 = this.lastStateGame2;
		this.broadCastGame2(state);
	}

	handleFinalUpdate(data: any) {
		const state: any = { type: 'state_update_final' };
		if (typeof data.paddle1Z === 'number') state.paddle1Z = data.paddle1Z;
		if (typeof data.paddle2Z === 'number') state.paddle2Z = data.paddle2Z;
		if (data.ballPosition) state.ballPosition = data.ballPosition;
		if (data.ballDirection) state.ballDirection = data.ballDirection;
		if (typeof data.ballSpeedModifier === 'number') state.ballSpeedModifier = data.ballSpeedModifier;
		this.lastStateFinal = {
			...this.lastStateFinal,
			...state,
		};
		state.lastStateFinal = this.lastStateFinal;
		this.broadCastFinal(state);
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

}
