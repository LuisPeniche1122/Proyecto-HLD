import type { ChangePasswordRequestDTO, PasswordChangeEmailRequestDTO} from "../dtos/user_dtos";
import type { LoginRequestDTO, LoginResponseDTO } from "../dtos/user_dtos";

/**
 * Contrato que cualquier adaptador de red debe cumplir para gestionar la autorización de usuarios.
 */
export interface IAuthUserGateway {
    login(request: LoginRequestDTO): Promise<LoginResponseDTO>;
    loginGuest(): Promise<LoginResponseDTO>;
    askForPasswordChange(request: PasswordChangeEmailRequestDTO): Promise<void>;
    changePassword(request: ChangePasswordRequestDTO): Promise<void>;
}