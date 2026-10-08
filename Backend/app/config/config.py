from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )

    OPENAI_API_KEY: str
    DATABASE_URL: str

    TAVILY_API_KEY: str

    secret_key: SecretStr
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 90


settings = Settings()
