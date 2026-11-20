"""interface for sending emails."""
from typing import Protocol

class EmailService(Protocol):
    def send_password_change_email(self, to_email: str, reset_token: str) -> None:
        """Sends an email containing the password reset link."""
        ...