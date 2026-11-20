import type {RegisterUserRequestDTO, RegisterUserResponseDTO } from "../../domain/dtos/user_dtos";
import { UserAlreadyExistsError, DomainException} from "../../domain/exceptions/exceptions";
import type { IRegisterUserGateway } from "../../domain/interfaces/i_register_user_gateway";

export class RegisterUserGateway implements IRegisterUserGateway {
    private readonly baseUrl: string;

    constructor() {
        // Vite inyecta las variables de entorno de forma segura
        // Usamos un fallback a localhost por si se nos olvida crear el archivo .env
        this.baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
    }

    async register(request: RegisterUserRequestDTO): Promise<RegisterUserResponseDTO> {
        try {
            // 1. Hacemos la llamada HTTP a tu servidor FastAPI
            const response = await fetch(`${this.baseUrl}/register/register_new_user`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(request),
            });

            // 2. Si la respuesta no es 2xx, manejamos el error
            if (!response.ok) {
                // Intentamos extraer el detalle del error que mandó FastAPI
                const errorData = await response.json().catch(() => null);
                const errorMessage = errorData?.detail || "Error desconocido al registrar el usuario.";
                
                if (response.status === 409) {
                    throw new UserAlreadyExistsError(errorMessage);
                }
                
                throw new DomainException(errorMessage);
            }

            // 3. Si todo salió bien, devolvemos el DTO de respuesta
            const data: RegisterUserResponseDTO = await response.json();
            return data;

        } catch (error) {
            // Si el error ya es uno de nuestros errores puros del dominio, lo dejamos pasar
            if (error instanceof DomainException) {
                throw error;
            }
            // Si es un error de red (ej. el servidor de Python está apagado o no hay internet)
            throw new DomainException("Error de conexión con el servidor. Verifica que esté encendido.");
        }
    }
}