import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { toast } from "sonner";
import { useShoppingListTutorial } from "../hooks/useShoppingListTutorial";
import {
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    Store,
    Package,
    RefreshCcw,
    CheckCircle2,
    Sparkles,
    AlertTriangle,
    Copy,
    TrendingUp,
    TrendingDown,
    Loader,
    HelpCircle,
    Clock,
    Search,
    X,
    SlidersHorizontal,
    Ban,
    Edit3,
    ArrowRight,
    ArrowLeft,
    ChevronDown,
    MoreVertical,
    Tag,
    Info,
    CircleDashed
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

const serializeItems = (items = []) => items.map((item) => ({
    sellable_product_id: item.sellable_product_id,
    quantity: item.quantity,
    unit_id: item.unit_id,
    price: item.price,
    purchased: item.purchased,
    attribute_values: item.attribute_values
}));

const upsertList = (collection, updatedList) => {
    const exists = collection.some((list) => list.id === updatedList.id);
    if (!exists) {
        return [updatedList, ...collection];
    }
    return collection.map((list) => (list.id === updatedList.id ? updatedList : list));
};

const formatCurrency = (value) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return "-";
    }
    return `${Number(value).toFixed(2)} EUR`;
};

const formatCurrencyShort = (value) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return "0.00€";
    }
    return `${Number(value).toFixed(2)}€`;
};

const formatCurrencyOptional = (value) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return "-";
    }
    return formatCurrencyShort(value);
};

const formatUnitPrice = (price, quantity, unitName) => {
    const priceNum = Number(price);
    const qtyNum = Number(quantity);
    if (!priceNum || !qtyNum || qtyNum <= 0) {
        return null;
    }
    return `${(priceNum / qtyNum).toFixed(2)}€/${unitName || "ud"}`;
};

const getPriceInsight = (item) => {
    if (!item?.estimated_price || !item?.price) {
        return null;
    }
    const difference = Number(item.price) - Number(item.estimated_price);
    const percentage = Number(item.estimated_price) ? (difference / Number(item.estimated_price)) * 100 : 0;
    const isHigher = difference > 0;
    if (Math.abs(percentage) < 0.5) {
        return { difference, percentage, isHigher: false, neutral: true, label: "Igual al estimado" };
    }
    return {
        difference,
        percentage,
        isHigher,
        label: isHigher
            ? `${percentage.toFixed(0)}% sobre estimado`
            : `${Math.abs(percentage).toFixed(0)}% bajo estimado`
    };
};

const SHOP_FILTER_OPTIONS = [
    { value: "all", label: "Todos" },
    { value: "pending", label: "Pendientes" },
    { value: "purchased", label: "Comprados" },
    { value: "no_price", label: "Falta precio" }
];

const SHOP_SORT_OPTIONS = [
    { value: "default", label: "Orden original" },
    { value: "status", label: "Pendientes primero" },
    { value: "name", label: "Alfabetico (A-Z)" },
    { value: "brand", label: "Por marca" }
];

const BUBBLE_ESTIMATED_HEIGHT = 280;

const getTutorialBubbleStyle = (step, rect) => {
    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1280;
    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 720;
    const width = Math.min(360, Math.max(280, viewportWidth - 32));
    const margin = 16;

    if (!step?.element || !rect) {
        return { top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: `${width}px` };
    }

    // Horizontal: center on element but clamp within viewport
    const centerX = rect.left + (rect.width / 2);
    const safeLeft = Math.min(
        Math.max(centerX - (width / 2), margin),
        viewportWidth - width - margin
    );

    // Helper: given a raw top (top-left corner of bubble), clamp to viewport
    const clampTop = (rawTop) =>
        Math.min(Math.max(rawTop, margin), viewportHeight - BUBBLE_ESTIMATED_HEIGHT - margin);

    if (step.position === "top") {
        // Prefer above the element; fall back to below if not enough room above
        const aboveTop = rect.top - BUBBLE_ESTIMATED_HEIGHT - 12;
        const belowTop = rect.bottom + 12;
        const fitsAbove = aboveTop >= margin;
        const fitsBelow = belowTop + BUBBLE_ESTIMATED_HEIGHT <= viewportHeight - margin;
        const rawTop = fitsAbove ? aboveTop : (fitsBelow ? belowTop : aboveTop);
        return {
            top: `${clampTop(rawTop)}px`,
            left: `${safeLeft}px`,
            transform: "none",
            width: `${width}px`,
        };
    }

    if (step.position === "right") {
        const preferredLeft = rect.right + 18;
        const fitsRight = preferredLeft + width <= viewportWidth - margin;
        const rawTop = rect.top + (rect.height / 2) - (BUBBLE_ESTIMATED_HEIGHT / 2);
        return {
            top: `${clampTop(rawTop)}px`,
            left: fitsRight ? `${preferredLeft}px` : `${safeLeft}px`,
            transform: "none",
            width: `${width}px`,
        };
    }

    // Default: below the element; fall back to above if not enough room below
    const belowTop = rect.bottom + 12;
    const aboveTop = rect.top - BUBBLE_ESTIMATED_HEIGHT - 12;
    const fitsBelow = belowTop + BUBBLE_ESTIMATED_HEIGHT <= viewportHeight - margin;
    const rawTop = fitsBelow ? belowTop : aboveTop;
    return {
        top: `${clampTop(rawTop)}px`,
        left: `${safeLeft}px`,
        transform: "none",
        width: `${width}px`,
    };
};

// ------------------------------------------------------------------
// ProgressRing component
// ------------------------------------------------------------------

const ProgressRing = ({ percent = 0, size = 44, stroke = 4, trackColor = "#e2e8f0", color = "#10b981" }) => {
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor} strokeWidth={stroke} fill="none" />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={stroke}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.5s ease" }}
                />
            </svg>
            <span className="absolute text-[10px] font-bold text-slate-700 tabular-nums">{percent}%</span>
        </div>
    );
};

// ------------------------------------------------------------------
// Main component
// ------------------------------------------------------------------

