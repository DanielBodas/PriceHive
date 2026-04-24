from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from datetime import datetime, timezone, timedelta
from ..core.database import db
from ..core.auth import get_current_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/community", tags=["community"])


async def _build_lookup_maps():
    """Builds helper dictionaries to resolve product/brand/supermarket names."""
    products = await db.products.find({}, {"_id": 0}).to_list(5000)
    brands = await db.brands.find({}, {"_id": 0}).to_list(1000)
    supermarkets = await db.supermarkets.find({}, {"_id": 0}).to_list(1000)
    sellable = await db.sellable_products.find({}, {"_id": 0}).to_list(20000)

    products_map = {p.get("id"): p for p in products}
    brands_map = {b.get("id"): b for b in brands}
    sm_map = {s.get("id"): s for s in supermarkets}
    sellable_map = {sp.get("id"): sp for sp in sellable}
    return products_map, brands_map, sm_map, sellable_map


def _resolve_price_meta(price: dict, products_map, brands_map, sm_map, sellable_map) -> Dict[str, Any]:
    """Resolve product/brand/supermarket names for a given price doc (supports legacy)."""
    p_name = "Producto"
    b_name = None
    s_name = "Tienda"

    sp_id = price.get("sellable_product_id")
    if sp_id and sp_id in sellable_map:
        sp = sellable_map[sp_id]
        pid = sp.get("product_id")
        bid = sp.get("brand_id")
        smid = sp.get("supermarket_id")
        if pid and pid in products_map:
            p_name = products_map[pid].get("name", p_name)
        if bid and bid in brands_map:
            b_name = brands_map[bid].get("name")
        if smid and smid in sm_map:
            s_name = sm_map[smid].get("name", s_name)
    else:
        # legacy fallback
        pid = price.get("product_id")
        smid = price.get("supermarket_id")
        if pid and pid in products_map:
            p_name = products_map[pid].get("name", p_name)
        if smid and smid in sm_map:
            s_name = sm_map[smid].get("name", s_name)

    return {
        "product_name": p_name,
        "brand_name": b_name,
        "supermarket_name": s_name,
    }


@router.get("/trending")
async def get_trending(limit: int = 8, user: dict = Depends(get_current_user)):
    """
    Returns trending products in last 14 days based on number of price submissions.
    Includes latest price and simple price delta (vs first recorded in period).
    """
    try:
        since = (datetime.now(timezone.utc) - timedelta(days=14)).isoformat()

        pipeline = [
            {"$match": {"status": {"$ne": "invalid"}, "created_at": {"$gte": since}}},
            {
                "$group": {
                    "_id": {
                        "$ifNull": ["$sellable_product_id", "$product_id"],
                    },
                    "count": {"$sum": 1},
                    "last_price": {"$last": "$price"},
                    "first_price": {"$first": "$price"},
                    "last_date": {"$max": "$created_at"},
                    "sellable_product_id": {"$last": "$sellable_product_id"},
                    "product_id": {"$last": "$product_id"},
                    "supermarket_id": {"$last": "$supermarket_id"},
                }
            },
            {"$sort": {"count": -1}},
            {"$limit": limit},
        ]
        docs = await db.prices.aggregate(pipeline).to_list(limit)

        products_map, brands_map, sm_map, sellable_map = await _build_lookup_maps()

        items = []
        for d in docs:
            meta = _resolve_price_meta(
                {
                    "sellable_product_id": d.get("sellable_product_id"),
                    "product_id": d.get("product_id"),
                    "supermarket_id": d.get("supermarket_id"),
                },
                products_map, brands_map, sm_map, sellable_map,
            )
            first_p = d.get("first_price") or 0
            last_p = d.get("last_price") or 0
            delta_pct = 0.0
            if first_p and first_p > 0:
                delta_pct = round(((last_p - first_p) / first_p) * 100, 1)
            items.append({
                "product_name": meta["product_name"],
                "brand_name": meta["brand_name"],
                "supermarket_name": meta["supermarket_name"],
                "count": d.get("count", 0),
                "last_price": last_p,
                "first_price": first_p,
                "delta_pct": delta_pct,
                "last_date": d.get("last_date"),
            })
        return items
    except Exception as e:
        logger.error(f"Error trending: {e}")
        return []


@router.get("/best-deals")
async def get_best_deals(limit: int = 8, user: dict = Depends(get_current_user)):
    """
    Returns the biggest recent price drops. For each sellable product (or legacy product/supermarket),
    compare the latest active price with the previous one and surface those with biggest % drop.
    Falls back to lowest-current-price items if there's not enough history.
    """
    try:
        since = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
        prices = await db.prices.find(
            {"status": {"$ne": "invalid"}, "created_at": {"$gte": since}},
            {"_id": 0},
        ).sort("created_at", -1).to_list(5000)

        products_map, brands_map, sm_map, sellable_map = await _build_lookup_maps()

        # Group prices by key
        groups: Dict[str, List[dict]] = {}
        for p in prices:
            key = p.get("sellable_product_id") or f"{p.get('product_id')}::{p.get('supermarket_id')}"
            if not key or key == "None::None":
                continue
            groups.setdefault(key, []).append(p)

        deals = []
        for key, lst in groups.items():
            # lst is desc by date
            if len(lst) < 2:
                continue
            latest = lst[0]
            prev = lst[1]
            latest_p = latest.get("price", 0) or 0
            prev_p = prev.get("price", 0) or 0
            if not prev_p or prev_p <= 0 or not latest_p:
                continue
            delta_pct = round(((latest_p - prev_p) / prev_p) * 100, 1)
            if delta_pct >= 0:
                continue  # we only want drops
            meta = _resolve_price_meta(latest, products_map, brands_map, sm_map, sellable_map)
            deals.append({
                "product_name": meta["product_name"],
                "brand_name": meta["brand_name"],
                "supermarket_name": meta["supermarket_name"],
                "previous_price": prev_p,
                "current_price": latest_p,
                "delta_pct": delta_pct,
                "saved": round(prev_p - latest_p, 2),
                "last_date": latest.get("created_at"),
            })

        deals.sort(key=lambda x: x["delta_pct"])  # most negative first
        return deals[:limit]
    except Exception as e:
        logger.error(f"Error best deals: {e}")
        return []


@router.get("/pulse")
async def get_pulse(user: dict = Depends(get_current_user)):
    """
    Quick community stats for the dashboard header.
    """
    try:
        since_24h = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
        since_7d = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()

        prices_24h = await db.prices.count_documents({"status": {"$ne": "invalid"}, "created_at": {"$gte": since_24h}})
        prices_7d = await db.prices.count_documents({"status": {"$ne": "invalid"}, "created_at": {"$gte": since_7d}})
        posts_7d = await db.posts.count_documents({"created_at": {"$gte": since_7d}})
        active_users_7d = len(await db.prices.distinct("user_id", {"created_at": {"$gte": since_7d}}))

        return {
            "prices_24h": prices_24h,
            "prices_7d": prices_7d,
            "posts_7d": posts_7d,
            "active_users_7d": active_users_7d,
        }
    except Exception as e:
        logger.error(f"Error pulse: {e}")
        return {"prices_24h": 0, "prices_7d": 0, "posts_7d": 0, "active_users_7d": 0}
