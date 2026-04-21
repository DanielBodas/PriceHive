import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Checkbox } from "../components/ui/checkbox";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
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
    Info
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

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
        return "-";
    }
    return `${Number(value).toFixed(2)}€`;
};

const formatUnitPrice = (price, quantity, unitName) => {
    const priceNum = Number(price);
    const qtyNum = Number(quantity);
    if (!priceNum || !qtyNum || qtyNum <= 0) {
        return null;
    }
    const unitPrice = priceNum / qtyNum;
    return `${unitPrice.toFixed(2)}€/${unitName || "ud"}`;
};

const SHOP_FILTER_OPTIONS = [
    { value: "pending", label: "Pendientes" },
    { value: "all", label: "Todos" },
    { value: "purchased", label: "Comprados" },
    { value: "no_price", label: "Falta precio" }
];

const SHOP_SORT_OPTIONS = [
    { value: "default", label: "Orden original" },
    { value: "name", label: "Nombre A-Z" },
    { value: "status", label: "Por comprar primero" },
    { value: "brand", label: "Por marca" }
];

const getPriceInsight = (item) => {
    if (!item?.estimated_price || !item?.price) {
        return null;
    }

    const difference = Number(item.price) - Number(item.estimated_price);
    const percentage = Number(item.estimated_price) ? (difference / Number(item.estimated_price)) * 100 : 0;
    const isHigher = difference > 0;

    return {
        difference,
        percentage,
        isHigher,
        label: isHigher
            ? `${percentage.toFixed(1)}% por encima del estimado`
            : `${Math.abs(percentage).toFixed(1)}% por debajo del estimado`
    };
};

