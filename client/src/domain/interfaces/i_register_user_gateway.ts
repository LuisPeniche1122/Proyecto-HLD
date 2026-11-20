import type {RegisterUserRequestDTO, RegisterUserResponseDTO} from "../dtos/user_dtos";

/**
 * Contrato que cualquier adaptador de red debe cumplir para gestionar el registro de usuarios.
 */
export interface IRegisterUserGateway {
    register(request: RegisterUserRequestDTO): Promise<RegisterUserResponseDTO>;
}