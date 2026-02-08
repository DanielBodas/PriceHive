from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List, Optional
import uuid
from ..core.database import db
from ..core.auth import get_admin_user, get_current_user
from ..models.product import (
    CategoryCreate, CategoryResponse, BrandCreate, BrandResponse,
    SupermarketCreate, SupermarketResponse, UnitCreate, UnitResponse,
    ProductCreate, ProductResponse, SellableProductCreate, SellableProductResponse,
    ProductUnitCreate, ProductUnitResponse, SellableProductUnitCreate, SellableProductUnitResponse,
    BrandProductCatalogCreate, BrandProductCatalogResponse
)

router = APIRouter(prefix="/admin", tags=["admin"])

def map_id(doc):
    if doc and "id" not in doc and "_id" in doc:
        doc["id"] = str(doc["_id"])
    return doc

# Categories
@router.post("/categories", response_model=CategoryResponse)
async def create_category(data: CategoryCreate, user: dict = Depends(get_admin_user)):
    cat_id = str(uuid.uuid4())
    doc = {"id": cat_id, "name": data.name, "description": data.description}
    await db.categories.insert_one(doc)
    return CategoryResponse(**doc)

@router.get("/categories", response_model=List[CategoryResponse])
async def get_categories(user: dict = Depends(get_current_user)):
    cats = await db.categories.find({}).to_list(1000)
    return [CategoryResponse(**map_id(c)) for c in cats]

@router.put("/categories/{cat_id}", response_model=CategoryResponse)
async def update_category(cat_id: str, data: CategoryCreate, user: dict = Depends(get_admin_user)):
    result = await db.categories.update_one({"id": cat_id}, {"$set": {"name": data.name, "description": data.description}})
    if result.matched_count == 0:
        # Try with _id if cat_id looks like an ObjectId
        try:
            from bson import ObjectId
            result = await db.categories.update_one({"_id": ObjectId(cat_id)}, {"$set": {"name": data.name, "description": data.description}})
        except:
            pass
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return CategoryResponse(id=cat_id, name=data.name, description=data.description)

@router.delete("/categories/{cat_id}")
async def delete_category(cat_id: str, user: dict = Depends(get_admin_user)):
    result = await db.categories.delete_one({"id": cat_id})
    if result.deleted_count == 0:
        try:
            from bson import ObjectId
            result = await db.categories.delete_one({"_id": ObjectId(cat_id)})
        except:
            pass
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted"}

# Brands
@router.post("/brands", response_model=BrandResponse)
async def create_brand(data: BrandCreate, user: dict = Depends(get_admin_user)):
    brand_id = str(uuid.uuid4())
    doc = {"id": brand_id, "name": data.name, "logo_url": data.logo_url}
    await db.brands.insert_one(doc)
    return BrandResponse(**doc)

@router.get("/brands", response_model=List[BrandResponse])
async def get_brands(user: dict = Depends(get_current_user)):
    brands = await db.brands.find({}).to_list(1000)
    return [BrandResponse(**map_id(b)) for b in brands]

@router.put("/brands/{brand_id}", response_model=BrandResponse)
async def update_brand(brand_id: str, data: BrandCreate, user: dict = Depends(get_admin_user)):
    result = await db.brands.update_one({"id": brand_id}, {"$set": {"name": data.name, "logo_url": data.logo_url}})
    if result.matched_count == 0:
        try:
            from bson import ObjectId
            result = await db.brands.update_one({"_id": ObjectId(brand_id)}, {"$set": {"name": data.name, "logo_url": data.logo_url}})
        except: pass
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Brand not found")
    return BrandResponse(id=brand_id, name=data.name, logo_url=data.logo_url)

@router.delete("/brands/{brand_id}")
async def delete_brand(brand_id: str, user: dict = Depends(get_admin_user)):
    result = await db.brands.delete_one({"id": brand_id})
    if result.deleted_count == 0:
        try:
            from bson import ObjectId
            result = await db.brands.delete_one({"_id": ObjectId(brand_id)})
        except: pass
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Brand not found")
    return {"message": "Brand deleted"}

# Supermarkets
@router.post("/supermarkets", response_model=SupermarketResponse)
async def create_supermarket(data: SupermarketCreate, user: dict = Depends(get_admin_user)):
    sm_id = str(uuid.uuid4())
    doc = {"id": sm_id, "name": data.name, "logo_url": data.logo_url}
    await db.supermarkets.insert_one(doc)
    return SupermarketResponse(**doc)

