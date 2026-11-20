import { useState } from "react";
import { CreateRoomUseCase } from "../../../domain/use_cases/create_room_use_case";
import { RoomGateway } from "../../gateways/room_gateway";

const gateway = new RoomGateway();
const createRoomUseCase = new CreateRoomUseCase(gateway);

export const useCreateRoom = (token: string) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createRoom = async (): Promise<string | null> => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await createRoomUseCase.execute(token);
            return response.room_code; // Retornamos el código para que la vista haga el navigate()
        } catch (err: any) {
            setError(err.message || "Ocurrió un error desconocido al crear la sala.");
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { createRoom, isLoading, error };
};