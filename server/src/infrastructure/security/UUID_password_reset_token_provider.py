import uuid
from src.domain.interfaces.password_reset_token_provider import PasswordResetTokenProvider

class UuidPasswordResetTokenProvider(PasswordResetTokenProvider):
    def generate_token(self) -> str:
        return str(uuid.uuid4())