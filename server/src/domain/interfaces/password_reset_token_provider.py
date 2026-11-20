"""Interface for password reset token provider."""

from typing import Protocol
class PasswordResetTokenProvider(Protocol):
    def generate_token(self) -> str:
        """Generates a secure, random string for password resets."""
        ...