@router.get("/supermarkets", response_model=List[SupermarketResponse])
async def get_supermarkets(user: dict = Depends(get_current_user)):
    sms = await db.supermarkets.find({}).to_list(1000)
    return [SupermarketResponse(**map_id(s)) for s in sms]

@router.put("/supermarkets/{sm_id}", response_model=SupermarketResponse)
async def update_supermarket(sm_id: str, data: SupermarketCreate, user: dict = Depends(get_admin_user)):
    result = await db.supermarkets.update_one({"id": sm_id}, {"$set": {"name": data.name, "logo_url": data.logo_url}})
    if result.matched_count == 0:
        try:
            from bson import ObjectId
            result = await db.supermarkets.update_one({"_id": ObjectId(sm_id)}, {"$set": {"name": data.name, "logo_url": data.logo_url}})
        except: pass
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Supermarket not found")
    return SupermarketResponse(id=sm_id, name=data.name, logo_url=data.logo_url)

@router.delete("/supermarkets/{sm_id}")
async def delete_supermarket(sm_id: str, user: dict = Depends(get_admin_user)):
    result = await db.supermarkets.delete_one({"id": sm_id})
    if result.deleted_count == 0:
        try:
            from bson import ObjectId
            result = await db.supermarkets.delete_one({"_id": ObjectId(sm_id)})
        except: pass
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Supermarket not found")
    return {"message": "Supermarket deleted"}

# Units
@router.post("/units", response_model=UnitResponse)
async def create_unit(data: UnitCreate, user: dict = Depends(get_admin_user)):
    unit_id = str(uuid.uuid4())
    doc = {"id": unit_id, "name": data.name, "abbreviation": data.abbreviation}
    await db.units.insert_one(doc)
    return UnitResponse(**doc)

@router.get("/units", response_model=List[UnitResponse])
async def get_units(user: dict = Depends(get_current_user)):
    units = await db.units.find({}).to_list(1000)
    return [UnitResponse(**map_id(u)) for u in units]

@router.put("/units/{unit_id}", response_model=UnitResponse)
async def update_unit(unit_id: str, data: UnitCreate, user: dict = Depends(get_admin_user)):
    result = await db.units.update_one({"id": unit_id}, {"$set": {"name": data.name, "abbreviation": data.abbreviation}})
    if result.matched_count == 0:
        try:
            from bson import ObjectId
            result = await db.units.update_one({"_id": ObjectId(unit_id)}, {"$set": {"name": data.name, "abbreviation": data.abbreviation}})
        except: pass
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Unit not found")
    return UnitResponse(id=unit_id, name=data.name, abbreviation=data.abbreviation)

@router.delete("/units/{unit_id}")
async def delete_unit(unit_id: str, user: dict = Depends(get_admin_user)):
    result = await db.units.delete_one({"id": unit_id})
    if result.deleted_count == 0:
        try:
            from bson import ObjectId
            result = await db.units.delete_one({"_id": ObjectId(unit_id)})
        except: pass
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Unit not found")
    return {"message": "Unit deleted"}

# Products (Generic)
@router.post("/products", response_model=ProductResponse)
async def create_product(data: ProductCreate, user: dict = Depends(get_admin_user)):
    prod_id = str(uuid.uuid4())
    doc = {
        "id": prod_id,
        "name": data.name,
        "brand_id": data.brand_id,
        "category_id": data.category_id,
        "unit_id": data.unit_id,
        "barcode": data.barcode,
        "image_url": data.image_url
    }
    await db.products.insert_one(doc)

    brand = await db.brands.find_one({"id": data.brand_id}, {"_id": 0}) if data.brand_id else None
    category = await db.categories.find_one({"id": data.category_id}, {"_id": 0})
    unit = await db.units.find_one({"id": data.unit_id}, {"_id": 0}) if data.unit_id else None

    return ProductResponse(
        **map_id(doc),
        brand_name=brand["name"] if brand else None,
        category_name=category["name"] if category else None,
        unit_name=unit["name"] if unit else None
    )

@router.get("/products", response_model=List[ProductResponse])
async def get_products(user: dict = Depends(get_current_user)):
    products_raw = await db.products.find({}).to_list(1000)
    brands = {b.get("id") or str(b.get("_id")): b["name"] for b in await db.brands.find({}).to_list(1000)}
    categories = {c.get("id") or str(c.get("_id")): c["name"] for c in await db.categories.find({}).to_list(1000)}
    units = {u.get("id") or str(u.get("_id")): u["name"] for u in await db.units.find({}).to_list(1000)}

    result = []
    for p in products_raw:
        p = map_id(p)
        result.append(ProductResponse(
            **p,
            brand_name=brands.get(p.get("brand_id")),
            category_name=categories.get(p.get("category_id")),
            unit_name=units.get(p.get("unit_id"))
        ))
    return result

