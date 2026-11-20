import type { LoginRequestDTO, LoginResponseDTO } from "../dtos/user_dtos";
import { DomainException } from "../exceptions/exceptions";
import type { IAuthUserGateway } from "../interfaces/i_auth_user_gateway";

export class LoginUseCase {
    private readonly authGateway: IAuthUserGateway;

    constructor(authGateway: IAuthUserGateway) {
        this.authGateway = authGateway;
    }

    async execute(request: LoginRequestDTO): Promise<LoginResponseDTO> {

        if (!request.identifier || !request.password) {
            throw new DomainException("Faltan credenciales para iniciar sesión.");
        }

        return await this.authGateway.login(request);
    }
}