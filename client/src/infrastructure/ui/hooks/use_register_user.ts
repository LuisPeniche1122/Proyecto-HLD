import { useState } from "react";
import { RegisterUserGateway } from "../../gateways/register_user_gateway";
import { RegisterUserUseCase } from "../../../domain/use_cases/register_user_use_case";
import { UserAlreadyExistsError, DomainException } from "../../../domain/exceptions/exceptions";

export const useRegisterUser = () => {
    
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);

    const registerUser = async (formData: any) => {
        setIsLoading(true);
        setError(null);
        setIsSuccess(false);

        if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
            setError("Todos los campos son obligatorios.");
            setIsLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Las contraseñas no coinciden. Revisa lo que escribiste.");
            setIsLoading(false);
            return;
        }

        try {
            const gateway = new RegisterUserGateway();
            const useCase = new RegisterUserUseCase(gateway);
            
            await useCase.execute({
                username: formData.username,
                email: formData.email,
                password: formData.password
            });
            
            setIsSuccess(true);
            
        } catch (err: any) {
            if (err instanceof UserAlreadyExistsError) {
                setError(err.message);
            } else if (err instanceof DomainException) {
                setError(err.message);
            } else {
                setError("Ocurrió un error inesperado al registrar.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return { registerUser, isLoading, error, isSuccess };
};