const ShoppingListPage = () => {
    const [lists, setLists] = useState([]);
    const [products, setProducts] = useState([]);
    const [attributes, setAttributes] = useState([]);
    const [supermarkets, setSupermarkets] = useState([]);
    const [units, setUnits] = useState([]);
    const [brands, setBrands] = useState([]);
    const [brandCatalog, setBrandCatalog] = useState([]);
    const [sellableProducts, setSellableProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedList, setSelectedList] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
    const [showEstimated, setShowEstimated] = useState(false);
    const [confirmEstimateOpen, setConfirmEstimateOpen] = useState(false);
    const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [finishSheetOpen, setFinishSheetOpen] = useState(false);
    const [autoSaving, setAutoSaving] = useState(false);
    const [pendingChanges, setPendingChanges] = useState(false);
    const { startTutorial, tutorial, nextStep, prevStep, closeTutorial } = useShoppingListTutorial(lists.length === 0);

    const [newListName, setNewListName] = useState("");
    const [newListSupermarket, setNewListSupermarket] = useState("");

    const [newItemProduct, setNewItemProduct] = useState("");
    const [newItemBrandId, setNewItemBrandId] = useState("");
    const [newItemAttrValues, setNewItemAttrValues] = useState({});
    const [newItemSellable, setNewItemSellable] = useState("");
    const [newItemQuantity, setNewItemQuantity] = useState("1");
    const [newItemUnit, setNewItemUnit] = useState("");
    const [editingItemIndex, setEditingItemIndex] = useState(null);
    const [productSearch, setProductSearch] = useState("");

    const [availableBrandsForProduct, setAvailableBrandsForProduct] = useState([]);
    const [availableUnits, setAvailableUnits] = useState([]);

    // Shop mode UX
    const [shopSearch, setShopSearch] = useState("");
    const [shopFilter, setShopFilter] = useState("all");
    const [shopSort, setShopSort] = useState("default");
    const [showToolsPanel, setShowToolsPanel] = useState(false);
    const [expandedBrandSwitcher, setExpandedBrandSwitcher] = useState(null);
    const [listMode, setListMode] = useState("plan");
    const [productInsightOpen, setProductInsightOpen] = useState(false);
    const [productInsightItem, setProductInsightItem] = useState(null);
    const [productInsightData, setProductInsightData] = useState(null);
    const [productInsightLoading, setProductInsightLoading] = useState(false);

    const selectedItems = useMemo(() => selectedList?.items || [], [selectedList]);
    const totalItems = selectedItems.length;
    const purchasedCount = selectedItems.filter((item) => item.purchased).length;
    const pricedCount = selectedItems.filter((item) => item.price !== null && item.price !== undefined).length;
    const readyToSubmitCount = selectedItems.filter((item) => item.purchased && item.price).length;
    const missingPriceCount = selectedItems.filter((item) => item.purchased && !item.price).length;
    const remainingCount = totalItems - purchasedCount;
    const totalActualLive = selectedItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    const totalEstimatedLive = selectedItems.reduce((sum, item) => sum + (Number(item.estimated_price) || 0), 0);
    const progressPct = totalItems ? Math.round((purchasedCount / totalItems) * 100) : 0;
    const tutorialBubbleStyle = getTutorialBubbleStyle(tutorial.activeStep, tutorial.highlightRect);

    const filteredShopItems = useMemo(() => {
        const indexed = selectedItems.map((item, idx) => ({ item, idx }));
        const query = shopSearch.trim().toLowerCase();

        let list = indexed;

        if (query) {
            list = list.filter(({ item }) => {
                const haystack = `${item.product_name || ""} ${item.brand_name || ""}`.toLowerCase();
                return haystack.includes(query);
            });
        }

        if (shopFilter === "pending") {
            list = list.filter(({ item }) => !item.purchased);
        } else if (shopFilter === "purchased") {
            list = list.filter(({ item }) => item.purchased);
        } else if (shopFilter === "no_price") {
            list = list.filter(({ item }) => item.purchased && !item.price);
        }

        if (shopSort === "name") {
            list = [...list].sort((a, b) => (a.item.product_name || "").localeCompare(b.item.product_name || ""));
        } else if (shopSort === "brand") {
            list = [...list].sort((a, b) => (a.item.brand_name || "").localeCompare(b.item.brand_name || ""));
        } else if (shopSort === "status") {
            list = [...list].sort((a, b) => {
                if (a.item.purchased === b.item.purchased) return 0;
                return a.item.purchased ? 1 : -1;
            });
        }

        return list;
    }, [selectedItems, shopSearch, shopFilter, shopSort]);

    const availableProductsForList = useMemo(() => {
        if (!selectedList) return [];
        const availableProductIds = new Set(
            sellableProducts
                .filter((sp) => sp.supermarket_id === selectedList.supermarket_id)
                .map((sp) => sp.product_id)
        );
        const query = productSearch.trim().toLowerCase();

        return products
            .filter((product) => availableProductIds.has(product.id))
            .filter((product) => !query || product.name.toLowerCase().includes(query))
            .sort((a, b) => a.name.localeCompare(b.name, "es"))
            .slice(0, 12);
    }, [productSearch, products, selectedList, sellableProducts]);

    const getAlternativeBrandsForItem = (item) => {
        if (!item?.product_id || !selectedList?.supermarket_id) {
            return [];
        }
        const candidates = sellableProducts.filter((sp) => (
            sp.product_id === item.product_id &&
            sp.supermarket_id === selectedList.supermarket_id &&
            sp.id !== item.sellable_product_id
        ));
        return candidates
            .map((sp) => {
                const brand = brands.find((b) => b.id === sp.brand_id);
                return brand ? { sellable_id: sp.id, brand_id: brand.id, brand_name: brand.name } : null;
            })
            .filter(Boolean);
    };

    // --------------------------------------------------------------
    // State sync helpers
    // --------------------------------------------------------------

    const syncListState = (updatedList) => {
        setSelectedList(updatedList);
        setLists((prev) => upsertList(prev, updatedList));
    };

    const resetNewItemForm = () => {
        setNewItemProduct("");
        setNewItemBrandId("");
        setNewItemAttrValues({});
        setNewItemSellable("");
        setNewItemQuantity("1");
        setNewItemUnit("");
        setEditingItemIndex(null);
        setProductSearch("");
    };

    const saveList = async (itemsToSave, options = {}) => {
        const { listId = selectedList?.id, silent = false, updateSelected = true } = options;
        if (!listId) return null;

        try {
            const response = await axios.put(`${API}/shopping-lists/${listId}`, {
                items: serializeItems(itemsToSave)
            });
            setLists((prev) => upsertList(prev, response.data));
            if (updateSelected && selectedList?.id === response.data.id) {
                setSelectedList(response.data);
            }
            return response.data;
        } catch (error) {
            if (!silent) toast.error("Error al guardar cambios");
            throw error;
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const tasks = [
                axios.get(`${API}/shopping-lists`).then((r) => {
                    setLists(r.data);
                    setSelectedList((current) => {
                        if (!r.data.length) return null;
                        if (!current) return null;
                        return r.data.find((l) => l.id === current.id) || null;
                    });
                }).catch((e) => console.error("Lists fetch error", e)),
                axios.get(`${API}/public/products`).then((r) => setProducts(r.data)).catch((e) => console.error("Products error", e)),
                axios.get(`${API}/admin/attributes`).then((r) => setAttributes(r.data)).catch((e) => console.error("Attrs error", e)),
                axios.get(`${API}/admin/supermarkets`).then((r) => setSupermarkets(r.data)).catch((e) => console.error("SM error", e)),
                axios.get(`${API}/admin/units`).then((r) => {
                    setUnits(r.data);
                    if (r.data.length > 0) setNewItemUnit(r.data[0].id);
                }).catch((e) => console.error("Units error", e)),
                axios.get(`${API}/admin/brands`).then((r) => setBrands(r.data)).catch((e) => console.error("Brands error", e)),
                axios.get(`${API}/admin/brand-catalog`).then((r) => setBrandCatalog(r.data)).catch((e) => console.error("Catalog error", e)),
                axios.get(`${API}/admin/sellable-products`).then((r) => setSellableProducts(r.data)).catch((e) => console.error("Sellable error", e))
            ];
            await Promise.allSettled(tasks);
        } catch (error) {
            console.error("General error", error);
        } finally {
            setLoading(false);
        }
    };

    // --------------------------------------------------------------
    // Effects
    // --------------------------------------------------------------

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        if (!pendingChanges || !selectedList) return undefined;

        const timer = setTimeout(async () => {
            setAutoSaving(true);
            try {
                const response = await axios.put(`${API}/shopping-lists/${selectedList.id}`, {
                    items: serializeItems(selectedList.items)
                });
                syncListState(response.data);
                setPendingChanges(false);
            } catch (error) {
                console.error("Auto-save error", error);
            } finally {
                setAutoSaving(false);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [pendingChanges, selectedList]);

    useEffect(() => {
        if (newItemProduct && selectedList) {
            const brandIds = Array.from(new Set(
                sellableProducts
                    .filter((sp) => sp.product_id === newItemProduct && sp.supermarket_id === selectedList.supermarket_id)
                    .map((sp) => sp.brand_id)
            ));
            setAvailableBrandsForProduct(brands.filter((b) => brandIds.includes(b.id)));
        } else {
            setAvailableBrandsForProduct([]);
        }
    }, [newItemProduct, selectedList, sellableProducts, brands]);

    useEffect(() => {
        setNewItemBrandId("");
        setNewItemAttrValues({});
        setNewItemSellable("");
    }, [newItemProduct]);

    useEffect(() => {
        if (newItemProduct && newItemBrandId && selectedList) {
            const match = sellableProducts.find((sp) => (
                sp.product_id === newItemProduct &&
                sp.brand_id === newItemBrandId &&
                sp.supermarket_id === selectedList.supermarket_id
            ));
            setNewItemSellable(match ? match.id : "");
        }
    }, [newItemBrandId, newItemProduct, selectedList, sellableProducts]);

    useEffect(() => {
        const fetchAvailableUnits = async () => {
            if (!newItemProduct || !newItemSellable || !selectedList) {
                setAvailableUnits([]);
                return;
            }
            const sp = sellableProducts.find((c) => c.id === newItemSellable);
            if (!sp) { setAvailableUnits([]); return; }

            try {
                const response = await axios.get(`${API}/admin/sellable-product-units/${sp.id}`);
                setAvailableUnits(response.data);
                if (response.data.length === 1) setNewItemUnit(response.data[0].unit_id);
            } catch (error) {
                console.error("Units error", error);
            }
        };
        fetchAvailableUnits();
    }, [newItemSellable, newItemProduct, selectedList, sellableProducts]);

    useEffect(() => {
        const items = selectedList?.items || [];
        setShowEstimated(Boolean(items.some((item) => item.estimated_price)));
    }, [selectedList]);

    // --------------------------------------------------------------
    // Handlers
    // --------------------------------------------------------------

    const handleSelectList = async (list) => {
        if (!list || list.id === selectedList?.id) return;

        if (pendingChanges && selectedList) {
            try {
                await saveList(selectedList.items, { listId: selectedList.id, silent: true, updateSelected: false });
                setPendingChanges(false);
            } catch (error) {
                console.error("Save before switch error", error);
            }
        }
        setSelectedList(list);
        setShopSearch("");
        setShopFilter("all");
        setExpandedBrandSwitcher(null);
    };

    const handleSetListMode = (nextMode) => {
        setListMode(nextMode);
        if (nextMode === "shop") {
            setShopSearch("");
            setShopFilter("all");
            setShowToolsPanel(false);
        }
    };

    const handleCreateList = async () => {
        if (!newListName || !newListSupermarket) {
            toast.error("Completa todos los campos");
            return;
        }
        try {
            const response = await axios.post(`${API}/shopping-lists`, {
                name: newListName,
                supermarket_id: newListSupermarket,
                items: []
            });
            setLists((prev) => [response.data, ...prev]);
            setSelectedList(response.data);
            setNewListName("");
            setNewListSupermarket("");
            setDialogOpen(false);
            toast.success("Lista creada");
        } catch (error) {
            toast.error("Error al crear lista");
        }
    };

    const handleAddItem = async () => {
        if (!newItemProduct || !newItemSellable || !newItemUnit || !selectedList) {
            toast.error("Completa todos los campos");
            return;
        }
        const sp = sellableProducts.find((c) => c.id === newItemSellable);
        if (!sp) { toast.error("Producto no disponible"); return; }

        try {
            const cleanedAttrs = Object.fromEntries(
                Object.entries(newItemAttrValues).filter(([, v]) => v !== "" && v !== null && v !== "none")
            );
            const currentItems = serializeItems(selectedList.items);
            const newItem = {
                sellable_product_id: sp.id,
                quantity: parseFloat(newItemQuantity) || 1,
                unit_id: newItemUnit,
                price: editingItemIndex !== null ? currentItems[editingItemIndex]?.price ?? null : null,
                purchased: editingItemIndex !== null ? Boolean(currentItems[editingItemIndex]?.purchased) : false,
                attribute_values: cleanedAttrs
            };
            const updatedItems = editingItemIndex !== null
                ? currentItems.map((item, i) => (i === editingItemIndex ? newItem : item))
                : [...currentItems, newItem];

            const updatedList = await saveList(updatedItems, { listId: selectedList.id, updateSelected: true });
            if (updatedList) {
                setPendingChanges(false);
                resetNewItemForm();
                setAddItemDialogOpen(false);
                toast.success(editingItemIndex !== null ? "Producto actualizado" : "Producto anadido");
            }
        } catch (error) {
            toast.error("Error al guardar producto");
        }
    };

    const updateLocalItem = (index, updates) => {
        if (!selectedList) return [];
        const newItems = [...selectedList.items];
        newItems[index] = { ...newItems[index], ...updates };
        setSelectedList({ ...selectedList, items: newItems });
        setPendingChanges(true);
        return newItems;
    };

    const handleShopPriceChange = (index, rawValue) => {
        let nextPrice = null;
        if (rawValue !== "" && rawValue !== null && rawValue !== undefined) {
            const parsed = parseFloat(String(rawValue).replace(",", "."));
            if (Number.isFinite(parsed) && parsed >= 0) nextPrice = parsed;
        }
        const current = selectedList?.items?.[index];
        const updates = { price: nextPrice };
        if (nextPrice && nextPrice > 0 && current && !current.purchased) {
            updates.purchased = true;
        }
        updateLocalItem(index, updates);
    };

    const handleQuantityStep = (index, delta) => {
        const current = Number(selectedList?.items?.[index]?.quantity) || 1;
        const raw = current + delta;
        const next = Math.max(0.1, Math.round(raw * 100) / 100);
        updateLocalItem(index, { quantity: next });
    };

    const handleShopSwitchBrand = (index, alternative) => {
        if (!alternative || !selectedList?.items?.[index]) return;
        const sp = sellableProducts.find((c) => c.id === alternative.sellable_id);
        if (!sp) { toast.error("Esta alternativa no esta disponible"); return; }
        const brandObj = brands.find((b) => b.id === sp.brand_id);
        updateLocalItem(index, {
            sellable_product_id: sp.id,
            brand_id: sp.brand_id,
            brand_name: brandObj?.name || alternative.brand_name,
            attribute_values: {},
            price: null
        });
        setExpandedBrandSwitcher(null);
        toast.success(`Marca cambiada a ${brandObj?.name || alternative.brand_name}`);
    };

    const handleOpenProductInsight = async (item) => {
        if (!item?.product_id) return;
        setProductInsightItem(item);
        setProductInsightOpen(true);
        setProductInsightLoading(true);
        setProductInsightData(null);
        try {
            const [analyticsResponse, compareResponse] = await Promise.all([
                axios.get(`${API}/analytics/product/${item.product_id}`, {
                    params: { supermarket_id: selectedList?.supermarket_id }
                }),
                axios.get(`${API}/analytics/compare/${item.product_id}`)
            ]);
            setProductInsightData({
                analytics: analyticsResponse.data,
                comparison: compareResponse.data
            });
        } catch (error) {
            toast.error("No se pudo cargar la informacion del producto");
        } finally {
            setProductInsightLoading(false);
        }
    };

    const handleSkipShopItem = (index) => {
        updateLocalItem(index, { purchased: false, price: null });
        toast("Marcado como pendiente");
    };

    const handleDuplicateList = async (listToDuplicate) => {
        try {
            const response = await axios.post(`${API}/shopping-lists`, {
                name: `${listToDuplicate.name} (Copia ${new Date().toLocaleDateString("es-ES")})`,
                supermarket_id: listToDuplicate.supermarket_id,
                items: listToDuplicate.items.map((item) => ({
                    sellable_product_id: item.sellable_product_id,
                    quantity: item.quantity,
                    unit_id: item.unit_id,
                    price: null,
                    purchased: false,
                    attribute_values: item.attribute_values
                }))
            });
            setLists((prev) => [response.data, ...prev]);
            setSelectedList(response.data);
            toast.success("Lista duplicada");
        } catch (error) {
            toast.error("Error al duplicar lista");
        }
    };

    const handleRemoveItem = async (index) => {
        if (!selectedList) return;
        const updatedItems = selectedList.items.filter((_, i) => i !== index);
        try {
            const updatedList = await saveList(updatedItems, { listId: selectedList.id, updateSelected: true });
            if (updatedList) {
                setPendingChanges(false);
                toast.success("Producto eliminado");
            }
        } catch (error) {
            toast.error("Error al eliminar");
        }
    };

    const handleSubmitPrices = async () => {
        if (!selectedList) return;
        setConfirmSubmitOpen(false);
        setFinishSheetOpen(false);
        try {
            if (pendingChanges) {
                await saveList(selectedList.items, { listId: selectedList.id, silent: true, updateSelected: true });
                setPendingChanges(false);
            }
            const response = await axios.post(`${API}/shopping-lists/${selectedList.id}/submit-prices`);
            const cleanedItems = selectedList.items.map((item) => ({ ...item, purchased: false, price: null }));
            await saveList(cleanedItems, { listId: selectedList.id, silent: true, updateSelected: true });
            const creditsEarned = response.data?.credits_earned || 0;
            const pointsEarned = response.data?.points_earned || 0;
            toast.success(`${response.data.message || "Precios subidos"} · +${creditsEarned} creditos · +${pointsEarned} reputacion`);
            toast.success("Lista limpia y lista para la siguiente compra");
        } catch (error) {
            toast.error("Error al subir precios");
        }
    };

    const handleConfirmEstimate = async () => {
        if (!selectedList) return;
        setConfirmEstimateOpen(false);
        try {
            const response = await axios.post(`${API}/shopping-lists/${selectedList.id}/estimate`);
            syncListState(response.data);
            setShowEstimated(true);
            toast.success("Precios estimados calculados");
        } catch (error) {
            if (error.response?.status === 402) {
                toast.error(error.response.data.detail || "Creditos insuficientes");
            } else {
                toast.error("Error al calcular estimaciones");
            }
        }
    };

    const handleResetList = async () => {
        if (!selectedList) return;
        if (!window.confirm("Seguro que quieres limpiar los checks y precios? La lista de productos se mantiene.")) return;

        const resetItems = selectedList.items.map((item) => ({ ...item, purchased: false, price: null }));
        try {
            const updatedList = await saveList(resetItems, { listId: selectedList.id, updateSelected: true });
            if (updatedList) {
                setPendingChanges(false);
                toast.success("Lista limpiada");
            }
        } catch (error) {
            toast.error("Error al limpiar");
        }
    };

    const handleDeleteList = async (listId) => {
        if (!window.confirm("Eliminar esta lista completa?")) return;
        try {
            await axios.delete(`${API}/shopping-lists/${listId}`);
            setLists((prev) => {
                const filtered = prev.filter((l) => l.id !== listId);
                if (selectedList?.id === listId) setSelectedList(null);
                return filtered;
            });
            toast.success("Lista eliminada");
        } catch (error) {
            toast.error("Error al eliminar lista");
        }
    };

    const openEditDialog = (item, index) => {
        setNewItemProduct(item.product_id);
        setProductSearch(item.product_name || "");
        setNewItemBrandId(item.brand_id);
        setNewItemAttrValues(item.attribute_values || {});
        setNewItemQuantity(String(item.quantity));
        setNewItemUnit(item.unit_id);
        setEditingItemIndex(index);
        setAddItemDialogOpen(true);
    };

    // --------------------------------------------------------------
    // Render: Lists Grid View (no list selected)
    // --------------------------------------------------------------

    const renderListsGrid = () => (
        <div className="space-y-4 pb-24" data-testid="lists-grid-view">
            {/* Hero header */}
            <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-emerald-500 via-emerald-500 to-teal-600 p-6 text-white shadow-lg sm:p-8">
                <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
                <div className="absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-white/5" />

                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <p className="text-sm font-medium uppercase tracking-wider text-emerald-100">Mis compras</p>
                        <h1 className="mt-1 text-3xl font-black leading-tight sm:text-4xl" style={{ fontFamily: "Manrope, sans-serif" }}>
                            Lista de compra
                        </h1>
                        <p className="mt-2 max-w-md text-sm text-emerald-50">
                            {lists.length === 0
                                ? "Crea tu primera lista para empezar a recopilar precios reales."
                                : `${lists.length} ${lists.length === 1 ? "lista activa" : "listas activas"}. Elige una para comprar.`}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => startTutorial()}
                            className="gap-2 rounded-2xl border border-white/20 bg-white/10 text-white hover:bg-white/20"
                        >
                            <HelpCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">Tutorial</span>
                        </Button>
                        <Button
                            onClick={() => setDialogOpen(true)}
                            className="gap-2 rounded-2xl bg-white font-semibold text-emerald-700 shadow-md hover:bg-emerald-50"
                            data-testid="new-list-btn"
                            data-tutorial="new-list-btn"
                        >
                            <Plus className="h-4 w-4" />
                            Nueva lista
                        </Button>
                    </div>
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex items-center justify-center gap-2 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-sm text-slate-500">
                    <Loader className="h-4 w-4 animate-spin" />
                    Cargando tus listas...
                </div>
            ) : lists.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50">
                        <ShoppingCart className="h-8 w-8 text-emerald-500" />
                    </div>
                    <p className="mt-5 text-lg font-bold text-slate-950" style={{ fontFamily: "Manrope, sans-serif" }}>Aun no tienes listas</p>
                    <p className="mt-1 text-sm text-slate-500">Crea una lista por supermercado para ir recopilando precios.</p>
                    <Button onClick={() => setDialogOpen(true)} className="mt-6 gap-2 rounded-2xl bg-emerald-500 text-white hover:bg-emerald-600">
                        <Plus className="h-4 w-4" />
                        Crear mi primera lista
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" data-tutorial="lists-grid">
                    {lists.map((list) => {
                        const items = list.items || [];
                        const purchased = items.filter((i) => i.purchased).length;
                        const pct = items.length ? Math.round((purchased / items.length) * 100) : 0;
                        const total = items.reduce((sum, i) => sum + (Number(i.price) || 0), 0);
                        const missing = items.filter((i) => i.purchased && !i.price).length;

                        return (
                            <article
                                key={list.id}
                                className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg"
                                data-testid={`list-card-${list.id}`}
                            >
                                <button type="button" onClick={() => handleSelectList(list)} className="flex flex-1 flex-col p-5 text-left">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <h3 className="truncate text-lg font-bold text-slate-950" style={{ fontFamily: "Manrope, sans-serif" }}>
                                                {list.name}
                                            </h3>
                                            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                                                <Store className="h-3.5 w-3.5" />
                                                <span className="truncate">{list.supermarket_name}</span>
                                            </p>
                                        </div>
                                        <ProgressRing percent={pct} size={44} />
                                    </div>

                                    <div className="mt-5 flex items-center justify-between">
                                        <div className="flex flex-wrap gap-1.5">
                                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                                                <Package className="h-3 w-3" />
                                                {items.length}
                                            </span>
                                            {purchased > 0 && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    {purchased}
                                                </span>
                                            )}
                                            {missing > 0 && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    {missing}
                                                </span>
                                            )}
                                        </div>
                                        {total > 0 && (
                                            <div className="text-right">
                                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total</p>
                                                <p className="text-base font-bold text-slate-950 tabular-nums">{formatCurrencyShort(total)}</p>
                                            </div>
                                        )}
                                    </div>
                                </button>

                                <div className="flex items-center justify-end gap-1 border-t border-slate-100 bg-slate-50/60 px-3 py-2">
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); handleDuplicateList(list); }}
                                        className="flex h-8 items-center gap-1.5 rounded-xl px-2 text-xs font-medium text-slate-500 transition hover:bg-sky-50 hover:text-sky-700"
                                        title="Duplicar"
                                    >
                                        <Copy className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">Duplicar</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); handleDeleteList(list.id); }}
                                        className="flex h-8 items-center gap-1.5 rounded-xl px-2 text-xs font-medium text-slate-500 transition hover:bg-rose-50 hover:text-rose-700"
                                        title="Eliminar"
                                        data-testid={`delete-list-${list.id}`}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">Eliminar</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSelectList(list)}
                                        className="ml-1 flex h-8 items-center gap-1 rounded-xl bg-emerald-500 px-3 text-xs font-bold text-white transition hover:bg-emerald-600"
                                    >
                                        Abrir
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );

    // --------------------------------------------------------------
    // Render: List Detail View (unified experience)
    // --------------------------------------------------------------

    const renderListDetail = () => (
        <div
            className={
                listMode === "shop"
                    ? "space-y-0 pb-24"
                    : "space-y-0 pb-6"
            }
            data-testid="list-detail-view"
        >
            {listMode === "shop" && (
                <div className="sticky top-0 z-40 -mx-4 border-b border-slate-200 bg-white/95 px-4 py-2.5 backdrop-blur sm:-mx-5 sm:px-5">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => handleSetListMode("plan")}
                            className="group flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                            aria-label="Salir del modo compra"
                        >
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                            <span className="text-xs font-bold uppercase tracking-wider">Atrás</span>
                        </button>

                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                                <h2 className="truncate text-sm font-black text-slate-950" style={{ fontFamily: "Manrope, sans-serif" }}>
                                    {selectedList.name}
                                </h2>
                                <div className="text-right">
                                    <span className="text-sm font-black text-slate-950 tabular-nums">{formatCurrencyShort(totalActualLive)}</span>
                                </div>
                            </div>
                            <div className="mt-1.5 flex items-center gap-3">
                                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className="h-full rounded-full bg-emerald-500 transition-all duration-500 ease-out shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                                        style={{ width: `${progressPct}%` }}
                                    />
                                </div>
                                <span className="text-[10px] font-black text-emerald-600 tabular-nums uppercase tracking-tighter">
                                    {purchasedCount}/{totalItems}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Sticky top header */}
            <div className={`sticky top-0 z-40 -mx-4 border-b border-slate-100 bg-white/95 px-4 py-2 backdrop-blur sm:-mx-5 sm:px-5 ${listMode === "shop" ? "hidden" : ""}`}>
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <button
                            type="button"
                            onClick={() => setSelectedList(null)}
                            className="flex h-9 items-center gap-1.5 rounded-xl px-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                            aria-label="Volver a mis listas"
                            data-testid="back-to-lists-btn"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Listas</span>
                        </button>
                        <div className="h-4 w-[1px] bg-slate-200" />
                        <div className="min-w-0">
                            <h2 className="truncate text-sm font-black text-slate-950" style={{ fontFamily: "Manrope, sans-serif" }}>
                                {selectedList.name}
                            </h2>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                <span className="truncate">{selectedList.supermarket_name}</span>
                                <span>•</span>
                                <span className="tabular-nums">{totalItems} productos</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => { setAddItemDialogOpen(true); }}
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                            aria-label="Añadir producto"
                        >
                            <Plus className="h-4.5 w-4.5" strokeWidth={2.5} />
                        </button>

                        <button
                            type="button"
                            onClick={() => handleSetListMode("shop")}
                            disabled={!totalItems}
                            className="group flex h-9 items-center gap-2 rounded-xl bg-emerald-50 px-3 text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-30 disabled:hover:bg-emerald-50"
                            aria-label="Ir al modo compra"
                        >
                            <span className="text-xs font-black uppercase tracking-wider">Comprar</span>
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </button>

                        <button
                            type="button"
                            onClick={() => setMenuOpen(true)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                            aria-label="Menu de la lista"
                        >
                            <MoreVertical className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

                {/* Compact totals row */}
                <div className="hidden">
                    <div className="flex items-center gap-3">
                        <div>
                            <span className="font-semibold text-slate-500">Total real</span>
                            <span className="ml-1.5 text-base font-bold text-slate-950 tabular-nums" data-testid="shop-total">
                                {formatCurrencyShort(totalActualLive)}
                            </span>
                        </div>
                        {totalEstimatedLive > 0 && (
                            <div className="border-l border-slate-200 pl-3 text-slate-500">
                                <span className="font-semibold">Estimado</span>
                                <span className="ml-1.5 tabular-nums">{formatCurrencyShort(totalEstimatedLive)}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                        {remainingCount > 0 && (
                            <span className="rounded-full bg-white px-2 py-0.5 font-semibold text-slate-700 shadow-sm tabular-nums">
                                {remainingCount} pendientes
                            </span>
                        )}
                        {missingPriceCount > 0 && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800 tabular-nums">
                                {missingPriceCount} sin precio
                            </span>
                        )}
                    </div>
                </div>

            {/* Search & filter bar */}
            {totalItems > 0 && (
                <div className={`sticky z-20 -mx-4 bg-white/90 px-4 backdrop-blur sm:-mx-5 sm:px-5 ${
                    listMode === "shop" ? "top-[50px] py-2" : "top-[53px] py-2"
                }`}>
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                value={shopSearch}
                                onChange={(event) => setShopSearch(event.target.value)}
                                placeholder="Buscar producto o marca..."
                                className={`${listMode === "shop" ? "h-8 rounded-xl text-sm" : "h-10 rounded-2xl"} border-slate-200 bg-white pl-9 pr-9`}
                                inputMode="search"
                                data-testid="shop-search-input"
                            />
                            {shopSearch && (
                                <button
                                    type="button"
                                    onClick={() => setShopSearch("")}
                                    className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                    aria-label="Borrar busqueda"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            className={`${listMode === "shop" ? "h-8 rounded-xl" : "h-10 rounded-2xl"} shrink-0 gap-2 border-slate-200 px-3 ${showToolsPanel ? "bg-slate-100" : "bg-white"}`}
                            onClick={() => setShowToolsPanel((p) => !p)}
                            title="Ajustes de orden"
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Filter chips */}
                    <div className={`${listMode === "shop" ? "mt-1.5" : "mt-2.5"} -mx-1 flex items-center gap-1.5 overflow-x-auto pb-1`}>
                        {SHOP_FILTER_OPTIONS.map((option) => {
                            const active = shopFilter === option.value;
                            const count = option.value === "pending"
                                ? remainingCount
                                : option.value === "purchased"
                                    ? purchasedCount
                                    : option.value === "no_price"
                                        ? missingPriceCount
                                        : totalItems;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setShopFilter(option.value)}
                                    className={`flex shrink-0 items-center gap-1.5 rounded-full border text-xs font-semibold transition ${
                                        listMode === "shop" ? "px-2.5 py-1" : "px-3 py-1.5"
                                    } ${
                                        active
                                            ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                                            : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
                                    }`}
                                    data-testid={`filter-${option.value}`}
                                >
                                    {option.label}
                                    <span className={`tabular-nums text-[10px] ${active ? "text-emerald-50" : "text-slate-400"}`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {showToolsPanel && (
                        <div className="mt-2.5 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                            <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Ordenar por</Label>
                            <Select value={shopSort} onValueChange={setShopSort}>
                                <SelectTrigger className="mt-1.5 h-9 bg-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {SHOP_SORT_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
            )}

            {/* Items */}
            <div className="mt-4 space-y-2.5" data-tutorial="shop-list">
                {totalItems === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-sm">
                            <Package className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="mt-5 text-lg font-bold text-slate-950" style={{ fontFamily: "Manrope, sans-serif" }}>
                            Lista vacia
                        </p>
                        <p className="mt-1 text-sm text-slate-500">Anade productos que vas a comprar en {selectedList.supermarket_name}</p>
                        <Button
                            onClick={() => setAddItemDialogOpen(true)}
                            className="mt-5 gap-2 rounded-2xl bg-emerald-500 text-white hover:bg-emerald-600"
                        >
                            <Plus className="h-4 w-4" />
                            Anadir primer producto
                        </Button>
                    </div>
                ) : filteredShopItems.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                        <Info className="mx-auto h-10 w-10 text-slate-300" />
                        <p className="mt-3 text-sm font-semibold text-slate-700">Nada coincide con estos filtros</p>
                        <Button
                            variant="outline"
                            onClick={() => { setShopSearch(""); setShopFilter("all"); }}
                            className="mt-4 gap-2 rounded-2xl border-slate-200"
                        >
                            <X className="h-3.5 w-3.5" />
                            Limpiar filtros
                        </Button>
                    </div>
                ) : (
                    filteredShopItems.map(({ item, idx }, visualIndex) => {
                        const priceInsight = getPriceInsight(item);
                        const alternatives = getAlternativeBrandsForItem(item);
                        const unitPriceStr = formatUnitPrice(item.price, item.quantity, item.unit_name);
                        const estimatedUnitStr = formatUnitPrice(item.estimated_price, item.quantity, item.unit_name);
                        const brandSwitcherOpen = expandedBrandSwitcher === idx;

                        // Visual state
                        const isPurchased = item.purchased;
                        const hasPrice = Boolean(item.price);
                        const stateColor = !isPurchased
                            ? "bg-white border-slate-200"
                            : hasPrice
                                ? "bg-emerald-50/60 border-emerald-200"
                                : "bg-amber-50/60 border-amber-200";

                        if (listMode === "plan") {
                            return (
                                <article
                                    key={`${item.sellable_product_id}-${idx}`}
                                    className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
                                    data-testid={`item-card-${idx}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                            <Package className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="truncate text-base font-bold text-slate-950" style={{ fontFamily: "Manrope, sans-serif" }}>
                                                {item.product_name}
                                            </h3>
                                            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                                                    {item.brand_name || "Sin marca"}
                                                </span>
                                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                                                    {item.quantity} {item.unit_name}
                                                </span>
                                                {item.attribute_values && Object.values(item.attribute_values).filter(Boolean).map((value) => (
                                                    <span key={value} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                                                        {value}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => openEditDialog(item, idx)}
                                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-slate-500 transition hover:bg-slate-100"
                                            aria-label="Editar producto"
                                        >
                                            <Edit3 className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(idx)}
                                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-rose-500 transition hover:bg-rose-50"
                                            aria-label="Quitar producto"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </article>
                            );
                        }

                        return (
                            <article
                                key={`${item.sellable_product_id}-${idx}`}
                                className={`rounded-xl border px-2.5 py-2 shadow-sm transition-all ${stateColor}`}
                                data-testid={`item-card-${idx}`}
                            >
                                {/* Top: product, status and price */}
                                <div className="grid grid-cols-[2.25rem_minmax(0,1fr)_7.25rem] items-start gap-2 sm:grid-cols-[2.5rem_minmax(0,1fr)_8rem]">
                                    <button
                                        type="button"
                                        onClick={() => updateLocalItem(idx, { purchased: !isPurchased })}
                                        className={`group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border-2 transition-all duration-300 sm:h-11 sm:w-11 ${
                                            isPurchased
                                                ? hasPrice
                                                    ? "border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                                    : "border-amber-500 bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                                                : "border-slate-200 bg-slate-50 text-transparent hover:border-emerald-400 hover:bg-white"
                                        }`}
                                        data-testid={`item-checkbox-${idx}`}
                                        aria-label={isPurchased ? "Desmarcar" : "Marcar comprado"}
                                    >
                                        {isPurchased ? (
                                            <CheckCircle2 className="h-6 w-6 animate-in zoom-in-75 duration-300" strokeWidth={3} />
                                        ) : (
                                            <div className="h-2 w-2 rounded-full bg-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
                                        )}
                                    </button>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className={`text-sm font-bold leading-tight sm:text-base ${
                                                isPurchased ? "text-slate-500 line-through" : "text-slate-950"
                                            }`} style={{ fontFamily: "Manrope, sans-serif" }}>
                                                {item.product_name}
                                            </h3>

                                            <div className="flex h-7 shrink-0 items-center rounded-lg border border-slate-200 bg-white/50 px-1">
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); handleQuantityStep(idx, -1); }}
                                                    className="flex h-5 w-5 items-center justify-center rounded text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                                                    disabled={Number(item.quantity) <= 0.1}
                                                    aria-label="Reducir cantidad"
                                                >
                                                    <Minus className="h-2.5 w-2.5" />
                                                </button>
                                                <span className="w-10 text-center text-[10px] font-bold tabular-nums text-slate-700">
                                                    {item.quantity} {item.unit_name}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); handleQuantityStep(idx, 1); }}
                                                    className="flex h-5 w-5 items-center justify-center rounded text-slate-500 hover:bg-slate-100"
                                                    aria-label="Aumentar cantidad"
                                                >
                                                    <Plus className="h-2.5 w-2.5" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => alternatives.length > 0 && setExpandedBrandSwitcher(brandSwitcherOpen ? null : idx)}
                                                className={`inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold transition ${
                                                    alternatives.length > 0
                                                        ? "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
                                                        : "border-slate-200 bg-slate-50 text-slate-500 cursor-default"
                                                }`}
                                                data-tutorial={visualIndex === 0 ? "brand-switcher" : undefined}
                                                disabled={alternatives.length === 0}
                                            >
                                                <Tag className="h-2.5 w-2.5" />
                                                <span className="truncate">{item.brand_name || "Sin marca"}</span>
                                                {alternatives.length > 0 && (
                                                    <span className="text-[9px] text-slate-400">· cambiar</span>
                                                )}
                                            </button>
                                            {item.attribute_values && Object.entries(item.attribute_values).map(([attrId, value]) => (
                                                <span
                                                    key={attrId}
                                                    className="rounded-full border border-slate-200 bg-white/80 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                                                >
                                                    {value}
                                                </span>
                                            ))}
                                            {item.estimated_price && !hasPrice && estimatedUnitStr && (
                                                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                                                    ~{estimatedUnitStr}
                                                </span>
                                            )}
                                        </div>

                                        {/* Brand alternatives - inline expandable */}
                                        {brandSwitcherOpen && alternatives.length > 0 && (
                                            <div className="mt-2 rounded-xl border border-emerald-100 bg-white p-2">
                                                <div className="flex items-center justify-between px-1">
                                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">Cambiar marca</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => setExpandedBrandSwitcher(null)}
                                                        className="flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                                <div className="mt-1.5 flex flex-wrap gap-1">
                                                    {alternatives.map((alt) => (
                                                        <button
                                                            key={alt.sellable_id}
                                                            type="button"
                                                            onClick={() => handleShopSwitchBrand(idx, alt)}
                                                            className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                                                        >
                                                            {alt.brand_name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0">
                                        <div className={`group/price flex h-10 items-center rounded-xl border px-2.5 transition-all duration-200 ${
                                            hasPrice
                                                ? "border-emerald-300 bg-emerald-50/30"
                                                : "border-slate-200 bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10"
                                        }`}>
                                            <Input
                                                type="number"
                                                inputMode="decimal"
                                                min="0"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={item.price ?? ""}
                                                onChange={(event) => handleShopPriceChange(idx, event.target.value)}
                                                className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-right text-base font-black tabular-nums shadow-none focus-visible:ring-0 placeholder:text-slate-300"
                                                data-testid={`item-price-${idx}`}
                                            />
                                            <span className={`ml-1 text-[10px] font-black transition-colors ${hasPrice ? "text-emerald-500" : "text-slate-300"}`}>EUR</span>
                                        </div>
                                        <div className="mt-1 min-h-[14px] text-right">
                                            {unitPriceStr ? (
                                                <span className="text-[10px] font-bold text-slate-500 tabular-nums bg-slate-100 px-1.5 py-0.5 rounded-md">
                                                    {unitPriceStr}
                                                </span>
                                            ) : (item.estimated_price && !hasPrice ? (
                                                <span className="text-[10px] font-bold text-indigo-500/80 tabular-nums">
                                                    ~{formatCurrencyShort(item.estimated_price)}
                                                </span>
                                            ) : null)}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer: insight + actions */}
                                <div className="mt-1.5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-t border-white/40 pt-1.5">
                                    {priceInsight && !priceInsight.neutral ? (
                                        <div className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-[11px] font-bold ${
                                            priceInsight.isHigher
                                                ? "bg-amber-100 text-amber-900"
                                                : "bg-emerald-100 text-emerald-900"
                                        }`}>
                                            {priceInsight.isHigher ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                            <span>{priceInsight.label}</span>
                                        </div>
                                    ) : priceInsight?.neutral ? (
                                        <span className="text-[11px] font-semibold text-slate-500">Igual al estimado</span>
                                    ) : item.purchased && !item.price ? (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                                            <AlertTriangle className="h-3 w-3" />
                                            Falta el precio
                                        </span>
                                    ) : (
                                        <span className="text-[11px] text-transparent">.</span>
                                    )}

                                    <div className="flex items-center justify-end gap-0.5">
                                        <button
                                            type="button"
                                            onClick={() => handleOpenProductInsight(item)}
                                            className="flex h-7 w-7 items-center justify-center rounded-lg text-sky-600 transition hover:bg-sky-50 hover:text-sky-700"
                                            title="Ver precio historico y comparativa"
                                            aria-label="Ver precio historico y comparativa"
                                        >
                                            <Info className="h-3 w-3" />
                                        </button>
                                        {isPurchased && (
                                            <button
                                                type="button"
                                                onClick={() => handleSkipShopItem(idx)}
                                                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                                                title="Marcar pendiente"
                                                aria-label="Marcar pendiente"
                                            >
                                                <Ban className="h-3 w-3" />
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => openEditDialog(item, idx)}
                                            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                                            title="Editar producto"
                                            aria-label="Editar producto"
                                        >
                                            <Edit3 className="h-3 w-3" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(idx)}
                                            className="flex h-7 w-7 items-center justify-center rounded-lg text-rose-500 transition hover:bg-rose-50 hover:text-rose-700"
                                            title="Quitar de la lista"
                                            aria-label="Quitar de la lista"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            </article>
                        );
                    })
                )}
            </div>

            {listMode === "shop" && <div className="pb-24" />}

            {listMode === "shop" && (
            <div className="fixed bottom-0 left-0 right-0 z-[60] border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur">
                <div className="mx-auto flex max-w-3xl items-center gap-3">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                            <span className="text-lg font-black text-slate-950 tabular-nums">
                                {formatCurrencyShort(totalActualLive)}
                            </span>
                            <span className="text-xs font-semibold text-slate-500">
                                {listMode === "shop" ? `${readyToSubmitCount} listos` : `${totalItems} productos`}
                            </span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                                className="h-full rounded-full bg-emerald-500 transition-all"
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            if (listMode === "shop") {
                                setFinishSheetOpen(true);
                            } else {
                                setAddItemDialogOpen(true);
                            }
                        }}
                        disabled={listMode === "shop" && !readyToSubmitCount}
                        className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800 active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400"
                    >
                        {listMode === "shop" ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                            <Plus className="h-4 w-4" />
                        )}
                        <span>{listMode === "shop" ? "Cerrar" : "Anadir"}</span>
                    </button>
                </div>
            </div>
            )}
        </div>
    );

    // --------------------------------------------------------------
    // Render
    // --------------------------------------------------------------

    return (
        <>
            <Layout>
                <div className="space-y-4" data-testid="shopping-list-page">
                    {selectedList ? renderListDetail() : renderListsGrid()}
                </div>
            </Layout>

            {/* New List Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle style={{ fontFamily: "Manrope, sans-serif" }}>Crear nueva lista</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label>Nombre de la lista</Label>
                            <Input
                                placeholder="Ej: Compra semanal"
                                value={newListName}
                                onChange={(event) => setNewListName(event.target.value)}
                                data-testid="new-list-name-input"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Supermercado</Label>
                            <Select value={newListSupermarket} onValueChange={setNewListSupermarket}>
                                <SelectTrigger data-testid="new-list-supermarket-select">
                                    <SelectValue placeholder="Selecciona supermercado" />
                                </SelectTrigger>
                                <SelectContent>
                                    {supermarkets.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            onClick={handleCreateList}
                            className="w-full rounded-2xl bg-emerald-500 py-5 font-semibold text-white hover:bg-emerald-600"
                            data-testid="create-list-btn"
                        >
                            Crear lista
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add / Edit Item Dialog */}
            <Dialog
                open={addItemDialogOpen}
                onOpenChange={(isOpen) => {
                    setAddItemDialogOpen(isOpen);
                    if (!isOpen) resetNewItemForm();
                }}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle style={{ fontFamily: "Manrope, sans-serif" }}>
                            {editingItemIndex !== null ? "Editar producto" : "Anadir producto"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">1. Producto *</Label>
                            <div className="rounded-2xl border border-slate-200 bg-white p-2">
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        value={productSearch}
                                        onChange={(event) => setProductSearch(event.target.value)}
                                        placeholder="Busca producto: leche, pan, arroz..."
                                        className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-9"
                                        inputMode="search"
                                        data-testid="add-item-product-search"
                                    />
                                </div>

                                {newItemProduct && (
                                    <div className="mt-2 flex items-center justify-between gap-2 rounded-xl bg-emerald-50 px-3 py-2">
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Seleccionado</p>
                                            <p className="truncate text-sm font-bold text-emerald-900">
                                                {products.find((p) => p.id === newItemProduct)?.name || "Producto"}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setNewItemProduct("");
                                                setProductSearch("");
                                            }}
                                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-emerald-700 hover:bg-emerald-100"
                                            aria-label="Cambiar producto"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}

                                {!newItemProduct && (
                                    <div className="mt-2 max-h-64 space-y-1 overflow-y-auto pr-1" data-testid="add-item-product-results">
                                        {availableProductsForList.length === 0 ? (
                                            <div className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
                                                No hay productos que coincidan.
                                            </div>
                                        ) : (
                                            availableProductsForList.map((product) => (
                                                <button
                                                    key={product.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setNewItemProduct(product.id);
                                                        setProductSearch(product.name);
                                                    }}
                                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-emerald-50 active:bg-emerald-100"
                                                >
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                                                        <Package className="h-4 w-4" />
                                                    </div>
                                                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">{product.name}</span>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                            <p className="text-[11px] text-slate-400">Mostramos hasta 12 resultados. Escribe para acotar y evitar scroll largo.</p>
                        </div>

                        {newItemProduct && (
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">2. Marca *</Label>
                                <Select
                                    value={newItemBrandId || "none"}
                                    onValueChange={(value) => {
                                        setNewItemBrandId(value === "none" ? "" : value);
                                        setNewItemAttrValues({});
                                        setNewItemSellable("");
                                    }}
                                >
                                    <SelectTrigger data-testid="add-item-brand-select" className="h-11">
                                        <SelectValue placeholder="Selecciona marca" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Seleccionar marca...</SelectItem>
                                        {availableBrandsForProduct.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {newItemBrandId && (() => {
                            const product = products.find((c) => c.id === newItemProduct);
                            if (!product || !product.allowed_attribute_ids?.length) return null;
                            const catalogEntry = brandCatalog.find((e) => e.brand_id === newItemBrandId && e.product_id === newItemProduct);

                            const attrBlocks = product.allowed_attribute_ids.map((attrId) => {
                                const attribute = attributes.find((c) => c.id === attrId);
                                if (!attribute) return null;
                                const catalogValues = catalogEntry?.allowed_attributes?.[attrId];
                                const values = catalogValues?.length ? catalogValues : (attribute.values || []);
                                if (!values.length) return null;
                                return (
                                    <div key={attrId} className="space-y-1">
                                        <Label className="text-[11px] font-medium text-slate-600">{attribute.name}</Label>
                                        <Select
                                            value={newItemAttrValues[attrId] || "none"}
                                            onValueChange={(v) => setNewItemAttrValues({ ...newItemAttrValues, [attrId]: v === "none" ? "" : v })}
                                        >
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder={`Seleccionar ${attribute.name}`} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Cualquier {attribute.name}</SelectItem>
                                                {values.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                );
                            }).filter(Boolean);

                            if (!attrBlocks.length) return null;

                            return (
                                <div className="space-y-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-3">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">3. Variante / atributos</Label>
                                    {attrBlocks}
                                </div>
                            );
                        })()}

                        {newItemSellable && (
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Unidad *</Label>
                                    <Select value={newItemUnit} onValueChange={setNewItemUnit}>
                                        <SelectTrigger data-testid="add-item-unit-select" className="h-11">
                                            <SelectValue placeholder="Unidad" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableUnits.map((u) => <SelectItem key={u.unit_id} value={u.unit_id}>{u.unit_name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Cantidad</Label>
                                    <Input
                                        type="number"
                                        inputMode="decimal"
                                        min="0.1"
                                        step="0.1"
                                        value={newItemQuantity}
                                        onChange={(event) => setNewItemQuantity(event.target.value)}
                                        className="h-11"
                                    />
                                </div>
                            </div>
                        )}

                        <Button
                            onClick={handleAddItem}
                            disabled={!newItemUnit}
                            className="w-full rounded-2xl bg-emerald-500 py-5 font-semibold text-white hover:bg-emerald-600"
                        >
                            {editingItemIndex !== null ? "Guardar cambios" : "Anadir a la lista"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Estimate Confirm Dialog */}
            <Dialog open={confirmEstimateOpen} onOpenChange={setConfirmEstimateOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-indigo-700" style={{ fontFamily: "Manrope, sans-serif" }}>
                            <Sparkles className="h-5 w-5" />
                            Calcular precios estimados
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <div className="flex gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
                            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-indigo-400" />
                            <div className="space-y-2 text-sm text-indigo-900">
                                <p className="font-semibold">Estimaremos los precios de {selectedList?.name}</p>
                                <p>Cada producto consume 1 credito y te servira como referencia al comprar.</p>
                                <p className="font-medium">Productos: {selectedList?.items?.length || 0}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="flex-1 rounded-2xl" onClick={() => setConfirmEstimateOpen(false)}>Cancelar</Button>
                            <Button className="flex-1 gap-2 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700" onClick={handleConfirmEstimate}>
                                <Sparkles className="h-4 w-4" />
                                Calcular
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Finish Sheet: Review & Submit */}
            <Dialog open={finishSheetOpen} onOpenChange={setFinishSheetOpen}>
                <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2" style={{ fontFamily: "Manrope, sans-serif" }}>
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            Cerrar compra
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        {/* Summary */}
                        <div className="grid grid-cols-3 gap-2">
                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-center">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">Listos</p>
                                <p className="mt-1 text-2xl font-bold text-emerald-700 tabular-nums">{readyToSubmitCount}</p>
                            </div>
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-center">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">Sin precio</p>
                                <p className="mt-1 text-2xl font-bold text-amber-700 tabular-nums">{missingPriceCount}</p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Total</p>
                                <p className="mt-1 text-2xl font-bold text-slate-950 tabular-nums">{formatCurrencyShort(totalActualLive)}</p>
                            </div>
                        </div>

                        {missingPriceCount > 0 && (
                            <div className="flex gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3">
                                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-amber-900">
                                        {missingPriceCount} producto{missingPriceCount > 1 ? "s" : ""} sin precio
                                    </p>
                                    <p className="text-xs text-amber-800">Solo subiremos los que tengan precio. Cierra este dialogo y anadelos en la lista.</p>
                                </div>
                            </div>
                        )}

                        {readyToSubmitCount > 0 && (
                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
                                <p className="text-sm font-bold text-emerald-900">Recompensa al subir esta compra</p>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <div className="rounded-xl bg-white/80 p-2">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Creditos</p>
                                        <p className="text-lg font-black text-emerald-700 tabular-nums">+{readyToSubmitCount * 10}</p>
                                        <p className="text-[10px] text-emerald-700/80">Para consultar precios estimados.</p>
                                    </div>
                                    <div className="rounded-xl bg-white/80 p-2">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Reputacion</p>
                                        <p className="text-lg font-black text-emerald-700 tabular-nums">+{readyToSubmitCount * 10}</p>
                                        <p className="text-[10px] text-emerald-700/80">Sube tu nivel y visibilidad.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Data preview */}
                        {selectedItems.filter((i) => i.purchased && i.price).length > 0 && (
                            <div>
                                <div className="mb-2 flex items-center justify-between px-1">
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Se subiran {readyToSubmitCount} precios</p>
                                </div>
                                <div className="max-h-[40vh] space-y-1.5 overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50 p-2">
                                    {selectedItems.filter((i) => i.purchased && i.price).map((item, i) => {
                                        const upStr = formatUnitPrice(item.price, item.quantity, item.unit_name);
                                        return (
                                            <div key={`${item.sellable_product_id}-${i}`} className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-white p-2.5">
                                                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-bold text-slate-950">{item.product_name}</p>
                                                    <p className="truncate text-[11px] text-slate-500">
                                                        {item.brand_name || "Sin marca"} · {item.quantity} {item.unit_name}
                                                        {item.attribute_values && Object.values(item.attribute_values).filter(Boolean).map((v, vi) => ` · ${v}`).join("")}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-base font-bold text-emerald-700 tabular-nums">{formatCurrencyShort(item.price)}</p>
                                                    {upStr && <p className="text-[10px] font-medium text-slate-500 tabular-nums">{upStr}</p>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Button variant="outline" onClick={() => setFinishSheetOpen(false)} className="rounded-2xl">
                                Seguir comprando
                            </Button>
                            <Button
                                onClick={() => setConfirmSubmitOpen(true)}
                                disabled={!readyToSubmitCount}
                                className="flex-1 gap-2 rounded-2xl bg-emerald-600 py-5 font-bold text-white hover:bg-emerald-700"
                                data-testid="submit-prices-btn"
                            >
                                <CheckCircle2 className="h-5 w-5" />
                                Subir {readyToSubmitCount} precios
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Confirm submit dialog */}
            <Dialog open={confirmSubmitOpen} onOpenChange={setConfirmSubmitOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-emerald-700" style={{ fontFamily: "Manrope, sans-serif" }}>
                            <CheckCircle2 className="h-5 w-5" />
                            Confirmar subida
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                            <p className="font-semibold">Vamos a subir {readyToSubmitCount} precios a la base de datos.</p>
                            <p className="mt-1 text-xs">Se registran: producto, marca, cantidad, unidad y precio. Ayuda a toda la comunidad. Despues limpiaremos la compra para reutilizar la lista.</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setConfirmSubmitOpen(false)} className="flex-1 rounded-2xl">Cancelar</Button>
                            <Button onClick={handleSubmitPrices} className="flex-1 gap-2 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700">
                                <CheckCircle2 className="h-4 w-4" />
                                Si, subir
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Product insight dialog */}
            <Dialog open={productInsightOpen} onOpenChange={setProductInsightOpen}>
                <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2" style={{ fontFamily: "Manrope, sans-serif" }}>
                            <Info className="h-5 w-5 text-sky-600" />
                            {productInsightItem?.product_name || "Producto"}
                        </DialogTitle>
                    </DialogHeader>

                    {productInsightLoading ? (
                        <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
                            <Loader className="h-4 w-4 animate-spin" />
                            Cargando informacion...
                        </div>
                    ) : (
                        <div className="space-y-4 pt-2">
                            <div className="grid grid-cols-3 gap-2">
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Actual</p>
                                    <p className="mt-1 text-lg font-black text-slate-950 tabular-nums">
                                        {formatCurrencyOptional(productInsightData?.analytics?.current_price)}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Media</p>
                                    <p className="mt-1 text-lg font-black text-slate-950 tabular-nums">
                                        {formatCurrencyOptional(productInsightData?.analytics?.avg_price)}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Minimo</p>
                                    <p className="mt-1 text-lg font-black text-emerald-700 tabular-nums">
                                        {formatCurrencyOptional(productInsightData?.analytics?.min_price)}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-3">
                                <div className="mb-2 flex items-center justify-between">
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Comparativa</p>
                                    {productInsightData?.comparison?.best_price && (
                                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                                            Mejor: {formatCurrencyOptional(productInsightData.comparison.best_price.price)}
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    {(productInsightData?.comparison?.comparison || []).slice(0, 5).map((entry, entryIndex) => (
                                        <div key={`${entry.supermarket_id}-${entry.brand_id}-${entryIndex}`} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-bold text-slate-900">{entry.supermarket_name || "Supermercado"}</p>
                                                <p className="truncate text-[11px] text-slate-500">{entry.brand_name || "Sin marca"}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-slate-950 tabular-nums">{formatCurrencyOptional(entry.price)}</p>
                                                <p className="text-[10px] text-slate-500 tabular-nums">{formatCurrencyOptional(entry.unit_price)}/{productInsightData?.comparison?.unit_name || "ud"}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {!productInsightData?.comparison?.comparison?.length && (
                                        <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">Todavia no hay comparativa suficiente.</p>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-3">
                                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Ultimos registros</p>
                                <div className="space-y-1.5">
                                    {(productInsightData?.analytics?.price_history || []).slice(-5).reverse().map((point, pointIndex) => (
                                        <div key={`${point.date}-${pointIndex}`} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                                            <span className="truncate text-slate-500">{point.date ? new Date(point.date).toLocaleDateString("es-ES") : "Fecha desconocida"}</span>
                                            <span className="font-bold text-slate-950 tabular-nums">{formatCurrencyOptional(point.price)}</span>
                                        </div>
                                    ))}
                                    {!productInsightData?.analytics?.price_history?.length && (
                                        <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">No hay historico para este supermercado.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Menu Sheet (mobile-friendly actions menu) */}
            <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle style={{ fontFamily: "Manrope, sans-serif" }}>Opciones de la lista</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-1.5 pt-2">
                        <button
                            type="button"
                            onClick={() => { setMenuOpen(false); setConfirmEstimateOpen(true); }}
                            disabled={!totalItems}
                            className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-left text-sm transition hover:border-indigo-200 hover:bg-indigo-50 disabled:opacity-50"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-slate-950">{showEstimated ? "Recalcular estimaciones" : "Calcular precios estimados"}</p>
                                <p className="text-xs text-slate-500">Usa creditos para estimar precios basados en historial</p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => { setMenuOpen(false); handleDuplicateList(selectedList); }}
                            className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-left text-sm transition hover:border-sky-200 hover:bg-sky-50"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                                <Copy className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-slate-950">Duplicar lista</p>
                                <p className="text-xs text-slate-500">Crea una copia para la siguiente compra</p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => { setMenuOpen(false); handleResetList(); }}
                            disabled={!purchasedCount && !pricedCount}
                            className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-left text-sm transition hover:border-amber-200 hover:bg-amber-50 disabled:opacity-50"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                                <RefreshCcw className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-slate-950">Limpiar compra actual</p>
                                <p className="text-xs text-slate-500">Borra checks y precios reales (productos se mantienen)</p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => { setMenuOpen(false); startTutorial(); }}
                            className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-left text-sm transition hover:border-emerald-200 hover:bg-emerald-50"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                <HelpCircle className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-slate-950">Ver tutorial</p>
                                <p className="text-xs text-slate-500">Te recordamos como funciona</p>
                            </div>
                        </button>

                        <div className="!mt-3 border-t border-slate-100 pt-2">
                            <button
                                type="button"
                                onClick={() => { setMenuOpen(false); handleDeleteList(selectedList.id); }}
                                className="flex w-full items-center gap-3 rounded-2xl border border-rose-100 bg-white p-3 text-left text-sm transition hover:bg-rose-50"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                                    <Trash2 className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-rose-700">Eliminar lista completa</p>
                                    <p className="text-xs text-rose-500/80">Se perdera la lista y sus productos</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Tutorial overlay */}
            {tutorial.isOpen && tutorial.activeStep && (
                <div className="fixed inset-0 z-[120]">
                    <button
                        type="button"
                        aria-label="Cerrar tutorial"
                        className="absolute inset-0 bg-slate-950/75"
                        onClick={() => closeTutorial(true)}
                    />

                    {tutorial.highlightRect && tutorial.activeStep.element && (
                        <div
                            className="pointer-events-none absolute rounded-[28px] border border-emerald-300/80 bg-transparent shadow-[0_0_0_9999px_rgba(15,23,42,0.72)] transition-all duration-300"
                            style={{
                                top: tutorial.highlightRect.top - 8,
                                left: tutorial.highlightRect.left - 8,
                                width: tutorial.highlightRect.width + 16,
                                height: tutorial.highlightRect.height + 16
                            }}
                        />
                    )}

                    <div
                        className="absolute z-[121] rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_30px_80px_rgba(15,23,42,0.25)]"
                        style={tutorialBubbleStyle}
                    >
                        <div className="mb-4 flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-500">Tutorial rapido</p>
                                <h3 className="mt-2 text-lg font-semibold text-slate-950" style={{ fontFamily: "Manrope, sans-serif" }}>
                                    {tutorial.activeStep.title || "Guia rapida"}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => closeTutorial(true)}
                                className="rounded-full px-2 py-1 text-sm font-medium text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                Cerrar
                            </button>
                        </div>

                        <p className="text-sm leading-7 text-slate-600">{tutorial.activeStep.intro}</p>

                        <div className="mt-5">
                            <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                                <span>Paso {tutorial.currentStep + 1}</span>
                                <span>{tutorial.steps.length} en total</span>
                            </div>
                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className="h-full rounded-full bg-emerald-500 transition-all"
                                    style={{ width: `${((tutorial.currentStep + 1) / tutorial.steps.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="mt-5 flex items-center justify-between gap-3">
                            <Button
                                variant="outline"
                                onClick={prevStep}
                                disabled={tutorial.currentStep === 0}
                                className="rounded-2xl border-slate-200"
                            >
                                Atras
                            </Button>
                            <Button
                                onClick={nextStep}
                                className="rounded-2xl bg-emerald-500 text-white hover:bg-emerald-600"
                            >
                                {tutorial.currentStep === tutorial.steps.length - 1 ? "Empezar" : "Siguiente"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ShoppingListPage;
