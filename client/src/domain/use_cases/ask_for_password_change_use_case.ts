import type { PasswordChangeEmailRequestDTO } from "../dtos/user_dtos";
import { DomainException } from "../exceptions/exceptions";
import type { IAuthUserGateway } from "../interfaces/i_auth_user_gateway";

export class AskForPasswordChangeUseCase {
    private readonly authGateway: IAuthUserGateway;

    // Inyectamos el gateway a través del constructor
    constructor(authGateway: IAuthUserGateway) {
        this.authGateway = authGateway;
    }

    async execute(request: PasswordChangeEmailRequestDTO): Promise<void> {
        // 1. Reglas puras del negocio
        const identifier = request.identifier.trim();
        
        if (!identifier) {
            throw new DomainException("El usuario o correo es obligatorio.");
        }

        // Si parece un intento de correo (tiene un @), validamos su formato básico
        if (identifier.includes("@")) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(identifier)) {
                throw new DomainException("El formato del correo electrónico no es válido.");
            }
        }
        /* por ahora no aplicamos reglas estrictas a los usernames para hacer mas facil las pruebas
         else {
            // Si es un username, podemos aplicar la regla de longitud mínima que use tu juego
            if (identifier.length < 4) {
                throw new DomainException("El nombre de usuario debe tener al menos 3 caracteres.");
            }
        }
        */
        await this.authGateway.askForPasswordChange(request);
    }
}