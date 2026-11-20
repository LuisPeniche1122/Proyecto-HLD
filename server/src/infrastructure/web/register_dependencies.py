"""Fábricas específicas para el flujo de Registro de Usuarios."""
from fastapi import Depends

# Dependencias compartidas
from src.infrastructure.web.core_dependencies import get_user_repository, get_password_hasher

# Caso de Uso y Controlador
from src.domain.use_cases.register_user_use_case import RegisterUserUseCase
from src.infrastructure.controllers.register_controller import RegisterController

def get_register_user_use_case(
    repository = Depends(get_user_repository),
    hasher = Depends(get_password_hasher)
) -> RegisterUserUseCase:
    return RegisterUserUseCase(repository, hasher)

def get_register_controller(
    register_uc = Depends(get_register_user_use_case)
) -> RegisterController:
    return RegisterController(register_user_use_case=register_uc)