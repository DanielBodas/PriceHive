from pydantic import BaseModel
from typing import Optional, List

# Social
class PostCreate(BaseModel):
    content: str
    post_type: str = "update"

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
    reaction_type: str

# Analytics
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

# Alert
class AlertCreate(BaseModel):
    product_id: str
    supermarket_id: Optional[str] = None
    target_price: float
    alert_type: str = "below"

class AlertResponse(BaseModel):
    id: str
    product_id: str
    product_name: Optional[str] = None
    supermarket_id: Optional[str] = None
    supermarket_name: Optional[str] = None
    target_price: float
    alert_type: str
    triggered: bool
    created_at: str

# Notification
class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    notification_type: str
    read: bool
    created_at: str

# Gamification
class LeaderboardEntry(BaseModel):
    user_id: str
    user_name: str
    points: int
    rank: int
