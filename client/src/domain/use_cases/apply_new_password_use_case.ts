import type { ChangePasswordRequestDTO} from "../dtos/user_dtos";
import { DomainException } from "../exceptions/exceptions";
import type { IAuthUserGateway } from "../interfaces/i_auth_user_gateway";

export class ApplyNewPasswordUseCase {
    private readonly authGateway: IAuthUserGateway;

    // Inyectamos el gateway a través del constructor
    constructor(authGateway: IAuthUserGateway) {
        this.authGateway = authGateway;
    }

    async execute(request: ChangePasswordRequestDTO): Promise<void> {
        if (!request.token) {
            throw new DomainException("El token de seguridad no existe.");
        }

        if (request.new_password.length < 8) {
            throw new DomainException("La nueva contraseña debe tener al menos 8 caracteres.");
        }

        if (!/[A-Z]/.test(request.new_password) || !/[0-9]/.test(request.new_password)) {
            throw new DomainException("La contraseña debe incluir al menos una mayúscula y un número.");
        }

        // 2. Ejecución
        await this.authGateway.changePassword(request);
    }
}