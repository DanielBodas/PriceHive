from fastapi import APIRouter
from typing import Optional, List
import logging
from ..core.database import db
from ..models.product import SupermarketResponse, CategoryResponse, ProductResponse

router = APIRouter(prefix="/public", tags=["public"])
logger = logging.getLogger(__name__)

@router.get("/supermarkets", response_model=List[SupermarketResponse])
async def get_public_supermarkets():
    logger.info("Fetching public supermarkets")
    sms = await db.supermarkets.find({}).to_list(1000)

    def map_id(doc):
        if doc and "id" not in doc and "_id" in doc:
            doc["id"] = str(doc["_id"])
        return doc

    result = [SupermarketResponse(**map_id(s)) for s in sms]
    logger.info(f"Found {len(result)} supermarkets")
    return result

@router.get("/categories", response_model=List[CategoryResponse])
async def get_public_categories():
    cats = await db.categories.find({}).to_list(1000)
    result = []
    for c in cats:
        c["id"] = c.get("id") or str(c.get("_id"))
        result.append(CategoryResponse(**c))
    return result

@router.get("/products", response_model=List[ProductResponse])
async def get_public_products(category_id: Optional[str] = None):
    query = {}
    if category_id:
        query["category_id"] = category_id

    products_raw = await db.products.find(query).to_list(1000)

    all_brands = await db.brands.find({}).to_list(1000)
    brands = {b.get("id") or str(b.get("_id")): b["name"] for b in all_brands}

    all_cats = await db.categories.find({}).to_list(1000)
    categories = {c.get("id") or str(c.get("_id")): c["name"] for c in all_cats}

    all_units = await db.units.find({}).to_list(1000)
    units = {u.get("id") or str(u.get("_id")): u["name"] for u in all_units}

    result = []
    for p in products_raw:
        p["id"] = p.get("id") or str(p.get("_id"))
        result.append(ProductResponse(
            **p,
            brand_name=brands.get(p.get("brand_id")),
            category_name=categories.get(p.get("category_id")),
            unit_name=units.get(p.get("unit_id"))
        ))
    return result
