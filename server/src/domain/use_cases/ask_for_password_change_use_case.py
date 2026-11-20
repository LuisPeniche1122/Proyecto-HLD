"""Use case for initiating the password change process."""
import datetime
from src.domain.dtos.user_dtos import AskForPasswordChangeRequestDTO
from src.domain.entities.password_reset_token import PasswordResetToken
from src.domain.interfaces.password_reset_token_provider import PasswordResetTokenProvider
from src.domain.interfaces.user_repository import UserRepository
from src.domain.interfaces.password_reset_token_repository import PasswordResetTokenRepository
from src.domain.interfaces.email_service import EmailService

class AskForPasswordChangeUseCase:
    """Coordinates the request phase for resetting a user password."""

    def __init__(
        self,
        user_repository: UserRepository,
        token_repository: PasswordResetTokenRepository,
        token_provider: PasswordResetTokenProvider,
        email_service: EmailService
    ):
        self.__user_repository = user_repository
        self.__token_repository = token_repository
        self.__token_provider = token_provider
        self.__email_service = email_service

    def execute(self, request_dto: AskForPasswordChangeRequestDTO) -> None:
        """Finds the user and fires a reset token via email if found."""
        # 1. Buscamos al usuario por nombre de usuario o correo
        user = self.__user_repository.find_by_username(request_dto.identifier)
        if not user:
            user = self.__user_repository.find_by_email(request_dto.identifier)

        # 2. Protección anti-enumeración: Si no existe, rompemos el flujo en silencio
        if not user:
            return

        # 3. Generamos el token de un solo uso (Válido por 15 minutos en UTC)
        token_str = self.__token_provider.generate_token()
        expires_at = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=15)
        
        reset_token = PasswordResetToken(
            token=token_str,
            user_id=user.id,
            created_at=datetime.datetime.now(datetime.timezone.utc),
            expires_at=expires_at
        )

        # 4. Guardamos el token y delegamos el envío del correo
        self.__token_repository.save(reset_token)
        self.__email_service.send_password_change_email(
            to_email=user.email,
            reset_token=token_str
        )