@router.put("/products/{prod_id}", response_model=ProductResponse)
async def update_product(prod_id: str, data: ProductCreate, user: dict = Depends(get_admin_user)):
    update_data = {
        "name": data.name,
        "brand_id": data.brand_id,
        "category_id": data.category_id,
        "unit_id": data.unit_id,
        "barcode": data.barcode,
        "image_url": data.image_url
    }
    result = await db.products.update_one({"id": prod_id}, {"$set": update_data})
    if result.matched_count == 0:
        try:
            from bson import ObjectId
            result = await db.products.update_one({"_id": ObjectId(prod_id)}, {"$set": update_data})
        except: pass
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")

    brand = await db.brands.find_one({"id": data.brand_id}, {"_id": 0}) if data.brand_id else None
    category = await db.categories.find_one({"id": data.category_id}, {"_id": 0})
    unit = await db.units.find_one({"id": data.unit_id}, {"_id": 0}) if data.unit_id else None

    return ProductResponse(
        id=prod_id,
        **update_data,
        brand_name=brand["name"] if brand else None,
        category_name=category["name"] if category else None,
        unit_name=unit["name"] if unit else None
    )

@router.delete("/products/{prod_id}")
async def delete_product(prod_id: str, user: dict = Depends(get_admin_user)):
    result = await db.products.delete_one({"id": prod_id})
    if result.deleted_count == 0:
        try:
            from bson import ObjectId
            result = await db.products.delete_one({"_id": ObjectId(prod_id)})
        except: pass
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}

# Sellable Products
@router.post("/sellable-products", response_model=SellableProductResponse)
async def create_sellable_product(data: SellableProductCreate, user: dict = Depends(get_admin_user)):
    sp_id = str(uuid.uuid4())
    doc = {
        "id": sp_id,
        "supermarket_id": data.supermarket_id,
        "product_id": data.product_id,
        "brand_id": data.brand_id
    }

    warning = None
    catalog_entry = await db.brand_product_catalog.find_one({
        "brand_id": data.brand_id,
        "product_id": data.product_id
    })

    if not catalog_entry:
        warning = "Este producto no está en el catálogo conceptual de la marca."
    elif catalog_entry["status"] != "active":
        warning = f"El estado de este producto en el catálogo de marca es: {catalog_entry['status']}"

    await db.sellable_products.insert_one(doc)

    supermarket = await db.supermarkets.find_one({"id": data.supermarket_id}, {"_id": 0})
    product = await db.products.find_one({"id": data.product_id}, {"_id": 0})
    brand = await db.brands.find_one({"id": data.brand_id}, {"_id": 0})

    return SellableProductResponse(
        **map_id(doc),
        supermarket_name=supermarket["name"] if supermarket else None,
        product_name=product["name"] if product else None,
        brand_name=brand["name"] if brand else None,
        warning=warning
    )

