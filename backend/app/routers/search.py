from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from typing import List
from ..core.database import db
from ..core.auth import get_current_user

router = APIRouter(prefix="/search", tags=["search"])

@router.get("/products")
async def search_products(
    q: str = "",
    category_id: Optional[str] = None,
    brand_id: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    query = {}
    if q:
        query["name"] = {"$regex": q, "$options": "i"}
    if category_id:
        query["category_id"] = category_id
    if brand_id:
        query["brand_id"] = brand_id

    products_raw = await db.products.find(query).to_list(100)

    brands_raw = await db.brands.find({}).to_list(1000)
    brands = {b.get("id") or str(b.get("_id")): b["name"] for b in brands_raw}

    categories_raw = await db.categories.find({}).to_list(1000)
    categories = {c.get("id") or str(c.get("_id")): c["name"] for c in categories_raw}

    units_raw = await db.units.find({}).to_list(1000)
    units = {u.get("id") or str(u.get("_id")): u["name"] for u in units_raw}

    result = []
    for p in products_raw:
        pid = p.get("id") or str(p.get("_id"))
        p["id"] = pid

        # Get latest price across all sellable variants
        sps = await db.sellable_products.find({"product_id": pid}).to_list(1000)
        sp_ids = [sp.get("id") or str(sp.get("_id")) for sp in sps]
        latest_price = await db.prices.find_one({"sellable_product_id": {"$in": sp_ids}}, {"_id": 0}, sort=[("created_at", -1)]) if sp_ids else None

        result.append({
            **p,
            "brand_name": brands.get(p.get("brand_id")),
            "category_name": categories.get(p.get("category_id")),
            "unit_name": units.get(p.get("unit_id")),
            "latest_price": latest_price["price"] if latest_price else None
        })
    return result
