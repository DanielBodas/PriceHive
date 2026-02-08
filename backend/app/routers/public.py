from fastapi import APIRouter
from typing import Optional
from typing import List
from ..core.database import db
from ..models.product import SupermarketResponse, CategoryResponse, ProductResponse

router = APIRouter(prefix="/public", tags=["public"])

@router.get("/supermarkets", response_model=List[SupermarketResponse])
async def get_public_supermarkets():
    sms = await db.supermarkets.find({}, {"_id": 0}).to_list(1000)
    return [SupermarketResponse(**s) for s in sms]

@router.get("/categories", response_model=List[CategoryResponse])
async def get_public_categories():
    cats = await db.categories.find({}, {"_id": 0}).to_list(1000)
    return [CategoryResponse(**c) for c in cats]

@router.get("/products", response_model=List[ProductResponse])
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
