import { useState } from "react";
import { AuthUserGateway } from "../../gateways/auth_user_gateway";
import { ApplyNewPasswordUseCase } from "../../../domain/use_cases/apply_new_password_use_case";
import { InvalidPasswordResetTokenError, DomainException } from "../../../domain/exceptions/exceptions";

export const useChangePassword = () => {

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const changePassword = async (token: string, new_password: string, confirm_password: string) => {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        if (!token || !new_password) {
            setError("No hay token o nueva contraseña proporcionados.");
            setIsLoading(false);
            return;
        }

        if (new_password !== confirm_password) {
            setError("Las contraseñas no coinciden.");
            setIsLoading(false);
            return;
        }

        try {
            const gateway = new AuthUserGateway();
            const useCase = new ApplyNewPasswordUseCase(gateway);
            
            await useCase.execute({ token, new_password });
            
            setSuccessMessage("Tu contraseña ha sido cambiada exitosamente.");
            
        } catch (err: any) {
            if (err instanceof InvalidPasswordResetTokenError) {
                setError(err.message);
            } else if (err instanceof DomainException) {
                setError(err.message);
            } else {
                setError("Ocurrió un error inesperado.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return { changePassword, isLoading, error, successMessage };
};