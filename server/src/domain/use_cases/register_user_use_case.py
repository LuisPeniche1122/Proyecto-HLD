"""Use case for registering a new user."""
import uuid
from datetime import datetime, timezone

from src.domain.dtos.user_dtos import RegisterUserRequestDTO, RegisterUserResponseDTO
from src.domain.entities.user import User
from src.domain.interfaces.user_repository import UserRepository
from src.domain.interfaces.password_hasher import PasswordHasher
from src.domain.exceptions import UserAlreadyExistsError

class RegisterUserUseCase:
    """Orchestrates the business rules for user registration."""

    def __init__(self, user_repository: UserRepository, password_hasher: PasswordHasher):
        self.__user_repository = user_repository
        self.__password_hasher = password_hasher

    def execute(self, dto: RegisterUserRequestDTO) -> RegisterUserResponseDTO:
        """
        Executes the registration process.
        Raises UserAlreadyExistsError if validation fails.
        """
        if self.__user_repository.find_by_username(dto.username):
            raise UserAlreadyExistsError(f"El usuario '{dto.username}' ya está en uso.")

        if self.__user_repository.find_by_email(dto.email):
            raise UserAlreadyExistsError(f"El correo '{dto.email}' ya está registrado.")

        hashed_pwd = self.__password_hasher.hash(dto.password)
        new_id = str(uuid.uuid4())

        new_user = User(
            id=new_id,
            username=dto.username,
            email=dto.email,
            password_hash=hashed_pwd,
            created_at=datetime.now(timezone.utc)
        )

        self.__user_repository.save(new_user)

        return RegisterUserResponseDTO(user_id=new_user.id, username=new_user.username)