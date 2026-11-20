export class DomainException extends Error {
    constructor(message: string) {
        super(message);
        this.name = "DomainException";
    }
}

export class FetchRoomsError extends DomainException {
    constructor(message: string = "No se pudo conectar con el servidor de salas. Revisa tu conexión.") {
        super(message);
        this.name = "FetchRoomsError";
    }
}