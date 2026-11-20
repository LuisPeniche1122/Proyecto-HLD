import { useState, useEffect } from "react";
import type { RoomListItemDTO } from "../../../domain/dtos/room_dtos";
import { RoomListGateway } from "../../gateways/room_list_gateway";
import { GetRoomsListUseCase } from "../../../domain/use_cases/get_rooms_list_use_case";

export const useRoomsList = (token: string) => {
    const [rooms, setRooms] = useState<RoomListItemDTO[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {

        if (!token) {
            setError("No hay sesión activa.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        

        // 1. Armamos el flujo limpio
        const gateway = new RoomListGateway();
        const useCase = new GetRoomsListUseCase(gateway);

        // 2. Ejecutamos el caso de uso pasándole las respuestas que queremos en React
        const unsubscribe = useCase.execute(
            token,
            (updatedRooms: RoomListItemDTO[]) => {
                setRooms(updatedRooms);
                setError(null); // <--- AGREGAR ESTA LÍNEA AQUÍ
                setIsLoading(false);
            },
            (err: Error) => {
                setError(err.message);
                setIsLoading(false);
            }
        );

        // 3. React limpia el WebSocket automáticamente si cambiamos de pantalla
        return () => {
            unsubscribe();
        };
    }, [token]);

    return { rooms, isLoading, error };
};