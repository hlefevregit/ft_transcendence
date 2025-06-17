"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWebsocket = void 0;
const websocket_1 = __importDefault(require("@fastify/websocket"));
const gameSession_1 = require("../game/gameSession");
const crypto_1 = __importDefault(require("crypto"));
// Map globale pour stocker les sessions de jeu actives
const games = new Map();
// Fonction pour s'assurer que le message est bien du JSON
const isJson = (msg) => {
    try {
        JSON.parse(msg);
        return true;
    }
    catch {
        return false;
    }
};
const setupWebsocket = (fastify) => {
    // Enregistrement du plugin WebSocket
    fastify.register(websocket_1.default);
    // Route WebSocket principale
    fastify.get('/ws', { websocket: true }, (conn, req) => {
        console.log('🔌 New WebSocket connection');
        conn.on('message', (msg) => {
            if (!isJson(msg.toString())) {
                console.warn('⚠️ Received non-JSON message');
                return;
            }
            const data = JSON.parse(msg.toString());
            switch (data.type) {
                case 'host_game': {
                    const gameId = crypto_1.default.randomUUID(); // ou basé sur userId si tu préfères
                    const session = new gameSession_1.GameSession(gameId, conn);
                    games.set(gameId, session);
                    conn.send(JSON.stringify({
                        type: 'game_hosted',
                        gameId,
                    }));
                    console.log(`🟢 Game hosted: ${gameId}`);
                    break;
                }
                case 'create_game': {
                    const gameId = crypto_1.default.randomUUID();
                    const session = new gameSession_1.GameSession(gameId, conn);
                    games.set(gameId, session);
                    conn.send(JSON.stringify({
                        type: 'game_created',
                        gameId,
                    }));
                    console.log(`🎮 Game created: ${gameId}`);
                    break;
                }
                case 'join_game': {
                    const { gameId } = data;
                    const session = games.get(gameId);
                    if (session && !session.player2) {
                        session.setPlayer2(conn);
                        conn.send(JSON.stringify({
                            type: 'joined_game',
                            gameId,
                        }));
                        console.log(`🧍 Player joined game: ${gameId}`);
                    }
                    else {
                        conn.send(JSON.stringify({
                            type: 'error',
                            message: 'Room full or invalid',
                        }));
                        console.warn(`❌ Failed to join game: ${gameId}`);
                    }
                    break;
                }
                default:
                    conn.send(JSON.stringify({
                        type: 'error',
                        message: 'Unknown message type',
                    }));
                    console.warn('❓ Unknown message type:', data.type);
            }
        });
        conn.on('close', () => {
            console.log('❎ WebSocket connection closed');
        });
    });
};
exports.setupWebsocket = setupWebsocket;
