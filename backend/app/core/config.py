from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/aegisroad"
    ANTHROPIC_API_KEY: str = ""
    HF_SPACE_URL: str = "http://localhost:7860"
    class Config:
        env_file = ".env"

settings = Settings()
