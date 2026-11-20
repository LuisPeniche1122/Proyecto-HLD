"""Interface for password cryptography."""
from typing import Protocol

class PasswordHasher(Protocol):
    """Contract for hashing passwords securely."""

    def hash(self, password: str) -> str:
        """Convert a plain text password into a secure hash."""

    def verify(self, password: str, hashed_password: str) -> bool:
        """Check if the provided password matches the stored hash."""