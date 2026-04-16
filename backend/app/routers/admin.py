from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List, Optional
import uuid
from ..core.database import db
from ..core.auth import get_admin_user, get_current_user
from ..models.product import (
    CategoryCreate, CategoryResponse, BrandCreate, BrandResponse,
    SupermarketCreate, SupermarketResponse, UnitCreate, UnitResponse,
    ProductCreate, ProductResponse, SellableProductCreate, SellableProductResponse,
    SellableProductBulkCreate, ProductUnitCreate, ProductUnitResponse,
    SellableProductUnitCreate, SellableProductUnitResponse,
    BrandProductCatalogCreate, BrandProductCatalogBulkCreate, BrandProductCatalogResponse,
    AttributeCreate, AttributeResponse
)
import pandas as pd
import io
from fastapi.responses import StreamingResponse
from fastapi import UploadFile, File

router = APIRouter(prefix="/admin", tags=["admin"])

def map_id(doc):
    if doc and "id" not in doc and "_id" in doc:
        doc["id"] = str(doc["_id"])
    return doc

async def _sync_product_units_to_sellable_product(sellable_product_id: str, product_id: str):
    product_units = await db.product_units.find({"product_id": product_id}).to_list(1000)
    for pu in product_units:
        unit_id = pu.get("unit_id")
        if not unit_id:
            continue
        existing_spu = await db.sellable_product_units.find_one({
            "sellable_product_id": sellable_product_id,
            "unit_id": unit_id
        })
        if not existing_spu:
            await db.sellable_product_units.insert_one({
                "id": str(uuid.uuid4()),
                "sellable_product_id": sellable_product_id,
                "unit_id": unit_id
            })

async def _sync_product_unit_to_all_sellables(product_id: str, unit_id: str):
    sellable_products = await db.sellable_products.find({"product_id": product_id}).to_list(1000)
    for sp in sellable_products:
        sellable_product_id = sp.get("id") or str(sp.get("_id"))
        if not sellable_product_id:
            continue
        existing_spu = await db.sellable_product_units.find_one({
            "sellable_product_id": sellable_product_id,
            "unit_id": unit_id
        })
        if not existing_spu:
            await db.sellable_product_units.insert_one({
                "id": str(uuid.uuid4()),
                "sellable_product_id": sellable_product_id,
                "unit_id": unit_id
            })

async def _remove_product_unit_from_sellables(product_id: str, unit_id: str):
    sellable_products = await db.sellable_products.find({"product_id": product_id}).to_list(1000)
    sellable_ids = [sp.get("id") or str(sp.get("_id")) for sp in sellable_products]
    sellable_ids = [sid for sid in sellable_ids if sid]
    if not sellable_ids:
        return
    await db.sellable_product_units.delete_many({
        "sellable_product_id": {"$in": sellable_ids},
        "unit_id": unit_id
    })

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

# Attributes
@router.post("/attributes", response_model=AttributeResponse)
async def create_attribute(data: AttributeCreate, user: dict = Depends(get_admin_user)):
    attr_id = str(uuid.uuid4())
    doc = {"id": attr_id, "name": data.name, "description": data.description, "values": data.values}
    await db.attributes.insert_one(doc)
    return AttributeResponse(**doc)

@router.get("/attributes", response_model=List[AttributeResponse])
async def get_attributes(user: dict = Depends(get_current_user)):
    attrs = await db.attributes.find({}).to_list(1000)
    return [AttributeResponse(**map_id(a)) for a in attrs]

@router.put("/attributes/{attr_id}", response_model=AttributeResponse)
async def update_attribute(attr_id: str, data: AttributeCreate, user: dict = Depends(get_admin_user)):
    update_data = {"name": data.name, "description": data.description, "values": data.values}
    result = await db.attributes.update_one({"id": attr_id}, {"$set": update_data})
    if result.matched_count == 0:
        try:
            from bson import ObjectId
            result = await db.attributes.update_one({"_id": ObjectId(attr_id)}, {"$set": update_data})
        except: pass
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Attribute not found")
    return AttributeResponse(id=attr_id, **update_data)

