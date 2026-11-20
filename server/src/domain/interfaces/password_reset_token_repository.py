"""Port for Reset Token persistence."""
from typing import Protocol, Optional
from src.domain.entities.password_reset_token import PasswordResetToken

class PasswordResetTokenRepository(Protocol):
    def save(self, token: PasswordResetToken) -> None:
        """Persists a newly generated reset token."""

    def find_by_token(self, token: str) -> Optional[PasswordResetToken]:
        """Retrieves a token entity by its string representation."""

    def update(self, token: PasswordResetToken) -> None:
        """Updates an existing token's state (e.g., marking it as used)."""