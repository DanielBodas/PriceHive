import { useEffect, useState, useCallback } from "react";

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
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
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
    Link2,
    ChevronDown,
    ChevronRight,
    RefreshCw,
    Database,
    ShieldAlert,
    Activity,
    BarChart3,
    Download,
    Upload,
    CheckCircle,
    XCircle,
    ArrowRight
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
    const [pricesData, setPricesData] = useState({ items: [], total: 0, page: 1, total_pages: 1 });
    const [priceStatusFilter, setPriceStatusFilter] = useState("suspicious");
    const [loadingPrices, setLoadingPrices] = useState(false);
    const [loading, setLoading] = useState(true);

    // Navigation state
    const [activeMainTab, setActiveMainTab] = useState("overview");
    const [activeMaestrosTab, setActiveMaestrosTab] = useState("products");
    const [activeCatalogosTab, setActiveCatalogosTab] = useState("sellable");

    // Audit fix filters
    const [showOnlyProductsWithoutImage, setShowOnlyProductsWithoutImage] = useState(false);



    // Dialog states
    const [categoryDialog, setCategoryDialog] = useState(false);
    const [attributeDialog, setAttributeDialog] = useState(false);
    const [brandDialog, setBrandDialog] = useState(false);
    const [supermarketDialog, setSupermarketDialog] = useState(false);
    const [unitDialog, setUnitDialog] = useState(false);
    const [productDialog, setProductDialog] = useState(false);
    const [sellableDialog, setSellableDialog] = useState(false);
    const [supermarketBrandDialog, setSupermarketBrandDialog] = useState(false);
    const [catalogDialog, setCatalogDialog] = useState(false);
    const [addSupermarketToCatalogDialog, setAddSupermarketToCatalogDialog] = useState(false);
    const [addBrandToCatalogDialog, setAddBrandToCatalogDialog] = useState(false);
    const [addBrandGlobalDialog, setAddBrandGlobalDialog] = useState(false);
    const [priceDialog, setPriceDialog] = useState(false);


    // Edit states
    const [editingItem, setEditingItem] = useState(null);

    // Form states
    const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
    const [attributeForm, setAttributeForm] = useState({ name: "", description: "", values: [] });
    const [newAttributeValue, setNewAttributeValue] = useState("");
    const [brandForm, setBrandForm] = useState({ name: "", logo_url: "" });
    const [supermarketForm, setSupermarketForm] = useState({ name: "", logo_url: "" });
    const [unitForm, setUnitForm] = useState({ name: "", abbreviation: "" });
    const [productForm, setProductForm] = useState({
        name: "", category_id: "", barcode: "", image_url: "",
        is_base: true, allowed_attribute_ids: []
    });
    const [sellableForm, setSellableForm] = useState({ supermarket_id: "", brand_id: "", catalog_entry_ids: [] });
    const [catalogForm, setCatalogForm] = useState({ brand_id: "", product_ids: [], status: "active", attribute_combinations: [] });
    const [priceForm, setPriceForm] = useState({ price: 0, quantity: 1 });

    const [attributeSelection, setAttributeSelection] = useState({}); // { attrId: [val1, val2] }
    const [productSearch, setProductSearch] = useState("");
    const [productTableSearch, setProductTableSearch] = useState("");
    const [categoryTableSearch, setCategoryTableSearch] = useState("");
    const [attributeTableSearch, setAttributeTableSearch] = useState("");
    const [brandTableSearch, setBrandTableSearch] = useState("");
    const [supermarketTableSearch, setSupermarketTableSearch] = useState("");
    const [unitTableSearch, setUnitTableSearch] = useState("");
    const [sellableTableSearch, setSellableTableSearch] = useState("");
    const [catalogTableSearch, setCatalogTableSearch] = useState("");
    const [priceTableSearch, setPriceTableSearch] = useState("");

    const [allProductUnits, setAllProductUnits] = useState([]);
    // Track which brand-product cards are expanded in the brand catalog
    const [expandedCatalogProducts, setExpandedCatalogProducts] = useState({});
    const toggleCatalogProduct = (key) => setExpandedCatalogProducts(prev => ({ ...prev, [key]: !prev[key] }));

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
        attribute_values: {},
    });
    const [systemLoading, setSystemLoading] = useState(false);
    const [exportFormat, setExportFormat] = useState("xlsx");
    const [includePrices, setIncludePrices] = useState(false);
    const [systemDialog, setSystemDialog] = useState(false);
    const [moderationDialog, setModerationDialog] = useState(false);
    const [invalidateDialog, setInvalidateDialog] = useState(false);
    const [invalidateReason, setInvalidateReason] = useState("Información incorrecta o spam");







    const fetchPrices = useCallback(async (page = 1, searchQuery = "", status = "suspicious") => {
        setLoadingPrices(true);
        try {
            const res = await axios.get(`${API}/admin/prices`, {
                params: { page, page_size: 50, search: searchQuery, status: status === "all" ? null : status }
            });
            setPricesData(res.data);
        } catch (error) {
            console.error("Error loading prices:", error);
            toast.error("Error al cargar precios");
        } finally {
            setLoadingPrices(false);
        }
    }, []);

    const fetchAllData = useCallback(async () => {
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

            // Initial prices fetch
            fetchPrices(1, "", priceStatusFilter);

        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Error al cargar datos");
        } finally {
            setLoading(false);
        }
    }, [fetchPrices, priceStatusFilter]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);


    const getFilteredProducts = (text) => {
        const q = (text || "").toLowerCase().trim();
        if (!q) return products;
        return products.filter((p) =>
            (p.name || "").toLowerCase().includes(q) ||
            (p.brand_name || "").toLowerCase().includes(q) ||
            (p.category_name || "").toLowerCase().includes(q)
        );
    };

    const filteredProductsTable = products.filter(p => {
        const matchesSearch = (p.name || "").toLowerCase().includes(productTableSearch.toLowerCase()) ||
            (p.category_name || "").toLowerCase().includes(productTableSearch.toLowerCase());
        const matchesGapFilter = showOnlyProductsWithoutImage ? (!p.image_url || p.image_url.trim() === "") : true;
        return matchesSearch && matchesGapFilter;
    });

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
        .map((p) => {
            const linkedBrands = brandCatalog
                .filter(bc => bc.product_id === p.id)
                .map(bc => bc.brand_name)
                .filter((v, i, a) => v && a.indexOf(v) === i);

            return {
                ...p,
                linked_brands: linkedBrands,
                allowed_units_count: productUnitCountByProduct[p.id] || 0,
            };
        })
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
    // We use server-side search for prices now



    const brandCatalogStatusByBrandProduct = brandCatalog.reduce((acc, entry) => {
        const key = `${entry.brand_id || ""}::${entry.product_id || ""}`;
        acc[key] = entry.status || null;
        return acc;
    }, {});

    const supermarketCatalogTree = Object.values(
        filteredSellableTable.reduce((acc, row) => {
            const supermarketId = row.supermarket_id || "unknown-supermarket";
            const brandId = row.brand_id || "unknown-brand";
            const productId = row.product_id || "unknown-product";

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
                };
            }
            return acc;
        }, {})
    )
        .map((supermarket) => {
            const brandsList = Object.values(supermarket.brands).map((brand) => ({
                ...brand,
                products: Object.values(brand.products).sort((a, b) => a.name.localeCompare(b.name)),
                products_count: Object.values(brand.products).length
            }));
            return {
                ...supermarket,
                brands: brandsList.sort((a, b) => a.name.localeCompare(b.name)),
                brands_count: brandsList.length,
                total_products_count: brandsList.reduce((acc, b) => acc + b.products_count, 0)
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
            const productId = row.product_id || row.product_name || "unknown-product";
            const key = `${row.brand_id || ""}::${row.product_id || ""}`;

            if (!acc[brandId]) {
                acc[brandId] = { id: brandId, name: row.brand_name || "Sin marca", products: {} };
            }

            acc[brandId].products[productId] = {
                id: row.id, // entry id
                name: row.product_name || "Sin producto",
                status: row.status,
                brand_id: row.brand_id,
                product_id: row.product_id,
                allowed_attributes: row.allowed_attributes || {},
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

    const gaps = {
        productsWithoutImage: products.filter(p => !p.image_url || p.image_url.trim() === "").length,
        productsWithoutCategory: products.filter(p => !p.category_id).length,
        brandsWithoutLogo: brands.filter(b => !b.logo_url || b.logo_url.trim() === "").length,
        supermarketsWithoutLogo: supermarkets.filter(s => !s.logo_url || s.logo_url.trim() === "").length,
        missingUnits: products.length - relationConfiguredProductsCount,
        unmappedSellables: sellableWithoutBrandCatalogCount
    };

    const getCatalogStatusMeta = (status) => {
        if (status === "active") return { label: "Activo", className: "bg-primary/10 text-primary border border-primary/20" };
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
            fetchAllData(); setAttributeDialog(false); setAttributeForm({ name: "", description: "", values: [] }); setEditingItem(null);
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
        if (!window.confirm("¿Eliminar?")) return;
        try { await axios.delete(`${API}/admin/brands/${id}`); fetchAllData(); toast.success("Eliminado"); } catch (e) { toast.error("Error"); }
    };

    const handleSaveSupermarket = async () => {
        try {
            if (editingItem) await axios.put(`${API}/admin/supermarkets/${editingItem.id}`, supermarketForm);
            else await axios.post(`${API}/admin/supermarkets`, supermarketForm);
            fetchAllData(); setSupermarketDialog(false); setSupermarketForm({ name: "", logo_url: "" }); setEditingItem(null);
            toast.success("Supermercado guardado");
        } catch (e) { toast.error("Error al guardar supermercado"); }
    };

    const handleDeleteSupermarket = async (id) => {
        if (!window.confirm("¿Eliminar?")) return;
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
        if (!window.confirm("¿Eliminar?")) return;
        try { await axios.delete(`${API}/admin/units/${id}`); fetchAllData(); toast.success("Eliminado"); } catch (e) { toast.error("Error"); }
    };

    const handleSaveProduct = async () => {
        try {
            const payload = {
                ...productForm,
                is_base: true,
                allowed_attribute_ids: productForm.allowed_attribute_ids || []
            };
            if (editingItem) await axios.put(`${API}/admin/products/${editingItem.id}`, payload);
            else await axios.post(`${API}/admin/products`, payload);
            fetchAllData(); setProductDialog(false); setEditingItem(null);
            toast.success("Producto conceptual guardado");
        } catch (e) { toast.error("Error al guardar producto"); }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm("¿Eliminar?")) return;
        try { await axios.delete(`${API}/admin/products/${id}`); fetchAllData(); toast.success("Eliminado"); } catch (e) { toast.error("Error"); }
    };

    const handleSaveSellable = async () => {
        try {
            if (sellableForm.catalog_entry_ids.length === 0) {
                toast.error("Selecciona al menos un producto");
                return;
            }
            const res = await axios.post(`${API}/admin/sellable-products/bulk`, sellableForm);
            toast.success(res.data.message);
            fetchAllData();
            setSellableDialog(false);
            setSellableForm({ supermarket_id: "", brand_id: "", catalog_entry_ids: [] });
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

    // Sync: create sellable products for all catalog entries of a brand in a supermarket
    const handleSyncBrandInSupermarket = async (supermarketId, brandId, brandName, supermarketName) => {
        // Get catalog entries for this brand
        const catalogEntries = brandCatalog.filter(bc => bc.brand_id === brandId && bc.status !== 'discontinued');
        if (catalogEntries.length === 0) {
            toast.error(`${brandName} no tiene productos activos en el catálogo de marca`);
            return;
        }
        try {
            const res = await axios.post(`${API}/admin/sellable-products/bulk`, {
                supermarket_id: supermarketId,
                brand_id: brandId,
                catalog_entry_ids: catalogEntries.map(e => e.id)
            });
            toast.success(res.data?.message || `Sincronizados productos de ${brandName} en ${supermarketName}`);
            await fetchAllData();
        } catch (e) {
            toast.error("Error al sincronizar");
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
        } catch (e) { toast.error("Error al actualizar catálogo"); }
    };

    const handleDeleteCatalogEntry = async (entryId) => {
        if (!window.confirm("¿Quitar esta variante del catálogo de la marca?")) return;
        try {
            await axios.delete(`${API}/admin/brand-catalog/${entryId}`);
            toast.success("Variante eliminada del catálogo");
            fetchAllData();
        } catch (e) { toast.error("Error al eliminar"); }
    };


    const openCatalogStatusEditor = (entry) => {
        if (!entry.brand_id || !entry.product_id) {
            toast.error("No se puede editar este registro");
            return;
        }
        setCatalogStatusForm({
            ...entry,
            status: entry.status || "active",
            attribute_values: entry.attribute_values || {},
        });
        setCatalogStatusDialog(true);
    };

    const handleSaveCatalogStatus = async () => {
        try {
            const cleanedAttrs = Object.fromEntries(
                Object.entries(catalogStatusForm.attribute_values || {}).filter(([_, v]) => v !== "" && v !== "none")
            );

            await axios.post(`${API}/admin/brand-catalog`, {
                brand_id: catalogStatusForm.brand_id,
                product_id: catalogStatusForm.product_id,
                status: catalogStatusForm.status,
                attribute_values: cleanedAttrs
            });
            toast.success("Catálogo actualizado");
            setCatalogStatusDialog(false);
            await fetchAllData();
        } catch (error) {
            console.error("Error saving catalog status:", error);
            toast.error("No se pudo actualizar el catálogo");
        }
    };

    const handleExportDB = async () => {
        try {
            setSystemLoading(true);
            const response = await axios({
                url: `${API}/admin/system/export?format=${exportFormat}&include_prices=${includePrices}`,
                method: 'GET',
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `pricehive_db_${new Date().toISOString().split('T')[0]}.${exportFormat}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Base de datos exportada con éxito");
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Error al exportar la base de datos");
        } finally {
            setSystemLoading(false);
        }
    };

    const handleImportDB = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setSystemLoading(true);
            const res = await axios.post(`${API}/admin/system/import`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Show statistics
            const results = res.data.results || {};
            const sheets = Object.keys(results);
            if (sheets.length > 0) {
                const summary = sheets.map(name => {
                    const stats = results[name];
                    return `${name}: ${stats.upserted} upserts, ${stats.deleted} deletes`;
                }).join(' | ');
                toast.success(`Sincronización completada: ${summary}`);
            } else {
                toast.success("Importación finalizada sin cambios detectados");
            }

            await fetchAllData();
        } catch (error) {
            console.error("Import error:", error);
            toast.error(error.response?.data?.detail || "Error al importar la base de datos");
        } finally {
            setSystemLoading(false);
            e.target.value = ''; // clear input
        }
    };

    const handleDeletePrice = async (id) => {
        if (!window.confirm("¿Seguro que quieres eliminar este reporte de precio?")) return;
        try {
            await axios.delete(`${API}/admin/prices/${id}`);
            toast.success("Precio eliminado");
            fetchPrices(pricesData.page, priceTableSearch);
        } catch (e) {

            toast.error("Error al eliminar el precio");
        }
    };

    const handleSavePrice = async () => {
        try {
            if (editingItem) {
                await axios.put(`${API}/admin/prices/${editingItem.id}`, priceForm);
                toast.success("Precio actualizado");
            }
            setPriceDialog(false);
            setEditingItem(null);
            fetchPrices(pricesData.page, priceTableSearch);
        } catch (e) {

            toast.error("Error al guardar el precio");
        }
    };

    const handleValidatePrice = async (id) => {
        try {
            await axios.post(`${API}/admin/prices/${id}/validate`);
            toast.success("Precio marcado como válido");
            fetchPrices(pricesData.page, priceTableSearch);
        } catch (e) {
            toast.error("Error al validar precio");
        }
    };

    const handleInvalidatePrice = async (id) => {
        setEditingItem({ id }); // Store the ID temporarily in editingItem or a new state
        setInvalidateReason("Información incorrecta o spam");
        setInvalidateDialog(true);
    };

    const submitInvalidatePrice = async () => {
        if (!editingItem?.id) return;
        try {
            await axios.post(`${API}/admin/prices/${editingItem.id}/invalidate?reason=${encodeURIComponent(invalidateReason)}`);
            toast.success("Precio invalidado y puntos restados");
            setInvalidateDialog(false);
            setEditingItem(null);
            fetchPrices(pricesData.page, priceTableSearch);
        } catch (e) {
            toast.error("Error al invalidar precio");
        }
    };



    if (loading) return <Layout><div className="flex items-center justify-center min-h-[400px]">Cargando panel de administracion...</div></Layout>;

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 font-heading tracking-tight">
                            Panel de Administración
                        </h1>
                        <p className="text-slate-500 mt-1">Gestión avanzada del sistema PriceHive</p>
                    </div>
                </div>

                {systemLoading && (
                    <div className="fixed inset-0 bg-white/60 backdrop-blur-[2px] z-[100] flex items-center justify-center transition-all animate-in fade-in duration-300">
                        <Card className="w-80 border-primary/10 shadow-2xl shadow-primary/10">
                            <CardContent className="pt-6 text-center">
                                <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                                <h3 className="font-bold text-slate-800">Procesando sistema...</h3>
                                <p className="text-xs text-slate-500 mt-2">Sincronizando base de datos y refrescando catálogo. No cierres la ventana.</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="space-y-6">
                    <TabsList className="bg-slate-100 p-1 flex-wrap h-auto">
                        <TabsTrigger value="moderacion" className="gap-2 data-[state=active]:bg-white relative font-bold">
                            <ShieldAlert className="w-4 h-4 text-rose-500" /> Moderación
                            {pricesData.total > 0 && priceStatusFilter === "suspicious" && (
                                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full border-2 border-white font-bold leading-none animate-pulse">
                                    {pricesData.total}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="sistema" className="gap-2 data-[state=active]:bg-white font-bold">
                            <Database className="w-4 h-4 text-primary" /> Sincronización
                        </TabsTrigger>
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

                    <TabsContent value="maestros" className="space-y-6">
                        <Tabs value={activeMaestrosTab} onValueChange={setActiveMaestrosTab}>

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
                                                <CardTitle className="text-lg font-heading">Productos</CardTitle>
                                                <p className="text-sm text-slate-500 mt-1">{filteredProductsTable.length} registros</p>
                                            </div>
                                            <Button onClick={() => { setEditingItem(null); setProductForm({ name: "", brand_id: "", category_id: "", unit_id: "", barcode: "", image_url: "" }); setProductDialog(true); }} className="rounded-xl px-5" data-testid="new-product-btn"><Plus className="w-4 h-4 mr-2" /> Nuevo Producto</Button>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <div className="relative flex-1">
                                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <Input value={productTableSearch} onChange={(e) => setProductTableSearch(e.target.value)} placeholder="Buscar por producto, marca o categoria" className="pl-9" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    id="prod-gap-img"
                                                    checked={showOnlyProductsWithoutImage}
                                                    onCheckedChange={setShowOnlyProductsWithoutImage}
                                                />
                                                <Label htmlFor="prod-gap-img" className="text-xs text-slate-500 cursor-pointer">Mostrar solo productos sin imagen</Label>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="px-6 pb-6 pt-0">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="pl-0">Concepto de Producto</TableHead>
                                                    <TableHead>Categoria</TableHead>
                                                    <TableHead className="w-24 text-right pr-0">Acciones</TableHead>
                                                </TableRow>
                                            </TableHeader>
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
                                                        <TableCell className="text-right pr-0 flex justify-end gap-1">
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
                                                <CardTitle className="text-lg font-heading">Atributos de Producto</CardTitle>
                                                <p className="text-sm text-slate-500 mt-1">{filteredAttributesTable.length} registros</p>
                                            </div>
                                            <Button onClick={() => { setEditingItem(null); setAttributeForm({ name: "", description: "" }); setAttributeDialog(true); }} className="rounded-xl px-5"><Plus className="w-4 h-4 mr-2" /> Nuevo Atributo</Button>
                                        </div>
                                        <div className="relative">
                                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <Input value={attributeTableSearch} onChange={(e) => setAttributeTableSearch(e.target.value)} placeholder="Buscar atributo" className="pl-9" />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="px-6 pb-6 pt-0">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="pl-0">Nombre</TableHead>
                                                    <TableHead>Descripción</TableHead>
                                                    <TableHead>Valores</TableHead>
                                                    <TableHead className="w-24 text-right pr-0">Acciones</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredAttributesTable.map(a => (
                                                    <TableRow key={a.id}>
                                                        <TableCell className="font-medium">{a.name}</TableCell>
                                                        <TableCell>{a.description}</TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-wrap gap-1">
                                                                {a.values?.map((v, i) => <Badge key={i} variant="secondary" className="text-[10px]">{v}</Badge>)}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right pr-0 flex justify-end gap-1">
                                                            <Button variant="ghost" size="icon" onClick={() => { setEditingItem(a); setAttributeForm({ ...a, values: a.values || [] }); setAttributeDialog(true); }}><Pencil className="w-4 h-4" /></Button>
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
                                                <CardTitle className="text-lg font-heading">Marcas</CardTitle>
                                                <p className="text-sm text-slate-500 mt-1">{filteredBrandsTable.length} registros</p>
                                            </div>
                                            <Button onClick={() => { setEditingItem(null); setBrandForm({ name: "", logo_url: "" }); setBrandDialog(true); }} className="rounded-xl px-5"><Plus className="w-4 h-4 mr-2" /> Nueva Marca</Button>
                                        </div>
                                        <div className="relative">
                                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <Input value={brandTableSearch} onChange={(e) => setBrandTableSearch(e.target.value)} placeholder="Buscar marca" className="pl-9" />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="px-6 pb-6 pt-0">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="pl-0">Nombre</TableHead>
                                                    <TableHead className="w-24 text-right pr-0">Acciones</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredBrandsTable.map(b => (
                                                    <TableRow key={b.id}>
                                                        <TableCell className="font-medium">{b.name}</TableCell>
                                                        <TableCell className="text-right pr-0 flex justify-end gap-1">
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
                                                <CardTitle className="text-lg font-heading">Supermercados</CardTitle>
                                                <p className="text-sm text-slate-500 mt-1">{filteredSupermarketsTable.length} registros</p>
                                            </div>
                                            <Button onClick={() => { setEditingItem(null); setSupermarketForm({ name: "", logo_url: "" }); setSupermarketDialog(true); }} className="rounded-xl px-5"><Plus className="w-4 h-4 mr-2" /> Nuevo Supermercado</Button>
                                        </div>
                                        <div className="relative">
                                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <Input value={supermarketTableSearch} onChange={(e) => setSupermarketTableSearch(e.target.value)} placeholder="Buscar supermercado" className="pl-9" />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="px-6 pb-6 pt-0">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="pl-0">Nombre</TableHead>
                                                    <TableHead className="w-24 text-right pr-0">Acciones</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredSupermarketsTable.map(s => (
                                                    <TableRow key={s.id}>
                                                        <TableCell className="font-medium">{s.name}</TableCell>
                                                        <TableCell className="text-right pr-0 flex justify-end gap-1">
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
                                                <CardTitle className="text-lg font-heading">Unidades</CardTitle>
                                                <p className="text-sm text-slate-500 mt-1">{filteredUnitsTable.length} registros</p>
                                            </div>
                                            <Button onClick={() => { setEditingItem(null); setUnitForm({ name: "", abbreviation: "" }); setUnitDialog(true); }} className="rounded-xl px-5"><Plus className="w-4 h-4 mr-2" /> Nueva Unidad</Button>
                                        </div>
                                        <div className="relative">
                                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <Input value={unitTableSearch} onChange={(e) => setUnitTableSearch(e.target.value)} placeholder="Buscar unidad o abreviatura" className="pl-9" />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="px-6 pb-6 pt-0">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="pl-0">Nombre</TableHead>
                                                    <TableHead>Abreviatura</TableHead>
                                                    <TableHead className="w-24 text-right pr-0">Acciones</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredUnitsTable.map(u => (
                                                    <TableRow key={u.id}>
                                                        <TableCell className="font-medium">{u.name}</TableCell>
                                                        <TableCell className="font-mono">{u.abbreviation}</TableCell>
                                                        <TableCell className="text-right pr-0 flex justify-end gap-1">
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
                                                <CardTitle className="text-lg font-heading">Categorias</CardTitle>
                                                <p className="text-sm text-slate-500 mt-1">{filteredCategoriesTable.length} registros</p>
                                            </div>
                                            <Button onClick={() => { setEditingItem(null); setCategoryForm({ name: "", description: "" }); setCategoryDialog(true); }} className="rounded-xl px-5"><Plus className="w-4 h-4 mr-2" /> Nueva Categoria</Button>
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

                    {/* SECCIÓN CATÁLOGOS */}
                    <TabsContent value="catalogos" className="space-y-6">
                        <Tabs value={activeCatalogosTab} onValueChange={setActiveCatalogosTab} className="space-y-4">
                            <TabsList className="bg-slate-50 border p-1 mb-4 h-auto flex-wrap">
                                <TabsTrigger value="sellable" className="gap-2" data-testid="tab-sellable"><Store className="w-4 h-4" /> Catalogo Supermercado</TabsTrigger>
                                <TabsTrigger value="brand-cat" className="gap-2" data-testid="tab-brand-catalog"><Tag className="w-4 h-4" /> Catalogo Marca</TabsTrigger>
                                <TabsTrigger value="attr-cat" className="gap-2"><Tag className="w-4 h-4" /> Catalogo Atributos</TabsTrigger>
                                <TabsTrigger value="units-catalog" className="gap-2"><Link2 className="w-4 h-4" /> Unidades</TabsTrigger>
                            </TabsList>

                            <TabsContent value="sellable">
                                <Card>
                                    <CardHeader className="space-y-4">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <CardTitle className="text-lg font-heading">Catálogo Supermercado</CardTitle>
                                                <p className="text-sm text-slate-500 mt-1">Gestiona qué marcas están disponibles en cada establecimiento.</p>
                                            </div>
                                            <Button onClick={() => setAddSupermarketToCatalogDialog(true)} className="rounded-xl px-5" data-testid="new-sellable-btn"><Plus className="w-4 h-4 mr-2" /> Añadir Supermercado</Button>
                                        </div>
                                        <div className="relative">
                                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <Input value={sellableTableSearch} onChange={(e) => setSellableTableSearch(e.target.value)} placeholder="Filtrar por supermercado o marca" className="pl-9" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <Accordion type="multiple" className="w-full">
                                            {supermarketCatalogTree.map((supermarket) => (
                                                <AccordionItem key={supermarket.id} value={`sm-${supermarket.id}`}>
                                                    <AccordionTrigger className="hover:no-underline py-4">
                                                        <div className="flex items-center justify-between w-full pr-4">
                                                            <div className="flex items-center gap-3">
                                                                <span className="font-semibold text-slate-800">{supermarket.name}</span>
                                                                <div className="flex gap-2">
                                                                    <Badge variant="secondary" className="bg-slate-100 text-slate-600">{supermarket.brands_count} marcas</Badge>
                                                                    <Badge variant="secondary" className="bg-primary/5 text-primary">{supermarket.total_products_count} productos activos</Badge>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                                <Button size="sm" variant="outline" className="h-8 border-primary/20 text-primary hover:bg-primary/5" onClick={(e) => { e.stopPropagation(); setSellableForm({ ...sellableForm, supermarket_id: supermarket.id, brand_id: "", catalog_entry_ids: [] }); setSupermarketBrandDialog(true); }}>
                                                                    <Plus className="w-3.5 h-3.5 mr-1.5" /> Añadir Marca
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="pt-2 pb-4">
                                                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 px-1">
                                                            {supermarket.brands.map((brand) => (
                                                                <div key={brand.id} className="group relative rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition-all">
                                                                    <div className="flex items-start justify-between mb-2">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-10 h-10 rounded-lg bg-slate-50 border flex items-center justify-center text-slate-400 font-bold">
                                                                                {brand.name.substring(0, 1)}
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-bold text-slate-800 leading-tight">{brand.name}</p>
                                                                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{brand.products_count} productos operativos</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex flex-col gap-1 items-end">
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-8 w-8 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                onClick={async (e) => {
                                                                                    e.stopPropagation();
                                                                                    if (window.confirm(`¿Quitar ${brand.name} de ${supermarket.name}? Todos sus productos dejarán de estar operativos en este súper.`)) {
                                                                                        try {
                                                                                            await axios.delete(`${API}/admin/supermarkets/${supermarket.id}/brands/${brand.id}`);
                                                                                            toast.success("Marca eliminada del supermercado");
                                                                                            fetchAllData();
                                                                                        } catch (e) { toast.error("Error al eliminar"); }
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="h-7 px-2 text-[10px] text-slate-400 hover:text-primary hover:bg-primary/5 gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                title="Sincronizar productos del catálogo de marca"
                                                                                onClick={(e) => { e.stopPropagation(); handleSyncBrandInSupermarket(supermarket.id, brand.id, brand.name, supermarket.name); }}
                                                                            >
                                                                                <RefreshCw className="w-3 h-3" /> Sync
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                    <div className="mt-3 flex flex-wrap gap-1 max-h-16 overflow-y-auto no-scrollbar">
                                                                        {brand.products.map(p => (
                                                                            <Badge key={p.id} variant="secondary" className="text-[9px] font-normal bg-slate-50 text-slate-500 border-none px-1.5 py-0">
                                                                                {p.name}
                                                                            </Badge>
                                                                        ))}
                                                                    </div>

                                                                </div>
                                                            ))}
                                                            {supermarket.brands.length === 0 && (
                                                                <div className="col-span-full py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                                                    <p className="text-sm text-slate-400 italic">No hay marcas vinculadas a este supermercado.</p>
                                                                </div>
                                                            )}
                                                        </div>
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
                                                <CardTitle className="text-lg font-heading">Catalogo Marca</CardTitle>
                                                <p className="text-sm text-slate-500 mt-1">Portfolio conceptual de marca con estado editable</p>
                                            </div>
                                            <Button onClick={() => setAddBrandGlobalDialog(true)} className="rounded-xl px-5"><Plus className="w-4 h-4 mr-2" /> Gestionar Marcas</Button>
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
                                                    <AccordionTrigger className="hover:no-underline py-4">
                                                        <div className="flex items-center justify-between w-full pr-4">
                                                            <div className="flex items-center gap-3">
                                                                <span className="font-semibold text-slate-800">{brand.name}</span>
                                                                <Badge variant="secondary" className="bg-slate-100 text-slate-600">{brand.products_count} productos</Badge>
                                                            </div>
                                                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-8 border-primary/20 text-primary hover:bg-primary/5 gap-1.5"
                                                                    onClick={(e) => { e.stopPropagation(); setCatalogForm({ ...catalogForm, brand_id: brand.id, product_ids: [], status: "active" }); setCatalogDialog(true); }}
                                                                >
                                                                    <Plus className="w-3.5 h-3.5" /> Añadir Productos
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-full"
                                                                    onClick={async (e) => {
                                                                        e.stopPropagation();
                                                                        if (window.confirm(`¿Seguro que quieres quitar la marca ${brand.name} del catálogo?`)) {
                                                                            const entries = brandCatalog.filter(bc => bc.brand_id === brand.id);
                                                                            try {
                                                                                await Promise.all(entries.map(ent => axios.delete(`${API}/admin/brand-catalog/${ent.id}`)));
                                                                                toast.success("Marca eliminada del catálogo");
                                                                                fetchAllData();
                                                                            } catch (err) { toast.error("Error al eliminar"); }
                                                                        }
                                                                    }}
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="pt-2 pb-6 px-1">
                                                        <div className="space-y-4">
                                                            <div className="grid gap-2">
                                                                {brand.products.map((product) => {
                                                                    const statusMeta = getCatalogStatusMeta(product.status);
                                                                    const productConcept = products.find(p => p.id === product.product_id);
                                                                    const expandKey = `${brand.id}::${product.product_id}`;
                                                                    const isExpanded = !!expandedCatalogProducts[expandKey];

                                                                    return (
                                                                        <div key={product.id} className="rounded-xl border bg-white shadow-sm overflow-hidden group">
                                                                            {/* ── Header row – always visible ── */}
                                                                            <div
                                                                                className="px-4 py-3 flex items-center justify-between bg-slate-50/30 hover:bg-slate-50/80 transition-colors cursor-pointer select-none"
                                                                                onClick={() => toggleCatalogProduct(expandKey)}
                                                                            >
                                                                                <div className="flex items-center gap-3">
                                                                                    {isExpanded
                                                                                        ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                                                                                        : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                                                                                    }
                                                                                    <div>
                                                                                        <span className="font-semibold text-slate-800">{product.name}</span>
                                                                                        <div className="flex items-center gap-2 mt-0.5">
                                                                                            <Badge className={`${statusMeta.className} text-[9px] h-4 px-1.5`}>{statusMeta.label}</Badge>
                                                                                            {product.supermarkets.length > 0 && (
                                                                                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                                                                    <Store className="w-2.5 h-2.5" /> {product.supermarkets.join(", ")}
                                                                                                </span>
                                                                                            )}
                                                                                            {productConcept?.allowed_attribute_ids?.length > 0 && (
                                                                                                <span className="text-[10px] text-slate-400">
                                                                                                    · {productConcept.allowed_attribute_ids.length} atrib.
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <Button
                                                                                    variant="ghost" size="icon"
                                                                                    className="h-8 w-8 text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                                                                    onClick={(e) => { e.stopPropagation(); handleDeleteCatalogEntry(product.id); }}
                                                                                >
                                                                                    <Trash2 className="w-4 h-4" />
                                                                                </Button>
                                                                            </div>

                                                                            {/* ── Expandable body ── */}
                                                                            {isExpanded && (
                                                                                <div className="p-4 space-y-4 border-t">
                                                                                    {productConcept?.allowed_attribute_ids?.length > 0 ? (
                                                                                        <div className="grid sm:grid-cols-2 gap-4">
                                                                                            {productConcept.allowed_attribute_ids.map(attrId => {
                                                                                                const attr = attributes.find(a => a.id === attrId);
                                                                                                if (!attr) return null;

                                                                                                return (
                                                                                                    <div key={attrId} className="space-y-2">
                                                                                                        <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{attr.name}</Label>
                                                                                                        <div className="flex flex-wrap gap-1.5">
                                                                                                            {attr.values?.map(val => (
                                                                                                                <div
                                                                                                                    key={val}
                                                                                                                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs cursor-pointer transition-all ${product.allowed_attributes?.[attrId]?.includes(val)
                                                                                            ? 'bg-primary/10 border-primary/20 text-primary shadow-sm'
                                                                                                                            : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                                                                                                                        }`}
                                                                                                                    onClick={async (e) => {
                                                                                                                        e.stopPropagation();
                                                                                                                        const current = product.allowed_attributes?.[attrId] || [];
                                                                                                                        const next = current.includes(val) ? current.filter(v => v !== val) : [...current, val];
                                                                                                                        const updatedAttrs = { ...product.allowed_attributes, [attrId]: next };
                                                                                                                        try {
                                                                                                                            await axios.post(`${API}/admin/brand-catalog`, {
                                                                                                                                brand_id: product.brand_id,
                                                                                                                                product_id: product.product_id,
                                                                                                                                status: product.status,
                                                                                                                                allowed_attributes: updatedAttrs
                                                                                                                            });
                                                                                                                            fetchAllData();
                                                                                                                        } catch (e) { toast.error("Error al actualizar"); }
                                                                                                                    }}
                                                                                                                >
                                                                                    <div className={`w-2 h-2 rounded-full ${product.allowed_attributes?.[attrId]?.includes(val) ? 'bg-primary' : 'bg-slate-200'}`} />
                                                                                                                    {val}
                                                                                                                </div>
                                                                                                            ))}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                );
                                                                                            })}
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div className="flex flex-col items-center justify-center py-3 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                                                                                            <Tag className="w-4 h-4 text-slate-300 mb-1" />
                                                                                            <p className="text-[11px] text-slate-400 italic">Sin atributos configurados.</p>
                                                                                        </div>
                                                                                    )}

                                                                                    <div className="pt-2 border-t flex justify-between items-center">
                                                                                        <Label className="text-[10px] font-medium text-slate-500">Estado:</Label>
                                                                                        <div className="flex gap-2">
                                                                                            {["active", "planned", "discontinued"].map(st => (
                                                                                                <button
                                                                                                    key={st}
                                                                                                    onClick={async (e) => {
                                                                                                        e.stopPropagation();
                                                                                                        try {
                                                                                                            await axios.post(`${API}/admin/brand-catalog`, {
                                                                                                                brand_id: product.brand_id,
                                                                                                                product_id: product.product_id,
                                                                                                                status: st,
                                                                                                                allowed_attributes: product.allowed_attributes
                                                                                                            });
                                                                                                            fetchAllData();
                                                                                                        } catch (e) { toast.error("Error"); }
                                                                                                    }}
                                                                                                    className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold transition-colors ${product.status === st
                                                                                                            ? 'bg-slate-800 text-white'
                                                                                                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                                                                                        }`}
                                                                                                >
                                                                                                    {st === 'active' ? 'Activo' : st === 'planned' ? 'Planeado' : 'Desc.'}
                                                                                                </button>
                                                                                            ))}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="attr-cat">
                                <Card>
                                    <CardHeader className="space-y-4">
                                        <div>
                                            <CardTitle className="text-lg">Configuración de Atributos</CardTitle>
                                            <p className="text-sm text-slate-500 mt-1">Define qué características (sabor, tipo, etc.) puede tener cada producto conceptual.</p>
                                        </div>
                                        <div className="relative">
                                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <Input value={productTableSearch} onChange={(e) => setProductTableSearch(e.target.value)} placeholder="Buscar producto conceptual..." className="pl-9" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <Accordion type="multiple" className="w-full">
                                            {products.filter(p => (productTableSearch === "" || p.name.toLowerCase().includes(productTableSearch.toLowerCase()))).sort((a, b) => a.name.localeCompare(b.name)).map(baseProd => (
                                                <AccordionItem key={baseProd.id} value={`attr-prod-${baseProd.id}`}>
                                                    <AccordionTrigger className="hover:no-underline">
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-semibold text-slate-800">{baseProd.name}</span>
                                                            <Badge variant="secondary" className="bg-blue-50 text-blue-700">{baseProd.allowed_attribute_ids?.length || 0} atributos</Badge>
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="pt-2 px-1">
                                                        <div className="bg-slate-50 rounded-lg p-4 border border-dashed">
                                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Atributos Disponibles</p>
                                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                                                {attributes.map(attr => (
                                                                    <div key={attr.id} className="flex items-center space-x-2">
                                                                        <Checkbox
                                                                            id={`base-${baseProd.id}-attr-${attr.id}`}
                                                                            checked={baseProd.allowed_attribute_ids?.includes(attr.id)}
                                                                            onCheckedChange={async (checked) => {
                                                                                const current = baseProd.allowed_attribute_ids || [];
                                                                                const next = checked
                                                                                    ? [...current, attr.id]
                                                                                    : current.filter(id => id !== attr.id);

                                                                                try {
                                                                                    await axios.put(`${API}/admin/products/${baseProd.id}`, {
                                                                                        ...baseProd,
                                                                                        allowed_attribute_ids: next
                                                                                    });
                                                                                    toast.success(`Atributo ${attr.name} vinculado`);
                                                                                    fetchAllData();
                                                                                } catch (e) {
                                                                                    toast.error("Error al actualizar");
                                                                                }
                                                                            }}
                                                                        />
                                                                        <label
                                                                            htmlFor={`base-${baseProd.id}-attr-${attr.id}`}
                                                                            className="text-sm font-medium cursor-pointer"
                                                                        >
                                                                            {attr.name}
                                                                        </label>
                                                                    </div>
                                                                ))}
                                                                {attributes.length === 0 && <p className="text-xs text-slate-400 italic">No hay atributos definidos. Créalos en 'Datos Base &gt; Atributos'.</p>}
                                                            </div>
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
                                    <CardContent className="px-6 pb-6 pt-0">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="pl-0">Producto</TableHead>
                                                    <TableHead>Categoría</TableHead>
                                                    <TableHead>Unidades Vinculadas</TableHead>
                                                    <TableHead className="text-right pr-0">Acciones</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredRelationProducts.map((p) => (
                                                    <TableRow key={p.id}>
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-slate-800">{p.name}</span>
                                                                {p.linked_brands?.length > 0 && (
                                                                    <div className="flex items-center gap-1 mt-1">
                                                                        <span className="text-[10px] text-slate-400">Marcas:</span>
                                                                        {p.linked_brands.slice(0, 3).map(b => <Badge key={b} variant="ghost" className="text-[9px] h-4 px-1 border-slate-100">{b}</Badge>)}
                                                                        {p.linked_brands.length > 3 && <span className="text-[9px] text-slate-400">+{p.linked_brands.length - 3}</span>}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary" className="bg-slate-50 text-slate-500 border-slate-200">{p.category_name || "Sin categoría"}</Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-wrap gap-1">
                                                                {(unitNamesByProduct[p.id] || []).map((u) => (
                                                                    <Badge key={`${p.id}-${u.unit_id}`} variant="outline" className="text-[10px] bg-blue-50/50 text-blue-600 border-blue-100">{u.unit_name}</Badge>
                                                                ))}
                                                                {(unitNamesByProduct[p.id] || []).length === 0 && (
                                                                    <span className="text-xs text-rose-400 italic font-medium flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Sin configurar</span>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right pr-0">
                                                            <Button variant="ghost" size="sm" className="h-8 text-primary hover:bg-primary/5" onClick={() => openProductUnitDialog(p.id)}>
                                                                <Pencil className="w-3.5 h-3.5 mr-1.5" /> Editar
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                {filteredRelationProducts.length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="h-24 text-center text-slate-400 italic">No hay productos que coincidan con el filtro.</TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </TabsContent>

                    <TabsContent value="moderacion" className="space-y-6">
                        <Card className="flex flex-col bg-slate-50 border-slate-200 overflow-hidden shadow-sm min-h-[600px]">
                            <div className="p-6 pb-4 border-b bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10">
                                <div>
                                    <h2 className="flex items-center gap-3 text-2xl font-black text-slate-800 font-heading tracking-tight">
                                        <div className="p-2 bg-rose-100 text-rose-600 rounded-xl border border-rose-200 shadow-sm">
                                            <ShieldAlert className="w-6 h-6" />
                                        </div>
                                        Centro de Moderación
                                    </h2>
                                    <div className="flex items-center gap-2 mt-2">
                                        <p className="text-sm text-slate-500">Mostrando {pricesData.total} reportes</p>
                                        <div className="flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 ml-4">
                                            {[
                                                { id: "suspicious", label: "Pendientes", color: "text-amber-600" },
                                                { id: "valid", label: "Válidos", color: "text-primary" },
                                                { id: "invalid", label: "Invalidados", color: "text-rose-600" },
                                                { id: "all", label: "Todos", color: "text-slate-600" }
                                            ].map(f => (
                                                <button
                                                    key={f.id}
                                                    onClick={() => { setPriceStatusFilter(f.id); fetchPrices(1, priceTableSearch, f.id); }}
                                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${priceStatusFilter === f.id ? 'bg-white shadow-sm ' + f.color : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    {f.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="relative group">
                                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                                        <Input
                                            placeholder="Buscar producto, tienda..."
                                            className="w-64 pl-9 h-11 bg-slate-50 border-slate-200 focus-visible:ring-primary transition-all rounded-xl shadow-inner"
                                            value={priceTableSearch}
                                            onChange={(e) => setPriceTableSearch(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') fetchPrices(1, priceTableSearch, priceStatusFilter); }}
                                        />
                                    </div>
                                    <Button size="icon" variant="outline" className="h-11 w-11 rounded-xl border-slate-200 hover:bg-slate-100 shadow-sm" onClick={() => fetchPrices(pricesData.page, priceTableSearch, priceStatusFilter)}>
                                        <RefreshCw className={`w-4 h-4 ${loadingPrices ? 'animate-spin text-primary' : 'text-slate-600'}`} />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex-1 p-6 space-y-4">
                                {pricesData.items.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-4">
                                        <div className="p-4 bg-slate-100 rounded-full">
                                            <CheckCircle className="w-8 h-8 text-primary/30" />
                                        </div>
                                        <p className="text-lg font-medium text-slate-500">No hay reportes pendientes</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                        {pricesData.items.map((p) => (
                                            <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-5 relative overflow-hidden">
                                                <div className={`absolute top-0 left-0 w-1.5 h-full ${p.status === 'invalid' ? 'bg-rose-400' : 'bg-primary'}`} />
                                                
                                                <div className="flex sm:flex-col items-center justify-between sm:justify-start gap-3 sm:w-28 sm:border-r border-slate-100 sm:pr-5 shrink-0 pl-2">
                                                    <div className="flex items-center gap-2 sm:flex-col sm:text-center">
                                                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shadow-inner">
                                                            <span className="font-bold text-slate-600 text-sm">{p.user_name?.substring(0, 2).toUpperCase() || "US"}</span>
                                                        </div>
                                                        <div className="sm:mt-2">
                                                            <p className="text-xs font-bold text-slate-700 truncate w-24 font-heading" title={p.user_name}>{p.user_name || "Usuario"}</p>
                                                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{new Date(p.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    {p.status === "invalid" ? (
                                                        <Badge className="bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 text-[10px] shadow-sm">INVALIDADO</Badge>
                                                    ) : (
                                                        <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 text-[10px] shadow-sm">VÁLIDO</Badge>
                                                    )}
                                                </div>

                                                <div className="flex-1 space-y-3">
                                                    <div>
                                                        <h4 className="font-black text-slate-900 text-base leading-tight mb-1.5 font-heading">{p.product_name || "Producto desconocido"}</h4>
                                                        <div className="flex flex-wrap items-center gap-2 text-sm">
                                                            <span className="flex items-center gap-1 text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 shadow-sm font-medium"><Store className="w-3.5 h-3.5 text-slate-400" /> {p.supermarket_name || "Súper"}</span>
                                                            <span className="text-primary font-black text-[11px] uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 shadow-sm">{p.brand_name || "Marca"}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-baseline gap-2 bg-slate-50/50 w-fit px-3 py-1.5 rounded-lg border border-slate-100">
                                                        <span className="text-2xl font-black text-slate-900 tracking-tight tabular-nums">{p.price.toFixed(2)}€</span>
                                                        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest text-[10px]">/ cant: {p.quantity}</span>
                                                    </div>
                                                    {p.anomaly_reason && (
                                                        <div className="flex items-start gap-2 p-2.5 bg-amber-50 rounded-xl border border-amber-100">
                                                            <ShieldAlert className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                                                            <p className="text-[11px] text-amber-700 leading-normal">
                                                                <span className="font-bold">Alerta:</span> {p.anomaly_reason}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex sm:flex-col gap-2 justify-end sm:justify-center shrink-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                                    {p.status === "invalid" ? (
                                                        <Button size="sm" variant="outline" className="w-full sm:w-28 h-9 bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 shadow-sm" onClick={() => handleValidatePrice(p.id)}>
                                                            <CheckCircle className="w-4 h-4 mr-1.5" /> Validar
                                                        </Button>
                                                    ) : (
                                                        <Button size="sm" variant="outline" className="w-full sm:w-28 h-9 bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100 hover:text-rose-800 shadow-sm" onClick={() => handleInvalidatePrice(p.id)}>
                                                            <XCircle className="w-4 h-4 mr-1.5" /> Invalidar
                                                        </Button>
                                                    )}
                                                    <div className="flex gap-2 w-full sm:w-28">
                                                        <Button size="icon" variant="outline" className="flex-1 h-9 border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 shadow-sm" onClick={() => { setEditingItem(p); setPriceForm({ price: p.price, quantity: p.quantity }); setPriceDialog(true); }}>
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button size="icon" variant="outline" className="flex-1 h-9 border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 shadow-sm" onClick={() => handleDeletePrice(p.id)}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-slate-200 bg-slate-100/50 flex items-center justify-between sticky bottom-0 z-10">
                                <p className="text-sm font-semibold text-slate-600">Página {pricesData.page} de {pricesData.total_pages || 1}</p>
                                <div className="flex gap-2">
                                    <Button variant="outline" className="bg-white shadow-sm hover:bg-slate-50" disabled={pricesData.page <= 1 || loadingPrices} onClick={() => fetchPrices(pricesData.page - 1, priceTableSearch, priceStatusFilter)}>Anterior</Button>
                                    <Button variant="outline" className="bg-white shadow-sm hover:bg-slate-50" disabled={pricesData.page >= pricesData.total_pages || loadingPrices} onClick={() => fetchPrices(pricesData.page + 1, priceTableSearch, priceStatusFilter)}>Siguiente</Button>
                                </div>
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="space-y-6">


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
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-base">Distribucion por supermercado</CardTitle>
                                        <Store className="w-4 h-4 text-slate-400" />
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {sellablesBySupermarket.slice(0, 8).map((item) => (
                                            <div key={item.id} className="flex items-center justify-between text-sm py-1 border-b border-slate-50 last:border-0">
                                                <span className="text-slate-700">{item.name}</span>
                                                <Badge variant="secondary" className="font-mono">{item.count}</Badge>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                <Card className="border-amber-100 bg-amber-50/20">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-base text-amber-900 flex items-center gap-2">
                                            <ShieldAlert className="w-4 h-4 text-amber-600" /> Auditoría de Integridad
                                        </CardTitle>
                                        <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">Acción requerida</Badge>
                                    </CardHeader>
                                    <CardContent className="grid sm:grid-cols-2 gap-4">
                                        {[
                                            { label: "Productos sin imagen", count: gaps.productsWithoutImage, tab: "maestros", subtab: "products" },
                                            { label: "Productos sin unidad", count: gaps.missingUnits, tab: "catalogos", subtab: "units-catalog" },
                                            { label: "Marcas sin logo", count: gaps.brandsWithoutLogo, tab: "maestros", subtab: "brands" },
                                            { label: "Súpers sin logo", count: gaps.supermarketsWithoutLogo, tab: "maestros", subtab: "supermarkets" },
                                            { label: "Sin estado catálogo", count: gaps.unmappedSellables, tab: "catalogos", subtab: "sellable" },
                                            { label: "Reportes sospechosos", count: pricesData.total, tab: "moderacion" }
                                        ].map((gap, i) => (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    setActiveMainTab(gap.tab);
                                                    if (gap.tab === "maestros") setActiveMaestrosTab(gap.subtab);
                                                    if (gap.tab === "catalogos") setActiveCatalogosTab(gap.subtab);
                                                    if (gap.label === "Productos sin imagen") setShowOnlyProductsWithoutImage(true);
                                                    if (gap.label === "Productos sin unidad") setRelationOnlyMissingUnits(true);
                                                }}
                                                className="flex items-center justify-between p-3 bg-white rounded-xl border border-amber-100 shadow-sm hover:border-amber-300 hover:shadow-md transition-all text-left group"
                                            >
                                                <div className="space-y-0.5">
                                                    <p className="text-[11px] font-bold text-amber-900 uppercase tracking-tight opacity-60 group-hover:opacity-100 transition-opacity">{gap.label}</p>
                                                    <p className="text-xl font-black text-amber-600">{gap.count}</p>
                                                </div>
                                                <div className={`p-2 rounded-lg transition-colors ${gap.count > 0 ? 'bg-amber-100 text-amber-600 group-hover:bg-amber-200' : 'bg-slate-50 text-slate-300'}`}>
                                                    <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </button>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                    </TabsContent>

                    <TabsContent value="sistema" className="space-y-6">
                        <Card className="bg-slate-50 border-slate-200 p-6 shadow-md">
                            <div className="mb-6">
                                <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-800 tracking-tight">
                                    <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-200">
                                        <Database className="w-6 h-6 text-primary" />
                                    </div>
                                    Sincronización del Sistema
                                </h2>
                                <p className="text-slate-500 mt-2">Importa o exporta la base de datos maestra de catálogos y referencias usando plantillas de Excel.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                {/* Export Card */}
                                <Card className="group relative overflow-hidden border-primary/10 bg-white hover:shadow-xl hover:shadow-primary/10 transition-all duration-500">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <CardContent className="p-8 relative h-full flex flex-col">
                                        <div className="flex flex-col items-center text-center space-y-6 flex-1">
                                            <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary shadow-sm border border-primary/10 group-hover:scale-110 transition-transform duration-500">
                                                <Download className="w-8 h-8" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-xl font-bold text-slate-800">Exportar Plantilla</h3>
                                                <p className="text-sm text-slate-500 max-w-[250px] mx-auto">Descarga el estado actual de la base de datos para editarlo localmente.</p>
                                            </div>
                                            <div className="w-full mt-auto pt-8 space-y-4">
                                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                    <span className="text-sm font-semibold text-slate-700">Formato</span>
                                                    <div className="flex p-1 bg-slate-200/50 rounded-lg">
                                                        <button onClick={() => setExportFormat("xlsx")} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${exportFormat === "xlsx" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>EXCEL</button>
                                                        <button onClick={() => setExportFormat("ods")} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${exportFormat === "ods" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>ODS</button>
                                                    </div>
                                                </div>
                                                <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                                                    <Checkbox id="includePrices" checked={includePrices} onCheckedChange={setIncludePrices} className="border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                                                    <span className="text-sm font-medium text-slate-700 select-none">Incluir histórico de precios</span>
                                                </label>
                                                <Button onClick={handleExportDB} disabled={systemLoading} className="w-full h-12 rounded-xl font-bold shadow-md transition-all">
                                                    {systemLoading ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <Download className="w-5 h-5 mr-2" />}
                                                    Descargar Archivo
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Import Card */}
                                <Card className="group relative overflow-hidden border-blue-100 bg-white hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500">
                                    <div className="absolute inset-0 bg-gradient-to-bl from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <CardContent className="p-8 relative h-full flex flex-col">
                                        <div className="flex flex-col items-center text-center space-y-6 flex-1">
                                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-200 group-hover:scale-110 transition-transform duration-500">
                                                <Upload className="w-8 h-8" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-xl font-bold text-slate-800">Carga Masiva</h3>
                                                <p className="text-sm text-slate-500 max-w-[250px] mx-auto">Sube una plantilla editada para sincronizar masivamente el catálogo.</p>
                                            </div>

                                            <div className="w-full mt-auto pt-8">
                                                <div className="relative group/dropzone">
                                                    <div className="absolute inset-0 bg-blue-50 rounded-xl border-2 border-dashed border-blue-200 transition-all group-hover/dropzone:border-blue-400 group-hover/dropzone:bg-blue-100/50" />
                                                    <div className="relative p-8 flex flex-col items-center justify-center gap-3">
                                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-500 mb-1 group-hover/dropzone:scale-110 transition-transform">
                                                            <Database className="w-6 h-6" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className="block text-sm font-semibold text-blue-900">Haz clic para seleccionar</span>
                                                            <span className="block text-xs text-blue-600/70">.xlsx, .xls, o .ods</span>
                                                        </div>
                                                    </div>
                                                    <Input
                                                        type="file"
                                                        accept=".xlsx, .xls, .ods"
                                                        onChange={(e) => { handleImportDB(e); }}
                                                        disabled={systemLoading}
                                                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="mt-4 p-5 bg-amber-50 rounded-2xl border border-amber-200 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400" />
                                <h4 className="text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4 text-amber-600" /> Atención: Reglas de Sincronización
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5 text-sm text-amber-800/90">
                                    <p className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span> <span>Si eliminas una fila en el Excel, se <strong>borrará</strong> permanentemente en la BD.</span></p>
                                    <p className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span> <span>Deja la columna <code className="bg-amber-100/50 px-1 border border-amber-200/50 rounded text-xs font-mono">id</code> vacía para crear nuevos registros automáticamente.</span></p>
                                    <p className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span> <span>Cada hoja (sheet) representa una colección de datos principal y se procesa por separado.</span></p>
                                    <p className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span> <span>Se ignorarán las columnas o cabeceras duplicadas.</span></p>
                                </div>
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>

            </div>


            {/* Diálogos */}
            <Dialog open={productDialog} onOpenChange={setProductDialog}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>{editingItem ? "Editar" : "Nuevo"} Producto Conceptual</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Nombre del Producto</Label>
                            <Input value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} placeholder="Ej: Yogur, Pan, Leche..." />
                            <p className="text-[10px] text-slate-500 italic">Define el concepto general. Las marcas y variantes se gestionan en los catálogos correspondientes.</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Categoría</Label>
                            <Select value={productForm.category_id} onValueChange={v => setProductForm({ ...productForm, category_id: v })}>
                                <SelectTrigger><SelectValue placeholder="Seleccionar categoría" /></SelectTrigger>
                                <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Código de Barras Genérico (Opcional)</Label>
                            <Input value={productForm.barcode || ""} onChange={e => setProductForm({ ...productForm, barcode: e.target.value })} placeholder="Barcode" />
                        </div>

                        <div className="space-y-2">
                            <Label>Imagen Genérica (URL)</Label>
                            <Input value={productForm.image_url || ""} onChange={e => setProductForm({ ...productForm, image_url: e.target.value })} placeholder="https://..." />
                        </div>

                        <Button onClick={handleSaveProduct} className="w-full bg-primary" data-testid="save-product-btn">Guardar Concepto de Producto</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={attributeDialog} onOpenChange={setAttributeDialog}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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

                        <div className="space-y-3 pt-2">
                            <Label>Valores Posibles</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={newAttributeValue}
                                    onChange={e => setNewAttributeValue(e.target.value)}
                                    placeholder="Nuevo valor..."
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            if (newAttributeValue.trim()) {
                                                setAttributeForm({ ...attributeForm, values: [...(attributeForm.values || []), newAttributeValue.trim()] });
                                                setNewAttributeValue("");
                                            }
                                        }
                                    }}
                                />
                                <Button size="sm" type="button" onClick={() => {
                                    if (newAttributeValue.trim()) {
                                        setAttributeForm({ ...attributeForm, values: [...(attributeForm.values || []), newAttributeValue.trim()] });
                                        setNewAttributeValue("");
                                    }
                                }}><Plus className="w-4 h-4" /></Button>
                            </div>
                            <div className="flex flex-wrap gap-2 min-h-10 p-2 border rounded bg-slate-50">
                                {attributeForm.values?.map((v, i) => (
                                                <Badge key={i} className="gap-1 pr-1 bg-primary/10 text-primary hover:bg-primary/20">
                                        {v}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-4 w-4 rounded-full hover:bg-primary/20"
                                            onClick={() => setAttributeForm({ ...attributeForm, values: attributeForm.values.filter((_, idx) => idx !== i) })}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                ))}
                                {(!attributeForm.values || attributeForm.values.length === 0) && <span className="text-xs text-slate-400 italic">Sin valores definidos</span>}
                            </div>
                        </div>

                        <Button onClick={handleSaveAttribute} className="w-full bg-primary">Guardar Atributo</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={brandDialog} onOpenChange={setBrandDialog}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{editingItem ? "Editar" : "Nueva"} Marca</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-4">
                        <Label>Nombre</Label><Input value={brandForm.name} onChange={e => setBrandForm({ ...brandForm, name: e.target.value })} placeholder="Nombre de la marca" data-testid="brand-name-input" />
                        <Button onClick={handleSaveBrand} className="w-full bg-primary" data-testid="save-brand-btn">Guardar</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={supermarketDialog} onOpenChange={setSupermarketDialog}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{editingItem ? "Editar" : "Nuevo"} Supermercado</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-4">
                        <Label>Nombre</Label><Input value={supermarketForm.name} onChange={e => setSupermarketForm({ ...supermarketForm, name: e.target.value })} placeholder="Nombre del supermercado" data-testid="supermarket-name-input" />
                        <Button onClick={handleSaveSupermarket} className="w-full bg-primary" data-testid="save-supermarket-btn">Guardar</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={unitDialog} onOpenChange={setUnitDialog}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{editingItem ? "Editar" : "Nueva"} Unidad</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-4">
                        <Label>Nombre</Label><Input value={unitForm.name} onChange={e => setUnitForm({ ...unitForm, name: e.target.value })} placeholder="Ej: Litro" />
                        <Label>Abreviatura</Label><Input value={unitForm.abbreviation} onChange={e => setUnitForm({ ...unitForm, abbreviation: e.target.value })} placeholder="Ej: L" />
                        <Button onClick={handleSaveUnit} className="w-full bg-primary">Guardar</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{editingItem ? "Editar" : "Nueva"} Categoría</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-4">
                        <Label>Nombre</Label><Input value={categoryForm.name} onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} placeholder="Nombre de la categoría" />
                        <Button onClick={handleSaveCategory} className="w-full bg-primary">Guardar</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={supermarketBrandDialog} onOpenChange={setSupermarketBrandDialog}>
                <DialogContent className="max-w-xl">
                    <DialogHeader><DialogTitle>Gestionar Marcas en {supermarkets.find(s => s.id === sellableForm.supermarket_id)?.name}</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <Input placeholder="Buscar marca para añadir..." value={productSearch} onChange={e => setProductSearch(e.target.value)} className="pl-9" />
                        </div>
                        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
                            {brands.filter(b => b.name.toLowerCase().includes(productSearch.toLowerCase())).map(brand => {
                                const isLinked = sellableProducts.some(sp => sp.supermarket_id === sellableForm.supermarket_id && sp.brand_id === brand.id);
                                return (
                                    <div key={brand.id} className="relative group">
                                        <Button
                                            variant={isLinked ? "secondary" : "outline"}
                                            className={`w-full justify-start h-auto py-2 px-3 pr-8 ${isLinked ? 'border-primary/20 bg-primary/10 text-primary' : ''}`}
                                            onClick={async () => {
                                                if (isLinked) {
                                                    toast.info("Esta marca ya está vinculada.");
                                                } else {
                                                    if (window.confirm(`¿Quieres vincular AUTOMÁTICAMENTE todos los productos activos de ${brand.name}?`)) {
                                                        try {
                                                            await axios.post(`${API}/admin/sellable-products/bulk`, {
                                                                supermarket_id: sellableForm.supermarket_id,
                                                                brand_id: brand.id,
                                                                catalog_entry_ids: [] // Empty means all active
                                                            });
                                                            toast.success("Marca y productos vinculados");
                                                            fetchAllData();
                                                            setSupermarketBrandDialog(false);
                                                        } catch (e) { toast.error("Error al vincular marca"); }
                                                    } else {
                                                        setSellableForm({ ...sellableForm, brand_id: brand.id, catalog_entry_ids: [] });
                                                        setSupermarketBrandDialog(false);
                                                        setSellableDialog(true);
                                                    }
                                                }
                                            }}
                                        >
                                            <div className="flex flex-col items-start text-left">
                                                <span className="font-medium text-sm">{brand.name}</span>
                                                {isLinked && <span className="text-[10px] uppercase font-bold tracking-tighter">Vinculada</span>}
                                            </div>
                                        </Button>
                                        {isLinked && (
                                            <button
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-rose-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    if (window.confirm(`¿Seguro que quieres quitar la marca ${brand.name} de este supermercado? Se borrarán todos sus productos.`)) {
                                                        try {
                                                            await axios.delete(`${API}/admin/supermarkets/${sellableForm.supermarket_id}/brands/${brand.id}`);
                                                            toast.success("Marca eliminada del supermercado");
                                                            fetchAllData();
                                                        } catch (err) { toast.error("Error al eliminar"); }
                                                    }
                                                }}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={sellableDialog} onOpenChange={(val) => { setSellableDialog(val); if (!val) setProductSearch(""); }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Vincular Productos: {brands.find(b => b.id === sellableForm.brand_id)?.name}</DialogTitle>
                        <p className="text-sm text-slate-500">Supermercado: {supermarkets.find(s => s.id === sellableForm.supermarket_id)?.name}</p>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="font-bold">Catálogo de la Marca</Label>
                                <Input
                                    placeholder="Filtrar catálogo..."
                                    className="w-1/2 h-8"
                                    value={productSearch}
                                    onChange={e => setProductSearch(e.target.value)}
                                />
                            </div>
                            <div className="border rounded-md p-3 grid grid-cols-2 gap-2 max-h-80 overflow-y-auto bg-slate-50">
                                {brandCatalog
                                    .filter(bc => bc.brand_id === sellableForm.brand_id)
                                    .filter(bc => bc.product_name.toLowerCase().includes(productSearch.toLowerCase()))
                                    .map(bc => {
                                        const alreadyInSM = sellableProducts.some(sp =>
                                            sp.supermarket_id === sellableForm.supermarket_id &&
                                            sp.product_id === bc.product_id &&
                                            sp.brand_id === bc.brand_id &&
                                            JSON.stringify(sp.attribute_values || {}) === JSON.stringify(bc.attribute_values || {})
                                        );
                                        return (
                                            <div key={bc.id} className={`flex items-center space-x-2 p-2 rounded transition-colors border ${alreadyInSM ? 'bg-slate-100 border-slate-200 opacity-60' : 'bg-white hover:border-primary/20 shadow-sm'}`}>
                                                <Checkbox
                                                    id={`sp-${bc.id}`}
                                                    disabled={alreadyInSM}
                                                    checked={alreadyInSM || sellableForm.catalog_entry_ids.includes(bc.id)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) setSellableForm({ ...sellableForm, catalog_entry_ids: [...sellableForm.catalog_entry_ids, bc.id] });
                                                        else setSellableForm({ ...sellableForm, catalog_entry_ids: sellableForm.catalog_entry_ids.filter(id => id !== bc.id) });
                                                    }}
                                                />
                                                <div className="flex flex-col flex-1 cursor-default">
                                                    <label htmlFor={`sp-${bc.id}`} className="text-sm font-medium leading-none cursor-pointer">
                                                        {bc.product_name}
                                                    </label>
                                                    {bc.attribute_values && Object.entries(bc.attribute_values).length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {Object.entries(bc.attribute_values).map(([attrId, val]) => {
                                                                const attr = attributes.find(a => a.id === attrId);
                                                                return <Badge key={attrId} variant="outline" className="text-[10px] h-3 px-1">{attr?.name}: {val}</Badge>
                                                            })}
                                                        </div>
                                                    )}
                                                    {alreadyInSM && <span className="text-[9px] text-slate-500 italic mt-0.5">Ya disponible en este súper</span>}
                                                    <Badge variant="outline" className="w-fit text-[9px] h-4 mt-1 px-1">{bc.status}</Badge>
                                                </div>
                                            </div>
                                        );
                                    })
                                }
                                {brandCatalog.filter(bc => bc.brand_id === sellableForm.brand_id).length === 0 && (
                                    <div className="col-span-2 py-8 text-center text-slate-400 italic text-sm">
                                        No hay productos en el catálogo conceptual de esta marca.<br />
                                        <Button variant="link" size="sm" onClick={() => setCatalogDialog(true)}>Gestionar Catálogo de Marca</Button>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-primary font-semibold">{sellableForm.catalog_entry_ids.length} variantes nuevas seleccionadas</p>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button variant="outline" className="flex-1" onClick={() => setSellableDialog(false)}>Cancelar</Button>
                            <Button onClick={handleSaveSellable} className="flex-[2] bg-primary" disabled={sellableForm.catalog_entry_ids.length === 0}>
                                Confirmar Vinculación ({sellableForm.catalog_entry_ids.length})
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={catalogDialog} onOpenChange={(val) => { setCatalogDialog(val); if (!val) { setProductSearch(""); } }}>
                <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Añadir Productos al Catálogo</DialogTitle>
                        <p className="text-sm text-slate-500">Selecciona los productos conceptuales que esta marca comercializa.</p>
                    </DialogHeader>
                    <div className="space-y-6 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Marca</Label>
                                <Select value={catalogForm.brand_id} onValueChange={v => setCatalogForm({ ...catalogForm, brand_id: v })}>
                                    <SelectTrigger><SelectValue placeholder="Seleccionar marca" /></SelectTrigger>
                                    <SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Estado Inicial</Label>
                                <Select value={catalogForm.status} onValueChange={v => setCatalogForm({ ...catalogForm, status: v })}>
                                    <SelectTrigger><SelectValue placeholder="Seleccionar estado" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Activo</SelectItem>
                                        <SelectItem value="planned">Planeado</SelectItem>
                                        <SelectItem value="discontinued">Descatalogado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {catalogForm.brand_id && (
                            <div className="space-y-3">
                                <Label className="font-bold">Seleccionar Productos</Label>
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <Input placeholder="Buscar concepto (ej: Yogur)..." value={productSearch} onChange={e => setProductSearch(e.target.value)} className="pl-9 h-9" />
                                </div>
                                <div className="border rounded-md p-3 grid grid-cols-2 gap-2 max-h-60 overflow-y-auto bg-slate-50 shadow-inner">
                                    {products
                                        .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                                        .map(p => {
                                            const alreadyInCatalog = brandCatalog.some(bc => bc.brand_id === catalogForm.brand_id && bc.product_id === p.id);
                                            return (
                                                <div key={p.id} className={`flex items-center space-x-2 p-2 rounded transition-colors border ${alreadyInCatalog ? 'bg-slate-100 border-slate-200 opacity-60' : 'bg-white hover:border-primary/20 shadow-sm'}`}>
                                                    <Checkbox
                                                        id={`cat-${p.id}`}
                                                        disabled={alreadyInCatalog}
                                                        checked={alreadyInCatalog || catalogForm.product_ids.includes(p.id)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) setCatalogForm({ ...catalogForm, product_ids: [...catalogForm.product_ids, p.id] });
                                                            else setCatalogForm({ ...catalogForm, product_ids: catalogForm.product_ids.filter(id => id !== p.id) });
                                                        }}
                                                    />
                                                    <label htmlFor={`cat-${p.id}`} className="text-sm cursor-pointer flex-1 truncate">{p.name}</label>
                                                    {alreadyInCatalog && <span className="text-[9px] text-slate-500 italic">Ya en catálogo</span>}
                                                </div>
                                            );
                                        })
                                    }
                                </div>
                            </div>
                        )}

                        <Button onClick={handleSaveCatalog} className="w-full bg-primary mt-2 h-11 text-base font-semibold" disabled={catalogForm.product_ids.length === 0 || !catalogForm.brand_id}>
                            Añadir {catalogForm.product_ids.length} productos
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>


            <Dialog open={catalogStatusDialog} onOpenChange={setCatalogStatusDialog}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Configurar Entrada de Catálogo</DialogTitle></DialogHeader>
                    <div className="space-y-5 pt-4">
                        <div className="rounded-lg border bg-slate-50 p-3 text-sm text-slate-600">
                            <p><strong>Marca:</strong> {catalogStatusForm.brand_name || "-"}</p>
                            <p><strong>Producto Base:</strong> {catalogStatusForm.product_name || "-"}</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Estado Conceptual</Label>
                            <Select value={catalogStatusForm.status} onValueChange={(v) => setCatalogStatusForm({ ...catalogStatusForm, status: v })}>
                                <SelectTrigger><SelectValue placeholder="Seleccionar estado" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="planned">Planeado</SelectItem>
                                    <SelectItem value="active">Activo</SelectItem>
                                    <SelectItem value="discontinued">Descatalogado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3 pt-2 border-t">
                            <Label className="text-sm font-bold">Atributos del Producto (Variante de Marca)</Label>
                            <p className="text-xs text-slate-500">Define los valores específicos (sabor, formato, etc.) que tiene este producto base para esta marca.</p>

                            {(() => {
                                const baseProd = products.find(p => p.id === catalogStatusForm.product_id);
                                if (!baseProd) return null;

                                return baseProd.allowed_attribute_ids?.map(attrId => {
                                    const attr = attributes.find(a => a.id === attrId);
                                    return (
                                        <div key={attrId} className="space-y-1">
                                            <Label className="text-xs">{attr?.name}</Label>
                                            {attr?.values && attr.values.length > 0 ? (
                                                <Select
                                                    value={catalogStatusForm.attribute_values?.[attrId] || "none"}
                                                    onValueChange={v => setCatalogStatusForm({
                                                        ...catalogStatusForm,
                                                        attribute_values: { ...catalogStatusForm.attribute_values, [attrId]: v === "none" ? "" : v }
                                                    })}
                                                >
                                                    <SelectTrigger size="sm"><SelectValue placeholder={`Seleccionar ${attr.name}`} /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">Seleccionar...</SelectItem>
                                                        {attr.values.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Input
                                                    size="sm"
                                                    value={catalogStatusForm.attribute_values?.[attrId] || ""}
                                                    onChange={e => setCatalogStatusForm({
                                                        ...catalogStatusForm,
                                                        attribute_values: { ...catalogStatusForm.attribute_values, [attrId]: e.target.value }
                                                    })}
                                                    placeholder={`Valor de ${attr?.name}`}
                                                />
                                            )}
                                        </div>
                                    );
                                });
                            })()}

                            {products.find(p => p.id === catalogStatusForm.product_id)?.allowed_attribute_ids?.length === 0 && (
                                <p className="text-xs text-slate-400 italic">Este producto base no tiene atributos configurados.</p>
                            )}
                        </div>

                        <Button onClick={handleSaveCatalogStatus} className="w-full bg-primary">Guardar Cambios</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={addSupermarketToCatalogDialog} onOpenChange={setAddSupermarketToCatalogDialog}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Añadir Supermercado al Catálogo</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-4">
                        <Label>Selecciona Supermercado</Label>
                        <Select onValueChange={(v) => {
                            setSellableForm({ ...sellableForm, supermarket_id: v, brand_id: "", catalog_entry_ids: [] });
                            setAddSupermarketToCatalogDialog(false);
                            setSupermarketBrandDialog(true);
                        }}>
                            <SelectTrigger><SelectValue placeholder="Supermercado..." /></SelectTrigger>
                            <SelectContent>
                                {supermarkets.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={addBrandGlobalDialog} onOpenChange={setAddBrandGlobalDialog}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Gestionar Marcas en el Catálogo</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <Input placeholder="Buscar marca..." value={brandTableSearch} onChange={e => setBrandTableSearch(e.target.value)} className="pl-9" />
                        </div>
                        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
                            {brands.filter(b => b.name.toLowerCase().includes(brandTableSearch.toLowerCase())).map(brand => {
                                const isLinked = brandCatalog.some(bc => bc.brand_id === brand.id);
                                return (
                                    <div key={brand.id} className="relative group">
                                        <Button
                                            variant={isLinked ? "secondary" : "outline"}
                                            className={`w-full justify-start h-auto py-2 px-3 pr-8 ${isLinked ? 'border-primary/20 bg-primary/5 text-primary' : ''}`}
                                            onClick={() => {
                                                setCatalogForm({ ...catalogForm, brand_id: brand.id, product_ids: [], status: "active", attribute_combinations: [] });
                                                setAddBrandGlobalDialog(false);
                                                setCatalogDialog(true);
                                            }}
                                        >
                                            <div className="flex flex-col items-start text-left">
                                                <span className="font-medium text-sm">{brand.name}</span>
                                                {isLinked && <span className="text-[10px] uppercase font-bold tracking-tighter">En catálogo</span>}
                                            </div>
                                        </Button>
                                        {isLinked && (
                                            <button
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-rose-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    if (window.confirm(`¿Seguro que quieres quitar la marca ${brand.name} del catálogo? Se borrarán todas sus variantes.`)) {
                                                        const entries = brandCatalog.filter(bc => bc.brand_id === brand.id);
                                                        try {
                                                            await Promise.all(entries.map(e => axios.delete(`${API}/admin/brand-catalog/${e.id}`)));
                                                            toast.success("Marca eliminada del catálogo");
                                                            fetchAllData();
                                                        } catch (err) { toast.error("Error al eliminar"); }
                                                    }
                                                }}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
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
                        <Button onClick={handleSaveProductUnits} disabled={relationSaving || relationLoading} className="w-full bg-primary">
                            {relationSaving ? "Guardando..." : "Guardar Unidades"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={priceDialog} onOpenChange={setPriceDialog}>
                <DialogContent className="max-w-md bg-white border-slate-200">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
                            <Pencil className="w-5 h-5 text-blue-500" />
                            Modificar Reporte
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-5 pt-4">
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700 space-y-1.5 shadow-sm">
                            <div className="flex justify-between items-center"><span className="text-slate-500">Producto</span> <span className="font-semibold text-slate-900">{editingItem?.product_name || "-"}</span></div>
                            <div className="flex justify-between items-center"><span className="text-slate-500">Tienda</span> <span className="font-medium">{editingItem?.supermarket_name || "-"}</span></div>
                            <div className="flex justify-between items-center"><span className="text-slate-500">Usuario</span> <span className="font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md text-xs">{editingItem?.user_name || "-"}</span></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-700 font-semibold">Precio (€)</Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={priceForm.price}
                                        onChange={e => setPriceForm({ ...priceForm, price: parseFloat(e.target.value) })}
                                        className="pl-8 text-lg font-bold bg-white"
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">€</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-700 font-semibold">Cantidad</Label>
                                <Input
                                    type="number"
                                    step="1"
                                    value={priceForm.quantity}
                                    onChange={e => setPriceForm({ ...priceForm, quantity: parseFloat(e.target.value) })}
                                    className="text-lg bg-white"
                                />
                            </div>
                        </div>
                        <Button onClick={handleSavePrice} className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 font-semibold rounded-xl shadow-md transition-all">
                            Guardar Cambios
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={invalidateDialog} onOpenChange={setInvalidateDialog}>
                <DialogContent className="max-w-sm bg-white border-rose-100">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-rose-600 text-xl font-bold">
                            <div className="p-1.5 bg-rose-100 rounded-lg shadow-sm">
                                <ShieldAlert className="w-5 h-5" />
                            </div>
                            Invalidar Reporte
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-5 pt-2">
                        <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl">
                            <p className="text-xs text-rose-800 leading-relaxed font-medium">
                                Esta acción notificará al usuario y le aplicará una penalización automática de <strong className="text-rose-900">-20 puntos</strong> de reputación.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-700 font-semibold">Motivo para el usuario</Label>
                            <Input
                                value={invalidateReason}
                                onChange={e => setInvalidateReason(e.target.value)}
                                placeholder="Ej: Foto borrosa, precio no coincide..."
                                autoFocus
                                className="bg-slate-50 focus-visible:ring-rose-500 border-slate-200"
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button variant="outline" className="flex-1 border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold" onClick={() => setInvalidateDialog(false)}>
                                Cancelar
                            </Button>
                            <Button className="flex-[1.5] bg-rose-600 hover:bg-rose-700 text-white shadow-md font-semibold transition-all" onClick={submitInvalidatePrice}>
                                Confirmar y Penalizar
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

        </Layout>


    );
};

export default AdminPage;

