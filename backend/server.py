from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'pricehive_super_secret_key_2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Create the main app
app = FastAPI(title="PriceHive API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

# User Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Admin Base Data Models
class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None

class BrandCreate(BaseModel):
    name: str
    logo_url: Optional[str] = None

class BrandResponse(BaseModel):
    id: str
    name: str
    logo_url: Optional[str] = None

class SupermarketCreate(BaseModel):
    name: str
    logo_url: Optional[str] = None

class SupermarketResponse(BaseModel):
    id: str
    name: str
    logo_url: Optional[str] = None

class UnitCreate(BaseModel):
    name: str
    abbreviation: str

class UnitResponse(BaseModel):
    id: str
    name: str
    abbreviation: str

class ProductCreate(BaseModel):
    name: str
    brand_id: str
    category_id: str
    unit_id: str
    barcode: Optional[str] = None
    image_url: Optional[str] = None

class ProductResponse(BaseModel):
    id: str
    name: str
    brand_id: str
    brand_name: Optional[str] = None
    category_id: str
    category_name: Optional[str] = None
    unit_id: str
    unit_name: Optional[str] = None
    barcode: Optional[str] = None
    image_url: Optional[str] = None

# Price Models
class PriceCreate(BaseModel):
    product_id: str
    supermarket_id: str
    price: float
    quantity: float = 1

class PriceResponse(BaseModel):
    id: str
    product_id: str
    product_name: Optional[str] = None
    supermarket_id: str
    supermarket_name: Optional[str] = None
    price: float
    quantity: float
    user_id: str
    user_name: Optional[str] = None
    created_at: str

# Shopping List Models
class ShoppingListItemCreate(BaseModel):
    product_id: str
    quantity: float
    unit_id: str
    price: Optional[float] = None
    purchased: bool = False

class ShoppingListCreate(BaseModel):
    name: str
    supermarket_id: str
    items: List[ShoppingListItemCreate] = []

class ShoppingListItemResponse(BaseModel):
    product_id: str
    product_name: Optional[str] = None
    quantity: float
    unit_id: str
    unit_name: Optional[str] = None
    price: Optional[float] = None
    estimated_price: Optional[float] = None
    purchased: bool

class ShoppingListResponse(BaseModel):
    id: str
    name: str
    supermarket_id: str
    supermarket_name: Optional[str] = None
    items: List[ShoppingListItemResponse]
    user_id: str
    total_estimated: float
    total_actual: float
    created_at: str
    updated_at: str

class ShoppingListUpdate(BaseModel):
    name: Optional[str] = None
    supermarket_id: Optional[str] = None
    items: Optional[List[ShoppingListItemCreate]] = None

# Social Models
class PostCreate(BaseModel):
    content: str
    post_type: str = "update"  # update, price_alert, tip

class PostResponse(BaseModel):
    id: str
    content: str
    post_type: str
    user_id: str
    user_name: str
    reactions: dict
    comments_count: int
    created_at: str

class CommentCreate(BaseModel):
    content: str

class CommentResponse(BaseModel):
    id: str
    post_id: str
    content: str
    user_id: str
    user_name: str
    created_at: str

class ReactionCreate(BaseModel):
    reaction_type: str  # like, love, useful, warning

# Analytics Models
class PriceHistoryResponse(BaseModel):
    date: str
    price: float

class ProductAnalyticsResponse(BaseModel):
    product_id: str
    product_name: str
    supermarket_id: Optional[str] = None
    supermarket_name: Optional[str] = None
    current_price: Optional[float] = None
    avg_price: Optional[float] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    price_history: List[PriceHistoryResponse]

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "name": user_data.name,
        "role": "user",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id, user_data.email, "user")
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user_id,
            email=user_data.email,
            name=user_data.name,
            role="user",
            created_at=user_doc["created_at"]
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"], user["email"], user["role"])
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            role=user["role"],
            created_at=user["created_at"]
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    return UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        role=user["role"],
        created_at=user["created_at"]
    )

# ==================== ADMIN ENDPOINTS ====================

# Categories
@api_router.post("/admin/categories", response_model=CategoryResponse)
async def create_category(data: CategoryCreate, user: dict = Depends(get_admin_user)):
    cat_id = str(uuid.uuid4())
    doc = {"id": cat_id, "name": data.name, "description": data.description}
    await db.categories.insert_one(doc)
    return CategoryResponse(**doc)

