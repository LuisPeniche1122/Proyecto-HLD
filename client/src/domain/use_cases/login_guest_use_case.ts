import type { LoginResponseDTO } from "../dtos/user_dtos";
import type { IAuthUserGateway } from "../interfaces/i_auth_user_gateway";

export class LoginGuestUseCase {
    private readonly authGateway: IAuthUserGateway;

    constructor(authGateway: IAuthUserGateway) {
        this.authGateway = authGateway;
    }

    async execute(): Promise<LoginResponseDTO> {
        // Los invitados no requieren validaciones porque el servidor genera todo
        return await this.authGateway.loginGuest();
    }
}