@router.get("/sellable-products", response_model=List[SellableProductResponse])
async def get_sellable_products(
    supermarket_id: Optional[str] = None,
    product_id: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    query = {}
    if supermarket_id: query["supermarket_id"] = supermarket_id
    if product_id: query["product_id"] = product_id

    items = await db.sellable_products.find(query).to_list(1000)

    supermarkets = {s.get("id") or str(s.get("_id")): s["name"] for s in await db.supermarkets.find({}).to_list(1000)}
    products = {p.get("id") or str(p.get("_id")): p["name"] for p in await db.products.find({}).to_list(1000)}
    brands = {b.get("id") or str(b.get("_id")): b["name"] for b in await db.brands.find({}).to_list(1000)}

    return [SellableProductResponse(
        **map_id(item),
        supermarket_name=supermarkets.get(item.get("supermarket_id")),
        product_name=products.get(item.get("product_id")),
        brand_name=brands.get(item.get("brand_id"))
    ) for item in items]

@router.delete("/sellable-products/{sp_id}")
async def delete_sellable_product(sp_id: str, user: dict = Depends(get_admin_user)):
    result = await db.sellable_products.delete_one({"id": sp_id})
    if result.deleted_count == 0:
        try:
            from bson import ObjectId
            result = await db.sellable_products.delete_one({"_id": ObjectId(sp_id)})
        except: pass
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Sellable product not found")
    return {"message": "Sellable product deleted"}

# Product Units
@router.post("/product-units", response_model=ProductUnitResponse)
async def create_product_unit(data: ProductUnitCreate, user: dict = Depends(get_admin_user)):
    pu_id = str(uuid.uuid4())
    doc = {"id": pu_id, "product_id": data.product_id, "unit_id": data.unit_id}
    await db.product_units.insert_one(doc)
    unit = await db.units.find_one({"id": data.unit_id}, {"_id": 0})
    return ProductUnitResponse(**map_id(doc), unit_name=unit["name"] if unit else None)

@router.get("/product-units/{product_id}", response_model=List[ProductUnitResponse])
async def get_product_units(product_id: str, user: dict = Depends(get_current_user)):
    items = await db.product_units.find({"product_id": product_id}).to_list(1000)
    units = {u.get("id") or str(u.get("_id")): u["name"] for u in await db.units.find({}).to_list(1000)}
    return [ProductUnitResponse(**map_id(item), unit_name=units.get(item.get("unit_id"))) for item in items]

# Sellable Product Units
@router.post("/sellable-product-units", response_model=SellableProductUnitResponse)
async def create_sellable_product_unit(data: SellableProductUnitCreate, user: dict = Depends(get_admin_user)):
    spu_id = str(uuid.uuid4())
    doc = {"id": spu_id, "sellable_product_id": data.sellable_product_id, "unit_id": data.unit_id}
    await db.sellable_product_units.insert_one(doc)
    unit = await db.units.find_one({"id": data.unit_id}, {"_id": 0})
    return SellableProductUnitResponse(**map_id(doc), unit_name=unit["name"] if unit else None)

@router.get("/sellable-product-units/{sp_id}", response_model=List[SellableProductUnitResponse])
async def get_sellable_product_units(sp_id: str, user: dict = Depends(get_current_user)):
    items = await db.sellable_product_units.find({"sellable_product_id": sp_id}).to_list(1000)
    units = {u.get("id") or str(u.get("_id")): u["name"] for u in await db.units.find({}).to_list(1000)}
    return [SellableProductUnitResponse(**map_id(item), unit_name=units.get(item.get("unit_id"))) for item in items]

@router.delete("/sellable-product-units/{spu_id}")
async def delete_sellable_product_unit(spu_id: str, user: dict = Depends(get_admin_user)):
    result = await db.sellable_product_units.delete_one({"id": spu_id})
    if result.deleted_count == 0:
        try:
            from bson import ObjectId
            result = await db.sellable_product_units.delete_one({"_id": ObjectId(spu_id)})
        except: pass
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Sellable product unit not found")
    return {"message": "Sellable product unit deleted"}

# Brand Product Catalog
@router.post("/brand-catalog", response_model=BrandProductCatalogResponse)
async def create_brand_catalog_entry(data: BrandProductCatalogCreate, user: dict = Depends(get_admin_user)):
    existing = await db.brand_product_catalog.find_one({"brand_id": data.brand_id, "product_id": data.product_id})
    if existing:
        await db.brand_product_catalog.update_one(
            {"brand_id": data.brand_id, "product_id": data.product_id},
            {"$set": {"status": data.status}}
        )
        doc = {**existing, "status": data.status}
    else:
        bc_id = str(uuid.uuid4())
        doc = {"id": bc_id, "brand_id": data.brand_id, "product_id": data.product_id, "status": data.status}
        await db.brand_product_catalog.insert_one(doc)

    brand = await db.brands.find_one({"id": data.brand_id}, {"_id": 0})
    product = await db.products.find_one({"id": data.product_id}, {"_id": 0})

    return BrandProductCatalogResponse(
        **map_id(doc),
        brand_name=brand["name"] if brand else None,
        product_name=product["name"] if product else None
    )

@router.get("/brand-catalog", response_model=List[BrandProductCatalogResponse])
async def get_brand_catalog(brand_id: Optional[str] = None, user: dict = Depends(get_current_user)):
    query = {}
    if brand_id: query["brand_id"] = brand_id
    items = await db.brand_product_catalog.find(query).to_list(1000)

    brands = {b.get("id") or str(b.get("_id")): b["name"] for b in await db.brands.find({}).to_list(1000)}
    products = {p.get("id") or str(p.get("_id")): p["name"] for p in await db.products.find({}).to_list(1000)}

    return [BrandProductCatalogResponse(
        **map_id(item),
        brand_name=brands.get(item.get("brand_id")),
        product_name=products.get(item.get("product_id"))
    ) for item in items]
