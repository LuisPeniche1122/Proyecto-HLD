"""Fábricas compartidas para infraestructura base (Bases de datos, Seguridad, Servicios)."""
import os

# Interfaces
from src.domain.interfaces.user_repository import UserRepository
from src.domain.interfaces.password_hasher import PasswordHasher
from src.domain.interfaces.authentication_token_provider import AuthenticationTokenProvider
from src.domain.interfaces.email_service import EmailService
from src.domain.interfaces.room_repository import RoomRepository

# Implementaciones
from src.infrastructure.repositories.in_memory_room_repository import InMemoryRoomRepository
from src.infrastructure.repositories.in_doc_user_repository import InDocUserRepository
from src.infrastructure.repositories.in_memory_game_repository import InMemoryGameRepository
from src.infrastructure.security.bcrypt_password_hasher import BcryptPasswordHasher
from src.infrastructure.security.jwt_authentication_token_provider import JwtAuthenticationTokenProvider
from src.infrastructure.services.console_email_service import ConsoleEmailService


__in_memory_room_repository_instance = None
__in_memory_game_repository_instance = InMemoryGameRepository()

def get_room_repository() -> RoomRepository:
    global __in_memory_room_repository_instance
    if __in_memory_room_repository_instance is None:
        # ¡Magia pura! Usamos el get_user_repository() que ya vive en este mismo archivo
        __in_memory_room_repository_instance = InMemoryRoomRepository()
    return __in_memory_room_repository_instance

def get_game_repository() -> InMemoryGameRepository:
    return __in_memory_game_repository_instance

def get_user_repository() -> UserRepository:
    return InDocUserRepository()

def get_password_hasher() -> PasswordHasher:
    return BcryptPasswordHasher()

def get_token_provider() -> AuthenticationTokenProvider:
    secret_key = os.getenv("JWT_SECRET_KEY", "default_insecure_key")
    return JwtAuthenticationTokenProvider(secret_key=secret_key)

def get_email_service() -> EmailService:
    return ConsoleEmailService()