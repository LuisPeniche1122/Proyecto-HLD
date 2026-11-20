import type { RegisterUserRequestDTO, RegisterUserResponseDTO } from "../dtos/user_dtos";
import { DomainException } from "../exceptions/exceptions";
import type { IRegisterUserGateway } from "../interfaces/i_register_user_gateway";

export class RegisterUserUseCase {
    private readonly registerGateway: IRegisterUserGateway;

    // Inyectamos el gateway a través del constructor
    constructor(registerGateway: IRegisterUserGateway) {
        this.registerGateway = registerGateway;
    }

    async execute(request: RegisterUserRequestDTO): Promise<RegisterUserResponseDTO> {
        // --- 1. REGLAS PURAS DEL NEGOCIO Y PARANOIA (Categorías 2 y 3) ---
        
        // Falla rápida defensiva (por si alguien llama al caso de uso saltándose la UI)
        if (!request.username || !request.email || !request.password) {
            throw new DomainException("Faltan datos obligatorios para el registro.");
        }

        // Reglas de formato e integridad
        /*
        if (request.username.length < 8) {
            throw new DomainException("El nombre de usuario debe tener al menos 8 caracteres.");
        }
        */

        if (request.password.length < 8) {
            throw new DomainException("La contraseña debe tener al menos 8 caracteres.");
        }

        if (!/[A-Z]/.test(request.password) || !/[0-9]/.test(request.password)) {
            throw new DomainException("La contraseña debe incluir al menos una mayúscula y un número.");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(request.email)) {
            throw new DomainException("El formato del correo electrónico no es válido.");
        }
        
        return await this.registerGateway.register(request);
    }
}