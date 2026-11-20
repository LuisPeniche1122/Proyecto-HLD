import { useState } from "react";
import { AuthUserGateway } from "../../gateways/auth_user_gateway";
import { AskForPasswordChangeUseCase } from "../../../domain/use_cases/ask_for_password_change_use_case";
import { DomainException } from "../../../domain/exceptions/exceptions";

export const useAskForPasswordChange = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const askForChange = async (identifier: string) => {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        if (!identifier) {
            setError("Por favor, ingresa tu usuario o correo electrónico.");
            setIsLoading(false);
            return;
        }

        try {
            const gateway = new AuthUserGateway();
            const useCase = new AskForPasswordChangeUseCase(gateway);
            
            await useCase.execute({ identifier });
            
            setSuccessMessage("Si el usuario existe, recibirás un correo con las instrucciones.");
            
        } catch (err: any) {
            if (err instanceof DomainException) {
                setError(err.message);
            } else {
                setError("Ocurrió un error inesperado.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const resetState = () => {
        setError(null);
        setSuccessMessage(null);
    };

    return { askForChange, isLoading, error, successMessage, resetState };
};