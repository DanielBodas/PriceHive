from fastapi import APIRouter, HTTPException, Depends
from typing import List
import uuid
from datetime import datetime, timezone
from ..core.database import db
from ..core.auth import get_current_user
from ..models.extras import AlertCreate, AlertResponse, NotificationResponse

router = APIRouter(prefix="", tags=["user-features"])

# Alerts
@router.post("/alerts", response_model=AlertResponse)
async def create_alert(data: AlertCreate, user: dict = Depends(get_current_user)):
    alert_id = str(uuid.uuid4())
    doc = {
        "id": alert_id,
        "user_id": user["id"],
        "product_id": data.product_id,
        "supermarket_id": data.supermarket_id,
        "target_price": data.target_price,
        "alert_type": data.alert_type,
        "triggered": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.alerts.insert_one(doc)

    product = await db.products.find_one({"id": data.product_id}, {"_id": 0})
    supermarket = await db.supermarkets.find_one({"id": data.supermarket_id}, {"_id": 0}) if data.supermarket_id else None

    return AlertResponse(
        **doc,
        product_name=product["name"] if product else None,
        supermarket_name=supermarket["name"] if supermarket else None
    )

@router.get("/alerts", response_model=List[AlertResponse])
async def get_alerts(user: dict = Depends(get_current_user)):
    alerts = await db.alerts.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    products = {p["id"]: p["name"] for p in await db.products.find({}, {"_id": 0}).to_list(1000)}
    supermarkets = {s["id"]: s["name"] for s in await db.supermarkets.find({}, {"_id": 0}).to_list(1000)}

    return [AlertResponse(
        **a,
        product_name=products.get(a.get("product_id")),
        supermarket_name=supermarkets.get(a.get("supermarket_id"))
    ) for a in alerts]

@router.delete("/alerts/{alert_id}")
async def delete_alert(alert_id: str, user: dict = Depends(get_current_user)):
    result = await db.alerts.delete_one({"id": alert_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"message": "Alert deleted"}

# Notifications
@router.get("/notifications", response_model=List[NotificationResponse])
async def get_notifications(user: dict = Depends(get_current_user)):
    notifications = await db.notifications.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return [NotificationResponse(**n) for n in notifications]

@router.get("/notifications/unread-count")
async def get_unread_count(user: dict = Depends(get_current_user)):
    count = await db.notifications.count_documents({"user_id": user["id"], "read": False})
    return {"count": count}

@router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, user: dict = Depends(get_current_user)):
    result = await db.notifications.update_one(
        {"id": notification_id, "user_id": user["id"]},
        {"$set": {"read": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read"}

@router.put("/notifications/read-all")
async def mark_all_notifications_read(user: dict = Depends(get_current_user)):
    await db.notifications.update_many(
        {"user_id": user["id"], "read": False},
        {"$set": {"read": True}}
    )
    return {"message": "All notifications marked as read"}
