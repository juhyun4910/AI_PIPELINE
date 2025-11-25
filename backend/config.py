from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    # Groq API
    groq_api_key: str = ""

    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True

    # Database
    database_url: str = "sqlite:///./data/pipeline.db"

    # Vector DB
    chroma_persist_dir: str = "./data/chroma"

    # Upload
    upload_dir: str = "./data/uploads"
    max_upload_size: int = 50 * 1024 * 1024  # 50MB

    # CORS
    cors_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
