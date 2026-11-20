"""User entity definition."""
from dataclasses import dataclass
from datetime import datetime

class User:
    """User domain entity representing a registered player."""

    def __init__(self, id: str, username: str, email: str, password_hash: str, created_at: datetime):
        # 3. Por dentro, guardamos los valores en la bóveda privada.
        self.__id = id
        self.__username = username
        self.__email = email
        self.__password_hash = password_hash
        self.__created_at = created_at

    @property
    def id(self) -> str:
        return self.__id

    @property
    def username(self) -> str:
        return self.__username

    @property
    def email(self) -> str:
        return self.__email

    @property
    def password_hash(self) -> str:
        return self.__password_hash

    @property
    def created_at(self) -> datetime:
        return self.__created_at
    
    def update_password(self, new_password_hash: str) -> None:
        """
        unique way to update the user's password hash, ensuring any business rules are enforced.
        """
        # Aquí podrías poner reglas puras de negocio en el futuro, por ejemplo:
        if new_password_hash == self.__password_hash:
            raise ValueError("La nueva contraseña no puede ser igual a la anterior.")
            
        # Si todo está bien, la Entidad se modifica a sí misma
        self.__password_hash = new_password_hash