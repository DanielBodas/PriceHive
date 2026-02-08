from fastapi import APIRouter, HTTPException, Depends, Request, Response
from fastapi.responses import RedirectResponse
import httpx
import uuid
import logging
from datetime import datetime, timezone, timedelta
from ..core.config import settings
from ..core.database import db
from ..core.auth import hash_password, verify_password, create_token, get_current_user, add_points
from ..models.user import UserCreate, UserLogin, UserResponse, TokenResponse, GoogleSessionRequest

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger(__name__)

@router.get("/google")
async def auth_google():
    client_id = settings.GOOGLE_CLIENT_ID
    redirect_uri = f"{settings.BACKEND_URL}/api/auth/google/callback"

    google_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={client_id}&"
        f"redirect_uri={redirect_uri}&"
        f"response_type=code&"
        f"scope=openid%20email%20profile&"
        f"access_type=offline&"
        f"prompt=select_account"
    )
    return RedirectResponse(url=google_url)

@router.get("/google/callback")
async def auth_google_callback(code: str, response: Response):
    client_id = settings.GOOGLE_CLIENT_ID
    client_secret = settings.GOOGLE_CLIENT_SECRET
    redirect_uri = f"{settings.BACKEND_URL}/api/auth/google/callback"

    async with httpx.AsyncClient() as client_http:
        token_resp = await client_http.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": client_id,
                "client_secret": client_secret,
                "redirect_uri": redirect_uri,
                "grant_type": "authorization_code",
            },
        )
        tokens = token_resp.json()

        user_info_resp = await client_http.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {tokens.get('access_token')}"}
        )
        google_data = user_info_resp.json()

    email = google_data["email"]
    user = await db.users.find_one({"email": email}, {"_id": 0})

    if not user:
        user_id = str(uuid.uuid4())
        user = {
            "id": user_id,
            "email": email,
            "name": google_data.get("name", "Usuario Google"),
            "picture": google_data.get("picture"),
            "role": "user",
            "points": 50,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user)
        await add_points(user_id, 50, "Bienvenido a PriceHive")
    else:
        user_id = user["id"]

    session_token = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.SESSION_EXPIRY_DAYS)

    await db.user_sessions.delete_many({"user_id": user_id})
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    return RedirectResponse(url=f"{settings.FRONTEND_URL}/#session_id={session_token}")

@router.post("/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_many({"session_token": session_token})

    response.delete_cookie(key="session_token", path="/", secure=True, samesite="none")
    return {"message": "Logged out successfully"}

@router.post("/google/session")
async def google_session(data: GoogleSessionRequest):
    session = await db.user_sessions.find_one({"session_token": data.session_id})
    if not session:
        raise HTTPException(status_code=401, detail="Sesión no válida o expirada")

    user = await db.users.find_one({"id": session["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    access_token = create_token(user["id"], user["email"], user["role"])

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(**user)
    }

@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    user_email = user_data.email.lower().strip()
    existing = await db.users.find_one({"email": user_email})
    if existing:
        raise HTTPException(status_code=400, detail="El email ya está registrado")

    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    user_doc = {
        "id": user_id,
        "email": user_email,
        "password": hash_password(user_data.password),
        "name": user_data.name,
        "role": "user",
        "points": 0,
        "created_at": now
    }

    await db.users.insert_one(user_doc)
    await add_points(user_id, 50, "Bienvenido a PriceHive")
    token = create_token(user_id, user_email, "user")

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(id=user_id, email=user_email, name=user_data.name, role="user", points=50, created_at=now)
    )

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user_email = credentials.email.lower().strip()
    user = await db.users.find_one({"email": user_email}, {"_id": 0})

    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")

    token = create_token(user["id"], user["email"], user["role"])

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(**user)
    )

@router.get("/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    return UserResponse(**user)
