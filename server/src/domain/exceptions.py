"""Domain layer exceptions."""

class DomainException(Exception):
    """Base class for all domain exceptions."""

class UserAlreadyExistsError(DomainException):
    """Raised when attempting to register a user with an existing email or username."""
    def __init__(self, message: str = "El usuario o correo ya está en uso."):
        super().__init__(message)

class InvalidCredentialsError(Exception):
    """Exception raised when login credentials do not match any registered user."""
    def __init__(self, message: str = "Credenciales inválidas."):
        # El mensaje genérico previene que atacantes sepan si el usuario existe o no
        super().__init__(message)

class InvalidTokenError(DomainException):
    """Raised when a password reset token is expired, used, or non-existent."""
    def __init__(self, message: str = "El enlace de recuperación es inválido o ha expirado."):
        super().__init__(message)

class RoomFullError(DomainException):
    """Raised when trying to join a room that has reached its player limit."""
    def __init__(self, message: str = "La sala está llena. Intenta con otra sala"):
        super().__init__(message)

class RoomNotFoundError(DomainException):
    """Raised when a room with the specified code does not exist."""
    def __init__(self, message: str = "La sala no existe o ya fue cerrada."):
        super().__init__(message)

class UserNotHostError(DomainException):
    """Raised when a non-host user tries to perform a host-only action."""
    def __init__(self, message: str = "Solo el host puede realizar esta acción."):
        super().__init__(message)

class UserNotInRoomError(DomainException):
    """Raised when a user tries to perform an action in a room they are not part of."""
    def __init__(self, message: str = "El jugador no se encuentra en esta sala."):
        super().__init__(message)
    
class UserNotFoundError(DomainException):
    """Raised when a user with the specified ID does not exist."""
    def __init__(self, message: str = "El usuario no existe."):
        super().__init__(message)

class UserAlreadyInRoomError(DomainException):
    """Raised when a user tries to join a room they are already in."""
    def __init__(self, message: str = "Ya perteneces a esta sala."):
        super().__init__(message)