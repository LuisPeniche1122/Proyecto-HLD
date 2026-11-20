"""Use case for authenticating a user."""
from src.domain.dtos.user_dtos import LoginRequestDTO, LoginResponseDTO
from src.domain.exceptions import InvalidCredentialsError
from src.domain.interfaces.password_hasher import PasswordHasher
from src.domain.interfaces.authentication_token_provider import AuthenticationTokenProvider
from src.domain.interfaces.user_repository import UserRepository

class LoginUseCase:
    """Executes the login business logic."""

    def __init__( self, user_repository: UserRepository, password_hasher: PasswordHasher, token_provider: AuthenticationTokenProvider):
        # Inyección de dependencias para mantener la capa limpia
        self.__user_repository = user_repository
        self.__password_hasher = password_hasher
        self.__token_provider = token_provider

    def execute(self, request_dto: LoginRequestDTO) -> LoginResponseDTO:
        """Authenticates a user and returns a session token."""
        
        # 1. Buscamos al usuario por nombre de usuario
        user = self.__user_repository.find_by_username(request_dto.identifier)
        
        # 2. Si no lo encontramos, intentamos buscarlo por correo electrónico
        if not user:
            user = self.__user_repository.find_by_email(request_dto.identifier)

        # 3. Si definitivamente no existe, lanzamos error genérico (CU-02 Paso 6b)
        if not user:
            raise InvalidCredentialsError()

        # 4. Verificamos que la contraseña sea correcta (CU-02 Paso 6c y 6d)
        if not self.__password_hasher.verify(request_dto.password, user.password_hash):
            raise InvalidCredentialsError()

        # 5. Generamos el token de sesión JWT (CU-02 Paso 6e)
        token = self.__token_provider.generate_token(
            user_id=user.id, 
            username=user.username, 
        )

        # 6. Retornamos la respuesta (CU-02 Paso 6f). Asumimos 86400 segundos (24 horas)
        return LoginResponseDTO(
            access_token=token,
            expires_in=self.__token_provider.expiration_seconds,  # 24 horas en segundos
            username=user.username,
            user_id=user.id
        )