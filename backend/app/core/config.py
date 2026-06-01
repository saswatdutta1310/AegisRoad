from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/aegisroad"
    ANTHROPIC_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    HF_SPACE_URL: str = "http://localhost:7860"
    SECRET_KEY: str = "supersecret_jwt_key_for_aegisroad"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    class Config:
        env_file = ".env"

settings = Settings()