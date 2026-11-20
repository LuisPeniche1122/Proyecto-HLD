"""Fábricas específicas para el flujo de Autenticación y Recuperación de Contraseñas."""
from fastapi import Depends

# Interfaces e Implementaciones exclusivas de Auth
from src.domain.interfaces.password_reset_token_provider import PasswordResetTokenProvider
from src.domain.interfaces.password_reset_token_repository import PasswordResetTokenRepository
from src.infrastructure.security.UUID_password_reset_token_provider import UuidPasswordResetTokenProvider
from src.infrastructure.repositories.in_doc_password_reset_token_repository import InDocPasswordResetTokenRepository

# Dependencias compartidas
from src.infrastructure.web.core_dependencies import (
    get_user_repository, get_password_hasher, get_token_provider, get_email_service
)

# Casos de Uso y Controlador
from src.domain.use_cases.login_use_case import LoginUseCase
from src.domain.use_cases.login_guest_use_case import LoginGuestUseCase
from src.domain.use_cases.ask_for_password_change_use_case import AskForPasswordChangeUseCase
from src.domain.use_cases.apply_new_password_use_case import ResetPasswordUseCase
from src.infrastructure.controllers.auth_controller import AuthController

# --- FÁBRICAS LOCALES ---
def get_password_reset_token_provider() -> PasswordResetTokenProvider:
    return UuidPasswordResetTokenProvider()

def get_password_reset_token_repository() -> PasswordResetTokenRepository:
    return InDocPasswordResetTokenRepository()

# --- CASOS DE USO ---
def get_login_use_case(
    repository = Depends(get_user_repository),
    hasher = Depends(get_password_hasher),
    token_provider = Depends(get_token_provider)
) -> LoginUseCase:
    return LoginUseCase(repository, hasher, token_provider)

def get_login_guest_use_case(
    token_provider = Depends(get_token_provider)
) -> LoginGuestUseCase:
    return LoginGuestUseCase(token_provider)

def get_ask_for_password_change_use_case(
    repository = Depends(get_user_repository),
    email_service = Depends(get_email_service),
    token_repository = Depends(get_password_reset_token_repository),
    token_provider = Depends(get_password_reset_token_provider)
) -> AskForPasswordChangeUseCase:
    return AskForPasswordChangeUseCase(
        user_repository=repository,
        token_repository=token_repository,
        token_provider=token_provider,
        email_service=email_service
    )

def get_change_password_use_case(
    repository = Depends(get_user_repository),
    hasher = Depends(get_password_hasher),
    token_repository = Depends(get_password_reset_token_repository)
) -> ResetPasswordUseCase:
    return ResetPasswordUseCase(
        user_repository=repository, 
        token_repository=token_repository, 
        password_hasher=hasher 
    )

# --- CONTROLADOR ---
def get_auth_controller(
    login_uc = Depends(get_login_use_case),
    guest_uc = Depends(get_login_guest_use_case),
    ask_uc = Depends(get_ask_for_password_change_use_case),
    apply_uc = Depends(get_change_password_use_case)
) -> AuthController:
    return AuthController(
        login_use_case=login_uc,
        login_guest_use_case=guest_uc,
        ask_for_password_change_use_case=ask_uc,
        apply_new_password_use_case=apply_uc
    )