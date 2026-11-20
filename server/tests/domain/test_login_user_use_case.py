"""Unit tests for the Login User Use Case."""
import pytest
from datetime import datetime, timezone
from src.domain.dtos.user_dtos import LoginRequestDTO
from src.domain.entities.user import User
from src.domain.exceptions import InvalidCredentialsError
from src.domain.use_cases.login_use_case import LoginUseCase

# --- MOCKS (Herramientas falsas para aislar el cerebro) ---

class MockUserRepository:
    def __init__(self):
        # Simulamos un usuario que ya existe en la base de datos
        self.mock_user = User(
            id="123", 
            username="DinoPro", 
            email="dino@test.com", 
            password_hash="hashed_secret",
            created_at=datetime.now(timezone.utc)
        )

    def find_by_username(self, username: str):
        if username == "DinoPro":
            return self.mock_user
        return None

    def find_by_email(self, email: str):
        if email == "dino@test.com":
            return self.mock_user
        return None

class MockPasswordHasher:
    def verify(self, plain_password: str, hashed_password: str) -> bool:
        # Solo acepta esta contraseña específica para simular un match exitoso
        return plain_password == "correct_password" and hashed_password == "hashed_secret"

class MockTokenProvider:
    def generate_token(self, user: User) -> str:
        return f"fake_token_for_{user.username}"

# --- TESTS ---

def test_login_user_success_with_username():
    """Test successful login using username."""
    # 1. Preparar
    use_case = LoginUseCase(MockUserRepository(), MockPasswordHasher(), MockTokenProvider())
    dto = LoginRequestDTO(identifier="DinoPro", password="correct_password")

    # 2. Actuar
    response = use_case.execute(dto)

    # 3. Comprobar
    assert response.access_token == "fake_token_for_DinoPro"
    assert response.username == "DinoPro"
    assert response.expires_in == 86400

def test_login_user_success_with_email():
    """Test successful login using email."""
    use_case = LoginUseCase(MockUserRepository(), MockPasswordHasher(), MockTokenProvider())
    dto = LoginRequestDTO(identifier="dino@test.com", password="correct_password")

    response = use_case.execute(dto)

    assert response.access_token == "fake_token_for_DinoPro"

def test_login_fails_if_user_not_found():
    """Test that login fails with generic error if user does not exist."""
    use_case = LoginUseCase(MockUserRepository(), MockPasswordHasher(), MockTokenProvider())
    dto = LoginRequestDTO(identifier="GhostUser", password="correct_password")

    # Verificamos que lance el error de credenciales inválidas (para no revelar que no existe)
    with pytest.raises(InvalidCredentialsError) as error_info:
        use_case.execute(dto)
    
    assert "Credenciales" in str(error_info.value)

def test_login_fails_if_password_is_incorrect():
    """Test that login fails with generic error if password doesn't match."""
    use_case = LoginUseCase(MockUserRepository(), MockPasswordHasher(), MockTokenProvider())
    dto = LoginRequestDTO(identifier="DinoPro", password="wrong_password")

    with pytest.raises(InvalidCredentialsError):
        use_case.execute(dto)