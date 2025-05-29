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

	async reportGameToApi(gameResult: {
		player1Id: string;
		player2Id: string;
		player1Score: number;
		player2Score: number;
		winnerId: string;
		reason: string;
	}) {
		try {
			const res = await fetch('http://backend:3000/api/games', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(gameResult),
			});

			if (!res.ok) {
				console.error("❌ Failed to store game result:", await res.text());
			} else {
				console.log("✅ Game result sent to API");
			}
		} catch (err) {
			console.error("❌ Error contacting API service:", err);
		}
	}
}
