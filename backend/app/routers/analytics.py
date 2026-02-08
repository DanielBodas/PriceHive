from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, List
from ..core.database import db
from ..core.auth import get_current_user
from ..models.extras import ProductAnalyticsResponse, PriceHistoryResponse, LeaderboardEntry

router = APIRouter(prefix="", tags=["analytics"])

@router.get("/analytics/product/{product_id}", response_model=ProductAnalyticsResponse)
async def get_product_analytics(product_id: str, supermarket_id: Optional[str] = None, user: dict = Depends(get_current_user)):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Get all sellable products for this product (optionally filtered by supermarket)
    sp_query = {"product_id": product_id}
    if supermarket_id:
        sp_query["supermarket_id"] = supermarket_id
    sps = await db.sellable_products.find(sp_query).to_list(1000)
    sp_ids = [sp["id"] for sp in sps]

    if not sp_ids:
        return ProductAnalyticsResponse(
            product_id=product_id,
            product_name=product["name"],
            supermarket_id=supermarket_id,
            price_history=[]
        )

    prices = await db.prices.find({"sellable_product_id": {"$in": sp_ids}}, {"_id": 0}).sort("created_at", 1).to_list(1000)

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
        current_price=prices[-1]["price"],
        avg_price=sum(price_values) / len(price_values),
        min_price=min(price_values),
        max_price=max(price_values),
        price_history=[PriceHistoryResponse(date=p["created_at"], price=p["price"]) for p in prices]
    )

@router.get("/analytics/compare/{product_id}")
async def compare_product_prices(product_id: str, user: dict = Depends(get_current_user)):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    sps = await db.sellable_products.find({"product_id": product_id}).to_list(1000)
    supermarkets = {s["id"]: s["name"] for s in await db.supermarkets.find({}, {"_id": 0}).to_list(1000)}

    comparison = []
    for sp in sps:
        latest = await db.prices.find_one(
            {"sellable_product_id": sp["id"]},
            {"_id": 0},
            sort=[("created_at", -1)]
        )
        if latest:
            comparison.append({
                "supermarket_id": sp["supermarket_id"],
                "supermarket_name": supermarkets.get(sp["supermarket_id"]),
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

import logging

logger = logging.getLogger(__name__)

@router.get("/analytics/stats")
async def get_general_stats(user: dict = Depends(get_current_user)):
    logger.info(f"Fetching stats for user: {user.get('email')}")
    total_products = await db.products.count_documents({})
    total_prices = await db.prices.count_documents({})
    total_users = await db.users.count_documents({})
    total_supermarkets = await db.supermarkets.count_documents({})

    recent_prices = await db.prices.find({}, {"_id": 0}).sort("created_at", -1).to_list(10)
    products = {p["id"]: p["name"] for p in await db.products.find({}, {"_id": 0}).to_list(1000)}
    sellable_products_data = await db.sellable_products.find({}, {"_id": 0}).to_list(10000)
    sellable_map = {sp["id"]: sp for sp in sellable_products_data}
    supermarkets = {s["id"]: s["name"] for s in await db.supermarkets.find({}, {"_id": 0}).to_list(1000)}

    recent_activity = []
    for p in recent_prices:
        p_name = "Unknown"
        s_name = "Unknown"

        if "sellable_product_id" in p and p["sellable_product_id"] in sellable_map:
            sp = sellable_map[p["sellable_product_id"]]
            p_name = products.get(sp["product_id"], "Unknown")
            s_name = supermarkets.get(sp["supermarket_id"], "Unknown")
        elif "product_id" in p:
            # Legacy support
            p_name = products.get(p["product_id"], "Unknown")
            s_name = supermarkets.get(p.get("supermarket_id"), "Unknown")

        recent_activity.append({
            "product_name": p_name,
            "supermarket_name": s_name,
            "price": p["price"],
            "created_at": p["created_at"]
        })

    return {
        "total_products": total_products,
        "total_prices": total_prices,
        "total_users": total_users,
        "total_supermarkets": total_supermarkets,
        "recent_activity": recent_activity
    }

@router.get("/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard(limit: int = 10, user: dict = Depends(get_current_user)):
    users = await db.users.find({}, {"_id": 0, "id": 1, "name": 1, "points": 1}).sort("points", -1).to_list(limit)
    return [LeaderboardEntry(user_id=u["id"], user_name=u["name"], points=u.get("points", 0), rank=i + 1) for i, u in enumerate(users)]

@router.get("/my-points")
async def get_my_points(user: dict = Depends(get_current_user)):
    users_above = await db.users.count_documents({"points": {"$gt": user.get("points", 0)}})
    history = await db.point_history.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(10)
    return {"points": user.get("points", 0), "rank": users_above + 1, "history": history}
