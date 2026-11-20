import { useState } from "react";
import { AuthUserGateway } from "../../gateways/auth_user_gateway";
import { LoginUseCase } from "../../../domain/use_cases/login_use_case";
import { LoginGuestUseCase } from "../../../domain/use_cases/login_guest_use_case";
import { InvalidCredentialsError, DomainException } from "../../../domain/exceptions/exceptions";

// 2. Ya no recibimos onNavigate por parámetro
export const useLoginUser = () => {

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const login = async (formData: any) => {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        if (!formData.identity || !formData.password) {
            setError("Todos los campos son obligatorios.");
            setIsLoading(false);
            return;
        }

        try {
            const gateway = new AuthUserGateway();
            const useCase = new LoginUseCase(gateway);
            
            const response = await useCase.execute({
                identifier: formData.identity,
                password: formData.password
            });

            console.log(`¡Bienvenido de vuelta, ${response.username}!`);
            setSuccessMessage(`¡Bienvenido de vuelta, ${response.username}!`);
            return response;

        } catch (err: any) {
            if (err instanceof InvalidCredentialsError) {
                setError(err.message);
            } else if (err instanceof DomainException) {
                setError(err.message);
            } else {
                setError("Ocurrió un error inesperado al iniciar sesión.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const loginAsGuest = async () => {
        setIsLoading(true);
        setError(null);
        console.log("Solicitando acceso de invitado al servidor...");

        try {
            const gateway = new AuthUserGateway();
            const useCase = new LoginGuestUseCase(gateway);
            
            const response = await useCase.execute();

            console.log(`¡Bienvenido invitado, ${response.username}!`);
            setSuccessMessage(`¡Bienvenido de vuelta, ${response.username}!`);
            return response;

        } catch (err: any) {
            if (err instanceof DomainException) {
                setError(err.message);
            } else {
                setError("Ocurrió un error inesperado al entrar como invitado.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return { login, loginAsGuest, isLoading, error, successMessage};
};