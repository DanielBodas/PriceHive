import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { Badge } from "../components/ui/badge";
import { Checkbox } from "../components/ui/checkbox";
import { toast } from "sonner";
import {
    Plus,
    Pencil,
    Trash2,
    Package,
    Tag,
    Store,
    Layers,
    Scale,
    BookOpen,
    Search,
    Link2
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminPage = () => {
    const [categories, setCategories] = useState([]);
    const [attributes, setAttributes] = useState([]);
    const [brands, setBrands] = useState([]);
    const [supermarkets, setSupermarkets] = useState([]);
    const [units, setUnits] = useState([]);
    const [products, setProducts] = useState([]);
    const [sellableProducts, setSellableProducts] = useState([]);
    const [brandCatalog, setBrandCatalog] = useState([]);
    const [loading, setLoading] = useState(true);

    // Dialog states
    const [categoryDialog, setCategoryDialog] = useState(false);
    const [attributeDialog, setAttributeDialog] = useState(false);
    const [brandDialog, setBrandDialog] = useState(false);
    const [supermarketDialog, setSupermarketDialog] = useState(false);
    const [unitDialog, setUnitDialog] = useState(false);
    const [productDialog, setProductDialog] = useState(false);
    const [sellableDialog, setSellableDialog] = useState(false);
    const [catalogDialog, setCatalogDialog] = useState(false);

    // Edit states
    const [editingItem, setEditingItem] = useState(null);

    // Form states
    const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
    const [attributeForm, setAttributeForm] = useState({ name: "", description: "" });
    const [brandForm, setBrandForm] = useState({ name: "", logo_url: "" });
    const [supermarketForm, setSupermarketForm] = useState({ name: "", logo_url: "" });
    const [unitForm, setUnitForm] = useState({ name: "", abbreviation: "" });
    const [productForm, setProductForm] = useState({
        name: "", brand_id: "", category_id: "", unit_id: "", barcode: "", image_url: "",
        is_base: false, allowed_attribute_ids: [], base_product_id: "", attribute_values: {}
    });
    const [sellableForm, setSellableForm] = useState({ supermarket_id: "", brand_id: "", product_ids: [] });
    const [catalogForm, setCatalogForm] = useState({ brand_id: "", product_ids: [], status: "active" });
    const [productSearch, setProductSearch] = useState("");
    const [productTableSearch, setProductTableSearch] = useState("");
    const [categoryTableSearch, setCategoryTableSearch] = useState("");
    const [attributeTableSearch, setAttributeTableSearch] = useState("");
    const [brandTableSearch, setBrandTableSearch] = useState("");
    const [supermarketTableSearch, setSupermarketTableSearch] = useState("");
    const [unitTableSearch, setUnitTableSearch] = useState("");
    const [sellableTableSearch, setSellableTableSearch] = useState("");
    const [catalogTableSearch, setCatalogTableSearch] = useState("");
    const [allProductUnits, setAllProductUnits] = useState([]);

    // Product-units catalog
    const [relationProductSearch, setRelationProductSearch] = useState("");
    const [relationProductId, setRelationProductId] = useState("");
    const [relationUnitSearch, setRelationUnitSearch] = useState("");
    const [relationSelectedUnitIds, setRelationSelectedUnitIds] = useState([]);
    const [relationExistingUnits, setRelationExistingUnits] = useState([]);
    const [relationOnlyMissingUnits, setRelationOnlyMissingUnits] = useState(false);
    const [relationLoading, setRelationLoading] = useState(false);
    const [relationSaving, setRelationSaving] = useState(false);
    const [relationRebuildLoading, setRelationRebuildLoading] = useState(false);
    const [productUnitDialog, setProductUnitDialog] = useState(false);

    // Catalog status editor
    const [catalogStatusDialog, setCatalogStatusDialog] = useState(false);
    const [catalogStatusForm, setCatalogStatusForm] = useState({
        brand_id: "",
        product_id: "",
        brand_name: "",
        product_name: "",
        status: "active",
    });
    const [sellableEditDialog, setSellableEditDialog] = useState(false);
    const [sellableEditForm, setSellableEditForm] = useState({
        id: "",
        supermarket_id: "",
        brand_id: "",
        product_id: "",
    });
    const [sellableEditSaving, setSellableEditSaving] = useState(false);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            const [catsRes, attrsRes, brandsRes, smsRes, unitsRes, prodsRes, sellableRes, catalogRes, productUnitsRes] = await Promise.all([
                axios.get(`${API}/admin/categories`),
                axios.get(`${API}/admin/attributes`),
                axios.get(`${API}/admin/brands`),
                axios.get(`${API}/admin/supermarkets`),
                axios.get(`${API}/admin/units`),
                axios.get(`${API}/admin/products`),
                axios.get(`${API}/admin/sellable-products`),
                axios.get(`${API}/admin/brand-catalog`),
                axios.get(`${API}/admin/product-units`)
            ]);
            setCategories(catsRes.data);
            setAttributes(attrsRes.data);
            setBrands(brandsRes.data);
            setSupermarkets(smsRes.data);
            setUnits(unitsRes.data);
            setProducts(prodsRes.data);
            setSellableProducts(sellableRes.data);
            setBrandCatalog(catalogRes.data);
            setAllProductUnits(productUnitsRes.data || []);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Error al cargar datos");
        } finally {
            setLoading(false);
        }
    };

    const getFilteredProducts = (text) => {
        const q = (text || "").toLowerCase().trim();
        if (!q) return products;
        return products.filter((p) =>
            (p.name || "").toLowerCase().includes(q) ||
            (p.brand_name || "").toLowerCase().includes(q) ||
            (p.category_name || "").toLowerCase().includes(q)
        );
    };

    const filteredCategoriesTable = categories.filter((c) => {
        const q = (categoryTableSearch || "").toLowerCase().trim();
        if (!q) return true;
        return (
            (c.name || "").toLowerCase().includes(q) ||
            (c.description || "").toLowerCase().includes(q)
        );
    });
    const filteredAttributesTable = attributes.filter((a) => {
        const q = (attributeTableSearch || "").toLowerCase().trim();
        if (!q) return true;
        return (
            (a.name || "").toLowerCase().includes(q) ||
            (a.description || "").toLowerCase().includes(q)
        );
    });
    const filteredProductsTable = getFilteredProducts(productTableSearch);
    const filteredBrandsTable = brands.filter((b) => {
        const q = (brandTableSearch || "").toLowerCase().trim();
        if (!q) return true;
        return (b.name || "").toLowerCase().includes(q);
    });
    const filteredSupermarketsTable = supermarkets.filter((s) => {
        const q = (supermarketTableSearch || "").toLowerCase().trim();
        if (!q) return true;
        return (s.name || "").toLowerCase().includes(q);
    });
    const filteredUnitsTable = units.filter((u) => {
        const q = (unitTableSearch || "").toLowerCase().trim();
        if (!q) return true;
        return (
            (u.name || "").toLowerCase().includes(q) ||
            (u.abbreviation || "").toLowerCase().includes(q)
        );
    });

    const productUnitCountByProduct = allProductUnits.reduce((acc, item) => {
        const productId = item.product_id;
        if (!productId) return acc;
        acc[productId] = (acc[productId] || 0) + 1;
        return acc;
    }, {});
    const unitNamesByProduct = allProductUnits.reduce((acc, entry) => {
        const productId = entry.product_id;
        if (!productId) return acc;
        if (!acc[productId]) acc[productId] = [];
        if (!acc[productId].some((u) => u.unit_id === entry.unit_id)) {
            acc[productId].push({ unit_id: entry.unit_id, unit_name: entry.unit_name });
        }
        return acc;
    }, {});

    const filteredRelationProducts = getFilteredProducts(relationProductSearch)
        .map((p) => ({
            ...p,
            allowed_units_count: productUnitCountByProduct[p.id] || 0,
        }))
        .filter((p) => !relationOnlyMissingUnits || p.allowed_units_count === 0)
        .sort((a, b) => {
            if (a.allowed_units_count === 0 && b.allowed_units_count > 0) return -1;
            if (b.allowed_units_count === 0 && a.allowed_units_count > 0) return 1;
            return (a.name || "").localeCompare(b.name || "");
        });
    const filteredUnitsForRelation = units.filter((u) => {
        const q = (relationUnitSearch || "").toLowerCase().trim();
        if (!q) return true;
        return (
            (u.name || "").toLowerCase().includes(q) ||
            (u.abbreviation || "").toLowerCase().includes(q)
        );
    });
    const selectedRelationProduct = products.find((p) => p.id === relationProductId);
    const relationConfiguredProductsCount = products.filter((p) => (productUnitCountByProduct[p.id] || 0) > 0).length;
    const relationProductsWithoutUnitsCount = Math.max(products.length - relationConfiguredProductsCount, 0);

    const filteredSellableTable = sellableProducts.filter((sp) => {
        const q = (sellableTableSearch || "").toLowerCase().trim();
        if (!q) return true;
        return (
            (sp.supermarket_name || "").toLowerCase().includes(q) ||
            (sp.brand_name || "").toLowerCase().includes(q) ||
            (sp.product_name || "").toLowerCase().includes(q)
        );
    });
    const filteredCatalogTable = brandCatalog.filter((bc) => {
        const q = (catalogTableSearch || "").toLowerCase().trim();
        if (!q) return true;
        return (
            (bc.brand_name || "").toLowerCase().includes(q) ||
            (bc.product_name || "").toLowerCase().includes(q) ||
            (bc.status || "").toLowerCase().includes(q)
        );
    });

    const brandCatalogStatusByBrandProduct = brandCatalog.reduce((acc, entry) => {
        const key = `${entry.brand_id || ""}::${entry.product_id || ""}`;
        acc[key] = entry.status || null;
        return acc;
    }, {});

    const supermarketCatalogTree = Object.values(
        filteredSellableTable.reduce((acc, row) => {
            const supermarketId = row.supermarket_id || row.supermarket_name || "unknown-supermarket";
            const brandId = row.brand_id || row.brand_name || "unknown-brand";
            const productId = row.product_id || row.product_name || row.id;
            if (!acc[supermarketId]) {
                acc[supermarketId] = { id: supermarketId, name: row.supermarket_name || "Sin supermercado", brands: {} };
            }
            if (!acc[supermarketId].brands[brandId]) {
                acc[supermarketId].brands[brandId] = { id: brandId, name: row.brand_name || "Sin marca", products: {} };
            }
            if (!acc[supermarketId].brands[brandId].products[productId]) {
                acc[supermarketId].brands[brandId].products[productId] = {
                    id: productId,
                    name: row.product_name || "Sin producto",
                    brand_id: row.brand_id,
                    product_id: row.product_id,
                    brand_name: row.brand_name,
                    product_name: row.product_name,
                    status: brandCatalogStatusByBrandProduct[`${row.brand_id || ""}::${row.product_id || ""}`] || "missing",
                    sellable_ids: [],
                };
            }
            acc[supermarketId].brands[brandId].products[productId].sellable_ids.push(row.id);
            return acc;
        }, {})
    )
        .map((supermarket) => {
            const brandsList = Object.values(supermarket.brands).map((brand) => ({
                ...brand,
                products: Object.values(brand.products).sort((a, b) => a.name.localeCompare(b.name)),
            }));
            return {
                ...supermarket,
                brands: brandsList.sort((a, b) => a.name.localeCompare(b.name)),
                brands_count: brandsList.length,
                products_count: brandsList.reduce((acc, brand) => acc + brand.products.length, 0),
            };
        })
        .sort((a, b) => a.name.localeCompare(b.name));

    const supermarketsByBrandProduct = sellableProducts.reduce((acc, row) => {
        const key = `${row.brand_id || ""}::${row.product_id || ""}`;
        if (!acc[key]) acc[key] = {};
        const supermarketId = row.supermarket_id || row.supermarket_name || "unknown-supermarket";
        acc[key][supermarketId] = row.supermarket_name || "Sin supermercado";
        return acc;
    }, {});

    const brandCatalogTree = Object.values(
        filteredCatalogTable.reduce((acc, row) => {
            const brandId = row.brand_id || row.brand_name || "unknown-brand";
            const productId = row.product_id || row.product_name || row.id;
            const key = `${row.brand_id || ""}::${row.product_id || ""}`;
            if (!acc[brandId]) {
                acc[brandId] = { id: brandId, name: row.brand_name || "Sin marca", products: {} };
            }
            acc[brandId].products[productId] = {
                id: productId,
                name: row.product_name || "Sin producto",
                status: row.status || "unknown",
                brand_id: row.brand_id,
                product_id: row.product_id,
                brand_name: row.brand_name,
                product_name: row.product_name,
                supermarkets: Object.values(supermarketsByBrandProduct[key] || {}).sort((a, b) => a.localeCompare(b)),
            };
            return acc;
        }, {})
    )
        .map((brand) => {
            const productsList = Object.values(brand.products).sort((a, b) => a.name.localeCompare(b.name));
            return { ...brand, products: productsList, products_count: productsList.length };
        })
        .sort((a, b) => a.name.localeCompare(b.name));

    const sellableCount = sellableProducts.length;
    const sellableSupermarketCount = new Set(sellableProducts.map((sp) => sp.supermarket_id).filter(Boolean)).size;
    const sellableBrandCount = new Set(sellableProducts.map((sp) => sp.brand_id).filter(Boolean)).size;
    const sellableProductCount = new Set(sellableProducts.map((sp) => sp.product_id).filter(Boolean)).size;
    const brandCatalogCount = brandCatalog.length;
    const brandCatalogActiveCount = brandCatalog.filter((bc) => bc.status === "active").length;
    const brandCatalogPlannedCount = brandCatalog.filter((bc) => bc.status === "planned").length;
    const brandCatalogDiscontinuedCount = brandCatalog.filter((bc) => bc.status === "discontinued").length;
    const sellableWithoutBrandCatalogCount = sellableProducts.filter((sp) => {
        const key = `${sp.brand_id || ""}::${sp.product_id || ""}`;
        return !brandCatalogStatusByBrandProduct[key];
    }).length;
    const unitCoveragePct = products.length > 0
        ? Math.round((relationConfiguredProductsCount / products.length) * 100)
        : 0;
    const sellableCatalogCoveragePct = sellableCount > 0
        ? Math.round(((sellableCount - sellableWithoutBrandCatalogCount) / sellableCount) * 100)
        : 100;

    const sellablesBySupermarket = Object.values(
        sellableProducts.reduce((acc, row) => {
            const key = row.supermarket_id || row.supermarket_name || "unknown-supermarket";
            if (!acc[key]) acc[key] = { id: key, name: row.supermarket_name || "Sin supermercado", count: 0 };
            acc[key].count += 1;
            return acc;
        }, {})
    ).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    const sellablesByBrand = Object.values(
        sellableProducts.reduce((acc, row) => {
            const key = row.brand_id || row.brand_name || "unknown-brand";
            if (!acc[key]) acc[key] = { id: key, name: row.brand_name || "Sin marca", count: 0 };
            acc[key].count += 1;
            return acc;
        }, {})
    ).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    const getCatalogStatusMeta = (status) => {
        if (status === "active") return { label: "Activo", className: "bg-emerald-100 text-emerald-700 border border-emerald-200" };
        if (status === "planned") return { label: "Planeado", className: "bg-blue-100 text-blue-700 border border-blue-200" };
        if (status === "discontinued") return { label: "Descatalogado", className: "bg-rose-100 text-rose-700 border border-rose-200" };
        return { label: "Sin estado", className: "bg-slate-100 text-slate-700 border border-slate-200" };
    };

    const refreshRelationData = async (productId) => {
        if (!productId) {
            setRelationExistingUnits([]);
            setRelationSelectedUnitIds([]);
            return;
        }

        setRelationLoading(true);
        try {
            const productUnitsRes = await axios.get(`${API}/admin/product-units/${productId}`);
            const productUnits = productUnitsRes.data || [];
            setRelationExistingUnits(productUnits);
            setRelationSelectedUnitIds(productUnits.map((u) => u.unit_id));
        } catch (error) {
            console.error("Error loading relation data:", error);
            toast.error("No se pudo cargar la relacion producto-unidades");
        } finally {
            setRelationLoading(false);
        }
    };

    useEffect(() => {
        if (relationProductId) refreshRelationData(relationProductId);
    }, [relationProductId]);

    const toggleRelationUnit = (unitId, checked) => {
        if (checked === true) {
            setRelationSelectedUnitIds((prev) => [...new Set([...prev, unitId])]);
        } else {
            setRelationSelectedUnitIds((prev) => prev.filter((id) => id !== unitId));
        }
    };

    const handleSaveProductUnits = async () => {
        if (!relationProductId) {
            toast.error("Selecciona un producto");
            return;
        }

        setRelationSaving(true);
        try {
            const existingByUnit = new Map(relationExistingUnits.map((pu) => [pu.unit_id, pu]));
            const nextUnitSet = new Set(relationSelectedUnitIds);
            const toCreate = relationSelectedUnitIds.filter((unitId) => !existingByUnit.has(unitId));
            const toDelete = relationExistingUnits.filter((pu) => !nextUnitSet.has(pu.unit_id));

            await Promise.all([
                ...toCreate.map((unitId) =>
                    axios.post(`${API}/admin/product-units`, { product_id: relationProductId, unit_id: unitId })
                ),
                ...toDelete.map((pu) => axios.delete(`${API}/admin/product-units/${pu.id}`))
            ]);

            toast.success(`Catalogo de unidades actualizado (${toCreate.length} altas, ${toDelete.length} bajas)`);
            await fetchAllData();
            await refreshRelationData(relationProductId);
            setProductUnitDialog(false);
        } catch (error) {
            console.error("Error saving product units:", error);
            toast.error("No se pudo guardar el catalogo de unidades");
        } finally {
            setRelationSaving(false);
        }
    };

    const handleRebuildProductUnitRelationships = async () => {
        setRelationRebuildLoading(true);
        try {
            const response = await axios.post(`${API}/admin/product-units/rebuild`);
            toast.success(`${response.data.message}: ${response.data.product_unit_links_processed} relaciones procesadas`);
            await fetchAllData();
        } catch (error) {
            console.error("Error rebuilding relations:", error);
            toast.error("No se pudo reconstruir el catalogo de unidades");
        } finally {
            setRelationRebuildLoading(false);
        }
    };

    const openProductUnitDialog = async (productId) => {
        setRelationProductId(productId);
        setRelationUnitSearch("");
        setProductUnitDialog(true);
        await refreshRelationData(productId);
    };

    const handleSaveCategory = async () => {
        try {
            if (editingItem) await axios.put(`${API}/admin/categories/${editingItem.id}`, categoryForm);
            else await axios.post(`${API}/admin/categories`, categoryForm);
            fetchAllData(); setCategoryDialog(false); setCategoryForm({ name: "", description: "" }); setEditingItem(null);
            toast.success("Categoría guardada");
        } catch (error) { toast.error("Error al guardar"); }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm("¿Eliminar?")) return;
        try { await axios.delete(`${API}/admin/categories/${id}`); fetchAllData(); toast.success("Eliminado"); } catch (e) { toast.error("Error"); }
    };

    const handleSaveAttribute = async () => {
        try {
            if (editingItem) await axios.put(`${API}/admin/attributes/${editingItem.id}`, attributeForm);
            else await axios.post(`${API}/admin/attributes`, attributeForm);
            fetchAllData(); setAttributeDialog(false); setAttributeForm({ name: "", description: "" }); setEditingItem(null);
            toast.success("Atributo guardado");
        } catch (error) { toast.error("Error al guardar"); }
    };

    const handleDeleteAttribute = async (id) => {
        if (!window.confirm("¿Eliminar?")) return;
        try { await axios.delete(`${API}/admin/attributes/${id}`); fetchAllData(); toast.success("Eliminado"); } catch (e) { toast.error("Error"); }
    };

    const handleSaveBrand = async () => {
        try {
            if (editingItem) await axios.put(`${API}/admin/brands/${editingItem.id}`, brandForm);
            else await axios.post(`${API}/admin/brands`, brandForm);
            fetchAllData(); setBrandDialog(false); setBrandForm({ name: "", logo_url: "" }); setEditingItem(null);
            toast.success("Marca guardada");
        } catch (e) { toast.error("Error"); }
    };

    const handleDeleteBrand = async (id) => {
        if (!window.confirm("Ãƒâ€šÃ‚Â¿Eliminar?")) return;
        try { await axios.delete(`${API}/admin/brands/${id}`); fetchAllData(); toast.success("Eliminado"); } catch (e) { toast.error("Error"); }
    };

    const handleSaveSupermarket = async () => {
        try {
            if (editingItem) await axios.put(`${API}/admin/supermarkets/${editingItem.id}`, supermarketForm);
            else await axios.post(`${API}/admin/supermarkets`, supermarketForm);
            fetchAllData(); setSupermarketDialog(false); setSupermarketForm({ name: "", logo_url: "" }); setEditingItem(null);
            toast.success("Supermercado guardado");
        } catch (e) { toast.error("Error"); }
    };

    const handleDeleteSupermarket = async (id) => {
        if (!window.confirm("Ãƒâ€šÃ‚Â¿Eliminar?")) return;
        try { await axios.delete(`${API}/admin/supermarkets/${id}`); fetchAllData(); toast.success("Eliminado"); } catch (e) { toast.error("Error"); }
    };

    const handleSaveUnit = async () => {
        try {
            if (editingItem) await axios.put(`${API}/admin/units/${editingItem.id}`, unitForm);
            else await axios.post(`${API}/admin/units`, unitForm);
            fetchAllData(); setUnitDialog(false); setUnitForm({ name: "", abbreviation: "" }); setEditingItem(null);
            toast.success("Unidad guardada");
        } catch (e) { toast.error("Error"); }
    };

    const handleDeleteUnit = async (id) => {
        if (!window.confirm("Ãƒâ€šÃ‚Â¿Eliminar?")) return;
        try { await axios.delete(`${API}/admin/units/${id}`); fetchAllData(); toast.success("Eliminado"); } catch (e) { toast.error("Error"); }
    };

    const handleSaveProduct = async () => {
        try {
            const payload = {
                ...productForm,
                brand_id: productForm.brand_id || null,
                unit_id: productForm.unit_id || null,
                barcode: productForm.barcode || null,
                image_url: productForm.image_url || null,
                base_product_id: productForm.base_product_id || null,
                is_base: !!productForm.is_base,
                allowed_attribute_ids: productForm.allowed_attribute_ids || [],
                attribute_values: productForm.attribute_values || {}
            };
            if (editingItem) await axios.put(`${API}/admin/products/${editingItem.id}`, payload);
            else await axios.post(`${API}/admin/products`, payload);
            fetchAllData(); setProductDialog(false); setEditingItem(null);
            toast.success("Producto guardado");
        } catch (e) { toast.error("Error"); }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm("Ãƒâ€šÃ‚Â¿Eliminar?")) return;
        try { await axios.delete(`${API}/admin/products/${id}`); fetchAllData(); toast.success("Eliminado"); } catch (e) { toast.error("Error"); }
    };

    const handleSaveSellable = async () => {
        try {
            if (sellableForm.product_ids.length === 0) {
                toast.error("Selecciona al menos un producto");
                return;
            }
            const res = await axios.post(`${API}/admin/sellable-products/bulk`, sellableForm);
            toast.success(res.data.message);
            fetchAllData();
            setSellableDialog(false);
            setSellableForm({ supermarket_id: "", brand_id: "", product_ids: [] });
            setProductSearch("");
        } catch (e) { toast.error("Error al vincular"); }
    };

    const handleDeleteSellable = async (id) => {
        if (!window.confirm("Ãƒâ€šÃ‚Â¿Eliminar este producto del supermercado?")) return;
        try { await axios.delete(`${API}/admin/sellable-products/${id}`); fetchAllData(); toast.success("Eliminado"); } catch (e) { toast.error("Error"); }
    };

    const handleDeleteSellableGroup = async (ids) => {
        if (!ids || ids.length === 0) return;
        if (!window.confirm(`Se eliminaran ${ids.length} vinculaciones operativas. Continuar?`)) return;
        try {
            await Promise.all(ids.map((id) => axios.delete(`${API}/admin/sellable-products/${id}`)));
            toast.success("Vinculaciones eliminadas");
            await fetchAllData();
        } catch (error) {
            console.error("Error deleting sellable group:", error);
            toast.error("No se pudieron eliminar las vinculaciones");
        }
    };

    const openSellableEditor = ({ id, supermarket_id, brand_id, product_id }) => {
        if (!id || !supermarket_id || !brand_id || !product_id) {
            toast.error("No se puede editar este registro");
            return;
        }
        setSellableEditForm({ id, supermarket_id, brand_id, product_id });
        setSellableEditDialog(true);
    };

    const handleSaveSellableEdit = async () => {
        if (!sellableEditForm.id || !sellableEditForm.supermarket_id || !sellableEditForm.brand_id || !sellableEditForm.product_id) {
            toast.error("Completa todos los campos");
            return;
        }

        const current = sellableProducts.find((sp) => sp.id === sellableEditForm.id);
        if (!current) {
            toast.error("No se encontro el vinculo original");
            return;
        }

        const noChanges =
            current.supermarket_id === sellableEditForm.supermarket_id &&
            current.brand_id === sellableEditForm.brand_id &&
            current.product_id === sellableEditForm.product_id;
        if (noChanges) {
            setSellableEditDialog(false);
            return;
        }

        const duplicate = sellableProducts.find(
            (sp) =>
                sp.id !== sellableEditForm.id &&
                sp.supermarket_id === sellableEditForm.supermarket_id &&
                sp.brand_id === sellableEditForm.brand_id &&
                sp.product_id === sellableEditForm.product_id
        );
        if (duplicate) {
            toast.error("Ya existe ese vinculo en catalogo supermercado");
            return;
        }

        setSellableEditSaving(true);
        try {
            await axios.post(`${API}/admin/sellable-products`, {
                supermarket_id: sellableEditForm.supermarket_id,
                brand_id: sellableEditForm.brand_id,
                product_id: sellableEditForm.product_id
            });
            await axios.delete(`${API}/admin/sellable-products/${sellableEditForm.id}`);
            toast.success("Vinculo operativo actualizado");
            setSellableEditDialog(false);
            await fetchAllData();
        } catch (error) {
            console.error("Error saving sellable edit:", error);
            toast.error("No se pudo actualizar el vinculo");
        } finally {
            setSellableEditSaving(false);
        }
    };

    const handleSaveCatalog = async () => {
        try {
            if (catalogForm.product_ids.length === 0) {
                toast.error("Selecciona al menos un producto");
                return;
            }
            const res = await axios.post(`${API}/admin/brand-catalog/bulk`, catalogForm);
            toast.success(res.data.message);
            fetchAllData();
            setCatalogDialog(false);
            setCatalogForm({ brand_id: "", product_ids: [], status: "active" });
            setProductSearch("");
        } catch (e) { toast.error("Error al actualizar catÃƒÆ’Ã‚Â¡logo"); }
    };


    const openCatalogStatusEditor = ({ brand_id, product_id, status, brand_name, product_name }) => {
        if (!brand_id || !product_id) {
            toast.error("No se puede editar el estado de este registro");
            return;
        }
        setCatalogStatusForm({
            brand_id,
            product_id,
            status: status || "active",
            brand_name: brand_name || "",
            product_name: product_name || ""
        });
        setCatalogStatusDialog(true);
    };

    const handleSaveCatalogStatus = async () => {
        try {
            await axios.post(`${API}/admin/brand-catalog`, {
                brand_id: catalogStatusForm.brand_id,
                product_id: catalogStatusForm.product_id,
                status: catalogStatusForm.status
            });
            toast.success("Estado del catalogo actualizado");
            setCatalogStatusDialog(false);
            await fetchAllData();
        } catch (error) {
            console.error("Error saving catalog status:", error);
            toast.error("No se pudo actualizar el estado del catalogo");
        }
    };

    if (loading) return <Layout><div className="flex items-center justify-center min-h-[400px]">Cargando panel de administracion...</div></Layout>;

    return (
        <Layout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        Panel de Administracion
                    </h1>
                    <p className="text-slate-500 mt-1">Gestion avanzada del sistema</p>
                </div>

                <Tabs defaultValue="catalogos" className="space-y-6">
                    <TabsList className="bg-slate-100 p-1 flex-wrap h-auto">
                        <TabsTrigger value="maestros" className="gap-2 data-[state=active]:bg-white">
                            <Package className="w-4 h-4" /> Datos Base
                        </TabsTrigger>
                        <TabsTrigger value="catalogos" className="gap-2 data-[state=active]:bg-white">
                            <BookOpen className="w-4 h-4" /> Catalogos
                        </TabsTrigger>
                        <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-white">
                            <Layers className="w-4 h-4" /> Vision General
                        </TabsTrigger>
                    </TabsList>

                    {/* SECCIÃƒÆ’Ã¢â‚¬Å“N COSAS UNITARIAS */}
                    <TabsContent value="maestros" className="space-y-6">
                        <Tabs defaultValue="categories">
                            <TabsList className="bg-slate-50 border p-1 mb-4 flex-wrap h-auto">
                                <TabsTrigger value="categories" className="gap-2" data-testid="tab-categories"><Layers className="w-4 h-4" /> Categorias</TabsTrigger>
                                <TabsTrigger value="attributes" className="gap-2" data-testid="tab-attributes"><Tag className="w-4 h-4" /> Atributos</TabsTrigger>
                                <TabsTrigger value="products" className="gap-2" data-testid="tab-products"><Package className="w-4 h-4" /> Productos</TabsTrigger>
                                <TabsTrigger value="brands" className="gap-2" data-testid="tab-brands"><Tag className="w-4 h-4" /> Marcas</TabsTrigger>
                                <TabsTrigger value="supermarkets" className="gap-2" data-testid="tab-supermarkets"><Store className="w-4 h-4" /> Supermercados</TabsTrigger>
                                <TabsTrigger value="units" className="gap-2" data-testid="tab-units"><Scale className="w-4 h-4" /> Unidades</TabsTrigger>
                            </TabsList>

                            {/* Contenidos de Cosas Unitarias */}
                            <TabsContent value="products">
                                <Card>
                                    <CardHeader className="space-y-4">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <CardTitle className="text-lg">Productos</CardTitle>
                                                <p className="text-sm text-slate-500 mt-1">{filteredProductsTable.length} registros</p>
                                            </div>
                                            <Button onClick={() => { setEditingItem(null); setProductForm({ name: "", brand_id: "", category_id: "", unit_id: "", barcode: "", image_url: "" }); setProductDialog(true); }} className="bg-emerald-500" data-testid="new-product-btn"><Plus className="w-4 h-4 mr-2" /> Nuevo Producto</Button>
                                        </div>
                                        <div className="relative">
                                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <Input value={productTableSearch} onChange={(e) => setProductTableSearch(e.target.value)} placeholder="Buscar por producto, marca o categoria" className="pl-9" />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Categoria</TableHead><TableHead>Tipo/Info</TableHead><TableHead className="w-24 text-right pr-4">Acciones</TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {filteredProductsTable.map(p => (
                                                    <TableRow key={p.id}>
                                                        <TableCell className="font-medium">
                                                            {p.name}
                                                            {p.attribute_values && Object.entries(p.attribute_values).length > 0 && (
                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                    {Object.entries(p.attribute_values).map(([attrId, val]) => {
                                                                        const attr = attributes.find(a => a.id === attrId);
                                                                        return <Badge key={attrId} variant="outline" className="text-[10px]">{attr?.name}: {val}</Badge>
                                                                    })}
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>{p.category_name}</TableCell>
                                                        <TableCell>
                                                            {p.is_base ? <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">Producto Base</Badge> : (p.base_product_name ? <Badge variant="outline">Variante de {p.base_product_name}</Badge> : "-")}
                                                        </TableCell>
                                                        <TableCell className="flex justify-end gap-1 pr-4">
                                                            <Button variant="ghost" size="icon" onClick={() => { setEditingItem(p); setProductForm({ ...p, attribute_values: p.attribute_values || {} }); setProductDialog(true); }}><Pencil className="w-4 h-4" /></Button>
                                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(p.id)} className="text-rose-600"><Trash2 className="w-4 h-4" /></Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="attributes">
                                <Card>
                                    <CardHeader className="space-y-4">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <CardTitle className="text-lg">Atributos de Producto</CardTitle>
                                                <p className="text-sm text-slate-500 mt-1">{filteredAttributesTable.length} registros</p>
                                            </div>
                                            <Button onClick={() => { setEditingItem(null); setAttributeForm({ name: "", description: "" }); setAttributeDialog(true); }} className="bg-emerald-500"><Plus className="w-4 h-4 mr-2" /> Nuevo Atributo</Button>
                                        </div>
                                        <div className="relative">
                                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <Input value={attributeTableSearch} onChange={(e) => setAttributeTableSearch(e.target.value)} placeholder="Buscar atributo" className="pl-9" />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Descripción</TableHead><TableHead className="w-24 text-right pr-4">Acciones</TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {filteredAttributesTable.map(a => (
                                                    <TableRow key={a.id}>
                                                        <TableCell className="font-medium">{a.name}</TableCell>
                                                        <TableCell>{a.description}</TableCell>
                                                        <TableCell className="flex justify-end gap-1 pr-4">
                                                            <Button variant="ghost" size="icon" onClick={() => { setEditingItem(a); setAttributeForm(a); setAttributeDialog(true); }}><Pencil className="w-4 h-4" /></Button>
                                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteAttribute(a.id)} className="text-rose-600"><Trash2 className="w-4 h-4" /></Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="brands">
                                <Card>
                                    <CardHeader className="space-y-4">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <CardTitle className="text-lg">Marcas</CardTitle>
                                                <p className="text-sm text-slate-500 mt-1">{filteredBrandsTable.length} registros</p>
                                            </div>
                                            <Button onClick={() => { setEditingItem(null); setBrandForm({ name: "", logo_url: "" }); setBrandDialog(true); }} className="bg-emerald-500"><Plus className="w-4 h-4 mr-2" /> Nueva Marca</Button>
                                        </div>
                                        <div className="relative">
                                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <Input value={brandTableSearch} onChange={(e) => setBrandTableSearch(e.target.value)} placeholder="Buscar marca" className="pl-9" />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead className="w-24 text-right pr-4">Acciones</TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {filteredBrandsTable.map(b => (
                                                    <TableRow key={b.id}>
                                                        <TableCell className="font-medium">{b.name}</TableCell>
                                                        <TableCell className="flex justify-end gap-1 pr-4">
                                                            <Button variant="ghost" size="icon" onClick={() => { setEditingItem(b); setBrandForm(b); setBrandDialog(true); }}><Pencil className="w-4 h-4" /></Button>
                                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteBrand(b.id)} className="text-rose-600"><Trash2 className="w-4 h-4" /></Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="supermarkets">
                                <Card>
                                    <CardHeader className="space-y-4">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <CardTitle className="text-lg">Supermercados</CardTitle>
                                                <p className="text-sm text-slate-500 mt-1">{filteredSupermarketsTable.length} registros</p>
                                            </div>
                                            <Button onClick={() => { setEditingItem(null); setSupermarketForm({ name: "", logo_url: "" }); setSupermarketDialog(true); }} className="bg-emerald-500"><Plus className="w-4 h-4 mr-2" /> Nuevo Supermercado</Button>
                                        </div>
                                        <div className="relative">
                                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <Input value={supermarketTableSearch} onChange={(e) => setSupermarketTableSearch(e.target.value)} placeholder="Buscar supermercado" className="pl-9" />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead className="w-24 text-right pr-4">Acciones</TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {filteredSupermarketsTable.map(s => (
                                                    <TableRow key={s.id}>
                                                        <TableCell className="font-medium">{s.name}</TableCell>
                                                        <TableCell className="flex justify-end gap-1 pr-4">
                                                            <Button variant="ghost" size="icon" onClick={() => { setEditingItem(s); setSupermarketForm(s); setSupermarketDialog(true); }}><Pencil className="w-4 h-4" /></Button>
                                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteSupermarket(s.id)} className="text-rose-600"><Trash2 className="w-4 h-4" /></Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="units">
                                <Card>
                                    <CardHeader className="space-y-4">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <CardTitle className="text-lg">Unidades</CardTitle>
                                                <p className="text-sm text-slate-500 mt-1">{filteredUnitsTable.length} registros</p>
                                            </div>
                                            <Button onClick={() => { setEditingItem(null); setUnitForm({ name: "", abbreviation: "" }); setUnitDialog(true); }} className="bg-emerald-500"><Plus className="w-4 h-4 mr-2" /> Nueva Unidad</Button>
                                        </div>
                                        <div className="relative">
                                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <Input value={unitTableSearch} onChange={(e) => setUnitTableSearch(e.target.value)} placeholder="Buscar unidad o abreviatura" className="pl-9" />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Abreviatura</TableHead><TableHead className="w-24 text-right pr-4">Acciones</TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {filteredUnitsTable.map(u => (
                                                    <TableRow key={u.id}>
                                                        <TableCell className="font-medium">{u.name}</TableCell>
                                                        <TableCell className="font-mono">{u.abbreviation}</TableCell>
                                                        <TableCell className="flex justify-end gap-1 pr-4">
                                                            <Button variant="ghost" size="icon" onClick={() => { setEditingItem(u); setUnitForm(u); setUnitDialog(true); }}><Pencil className="w-4 h-4" /></Button>
                                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteUnit(u.id)} className="text-rose-600"><Trash2 className="w-4 h-4" /></Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="categories">
                                <Card>
                                    <CardHeader className="space-y-4">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <CardTitle className="text-lg">Categorias</CardTitle>
                                                <p className="text-sm text-slate-500 mt-1">{filteredCategoriesTable.length} registros</p>
                                            </div>
                                            <Button onClick={() => { setEditingItem(null); setCategoryForm({ name: "", description: "" }); setCategoryDialog(true); }} className="bg-emerald-500"><Plus className="w-4 h-4 mr-2" /> Nueva Categoria</Button>
                                        </div>
                                        <div className="relative">
                                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <Input value={categoryTableSearch} onChange={(e) => setCategoryTableSearch(e.target.value)} placeholder="Buscar por nombre o descripcion" className="pl-9" />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead className="w-24 text-right pr-4">Acciones</TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {filteredCategoriesTable.map(c => (
                                                    <TableRow key={c.id}>
                                                        <TableCell className="font-medium">{c.name}</TableCell>
                                                        <TableCell className="flex justify-end gap-1 pr-4">
                                                            <Button variant="ghost" size="icon" onClick={() => { setEditingItem(c); setCategoryForm(c); setCategoryDialog(true); }}><Pencil className="w-4 h-4" /></Button>
                                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(c.id)} className="text-rose-600"><Trash2 className="w-4 h-4" /></Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </TabsContent>

                    {/* SECCIÃƒÆ’Ã¢â‚¬Å“N CATÃƒÆ’Ã‚ÂLOGOS */}
                    <TabsContent value="catalogos" className="space-y-6">
                        <Tabs defaultValue="sellable" className="space-y-4">
                            <TabsList className="bg-slate-50 border p-1 mb-4 h-auto flex-wrap">
                                <TabsTrigger value="sellable" className="gap-2" data-testid="tab-sellable"><Store className="w-4 h-4" /> Catalogo Supermercado</TabsTrigger>
                                <TabsTrigger value="brand-cat" className="gap-2" data-testid="tab-brand-catalog"><Tag className="w-4 h-4" /> Catalogo Marca</TabsTrigger>
                                <TabsTrigger value="units-catalog" className="gap-2"><Link2 className="w-4 h-4" /> Unidades</TabsTrigger>
                            </TabsList>

                            <TabsContent value="sellable">
                                <Card>
                                    <CardHeader className="space-y-4">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <CardTitle className="text-lg">Catalogo Supermercado</CardTitle>
                                                <p className="text-sm text-slate-500 mt-1">Vista por supermercado, con marcas y productos operativos</p>
                                            </div>
                                            <Button onClick={() => setSellableDialog(true)} className="bg-emerald-500" data-testid="new-sellable-btn"><Plus className="w-4 h-4 mr-2" /> Vincular Producto</Button>
                                        </div>
                                        <div className="relative">
                                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <Input value={sellableTableSearch} onChange={(e) => setSellableTableSearch(e.target.value)} placeholder="Filtrar por supermercado, marca o producto" className="pl-9" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <Accordion type="multiple" className="w-full">
                                            {supermarketCatalogTree.map((supermarket) => (
                                                <AccordionItem key={supermarket.id} value={`sm-${supermarket.id}`}>
                                                    <AccordionTrigger className="hover:no-underline">
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-semibold text-slate-800">{supermarket.name}</span>
                                                            <Badge variant="secondary">{supermarket.brands_count} marcas</Badge>
                                                            <Badge variant="secondary">{supermarket.products_count} productos</Badge>
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent>
                                                        <Accordion type="multiple" className="w-full space-y-2">
                                                            {supermarket.brands.map((brand) => (
                                                                <AccordionItem key={`${supermarket.id}-${brand.id}`} value={`sm-${supermarket.id}-brand-${brand.id}`} className="rounded-lg border bg-white px-0">
                                                                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                                                                        <div className="flex items-center gap-3">
                                                                            <p className="font-medium text-slate-800">{brand.name}</p>
                                                                            <Badge variant="outline">{brand.products.length} productos</Badge>
                                                                        </div>
                                                                    </AccordionTrigger>
                                                                    <AccordionContent className="px-0 pb-0">
                                                                        <div className="divide-y">
                                                                            {brand.products.map((product) => {
                                                                                const statusMeta = getCatalogStatusMeta(product.status);
                                                                                return (
                                                                                    <div key={`${supermarket.id}-${brand.id}-${product.id}`} className="px-4 py-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                                                                        <div className="flex items-center gap-2 flex-wrap">
                                                                                            <span className="font-medium text-slate-800">{product.name}</span>
                                                                                            <Badge className={statusMeta.className}>{statusMeta.label}</Badge>
                                                                                            {product.sellable_ids.length > 1 && <Badge variant="outline">{product.sellable_ids.length} vinculos</Badge>}
                                                                                        </div>
                                                                                        <div className="flex items-center gap-2">
                                                                                            <Button variant="outline" size="sm" onClick={() => openSellableEditor({ id: product.sellable_ids[0], supermarket_id: supermarket.id, brand_id: brand.id, product_id: product.product_id })}><Pencil className="w-4 h-4 mr-2" /> Editar</Button>
                                                                                            <Button variant="ghost" size="sm" className="text-rose-600" onClick={() => handleDeleteSellableGroup(product.sellable_ids)}><Trash2 className="w-4 h-4 mr-2" /> Eliminar</Button>
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </AccordionContent>
                                                                </AccordionItem>
                                                            ))}
                                                        </Accordion>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="brand-cat">
                                <Card>
                                    <CardHeader className="space-y-4">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <CardTitle className="text-lg">Catalogo Marca</CardTitle>
                                                <p className="text-sm text-slate-500 mt-1">Portfolio conceptual de marca con estado editable</p>
                                            </div>
                                            <Button onClick={() => setCatalogDialog(true)} className="bg-emerald-500"><Plus className="w-4 h-4 mr-2" /> Actualizar en Bloque</Button>
                                        </div>
                                        <div className="relative">
                                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <Input value={catalogTableSearch} onChange={(e) => setCatalogTableSearch(e.target.value)} placeholder="Filtrar por marca, producto o estado" className="pl-9" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <Accordion type="multiple" className="w-full">
                                            {brandCatalogTree.map((brand) => (
                                                <AccordionItem key={brand.id} value={`brand-${brand.id}`}>
                                                    <AccordionTrigger className="hover:no-underline">
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-semibold text-slate-800">{brand.name}</span>
                                                            <Badge variant="secondary">{brand.products_count} productos</Badge>
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent>
                                                        <div className="space-y-2">
                                                            {brand.products.map((product) => {
                                                                const statusMeta = getCatalogStatusMeta(product.status);
                                                                return (
                                                                    <div key={`${brand.id}-${product.id}`} className="rounded-lg border px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                                                        <div className="space-y-2">
                                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                                <span className="font-medium text-slate-800">{product.name}</span>
                                                                                <Badge className={statusMeta.className}>{statusMeta.label}</Badge>
                                                                            </div>
                                                                            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600">
                                                                                <span>Operativo en:</span>
                                                                                {product.supermarkets.length > 0 ? product.supermarkets.map((name) => <Badge key={`${brand.id}-${product.id}-${name}`} variant="outline" className="text-xs">{name}</Badge>) : <Badge variant="outline" className="text-xs">Sin supermercados</Badge>}
                                                                            </div>
                                                                        </div>
                                                                        <Button variant="outline" size="sm" onClick={() => openCatalogStatusEditor(product)}><Pencil className="w-4 h-4 mr-2" /> Editar estado</Button>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="units-catalog">
                                <Card>
                                    <CardHeader className="space-y-4">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <CardTitle className="text-lg">Catalogo Unidades</CardTitle>
                                                <p className="text-sm text-slate-500 mt-1">Asigna unidades por producto para la lista de compra</p>
                                            </div>
                                            <Button variant="outline" onClick={handleRebuildProductUnitRelationships} disabled={relationRebuildLoading}>
                                                {relationRebuildLoading ? "Reconstruyendo..." : "Reconstruir relaciones"}
                                            </Button>
                                        </div>
                                        <div className="flex flex-col gap-3 md:flex-row md:items-center">
                                            <div className="relative flex-1">
                                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <Input value={relationProductSearch} onChange={(e) => setRelationProductSearch(e.target.value)} placeholder="Buscar producto, marca o categoria" className="pl-9" />
                                            </div>
                                            <label className="flex items-center gap-2 text-sm text-slate-600">
                                                <Checkbox checked={relationOnlyMissingUnits} onCheckedChange={(val) => setRelationOnlyMissingUnits(val === true)} />
                                                Mostrar solo pendientes
                                            </label>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {filteredRelationProducts.length === 0 && (
                                            <div className="text-sm text-slate-500 border rounded-lg p-6 bg-slate-50">No hay productos para este filtro.</div>
                                        )}
                                        {filteredRelationProducts.map((p) => (
                                            <div key={p.id} className="rounded-lg border px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-medium text-slate-800">{p.name}</span>
                                                        <Badge variant="outline">{p.category_name || "Sin categoria"}</Badge>
                                                        <Badge variant="outline">{p.brand_name || "Sin marca"}</Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {(unitNamesByProduct[p.id] || []).map((u) => (
                                                            <Badge key={`${p.id}-${u.unit_id}`} variant="secondary" className="text-xs">{u.unit_name}</Badge>
                                                        ))}
                                                        {(unitNamesByProduct[p.id] || []).length === 0 && (
                                                            <span className="text-xs text-slate-500">Sin unidades configuradas</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <Button variant="outline" size="sm" onClick={() => openProductUnitDialog(p.id)}>
                                                    <Pencil className="w-4 h-4 mr-2" /> Editar unidades
                                                </Button>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </TabsContent>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-600">Cobertura unidades</CardTitle></CardHeader>
                                <CardContent><p className="text-3xl font-bold text-slate-900">{unitCoveragePct}%</p><p className="text-xs text-slate-500 mt-1">{relationConfiguredProductsCount}/{products.length} productos con unidades</p></CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-600">Cobertura catalogo marca</CardTitle></CardHeader>
                                <CardContent><p className="text-3xl font-bold text-slate-900">{sellableCatalogCoveragePct}%</p><p className="text-xs text-slate-500 mt-1">{sellableCount - sellableWithoutBrandCatalogCount}/{sellableCount} vinculos con estado</p></CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-600">Catalogo supermercado</CardTitle></CardHeader>
                                <CardContent><p className="text-3xl font-bold text-slate-900">{sellableCount}</p><p className="text-xs text-slate-500 mt-1">{sellableSupermarketCount} supermercados activos</p></CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-600">Catalogo marca</CardTitle></CardHeader>
                                <CardContent><p className="text-3xl font-bold text-slate-900">{brandCatalogCount}</p><p className="text-xs text-slate-500 mt-1">{brandCatalogActiveCount} activos, {brandCatalogPlannedCount} planeados</p></CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                            <Card>
                                <CardHeader><CardTitle className="text-base">Distribucion por supermercado</CardTitle></CardHeader>
                                <CardContent className="space-y-3">
                                    {sellablesBySupermarket.slice(0, 8).map((item) => (
                                        <div key={item.id} className="flex items-center justify-between text-sm">
                                            <span className="text-slate-700">{item.name}</span>
                                            <Badge variant="secondary">{item.count}</Badge>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle className="text-base">Distribucion por marca</CardTitle></CardHeader>
                                <CardContent className="space-y-3">
                                    {sellablesByBrand.slice(0, 8).map((item) => (
                                        <div key={item.id} className="flex items-center justify-between text-sm">
                                            <span className="text-slate-700">{item.name}</span>
                                            <Badge variant="secondary">{item.count}</Badge>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Diálogos */}
            <Dialog open={productDialog} onOpenChange={setProductDialog}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>{editingItem ? "Editar" : "Nuevo"} Producto</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Nombre</Label>
                            <Input value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} placeholder="Nombre del producto" />
                        </div>
                        <div className="space-y-2">
                            <Label>Categoría</Label>
                            <Select value={productForm.category_id} onValueChange={v => setProductForm({ ...productForm, category_id: v })}>
                                <SelectTrigger data-testid="select-category"><SelectValue placeholder="Seleccionar categoría" /></SelectTrigger>
                                <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                                id="is_base"
                                checked={productForm.is_base}
                                onCheckedChange={(checked) => setProductForm({ ...productForm, is_base: checked === true })}
                            />
                            <Label htmlFor="is_base" className="cursor-pointer">¿Es un Producto Base? (Tendrá variantes)</Label>
                        </div>

                        {productForm.is_base && (
                            <div className="space-y-2 border p-3 rounded-md bg-slate-50">
                                <Label>Atributos Permitidos para Variantes</Label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {attributes.map(attr => (
                                        <div key={attr.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`attr-${attr.id}`}
                                                checked={productForm.allowed_attribute_ids?.includes(attr.id)}
                                                onCheckedChange={(checked) => {
                                                    const current = productForm.allowed_attribute_ids || [];
                                                    if (checked) setProductForm({ ...productForm, allowed_attribute_ids: [...current, attr.id] });
                                                    else setProductForm({ ...productForm, allowed_attribute_ids: current.filter(id => id !== attr.id) });
                                                }}
                                            />
                                            <Label htmlFor={`attr-${attr.id}`} className="text-xs cursor-pointer">{attr.name}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!productForm.is_base && (
                            <div className="space-y-4 border p-3 rounded-md bg-slate-50">
                                <div className="space-y-2">
                                    <Label>Producto Base (Opcional)</Label>
                                    <Select value={productForm.base_product_id} onValueChange={v => {
                                        const base = products.find(p => p.id === v);
                                        setProductForm({ ...productForm, base_product_id: v, attribute_values: {} });
                                    }}>
                                        <SelectTrigger><SelectValue placeholder="Ninguno (Producto Independiente)" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Ninguno</SelectItem>
                                            {products.filter(p => p.is_base).map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {productForm.base_product_id && (
                                    <div className="space-y-3">
                                        <Label className="text-sm font-semibold">Valores de Atributos</Label>
                                        {products.find(p => p.id === productForm.base_product_id)?.allowed_attribute_ids?.map(attrId => {
                                            const attr = attributes.find(a => a.id === attrId);
                                            return (
                                                <div key={attrId} className="space-y-1">
                                                    <Label className="text-xs">{attr?.name}</Label>
                                                    <Input
                                                        size="sm"
                                                        value={productForm.attribute_values?.[attrId] || ""}
                                                        onChange={e => setProductForm({
                                                            ...productForm,
                                                            attribute_values: { ...productForm.attribute_values, [attrId]: e.target.value }
                                                        })}
                                                        placeholder={`Valor de ${attr?.name}`}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        <Button onClick={handleSaveProduct} className="w-full bg-emerald-500" data-testid="save-product-btn">Guardar Producto</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={attributeDialog} onOpenChange={setAttributeDialog}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{editingItem ? "Editar" : "Nuevo"} Atributo</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Nombre</Label>
                            <Input value={attributeForm.name} onChange={e => setAttributeForm({ ...attributeForm, name: e.target.value })} placeholder="Ej: Sabor, Grasa, Formato..." />
                        </div>
                        <div className="space-y-2">
                            <Label>Descripción</Label>
                            <Input value={attributeForm.description} onChange={e => setAttributeForm({ ...attributeForm, description: e.target.value })} placeholder="Descripción opcional" />
                        </div>
                        <Button onClick={handleSaveAttribute} className="w-full bg-emerald-500">Guardar Atributo</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={brandDialog} onOpenChange={setBrandDialog}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{editingItem ? "Editar" : "Nueva"} Marca</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-4">
                        <Label>Nombre</Label><Input value={brandForm.name} onChange={e => setBrandForm({ ...brandForm, name: e.target.value })} placeholder="Nombre de la marca" data-testid="brand-name-input" />
                        <Button onClick={handleSaveBrand} className="w-full bg-emerald-500" data-testid="save-brand-btn">Guardar</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={supermarketDialog} onOpenChange={setSupermarketDialog}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{editingItem ? "Editar" : "Nuevo"} Supermercado</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-4">
                        <Label>Nombre</Label><Input value={supermarketForm.name} onChange={e => setSupermarketForm({ ...supermarketForm, name: e.target.value })} placeholder="Nombre del supermercado" data-testid="supermarket-name-input" />
                        <Button onClick={handleSaveSupermarket} className="w-full bg-emerald-500" data-testid="save-supermarket-btn">Guardar</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={unitDialog} onOpenChange={setUnitDialog}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{editingItem ? "Editar" : "Nueva"} Unidad</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-4">
                        <Label>Nombre</Label><Input value={unitForm.name} onChange={e => setUnitForm({ ...unitForm, name: e.target.value })} placeholder="Ej: Litro" />
                        <Label>Abreviatura</Label><Input value={unitForm.abbreviation} onChange={e => setUnitForm({ ...unitForm, abbreviation: e.target.value })} placeholder="Ej: L" />
                        <Button onClick={handleSaveUnit} className="w-full bg-emerald-500">Guardar</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{editingItem ? "Editar" : "Nueva"} Categoría</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-4">
                        <Label>Nombre</Label><Input value={categoryForm.name} onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} placeholder="Nombre de la categoría" />
                        <Button onClick={handleSaveCategory} className="w-full bg-emerald-500">Guardar</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={sellableDialog} onOpenChange={(val) => { setSellableDialog(val); if (!val) setProductSearch(""); }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Vincular Productos a Supermercado</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Supermercado</Label>
                                <Select value={sellableForm.supermarket_id} onValueChange={v => setSellableForm({ ...sellableForm, supermarket_id: v })}>
                                    <SelectTrigger data-testid="select-sellable-supermarket"><SelectValue placeholder="Seleccionar supermercado" /></SelectTrigger>
                                    <SelectContent>{supermarkets.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Marca</Label>
                                <Select value={sellableForm.brand_id} onValueChange={v => setSellableForm({ ...sellableForm, brand_id: v })}>
                                    <SelectTrigger data-testid="select-sellable-brand"><SelectValue placeholder="Seleccionar marca" /></SelectTrigger>
                                    <SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>

                        {sellableForm.brand_id && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label>Productos (MultiselecciÃƒÆ’Ã‚Â³n)</Label>
                                    <Input
                                        placeholder="Filtrar productos..."
                                        className="w-1/2 h-8"
                                        value={productSearch}
                                        onChange={e => setProductSearch(e.target.value)}
                                    />
                                </div>
                                <div className="border rounded-md p-3 grid grid-cols-2 gap-2 max-h-60 overflow-y-auto bg-slate-50">
                                    {products
                                        .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                                        .map(p => {
                                            const isInCatalog = brandCatalog.find(bc => bc.brand_id === sellableForm.brand_id && bc.product_id === p.id);
                                            return (
                                                <div key={p.id} className="flex items-center space-x-2 p-1 hover:bg-white rounded transition-colors">
                                                    <Checkbox
                                                        id={`sp-${p.id}`}
                                                        checked={sellableForm.product_ids.includes(p.id)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) setSellableForm({ ...sellableForm, product_ids: [...sellableForm.product_ids, p.id] });
                                                            else setSellableForm({ ...sellableForm, product_ids: sellableForm.product_ids.filter(id => id !== p.id) });
                                                        }}
                                                    />
                                                    <label htmlFor={`sp-${p.id}`} className="text-sm cursor-pointer flex-1">
                                                        {p.name}
                                                        {isInCatalog && <span className="ml-1 text-[10px] text-emerald-600 font-bold">(CatÃƒÆ’Ã‚Â¡logo)</span>}
                                                    </label>
                                                </div>
                                            );
                                        })
                                    }
                                </div>
                                <p className="text-xs text-slate-500">{sellableForm.product_ids.length} productos seleccionados</p>
                            </div>
                        )}

                        <Button onClick={handleSaveSellable} className="w-full bg-emerald-500 mt-4" data-testid="save-sellable-btn">Guardar Vinculación Masiva</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={catalogDialog} onOpenChange={(val) => { setCatalogDialog(val); if (!val) setProductSearch(""); }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Gestionar Catálogo de Marca (Bulk)</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Marca</Label>
                                <Select value={catalogForm.brand_id} onValueChange={v => setCatalogForm({ ...catalogForm, brand_id: v })}>
                                    <SelectTrigger><SelectValue placeholder="Seleccionar marca" /></SelectTrigger>
                                    <SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Estado Conceptual</Label>
                                <Select value={catalogForm.status} onValueChange={v => setCatalogForm({ ...catalogForm, status: v })}>
                                    <SelectTrigger><SelectValue placeholder="Seleccionar estado" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="planned">Planned (Planeado)</SelectItem>
                                        <SelectItem value="active">Active (Activo)</SelectItem>
                                        <SelectItem value="discontinued">Discontinued (Descatalogado)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {catalogForm.brand_id && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label>Productos para añadir al catálogo</Label>
                                    <Input
                                        placeholder="Filtrar productos..."
                                        className="w-1/2 h-8"
                                        value={productSearch}
                                        onChange={e => setProductSearch(e.target.value)}
                                    />
                                </div>
                                <div className="border rounded-md p-3 grid grid-cols-2 gap-2 max-h-60 overflow-y-auto bg-slate-50">
                                    {products
                                        .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                                        .map(p => {
                                            const currentEntry = brandCatalog.find(bc => bc.brand_id === catalogForm.brand_id && bc.product_id === p.id);
                                            return (
                                                <div key={p.id} className="flex items-center space-x-2 p-1 hover:bg-white rounded transition-colors">
                                                    <Checkbox
                                                        id={`cat-${p.id}`}
                                                        checked={catalogForm.product_ids.includes(p.id)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) setCatalogForm({ ...catalogForm, product_ids: [...catalogForm.product_ids, p.id] });
                                                            else setCatalogForm({ ...catalogForm, product_ids: catalogForm.product_ids.filter(id => id !== p.id) });
                                                        }}
                                                    />
                                                    <label htmlFor={`cat-${p.id}`} className="text-sm cursor-pointer flex-1">
                                                        {p.name}
                                                        {currentEntry && <span className="ml-1 text-[10px] text-blue-600 font-bold">({currentEntry.status})</span>}
                                                    </label>
                                                </div>
                                            );
                                        })
                                    }
                                </div>
                                <p className="text-xs text-slate-500">{catalogForm.product_ids.length} productos seleccionados</p>
                            </div>
                        )}

                        <Button onClick={handleSaveCatalog} className="w-full bg-emerald-500 mt-4">Actualizar Catálogo Masivo</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={sellableEditDialog} onOpenChange={setSellableEditDialog}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Editar Vinculo Operativo</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Supermercado</Label>
                            <Select value={sellableEditForm.supermarket_id} onValueChange={(v) => setSellableEditForm({ ...sellableEditForm, supermarket_id: v })}>
                                <SelectTrigger><SelectValue placeholder="Seleccionar supermercado" /></SelectTrigger>
                                <SelectContent>{supermarkets.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Marca</Label>
                            <Select value={sellableEditForm.brand_id} onValueChange={(v) => setSellableEditForm({ ...sellableEditForm, brand_id: v })}>
                                <SelectTrigger><SelectValue placeholder="Seleccionar marca" /></SelectTrigger>
                                <SelectContent>{brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Producto</Label>
                            <Select value={sellableEditForm.product_id} onValueChange={(v) => setSellableEditForm({ ...sellableEditForm, product_id: v })}>
                                <SelectTrigger><SelectValue placeholder="Seleccionar producto" /></SelectTrigger>
                                <SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleSaveSellableEdit} disabled={sellableEditSaving} className="w-full bg-emerald-500">
                            {sellableEditSaving ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={catalogStatusDialog} onOpenChange={setCatalogStatusDialog}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Editar Estado de Catalogo Marca</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="rounded-lg border bg-slate-50 p-3 text-sm text-slate-600">
                            <p><strong>Marca:</strong> {catalogStatusForm.brand_name || "-"}</p>
                            <p><strong>Producto:</strong> {catalogStatusForm.product_name || "-"}</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Estado</Label>
                            <Select value={catalogStatusForm.status} onValueChange={(v) => setCatalogStatusForm({ ...catalogStatusForm, status: v })}>
                                <SelectTrigger><SelectValue placeholder="Seleccionar estado" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="planned">Planeado</SelectItem>
                                    <SelectItem value="active">Activo</SelectItem>
                                    <SelectItem value="discontinued">Descatalogado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleSaveCatalogStatus} className="w-full bg-emerald-500">Guardar Estado</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={productUnitDialog} onOpenChange={setProductUnitDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Editar Unidades Permitidas</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="rounded-lg border bg-slate-50 p-3 text-sm text-slate-600">
                            <p><strong>Producto:</strong> {selectedRelationProduct?.name || "-"}</p>
                            <p><strong>Configuradas:</strong> {relationSelectedUnitIds.length}</p>
                        </div>
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <Input value={relationUnitSearch} onChange={(e) => setRelationUnitSearch(e.target.value)} placeholder="Filtrar unidades..." className="pl-9" />
                        </div>
                        <div className="border rounded-md p-3 grid grid-cols-2 gap-2 max-h-72 overflow-y-auto bg-slate-50">
                            {filteredUnitsForRelation.map((unit) => (
                                <label key={unit.id} className="flex items-center gap-2 text-sm p-1 hover:bg-white rounded cursor-pointer">
                                    <Checkbox
                                        checked={relationSelectedUnitIds.includes(unit.id)}
                                        onCheckedChange={(checked) => toggleRelationUnit(unit.id, checked)}
                                    />
                                    <span>{unit.name} ({unit.abbreviation || "-"})</span>
                                </label>
                            ))}
                        </div>
                        <Button onClick={handleSaveProductUnits} disabled={relationSaving || relationLoading} className="w-full bg-emerald-500">
                            {relationSaving ? "Guardando..." : "Guardar Unidades"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Layout>
    );
};

export default AdminPage;

