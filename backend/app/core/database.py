from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

import logging

logger = logging.getLogger(__name__)

client = AsyncIOMotorClient(settings.MONGO_URL)
db = client[settings.DB_NAME]

logger.info(f"Connecting to MongoDB at {settings.MONGO_URL}, Database: {settings.DB_NAME}")

async def get_db():
    return db

async def close_db_connection():
    client.close()
