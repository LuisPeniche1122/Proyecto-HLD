"""Use case for executing the actual password update."""
from src.domain.dtos.user_dtos import ApplyNewPasswordRequestDTO
from src.domain.exceptions import InvalidTokenError
from src.domain.interfaces.user_repository import UserRepository
from src.domain.interfaces.password_reset_token_repository import PasswordResetTokenRepository
from src.domain.interfaces.password_hasher import PasswordHasher

class ResetPasswordUseCase:
    """Validates the reset token and updates the user password."""

    def __init__(
        self,
        user_repository: UserRepository,
        token_repository: PasswordResetTokenRepository,
        password_hasher: PasswordHasher
    ):
        self.__user_repository = user_repository
        self.__token_repository = token_repository
        self.__password_hasher = password_hasher

    def execute(self, request_dto: ApplyNewPasswordRequestDTO) -> None:
        """Validates token parameters and updates user credential hash."""
        # 1. Buscamos el token en su almacén
        reset_token = self.__token_repository.find_by_token(request_dto.token)
        
        # 2. Validamos que el token sea completamente apto
        if not reset_token or reset_token.is_expired() or reset_token.is_used:
            raise InvalidTokenError()

        # 3. Localizamos al usuario dueño de la sesión de cambio
        user = self.__user_repository.find_by_id(reset_token.user_id)
        if not user:
            raise InvalidTokenError()

        # 4. Encriptamos la nueva contraseña recibida en texto plano
        new_hash = self.__password_hasher.hash(request_dto.new_password)

        # 5. Modificamos la entidad mediante su acción de negocio
        user.update_password(new_hash)

        # 6. Guardamos los cambios de ambas entidades de dominio
        self.__user_repository.update(user)
        
        reset_token.mark_as_used()
        self.__token_repository.update(reset_token)