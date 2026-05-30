from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/yvradvisory"
    secret_key: str = "dev-secret-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    n8n_webhook_api_key: str = "dev-n8n-key"
    frontend_url: str = "http://localhost:3000"
    environment: str = "development"
    admin_email: str = "admin@yvradvisory.ca"
    admin_password: str = ""

    @property
    def async_database_url(self) -> str:
        url = self.database_url
        # Railway provides postgresql:// — asyncpg requires postgresql+asyncpg://
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        return url


settings = Settings()
