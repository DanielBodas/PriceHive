from pydantic import BaseModel
from typing import Optional, List, Dict

class AttributeCreate(BaseModel):
    name: str
    description: Optional[str] = None
    values: List[str] = []

class AttributeResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    values: List[str] = []

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None

class BrandCreate(BaseModel):
    name: str
    logo_url: Optional[str] = None

class BrandResponse(BaseModel):
    id: str
    name: str
    logo_url: Optional[str] = None

class SupermarketCreate(BaseModel):
    name: str
    logo_url: Optional[str] = None

class SupermarketResponse(BaseModel):
    id: str
    name: str
    logo_url: Optional[str] = None

class UnitCreate(BaseModel):
    name: str
    abbreviation: str

class UnitResponse(BaseModel):
    id: str
    name: str
    abbreviation: str

class ProductCreate(BaseModel):
    name: str
    brand_id: Optional[str] = None
    category_id: str
    unit_id: Optional[str] = None
    barcode: Optional[str] = None
    image_url: Optional[str] = None
    is_base: bool = False
    allowed_attribute_ids: List[str] = []
    base_product_id: Optional[str] = None
    attribute_values: Optional[Dict[str, str]] = None

class ProductResponse(BaseModel):
    id: str
    name: str
    brand_id: Optional[str] = None
    brand_name: Optional[str] = None
    category_id: str
    category_name: Optional[str] = None
    unit_id: Optional[str] = None
    unit_name: Optional[str] = None
    barcode: Optional[str] = None
    image_url: Optional[str] = None
    latest_price: Optional[float] = None
    is_base: bool = False
    allowed_attribute_ids: List[str] = []
    base_product_id: Optional[str] = None
    base_product_name: Optional[str] = None
    attribute_values: Optional[Dict[str, str]] = None

# Operational Models
class SellableProductCreate(BaseModel):
    supermarket_id: str
    product_id: str
    brand_id: str
    attribute_values: Optional[Dict[str, str]] = None

class SellableProductBulkCreate(BaseModel):
    supermarket_id: str
    brand_id: str
    catalog_entry_ids: List[str]

class SellableProductResponse(BaseModel):
    id: str
    supermarket_id: str
    supermarket_name: Optional[str] = None
    product_id: str
    product_name: Optional[str] = None
    brand_id: str
    brand_name: Optional[str] = None
    attribute_values: Optional[Dict[str, str]] = None
    warning: Optional[str] = None

class ProductUnitCreate(BaseModel):
    product_id: str
    unit_id: str

class ProductUnitResponse(BaseModel):
    id: str
    product_id: str
    unit_id: str
    unit_name: Optional[str] = None

class SellableProductUnitCreate(BaseModel):
    sellable_product_id: str
    unit_id: str

class SellableProductUnitResponse(BaseModel):
    id: str
    sellable_product_id: str
    unit_id: str
    unit_name: Optional[str] = None

class BrandProductCatalogCreate(BaseModel):
    brand_id: str
    product_id: str
    status: str = "active"
    attribute_values: Optional[Dict[str, str]] = None

class BrandProductCatalogBulkCreate(BaseModel):
    brand_id: str
    product_ids: List[str]
    status: str = "active"
    attribute_combinations: Optional[List[Dict[str, str]]] = None

class BrandProductCatalogResponse(BaseModel):
    id: str
    brand_id: str
    brand_name: Optional[str] = None
    product_id: str
    product_name: Optional[str] = None
    status: str
    attribute_values: Optional[Dict[str, str]] = None
