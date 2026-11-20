"""Unit tests for the Register User Use Case."""
import pytest
from src.domain.dtos.user_dtos import RegisterUserRequestDTO
from src.domain.exceptions import UserAlreadyExistsError
from src.domain.use_cases.register_user_use_case import RegisterUserUseCase

# --- MOCKS (Dobles de prueba para aislar el dominio) ---

class MockUserRepository:
    """Simulates a database in memory for testing."""
    def __init__(self):
        self.users = []

    def find_by_username(self, username: str):
        """Mock find by username."""
        for user in self.users:
            if user.username == username:
                return user
        return None

    def find_by_email(self, email: str):
        """Mock find by email."""
        for user in self.users:
            if user.email == email:
                return user
        return None

    def save(self, user):
        """Mock save."""
        self.users.append(user)


class MockPasswordHasher:
    """Simulates bcrypt hashing for testing."""
    def hash(self, password: str) -> str:
        """Returns a dummy hash."""
        return f"hashed_{password}"

# --- TESTS ---

def test_register_user_success():
    """Test that a user can register successfully if data is valid."""
    # 1. Preparar (Arrange)
    repo = MockUserRepository()
    hasher = MockPasswordHasher()
    use_case = RegisterUserUseCase(repo, hasher)
    
    dto = RegisterUserRequestDTO(
        username="DinoPlayer",
        email="dino@example.com",
        password="supersecret123"
    )

    # 2. Actuar (Act)
    response = use_case.execute(dto)

    # 3. Comprobar (Assert)
    assert response.username == "DinoPlayer"
    assert response.user_id is not None
    assert len(repo.users) == 1
    assert repo.users[0].password_hash == "hashed_supersecret123"

def test_register_user_fails_if_username_exists():
    """Test that registration fails if the username is already taken."""
    repo = MockUserRepository()
    hasher = MockPasswordHasher()
    use_case = RegisterUserUseCase(repo, hasher)
    
    # Pre-poblamos la base de datos falsa
    use_case.execute(RegisterUserRequestDTO(
        username="DinoPlayer", email="dino1@example.com", password="pwd"
    ))

    # Intentamos registrar el mismo username con otro email
    dto_conflict = RegisterUserRequestDTO(
        username="DinoPlayer", email="dino2@example.com", password="pwd2"
    )

    with pytest.raises(UserAlreadyExistsError) as error_info:
        use_case.execute(dto_conflict)
    
    assert "ya está en uso" in str(error_info.value)

def test_register_user_fails_if_email_exists():
    """Test that registration fails if the email is already taken."""
    repo = MockUserRepository()
    hasher = MockPasswordHasher()
    use_case = RegisterUserUseCase(repo, hasher)
    
    use_case.execute(RegisterUserRequestDTO(
        username="Player1", email="same@example.com", password="pwd"
    ))

    dto_conflict = RegisterUserRequestDTO(
        username="Player2", email="same@example.com", password="pwd2"
    )

    with pytest.raises(UserAlreadyExistsError) as error_info:
        use_case.execute(dto_conflict)
    
    assert "ya está registrado" in str(error_info.value)