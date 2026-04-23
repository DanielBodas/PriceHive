from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from ..core.database import db
from ..core.auth import get_current_user, add_points, add_credits, consume_credits
from ..models.shopping import ShoppingListCreate, ShoppingListResponse, ShoppingListUpdate, ShoppingListItemResponse

router = APIRouter(prefix="/shopping-lists", tags=["shopping-lists"])


def _build_sellable_lookup(sellable_products_data: list) -> dict:
    lookup = {}
    for sp in sellable_products_data:
        product_id = sp.get("product_id")
        supermarket_id = sp.get("supermarket_id")
        if not product_id or not supermarket_id:
            continue
        key = (product_id, supermarket_id)
        lookup.setdefault(key, []).append(sp)
    return lookup


def _resolve_sellable_product(item: dict, list_supermarket_id: Optional[str], sellable_map: dict, sellable_lookup: dict):
    sp_id = item.get("sellable_product_id")
    if sp_id:
        sp = sellable_map.get(sp_id)
        if sp:
            return sp_id, sp

    # Legacy fallback: resolve by product + supermarket (+ optional brand)
    product_id = item.get("product_id")
    supermarket_id = item.get("supermarket_id") or list_supermarket_id
    if not product_id or not supermarket_id:
        return None, None

    candidates = sellable_lookup.get((product_id, supermarket_id), [])
    if not candidates:
        return None, None

    brand_id = item.get("brand_id")
    if brand_id:
        for candidate in candidates:
            if candidate.get("brand_id") == brand_id:
                candidate_id = candidate.get("id") or str(candidate.get("_id"))
                if candidate_id:
                    return candidate_id, candidate

    candidate = candidates[0]
    candidate_id = candidate.get("id") or str(candidate.get("_id"))
    return candidate_id, candidate

@router.post("", response_model=ShoppingListResponse)
async def create_shopping_list(data: ShoppingListCreate, user: dict = Depends(get_current_user)):
    list_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    items_with_estimates = []
    total_estimated = 0
    total_actual = 0

    for item in data.items:
        sp = await db.sellable_products.find_one({"id": item.sellable_product_id})
        if not sp: continue

        # Resolve correct estimated price based on variant attributes if present
        # Currently, prices are linked to sellable_product_id.
        # However, our sellable_product might be a "Brand-Product" generic entry
        # and the item might have specific attribute_values.
        # We need to find if there's a price for this specific variant combination.
        # For now, we'll look for prices with matching attributes or fallback to sellable_id.

        price_query = {"sellable_product_id": item.sellable_product_id, "status": {"$ne": "invalid"}}
        if item.attribute_values:
            price_query["attribute_values"] = item.attribute_values

        latest = await db.prices.find_one(
            price_query,
            {"_id": 0},
            sort=[("created_at", -1)]
        )


        if not latest and item.attribute_values:
            # Fallback to any price for this sellable product
            latest = await db.prices.find_one(
                {"sellable_product_id": item.sellable_product_id, "status": {"$ne": "invalid"}},
                {"_id": 0},
                sort=[("created_at", -1)]
            )

        estimated = None
        if latest:
            latest_price = latest["price"]
            latest_qty = latest.get("quantity", 1) or 1
            unit_price_est = latest_price / latest_qty
            estimated = unit_price_est * item.quantity
            total_estimated += estimated

        if item.price:
            total_actual += item.price

        product = await db.products.find_one({"id": sp["product_id"]}, {"_id": 0})
        unit = await db.units.find_one({"id": item.unit_id}, {"_id": 0})
        brand = await db.brands.find_one({"id": sp["brand_id"]}, {"_id": 0})

        items_with_estimates.append(ShoppingListItemResponse(
            sellable_product_id=item.sellable_product_id,
            product_id=sp["product_id"],
            product_name=product["name"] if product else None,
            quantity=item.quantity,
            unit_id=item.unit_id,
            unit_name=unit["name"] if unit else None,
            price=item.price,
            unit_price=item.price / item.quantity if item.price and item.quantity else None,
            estimated_price=estimated,
            purchased=item.purchased,
            brand_id=sp["brand_id"],
            brand_name=brand["name"] if brand else None,
            attribute_values=item.attribute_values or sp.get("attribute_values")
        ))

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

