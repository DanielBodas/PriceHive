from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from typing import List
import uuid
from datetime import datetime, timezone
from ..core.database import db
from ..core.auth import get_current_user, add_points, create_notification
from ..models.price import PriceCreate, PriceResponse

router = APIRouter(prefix="/prices", tags=["prices"])

@router.post("", response_model=PriceResponse)
async def create_price(data: PriceCreate, user: dict = Depends(get_current_user)):
    query = {}
    if data.sellable_product_id:
        query["sellable_product_id"] = data.sellable_product_id
    else:
        query["product_id"] = data.product_id
        query["supermarket_id"] = data.supermarket_id

    previous_price = await db.prices.find_one(
        query,
        {"_id": 0},
        sort=[("created_at", -1)]
    )

    price_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": price_id,
        "price": data.price,
        "quantity": data.quantity,
        "user_id": user["id"],
        "created_at": created_at
    }

    if data.sellable_product_id:
        doc["sellable_product_id"] = data.sellable_product_id
    else:
        doc["product_id"] = data.product_id
        doc["supermarket_id"] = data.supermarket_id
    await db.prices.insert_one(doc)

    sp = await db.sellable_products.find_one({"id": data.sellable_product_id})
    product = await db.products.find_one({"id": sp["product_id"]}, {"_id": 0}) if sp else None
    supermarket = await db.supermarkets.find_one({"id": sp["supermarket_id"]}, {"_id": 0}) if sp else None
    brand = await db.brands.find_one({"id": sp["brand_id"]}, {"_id": 0}) if sp else None

    await add_points(user["id"], 10, f"Precio registrado")

    if previous_price and sp:
        price_change = data.price - previous_price["price"]
        if abs(price_change) > 0.01:
            alerts = await db.alerts.find({
                "product_id": sp["product_id"],
                "$or": [
                    {"supermarket_id": sp["supermarket_id"]},
                    {"supermarket_id": None}
                ],
                "triggered": False
            }, {"_id": 0}).to_list(1000)

            for alert in alerts:
                should_trigger = False
                if alert["alert_type"] == "below" and data.price <= alert["target_price"]:
                    should_trigger = True
                elif alert["alert_type"] == "above" and data.price >= alert["target_price"]:
                    should_trigger = True
                elif alert["alert_type"] == "any_change":
                    should_trigger = True

                if should_trigger:
                    await db.alerts.update_one({"id": alert["id"]}, {"$set": {"triggered": True}})
                    change_text = f"+{price_change:.2f}€" if price_change > 0 else f"{price_change:.2f}€"
                    await create_notification(
                        alert["user_id"],
                        "Alerta de Precio",
                        f"{product['name'] if product else 'Producto'} en {supermarket['name'] if supermarket else 'Supermercado'}: {data.price:.2f}€ ({change_text})",
                        "price_alert"
                    )

    return PriceResponse(
        id=price_id,
        sellable_product_id=doc.get("sellable_product_id"),
        product_id=doc.get("product_id"),
        supermarket_id=doc.get("supermarket_id"),
        price=data.price,
        quantity=data.quantity,
        user_id=user["id"],
        created_at=created_at,
        product_name=product["name"] if product else None,
        supermarket_name=supermarket["name"] if supermarket else None,
        brand_name=brand["name"] if brand else None,
        user_name=user["name"]
    )

@router.get("", response_model=List[PriceResponse])
async def get_prices(
    sellable_product_id: Optional[str] = None,
    limit: int = 100,
    user: dict = Depends(get_current_user)
):
    query = {}
    if sellable_product_id:
        query["sellable_product_id"] = sellable_product_id

    prices = await db.prices.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)

    supermarkets = {s["id"]: s["name"] for s in await db.supermarkets.find({}, {"_id": 0}).to_list(1000)}
    products = {p["id"]: p["name"] for p in await db.products.find({}, {"_id": 0}).to_list(1000)}
    brands = {b["id"]: b["name"] for b in await db.brands.find({}, {"_id": 0}).to_list(1000)}
    users = {u["id"]: u["name"] for u in await db.users.find({}, {"_id": 0, "id": 1, "name": 1}).to_list(1000)}
    sellable_products_data = await db.sellable_products.find({}, {"_id": 0}).to_list(10000)
    sellable_map = {sp["id"]: sp for sp in sellable_products_data}

    result = []
    for p in prices:
        p_name = None
        s_name = None
        b_name = None

        if "sellable_product_id" in p and p["sellable_product_id"] in sellable_map:
            sp = sellable_map[p["sellable_product_id"]]
            p_name = products.get(sp["product_id"])
            s_name = supermarkets.get(sp["supermarket_id"])
            b_name = brands.get(sp["brand_id"])
        elif "product_id" in p:
            p_name = products.get(p["product_id"])
            s_name = supermarkets.get(p.get("supermarket_id"))

        result.append(PriceResponse(
            **p,
            product_name=p_name,
            supermarket_name=s_name,
            brand_name=b_name,
            user_name=users.get(p.get("user_id"))
        ))
    return result

@router.get("/latest/{product_id}")
async def get_latest_price(product_id: str, supermarket_id: Optional[str] = None, user: dict = Depends(get_current_user)):
    sp_query = {"product_id": product_id}
    if supermarket_id:
        sp_query["supermarket_id"] = supermarket_id

    sps = await db.sellable_products.find(sp_query).to_list(1000)
    sp_ids = [sp["id"] for sp in sps]

    if not sp_ids:
        return {"price": None, "message": "No sellable product found"}

    query = {"sellable_product_id": {"$in": sp_ids}}
    price = await db.prices.find_one(query, {"_id": 0}, sort=[("created_at", -1)])
    if not price:
        return {"price": None, "message": "No price found"}
    return {"price": price["price"], "created_at": price["created_at"]}
