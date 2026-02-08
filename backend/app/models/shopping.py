from pydantic import BaseModel
from typing import List, Optional

class ShoppingListItemCreate(BaseModel):
    sellable_product_id: str
    quantity: float
    unit_id: str
    price: Optional[float] = None
    purchased: bool = False

class ShoppingListCreate(BaseModel):
    name: str
    supermarket_id: str
    items: List[ShoppingListItemCreate] = []

class ShoppingListItemResponse(BaseModel):
    sellable_product_id: str
    product_id: Optional[str] = None
    product_name: Optional[str] = None
    quantity: float
    unit_id: str
    unit_name: Optional[str] = None
    price: Optional[float] = None
    unit_price: Optional[float] = None
    estimated_price: Optional[float] = None
    purchased: bool
    brand_id: Optional[str] = None
    brand_name: Optional[str] = None

class ShoppingListResponse(BaseModel):
    id: str
    name: str
    supermarket_id: str
    supermarket_name: Optional[str] = None
    items: List[ShoppingListItemResponse]
    user_id: str
    total_estimated: float
    total_actual: float
    created_at: str
    updated_at: str

class ShoppingListUpdate(BaseModel):
    name: Optional[str] = None
    supermarket_id: Optional[str] = None
    items: Optional[List[ShoppingListItemCreate]] = None
