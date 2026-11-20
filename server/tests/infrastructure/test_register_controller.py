"""Integration tests for the authentication controller."""
from fastapi import FastAPI
from fastapi.testclient import TestClient
from src.infrastructure.controllers.register_controller import router

# Creamos una aplicación FastAPI efímera solo para montar el router y probarlo
app = FastAPI()
app.include_router(router)

# El TestClient se encargará de hacer las peticiones simuladas
client = TestClient(app)

def test_register_user_endpoint_success():
    """Test that the register endpoint returns 201 and the correct JSON structure."""
    # Arrange
    payload = {
        "username": "infra_dino_test",
        "email": "infra@dino.com",
        "password": "password_seguro_123"
    }

    # Act
    response = client.post("/api/register/register_new_user", json=payload)

    # Assert
    assert response.status_code == 201
    json_data = response.json()
    assert json_data["username"] == "infra_dino_test"
    assert "user_id" in json_data


def test_register_user_endpoint_duplicate_conflict():
    """Test that registering an existing username returns a 409 Conflict error."""
    # Arrange
    payload = {
        "username": "infra_dino_test",  # Mismo username del test anterior (el repositorio en memoria retiene el estado)
        "email": "otro_email@dino.com",
        "password": "otra_password"
    }

    # Act
    response = client.post("/api/register/register_new_user", json=payload)

    # Assert
    assert response.status_code == 409
    assert "ya está en uso" in response.json()["detail"]