@api_router.get("/admin/categories", response_model=List[CategoryResponse])
async def get_categories(user: dict = Depends(get_current_user)):
    cats = await db.categories.find({}, {"_id": 0}).to_list(1000)
    return [CategoryResponse(**c) for c in cats]

@api_router.put("/admin/categories/{cat_id}", response_model=CategoryResponse)
async def update_category(cat_id: str, data: CategoryCreate, user: dict = Depends(get_admin_user)):
    result = await db.categories.update_one({"id": cat_id}, {"$set": {"name": data.name, "description": data.description}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return CategoryResponse(id=cat_id, name=data.name, description=data.description)

@api_router.delete("/admin/categories/{cat_id}")
async def delete_category(cat_id: str, user: dict = Depends(get_admin_user)):
    result = await db.categories.delete_one({"id": cat_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted"}

# Brands
@api_router.post("/admin/brands", response_model=BrandResponse)
async def create_brand(data: BrandCreate, user: dict = Depends(get_admin_user)):
    brand_id = str(uuid.uuid4())
    doc = {"id": brand_id, "name": data.name, "logo_url": data.logo_url}
    await db.brands.insert_one(doc)
    return BrandResponse(**doc)

@api_router.get("/admin/brands", response_model=List[BrandResponse])
async def get_brands(user: dict = Depends(get_current_user)):
    brands = await db.brands.find({}, {"_id": 0}).to_list(1000)
    return [BrandResponse(**b) for b in brands]

@api_router.put("/admin/brands/{brand_id}", response_model=BrandResponse)
async def update_brand(brand_id: str, data: BrandCreate, user: dict = Depends(get_admin_user)):
    result = await db.brands.update_one({"id": brand_id}, {"$set": {"name": data.name, "logo_url": data.logo_url}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Brand not found")
    return BrandResponse(id=brand_id, name=data.name, logo_url=data.logo_url)

@api_router.delete("/admin/brands/{brand_id}")
async def delete_brand(brand_id: str, user: dict = Depends(get_admin_user)):
    result = await db.brands.delete_one({"id": brand_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Brand not found")
    return {"message": "Brand deleted"}

# Supermarkets
@api_router.post("/admin/supermarkets", response_model=SupermarketResponse)
async def create_supermarket(data: SupermarketCreate, user: dict = Depends(get_admin_user)):
    sm_id = str(uuid.uuid4())
    doc = {"id": sm_id, "name": data.name, "logo_url": data.logo_url}
    await db.supermarkets.insert_one(doc)
    return SupermarketResponse(**doc)

@api_router.get("/admin/supermarkets", response_model=List[SupermarketResponse])
async def get_supermarkets(user: dict = Depends(get_current_user)):
    sms = await db.supermarkets.find({}, {"_id": 0}).to_list(1000)
    return [SupermarketResponse(**s) for s in sms]

@api_router.put("/admin/supermarkets/{sm_id}", response_model=SupermarketResponse)
async def update_supermarket(sm_id: str, data: SupermarketCreate, user: dict = Depends(get_admin_user)):
    result = await db.supermarkets.update_one({"id": sm_id}, {"$set": {"name": data.name, "logo_url": data.logo_url}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Supermarket not found")
    return SupermarketResponse(id=sm_id, name=data.name, logo_url=data.logo_url)

@api_router.delete("/admin/supermarkets/{sm_id}")
async def delete_supermarket(sm_id: str, user: dict = Depends(get_admin_user)):
    result = await db.supermarkets.delete_one({"id": sm_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Supermarket not found")
    return {"message": "Supermarket deleted"}

# Units
@api_router.post("/admin/units", response_model=UnitResponse)
async def create_unit(data: UnitCreate, user: dict = Depends(get_admin_user)):
    unit_id = str(uuid.uuid4())
    doc = {"id": unit_id, "name": data.name, "abbreviation": data.abbreviation}
    await db.units.insert_one(doc)
    return UnitResponse(**doc)

@api_router.get("/admin/units", response_model=List[UnitResponse])
async def get_units(user: dict = Depends(get_current_user)):
    units = await db.units.find({}, {"_id": 0}).to_list(1000)
    return [UnitResponse(**u) for u in units]

@api_router.put("/admin/units/{unit_id}", response_model=UnitResponse)
async def update_unit(unit_id: str, data: UnitCreate, user: dict = Depends(get_admin_user)):
    result = await db.units.update_one({"id": unit_id}, {"$set": {"name": data.name, "abbreviation": data.abbreviation}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Unit not found")
    return UnitResponse(id=unit_id, name=data.name, abbreviation=data.abbreviation)

@api_router.delete("/admin/units/{unit_id}")
async def delete_unit(unit_id: str, user: dict = Depends(get_admin_user)):
    result = await db.units.delete_one({"id": unit_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Unit not found")
    return {"message": "Unit deleted"}

# Products
@api_router.post("/admin/products", response_model=ProductResponse)
async def create_product(data: ProductCreate, user: dict = Depends(get_admin_user)):
    prod_id = str(uuid.uuid4())
    doc = {
        "id": prod_id,
        "name": data.name,
        "brand_id": data.brand_id,
        "category_id": data.category_id,
        "unit_id": data.unit_id,
        "barcode": data.barcode,
        "image_url": data.image_url
    }
    await db.products.insert_one(doc)
    
    brand = await db.brands.find_one({"id": data.brand_id}, {"_id": 0})
    category = await db.categories.find_one({"id": data.category_id}, {"_id": 0})
    unit = await db.units.find_one({"id": data.unit_id}, {"_id": 0})
    
    return ProductResponse(
        **doc,
        brand_name=brand["name"] if brand else None,
        category_name=category["name"] if category else None,
        unit_name=unit["name"] if unit else None
    )

@api_router.get("/admin/products", response_model=List[ProductResponse])
async def get_products(user: dict = Depends(get_current_user)):
    products = await db.products.find({}, {"_id": 0}).to_list(1000)
    brands = {b["id"]: b["name"] for b in await db.brands.find({}, {"_id": 0}).to_list(1000)}
    categories = {c["id"]: c["name"] for c in await db.categories.find({}, {"_id": 0}).to_list(1000)}
    units = {u["id"]: u["name"] for u in await db.units.find({}, {"_id": 0}).to_list(1000)}
    
    result = []
    for p in products:
        result.append(ProductResponse(
            **p,
            brand_name=brands.get(p.get("brand_id")),
            category_name=categories.get(p.get("category_id")),
            unit_name=units.get(p.get("unit_id"))
        ))
    return result

@api_router.put("/admin/products/{prod_id}", response_model=ProductResponse)
async def update_product(prod_id: str, data: ProductCreate, user: dict = Depends(get_admin_user)):
    update_data = {
        "name": data.name,
        "brand_id": data.brand_id,
        "category_id": data.category_id,
        "unit_id": data.unit_id,
        "barcode": data.barcode,
        "image_url": data.image_url
    }
    result = await db.products.update_one({"id": prod_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    brand = await db.brands.find_one({"id": data.brand_id}, {"_id": 0})
    category = await db.categories.find_one({"id": data.category_id}, {"_id": 0})
    unit = await db.units.find_one({"id": data.unit_id}, {"_id": 0})
    
    return ProductResponse(
        id=prod_id,
        **update_data,
        brand_name=brand["name"] if brand else None,
        category_name=category["name"] if category else None,
        unit_name=unit["name"] if unit else None
    )

@api_router.delete("/admin/products/{prod_id}")
async def delete_product(prod_id: str, user: dict = Depends(get_admin_user)):
    result = await db.products.delete_one({"id": prod_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}

# ==================== PRICES ENDPOINTS ====================

@api_router.post("/prices", response_model=PriceResponse)
async def create_price(data: PriceCreate, user: dict = Depends(get_current_user)):
    price_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": price_id,
        "product_id": data.product_id,
        "supermarket_id": data.supermarket_id,
        "price": data.price,
        "quantity": data.quantity,
        "user_id": user["id"],
        "created_at": created_at
    }
    await db.prices.insert_one(doc)
    
    product = await db.products.find_one({"id": data.product_id}, {"_id": 0})
    supermarket = await db.supermarkets.find_one({"id": data.supermarket_id}, {"_id": 0})
    
    return PriceResponse(
        **doc,
        product_name=product["name"] if product else None,
        supermarket_name=supermarket["name"] if supermarket else None,
        user_name=user["name"]
    )

@api_router.get("/prices", response_model=List[PriceResponse])
async def get_prices(
    product_id: Optional[str] = None,
    supermarket_id: Optional[str] = None,
    limit: int = 100,
    user: dict = Depends(get_current_user)
):
    query = {}
    if product_id:
        query["product_id"] = product_id
    if supermarket_id:
        query["supermarket_id"] = supermarket_id
    
    prices = await db.prices.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
    
    products = {p["id"]: p["name"] for p in await db.products.find({}, {"_id": 0}).to_list(1000)}
    supermarkets = {s["id"]: s["name"] for s in await db.supermarkets.find({}, {"_id": 0}).to_list(1000)}
    users = {u["id"]: u["name"] for u in await db.users.find({}, {"_id": 0, "id": 1, "name": 1}).to_list(1000)}
    
    result = []
    for p in prices:
        result.append(PriceResponse(
            **p,
            product_name=products.get(p.get("product_id")),
            supermarket_name=supermarkets.get(p.get("supermarket_id")),
            user_name=users.get(p.get("user_id"))
        ))
    return result

@api_router.get("/prices/latest/{product_id}")
async def get_latest_price(product_id: str, supermarket_id: Optional[str] = None, user: dict = Depends(get_current_user)):
    query = {"product_id": product_id}
    if supermarket_id:
        query["supermarket_id"] = supermarket_id
    
    price = await db.prices.find_one(query, {"_id": 0}, sort=[("created_at", -1)])
    if not price:
        return {"price": None, "message": "No price found"}
    return {"price": price["price"], "created_at": price["created_at"]}

# ==================== SHOPPING LIST ENDPOINTS ====================

@api_router.post("/shopping-lists", response_model=ShoppingListResponse)
async def create_shopping_list(data: ShoppingListCreate, user: dict = Depends(get_current_user)):
    list_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    items_with_estimates = []
    total_estimated = 0
    total_actual = 0
    
    for item in data.items:
        latest = await db.prices.find_one(
            {"product_id": item.product_id, "supermarket_id": data.supermarket_id},
            {"_id": 0},
            sort=[("created_at", -1)]
        )
        estimated = latest["price"] * item.quantity if latest else None
        if estimated:
            total_estimated += estimated
        if item.price:
            total_actual += item.price * item.quantity
        
        product = await db.products.find_one({"id": item.product_id}, {"_id": 0})
        unit = await db.units.find_one({"id": item.unit_id}, {"_id": 0})
        
        items_with_estimates.append({
            "product_id": item.product_id,
            "product_name": product["name"] if product else None,
            "quantity": item.quantity,
            "unit_id": item.unit_id,
            "unit_name": unit["name"] if unit else None,
            "price": item.price,
            "estimated_price": estimated,
            "purchased": item.purchased
        })
    
    doc = {
        "id": list_id,
        "name": data.name,
        "supermarket_id": data.supermarket_id,
        "items": [item.model_dump() for item in data.items],
        "user_id": user["id"],
        "created_at": now,
        "updated_at": now
    }
    await db.shopping_lists.insert_one(doc)
    
    supermarket = await db.supermarkets.find_one({"id": data.supermarket_id}, {"_id": 0})
    
    return ShoppingListResponse(
        id=list_id,
        name=data.name,
        supermarket_id=data.supermarket_id,
        supermarket_name=supermarket["name"] if supermarket else None,
        items=items_with_estimates,
        user_id=user["id"],
        total_estimated=total_estimated,
        total_actual=total_actual,
        created_at=now,
        updated_at=now
    )

@api_router.get("/shopping-lists", response_model=List[ShoppingListResponse])
async def get_shopping_lists(user: dict = Depends(get_current_user)):
    lists = await db.shopping_lists.find({"user_id": user["id"]}, {"_id": 0}).sort("updated_at", -1).to_list(100)
    
    supermarkets = {s["id"]: s["name"] for s in await db.supermarkets.find({}, {"_id": 0}).to_list(1000)}
    products = {p["id"]: p["name"] for p in await db.products.find({}, {"_id": 0}).to_list(1000)}
    units = {u["id"]: u["name"] for u in await db.units.find({}, {"_id": 0}).to_list(1000)}
    
    result = []
    for lst in lists:
        items_with_info = []
        total_estimated = 0
        total_actual = 0
        
        for item in lst.get("items", []):
            latest = await db.prices.find_one(
                {"product_id": item["product_id"], "supermarket_id": lst["supermarket_id"]},
                {"_id": 0},
                sort=[("created_at", -1)]
            )
            estimated = latest["price"] * item["quantity"] if latest else None
            if estimated:
                total_estimated += estimated
            if item.get("price"):
                total_actual += item["price"] * item["quantity"]
            
            items_with_info.append(ShoppingListItemResponse(
                product_id=item["product_id"],
                product_name=products.get(item["product_id"]),
                quantity=item["quantity"],
                unit_id=item["unit_id"],
                unit_name=units.get(item["unit_id"]),
                price=item.get("price"),
                estimated_price=estimated,
                purchased=item.get("purchased", False)
            ))
        
        result.append(ShoppingListResponse(
            id=lst["id"],
            name=lst["name"],
            supermarket_id=lst["supermarket_id"],
            supermarket_name=supermarkets.get(lst["supermarket_id"]),
            items=items_with_info,
            user_id=lst["user_id"],
            total_estimated=total_estimated,
            total_actual=total_actual,
            created_at=lst["created_at"],
            updated_at=lst["updated_at"]
        ))
    return result

@api_router.get("/shopping-lists/{list_id}", response_model=ShoppingListResponse)
async def get_shopping_list(list_id: str, user: dict = Depends(get_current_user)):
    lst = await db.shopping_lists.find_one({"id": list_id, "user_id": user["id"]}, {"_id": 0})
    if not lst:
        raise HTTPException(status_code=404, detail="Shopping list not found")
    
    supermarket = await db.supermarkets.find_one({"id": lst["supermarket_id"]}, {"_id": 0})
    products = {p["id"]: p["name"] for p in await db.products.find({}, {"_id": 0}).to_list(1000)}
    units = {u["id"]: u["name"] for u in await db.units.find({}, {"_id": 0}).to_list(1000)}
    
    items_with_info = []
    total_estimated = 0
    total_actual = 0
    
    for item in lst.get("items", []):
        latest = await db.prices.find_one(
            {"product_id": item["product_id"], "supermarket_id": lst["supermarket_id"]},
            {"_id": 0},
            sort=[("created_at", -1)]
        )
        estimated = latest["price"] * item["quantity"] if latest else None
        if estimated:
            total_estimated += estimated
        if item.get("price"):
            total_actual += item["price"] * item["quantity"]
        
        items_with_info.append(ShoppingListItemResponse(
            product_id=item["product_id"],
            product_name=products.get(item["product_id"]),
            quantity=item["quantity"],
            unit_id=item["unit_id"],
            unit_name=units.get(item["unit_id"]),
            price=item.get("price"),
            estimated_price=estimated,
            purchased=item.get("purchased", False)
        ))
    
    return ShoppingListResponse(
        id=lst["id"],
        name=lst["name"],
        supermarket_id=lst["supermarket_id"],
        supermarket_name=supermarket["name"] if supermarket else None,
        items=items_with_info,
        user_id=lst["user_id"],
        total_estimated=total_estimated,
        total_actual=total_actual,
        created_at=lst["created_at"],
        updated_at=lst["updated_at"]
    )

@api_router.put("/shopping-lists/{list_id}", response_model=ShoppingListResponse)
async def update_shopping_list(list_id: str, data: ShoppingListUpdate, user: dict = Depends(get_current_user)):
    lst = await db.shopping_lists.find_one({"id": list_id, "user_id": user["id"]}, {"_id": 0})
    if not lst:
        raise HTTPException(status_code=404, detail="Shopping list not found")
    
    update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if data.name:
        update_data["name"] = data.name
    if data.supermarket_id:
        update_data["supermarket_id"] = data.supermarket_id
    if data.items is not None:
        update_data["items"] = [item.model_dump() for item in data.items]
    
    await db.shopping_lists.update_one({"id": list_id}, {"$set": update_data})
    return await get_shopping_list(list_id, user)

@api_router.delete("/shopping-lists/{list_id}")
async def delete_shopping_list(list_id: str, user: dict = Depends(get_current_user)):
    result = await db.shopping_lists.delete_one({"id": list_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Shopping list not found")
    return {"message": "Shopping list deleted"}

@api_router.post("/shopping-lists/{list_id}/submit-prices")
async def submit_prices_from_list(list_id: str, user: dict = Depends(get_current_user)):
    lst = await db.shopping_lists.find_one({"id": list_id, "user_id": user["id"]}, {"_id": 0})
    if not lst:
        raise HTTPException(status_code=404, detail="Shopping list not found")
    
    prices_created = 0
    for item in lst.get("items", []):
        if item.get("price") and item.get("purchased"):
            price_id = str(uuid.uuid4())
            price_doc = {
                "id": price_id,
                "product_id": item["product_id"],
                "supermarket_id": lst["supermarket_id"],
                "price": item["price"],
                "quantity": item["quantity"],
                "user_id": user["id"],
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.prices.insert_one(price_doc)
            prices_created += 1
    
    return {"message": f"{prices_created} prices submitted successfully"}

# ==================== SOCIAL ENDPOINTS ====================

@api_router.post("/posts", response_model=PostResponse)
async def create_post(data: PostCreate, user: dict = Depends(get_current_user)):
    post_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": post_id,
        "content": data.content,
        "post_type": data.post_type,
        "user_id": user["id"],
        "reactions": {"like": 0, "love": 0, "useful": 0, "warning": 0},
        "user_reactions": {},
        "created_at": now
    }
    await db.posts.insert_one(doc)
    
    comments_count = await db.comments.count_documents({"post_id": post_id})
    
    return PostResponse(
        id=post_id,
        content=data.content,
        post_type=data.post_type,
        user_id=user["id"],
        user_name=user["name"],
        reactions=doc["reactions"],
        comments_count=comments_count,
        created_at=now
    )

@api_router.get("/posts", response_model=List[PostResponse])
async def get_posts(limit: int = 50, user: dict = Depends(get_current_user)):
    posts = await db.posts.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)
    users = {u["id"]: u["name"] for u in await db.users.find({}, {"_id": 0, "id": 1, "name": 1}).to_list(1000)}
    
    result = []
    for p in posts:
        comments_count = await db.comments.count_documents({"post_id": p["id"]})
        result.append(PostResponse(
            id=p["id"],
            content=p["content"],
            post_type=p.get("post_type", "update"),
            user_id=p["user_id"],
            user_name=users.get(p["user_id"], "Unknown"),
            reactions=p.get("reactions", {"like": 0, "love": 0, "useful": 0, "warning": 0}),
            comments_count=comments_count,
            created_at=p["created_at"]
        ))
    return result

@api_router.post("/posts/{post_id}/react")
async def react_to_post(post_id: str, data: ReactionCreate, user: dict = Depends(get_current_user)):
    post = await db.posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    user_reactions = post.get("user_reactions", {})
    reactions = post.get("reactions", {"like": 0, "love": 0, "useful": 0, "warning": 0})
    
    previous_reaction = user_reactions.get(user["id"])
    if previous_reaction:
        reactions[previous_reaction] = max(0, reactions.get(previous_reaction, 0) - 1)
    
    if previous_reaction != data.reaction_type:
        reactions[data.reaction_type] = reactions.get(data.reaction_type, 0) + 1
        user_reactions[user["id"]] = data.reaction_type
    else:
        user_reactions.pop(user["id"], None)
    
    await db.posts.update_one({"id": post_id}, {"$set": {"reactions": reactions, "user_reactions": user_reactions}})
    return {"reactions": reactions}

@api_router.post("/posts/{post_id}/comments", response_model=CommentResponse)
async def create_comment(post_id: str, data: CommentCreate, user: dict = Depends(get_current_user)):
    post = await db.posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    comment_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": comment_id,
        "post_id": post_id,
        "content": data.content,
        "user_id": user["id"],
        "created_at": now
    }
    await db.comments.insert_one(doc)
    
    return CommentResponse(
        id=comment_id,
        post_id=post_id,
        content=data.content,
        user_id=user["id"],
        user_name=user["name"],
        created_at=now
    )

@api_router.get("/posts/{post_id}/comments", response_model=List[CommentResponse])
async def get_comments(post_id: str, user: dict = Depends(get_current_user)):
    comments = await db.comments.find({"post_id": post_id}, {"_id": 0}).sort("created_at", 1).to_list(100)
    users = {u["id"]: u["name"] for u in await db.users.find({}, {"_id": 0, "id": 1, "name": 1}).to_list(1000)}
    
    return [CommentResponse(
        id=c["id"],
        post_id=c["post_id"],
        content=c["content"],
        user_id=c["user_id"],
        user_name=users.get(c["user_id"], "Unknown"),
        created_at=c["created_at"]
    ) for c in comments]

# ==================== ANALYTICS ENDPOINTS ====================

@api_router.get("/analytics/product/{product_id}", response_model=ProductAnalyticsResponse)
async def get_product_analytics(product_id: str, supermarket_id: Optional[str] = None, user: dict = Depends(get_current_user)):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    query = {"product_id": product_id}
    if supermarket_id:
        query["supermarket_id"] = supermarket_id
    
    prices = await db.prices.find(query, {"_id": 0}).sort("created_at", 1).to_list(1000)
    
    if not prices:
        return ProductAnalyticsResponse(
            product_id=product_id,
            product_name=product["name"],
            supermarket_id=supermarket_id,
            price_history=[]
        )
    
    price_values = [p["price"] for p in prices]
    supermarket = await db.supermarkets.find_one({"id": supermarket_id}, {"_id": 0}) if supermarket_id else None
    
    return ProductAnalyticsResponse(
        product_id=product_id,
        product_name=product["name"],
        supermarket_id=supermarket_id,
        supermarket_name=supermarket["name"] if supermarket else None,
        current_price=prices[-1]["price"] if prices else None,
        avg_price=sum(price_values) / len(price_values) if price_values else None,
        min_price=min(price_values) if price_values else None,
        max_price=max(price_values) if price_values else None,
        price_history=[PriceHistoryResponse(date=p["created_at"], price=p["price"]) for p in prices]
    )

@api_router.get("/analytics/compare/{product_id}")
async def compare_product_prices(product_id: str, user: dict = Depends(get_current_user)):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    supermarkets = await db.supermarkets.find({}, {"_id": 0}).to_list(1000)
    
    comparison = []
    for sm in supermarkets:
        latest = await db.prices.find_one(
            {"product_id": product_id, "supermarket_id": sm["id"]},
            {"_id": 0},
            sort=[("created_at", -1)]
        )
        if latest:
            comparison.append({
                "supermarket_id": sm["id"],
                "supermarket_name": sm["name"],
                "price": latest["price"],
                "updated_at": latest["created_at"]
            })
    
    comparison.sort(key=lambda x: x["price"])
    
    return {
        "product_id": product_id,
        "product_name": product["name"],
        "comparison": comparison,
        "best_price": comparison[0] if comparison else None
    }

@api_router.get("/analytics/stats")
async def get_general_stats(user: dict = Depends(get_current_user)):
    total_products = await db.products.count_documents({})
    total_prices = await db.prices.count_documents({})
    total_users = await db.users.count_documents({})
    total_supermarkets = await db.supermarkets.count_documents({})
    
    recent_prices = await db.prices.find({}, {"_id": 0}).sort("created_at", -1).to_list(10)
    products = {p["id"]: p["name"] for p in await db.products.find({}, {"_id": 0}).to_list(1000)}
    supermarkets = {s["id"]: s["name"] for s in await db.supermarkets.find({}, {"_id": 0}).to_list(1000)}
    
    recent_activity = [{
        "product_name": products.get(p["product_id"], "Unknown"),
        "supermarket_name": supermarkets.get(p["supermarket_id"], "Unknown"),
        "price": p["price"],
        "created_at": p["created_at"]
    } for p in recent_prices]
    
    return {
        "total_products": total_products,
        "total_prices": total_prices,
        "total_users": total_users,
        "total_supermarkets": total_supermarkets,
        "recent_activity": recent_activity
    }

# ==================== PUBLIC DATA ENDPOINTS ====================

@api_router.get("/public/supermarkets", response_model=List[SupermarketResponse])
async def get_public_supermarkets():
    sms = await db.supermarkets.find({}, {"_id": 0}).to_list(1000)
    return [SupermarketResponse(**s) for s in sms]

@api_router.get("/public/categories", response_model=List[CategoryResponse])
async def get_public_categories():
    cats = await db.categories.find({}, {"_id": 0}).to_list(1000)
    return [CategoryResponse(**c) for c in cats]

@api_router.get("/public/products", response_model=List[ProductResponse])
async def get_public_products(category_id: Optional[str] = None):
    query = {}
    if category_id:
        query["category_id"] = category_id
    
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    brands = {b["id"]: b["name"] for b in await db.brands.find({}, {"_id": 0}).to_list(1000)}
    categories = {c["id"]: c["name"] for c in await db.categories.find({}, {"_id": 0}).to_list(1000)}
    units = {u["id"]: u["name"] for u in await db.units.find({}, {"_id": 0}).to_list(1000)}
    
    return [ProductResponse(
        **p,
        brand_name=brands.get(p.get("brand_id")),
        category_name=categories.get(p.get("category_id")),
        unit_name=units.get(p.get("unit_id"))
    ) for p in products]

# Include router and middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
