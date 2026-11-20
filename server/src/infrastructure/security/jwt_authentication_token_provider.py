"""JWT implementation for token generation."""
from typing import Any, Dict, Optional

import jwt
import datetime
from src.domain.interfaces.authentication_token_provider import AuthenticationTokenProvider

class JwtAuthenticationTokenProvider(AuthenticationTokenProvider):
    """Generates JSON Web Tokens for user sessions."""

    def __init__(self, secret_key: str, expiration_seconds: int = 86400):
        self.__secret_key = secret_key
        self.__expiration_seconds = expiration_seconds

    def generate_token(self, user_id: str, username: str, is_guest: bool = False) -> str:
        """Creates a signed JWT containing user identity and expiration."""
        
        expiration_time = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(seconds=self.__expiration_seconds)

        # 2. El 'payload' usa directamente las variables que llegaron por los parámetros
        payload = {
            "username": username,           # <- Usamos la variable 'username' directo
            "user_id": user_id,        # <- Usamos la variable 'user_id' directo
            "is_guest": is_guest,      # <- ¡Aquí guardamos el comportamiento diferente!
            "exp": expiration_time 
        }

        token = jwt.encode(payload, self.__secret_key, algorithm="HS256")
        
        return token
    
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Decodes and validates the JWT."""
        try:
            # jwt.decode valida automáticamente la firma y la fecha de expiración ("exp")
            payload = jwt.decode(token, self.__secret_key, algorithms=["HS256"])
            return payload
        except jwt.PyJWTError:
            # Atrapa tokens expirados, firmas inválidas o strings malformados
            return None
    
    @property
    def expiration_seconds(self) -> int:
        """Exposes the expiration time as read-only for the Use Cases."""
        return self.__expiration_seconds