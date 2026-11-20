import { useEffect, useState } from "react";
import { JoinRoomUseCase } from "../../../domain/use_cases/join_room_use_case";
import { RoomGateway } from "../../gateways/room_gateway";
import type { RoomStateDTO } from "../../../domain/dtos/room_dtos";

const gateway = new RoomGateway();
const joinRoomUseCase = new JoinRoomUseCase(gateway);

export const useJoinRoom = (roomCode: string | undefined, token: string) => {
    const [roomState, setRoomState] = useState<RoomStateDTO | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Si no hay código de sala (ej. la ruta está mal), no hacemos nada
        if (!roomCode) return;
        if (!token) {
            setError("No hay sesión activa.");
            return;
        }

        setError(null);
        setIsConnected(false);

        // Iniciamos la conexión WebSocket
        const disconnect = joinRoomUseCase.execute(
            roomCode,
            token,
            (newState) => {
                setRoomState(newState);
                setIsConnected(true);
            },
            (err) => {
                setError(err.message);
                setIsConnected(false);
            }
        );

        // Función de limpieza de React: cierra el WebSocket al salir del componente
        return () => {
            disconnect();
            setIsConnected(false);
            setRoomState(null);
        };
    }, [roomCode, token]); // Si el código de sala cambia, se reconecta automáticamente

    return { roomState, isConnected, error };
};