@router.delete("/attributes/{attr_id}")
async def delete_attribute(attr_id: str, user: dict = Depends(get_admin_user)):
    result = await db.attributes.delete_one({"id": attr_id})
    if result.deleted_count == 0:
        try:
            from bson import ObjectId
            result = await db.attributes.delete_one({"_id": ObjectId(attr_id)})
        except: pass
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Attribute not found")
    return {"message": "Attribute deleted"}

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
        "image_url": data.image_url,
        "is_base": data.is_base,
        "allowed_attribute_ids": data.allowed_attribute_ids,
        "base_product_id": data.base_product_id,
        "attribute_values": data.attribute_values
    }
    await db.products.insert_one(doc)

    brand = await db.brands.find_one({"id": data.brand_id}, {"_id": 0}) if data.brand_id else None
    category = await db.categories.find_one({"id": data.category_id}, {"_id": 0})
    unit = await db.units.find_one({"id": data.unit_id}, {"_id": 0}) if data.unit_id else None
    base_product = await db.products.find_one({"id": data.base_product_id}, {"_id": 0}) if data.base_product_id else None

    return ProductResponse(
        **map_id(doc),
        brand_name=brand["name"] if brand else None,
        category_name=category["name"] if category else None,
        unit_name=unit["name"] if unit else None,
        base_product_name=base_product["name"] if base_product else None
    )

