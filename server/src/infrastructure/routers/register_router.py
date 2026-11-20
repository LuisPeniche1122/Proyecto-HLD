from fastapi import APIRouter, Depends, status
from src.domain.dtos.user_dtos import RegisterUserRequestDTO, RegisterUserResponseDTO

# Importamos el controlador y su inyector
from src.infrastructure.controllers.register_controller import RegisterController
from src.infrastructure.web.register_dependencies import get_register_controller

router = APIRouter(prefix="/api/register", tags=["Registration"])

@router.post(
    "/register_new_user", 
    response_model=RegisterUserResponseDTO, 
    status_code=status.HTTP_201_CREATED
)
def register_user(
    request_dto: RegisterUserRequestDTO,
    controller: RegisterController = Depends(get_register_controller)
):
    """Endpoint to register a new user."""
    return controller.register_user(request_dto)