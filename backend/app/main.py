from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
import logging
from .core.config import settings
from .core.database import close_db_connection
from .routers import auth, admin, prices, shopping_lists, social, analytics, search, public, user_features

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.PROJECT_NAME)

# CORS Middleware
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    settings.FRONTEND_URL,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(prices.router, prefix="/api")
app.include_router(shopping_lists.router, prefix="/api")
app.include_router(social.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(search.router, prefix="/api")
app.include_router(public.router, prefix="/api")
app.include_router(user_features.router, prefix="/api")

@app.on_event("shutdown")
async def shutdown_event():
    await close_db_connection()

@app.get("/")
async def root():
    return {"message": "Welcome to PriceHive API"}
