/**
 * Data Transfer Objects for User operations.
 * Mantiene la paridad exacta con src/domain/dtos/user_dtos.py del servidor.
 */

export interface RegisterUserRequestDTO {
    username: string;
    email: string;
    password: string; // Enviamos el texto plano; el túnel TLS y el servidor se encargan del hash.
}

export interface RegisterUserResponseDTO {
    user_id: string;
    username: string;
}

export interface LoginRequestDTO {
    identifier: string;
    password: string;
}

export interface LoginResponseDTO {
    access_token: string;
    expires_in: number;
    username: string;
    user_id: string;
}

export interface PasswordChangeEmailRequestDTO {
    identifier: string;
}

export interface ChangePasswordRequestDTO {
    token: string;
    new_password: string;
}