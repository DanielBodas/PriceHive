import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Checkbox } from "../components/ui/checkbox";
import { toast } from "sonner";
import {
    ShoppingCart,
    Plus,
    Trash2,
    Store,
    Package,
    Calculator,
    RefreshCcw,
    CheckCircle2,
    Sparkles,
    Eye,
    AlertTriangle,
    Zap
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ShoppingListPage = () => {
    const [lists, setLists] = useState([]);
    const [products, setProducts] = useState([]);
    const [supermarkets, setSupermarkets] = useState([]);
    const [units, setUnits] = useState([]);
    const [brands, setBrands] = useState([]);
    const [sellableProducts, setSellableProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedList, setSelectedList] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
    const [showEstimated, setShowEstimated] = useState(false);
    const [listsExpanded, setListsExpanded] = useState(true);
    const [confirmEstimateOpen, setConfirmEstimateOpen] = useState(false);
    const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);

    // New list form
    const [newListName, setNewListName] = useState("");
    const [newListSupermarket, setNewListSupermarket] = useState("");

    // New item form
    const [newItemProduct, setNewItemProduct] = useState("");
    const [newItemBrand, setNewItemBrand] = useState("");
    const [newItemQuantity, setNewItemQuantity] = useState("1");
    const [newItemUnit, setNewItemUnit] = useState("");

    // Filtered selection states
    const [availableBrands, setAvailableBrands] = useState([]);
    const [availableUnits, setAvailableUnits] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    // Selection logic for 4-step flow
    useEffect(() => {
        if (newItemProduct && selectedList) {
            const filtered = sellableProducts.filter(sp =>
                sp.product_id === newItemProduct && sp.supermarket_id === selectedList.supermarket_id
            );
            setAvailableBrands(filtered);
            if (filtered.length === 1) {
                setNewItemBrand(filtered[0].brand_id);
            }
        } else {
            setAvailableBrands([]);
            setNewItemBrand("");
        }
    }, [newItemProduct, selectedList, sellableProducts]);

    useEffect(() => {
        const fetchUnits = async () => {
            if (newItemProduct && newItemBrand && selectedList) {
                const sp = sellableProducts.find(sp =>
                    sp.product_id === newItemProduct &&
                    sp.supermarket_id === selectedList.supermarket_id &&
                    sp.brand_id === newItemBrand
                );
                if (sp) {
                    try {
                        const res = await axios.get(`${API}/admin/sellable-product-units/${sp.id}`);
                        setAvailableUnits(res.data);
                        if (res.data.length === 1) {
                            setNewItemUnit(res.data[0].unit_id);
                        }
                    } catch (e) {
                        console.error("Error fetching units", e);
                    }
                }
            } else {
                setAvailableUnits([]);
                setNewItemUnit("");
            }
        };
        fetchUnits();
    }, [newItemBrand, newItemProduct, selectedList, sellableProducts]);

    const resetNewItemForm = () => {
        setNewItemProduct("");
        setNewItemBrand("");
        setNewItemQuantity("1");
        setNewItemUnit("");
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch everything but individually to be more robust
            const fetchLists = axios.get(`${API}/shopping-lists`).then(r => setLists(r.data)).catch(e => console.error("Lists fetch error", e));
            const fetchProducts = axios.get(`${API}/public/products`).then(r => setProducts(r.data)).catch(e => console.error("Products fetch error", e));
            const fetchSupermarkets = axios.get(`${API}/admin/supermarkets`).then(r => setSupermarkets(r.data)).catch(e => console.error("Supermarkets fetch error", e));
            const fetchUnits = axios.get(`${API}/admin/units`).then(r => {
                setUnits(r.data);
                if (r.data.length > 0) setNewItemUnit(r.data[0].id);
            }).catch(e => console.error("Units fetch error", e));
            const fetchBrands = axios.get(`${API}/admin/brands`).then(r => setBrands(r.data)).catch(e => console.error("Brands fetch error", e));
            const fetchSellable = axios.get(`${API}/admin/sellable-products`).then(r => setSellableProducts(r.data)).catch(e => console.error("Sellable fetch error", e));

            await Promise.allSettled([fetchLists, fetchProducts, fetchSupermarkets, fetchUnits, fetchBrands, fetchSellable]);
        } catch (error) {
            console.error("General error in fetchData:", error);
        } finally {
            setLoading(false);
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
            setLists([response.data, ...lists]);
            setNewListName("");
            setNewListSupermarket("");
            setDialogOpen(false);
            toast.success("Lista creada");
        } catch (error) {
            toast.error("Error al crear lista");
        }
    };

    const handleAddItem = async () => {
        if (!newItemProduct || !newItemBrand || !newItemUnit) {
            toast.error("Completa todos los campos");
            return;
        }

        const sp = sellableProducts.find(sp =>
            sp.product_id === newItemProduct &&
            sp.supermarket_id === selectedList.supermarket_id &&
            sp.brand_id === newItemBrand
        );

        if (!sp) {
            toast.error("Producto no disponible en este supermercado");
            return;
        }

        try {
            const currentItems = selectedList.items.map(item => ({
                sellable_product_id: item.sellable_product_id,
                quantity: item.quantity,
                unit_id: item.unit_id,
                price: item.price,
                purchased: item.purchased
            }));

            const newItem = {
                sellable_product_id: sp.id,
                quantity: parseFloat(newItemQuantity) || 1,
                unit_id: newItemUnit,
                price: null,
                purchased: false
            };

            const response = await axios.put(`${API}/shopping-lists/${selectedList.id}`, {
                items: [...currentItems, newItem]
            });

            setSelectedList(response.data);
            setLists(lists.map(l => l.id === selectedList.id ? response.data : l));
            resetNewItemForm();
            setAddItemDialogOpen(false);
            toast.success("Producto añadido");
        } catch (error) {
            toast.error("Error al añadir producto");
        }
    };

    const updateLocalItem = (index, updates) => {
        const newItems = [...selectedList.items];
        newItems[index] = { ...newItems[index], ...updates };
        setSelectedList({ ...selectedList, items: newItems });
        return newItems;
    };

    const saveList = async (itemsToSave) => {
        try {
            // Map items to the format expected by the backend
            const cleanedItems = itemsToSave.map(item => ({
                sellable_product_id: item.sellable_product_id,
                quantity: item.quantity,
                unit_id: item.unit_id,
                price: item.price,
                purchased: item.purchased
            }));

            const response = await axios.put(`${API}/shopping-lists/${selectedList.id}`, {
                items: cleanedItems
            });

            setSelectedList(response.data);
            setLists(lists.map(l => l.id === selectedList.id ? response.data : l));
        } catch (error) {
            toast.error("Error al guardar cambios");
        }
    };

    const handleUpdateItem = async (index, updates) => {
        const newItems = updateLocalItem(index, updates);
        await saveList(newItems);
    };

    const handleRemoveItem = async (index) => {
        const updatedItems = selectedList.items
            .filter((_, i) => i !== index)
            .map(item => ({
                sellable_product_id: item.sellable_product_id,
                quantity: item.quantity,
                unit_id: item.unit_id,
                price: item.price,
                purchased: item.purchased
            }));

        try {
            const response = await axios.put(`${API}/shopping-lists/${selectedList.id}`, {
                items: updatedItems
            });
            setSelectedList(response.data);
            setLists(lists.map(l => l.id === selectedList.id ? response.data : l));
            toast.success("Producto eliminado");
        } catch (error) {
            toast.error("Error al eliminar");
        }
    };

    const handleSubmitPrices = async () => {
        setConfirmSubmitOpen(false);
        try {
            const response = await axios.post(`${API}/shopping-lists/${selectedList.id}/submit-prices`);
            toast.success(response.data.message);
        } catch (error) {
            toast.error("Error al subir precios");
        }
    };

    const handleConfirmEstimate = () => {
        setConfirmEstimateOpen(false);
        setShowEstimated(true);
    };

    const handleResetList = async () => {
        if (!window.confirm("¿Seguro que quieres reiniciar la lista? Se desmarcarán los productos y se borrarán los precios reales.")) return;
        const resetItems = selectedList.items.map(item => ({
            ...item,
            purchased: false,
            price: null
        }));
        await saveList(resetItems);
        toast.success("Lista lista para volver a usar");
    };

    const handleDeleteList = async (listId) => {
        try {
            await axios.delete(`${API}/shopping-lists/${listId}`);
            setLists(lists.filter(l => l.id !== listId));
            if (selectedList?.id === listId) {
                setSelectedList(null);
            }
            toast.success("Lista eliminada");
        } catch (error) {
            toast.error("Error al eliminar lista");
        }
    };

    // Get brand name helper
    const getBrandName = (brandId) => {
        const brand = brands.find(b => b.id === brandId);
        return brand?.name || "-";
    };

    return (
        <>
            <Layout>
                <div className="space-y-6" data-testid="shopping-list-page">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                                Lista de Compra
                            </h1>
                            <p className="text-slate-500 mt-1">Planifica tu compra y registra precios</p>
                        </div>
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-emerald-500 hover:bg-emerald-600 gap-2" data-testid="new-list-btn">
                                    <Plus className="w-4 h-4" />
                                    Nueva Lista
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle style={{ fontFamily: 'Manrope, sans-serif' }}>Crear Nueva Lista</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                        <Label>Nombre de la lista</Label>
                                        <Input
                                            placeholder="Ej: Compra semanal"
                                            value={newListName}
                                            onChange={(e) => setNewListName(e.target.value)}
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
                                                {supermarkets.map((sm) => (
                                                    <SelectItem key={sm.id} value={sm.id}>{sm.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button onClick={handleCreateList} className="w-full bg-emerald-500 hover:bg-emerald-600" data-testid="create-list-btn">
                                        Crear Lista
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-0 relative">
                        {/* Lists Sidebar */}
                        <div className={`transition-all duration-300 flex shrink-0 ${listsExpanded ? 'w-full lg:w-64' : 'w-0 lg:w-10'} ${!listsExpanded && 'hidden lg:flex'} overflow-hidden`}>
                            <div className={`${listsExpanded ? 'w-full lg:w-64' : 'w-0'} overflow-hidden transition-all duration-300`}>
                                <div className="w-full lg:w-64 pr-0 lg:pr-3">
                                    <div
                                        className="flex items-center justify-between mb-3 cursor-pointer hover:bg-slate-50 p-1 rounded-lg transition-colors"
                                        onClick={() => setListsExpanded(false)}
                                    >
                                        <h2 className="font-bold text-slate-900 text-xs uppercase tracking-widest px-1" style={{ fontFamily: 'Manrope, sans-serif' }}>Mis Listas</h2>
                                        <div className="h-7 w-7 rounded-md flex items-center justify-center text-slate-400">
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                                        </div>
                                    </div>
                                    {loading ? (
                                        <div className="text-slate-500 text-sm">Cargando...</div>
                                    ) : lists.length === 0 ? (
                                        <div className="p-4 text-center bg-white border border-slate-200 rounded-xl">
                                            <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                            <p className="text-slate-500 text-xs">Sin listas aún</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-0.5 max-h-[calc(100vh-240px)] overflow-y-auto pr-1">
                                            {lists.map((list) => (
                                                <div
                                                    key={list.id}
                                                    className={`group relative flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all ${selectedList?.id === list.id
                                                        ? 'bg-emerald-500 text-white shadow-sm'
                                                        : 'hover:bg-slate-100 text-slate-700'
                                                        }`}
                                                    onClick={() => {
                                                        setSelectedList(list);
                                                        setListsExpanded(false);
                                                    }}
                                                    data-testid={`list-card-${list.id}`}
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`font-medium truncate text-sm leading-tight ${selectedList?.id === list.id ? 'text-white' : 'text-slate-800'}`}>
                                                            {list.name}
                                                        </p>
                                                        <p className={`text-[11px] truncate flex items-center gap-1 mt-0.5 ${selectedList?.id === list.id ? 'text-emerald-100' : 'text-slate-400'}`}>
                                                            <Store className="w-2.5 h-2.5 shrink-0" />
                                                            {list.supermarket_name}
                                                            <span className="ml-auto shrink-0">{list.items?.length || 0}</span>
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteList(list.id); }}
                                                        className={`ml-2 h-6 w-6 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ${selectedList?.id === list.id ? 'hover:bg-emerald-400 text-emerald-100' : 'hover:bg-rose-100 text-slate-400 hover:text-rose-600'}`}
                                                        data-testid={`delete-list-${list.id}`}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Vertical toggle bar when collapsed */}
                        {!listsExpanded && (
                            <div
                                onClick={() => setListsExpanded(true)}
                                className="flex flex-col items-center py-4 w-10 bg-white border-r border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors"
                            >
                                <ShoppingCart className="w-4 h-4 text-emerald-500 mb-8" />
                                <span
                                    className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap"
                                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                                >
                                    Mis Listas
                                </span>
                            </div>
                        )}

                        {/* List Detail Column */}
                        <div className="flex-1 min-w-0">
                            {selectedList ? (
                                <Card className="border-slate-200" data-testid="list-detail-card">
                                    <CardHeader className="border-b border-slate-100 pb-4">
                                        <div className="flex items-center justify-between flex-wrap gap-4">
                                            <div className="flex items-center gap-2 md:gap-3">
                                                <div>
                                                    <CardTitle className="text-base md:text-xl" style={{ fontFamily: 'Manrope, sans-serif' }}>{selectedList.name}</CardTitle>
                                                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                                        <Store className="w-4 h-4" />
                                                        {selectedList.supermarket_name}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        if (showEstimated) {
                                                            setShowEstimated(false);
                                                        } else {
                                                            setConfirmEstimateOpen(true);
                                                        }
                                                    }}
                                                    className={`gap-2 ${showEstimated ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 hover:text-indigo-800' : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'}`}
                                                    title="Calcular Precio Estimado (Usa Créditos)"
                                                >
                                                    {showEstimated ? <Eye className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                                                    <span className="hidden sm:inline">{showEstimated ? 'Ocultar Estimación' : 'Calcular Estimado'}</span>
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    onClick={handleResetList}
                                                    className="gap-2 text-slate-600 hover:text-slate-900"
                                                    title="Reiniciar precios y checks"
                                                >
                                                    <RefreshCcw className="w-4 h-4" />
                                                    <span className="hidden sm:inline">Reiniciar</span>
                                                </Button>
                                                <Dialog open={addItemDialogOpen} onOpenChange={setAddItemDialogOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white" data-testid="add-item-btn">
                                                            <Plus className="w-4 h-4" />
                                                            Añadir
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-h-[90vh] overflow-y-auto">
                                                        <DialogHeader>
                                                            <DialogTitle style={{ fontFamily: 'Manrope, sans-serif' }}>Añadir Producto</DialogTitle>
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
                                                                            .filter(p => sellableProducts.some(sp => sp.product_id === p.id && sp.supermarket_id === selectedList.supermarket_id))
                                                                            .map((p) => (
                                                                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                                            ))
                                                                        }
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>

                                                            {newItemProduct && (
                                                                <div className="space-y-2">
                                                                    <Label>2. Marca *</Label>
                                                                    <Select value={newItemBrand} onValueChange={setNewItemBrand}>
                                                                        <SelectTrigger data-testid="add-item-brand-select">
                                                                            <SelectValue placeholder="Selecciona marca" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {availableBrands.map((sp) => (
                                                                                <SelectItem key={sp.brand_id} value={sp.brand_id}>
                                                                                    {sp.brand_name}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            )}

                                                            {newItemBrand && (
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="space-y-2">
                                                                        <Label>3. Unidad *</Label>
                                                                        <Select value={newItemUnit} onValueChange={setNewItemUnit}>
                                                                            <SelectTrigger data-testid="add-item-unit-select">
                                                                                <SelectValue placeholder="Unidad" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                {availableUnits.map((u) => (
                                                                                    <SelectItem key={u.unit_id} value={u.unit_id}>
                                                                                        {u.unit_name}
                                                                                    </SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label>4. Cantidad</Label>
                                                                        <Input
                                                                            type="number"
                                                                            min="0.1"
                                                                            step="0.1"
                                                                            value={newItemQuantity}
                                                                            onChange={(e) => setNewItemQuantity(e.target.value)}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <Button
                                                                onClick={handleAddItem}
                                                                disabled={!newItemUnit}
                                                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                                                                data-testid="confirm-add-item-btn"
                                                            >
                                                                Añadir a la lista
                                                            </Button>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        {selectedList.items?.length === 0 ? (
                                            <div className="p-8 text-center">
                                                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                                <p className="text-slate-500">Lista vacía</p>
                                                <p className="text-sm text-slate-400">Añade productos para empezar</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="divide-y divide-slate-100">
                                                    {selectedList.items?.map((item, index) => (
                                                        <div
                                                            key={index}
                                                            className={`px-3 py-2 md:p-4 transition-colors flex flex-row items-center gap-3 md:gap-4 ${item.purchased ? 'bg-emerald-50/30 border-l-4 border-emerald-500' : 'hover:bg-slate-50/50 border-l-4 border-transparent'}`}
                                                            data-testid={`list-item-${index}`}
                                                        >
                                                            {/* Checkbox - Fixed width */}
                                                            <div className="shrink-0">
                                                                <Checkbox
                                                                    checked={item.purchased}
                                                                    onCheckedChange={(checked) => handleUpdateItem(index, { purchased: checked })}
                                                                    className="w-5 h-5 md:w-6 md:h-6 rounded-md data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                                                    data-testid={`item-checkbox-${index}`}
                                                                />
                                                            </div>

                                                            {/* Product Info - Flexible space */}
                                                            <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center justify-between gap-1">
                                                                <div className="flex-1 min-w-0">
                                                                    <h3 className={`font-bold text-[13px] md:text-base truncate ${item.purchased ? 'text-slate-400' : 'text-slate-900'}`}>
                                                                        {item.product_name}
                                                                    </h3>
                                                                    <p className="text-[9px] md:text-xs font-medium text-slate-400 uppercase tracking-tight md:tracking-wider truncate">
                                                                        {item.brand_name}
                                                                        <span className="md:hidden ml-2 px-1 bg-slate-100 rounded text-slate-500 lowercase font-bold">{item.unit_name}</span>
                                                                    </p>
                                                                </div>

                                                                {/* Desktop Estimated Price */}
                                                                <div className={`hidden md:flex flex-col items-center justify-center shrink-0 w-24 transition-opacity duration-300 ${showEstimated ? 'opacity-100' : 'opacity-0 select-none pointer-events-none'}`}>
                                                                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-0.5">Est.</span>
                                                                    <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100 flex items-center">
                                                                        {item.estimated_price ? `${item.estimated_price.toFixed(2)}€` : '-'}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Controls Section - All in one row for density */}
                                                            <div className="flex items-center gap-1.5 md:gap-4 shrink-0">
                                                                {/* Quantity */}
                                                                <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
                                                                    <Input
                                                                        type="number" min="0.1" step="0.1"
                                                                        value={item.quantity}
                                                                        onChange={(e) => updateLocalItem(index, { quantity: parseFloat(e.target.value) || 1 })}
                                                                        onBlur={() => saveList(selectedList.items)}
                                                                        className="h-7 w-[40px] md:w-[60px] text-[11px] md:text-sm text-center font-bold border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-1"
                                                                    />
                                                                    <span className="text-[9px] md:text-xs text-slate-400 pr-1.5 font-bold border-l border-slate-100 pl-1.5 uppercase">{item.unit_name.substring(0, 2)}</span>
                                                                </div>

                                                                {/* Real Price Input - Thin & horizontal focused */}
                                                                <div className="relative shrink-0 flex items-center">
                                                                    <Input
                                                                        type="number" min="0" step="0.01" placeholder="0.00"
                                                                        value={item.price || ""}
                                                                        onChange={(e) => updateLocalItem(index, { price: parseFloat(e.target.value) || null })}
                                                                        onBlur={() => saveList(selectedList.items)}
                                                                        className={`h-7 md:h-9 w-[55px] md:w-[90px] text-right pr-3.5 md:pr-6 font-mono text-[11px] md:text-sm shadow-sm transition-all rounded-lg
                                                                            ${item.price ? 'border-emerald-500 bg-emerald-50/50 font-bold text-emerald-800' : 'border-slate-200 bg-white placeholder:text-slate-300'}
                                                                            ${item.purchased && !item.price ? 'border-amber-300 bg-amber-50 ring-2 ring-amber-100 ring-offset-0' : ''}
                                                                            ${item.purchased && item.price ? 'bg-transparent shadow-none border-dashed' : ''}`}
                                                                    />
                                                                    <span className="absolute right-1 md:right-2.5 text-[8px] md:text-xs font-bold text-slate-400">€</span>
                                                                </div>

                                                                {/* Delete Icon */}
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleRemoveItem(index)}
                                                                    className="h-7 w-7 md:h-9 md:w-9 text-slate-300 hover:text-rose-600 hover:bg-rose-50 shrink-0"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Footer: Totals aligned precisely to card columns */}
                                                <div className="px-4 py-4 bg-slate-50 border-t border-slate-200">
                                                    <div className="flex items-center gap-4">

                                                        {/* Submit button — far left */}
                                                        <Button
                                                            onClick={() => setConfirmSubmitOpen(true)}
                                                            className="shrink-0 bg-slate-900 hover:bg-slate-800 text-white gap-1.5 h-10 md:h-9 text-[10px] md:text-xs rounded-xl md:rounded-lg transition-all shadow-md md:shadow-sm"
                                                            data-testid="submit-prices-btn"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4 md:w-3.5 md:h-3.5 flex-shrink-0" />
                                                            <span className="font-bold hidden sm:inline">Subir Precios</span>
                                                            <span className="sm:hidden font-bold">Subir</span>
                                                        </Button>

                                                        {/* Flex spacer pushes totals to exact right positions */}
                                                        <div className="flex-1" />

                                                        {/* Estimated total — same w-24 as center column in cards */}
                                                        <div className={`flex flex-col items-center justify-center shrink-0 w-auto md:w-24 transition-opacity duration-300 ${showEstimated ? 'opacity-100' : 'opacity-0 pointer-events-none select-none'}`}>
                                                            <span className="text-[9px] md:text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-0.5 flex items-center gap-0.5">
                                                                <Sparkles className="w-2 md:w-2.5 h-2 md:h-2.5" /> Est.
                                                            </span>
                                                            <span className="text-xs md:text-sm font-mono text-indigo-700 font-bold">
                                                                {selectedList.total_estimated?.toFixed(2) || '0.00'}€
                                                            </span>
                                                        </div>

                                                        {/* Real price total — same w-[90px] as price input in cards */}
                                                        <div className="flex flex-col items-end justify-center shrink-0 w-auto md:w-[90px]">
                                                            <span className="text-[9px] md:text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Total</span>
                                                            <span className="font-mono text-sm md:text-base font-bold text-emerald-600">
                                                                {selectedList.total_actual?.toFixed(2) || '0.00'}€
                                                            </span>
                                                        </div>

                                                        {/* Spacer matching the delete button column width in cards */}
                                                        <div className="hidden md:block w-9 shrink-0" />
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card className="border-slate-200">
                                    <CardContent className="p-12 text-center">
                                        <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-500 text-lg">Selecciona una lista</p>
                                        <p className="text-sm text-slate-400 mt-1">O crea una nueva para empezar</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </Layout>

            {/* ─── Confirm Estimate Dialog ─── */}
            <Dialog open={confirmEstimateOpen} onOpenChange={setConfirmEstimateOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-indigo-700" style={{ fontFamily: 'Manrope, sans-serif' }}>
                            <Sparkles className="w-5 h-5" />
                            Calcular Precio Estimado
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 flex gap-3">
                            <AlertTriangle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                            <div className="text-sm text-indigo-800 space-y-1.5">
                                <p className="font-semibold">Se estimarán los precios de <span className="underline">{selectedList?.name}</span></p>
                                <p>Cada producto consume <strong>1 crédito</strong> del sistema. Si el mercado cambia, tendrás que volver a calcular para obtener datos actualizados.</p>
                                <p className="text-indigo-600 font-medium">Total productos: {selectedList?.items?.length || 0} &rarr; <strong>{selectedList?.items?.length || 0} créditos</strong></p>
                            </div>
                        </div>
                        <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 flex gap-2 items-start">
                            <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-700">El precio estimado es un <strong>snapshot</strong> del último precio registrado por la comunidad. No se actualiza automáticamente.</p>
                        </div>
                        <div className="flex gap-2 pt-1">
                            <Button variant="outline" className="flex-1" onClick={() => setConfirmEstimateOpen(false)}>Cancelar</Button>
                            <Button
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                                onClick={handleConfirmEstimate}
                            >
                                <Sparkles className="w-4 h-4" />
                                Calcular ahora
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ─── Confirm Submit Prices Dialog ─── */}
            <Dialog open={confirmSubmitOpen} onOpenChange={setConfirmSubmitOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-emerald-700" style={{ fontFamily: 'Manrope, sans-serif' }}>
                            <CheckCircle2 className="w-5 h-5" />
                            Subir Precios a la Comunidad
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex gap-3">
                            <AlertTriangle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                            <div className="text-sm text-emerald-900 space-y-1.5">
                                <p className="font-semibold">Confirma antes de subir</p>
                                <p>Se enviarán los precios de los productos <strong>marcados como comprados</strong> con precio real registrado.</p>
                                <p>Estos datos ayudarán a la comunidad a tener estimaciones más precisas. ¡Gracias por contribuir!</p>
                            </div>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                            <p className="text-xs text-slate-500 font-medium mb-2">Resumen de la lista: <span className="font-bold">{selectedList?.name}</span></p>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Productos comprados con precio</span>
                                <span className="font-mono font-bold text-emerald-700">
                                    {selectedList?.items?.filter(i => i.purchased && i.price).length || 0}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                                <span className="text-slate-600">Total registrado</span>
                                <span className="font-mono font-bold text-emerald-700">{selectedList?.total_actual?.toFixed(2) || '0.00'} €</span>
                            </div>
                        </div>
                        <div className="flex gap-2 pt-1">
                            <Button variant="outline" className="flex-1" onClick={() => setConfirmSubmitOpen(false)}>Cancelar</Button>
                            <Button
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                                onClick={handleSubmitPrices}
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                Sí, subir precios
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ShoppingListPage;