@router.get("/products", response_model=List[ProductResponse])
async def get_products(user: dict = Depends(get_current_user)):
    products_raw = await db.products.find({}).to_list(1000)
    brands = {b.get("id") or str(b.get("_id")): b["name"] for b in await db.brands.find({}).to_list(1000)}
    categories = {c.get("id") or str(c.get("_id")): c["name"] for c in await db.categories.find({}).to_list(1000)}
    units = {u.get("id") or str(u.get("_id")): u["name"] for u in await db.units.find({}).to_list(1000)}

    # Pre-map base products for inheritance
    base_prods = {p.get("id") or str(p.get("_id")): p for p in products_raw if p.get("is_base")}

    result = []
    for p in products_raw:
        p = map_id(p)
        base_id = p.get("base_product_id")
        base_p = base_prods.get(base_id) if base_id else None

        # Inherit Brand and Category if not set on variant
        # Note: If variant, p might not have brand_id, so it inherits from base if base has it.
        inherited_brand_id = p.get("brand_id") or (base_p.get("brand_id") if base_p else None)
        inherited_category_id = p.get("category_id") or (base_p.get("category_id") if base_p else None)
        inherited_unit_id = p.get("unit_id") or (base_p.get("unit_id") if base_p else None)

        # Build clean response dict
        # We explicitly pop the fields we are overriding to avoid duplicate arguments error in Pydantic
        resp_dict = dict(p)
        resp_dict.pop("brand_id", None)
        resp_dict.pop("category_id", None)
        resp_dict.pop("unit_id", None)

        result.append(ProductResponse(
            **resp_dict,
            brand_id=inherited_brand_id,
            brand_name=brands.get(inherited_brand_id),
            category_id=inherited_category_id or "",
            category_name=categories.get(inherited_category_id),
            unit_id=inherited_unit_id,
            unit_name=units.get(inherited_unit_id),
            base_product_name=base_p.get("name") if base_p else None
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
        "image_url": data.image_url,
        "is_base": data.is_base,
        "allowed_attribute_ids": data.allowed_attribute_ids,
        "base_product_id": data.base_product_id,
        "attribute_values": data.attribute_values
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
    base_product = await db.products.find_one({"id": data.base_product_id}, {"_id": 0}) if data.base_product_id else None

    return ProductResponse(
        id=prod_id,
        **update_data,
        brand_name=brand["name"] if brand else None,
        category_name=category["name"] if category else None,
        unit_name=unit["name"] if unit else None,
        base_product_name=base_product["name"] if base_product else None
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
@router.post("/sellable-products/bulk")
async def create_sellable_products_bulk(data: SellableProductBulkCreate, user: dict = Depends(get_admin_user)):
    results = []

    # Always link all active products of the brand to the supermarket
    brand_entries = await db.brand_product_catalog.find({
        "brand_id": data.brand_id,
        "status": "active"
    }).to_list(1000)

    for entry in brand_entries:
        pid = entry["product_id"]
        # We don't store variant attributes in sellable_products anymore
        # as availability is defined at Brand-Product level, and variants
        # are just combinations of allowed attributes.

        existing = await db.sellable_products.find_one({
            "supermarket_id": data.supermarket_id,
            "product_id": pid,
            "brand_id": data.brand_id
        })

        if not existing:
            sp_id = str(uuid.uuid4())
            doc = {
                "id": sp_id,
                "supermarket_id": data.supermarket_id,
                "product_id": pid,
                "brand_id": data.brand_id
            }
            await db.sellable_products.insert_one(doc)
            await _sync_product_units_to_sellable_product(sp_id, pid)
            results.append(pid)
        else:
            existing_sp_id = existing.get("id") or str(existing.get("_id"))
            if existing_sp_id:
                await _sync_product_units_to_sellable_product(existing_sp_id, pid)
    return {"message": f"Marca vinculada. {len(results)} productos operativos añadidos.", "product_ids": results}

@router.post("/sellable-products", response_model=SellableProductResponse)
async def create_sellable_product(data: SellableProductCreate, user: dict = Depends(get_admin_user)):
    sp_id = str(uuid.uuid4())
    doc = {
        "id": sp_id,
        "supermarket_id": data.supermarket_id,
        "product_id": data.product_id,
        "brand_id": data.brand_id,
        "attribute_values": data.attribute_values
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
    await _sync_product_units_to_sellable_product(sp_id, data.product_id)

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
        # Fallback: check if sp_id is actually a product_id and user wants to delete all variants (dangerous, but maybe helpful if UI is broken)
        # For now, let's just stick to 404 to be safe, but ensure the UI passes the right ID.
        raise HTTPException(status_code=404, detail=f"Sellable product with ID {sp_id} not found")

    await db.sellable_product_units.delete_many({"sellable_product_id": sp_id})
    return {"message": "Sellable product deleted"}

@router.delete("/supermarkets/{sm_id}/brands/{brand_id}")
async def delete_brand_from_supermarket(sm_id: str, brand_id: str, user: dict = Depends(get_admin_user)):
    # Find all sellable products for this brand in this supermarket to clean up units
    sps = await db.sellable_products.find({
        "supermarket_id": sm_id,
        "brand_id": brand_id
    }).to_list(1000)

    sp_ids = [sp.get("id") or str(sp.get("_id")) for sp in sps]

    # Delete associated units
    if sp_ids:
        await db.sellable_product_units.delete_many({"sellable_product_id": {"$in": sp_ids}})

    # Deletes all products of the brand in the supermarket
    result = await db.sellable_products.delete_many({
        "supermarket_id": sm_id,
        "brand_id": brand_id
    })

    return {"message": f"Brand removed from supermarket. {result.deleted_count} products deleted."}

# Product Units
@router.post("/product-units", response_model=ProductUnitResponse)
async def create_product_unit(data: ProductUnitCreate, user: dict = Depends(get_admin_user)):
    existing = await db.product_units.find_one({"product_id": data.product_id, "unit_id": data.unit_id})
    if existing:
        unit = await db.units.find_one({"id": data.unit_id}, {"_id": 0})
        return ProductUnitResponse(**map_id(existing), unit_name=unit["name"] if unit else None)

    pu_id = str(uuid.uuid4())
    doc = {"id": pu_id, "product_id": data.product_id, "unit_id": data.unit_id}
    await db.product_units.insert_one(doc)
    await _sync_product_unit_to_all_sellables(data.product_id, data.unit_id)
    unit = await db.units.find_one({"id": data.unit_id}, {"_id": 0})
    return ProductUnitResponse(**map_id(doc), unit_name=unit["name"] if unit else None)

@router.get("/product-units", response_model=List[ProductUnitResponse])
async def get_all_product_units(product_id: Optional[str] = None, user: dict = Depends(get_current_user)):
    query = {}
    if product_id:
        query["product_id"] = product_id
    items = await db.product_units.find(query).to_list(10000)
    units = {u.get("id") or str(u.get("_id")): u["name"] for u in await db.units.find({}).to_list(1000)}
    return [ProductUnitResponse(**map_id(item), unit_name=units.get(item.get("unit_id"))) for item in items]

@router.get("/product-units/{product_id}", response_model=List[ProductUnitResponse])
async def get_product_units(product_id: str, user: dict = Depends(get_current_user)):
    items = await db.product_units.find({"product_id": product_id}).to_list(1000)
    units = {u.get("id") or str(u.get("_id")): u["name"] for u in await db.units.find({}).to_list(1000)}
    return [ProductUnitResponse(**map_id(item), unit_name=units.get(item.get("unit_id"))) for item in items]

@router.delete("/product-units/{pu_id}")
async def delete_product_unit(pu_id: str, user: dict = Depends(get_admin_user)):
    item = await db.product_units.find_one({"id": pu_id})
    if not item:
        try:
            from bson import ObjectId
            item = await db.product_units.find_one({"_id": ObjectId(pu_id)})
        except:
            item = None
    if not item:
        raise HTTPException(status_code=404, detail="Product unit not found")

    result = await db.product_units.delete_one({"_id": item["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product unit not found")

    product_id = item.get("product_id")
    unit_id = item.get("unit_id")
    if product_id and unit_id:
        await _remove_product_unit_from_sellables(product_id, unit_id)

    return {"message": "Product unit deleted"}

@router.post("/product-units/rebuild")
async def rebuild_product_unit_relationships(user: dict = Depends(get_admin_user)):
    product_units = await db.product_units.find({}).to_list(20000)
    processed = 0
    for pu in product_units:
        product_id = pu.get("product_id")
        unit_id = pu.get("unit_id")
        if not product_id or not unit_id:
            continue
        await _sync_product_unit_to_all_sellables(product_id, unit_id)
        processed += 1

    return {"message": "Relaciones reconstruidas", "product_unit_links_processed": processed}

# Sellable Product Units
@router.post("/sellable-product-units", response_model=SellableProductUnitResponse)
async def create_sellable_product_unit(data: SellableProductUnitCreate, user: dict = Depends(get_admin_user)):
    existing = await db.sellable_product_units.find_one({
        "sellable_product_id": data.sellable_product_id,
        "unit_id": data.unit_id
    })
    if existing:
        unit = await db.units.find_one({"id": data.unit_id}, {"_id": 0})
        return SellableProductUnitResponse(**map_id(existing), unit_name=unit["name"] if unit else None)

    spu_id = str(uuid.uuid4())
    doc = {"id": spu_id, "sellable_product_id": data.sellable_product_id, "unit_id": data.unit_id}
    await db.sellable_product_units.insert_one(doc)
    unit = await db.units.find_one({"id": data.unit_id}, {"_id": 0})
    return SellableProductUnitResponse(**map_id(doc), unit_name=unit["name"] if unit else None)

@router.get("/sellable-product-units", response_model=List[SellableProductUnitResponse])
async def get_all_sellable_product_units(
    sellable_product_id: Optional[str] = None,
    product_id: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    query = {}
    if sellable_product_id:
        query["sellable_product_id"] = sellable_product_id
    elif product_id:
        sps = await db.sellable_products.find({"product_id": product_id}).to_list(1000)
        sp_ids = [(sp.get("id") or str(sp.get("_id"))) for sp in sps]
        sp_ids = [sid for sid in sp_ids if sid]
        if not sp_ids:
            return []
        query["sellable_product_id"] = {"$in": sp_ids}

    items = await db.sellable_product_units.find(query).to_list(10000)
    units = {u.get("id") or str(u.get("_id")): u["name"] for u in await db.units.find({}).to_list(1000)}
    return [SellableProductUnitResponse(**map_id(item), unit_name=units.get(item.get("unit_id"))) for item in items]

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
@router.post("/brand-catalog/bulk")
async def create_brand_catalog_bulk(data: BrandProductCatalogBulkCreate, user: dict = Depends(get_admin_user)):
    results = []
    for pid in data.product_ids:
        existing = await db.brand_product_catalog.find_one({
            "brand_id": data.brand_id,
            "product_id": pid
        })
        if existing:
            target_filter = {"id": existing["id"]} if "id" in existing else {"_id": existing["_id"]}
            await db.brand_product_catalog.update_one(
                target_filter,
                {"$set": {"status": data.status}}
            )
        else:
            bc_id = str(uuid.uuid4())
            doc = {
                "id": bc_id,
                "brand_id": data.brand_id,
                "product_id": pid,
                "status": data.status,
                "allowed_attributes": {}
            }
            await db.brand_product_catalog.insert_one(doc)
        results.append(pid)

    return {"message": f"{len(results)} productos añadidos al catálogo de marca", "product_ids": results}

@router.post("/brand-catalog", response_model=BrandProductCatalogResponse)
async def create_brand_catalog_entry(data: BrandProductCatalogCreate, user: dict = Depends(get_admin_user)):
    query = {
        "brand_id": data.brand_id,
        "product_id": data.product_id
    }
    existing = await db.brand_product_catalog.find_one(query)

    if existing:
        target_filter = {"id": existing["id"]} if "id" in existing else {"_id": existing["_id"]}
        await db.brand_product_catalog.update_one(
            target_filter,
            {"$set": {
                "status": data.status,
                "allowed_attributes": data.allowed_attributes
            }}
        )
        doc = {**existing, "status": data.status, "allowed_attributes": data.allowed_attributes}
    else:
        bc_id = str(uuid.uuid4())
        doc = {
            "id": bc_id,
            "brand_id": data.brand_id,
            "product_id": data.product_id,
            "status": data.status,
            "allowed_attributes": data.allowed_attributes
        }
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

@router.delete("/brand-catalog/{entry_id}")
async def delete_brand_catalog_entry(entry_id: str, user: dict = Depends(get_admin_user)):
    # Robust deletion
    result = await db.brand_product_catalog.delete_one({"id": entry_id})
    if result.deleted_count == 0:
        try:
            from bson import ObjectId
            result = await db.brand_product_catalog.delete_one({"_id": ObjectId(entry_id)})
        except: pass

    if result.deleted_count == 0:
        # One last try: check if it's a string _id in mongo (legacy data)
        result = await db.brand_product_catalog.delete_one({"_id": entry_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail=f"Catalog entry with ID {entry_id} not found")

    return {"message": "Brand catalog entry deleted"}

# --- SYSTEM MANAGEMENT (Bulk Export/Import) ---
@router.get("/system/export")
async def export_system_data(format: str = "xlsx", include_prices: bool = False, user: dict = Depends(get_admin_user)):
    collections = [
        "categories", "brands", "supermarkets", "attributes", 
        "units", "products", "product_units", "brand_product_catalog", 
        "sellable_products", "sellable_product_units"
    ]
    if include_prices:
        collections.append("prices")
    
    output = io.BytesIO()
    engine = 'openpyxl' if format == "xlsx" else 'odf'
    filename = f"pricehive_system_data.{format}"
    media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" if format == "xlsx" else "application/vnd.oasis.opendocument.spreadsheet"
    
    with pd.ExcelWriter(output, engine=engine) as writer:
        for coll in collections:
            data = await db[coll].find({}, {"_id": 0}).to_list(10000)
            if data:
                df = pd.DataFrame(data)
                df.to_excel(writer, sheet_name=coll, index=False)
            else:
                pd.DataFrame().to_excel(writer, sheet_name=coll, index=False)
                
    output.seek(0)
    return StreamingResponse(
        output,
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.post("/system/import")
async def import_system_data(file: UploadFile = File(...), user: dict = Depends(get_admin_user)):
    if not file.filename.endswith(('.xlsx', '.xls', '.ods')):
        raise HTTPException(status_code=400, detail="Only Excel (.xlsx, .xls) and OpenDocument (.ods) files are supported")
    
    contents = await file.read()
    df_dict = pd.read_excel(io.BytesIO(contents), sheet_name=None)
    
    results = {}
    import json
    import ast
    for sheet_name, df in df_dict.items():
        if df.empty:
            continue
            
        # Standard collections only
        valid_collections = [
            "categories", "brands", "supermarkets", "attributes", 
            "units", "products", "product_units", "brand_product_catalog", 
            "sellable_products", "sellable_product_units", "prices"
        ]
        
        if sheet_name not in valid_collections:
            continue
            
        records = df.to_dict(orient='records')
        
        # Clean records (remove NaNs which Mongo doesn't like)
        clean_records = []
        for rec in records:
            clean_rec = {k: v for k, v in rec.items() if pd.notnull(v)}
            
            # Special handling for JSON fields if they come back as strings
            # In Excel, dicts/lists often end up as strings like "{'a': 1}"
            for k, v in clean_rec.items():
                if isinstance(v, str) and ((v.startswith('{') and v.endswith('}')) or (v.startswith('[') and v.endswith(']'))):
                    try:
                        # Attempt to parse as strict JSON first for performance/security
                        clean_rec[k] = json.loads(v)
                    except json.JSONDecodeError:
                        try:
                            # Fallback to ast.literal_eval for Python-style string representations (single quotes)
                            # which are commonly produced by Excel exports of Python dicts
                            clean_rec[k] = ast.literal_eval(v)
                        except Exception:
                            pass
            
            clean_records.append(clean_rec)
        
        if not clean_records:
            continue
            
        # Bulk Upsert strategy: use 'id' as the key
        # If 'id' is missing, we can't upsert reliably, so we just insert
        ops = []
        for rec in clean_records:
            if "id" in rec:
                from pymongo import UpdateOne
                ops.append(UpdateOne({"id": rec["id"]}, {"$set": rec}, upsert=True))
        
        if ops:
            await db[sheet_name].bulk_write(ops)
            results[sheet_name] = len(ops)
        else:
            # If no "id", just insert many (less safe, but fallback)
            await db[sheet_name].insert_many(clean_records)
            results[sheet_name] = len(clean_records)
            
    return {"message": "Import completed successfully", "results": results}
