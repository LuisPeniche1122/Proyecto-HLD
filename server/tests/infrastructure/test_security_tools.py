"""Integration tests for real security implementations."""
import jwt
from datetime import datetime, timezone
from src.domain.entities.user import User
from src.infrastructure.security.bcrypt_password_hasher import BcryptPasswordHasher
from src.infrastructure.security.jwt_authentication_token_provider import JwtAuthenticationTokenProvider

def test_bcrypt_hashes_and_verifies_correctly():
    """Test that Bcrypt actually hashes passwords and verifies them."""
    hasher = BcryptPasswordHasher()
    plain_password = "dinosaur_password_123"
    
    # Comprobamos que encripte
    hashed = hasher.hash(plain_password)
    assert hashed != plain_password
    assert hashed.startswith("$2b$") # Firma estándar de Bcrypt
    
    # Comprobamos la verificación exitosa
    is_valid = hasher.verify(plain_password, hashed)
    assert is_valid is True
    
    # Comprobamos el rechazo de contraseñas falsas
    is_invalid = hasher.verify("wrong_password", hashed)
    assert is_invalid is False

def test_jwt_provider_generates_valid_token():
    """Test that the JWT provider creates a decodable token with correct payload."""
    secret = "esta_llave_falsa_es_muy_larga_para_que_pyjwt_no_se_queje_32_bytes"
    provider = JwtAuthenticationTokenProvider(secret_key=secret, expiration_seconds=3600)
    
    # ¡Mucho más limpio! Solo le pasamos los datos que necesita
    token = provider.generate_token(user_id="guest_123", username="DinoFeroz", is_guest=True)
    
    assert isinstance(token, str)
    assert len(token.split(".")) == 3
    
    decoded_payload = jwt.decode(token, secret, algorithms=["HS256"])
    
    assert decoded_payload["sub"] == "DinoFeroz"
    assert decoded_payload["user_id"] == "guest_123"
    assert decoded_payload["is_guest"] is True  # Verificamos que guardó la bandera
    assert "exp" in decoded_payload