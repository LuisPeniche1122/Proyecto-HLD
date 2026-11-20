"""Bcrypt implementation for password hashing."""
import bcrypt
from src.domain.interfaces.password_hasher import PasswordHasher

class BcryptPasswordHasher(PasswordHasher):
    """Real implementation of the PasswordHasher interface using bcrypt."""

    def hash(self, password: str) -> str:
        """Hashes a password with a generated salt."""
        # Convertimos el string a bytes, lo encriptamos y lo regresamos como string
        pwd_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(pwd_bytes, salt)
        return hashed_password.decode('utf-8')
    
    def verify(self, password: str, hashed_password: str) -> bool:
        """Checks if the provided password matches the stored bcrypt hash."""
        # Bcrypt requiere que todo esté en bytes antes de comparar
        return bcrypt.checkpw(
            password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    
    