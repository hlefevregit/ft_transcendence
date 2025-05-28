import WebSocket from 'ws';

export class GameSession {
	id: string;
	player1: WebSocket;
	player2: WebSocket | null = null;
	roomName: string;

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
		this.broadcast({ type: 'state_update', ...data });
	}

	broadcast(payload: any) {
		this.player1.send(JSON.stringify(payload));
		this.player2?.send(JSON.stringify(payload));
	}

	hasSocket(socket: WebSocket): boolean {
		return this.player1 === socket || this.player2 === socket;
	}
}
