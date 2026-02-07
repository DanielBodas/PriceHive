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
    Upload,
    Store,
    Package,
    Calculator
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ShoppingListPage = () => {
    const [lists, setLists] = useState([]);
    const [products, setProducts] = useState([]);
    const [supermarkets, setSupermarkets] = useState([]);
    const [units, setUnits] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedList, setSelectedList] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);

    // New list form
    const [newListName, setNewListName] = useState("");
    const [newListSupermarket, setNewListSupermarket] = useState("");

    // New item form - solo producto obligatorio inicialmente
    const [newItemProduct, setNewItemProduct] = useState("");
    const [newItemQuantity, setNewItemQuantity] = useState("1");
    const [newItemUnit, setNewItemUnit] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [listsRes, productsRes, supermarketsRes, unitsRes, brandsRes] = await Promise.all([
                axios.get(`${API}/shopping-lists`),
                axios.get(`${API}/public/products`),
                axios.get(`${API}/public/supermarkets`),
                axios.get(`${API}/admin/units`),
                axios.get(`${API}/admin/brands`)
            ]);
            setLists(listsRes.data);
            setProducts(productsRes.data);
            setSupermarkets(supermarketsRes.data);
            setUnits(unitsRes.data);
            setBrands(brandsRes.data);
            
            // Set default unit if available
            if (unitsRes.data.length > 0) {
                setNewItemUnit(unitsRes.data[0].id);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
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
        if (!newItemProduct) {
            toast.error("Selecciona un producto");
            return;
        }
        
        // Get product info for default values
        const product = products.find(p => p.id === newItemProduct);
        const defaultUnit = newItemUnit || (units.length > 0 ? units[0].id : "");
        
        try {
            const currentItems = selectedList.items.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                unit_id: item.unit_id,
                price: item.price,
                purchased: item.purchased,
                brand_id: item.brand_id
            }));
            
            const newItem = {
                product_id: newItemProduct,
                quantity: parseFloat(newItemQuantity) || 1,
                unit_id: defaultUnit,
                price: null,
                purchased: false,
                brand_id: product?.brand_id || null
            };

            const response = await axios.put(`${API}/shopping-lists/${selectedList.id}`, {
                items: [...currentItems, newItem]
            });
            
            setSelectedList(response.data);
            setLists(lists.map(l => l.id === selectedList.id ? response.data : l));
            setNewItemProduct("");
            setNewItemQuantity("1");
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
            // Map items to the format expected by the backend (stripping extra fields)
            const cleanedItems = itemsToSave.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                unit_id: item.unit_id,
                price: item.price,
                purchased: item.purchased,
                brand_id: item.brand_id
            }));

            const response = await axios.put(`${API}/shopping-lists/${selectedList.id}`, {
                items: cleanedItems
            });
            
            // Only update backend metadata, keep local items to avoid input jumping
            // or update everything if we want to sync
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
                product_id: item.product_id,
                quantity: item.quantity,
                unit_id: item.unit_id,
                price: item.price,
                purchased: item.purchased,
                brand_id: item.brand_id
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
        try {
            const response = await axios.post(`${API}/shopping-lists/${selectedList.id}/submit-prices`);
            toast.success(response.data.message);
        } catch (error) {
            toast.error("Error al subir precios");
        }
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

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Lists Column */}
                    <div className="lg:col-span-1 space-y-4">
                        <h2 className="font-semibold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>Mis Listas</h2>
                        {loading ? (
                            <div className="text-slate-500">Cargando...</div>
                        ) : lists.length === 0 ? (
                            <Card className="border-slate-200">
                                <CardContent className="p-6 text-center">
                                    <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500">No tienes listas</p>
                                    <p className="text-sm text-slate-400">Crea una para empezar</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-2">
                                {lists.map((list) => (
                                    <Card 
                                        key={list.id}
                                        className={`border cursor-pointer transition-all ${
                                            selectedList?.id === list.id 
                                                ? 'border-emerald-500 bg-emerald-50' 
                                                : 'border-slate-200 hover:border-emerald-300'
                                        }`}
                                        onClick={() => setSelectedList(list)}
                                        data-testid={`list-card-${list.id}`}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-medium text-slate-900">{list.name}</p>
                                                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                                        <Store className="w-3 h-3" />
                                                        {list.supermarket_name}
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteList(list.id);
                                                    }}
                                                    className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                                    data-testid={`delete-list-${list.id}`}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                                                <span>{list.items?.length || 0} productos</span>
                                                <span className="font-mono">Est: {list.total_estimated?.toFixed(2) || '0.00'} €</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* List Detail Column */}
                    <div className="lg:col-span-2">
                        {selectedList ? (
                            <Card className="border-slate-200" data-testid="list-detail-card">
                                <CardHeader className="border-b border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle style={{ fontFamily: 'Manrope, sans-serif' }}>{selectedList.name}</CardTitle>
                                            <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                                <Store className="w-4 h-4" />
                                                {selectedList.supermarket_name}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Dialog open={addItemDialogOpen} onOpenChange={setAddItemDialogOpen}>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" className="gap-2" data-testid="add-item-btn">
                                                        <Plus className="w-4 h-4" />
                                                        Añadir
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle style={{ fontFamily: 'Manrope, sans-serif' }}>Añadir Producto</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="space-y-4 pt-4">
                                                        <div className="space-y-2">
                                                            <Label>Producto *</Label>
                                                            <Select value={newItemProduct} onValueChange={setNewItemProduct}>
                                                                <SelectTrigger data-testid="add-item-product-select">
                                                                    <SelectValue placeholder="Selecciona producto" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {products.map((p) => (
                                                                        <SelectItem key={p.id} value={p.id}>
                                                                            {p.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <p className="text-xs text-slate-400">
                                                                Puedes cambiar marca, cantidad y precio en la lista
                                                            </p>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label>Cantidad inicial</Label>
                                                                <Input
                                                                    type="number"
                                                                    min="0.1"
                                                                    step="0.1"
                                                                    value={newItemQuantity}
                                                                    onChange={(e) => setNewItemQuantity(e.target.value)}
                                                                    data-testid="add-item-quantity-input"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Unidad</Label>
                                                                <Select value={newItemUnit} onValueChange={setNewItemUnit}>
                                                                    <SelectTrigger data-testid="add-item-unit-select">
                                                                        <SelectValue placeholder="Unidad" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {units.map((u) => (
                                                                            <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                        <Button onClick={handleAddItem} className="w-full bg-emerald-500 hover:bg-emerald-600" data-testid="confirm-add-item-btn">
                                                            Añadir Producto
                                                        </Button>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                            <Button 
                                                onClick={handleSubmitPrices}
                                                className="bg-emerald-500 hover:bg-emerald-600 gap-2"
                                                data-testid="submit-prices-btn"
                                            >
                                                <Upload className="w-4 h-4" />
                                                Subir Precios
                                            </Button>
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
                                            {/* Table Header */}
                                            <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200 text-xs font-medium text-slate-500 uppercase">
                                                <div className="col-span-1"></div>
                                                <div className="col-span-3">Producto</div>
                                                <div className="col-span-2">Marca</div>
                                                <div className="col-span-2">Cantidad</div>
                                                <div className="col-span-1 text-center">Est.</div>
                                                <div className="col-span-2 text-center">Precio €</div>
                                                <div className="col-span-1"></div>
                                            </div>
                                            
                                            <div className="divide-y divide-slate-100">
                                                {selectedList.items?.map((item, index) => (
                                                    <div 
                                                        key={index} 
                                                        className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-slate-50 transition-colors" 
                                                        data-testid={`list-item-${index}`}
                                                    >
                                                        {/* Checkbox */}
                                                        <div className="col-span-1">
                                                            <Checkbox
                                                                checked={item.purchased}
                                                                onCheckedChange={(checked) => handleUpdateItem(index, { purchased: checked })}
                                                                data-testid={`item-checkbox-${index}`}
                                                            />
                                                        </div>
                                                        
                                                        {/* Producto (solo lectura) */}
                                                        <div className="col-span-3">
                                                            <p className={`font-medium text-sm ${item.purchased ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                                                {item.product_name}
                                                            </p>
                                                        </div>
                                                        
                                                        {/* Marca (editable) */}
                                                        <div className="col-span-2">
                                                            <Select 
                                                                value={item.brand_id || ""} 
                                                                onValueChange={(value) => handleUpdateItem(index, { brand_id: value || null })}
                                                            >
                                                                <SelectTrigger className="h-8 text-xs" data-testid={`item-brand-select-${index}`}>
                                                                    <SelectValue placeholder="-" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {brands.map((b) => (
                                                                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        
                                                        {/* Cantidad (editable) */}
                                                        <div className="col-span-2 flex items-center gap-1">
                                                            <Input
                                                                type="number"
                                                                min="0.1"
                                                                step="0.1"
                                                                value={item.quantity}
                                                                onChange={(e) => handleUpdateItem(index, { quantity: parseFloat(e.target.value) || 1 })}
                                                                className="h-8 w-16 text-xs font-mono"
                                                                data-testid={`item-quantity-input-${index}`}
                                                            />
                                                            <span className="text-xs text-slate-500">{item.unit_name}</span>
                                                        </div>
                                                        
                                                        {/* Precio Estimado */}
                                                        <div className="col-span-1 text-center">
                                                            {item.estimated_price ? (
                                                                <span className="font-mono text-xs text-slate-500">
                                                                    {item.estimated_price.toFixed(2)}€
                                                                </span>
                                                            ) : (
                                                                <span className="text-xs text-slate-300">-</span>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Precio Real (editable) */}
                                                        <div className="col-span-2">
                                                            <div className="relative">
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    placeholder="0.00"
                                                                    value={item.price || ""}
                                                                    onChange={(e) => handleUpdateItem(index, { price: parseFloat(e.target.value) || null })}
                                                                    className="h-8 text-sm font-mono pr-6"
                                                                    data-testid={`item-price-input-${index}`}
                                                                />
                                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm">€</span>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Eliminar */}
                                                        <div className="col-span-1 text-right">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleRemoveItem(index)}
                                                                className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                                                data-testid={`remove-item-${index}`}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            {/* Totals */}
                                            <div className="p-4 bg-slate-50 border-t border-slate-200">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <Calculator className="w-5 h-5" />
                                                        <span className="font-medium">Totales</span>
                                                    </div>
                                                    <div className="flex items-center gap-8">
                                                        <div className="text-right">
                                                            <p className="text-xs text-slate-400">Estimado</p>
                                                            <p className="font-mono font-semibold text-slate-600">
                                                                {selectedList.total_estimated?.toFixed(2) || '0.00'} €
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs text-slate-400">Real</p>
                                                            <p className="font-mono font-semibold text-lg text-emerald-600">
                                                                {selectedList.total_actual?.toFixed(2) || '0.00'} €
                                                            </p>
                                                        </div>
                                                    </div>
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
    );
};

export default ShoppingListPage;
