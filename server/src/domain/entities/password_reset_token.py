"""Password Reset Token entity."""
import datetime

class PasswordResetToken:
    """Domain entity representing a temporary password reset token."""

    def __init__(self, token: str, user_id: str, expires_at: datetime.datetime, created_at: datetime.datetime,  is_used: bool = False):
        self.__token = token
        self.__user_id = user_id
        self.__expires_at = expires_at
        self.__created_at = created_at
        self.__is_used = is_used

    # --- GETTERS ---
    @property
    def token(self) -> str:
        return self.__token

    @property
    def user_id(self) -> str:
        return self.__user_id

    @property
    def expires_at(self) -> datetime.datetime:
        return self.__expires_at

    @property
    def created_at(self) -> datetime.datetime:
        return self.__created_at

    @property
    def is_used(self) -> bool:
        return self.__is_used

    # --- REGLAS DE NEGOCIO ---
    def is_expired(self) -> bool:
        """Checks if the current UTC time has passed the token's expiration."""
        ahora = datetime.datetime.now(datetime.timezone.utc)
        return ahora > self.__expires_at

    def mark_as_used(self) -> None:
        """Invalidates the token so it cannot be reused."""
        if self.__is_used:
            raise ValueError("Este token ya ha sido utilizado.")
        self.__is_used = True