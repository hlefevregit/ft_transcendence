import WebSocket from 'ws';
type PlayerInput = 'up' | 'down' | 'none';
interface Player {
    socket: WebSocket;
    paddleY: number;
    input: PlayerInput;
}
export declare class GameSession {
    id: string;
    player1: Player;
    player2: Player | null;
    ball: {
        x: number;
        y: number;
        dx: number;
        dy: number;
    };
    score: {
        p1: number;
        p2: number;
    };
    interval: NodeJS.Timeout | null;
    constructor(id: string, socket: WebSocket);
    setPlayer2(socket: WebSocket): void;
    setupSocket(socket: WebSocket, playerNumber: 1 | 2): void;
    startGameLoop(): void;
    stopGameLoop(): void;
    update(): void;
}
export {};
