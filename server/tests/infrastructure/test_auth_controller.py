"""Tests for the authentication HTTP controller."""
from unittest.mock import Mock
from fastapi import FastAPI
from fastapi.testclient import TestClient

from src.infrastructure.controllers.auth_controller import router
from src.infrastructure.web.core_dependencies import get_login_use_case
from src.domain.dtos.user_dtos import LoginResponseDTO
from src.domain.exceptions import InvalidCredentialsError

# Configuramos la app falsa
app = FastAPI()
app.include_router(router)
client = TestClient(app)

def test_login_endpoint_returns_200_on_success():
    """Test that valid credentials return 200 OK and the token."""
    # Preparamos un Caso de Uso falso exitoso
    mock_use_case = Mock()
    mock_use_case.execute.return_value = LoginResponseDTO(
        access_token="real_looking_jwt_token",
        expires_in=86400,
        username="PlayerOne"
    )
    
    # Engañamos a FastAPI
    app.dependency_overrides[get_login_use_case] = lambda: mock_use_case
    
    response = client.post(
        "/api/auth/login",
        json={"identifier": "PlayerOne", "password": "secure_pwd"}
    )
    
    assert response.status_code == 200
    assert response.json()["access_token"] == "real_looking_jwt_token"
    
    app.dependency_overrides.clear()



