import traceback
from fastapi import HTTPException, status

# Importamos DTOs y Excepciones
from src.domain.dtos.user_dtos import (
    LoginRequestDTO, LoginResponseDTO,
    AskForPasswordChangeRequestDTO, ApplyNewPasswordRequestDTO
)
from src.domain.exceptions import (
    DomainException, InvalidCredentialsError, InvalidTokenError
)

# Importamos los tipos de los Casos de Uso para el tipado estricto
from src.domain.use_cases.login_use_case import LoginUseCase
from src.domain.use_cases.login_guest_use_case import LoginGuestUseCase
from src.domain.use_cases.ask_for_password_change_use_case import AskForPasswordChangeUseCase
from src.domain.use_cases.apply_new_password_use_case import ResetPasswordUseCase


class AuthController:
    """Handles the HTTP translation layer for authentication use cases."""

    def __init__(
        self,
        login_use_case: LoginUseCase,
        login_guest_use_case: LoginGuestUseCase,
        ask_for_password_change_use_case: AskForPasswordChangeUseCase,
        apply_new_password_use_case: ResetPasswordUseCase
    ):
        self.__login_use_case = login_use_case
        self.__login_guest_use_case = login_guest_use_case
        self.__ask_for_password_change_use_case = ask_for_password_change_use_case
        self.__apply_new_password_use_case = apply_new_password_use_case

    def login_user(self, request_dto: LoginRequestDTO) -> LoginResponseDTO:
        try:
            return self.__login_use_case.execute(request_dto)
        except InvalidCredentialsError as e:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
        except Exception as e:
            self._log_critical_error()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error interno del servidor.")

    def login_guest(self) -> LoginResponseDTO:
        # Los invitados no requieren validaciones de credenciales ni body
        return self.__login_guest_use_case.execute()

    def ask_for_password_change(self, request_dto: AskForPasswordChangeRequestDTO) -> dict:
        try:
            self.__ask_for_password_change_use_case.execute(request_dto)
            return {"message": "Si el usuario existe, se ha enviado un enlace de recuperación a su correo electrónico."}
        except DomainException as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
        except Exception as e:
            self._log_critical_error()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error interno del servidor.")

    def apply_new_password(self, request_dto: ApplyNewPasswordRequestDTO) -> dict:
        try:
            self.__apply_new_password_use_case.execute(request_dto)
            return {"message": "Tu contraseña ha sido actualizada con éxito."}
        except InvalidTokenError as e:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
        except DomainException as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
        except Exception as e:
            self._log_critical_error()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error interno del servidor.")

    def _log_critical_error(self):
        """Helper method to keep the traceback logging clean and reusable."""
        print("\n" + "🔥"*20)
        print("ERROR CRÍTICO DESCUBIERTO:")
        traceback.print_exc()
        print("🔥"*20 + "\n")