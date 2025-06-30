// File: backend/pong-service/src/gameSession.ts
import WebSocket from 'ws';


export class GameSession {
	id: string;
	player1: WebSocket;
	player2: WebSocket | null = null;
	roomName: string;

	// Données utilisateur pour report API
	player1Id: string = 'player1';
	player2Id: string = 'player2';
	score1: number = 0;
	score2: number = 0;

	lastState = {
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

	setPlayer2(socket: WebSocket, player2Id: string) {
		this.player2 = socket;
		this.player2Id = player2Id;
		this.broadcast({ type: 'game_start' });
	}

	setPlayer1(socket: WebSocket, player1Id: string) {
		this.player1 = socket;
		this.player1Id = player1Id;	
	}

	handleGameUpdate(data: any) {
		const state: any = { type: 'state_update' };

		if (typeof data.paddle1Z === 'number') state.paddle1Z = data.paddle1Z;
		if (typeof data.paddle2Z === 'number') state.paddle2Z = data.paddle2Z;
		if (data.ballPosition) state.ballPosition = data.ballPosition;
		if (data.ballDirection) state.ballDirection = data.ballDirection;
		if (typeof data.ballSpeedModifier === 'number') state.ballSpeedModifier = data.ballSpeedModifier;

		this.lastState = {
			...this.lastState,
			...state,
		};

		state.lastState = this.lastState;
		this.broadcast(state);
	}

	broadcast(payload: any) {
		this.player1.send(JSON.stringify(payload));
		this.player2?.send(JSON.stringify(payload));
	}

	hasSocket(socket: WebSocket): boolean {
		return this.player1 === socket || this.player2 === socket;
	}

}
