import type { LoginRequestDTO, LoginResponseDTO} from "../../domain/dtos/user_dtos";
import type {ChangePasswordRequestDTO, PasswordChangeEmailRequestDTO} from "../../domain/dtos/user_dtos";
import {InvalidCredentialsError, InvalidPasswordResetTokenError, DomainException} from "../../domain/exceptions/exceptions";
import type { IAuthUserGateway } from "../../domain/interfaces/i_auth_user_gateway";

export class AuthUserGateway implements IAuthUserGateway {
    private readonly baseUrl: string;

    constructor() {
        // Vite inyecta las variables de entorno de forma segura
        // Usamos un fallback a localhost por si se nos olvida crear el archivo .env
        this.baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
    }

    async login(request: LoginRequestDTO): Promise<LoginResponseDTO> {
        try {
            // 1. Apuntamos a la ruta exacta de tu auth_router en FastAPI
            const response = await fetch(`${this.baseUrl}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(request),
            });

            // 2. Manejo de errores HTTP
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                const errorMessage = errorData?.detail || "Error desconocido al iniciar sesión.";
                
                // Si FastAPI devuelve 401, lanzamos nuestro error de dominio
                if (response.status === 401) {
                    throw new InvalidCredentialsError(errorMessage);
                }
                
                throw new DomainException(errorMessage);
            }

            // 3. Desempaquetamos el DTO de respuesta con el JWT
            const data: LoginResponseDTO = await response.json();
            return data;

        } catch (error) {
            if (error instanceof DomainException) {
                throw error;
            }
            throw new DomainException("Error de conexión con el servidor. Verifica que esté encendido.");
        }
    }

    async loginGuest(): Promise<LoginResponseDTO> {
        try {
            // 1. Apuntamos a la nueva ruta de invitados en tu FastAPI
            const response = await fetch(`${this.baseUrl}/auth/guest`, {
                method: "POST"
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                const errorMessage = errorData?.detail || "Error al generar sesión temporal.";
                throw new DomainException(errorMessage);
            }

            // 2. Desempaquetamos el DTO
            const data: LoginResponseDTO = await response.json();
            return data;

        } catch (error) {
            if (error instanceof DomainException) {
                throw error;
            }
            throw new DomainException("Error de conexión con el servidor. Verifica que esté encendido.");
        }
    }

    async askForPasswordChange(request: PasswordChangeEmailRequestDTO): Promise<void> {
        try {
            // Apuntamos al endpoint exacto que definiste en tu router de FastAPI
            const response = await fetch(`${this.baseUrl}/auth/forgot_password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                const errorMessage = errorData?.detail || "Error al procesar la solicitud de cambio de contraseña.";
                throw new DomainException(errorMessage);
            }
            
            // Como el backend devuelve un 200 OK genérico con un mensaje, 
            // y nuestra interfaz dice Promise<void>, no necesitamos retornar nada.

        } catch (error) {
            if (error instanceof DomainException) {
                throw error;
            }
            throw new DomainException("Error de conexión con el servidor. Verifica que esté encendido.");
        }
    }

    async changePassword(request: ChangePasswordRequestDTO): Promise<void> {
        try {
            const response = await fetch(`${this.baseUrl}/auth/change_password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                const errorMessage = errorData?.detail || "Error desconocido al cambiar la contraseña.";
                
                if (response.status === 401) {
                    throw new InvalidPasswordResetTokenError(errorMessage);
                }
                
                throw new DomainException(errorMessage);
            }

        } catch (error) {
            if (error instanceof DomainException) {
                throw error;
            }
            throw new DomainException("Error de conexión con el servidor. Verifica que esté encendido.");
        }
    }
}