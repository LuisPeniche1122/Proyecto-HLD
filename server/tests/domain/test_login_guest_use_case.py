"""Unit tests for the Login Guest Use Case."""
from src.domain.dtos.user_dtos import GuestLoginResponseDTO
from src.domain.use_cases.login_guest_use_case import LoginGuestUseCase

# --- MOCK ---
class MockTokenProvider:
    """Simula el proveedor de JWT para evitar la criptografía real en los tests unitarios."""
    def generate_token(self, user_id: str, username: str, is_guest: bool = False) -> str:
        # Devolvemos un token falso que contiene los datos para verificar que llegaron bien
        return f"fake_token_{username}_{is_guest}"

# --- TESTS ---
def test_login_guest_use_case_success():
    """Test successful guest session creation and DTO mapping."""
    # 1. Preparar
    mock_provider = MockTokenProvider()
    use_case = LoginGuestUseCase(mock_provider)

    # 2. Actuar
    response = use_case.execute()

    # 3. Comprobar
    assert isinstance(response, GuestLoginResponseDTO)
    assert response.expires_in == 86400
    assert response.username is not None
    
    # Verificamos que el token se generó con los datos correctos y la bandera is_guest en True
    assert "fake_token_" in response.access_token
    assert "_True" in response.access_token
    assert response.username in response.access_token