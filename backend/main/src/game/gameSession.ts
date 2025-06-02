// src/game/gameSession.ts
import WebSocket from 'ws';

type PlayerInput = 'up' | 'down' | 'none';

interface Player {
	socket: WebSocket;
	paddleY: number;
	input: PlayerInput;
}

export class GameSession {
	id: string;
	player1: Player;
	player2: Player | null = null;
	ball = { x: 0, y: 0, dx: 0.03, dy: 0.025 };
	score = { p1: 0, p2: 0 };
	interval: NodeJS.Timeout | null = null;

	constructor(id: string, socket: WebSocket) {
		this.id = id;
		this.player1 = {
			socket,
			paddleY: 0,
			input: 'none',
		};
		this.setupSocket(socket, 1);
	}

	setPlayer2(socket: WebSocket) {
		this.player2 = {
			socket,
			paddleY: 0,
			input: 'none',
		};
		this.setupSocket(socket, 2);
		this.startGameLoop();
	}

	setupSocket(socket: WebSocket, playerNumber: 1 | 2) {
		socket.on('message', (msg) => {
			try {
				const data = JSON.parse(msg.toString());
				if (data.type === 'input') {
					const player = playerNumber === 1 ? this.player1 : this.player2!;
					player.input = data.input;
				}
			} catch (err) {
				console.error('Invalid message received:', msg.toString());
			}
		});

		socket.on('close', () => {
			console.log(`Player ${playerNumber} disconnected from game ${this.id}`);
			this.stopGameLoop();
		});
	}

	startGameLoop() {
		this.interval = setInterval(() => this.update(), 1000 / 30);
	}

	stopGameLoop() {
		if (this.interval) clearInterval(this.interval);
	}

	update() {
		// Update paddles
		const moveSpeed = 0.05;
		if (this.player1.input === 'up') this.player1.paddleY += moveSpeed;
		if (this.player1.input === 'down') this.player1.paddleY -= moveSpeed;

		if (this.player2) {
			if (this.player2.input === 'up') this.player2.paddleY += moveSpeed;
			if (this.player2.input === 'down') this.player2.paddleY -= moveSpeed;
		}

		// Update ball
		this.ball.x += this.ball.dx;
		this.ball.y += this.ball.dy;

		if (this.ball.y < -1 || this.ball.y > 1) this.ball.dy *= -1;

		// Broadcast state
		const payload = {
			type: 'state_update',
			ball: this.ball,
			paddle1: this.player1.paddleY,
			paddle2: this.player2?.paddleY ?? 0,
			score: this.score,
		};

		this.player1.socket.send(JSON.stringify(payload));
		this.player2?.socket.send(JSON.stringify(payload));
	}
}
