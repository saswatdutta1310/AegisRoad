from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/aegisroad"
    ANTHROPIC_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    HF_SPACE_URL: str = "http://localhost:7860"
    SECRET_KEY: str = "supersecret_jwt_key_for_aegisroad"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    # Avalanche Fuji — Proof of Repair blockchain
    AVALANCHE_RPC_URL: str = "https://api.avax-test.network/ext/bc/C/rpc"
    CONTRACT_ADDRESS: str = ""
    PRIVATE_KEY: str = ""
    CONTRACT_ABI: str = "[]"

    class Config:
        env_file = ".env"

settings = Settings()