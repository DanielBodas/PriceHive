import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent.parent.parent
load_dotenv(ROOT_DIR / '.env')

class Settings:
    PROJECT_NAME: str = "PriceHive API"
    ENVIRONMENT: str = os.environ.get("ENVIRONMENT", "development")
    MONGO_URL: str = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
    DB_NAME: str = os.environ.get("DB_NAME", "pricehive")
    JWT_SECRET: Optional[str] = os.environ.get("JWT_SECRET")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    SESSION_EXPIRY_DAYS: int = 7
    FRONTEND_URL: str = os.environ.get("FRONTEND_URL", "http://localhost:3000").rstrip('/')
    BACKEND_URL: str = os.environ.get("BACKEND_URL", "http://localhost:10000").rstrip('/')
    GOOGLE_CLIENT_ID: str = os.environ.get("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET: str = os.environ.get("GOOGLE_CLIENT_SECRET")

settings = Settings()

# Security Check: Enforce JWT_SECRET in production
if settings.ENVIRONMENT == "production" and not settings.JWT_SECRET:
    raise ValueError("JWT_SECRET environment variable must be set in production mode")

# Safe default for development only
if not settings.JWT_SECRET:
    settings.JWT_SECRET = "pricehive_dev_secret_key_change_me_in_prod"
