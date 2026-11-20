import { useState, useEffect } from "react";
import { RoomGateway } from "../../gateways/room_gateway";
import type { RoomStateDTO } from "../../../domain/dtos/room_dtos";
import type { GameStateDTO } from "../../../domain/dtos/game_dtos";
import type { WSEnvelope, SyncStatePayload } from "../../../domain/dtos/ws_dtos";

export const useRoomTunnel = (roomCode: string | undefined, token: string) => {
    const [roomState, setRoomState] = useState<RoomStateDTO | null>(null);
    const [gameState, setGameState] = useState<GameStateDTO | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);

    useEffect(() => {
        if (!roomCode || !token) {
            setError("Faltan credenciales para unirse a la mesa.");
            return;
        }

        const roomGateway = new RoomGateway();
        setError(null);
        setIsConnected(false);

        const disconnect = roomGateway.joinRoom(
            roomCode,
            token,
            (incomingData: WSEnvelope) => {
                setIsConnected(true);

                // 1. Manejador de Sincronización de Estado
                if (incomingData.event === "sync_state") {
                    const payload = incomingData.payload as SyncStatePayload;
                    
                    // Si el servidor nos mandó la sala, la actualizamos
                    if (payload.room) {
                        setRoomState(payload.room);
                    }
                    
                    // Si el servidor nos mandó el juego, lo actualizamos
                    if (payload.game) {
                        setGameState(payload.game);
                    }
                } 
                // 2. Aquí en el futuro puedes atrapar otros eventos
                else if (incomingData.event === "error") {
                    console.error("El servidor reportó un error:", incomingData.payload);
                    // Podrías lanzar un Toast o una alerta aquí
                }
            },
            (err: Error) => {
                setError(err.message);
                setIsConnected(false);
            }
        );

        return () => {
            disconnect();
            setIsConnected(false);
            setRoomState(null);
            setGameState(null);
        };
    }, [roomCode, token]);

    return { roomState, gameState, error, isConnected };
};