@router.get("", response_model=List[ShoppingListResponse])
async def get_shopping_lists(user: dict = Depends(get_current_user)):
    def map_id(doc):
        if doc and "id" not in doc and "_id" in doc:
            doc["id"] = str(doc["_id"])
        return doc

    lists_raw = await db.shopping_lists.find({"user_id": user["id"]}).sort("updated_at", -1).to_list(100)
    lists = [map_id(l) for l in lists_raw]

    all_sms = await db.supermarkets.find({}).to_list(1000)
    supermarkets = {s.get("id") or str(s.get("_id")): s["name"] for s in all_sms}

    all_prods = await db.products.find({}).to_list(1000)
    products = {p.get("id") or str(p.get("_id")): p["name"] for p in all_prods}

    all_units = await db.units.find({}).to_list(1000)
    units = {u.get("id") or str(u.get("_id")): u["name"] for u in all_units}

    all_brands = await db.brands.find({}).to_list(1000)
    brands = {b.get("id") or str(b.get("_id")): b["name"] for b in all_brands}

    sellable_products_data = await db.sellable_products.find({}).to_list(10000)
    sellable_map = {sp.get("id") or str(sp.get("_id")): sp for sp in sellable_products_data}
    sellable_lookup = _build_sellable_lookup(sellable_products_data)

    result = []
    for lst in lists:
        items_with_info = []
        total_estimated = 0
        total_actual = 0

        for item in lst.get("items", []):
            sp_id, sp = _resolve_sellable_product(item, lst.get("supermarket_id"), sellable_map, sellable_lookup)
            if not sp_id or not sp:
                continue

            quantity = item.get("quantity", 1) or 1
            unit_id = item.get("unit_id") or ""

            estimated = item.get("estimated_price")
            if estimated:
                total_estimated += estimated

            if item.get("price"):
                total_actual += item["price"]

            items_with_info.append(ShoppingListItemResponse(
                sellable_product_id=sp_id,
                product_id=sp["product_id"],
                product_name=products.get(sp["product_id"]),
                quantity=quantity,
                unit_id=unit_id,
                unit_name=units.get(unit_id),
                price=item.get("price"),
                unit_price=item.get("price") / quantity if item.get("price") and quantity else None,
                estimated_price=estimated,
                purchased=item.get("purchased", False),
                brand_id=sp["brand_id"],
                brand_name=brands.get(sp["brand_id"]),
                attribute_values=item.get("attribute_values") or sp.get("attribute_values")
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

@router.get("/{list_id}", response_model=ShoppingListResponse)
async def get_shopping_list(list_id: str, user: dict = Depends(get_current_user)):
    def map_id(doc):
        if doc and "id" not in doc and "_id" in doc:
            doc["id"] = str(doc["_id"])
        return doc

    lst_raw = await db.shopping_lists.find_one({"id": list_id, "user_id": user["id"]})
    if not lst_raw:
        # try _id
        try:
            from bson import ObjectId
            lst_raw = await db.shopping_lists.find_one({"_id": ObjectId(list_id), "user_id": user["id"]})
        except: pass

    if not lst_raw:
        raise HTTPException(status_code=404, detail="Shopping list not found")

    lst = map_id(lst_raw)

    sm_raw = await db.supermarkets.find_one({"id": lst["supermarket_id"]})
    supermarket = map_id(sm_raw)

    all_prods = await db.products.find({}).to_list(1000)
    products = {p.get("id") or str(p.get("_id")): p["name"] for p in all_prods}

    all_units = await db.units.find({}).to_list(1000)
    units = {u.get("id") or str(u.get("_id")): u["name"] for u in all_units}

    all_brands = await db.brands.find({}).to_list(1000)
    brands = {b.get("id") or str(b.get("_id")): b["name"] for b in all_brands}

    sellable_products_data = await db.sellable_products.find({}).to_list(10000)
    sellable_map = {sp.get("id") or str(sp.get("_id")): sp for sp in sellable_products_data}
    sellable_lookup = _build_sellable_lookup(sellable_products_data)

    items_with_info = []
    total_estimated = 0
    total_actual = 0

    for item in lst.get("items", []):
        sp_id, sp = _resolve_sellable_product(item, lst.get("supermarket_id"), sellable_map, sellable_lookup)
        if not sp_id or not sp:
            continue

        quantity = item.get("quantity", 1) or 1
        unit_id = item.get("unit_id") or ""

        estimated = item.get("estimated_price")
        if estimated:
            total_estimated += estimated

        if item.get("price"):
            total_actual += item["price"]

        items_with_info.append(ShoppingListItemResponse(
            sellable_product_id=sp_id,
            product_id=sp["product_id"],
            product_name=products.get(sp["product_id"]),
            quantity=quantity,
            unit_id=unit_id,
            unit_name=units.get(unit_id),
            price=item.get("price"),
            unit_price=item.get("price") / quantity if item.get("price") and quantity else None,
            estimated_price=estimated,
            purchased=item.get("purchased", False),
            brand_id=sp["brand_id"],
            brand_name=brands.get(sp["brand_id"]),
            attribute_values=item.get("attribute_values") or sp.get("attribute_values")
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

@router.put("/{list_id}", response_model=ShoppingListResponse)
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

@router.delete("/{list_id}")
async def delete_shopping_list(list_id: str, user: dict = Depends(get_current_user)):
    result = await db.shopping_lists.delete_one({"id": list_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Shopping list not found")
    return {"message": "Shopping list deleted"}

@router.post("/{list_id}/submit-prices")
async def submit_prices_from_list(list_id: str, user: dict = Depends(get_current_user)):
    lst = await db.shopping_lists.find_one({"id": list_id, "user_id": user["id"]}, {"_id": 0})
    if not lst:
        raise HTTPException(status_code=404, detail="Shopping list not found")

    sellable_products_data = await db.sellable_products.find({}).to_list(10000)
    sellable_map = {sp.get("id") or str(sp.get("_id")): sp for sp in sellable_products_data}
    sellable_lookup = _build_sellable_lookup(sellable_products_data)

    prices_created = 0
    for item in lst.get("items", []):
        if item.get("price") and item.get("purchased"):
            sp_id, sp = _resolve_sellable_product(item, lst.get("supermarket_id"), sellable_map, sellable_lookup)
            if not sp_id:
                continue

            price_id = str(uuid.uuid4())
            quantity = item.get("quantity", 1) or 1
            try:
                quantity = float(quantity) if quantity not in (None, "") else 1.0
            except (TypeError, ValueError):
                quantity = 1.0
            if quantity <= 0:
                quantity = 1.0

            try:
                price_value = float(item["price"])
            except (TypeError, ValueError):
                continue
            if price_value <= 0:
                continue

            price_doc = {
                "id": price_id,
                "sellable_product_id": sp_id,
                "product_id": sp.get("product_id") if sp else None,
                "supermarket_id": sp.get("supermarket_id") if sp else lst.get("supermarket_id"),
                "brand_id": sp.get("brand_id") if sp else None,
                "unit_id": item.get("unit_id"),
                "attribute_values": item.get("attribute_values"),
                "price": price_value,
                "quantity": quantity,
                "unit_price": price_value / quantity if quantity else None,
                "source": "shopping_list",
                "shopping_list_id": list_id,
                "user_id": user["id"],
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.prices.insert_one(price_doc)
            prices_created += 1

    if prices_created > 0:
        await add_points(user["id"], prices_created * 10, f"Precios subidos desde lista de compra")
        await add_credits(user["id"], prices_created * 10, f"Precios subidos desde lista de compra")

    return {"message": f"{prices_created} precios subidos correctamente", "points_earned": prices_created * 10, "credits_earned": prices_created * 10}

@router.post("/{list_id}/estimate")
async def estimate_list(list_id: str, user: dict = Depends(get_current_user)):
    lst = await db.shopping_lists.find_one({"id": list_id, "user_id": user["id"]}, {"_id": 0})
    if not lst:
        raise HTTPException(status_code=404, detail="Shopping list not found")
    
    items = lst.get("items", [])
    if not items:
        return await get_shopping_list(list_id, user)
    
    # 1 credit per product
    cost = len(items)
    if not await consume_credits(user["id"], cost, f"Estimación de lista: {lst['name']}"):
        raise HTTPException(status_code=402, detail=f"Créditos insuficientes. Necesitas {cost} créditos.")

    # Calculate estimates
    updated_items = []
    for item in items:
        sp_id = item.get("sellable_product_id")
        if not sp_id:
            # Try to resolve if missing
            sp_id, _ = _resolve_sellable_product(item, lst.get("supermarket_id"), {}, {}) # minimal resolve
            
        estimated = None
        if sp_id:
            price_query = {"sellable_product_id": sp_id, "status": {"$ne": "invalid"}}
            if item.get("attribute_values"):
                price_query["attribute_values"] = item["attribute_values"]

            latest = await db.prices.find_one(
                price_query,
                {"_id": 0},
                sort=[("created_at", -1)]
            )

            if not latest and item.get("attribute_values"):
                latest = await db.prices.find_one(
                    {"sellable_product_id": sp_id, "status": {"$ne": "invalid"}},
                    {"_id": 0},
                    sort=[("created_at", -1)]
                )


            if latest:
                latest_price = latest["price"]
                latest_qty = latest.get("quantity", 1) or 1
                unit_price_est = latest_price / latest_qty
                estimated = unit_price_est * (item.get("quantity", 1) or 1)
        
        item["estimated_price"] = estimated
        updated_items.append(item)

    await db.shopping_lists.update_one(
        {"id": list_id},
        {"$set": {"items": updated_items, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return await get_shopping_list(list_id, user)