const getTutorialBubbleStyle = (step, rect) => {
    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1280;
    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 720;
    const width = Math.min(360, Math.max(280, viewportWidth - 32));
    const margin = 16;

    if (!step?.element || !rect) {
        return {
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: `${width}px`
        };
    }

    const centerX = rect.left + (rect.width / 2);
    const safeLeft = Math.min(Math.max(centerX - (width / 2), margin), viewportWidth - width - margin);

    if (step.position === "top") {
        return {
            top: `${Math.max(rect.top - 18, margin + 12)}px`,
            left: `${safeLeft}px`,
            transform: "translateY(-100%)",
            width: `${width}px`
        };
    }

    if (step.position === "right") {
        const preferredLeft = rect.right + 18;
        const fitsRight = preferredLeft + width <= viewportWidth - margin;
        const top = Math.min(Math.max(rect.top, margin), viewportHeight - 260);

        return {
            top: `${top}px`,
            left: fitsRight ? `${preferredLeft}px` : `${safeLeft}px`,
            transform: "none",
            width: `${width}px`
        };
    }

    const preferredTop = rect.bottom + 18;
    const fitsBottom = preferredTop + 260 <= viewportHeight - margin;
    return {
        top: fitsBottom ? `${preferredTop}px` : `${Math.max(rect.top - 18, margin + 12)}px`,
        left: `${safeLeft}px`,
        transform: fitsBottom ? "none" : "translateY(-100%)",
        width: `${width}px`
    };
};

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
    const [autoSaving, setAutoSaving] = useState(false);
    const [pendingChanges, setPendingChanges] = useState(false);
    const [activeTab, setActiveTab] = useState("prepare");
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

    const [availableBrandsForProduct, setAvailableBrandsForProduct] = useState([]);
    const [availableUnits, setAvailableUnits] = useState([]);

    // Shop mode UX
    const [shopSearch, setShopSearch] = useState("");
    const [shopFilter, setShopFilter] = useState("pending");
    const [shopSort, setShopSort] = useState("default");
    const [showToolsPanel, setShowToolsPanel] = useState(false);
    const [expandedBrandSwitcher, setExpandedBrandSwitcher] = useState(null);

    const selectedItems = selectedList?.items || [];
    const totalItems = selectedItems.length;
    const purchasedCount = selectedItems.filter((item) => item.purchased).length;
    const pricedCount = selectedItems.filter((item) => item.price !== null && item.price !== undefined).length;
    const readyToSubmitCount = selectedItems.filter((item) => item.purchased && item.price).length;
    const missingPriceCount = selectedItems.filter((item) => item.purchased && !item.price).length;
    const estimatedCount = selectedItems.filter((item) => item.estimated_price).length;
    const remainingCount = totalItems - purchasedCount;
    const totalTrackedItems = lists.reduce((sum, list) => sum + (list.items?.length || 0), 0);
    const totalActualLive = selectedItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    const totalEstimatedLive = selectedItems.reduce((sum, item) => sum + (Number(item.estimated_price) || 0), 0);
    const progressPct = totalItems ? Math.round((purchasedCount / totalItems) * 100) : 0;
    const tutorialBubbleStyle = getTutorialBubbleStyle(tutorial.activeStep, tutorial.highlightRect);

    // Filtered + sorted items for Shop mode
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
                if (a.item.purchased === b.item.purchased) {
                    return 0;
                }
                return a.item.purchased ? 1 : -1;
            });
        }

        return list;
    }, [selectedItems, shopSearch, shopFilter, shopSort]);

    // Helper: get alternative brands available for the same product+supermarket
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
    };

    const saveList = async (itemsToSave, options = {}) => {
        const {
            listId = selectedList?.id,
            silent = false,
            updateSelected = true
        } = options;

        if (!listId) {
            return null;
        }

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
            if (!silent) {
                toast.error("Error al guardar cambios");
            }
            throw error;
        }
    };

    const fetchData = async () => {
        setLoading(true);

        try {
            const fetchLists = axios.get(`${API}/shopping-lists`).then((response) => {
                setLists(response.data);
                setSelectedList((current) => {
                    if (!response.data.length) {
                        return null;
                    }

                    if (!current) {
                        return response.data[0];
                    }

                    return response.data.find((list) => list.id === current.id) || response.data[0];
                });
            }).catch((error) => console.error("Lists fetch error", error));

            const fetchProducts = axios.get(`${API}/public/products`).then((response) => {
                setProducts(response.data);
            }).catch((error) => console.error("Products fetch error", error));

            const fetchAttributes = axios.get(`${API}/admin/attributes`).then((response) => {
                setAttributes(response.data);
            }).catch((error) => console.error("Attributes fetch error", error));

            const fetchSupermarkets = axios.get(`${API}/admin/supermarkets`).then((response) => {
                setSupermarkets(response.data);
            }).catch((error) => console.error("Supermarkets fetch error", error));

            const fetchUnits = axios.get(`${API}/admin/units`).then((response) => {
                setUnits(response.data);
                if (response.data.length > 0) {
                    setNewItemUnit(response.data[0].id);
                }
            }).catch((error) => console.error("Units fetch error", error));

            const fetchBrands = axios.get(`${API}/admin/brands`).then((response) => {
                setBrands(response.data);
            }).catch((error) => console.error("Brands fetch error", error));

            const fetchBrandCatalog = axios.get(`${API}/admin/brand-catalog`).then((response) => {
                setBrandCatalog(response.data);
            }).catch((error) => console.error("Brand catalog fetch error", error));

            const fetchSellable = axios.get(`${API}/admin/sellable-products`).then((response) => {
                setSellableProducts(response.data);
            }).catch((error) => console.error("Sellable fetch error", error));

            await Promise.allSettled([
                fetchLists,
                fetchProducts,
                fetchAttributes,
                fetchSupermarkets,
                fetchUnits,
                fetchBrands,
                fetchBrandCatalog,
                fetchSellable
            ]);
        } catch (error) {
            console.error("General error in fetchData", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!pendingChanges || !selectedList) {
            return undefined;
        }

        const autoSaveTimer = setTimeout(async () => {
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
        }, 1200);

        return () => clearTimeout(autoSaveTimer);
    }, [pendingChanges, selectedList]);

    useEffect(() => {
        if (newItemProduct && selectedList) {
            const brandIds = Array.from(new Set(
                sellableProducts
                    .filter((sellableProduct) => (
                        sellableProduct.product_id === newItemProduct &&
                        sellableProduct.supermarket_id === selectedList.supermarket_id
                    ))
                    .map((sellableProduct) => sellableProduct.brand_id)
            ));

            setAvailableBrandsForProduct(brands.filter((brand) => brandIds.includes(brand.id)));
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
            const match = sellableProducts.find((sellableProduct) => (
                sellableProduct.product_id === newItemProduct &&
                sellableProduct.brand_id === newItemBrandId &&
                sellableProduct.supermarket_id === selectedList.supermarket_id
            ));

            setNewItemSellable(match ? match.id : "");
        }
    }, [newItemBrandId, newItemProduct, selectedList, sellableProducts]);

    useEffect(() => {
        const fetchAvailableUnits = async () => {
            if (!newItemProduct || !newItemSellable || !selectedList) {
                setAvailableUnits([]);
                setNewItemUnit("");
                return;
            }

            const sellableProduct = sellableProducts.find((candidate) => candidate.id === newItemSellable);
            if (!sellableProduct) {
                setAvailableUnits([]);
                setNewItemUnit("");
                return;
            }

            try {
                const response = await axios.get(`${API}/admin/sellable-product-units/${sellableProduct.id}`);
                setAvailableUnits(response.data);
                if (response.data.length === 1) {
                    setNewItemUnit(response.data[0].unit_id);
                }
            } catch (error) {
                console.error("Error fetching units", error);
            }
        };

        fetchAvailableUnits();
    }, [newItemSellable, newItemProduct, selectedList, sellableProducts]);

    useEffect(() => {
        const items = selectedList?.items || [];
        setShowEstimated(Boolean(items.some((item) => item.estimated_price)));
    }, [selectedList]);

    const handleSelectList = async (list) => {
        if (!list || list.id === selectedList?.id) {
            return;
        }

        if (pendingChanges && selectedList) {
            try {
                await saveList(selectedList.items, {
                    listId: selectedList.id,
                    silent: true,
                    updateSelected: false
                });
                setPendingChanges(false);
            } catch (error) {
                console.error("Error saving before switching list", error);
            }
        }

        setSelectedList(list);
        setActiveTab("prepare");
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
            setActiveTab("prepare");
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

        const sellableProduct = sellableProducts.find((candidate) => candidate.id === newItemSellable);
        if (!sellableProduct) {
            toast.error("Producto no disponible");
            return;
        }

        try {
            const cleanedAttrs = Object.fromEntries(
                Object.entries(newItemAttrValues).filter(([, value]) => value !== "" && value !== null && value !== "none")
            );

            const currentItems = serializeItems(selectedList.items);
            const newItem = {
                sellable_product_id: sellableProduct.id,
                quantity: parseFloat(newItemQuantity) || 1,
                unit_id: newItemUnit,
                price: editingItemIndex !== null ? currentItems[editingItemIndex]?.price ?? null : null,
                purchased: editingItemIndex !== null ? Boolean(currentItems[editingItemIndex]?.purchased) : false,
                attribute_values: cleanedAttrs
            };

            const updatedItems = editingItemIndex !== null
                ? currentItems.map((item, index) => (index === editingItemIndex ? newItem : item))
                : [...currentItems, newItem];

            const updatedList = await saveList(updatedItems, {
                listId: selectedList.id,
                updateSelected: true
            });

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
        if (!selectedList) {
            return [];
        }

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
            if (Number.isFinite(parsed) && parsed >= 0) {
                nextPrice = parsed;
            }
        }
        const currentItem = selectedList?.items?.[index];
        const updates = { price: nextPrice };
        if (nextPrice && nextPrice > 0 && currentItem && !currentItem.purchased) {
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
        if (!alternative || !selectedList?.items?.[index]) {
            return;
        }
        const sp = sellableProducts.find((candidate) => candidate.id === alternative.sellable_id);
        if (!sp) {
            toast.error("Esta alternativa no esta disponible");
            return;
        }
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

    const handleSkipShopItem = (index) => {
        updateLocalItem(index, { purchased: false, price: null });
        toast("Producto marcado como no comprado", { description: "Lo hemos dejado pendiente" });
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
            setActiveTab("prepare");
            toast.success("Lista duplicada correctamente");
        } catch (error) {
            toast.error("Error al duplicar lista");
        }
    };

    const handleRemoveItem = async (index) => {
        if (!selectedList) {
            return;
        }

        const updatedItems = selectedList.items.filter((_, itemIndex) => itemIndex !== index);

        try {
            const updatedList = await saveList(updatedItems, {
                listId: selectedList.id,
                updateSelected: true
            });

            if (updatedList) {
                setPendingChanges(false);
                toast.success("Producto eliminado");
            }
        } catch (error) {
            toast.error("Error al eliminar");
        }
    };

    const handleSubmitPrices = async () => {
        if (!selectedList) {
            return;
        }

        setConfirmSubmitOpen(false);

        try {
            if (pendingChanges) {
                await saveList(selectedList.items, {
                    listId: selectedList.id,
                    silent: true,
                    updateSelected: true
                });
                setPendingChanges(false);
            }

            const response = await axios.post(`${API}/shopping-lists/${selectedList.id}/submit-prices`);
            const cleanedItems = selectedList.items.map((item) => ({
                ...item,
                purchased: false,
                price: null
            }));

            await saveList(cleanedItems, {
                listId: selectedList.id,
                silent: true,
                updateSelected: true
            });

            setActiveTab("prepare");
            toast.success(response.data.message || "Precios subidos");
            toast.success("La lista se ha limpiado y queda preparada para reutilizarse");
        } catch (error) {
            toast.error("Error al subir precios");
        }
    };

    const handleConfirmEstimate = async () => {
        if (!selectedList) {
            return;
        }

        setConfirmEstimateOpen(false);

        try {
            const response = await axios.post(`${API}/shopping-lists/${selectedList.id}/estimate`);
            syncListState(response.data);
            setShowEstimated(true);
            setActiveTab("shop");
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
        if (!selectedList) {
            return;
        }

        if (!window.confirm("Seguro que quieres limpiar la compra actual? Mantendremos los productos, pero se borraran checks y precios reales.")) {
            return;
        }

        const resetItems = selectedList.items.map((item) => ({
            ...item,
            purchased: false,
            price: null
        }));

        try {
            const updatedList = await saveList(resetItems, {
                listId: selectedList.id,
                updateSelected: true
            });

            if (updatedList) {
                setPendingChanges(false);
                setActiveTab("prepare");
                toast.success("Lista preparada para una nueva compra");
            }
        } catch (error) {
            toast.error("Error al reiniciar la lista");
        }
    };

    const handleDeleteList = async (listId) => {
        try {
            await axios.delete(`${API}/shopping-lists/${listId}`);

            setLists((prev) => {
                const filteredLists = prev.filter((list) => list.id !== listId);
                if (selectedList?.id === listId) {
                    setSelectedList(filteredLists[0] || null);
                }
                return filteredLists;
            });

            toast.success("Lista eliminada");
        } catch (error) {
            toast.error("Error al eliminar lista");
        }
    };

    const openEditDialog = (item, index) => {
        setNewItemProduct(item.product_id);
        setNewItemBrandId(item.brand_id);
        setNewItemAttrValues(item.attribute_values || {});
        setNewItemQuantity(String(item.quantity));
        setNewItemUnit(item.unit_id);
        setEditingItemIndex(index);
        setAddItemDialogOpen(true);
    };

    return (
        <>
            <Layout>
                <div className="space-y-4" data-testid="shopping-list-page">
                    <Card className="overflow-hidden border-slate-200 shadow-sm" data-testid="list-detail-card">
                        <CardHeader className="border-b border-slate-100 bg-white pb-4">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <CardTitle className="text-2xl text-slate-950" style={{ fontFamily: "Manrope, sans-serif" }}>
                                            Lista de compra
                                        </CardTitle>
                                        {selectedList && (
                                            <Badge className="rounded-full border-0 bg-emerald-100 px-3 py-1 text-emerald-700">
                                                {selectedList.name}
                                            </Badge>
                                        )}
                                        {selectedList?.supermarket_name && (
                                            <Badge className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600">
                                                {selectedList.supermarket_name}
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => startTutorial()}
                                        className="gap-2 rounded-2xl border-slate-200"
                                    >
                                        <HelpCircle className="h-4 w-4" />
                                        Tutorial
                                    </Button>
                                    <Button
                                        onClick={() => setDialogOpen(true)}
                                        className="gap-2 rounded-2xl bg-emerald-500 text-white hover:bg-emerald-600"
                                        data-testid="new-list-btn"
                                        data-tutorial="new-list-btn"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Nueva lista
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-4 sm:p-5">
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <div className="flex flex-col gap-2 rounded-3xl border border-slate-200 bg-slate-50 p-2.5">
                                    <TabsList className="grid h-auto grid-cols-1 gap-2 bg-transparent p-0 sm:grid-cols-3">
                                        <TabsTrigger
                                            value="prepare"
                                            className="h-auto rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm data-[state=active]:border-emerald-300 data-[state=active]:bg-emerald-50 data-[state=active]:text-slate-900 data-[state=active]:shadow"
                                            data-tutorial="prepare-tab"
                                        >
                                            <div className="flex w-full items-center justify-between gap-2">
                                                <span className="flex items-center gap-2 text-sm font-semibold">
                                                    <Package className="h-4 w-4" />
                                                    Gestionar listas
                                                </span>
                                                <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                                                    {lists.length}
                                                </span>
                                            </div>
                                        </TabsTrigger>

                                        <TabsTrigger
                                            value="shop"
                                            className="h-auto rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm data-[state=active]:border-sky-300 data-[state=active]:bg-sky-50 data-[state=active]:text-slate-900 data-[state=active]:shadow"
                                            data-tutorial="shop-tab"
                                        >
                                            <div className="flex w-full items-center justify-between gap-2">
                                                <span className="flex items-center gap-2 text-sm font-semibold">
                                                    <ShoppingCart className="h-4 w-4" />
                                                    Modo compra
                                                </span>
                                                <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                                                    {purchasedCount}
                                                </span>
                                            </div>
                                        </TabsTrigger>

                                        <TabsTrigger
                                            value="finish"
                                            className="h-auto rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm data-[state=active]:border-amber-300 data-[state=active]:bg-amber-50 data-[state=active]:text-slate-900 data-[state=active]:shadow"
                                            data-tutorial="finish-tab"
                                        >
                                            <div className="flex w-full items-center justify-between gap-2">
                                                <span className="flex items-center gap-2 text-sm font-semibold">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Cerrar ticket
                                                </span>
                                                <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                                                    {readyToSubmitCount}
                                                </span>
                                            </div>
                                        </TabsTrigger>
                                    </TabsList>

                                    <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-sm">
                                        <div className="flex items-center gap-2 font-medium">
                                            {autoSaving ? (
                                                <>
                                                    <Loader className="h-4 w-4 animate-spin text-sky-600" />
                                                    <span className="text-sky-700">Guardando cambios...</span>
                                                </>
                                            ) : pendingChanges ? (
                                                <>
                                                    <Clock className="h-4 w-4 text-amber-600" />
                                                    <span className="text-amber-700">Hay cambios pendientes</span>
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                    <span className="text-emerald-700">Todo sincronizado</span>
                                                </>
                                            )}
                                        </div>

                                        {selectedList ? (
                                            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
                                                {totalItems} productos
                                            </span>
                                        ) : (
                                            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
                                                Sin lista seleccionada
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <TabsContent value="prepare" className="mt-4">
                                    {!selectedList ? (
                                        <div className="space-y-4" data-tutorial="lists-sidebar">
                                            <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="text-sm font-semibold text-slate-900">Gestiona tus listas</p>
                                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                                                        {lists.length} listas
                                                    </span>
                                                </div>
                                                <Button
                                                    onClick={() => setDialogOpen(true)}
                                                    className="gap-2 rounded-2xl bg-emerald-500 text-white hover:bg-emerald-600"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                    Nueva lista
                                                </Button>
                                            </div>

                                            {loading ? (
                                                <div className="flex items-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                                                    <Loader className="h-4 w-4 animate-spin" />
                                                    Cargando listas...
                                                </div>
                                            ) : lists.length === 0 ? (
                                                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                                                    <ShoppingCart className="mx-auto h-10 w-10 text-slate-300" />
                                                    <p className="mt-4 text-base font-semibold text-slate-700">No tienes listas</p>
                                                </div>
                                            ) : (
                                                <div className="grid gap-3 lg:grid-cols-2">
                                                    {lists.map((list) => {
                                                        const listPurchasedCount = list.items?.filter((item) => item.purchased).length || 0;

                                                        return (
                                                            <button
                                                                key={list.id}
                                                                type="button"
                                                                className="group rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50"
                                                                onClick={() => handleSelectList(list)}
                                                                data-testid={`list-card-${list.id}`}
                                                            >
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="truncate text-sm font-semibold text-slate-900">{list.name}</p>
                                                                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                                                            <Store className="h-3.5 w-3.5" />
                                                                            <span className="truncate">{list.supermarket_name}</span>
                                                                        </p>
                                                                    </div>

                                                                    <div className="flex items-center gap-1 opacity-100 xl:opacity-0 xl:group-hover:opacity-100">
                                                                        <button
                                                                            type="button"
                                                                            onClick={(event) => {
                                                                                event.stopPropagation();
                                                                                handleDuplicateList(list);
                                                                            }}
                                                                            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-sky-50 hover:text-sky-600"
                                                                            title="Duplicar lista"
                                                                        >
                                                                            <Copy className="h-4 w-4" />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={(event) => {
                                                                                event.stopPropagation();
                                                                                handleDeleteList(list.id);
                                                                            }}
                                                                            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                                                                            data-testid={`delete-list-${list.id}`}
                                                                            title="Eliminar lista"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-medium">
                                                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                                                                        {list.items?.length || 0} productos
                                                                    </span>
                                                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                                                                        {listPurchasedCount} comprados
                                                                    </span>
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="text-sm font-semibold text-slate-900" data-tutorial="add-item-btn">
                                                        Editando lista
                                                    </p>
                                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                                                        {selectedList.name}
                                                    </span>
                                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                                                        {selectedList.supermarket_name}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setSelectedList(null)}
                                                        className="gap-2 rounded-2xl border-slate-200"
                                                    >
                                                        Ver otras listas
                                                    </Button>
                                                    <Button
                                                        onClick={() => setAddItemDialogOpen(true)}
                                                        className="gap-2 rounded-2xl bg-emerald-500 text-white hover:bg-emerald-600"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                        Anadir producto
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setActiveTab("shop")}
                                                        disabled={!totalItems}
                                                        className="gap-2 rounded-2xl border-slate-200"
                                                    >
                                                        Ir a modo compra
                                                    </Button>
                                                </div>
                                            </div>

                                            {totalItems === 0 ? (
                                                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                                                    <Package className="mx-auto h-12 w-12 text-slate-300" />
                                                    <p className="mt-4 text-base font-semibold text-slate-700">La lista esta vacia</p>
                                                </div>
                                            ) : (
                                                <div className="max-h-[64vh] space-y-3 overflow-y-auto pr-1">
                                                    {selectedItems.map((item, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm md:flex-row md:items-center md:justify-between"
                                                        >
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <p className="text-base font-semibold text-slate-900">{item.product_name}</p>
                                                                    {item.estimated_price && (
                                                                        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-medium text-indigo-700">
                                                                            Estimado {formatCurrency(item.estimated_price)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="mt-1 text-sm text-slate-500">{item.brand_name || "Marca sin definir"}</p>
                                                                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                                                                        {item.quantity} {item.unit_name}
                                                                    </span>
                                                                    {item.attribute_values && Object.keys(item.attribute_values).length > 0 && (
                                                                        Object.entries(item.attribute_values).map(([attrId, value]) => (
                                                                            <span key={attrId} className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
                                                                                {value}
                                                                            </span>
                                                                        ))
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-wrap gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={() => openEditDialog(item, index)}
                                                                    className="rounded-2xl border-slate-200"
                                                                >
                                                                    Editar
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={() => handleRemoveItem(index)}
                                                                    className="rounded-2xl border-rose-200 text-rose-600 hover:bg-rose-50"
                                                                >
                                                                    Eliminar
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="shop" className="mt-4 space-y-3">
                                    {!selectedList ? (
                                        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                                            <ShoppingCart className="mx-auto h-12 w-12 text-slate-300" />
                                            <p className="mt-4 text-base font-semibold text-slate-700">Selecciona una lista para comprar</p>
                                            <p className="mt-1 text-sm text-slate-500">Ve a la pestana Gestionar listas</p>
                                        </div>
                                    ) : totalItems === 0 ? (
                                        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                                            <ShoppingCart className="mx-auto h-12 w-12 text-slate-300" />
                                            <p className="mt-4 text-base font-semibold text-slate-700">La lista no tiene productos</p>
                                            <Button
                                                onClick={() => setAddItemDialogOpen(true)}
                                                className="mt-4 gap-2 rounded-2xl bg-emerald-500 text-white hover:bg-emerald-600"
                                            >
                                                <Plus className="h-4 w-4" />
                                                Anadir producto
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Sticky header: progress + list selector + search */}
                                            <div className="sticky top-0 z-20 -mx-4 bg-white/95 px-4 pb-3 pt-1 backdrop-blur sm:-mx-5 sm:px-5">
                                                <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
                                                    {/* Row 1: list selector + progress/total */}
                                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                        <div className="flex min-w-0 flex-1 items-center gap-2">
                                                            <div className="flex min-w-0 flex-1 items-center gap-2">
                                                                <ShoppingCart className="h-5 w-5 shrink-0 text-emerald-600" />
                                                                <div className="min-w-0 flex-1">
                                                                    <Select
                                                                        value={selectedList?.id || "none"}
                                                                        onValueChange={(value) => {
                                                                            const nextList = lists.find((list) => list.id === value) || null;
                                                                            handleSelectList(nextList);
                                                                        }}
                                                                    >
                                                                        <SelectTrigger data-tutorial="shop-list-selector" className="h-9 border-slate-200">
                                                                            <SelectValue placeholder="Lista" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {lists.map((list) => (
                                                                                <SelectItem key={list.id} value={list.id}>
                                                                                    {list.name} · {list.supermarket_name}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between gap-2 sm:justify-end">
                                                            <div className="text-right">
                                                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total</p>
                                                                <p className="text-xl font-bold text-slate-950 tabular-nums" data-testid="shop-total">
                                                                    {formatCurrencyShort(totalActualLive)}
                                                                </p>
                                                            </div>
                                                            {totalEstimatedLive > 0 && (
                                                                <div className="text-right">
                                                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">Estimado</p>
                                                                    <p className="text-sm font-semibold text-indigo-700 tabular-nums">
                                                                        {formatCurrencyShort(totalEstimatedLive)}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Progress bar */}
                                                    <div className="mt-3">
                                                        <div className="flex items-center justify-between text-[11px] font-medium text-slate-600">
                                                            <span className="flex items-center gap-1.5">
                                                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                                                <span className="font-semibold text-slate-900 tabular-nums">{purchasedCount}/{totalItems}</span>
                                                                <span>comprados</span>
                                                            </span>
                                                            <span className="tabular-nums">{progressPct}%</span>
                                                        </div>
                                                        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                                                            <div
                                                                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
                                                                style={{ width: `${progressPct}%` }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Row 2: Search */}
                                                    <div className="mt-3 flex items-center gap-2">
                                                        <div className="relative flex-1">
                                                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                                            <Input
                                                                value={shopSearch}
                                                                onChange={(event) => setShopSearch(event.target.value)}
                                                                placeholder="Buscar producto o marca..."
                                                                className="h-10 rounded-2xl border-slate-200 pl-9 pr-9"
                                                                inputMode="search"
                                                            />
                                                            {shopSearch && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShopSearch("")}
                                                                    className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                                                >
                                                                    <X className="h-3.5 w-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            className={`h-10 gap-2 rounded-2xl border-slate-200 px-3 ${showToolsPanel ? "bg-slate-100" : ""}`}
                                                            onClick={() => setShowToolsPanel((prev) => !prev)}
                                                        >
                                                            <SlidersHorizontal className="h-4 w-4" />
                                                            <span className="hidden sm:inline">Ajustar</span>
                                                        </Button>
                                                    </div>

                                                    {/* Filter chips */}
                                                    <div className="mt-3 -mx-1 flex items-center gap-1.5 overflow-x-auto pb-1">
                                                        {SHOP_FILTER_OPTIONS.map((option) => {
                                                            const active = shopFilter === option.value;
                                                            const badgeCount = option.value === "pending"
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
                                                                    className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                                                                        active
                                                                            ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                                                                            : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
                                                                    }`}
                                                                >
                                                                    {option.label}
                                                                    <span className={`tabular-nums ${active ? "text-emerald-50" : "text-slate-400"}`}>
                                                                        {badgeCount}
                                                                    </span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>

                                                    {showToolsPanel && (
                                                        <div className="mt-3 grid gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3 sm:grid-cols-2">
                                                            <div className="space-y-1">
                                                                <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Ordenar</Label>
                                                                <Select value={shopSort} onValueChange={setShopSort}>
                                                                    <SelectTrigger className="h-9 bg-white">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {SHOP_SORT_OPTIONS.map((option) => (
                                                                            <SelectItem key={option.value} value={option.value}>
                                                                                {option.label}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="flex items-end gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={() => setConfirmEstimateOpen(true)}
                                                                    disabled={!totalItems}
                                                                    className="h-9 flex-1 gap-2 rounded-2xl border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                                                                >
                                                                    <Sparkles className="h-4 w-4" />
                                                                    {showEstimated ? "Recalcular" : "Estimar"}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Items list */}
                                            {filteredShopItems.length === 0 ? (
                                                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                                                    <Info className="mx-auto h-10 w-10 text-slate-300" />
                                                    <p className="mt-3 text-sm font-semibold text-slate-700">No hay productos que coincidan</p>
                                                    <p className="mt-1 text-xs text-slate-500">Prueba a cambiar el filtro o limpiar la busqueda</p>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => {
                                                            setShopSearch("");
                                                            setShopFilter("all");
                                                        }}
                                                        className="mt-4 gap-2 rounded-2xl border-slate-200"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                        Limpiar filtros
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="space-y-3 pb-24" data-tutorial="shop-list">
                                                    {filteredShopItems.map(({ item, idx }, visualIndex) => {
                                                        const priceInsight = getPriceInsight(item);
                                                        const alternatives = getAlternativeBrandsForItem(item);
                                                        const unitPriceStr = formatUnitPrice(item.price, item.quantity, item.unit_name);
                                                        const estimatedUnitStr = formatUnitPrice(item.estimated_price, item.quantity, item.unit_name);
                                                        const brandSwitcherOpen = expandedBrandSwitcher === idx;

                                                        return (
                                                            <div
                                                                key={`${item.sellable_product_id}-${idx}`}
                                                                className={`rounded-[26px] border shadow-sm transition-all ${
                                                                    item.purchased
                                                                        ? item.price
                                                                            ? "border-emerald-300 bg-emerald-50"
                                                                            : "border-amber-300 bg-amber-50"
                                                                        : "border-slate-200 bg-white"
                                                                }`}
                                                            >
                                                                {/* Top row: check + product */}
                                                                <div className="flex items-start gap-3 p-4 sm:p-5">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => updateLocalItem(idx, { purchased: !item.purchased })}
                                                                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 transition ${
                                                                            item.purchased
                                                                                ? "border-emerald-500 bg-emerald-500 text-white shadow-md"
                                                                                : "border-slate-300 bg-white text-transparent hover:border-emerald-400 hover:text-emerald-200"
                                                                        }`}
                                                                        data-testid={`item-checkbox-${idx}`}
                                                                        aria-label={item.purchased ? "Desmarcar como comprado" : "Marcar como comprado"}
                                                                    >
                                                                        <CheckCircle2 className="h-6 w-6" strokeWidth={2.5} />
                                                                    </button>

                                                                    <div className="min-w-0 flex-1">
                                                                        <div className="flex flex-wrap items-baseline gap-x-2">
                                                                            <h3 className={`text-lg font-bold leading-tight ${
                                                                                item.purchased ? "text-slate-500 line-through" : "text-slate-950"
                                                                            }`} style={{ fontFamily: "Manrope, sans-serif" }}>
                                                                                {item.product_name}
                                                                            </h3>
                                                                        </div>
                                                                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => alternatives.length > 0 && setExpandedBrandSwitcher(brandSwitcherOpen ? null : idx)}
                                                                                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                                                                                    alternatives.length > 0
                                                                                        ? "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
                                                                                        : "border-slate-200 bg-slate-50 text-slate-500 cursor-default"
                                                                                }`}
                                                                                disabled={alternatives.length === 0}
                                                                            >
                                                                                {item.brand_name || "Sin marca"}
                                                                                {alternatives.length > 0 && (
                                                                                    <span className="text-[10px] text-slate-400">
                                                                                        · {alternatives.length} alt.
                                                                                    </span>
                                                                                )}
                                                                            </button>
                                                                            {item.attribute_values && Object.keys(item.attribute_values).length > 0 && (
                                                                                Object.entries(item.attribute_values).map(([attrId, value]) => (
                                                                                    <span
                                                                                        key={attrId}
                                                                                        className="rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200"
                                                                                    >
                                                                                        {value}
                                                                                    </span>
                                                                                ))
                                                                            )}
                                                                            {estimatedUnitStr && !unitPriceStr && (
                                                                                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
                                                                                    ~{estimatedUnitStr}
                                                                                </span>
                                                                            )}
                                                                        </div>

                                                                        {/* Brand alternatives - inline expandable */}
                                                                        {brandSwitcherOpen && alternatives.length > 0 && (
                                                                            <div className="mt-2 rounded-2xl border border-slate-200 bg-white p-2">
                                                                                <div className="flex items-center justify-between">
                                                                                    <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Cambiar marca</p>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => setExpandedBrandSwitcher(null)}
                                                                                        className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
                                                                                    >
                                                                                        <X className="h-3 w-3" />
                                                                                    </button>
                                                                                </div>
                                                                                <div className="mt-1 flex flex-wrap gap-1">
                                                                                    {alternatives.map((alt) => (
                                                                                        <button
                                                                                            key={alt.sellable_id}
                                                                                            type="button"
                                                                                            onClick={() => handleShopSwitchBrand(idx, alt)}
                                                                                            className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                                                                                        >
                                                                                            {alt.brand_name}
                                                                                        </button>
                                                                                    ))}
                                                                                </div>
                                                                                <p className="mt-2 px-1 text-[10px] text-slate-400">Al cambiar, se borrara el precio actual.</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Middle row: Quantity stepper + Price input */}
                                                                <div className="grid gap-3 px-4 pb-3 sm:grid-cols-[auto,1fr] sm:px-5">
                                                                    {/* Quantity stepper */}
                                                                    <div className="flex flex-col gap-1">
                                                                        <Label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Cantidad</Label>
                                                                        <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleQuantityStep(idx, -1)}
                                                                                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 active:bg-slate-200"
                                                                                aria-label="Reducir cantidad"
                                                                            >
                                                                                <Minus className="h-4 w-4" />
                                                                            </button>
                                                                            <Input
                                                                                type="number"
                                                                                inputMode="decimal"
                                                                                min="0.1"
                                                                                step="0.1"
                                                                                value={item.quantity}
                                                                                onChange={(event) => updateLocalItem(idx, {
                                                                                    quantity: parseFloat(event.target.value) || 0.1
                                                                                })}
                                                                                className="h-9 w-16 border-0 bg-transparent px-0 text-center text-base font-bold tabular-nums shadow-none focus-visible:ring-0"
                                                                            />
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleQuantityStep(idx, 1)}
                                                                                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 active:bg-slate-200"
                                                                                aria-label="Aumentar cantidad"
                                                                            >
                                                                                <Plus className="h-4 w-4" />
                                                                            </button>
                                                                            <span className="pr-2 text-xs font-semibold text-slate-500">{item.unit_name}</span>
                                                                        </div>
                                                                    </div>

                                                                    {/* Price input - BIG */}
                                                                    <div
                                                                        className="flex flex-col gap-1"
                                                                        data-tutorial={visualIndex === 0 ? "price-input-example" : undefined}
                                                                    >
                                                                        <div className="flex items-center justify-between">
                                                                            <Label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                                                                Precio real
                                                                            </Label>
                                                                            {item.estimated_price ? (
                                                                                <span className="text-[10px] font-semibold text-indigo-600">
                                                                                    Estimado: {formatCurrencyShort(item.estimated_price)}
                                                                                </span>
                                                                            ) : null}
                                                                        </div>
                                                                        <div className={`flex items-center rounded-2xl border-2 bg-white shadow-sm transition ${
                                                                            item.price
                                                                                ? "border-emerald-400 bg-emerald-50"
                                                                                : "border-slate-200 focus-within:border-emerald-400"
                                                                        }`}>
                                                                            <Input
                                                                                type="number"
                                                                                inputMode="decimal"
                                                                                min="0"
                                                                                step="0.01"
                                                                                placeholder="0.00"
                                                                                value={item.price ?? ""}
                                                                                onChange={(event) => handleShopPriceChange(idx, event.target.value)}
                                                                                className="h-12 border-0 bg-transparent px-3 text-right text-2xl font-black tabular-nums shadow-none focus-visible:ring-0 placeholder:text-slate-300"
                                                                                data-testid={`item-price-${idx}`}
                                                                            />
                                                                            <span className="pr-4 text-lg font-bold text-slate-500">€</span>
                                                                        </div>
                                                                        {unitPriceStr && (
                                                                            <p className="text-right text-xs font-medium text-slate-500 tabular-nums">
                                                                                {unitPriceStr}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Price insight + actions */}
                                                                <div className="flex flex-col gap-2 border-t border-slate-200/70 bg-white/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                                                                    {priceInsight ? (
                                                                        <div className={`flex items-center gap-2 rounded-2xl px-3 py-1.5 text-xs font-semibold ${
                                                                            priceInsight.isHigher
                                                                                ? "bg-amber-100 text-amber-900"
                                                                                : "bg-emerald-100 text-emerald-900"
                                                                        }`}>
                                                                            {priceInsight.isHigher ? (
                                                                                <TrendingUp className="h-3.5 w-3.5" />
                                                                            ) : (
                                                                                <TrendingDown className="h-3.5 w-3.5" />
                                                                            )}
                                                                            <span>{priceInsight.label}</span>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-xs text-slate-400">
                                                                            {item.purchased && !item.price ? "Anade el precio que has visto en tienda" : " "}
                                                                        </span>
                                                                    )}

                                                                    <div className="flex items-center gap-1">
                                                                        {item.purchased && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleSkipShopItem(idx)}
                                                                                className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                                                                            >
                                                                                <Ban className="h-3.5 w-3.5" />
                                                                                <span className="hidden sm:inline">No comprado</span>
                                                                            </button>
                                                                        )}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => openEditDialog(item, idx)}
                                                                            className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                                                                        >
                                                                            <Edit3 className="h-3.5 w-3.5" />
                                                                            <span className="hidden sm:inline">Editar</span>
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRemoveItem(idx)}
                                                                            className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium text-rose-500 transition hover:bg-rose-50 hover:text-rose-700"
                                                                        >
                                                                            <Trash2 className="h-3.5 w-3.5" />
                                                                            <span className="hidden sm:inline">Quitar</span>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* Sticky bottom CTA */}
                                            {readyToSubmitCount > 0 && (
                                                <div className="sticky bottom-4 z-10 mx-auto max-w-md">
                                                    <Button
                                                        onClick={() => setActiveTab("finish")}
                                                        className="w-full gap-2 rounded-3xl bg-emerald-600 py-6 text-base font-bold text-white shadow-xl hover:bg-emerald-700"
                                                    >
                                                        <CheckCircle2 className="h-5 w-5" />
                                                        Ir a cerrar ticket ({readyToSubmitCount})
                                                        <ArrowRight className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}

                                            {/* Floating add button */}
                                            <button
                                                type="button"
                                                onClick={() => setAddItemDialogOpen(true)}
                                                className="fixed bottom-20 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xl transition hover:scale-105 hover:bg-emerald-600 active:scale-95 sm:bottom-8 sm:right-8"
                                                aria-label="Anadir producto a la lista"
                                                title="Anadir producto"
                                            >
                                                <Plus className="h-6 w-6" strokeWidth={2.5} />
                                            </button>
                                        </>
                                    )}
                                </TabsContent>

                                <TabsContent value="finish" className="mt-4 space-y-3">
                                    {!selectedList ? (
                                        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                                            <CheckCircle2 className="mx-auto h-12 w-12 text-slate-300" />
                                            <p className="mt-4 text-base font-semibold text-slate-700">Primero elige una lista en Gestionar listas</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Summary card */}
                                            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" data-tutorial="finish-summary">
                                                <div className="flex flex-wrap items-start justify-between gap-3">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-slate-950" style={{ fontFamily: "Manrope, sans-serif" }}>
                                                            Revisa antes de subir
                                                        </h3>
                                                        <p className="mt-1 text-sm text-slate-500">
                                                            {selectedList.name} · {selectedList.supermarket_name}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => setActiveTab("shop")}
                                                            className="gap-2 rounded-2xl border-slate-200"
                                                        >
                                                            <ArrowLeft className="h-4 w-4" />
                                                            <span className="hidden sm:inline">Volver</span>
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="mt-4 grid grid-cols-3 gap-2">
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

                                                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                                    <Button
                                                        onClick={() => setConfirmSubmitOpen(true)}
                                                        disabled={!readyToSubmitCount}
                                                        className="flex-1 gap-2 rounded-2xl bg-emerald-600 py-5 text-base font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50"
                                                        data-testid="submit-prices-btn"
                                                    >
                                                        <CheckCircle2 className="h-5 w-5" />
                                                        Subir {readyToSubmitCount} precios a la base de datos
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={handleResetList}
                                                        disabled={!purchasedCount && !pricedCount}
                                                        className="gap-2 rounded-2xl border-slate-200 py-5"
                                                    >
                                                        <RefreshCcw className="h-4 w-4" />
                                                        <span className="hidden sm:inline">Limpiar</span>
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Missing prices warning */}
                                            {missingPriceCount > 0 && (
                                                <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4">
                                                    <div className="flex gap-3">
                                                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                                                        <div className="flex-1">
                                                            <p className="text-sm font-semibold text-amber-900">
                                                                {missingPriceCount} producto{missingPriceCount > 1 ? "s" : ""} comprado{missingPriceCount > 1 ? "s" : ""} sin precio
                                                            </p>
                                                            <p className="mt-1 text-xs text-amber-800">
                                                                Solo subiremos los que tengan precio. Vuelve al Modo compra para completarlos.
                                                            </p>
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setActiveTab("shop");
                                                                    setShopFilter("no_price");
                                                                }}
                                                                className="mt-3 gap-2 rounded-2xl border-amber-300 bg-white text-amber-800 hover:bg-amber-100"
                                                            >
                                                                <ArrowLeft className="h-4 w-4" />
                                                                Anadir precios que faltan
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Preview of data being uploaded */}
                                            {selectedItems.filter((item) => item.purchased && item.price).length === 0 ? (
                                                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                                                    <CheckCircle2 className="mx-auto h-12 w-12 text-slate-300" />
                                                    <p className="mt-4 text-base font-semibold text-slate-700">Aun no hay productos listos para subir</p>
                                                    <p className="mt-1 text-sm text-slate-500">Marca los productos comprados y pon sus precios en el Modo compra</p>
                                                </div>
                                            ) : (
                                                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                                                    <div className="mb-3 flex items-center justify-between">
                                                        <h4 className="text-sm font-semibold text-slate-900">Datos que subiremos</h4>
                                                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                                                            {readyToSubmitCount} precios
                                                        </span>
                                                    </div>
                                                    <div className="max-h-[52vh] space-y-2 overflow-y-auto">
                                                        {selectedItems.filter((item) => item.purchased && item.price).map((item, itemIdx) => {
                                                            const unitPriceStr = formatUnitPrice(item.price, item.quantity, item.unit_name);
                                                            return (
                                                                <div
                                                                    key={`${item.sellable_product_id}-${itemIdx}`}
                                                                    className="flex flex-col gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3 sm:flex-row sm:items-center sm:justify-between"
                                                                >
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="truncate text-sm font-bold text-slate-950">{item.product_name}</p>
                                                                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                                                                            <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 font-medium text-slate-600">
                                                                                {item.brand_name || "Sin marca"}
                                                                            </span>
                                                                            <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 font-medium text-slate-600 tabular-nums">
                                                                                {item.quantity} {item.unit_name}
                                                                            </span>
                                                                            {item.attribute_values && Object.entries(item.attribute_values).map(([attrId, value]) => (
                                                                                <span
                                                                                    key={attrId}
                                                                                    className="rounded-full border border-emerald-200 bg-white px-2 py-0.5 font-medium text-emerald-700"
                                                                                >
                                                                                    {value}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-0">
                                                                        <p className="text-lg font-bold text-emerald-700 tabular-nums">
                                                                            {formatCurrencyShort(item.price)}
                                                                        </p>
                                                                        {unitPriceStr && (
                                                                            <p className="text-[11px] font-medium text-slate-500 tabular-nums">
                                                                                {unitPriceStr}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </Layout>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle style={{ fontFamily: "Manrope, sans-serif" }}>Crear nueva lista</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
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
                                    {supermarkets.map((supermarket) => (
                                        <SelectItem key={supermarket.id} value={supermarket.id}>
                                            {supermarket.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            onClick={handleCreateList}
                            className="w-full bg-emerald-500 text-white hover:bg-emerald-600"
                            data-testid="create-list-btn"
                        >
                            Crear lista
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog
                open={addItemDialogOpen}
                onOpenChange={(isOpen) => {
                    setAddItemDialogOpen(isOpen);
                    if (!isOpen) {
                        resetNewItemForm();
                    }
                }}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle style={{ fontFamily: "Manrope, sans-serif" }}>
                            {editingItemIndex !== null ? "Editar producto" : "Anadir producto"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>1. Producto *</Label>
                            <Select value={newItemProduct} onValueChange={setNewItemProduct}>
                                <SelectTrigger data-testid="add-item-product-select">
                                    <SelectValue placeholder="Selecciona producto" />
                                </SelectTrigger>
                                <SelectContent>
                                    {products
                                        .filter((product) => sellableProducts.some((candidate) => (
                                            candidate.product_id === product.id &&
                                            candidate.supermarket_id === selectedList?.supermarket_id
                                        )))
                                        .map((product) => (
                                            <SelectItem key={product.id} value={product.id}>
                                                {product.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {newItemProduct && (
                            <div className="space-y-2">
                                <Label>2. Marca *</Label>
                                <Select
                                    value={newItemBrandId || "none"}
                                    onValueChange={(value) => {
                                        setNewItemBrandId(value === "none" ? "" : value);
                                        setNewItemAttrValues({});
                                        setNewItemSellable("");
                                    }}
                                >
                                    <SelectTrigger data-testid="add-item-brand-select">
                                        <SelectValue placeholder="Selecciona marca" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Seleccionar marca...</SelectItem>
                                        {availableBrandsForProduct.map((brand) => (
                                            <SelectItem key={brand.id} value={brand.id}>
                                                {brand.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {newItemBrandId && (() => {
                            const product = products.find((candidate) => candidate.id === newItemProduct);
                            if (!product || !product.allowed_attribute_ids?.length) {
                                return null;
                            }

                            const catalogEntry = brandCatalog.find((entry) => (
                                entry.brand_id === newItemBrandId &&
                                entry.product_id === newItemProduct
                            ));

                            const attrBlocks = product.allowed_attribute_ids.map((attrId) => {
                                const attribute = attributes.find((candidate) => candidate.id === attrId);
                                if (!attribute) {
                                    return null;
                                }

                                const catalogValues = catalogEntry?.allowed_attributes?.[attrId];
                                const possibleValues = catalogValues?.length ? catalogValues : (attribute.values || []);
                                if (!possibleValues.length) {
                                    return null;
                                }

                                return (
                                    <div key={attrId} className="space-y-1">
                                        <Label className="text-[10px] font-medium text-slate-600">{attribute.name}</Label>
                                        <Select
                                            value={newItemAttrValues[attrId] || "none"}
                                            onValueChange={(value) => setNewItemAttrValues({
                                                ...newItemAttrValues,
                                                [attrId]: value === "none" ? "" : value
                                            })}
                                        >
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue placeholder={`Seleccionar ${attribute.name}`} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Cualquier {attribute.name}</SelectItem>
                                                {possibleValues.map((value) => (
                                                    <SelectItem key={value} value={value}>
                                                        {value}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                );
                            }).filter(Boolean);

                            if (!attrBlocks.length) {
                                return null;
                            }

                            return (
                                <div className="space-y-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-3">
                                    <Label className="text-xs font-bold uppercase text-slate-500">3. Variante / atributos</Label>
                                    {attrBlocks}
                                </div>
                            );
                        })()}

                        {newItemSellable && (
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Unidad *</Label>
                                    <Select value={newItemUnit} onValueChange={setNewItemUnit}>
                                        <SelectTrigger data-testid="add-item-unit-select">
                                            <SelectValue placeholder="Unidad" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableUnits.map((unit) => (
                                                <SelectItem key={unit.unit_id} value={unit.unit_id}>
                                                    {unit.unit_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Cantidad</Label>
                                    <Input
                                        type="number"
                                        min="0.1"
                                        step="0.1"
                                        value={newItemQuantity}
                                        onChange={(event) => setNewItemQuantity(event.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <Button
                            onClick={handleAddItem}
                            disabled={!newItemUnit}
                            className="w-full bg-emerald-500 text-white hover:bg-emerald-600"
                        >
                            {editingItemIndex !== null ? "Guardar cambios" : "Anadir a la lista"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={confirmEstimateOpen} onOpenChange={setConfirmEstimateOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-indigo-700" style={{ fontFamily: "Manrope, sans-serif" }}>
                            <Sparkles className="h-5 w-5" />
                            Calcular precio estimado
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <div className="flex gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
                            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-indigo-400" />
                            <div className="space-y-2 text-sm text-indigo-900">
                                <p className="font-semibold">Se estimaran los precios de {selectedList?.name}</p>
                                <p>Cada producto consume 1 credito del sistema y te servira como referencia al comprar.</p>
                                <p className="font-medium text-indigo-700">
                                    Productos en la lista: {selectedList?.items?.length || 0}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2 pt-1">
                            <Button variant="outline" className="flex-1" onClick={() => setConfirmEstimateOpen(false)}>
                                Cancelar
                            </Button>
                            <Button className="flex-1 gap-2 bg-indigo-600 text-white hover:bg-indigo-700" onClick={handleConfirmEstimate}>
                                <Sparkles className="h-4 w-4" />
                                Calcular ahora
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={confirmSubmitOpen} onOpenChange={setConfirmSubmitOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-emerald-700" style={{ fontFamily: "Manrope, sans-serif" }}>
                            <CheckCircle2 className="h-5 w-5" />
                            Cerrar compra y subir precios
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <div className="flex gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                            <div className="space-y-2 text-sm text-emerald-900">
                                <p className="font-semibold">Subiremos solo productos comprados con precio real</p>
                                <p>Despues limpiaremos checks y precios reales, pero mantendremos la lista para reutilizarla en la siguiente compra.</p>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-600">Productos listos para enviar</span>
                                    <span className="font-mono font-bold text-emerald-700">{readyToSubmitCount}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-600">Comprados sin precio</span>
                                    <span className="font-mono font-bold text-amber-700">{missingPriceCount}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-600">Total real registrado</span>
                                    <span className="font-mono font-bold text-emerald-700">{formatCurrency(selectedList?.total_actual || 0)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 pt-1">
                            <Button variant="outline" className="flex-1" onClick={() => setConfirmSubmitOpen(false)}>
                                Cancelar
                            </Button>
                            <Button className="flex-1 gap-2 bg-emerald-600 text-white hover:bg-emerald-700" onClick={handleSubmitPrices}>
                                <CheckCircle2 className="h-4 w-4" />
                                Subir y limpiar compra
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

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
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-500">
                                    Tutorial rapido
                                </p>
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
