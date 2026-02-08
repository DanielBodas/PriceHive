from pydantic import BaseModel
from typing import Optional

class PriceCreate(BaseModel):
    sellable_product_id: str
    price: float
    quantity: float = 1

class PriceResponse(BaseModel):
    id: str
    sellable_product_id: str
    product_name: Optional[str] = None
    supermarket_name: Optional[str] = None
    brand_name: Optional[str] = None
    price: float
    quantity: float
    user_id: str
    user_name: Optional[str] = None
    created_at: str
