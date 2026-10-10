import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "MoodScape API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]
    TMDB_API_KEY: str = os.getenv("TMDB_API_KEY", "")
    DEFAULT_REGION: str = "IN"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
