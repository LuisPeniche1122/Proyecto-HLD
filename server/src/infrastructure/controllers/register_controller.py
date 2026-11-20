import traceback
from fastapi import HTTPException, status
from src.domain.dtos.user_dtos import RegisterUserRequestDTO, RegisterUserResponseDTO
from src.domain.exceptions import UserAlreadyExistsError
from src.domain.use_cases.register_user_use_case import RegisterUserUseCase

class RegisterController:
    """Maneja la capa de traducción HTTP para los casos de uso de registro."""

    def __init__(self, register_user_use_case: RegisterUserUseCase):
        self.__register_user_use_case = register_user_use_case

    def register_user(self, request_dto: RegisterUserRequestDTO) -> RegisterUserResponseDTO:
        try:
            return self.__register_user_use_case.execute(request_dto)
            
        except UserAlreadyExistsError as e:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, 
                detail=str(e)
            )
        except Exception as e:
            self._log_critical_error()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail="Error interno del servidor."
            )

    def _log_critical_error(self):
        """Método auxiliar para imprimir errores críticos en la terminal."""
        print("\n" + "🔥"*20)
        print("ERROR CRÍTICO DESCUBIERTO:")
        traceback.print_exc()
        print("🔥"*20 + "\n")