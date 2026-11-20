"""Use case for generating a temporary guest session."""
from src.domain.entities.guest_user import GuestUser
from src.domain.dtos.user_dtos import LoginResponseDTO
from src.domain.interfaces.authentication_token_provider import AuthenticationTokenProvider

class LoginGuestUseCase:
    """Handles the creation of temporary guest sessions without DB persistence."""

    def __init__(self, token_provider: AuthenticationTokenProvider):
        # A diferencia del Login, aquí NO inyectamos el repositorio ni el hasher,
        # porque los invitados no tocan la base de datos ni tienen contraseña.
        self.__token_provider = token_provider

    def execute(self) -> LoginResponseDTO:
        # 1. Le pedimos a la Entidad que fabrique un invitado válido
        guest_user = GuestUser.create_random()

        # 2. Emitimos el JWT temporal usando los datos crudos (Desacoplado)
        token = self.__token_provider.generate_token(
            user_id=guest_user.id, 
            username=guest_user .username, 
            is_guest=guest_user.is_guest
        )

        # 3. Retornamos el DTO
        return LoginResponseDTO(
            access_token=token,
            expires_in=self.__token_provider.expiration_seconds,
            username=guest_user.username,
            user_id=guest_user.id
        )