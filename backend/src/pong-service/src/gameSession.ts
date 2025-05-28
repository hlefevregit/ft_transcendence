import WebSocket from 'ws';

export class GameSession {
	id: string;
	player1: WebSocket;
	player2: WebSocket | null = null;
	roomName: string;

	lastState = {
		paddle1Z: 0,
		paddle2Z: 0,
		ballPosition: { x: 0, y: 0, z: 0 },
		ballDirection: { x: 0, y: 0, z: 0 },
		ballSpeedModifier: 1,
	};

	constructor(id: string, socket: WebSocket, roomName: string) {
		this.id = id;
		this.player1 = socket;
		this.roomName = roomName;
	}

	setPlayer2(socket: WebSocket) {
		this.player2 = socket;
		this.broadcast({ type: 'game_start' });
	}

	handleGameUpdate(data: any) {
		const state: any = {
			type: 'state_update',
		};

		// Copie proprement les bonnes clés
		if (typeof data.paddle1Z === 'number') state.paddle1Z = data.paddle1Z;
		if (typeof data.paddle2Z === 'number') state.paddle2Z = data.paddle2Z;

		if (data.ballPosition) state.ballPosition = data.ballPosition;
		if (data.ballDirection) state.ballDirection = data.ballDirection;
		if (typeof data.ballSpeedModifier === 'number') state.ballSpeedModifier = data.ballSpeedModifier;

		// Met à jour l'état du jeu
		this.lastState.paddle1Z = state.paddle1Z || this.lastState.paddle1Z;
		this.lastState.paddle2Z = state.paddle2Z || this.lastState.paddle2Z;
		this.lastState.ballPosition = state.ballPosition || this.lastState.ballPosition;
		this.lastState.ballDirection = state.ballDirection || this.lastState.ballDirection;
		this.lastState.ballSpeedModifier = state.ballSpeedModifier || this.lastState.ballSpeedModifier;
		// Broadcast l'état mis à jour
		state.lastState = this.lastState; // Ajoute l'état actuel pour que les joueurs puissent le voir
		this.broadcast(state);
	}


	broadcast(payload: any) {
		console.log(`Broadcasting to game ${this.id}:`, payload);
		this.player1.send(JSON.stringify(payload));
		this.player2?.send(JSON.stringify(payload));
	}

	hasSocket(socket: WebSocket): boolean {
		return this.player1 === socket || this.player2 === socket;
	}
	
}
