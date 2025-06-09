// imports
import React, { use } from 'react';
import { useNavigate } from 'react-router-dom';
import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';


/// <reference types="vite/client" />

declare global {
  interface ImportMetaEnv {
    readonly VITE_BACKEND_IP: string;
    // add other env variables here if needed
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

const backendIP = import.meta.env.VITE_BACKEND_IP;

export const useWebSocketOnline = (pong: React.RefObject<game.pongStruct>,
    socketRef: React.RefObject<WebSocket | null>,
    gameModes: React.RefObject<game.gameModes>,
    states: React.RefObject<game.states>,
    lang: React.RefObject<game.lang>,
    userNameRef: React.RefObject<string | null>,
    ws: WebSocket,
) => {

    socketRef.current = ws;
    
    ws.onopen = () => {
        console.log("✅ WebSocket connecté");
    };
    
    ws.onerror = (err) => {
        console.error("❌ WebSocket erreur :", err);
    };

    // Remove the game mode check to ensure the handler is always registered
    // if (gameModes.current === game.gameModes.online) {  // REMOVE THIS LINE

    ws.onmessage = (event) => {
    
        let data;
        try {
            data = JSON.parse(event.data);
            console.log("🔄 Message received:", data.type); // Add this debug line
        } catch (err) {
            console.error("❌ Erreur parsing JSON :", err);
            return;
        }
    
        switch (data.type) {
    
            case 'game_hosted': {
                console.log('🎮 Game hosted with ID:', data.gameId);
    
                pong.current.isHost = true ;
                const roomId = data.gameId;
                pong.current.lastHostedRoomId = roomId;
    
                const roomName = `${userNameRef.current || 'Anonymous'}'s room`;
                console.log("🧠 userNameRef.current =", userNameRef.current);
    
                const roomPanel = game.createRoomPanel(pong, lang, roomName, () => {
                    console.log("🧩 Creating GUI for", roomId);
                    socketRef.current?.send(JSON.stringify({
                        type: 'join_game',
                        gameId: roomId,
                        roomName: roomName,
                    }));
                });
                console.log("📦 roomPanel créé :", roomPanel?.name ?? 'undefined');
    
                pong.current.rooms.set(roomId, () => roomPanel);
                console.log("🗂 Room ajoutée au Map avec ID:", roomId);
                break;
            }
    
            case 'room_list': {
                console.log("📜 Liste des rooms reçue:", data.rooms);
    
                // Réinitialise les rooms
                pong.current.rooms.clear();
    
                for (const room of data.rooms) {
                    const roomPanel = game.createRoomPanel(pong, lang, room.roomName, () => {
                        console.log("🔗 Joining room:", room.gameId);
                        pong.current.isHost = false;
                        socketRef.current?.send(JSON.stringify({
                            type: 'join_game',
                            gameId: room.gameId,
                    }));
                    });
                    pong.current.rooms.set(room.gameId, () => roomPanel);
                }
    
                // MAJ de l’affichage GUI
                const updatedList = game.refreshOnlineRoomsEntries(pong, states, gameModes);
                const verticalStack = pong.current.roomListVerticalStackPanel;
                if (verticalStack) {
                    const old = verticalStack.getChildByName("roomsVerticalPanel");
                    if (old) verticalStack.removeControl(old);
                    verticalStack.addControl(updatedList);
                } else {
                    console.warn("⚠️ roomListVerticalStackPanel introuvable");
                }
    
                break;
            }
    
            case 'room_left': {
                const roomId = data.gameId;
                console.log("🚪 Room left:", roomId);
    
                const roomPanel = pong.current.rooms.get(roomId)?.();
                if (roomPanel) {
                    roomPanel.dispose();
                    pong.current.rooms.delete(roomId);
                    console.log("🗑️ Room removed from Map:", roomId);
                } else {
                    console.warn("⚠️ Room panel not found for ID:", roomId);
                }
                break;
            }
    
            case 'joined_game': {
                console.log('👥 Rejoint game:', data.gameId);
    
                break;
            }
    
            case 'start_game': {
                console.log("🚀 Start game triggered for:", data.gameId);
                if (gameModes.current !== game.gameModes.online)
                    gameModes.current = game.gameModes.online;
                states.current = game.states.waiting_to_start;
                break;
            }
    
            case 'state_update': {
                // console.log("🎮 Game update received:", data);
    
                if (gameModes.current === game.gameModes.online) {
                    // 🎯 HOST: applique la position de l'adversaire (player 2)
                    if (pong.current.isHost && typeof data.paddle2Z === 'number') {
                        pong.current.paddle2TargetZ = data.paddle2Z;
                    }
    
                    if (!pong.current.isHost && typeof data.paddle1Z === 'number') {
                        pong.current.paddle1TargetZ = data.paddle1Z;
                    }
    
                    // 🟢 Seul le host reçoit et met à jour la balle
                    if (!pong.current.isHost && data.ballPosition && pong.current.ball) {
                        pong.current.ball.position.x = data.ballPosition.x;
                        pong.current.ball.position.y = data.ballPosition.y;
                        pong.current.ball.position.z = data.ballPosition.z;
                    }
    
                    if (!pong.current.isHost && data.ballDirection) {
                        pong.current.ballDirection = data.ballDirection;
                    }
    
                    if (!pong.current.isHost && typeof data.ballSpeedModifier === 'number') {
                        pong.current.ballSpeedModifier = data.ballSpeedModifier;
                    }
                }
    
                break;
            }
    
            case 'game_finished': {
                console.log("🏁 Game finished:", data.reason || "normal");
                console.log("🏆 Winner:", (pong.current.player1Score > pong.current.player2Score ? data.player1Id : data.player2Id));
                // ✅ Mets à jour l'état interne de ton jeu
                states.current = game.states.game_finished;
    
                // ✅ Stocke les infos du gagnant et de la raison
                pong.current.lastGameWinner = data.winner;
                pong.current.lastGameReason = data.reason || 'normal';
    
                // ✅ Envoie les infos pour la DB (si pas déjà envoyé)
                if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                    if (pong.current.isHost || data.reason !== 'normal') {
                        const res = fetch(`/api/games`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${localStorage.getItem('authToken')}`, // adapte si tu n'utilises pas JWT
                            },
                            body: JSON.stringify({
                                gameId: data.gameId || pong.current.lastHostedRoomId,
                                player1Id: data.player1Id,
                                player2Id: data.player2Id,
                                player1Score: pong.current.player1Score,
                                player2Score: pong.current.player2Score,
                                winnerId: data.winner || (pong.current.player1Score > pong.current.player2Score ? data.player1Id : data.player2Id),
                                reason: data.reason || 'normal',
                            }),
                        });
                        if (!res) {
                            console.error("❌ Erreur lors de l'envoi des données du jeu :", res);
                        }
                        else {
                            console.log("✅ Données du jeu envoyées avec succès");
                        }
                    }
                }
                break;
            }
            case 'error': {
                console.error('❗ Erreur serveur:', data.message);
                break;
            }
    
            default: {
                console.log('ℹ️ Message inconnu reçu:', data);
            }
        }
    };
    // }

}

export const useOnlineLoop = (pong: React.RefObject<game.pongStruct>,
    socketRef: React.RefObject<WebSocket | null>,
    gameModes: React.RefObject<game.gameModes>,
    states: React.RefObject<game.states>,
    userNameRef: React.RefObject<string>,
    lastHandledState: React.RefObject<game.states | null>,

) =>
{
    switch (states.current)
    {
        
        case game.states.hosting_waiting_players: {
            // console.log("💡 socketRef:", socketRef.current);
            // console.log("💡 socketRef.readyState:", socketRef.current?.readyState);
            if (
                socketRef.current &&
                socketRef.current.readyState === WebSocket.OPEN &&
                lastHandledState.current !== game.states.hosting_waiting_players
            ) {
                const name = userNameRef.current || 'Anonymous';
                console.log(`🎮 Hosting game as ${name}`);
                socketRef.current.send(JSON.stringify({
                    type: 'host_game',
                    roomName: `${name}'s room`,
                }));
                lastHandledState.current = game.states.hosting_waiting_players;
            }
            break;
        }

        case game.states.room_list: {
            // console.log("💡 socketRef:", socketRef.current);
            // console.log("💡 socketRef.readyState:", socketRef.current?.readyState);

            if (
                socketRef.current &&
                socketRef.current.readyState === WebSocket.OPEN &&
                lastHandledState.current !== game.states.room_list
            ) {
                console.log("Requesting list of rooms");
                socketRef.current.send(JSON.stringify({ type: 'room_list' }));
                lastHandledState.current = game.states.room_list;
            }
            break;
        }


        case game.states.waiting_to_start: {
            // console.log("💡 socketRef:", socketRef.current);
            // console.log("💡 socketRef.readyState:", socketRef.current?.readyState);

            if (
                socketRef.current &&
                socketRef.current.readyState === WebSocket.OPEN &&
                lastHandledState.current !== game.states.waiting_to_start
            ) {
                console.log("Waiting for players to join...");
                // socketRef.current.send(JSON.stringify({ type: 'waiting_to_start' }));
                lastHandledState.current = game.states.waiting_to_start;
                pong.current.player1Score = 0;
                pong.current.player2Score = 0;
                game.resetPaddlesPosition(pong.current);
                game.resetBall(pong.current);
                game.setBallDirectionRandom(pong.current);
                game.fitCameraToArena(pong.current);
                states.current = game.states.countdown;
                game.transitionToCamera(pong.current.scene?.activeCamera as baby.FreeCamera, pong.current.arenaCam, 1, pong, states);
            }
            break;
        }

        case game.states.countdown: {

            if (pong.current.engine) {
                pong.current.countdown -= pong.current.engine.getDeltaTime() / 1000;
            }
            if (pong.current.countdown <= 0)
            {
                pong.current.countdown = 4;
                states.current = game.states.in_game;
            }
            break;
        }

        case game.states.game_finished: {
            // console.log("💡 socketRef:", socketRef.current);
            // console.log("💡 socketRef.readyState:", socketRef.current?.readyState);

            if (
                socketRef.current &&
                socketRef.current.readyState === WebSocket.OPEN &&
                lastHandledState.current !== game.states.game_finished
            ) {
                if (pong.current.isHost) {

                    console.log("Game finished, sending scores");
                    socketRef.current.send(JSON.stringify({
                        type: 'game_finished',
                        player1Score: pong.current.player1Score,
                        player2Score: pong.current.player2Score,
                    }));
                } 
                lastHandledState.current = game.states.game_finished;
            }
            break;
        }

        case game.states.in_game: {
            const now = Date.now();
            const timeSinceLastUpdate = now - (pong.current.lastUpdateSetAt || 0);

            if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                game.fitCameraToArena(pong.current);

                // 1. Input du joueur local
                // game.doPaddleMovement(pong, gameModes);

                // 2. Score check
                const maxScore = Math.max(pong.current.player1Score, pong.current.player2Score);
                if (maxScore >= pong.current.requiredPointsToWin)
                {
                    states.current = game.states.game_finished;
                    // console.log("🏁 Game finished, max score reached:", maxScore);
                    // socketRef.current.send(JSON.stringify({
                    // 	type: 'game_finished',
                    // 	player1Score: pong.current.player1Score,
                    // 	player2Score: pong.current.player2Score,
                    // 	reason: 'normal',
                    // }));
                    // return;
                }

                // 3. Interpolation position de l’adversaire
                const smoothFactor = 0.9;
                if (pong.current.isHost && typeof pong.current.paddle2TargetZ === 'number' && pong.current.paddle2) {
                    const cur = pong.current.paddle2.position.z;
                    const tgt = pong.current.paddle2TargetZ;
                    pong.current.paddle2.position.z += (tgt - cur) * smoothFactor;
                }
                if (!pong.current.isHost && typeof pong.current.paddle1TargetZ === 'number' && pong.current.paddle1) {
                    const cur = pong.current.paddle1.position.z;
                    const tgt = pong.current.paddle1TargetZ;
                    pong.current.paddle1.position.z += (tgt - cur) * smoothFactor;
                }

                // 4. Préparation de l’envoi WebSocket (si mouvement)
                const isHost = pong.current.isHost;
                const myPaddle = isHost ? pong.current.paddle1 : pong.current.paddle2;
                const myPaddleZ = myPaddle?.position.z ?? 0;
                const lastZ = pong.current.lastSentPaddleZ ?? null;

                // console.log("Current Z:", myPaddleZ, "Last sent Z:", lastZ);


                const paddleMoved = lastZ === null || Math.abs(myPaddleZ - lastZ) > 0.01;

                if (paddleMoved) {
                    const payload: any = {
                        type: 'game_update',
                    };
                    // console.log("Paddle moved, preparing payload...");
                    if (isHost) {
                        payload.paddle1Z = myPaddleZ;
                    } else {
                        payload.paddle2Z = myPaddleZ;
                    }
                    // console.log("📤 Envoi game_update:", payload);
                    socketRef.current.send(JSON.stringify(payload));
                    pong.current.lastSentPaddleZ = myPaddleZ;
                    pong.current.lastUpdateSetAt = now;
                }
                if (isHost) {
                    const payload: any = {
                        type: 'game_update',
                    }
                    if (pong.current.ball) {
                        pong.current.ball.position.x += pong.current.ballDirection.x * pong.current.ballSpeedModifier;
                        pong.current.ball.position.z += pong.current.ballDirection.z * pong.current.ballSpeedModifier;
                        // game.makeBallBounce(pong.current, states);
                        payload.ballPosition = {
                            x: pong.current.ball.position.x,
                            y: pong.current.ball.position.y,
                            z: pong.current.ball.position.z,
                        };
                        payload.ballDirection = {
                            x: pong.current.ballDirection.x,
                            y: pong.current.ballDirection.y,
                            z: pong.current.ballDirection.z,
                        };
                        payload.ballSpeedModifier = pong.current.ballSpeedModifier;
                    }
                    // console.log("📤 Envoi game_update Ball:", payload);
                    socketRef.current.send(JSON.stringify(payload));
                    pong.current.lastUpdateSetAt = now;
                }
            }

            break;
        }


        default: {
            if (
                lastHandledState.current === game.states.hosting_waiting_players &&
                (states.current as game.states) !== game.states.hosting_waiting_players
                && (states.current as game.states) !== game.states.in_game 
                && (states.current as game.states) !== game.states.game_finished
                && (states.current as game.states) !== game.states.countdown
                && (states.current as game.states) !== game.states.waiting_to_start
            ) {
                console.log("Sending current state:", states.current);
                console.log("Last handled state:", lastHandledState.current);

                // if (socketRef.current) {
                // 	socketRef.current.send(JSON.stringify({
                // 		type: 'state_update',
                // 		state: states.current,
                // 	}));
                // }
                lastHandledState.current = states.current;
                
            }
            break;
        }
    }
}