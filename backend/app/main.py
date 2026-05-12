from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
import logging
from .core.config import settings
from .core.database import close_db_connection
from .routers import auth, admin, prices, shopping_lists, social, analytics, search, public, user_features, community
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.PROJECT_NAME)
app.state.limiter = auth.limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Middleware
origins = settings.CORS_ORIGINS.split(",") if settings.CORS_ORIGINS else []
if settings.FRONTEND_URL not in origins:
    origins.append(settings.FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    expose_headers=["Content-Type", "Authorization", "X-Requested-With"],
)

@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; "
        "connect-src 'self' https://accounts.google.com;"
    )
    return response

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
app.include_router(community.router, prefix="/api")

@app.on_event("shutdown")
async def shutdown_event():
    await close_db_connection()

@app.get("/")
async def root():
    return {"message": "Welcome to PriceHive API"}
