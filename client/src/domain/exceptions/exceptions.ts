/**
 * Domain layer exceptions.
 */

export class DomainException extends Error {
    constructor(message: string) {
        super(message);
        this.name = "DomainException";
    }
}

export class UserAlreadyExistsError extends DomainException {
    constructor(message: string) {
        super(message);
        this.name = "UserAlreadyExistsError";
    }
}

export class InvalidCredentialsError extends DomainException {
    constructor(message: string = "Credenciales inválidas.") {
        super(message);
        this.name = "InvalidCredentialsError";
    }
}

export class InvalidPasswordResetTokenError extends DomainException {
    constructor(message: string = "El enlace de recuperación es inválido, ya fue usado o ha expirado.") {
        super(message);
        this.name = "InvalidTokenError";
    }
}