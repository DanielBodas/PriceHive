import os
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent.parent.parent
load_dotenv(ROOT_DIR / '.env')

class Settings:
    PROJECT_NAME: str = "PriceHive API"
    MONGO_URL: str = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
    DB_NAME: str = os.environ.get("DB_NAME", "pricehive")
    JWT_SECRET: str = os.environ.get("JWT_SECRET", "pricehive_super_secret_key_2024")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    SESSION_EXPIRY_DAYS: int = 7
    FRONTEND_URL: str = os.environ.get("FRONTEND_URL", "http://localhost:3000").rstrip('/')
    BACKEND_URL: str = os.environ.get("BACKEND_URL", "http://localhost:10000").rstrip('/')
    GOOGLE_CLIENT_ID: str = os.environ.get("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET: str = os.environ.get("GOOGLE_CLIENT_SECRET")

settings = Settings()
