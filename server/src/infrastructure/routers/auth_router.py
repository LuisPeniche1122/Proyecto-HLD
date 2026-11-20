from fastapi import APIRouter, Depends, status

# Importamos DTOs de dominio
from src.domain.dtos.user_dtos import (
    LoginRequestDTO, LoginResponseDTO,
    AskForPasswordChangeRequestDTO, ApplyNewPasswordRequestDTO
)

# Importamos la dependencia que inyectará nuestro controlador armado
from src.infrastructure.web.auth_dependencies import get_auth_controller
from src.infrastructure.controllers.auth_controller import AuthController

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/login", response_model=LoginResponseDTO, status_code=status.HTTP_200_OK)
def login_user(
    request_dto: LoginRequestDTO,
    controller: AuthController = Depends(get_auth_controller)
):
    """Authenticates a user and returns a session token."""
    return controller.login_user(request_dto)

@router.post("/guest", response_model=LoginResponseDTO, status_code=status.HTTP_201_CREATED)
def login_guest(
    controller: AuthController = Depends(get_auth_controller)
):
    """Endpoint to generate temporary sessions for guest players."""
    return controller.login_guest()

@router.post("/forgot_password", status_code=status.HTTP_200_OK)
def ask_for_password_change(
    request_dto: AskForPasswordChangeRequestDTO,
    controller: AuthController = Depends(get_auth_controller)
):
    """Recibe un email o username y envía un enlace de recuperación."""
    return controller.ask_for_password_change(request_dto)

@router.post("/change_password", status_code=status.HTTP_200_OK)
def apply_new_password(
    request_dto: ApplyNewPasswordRequestDTO,
    controller: AuthController = Depends(get_auth_controller)
):
    """Recibe el token temporal y la nueva contraseña para actualizarla en la base de datos."""
    return controller.apply_new_password(request_dto)