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

    # Pre-map base products for inheritance (though conceptually all are bases now)
    base_prods = {p.get("id") or str(p.get("_id")): p for p in products_raw if p.get("is_base")}

    result = []
    for p in products_raw:
        p_id = p.get("id") or str(p.get("_id"))
        p["id"] = p_id

        base_id = p.get("base_product_id")
        base_p = base_prods.get(base_id) if base_id else None

        inherited_brand_id = p.get("brand_id") or (base_p.get("brand_id") if base_p else None)
        inherited_category_id = p.get("category_id") or (base_p.get("category_id") if base_p else None)
        inherited_unit_id = p.get("unit_id") or (base_p.get("unit_id") if base_p else None)

        resp_dict = dict(p)
        resp_dict.pop("brand_id", None)
        resp_dict.pop("category_id", None)
        resp_dict.pop("unit_id", None)

        result.append(ProductResponse(
            **resp_dict,
            brand_id=inherited_brand_id,
            brand_name=brands.get(inherited_brand_id),
            category_id=inherited_category_id or "",
            category_name=categories.get(inherited_category_id),
            unit_id=inherited_unit_id,
            unit_name=units.get(inherited_unit_id),
            base_product_name=base_p.get("name") if base_p else None
        ))
    return result
