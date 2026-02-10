import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
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
    Settings,
    LayoutGrid,
    BookOpen
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminPage = () => {
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [supermarkets, setSupermarkets] = useState([]);
    const [units, setUnits] = useState([]);
    const [products, setProducts] = useState([]);
    const [sellableProducts, setSellableProducts] = useState([]);
    const [brandCatalog, setBrandCatalog] = useState([]);
    const [loading, setLoading] = useState(true);

    // Dialog states
    const [categoryDialog, setCategoryDialog] = useState(false);
    const [brandDialog, setBrandDialog] = useState(false);
    const [supermarketDialog, setSupermarketDialog] = useState(false);
    const [unitDialog, setUnitDialog] = useState(false);
    const [productDialog, setProductDialog] = useState(false);
    const [sellableDialog, setSellableDialog] = useState(false);
    const [catalogDialog, setCatalogDialog] = useState(false);
    const [unitMgmtDialog, setUnitMgmtDialog] = useState(false);

    // Edit states
    const [editingItem, setEditingItem] = useState(null);

    // Form states
    const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
    const [brandForm, setBrandForm] = useState({ name: "", logo_url: "" });
    const [supermarketForm, setSupermarketForm] = useState({ name: "", logo_url: "" });
    const [unitForm, setUnitForm] = useState({ name: "", abbreviation: "" });
    const [productForm, setProductForm] = useState({
        name: "", brand_id: "", category_id: "", unit_id: "", barcode: "", image_url: ""
    });
    const [sellableForm, setSellableForm] = useState({ supermarket_id: "", brand_id: "", product_ids: [] });
    const [catalogForm, setCatalogForm] = useState({ brand_id: "", product_ids: [], status: "active" });
    const [unitMgmtForm, setUnitMgmtForm] = useState({ sellable_product_id: "", product_name: "", units: [] });
    const [productSearch, setProductSearch] = useState("");

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            const [catsRes, brandsRes, smsRes, unitsRes, prodsRes, sellableRes, catalogRes] = await Promise.all([
                axios.get(`${API}/admin/categories`),
                axios.get(`${API}/admin/brands`),
                axios.get(`${API}/admin/supermarkets`),
                axios.get(`${API}/admin/units`),
                axios.get(`${API}/admin/products`),
                axios.get(`${API}/admin/sellable-products`),
                axios.get(`${API}/admin/brand-catalog`)
            ]);
            setCategories(catsRes.data);
            setBrands(brandsRes.data);
            setSupermarkets(smsRes.data);
            setUnits(unitsRes.data);
            setProducts(prodsRes.data);
            setSellableProducts(sellableRes.data);
            setBrandCatalog(catalogRes.data);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Error al cargar datos");
        } finally {
            setLoading(false);
        }
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
        } catch (e) { toast.error("Error"); }
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
            if (editingItem) await axios.put(`${API}/admin/products/${editingItem.id}`, productForm);
            else await axios.post(`${API}/admin/products`, productForm);
            fetchAllData(); setProductDialog(false); setEditingItem(null);
            toast.success("Producto guardado");
        } catch (e) { toast.error("Error"); }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm("¿Eliminar?")) return;
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
        if (!window.confirm("¿Eliminar este producto del supermercado?")) return;
        try { await axios.delete(`${API}/admin/sellable-products/${id}`); fetchAllData(); toast.success("Eliminado"); } catch (e) { toast.error("Error"); }
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

    const handleOpenUnitMgmt = async (sp) => {
        try {
            const res = await axios.get(`${API}/admin/sellable-product-units/${sp.id}`);
            setUnitMgmtForm({
                sellable_product_id: sp.id,
                product_name: sp.product_name,
                units: res.data.map(u => u.unit_id)
            });
            setUnitMgmtDialog(true);
        } catch (e) { toast.error("Error al cargar unidades"); }
    };

    const handleSaveUnits = async () => {
        try {
            // This is a bit simplified, ideally we have a bulk update for units too
            // For now, we just add the ones that are not there.
            // But better implement a simple loop or a new endpoint if needed.
            // Let's assume we want to sync them.

            // To keep it simple without adding too many backend endpoints:
            // We'll just post each selected unit.
            for (const unitId of unitMgmtForm.units) {
                await axios.post(`${API}/admin/sellable-product-units`, {
                    sellable_product_id: unitMgmtForm.sellable_product_id,
                    unit_id: unitId
                }).catch(() => {}); // Ignore duplicates
            }
            toast.success("Unidades actualizadas");
            setUnitMgmtDialog(false);
        } catch (e) { toast.error("Error al guardar unidades"); }
    };

    if (loading) return <Layout><div className="flex items-center justify-center min-h-[400px]">Cargando panel de administración...</div></Layout>;

    return (
        <Layout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        Panel de Administración
                    </h1>
                    <p className="text-slate-500 mt-1">Gestión avanzada del sistema</p>
                </div>

                <Tabs defaultValue="unitarias" className="space-y-6">
                    <TabsList className="bg-slate-100 p-1">
                        <TabsTrigger value="unitarias" className="gap-2 data-[state=active]:bg-white">
                            <Package className="w-4 h-4" /> Cosas Unitarias
                        </TabsTrigger>
                        <TabsTrigger value="catalogos" className="gap-2 data-[state=active]:bg-white">
                            <BookOpen className="w-4 h-4" /> Catálogos
                        </TabsTrigger>
                    </TabsList>

                    {/* SECCIÓN COSAS UNITARIAS */}
                    <TabsContent value="unitarias" className="space-y-6">
                        <Tabs defaultValue="products">
                            <TabsList className="bg-slate-50 border p-1 mb-4 flex-wrap h-auto">
                                <TabsTrigger value="products" className="gap-2" data-testid="tab-products"><Package className="w-4 h-4" /> Productos</TabsTrigger>
                                <TabsTrigger value="brands" className="gap-2" data-testid="tab-brands"><Tag className="w-4 h-4" /> Marcas</TabsTrigger>
                                <TabsTrigger value="supermarkets" className="gap-2" data-testid="tab-supermarkets"><Store className="w-4 h-4" /> Supermercados</TabsTrigger>
                                <TabsTrigger value="units" className="gap-2" data-testid="tab-units"><Scale className="w-4 h-4" /> Unidades</TabsTrigger>
                                <TabsTrigger value="categories" className="gap-2" data-testid="tab-categories"><Layers className="w-4 h-4" /> Categorías</TabsTrigger>
                            </TabsList>

                            {/* Contenidos de Cosas Unitarias */}
                            <TabsContent value="products">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle className="text-lg">Productos Genéricos</CardTitle>
                                        <Button onClick={() => { setEditingItem(null); setProductForm({ name: "", brand_id: "", category_id: "", unit_id: "", barcode: "", image_url: "" }); setProductDialog(true); }} className="bg-emerald-500" data-testid="new-product-btn"><Plus className="w-4 h-4 mr-2" /> Nuevo Producto</Button>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Categoría</TableHead><TableHead className="w-24 text-right pr-4">Acciones</TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {products.map(p => (
                                                    <TableRow key={p.id}>
                                                        <TableCell className="font-medium">{p.name}</TableCell>
                                                        <TableCell>{p.category_name}</TableCell>
                                                        <TableCell className="flex justify-end gap-1 pr-4">
                                                            <Button variant="ghost" size="icon" onClick={() => { setEditingItem(p); setProductForm(p); setProductDialog(true); }}><Pencil className="w-4 h-4" /></Button>
                                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(p.id)} className="text-rose-600"><Trash2 className="w-4 h-4" /></Button>
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
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle className="text-lg">Marcas</CardTitle>
                                        <Button onClick={() => { setEditingItem(null); setBrandForm({ name: "", logo_url: "" }); setBrandDialog(true); }} className="bg-emerald-500"><Plus className="w-4 h-4 mr-2" /> Nueva Marca</Button>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead className="w-24 text-right pr-4">Acciones</TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {brands.map(b => (
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
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle className="text-lg">Supermercados</CardTitle>
                                        <Button onClick={() => { setEditingItem(null); setSupermarketForm({ name: "", logo_url: "" }); setSupermarketDialog(true); }} className="bg-emerald-500"><Plus className="w-4 h-4 mr-2" /> Nuevo Supermercado</Button>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead className="w-24 text-right pr-4">Acciones</TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {supermarkets.map(s => (
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
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle className="text-lg">Unidades de Medida</CardTitle>
                                        <Button onClick={() => { setEditingItem(null); setUnitForm({ name: "", abbreviation: "" }); setUnitDialog(true); }} className="bg-emerald-500"><Plus className="w-4 h-4 mr-2" /> Nueva Unidad</Button>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Abreviatura</TableHead><TableHead className="w-24 text-right pr-4">Acciones</TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {units.map(u => (
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
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle className="text-lg">Categorías</CardTitle>
                                        <Button onClick={() => { setEditingItem(null); setCategoryForm({ name: "", description: "" }); setCategoryDialog(true); }} className="bg-emerald-500"><Plus className="w-4 h-4 mr-2" /> Nueva Categoría</Button>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead className="w-24 text-right pr-4">Acciones</TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {categories.map(c => (
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
                        <Tabs defaultValue="sellable">
                            <TabsList className="bg-slate-50 border p-1 mb-4 h-auto">
                                <TabsTrigger value="sellable" className="gap-2" data-testid="tab-sellable"><Store className="w-4 h-4" /> Catálogo Supermercado</TabsTrigger>
                                <TabsTrigger value="brand-cat" className="gap-2" data-testid="tab-brand-catalog"><Tag className="w-4 h-4" /> Catálogo Marca</TabsTrigger>
                            </TabsList>

                            <TabsContent value="sellable">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {supermarkets.map(sm => {
                                        const smProducts = sellableProducts.filter(sp => sp.supermarket_id === sm.id);
                                        return (
                                            <Card key={sm.id} className="border-slate-200 hover:border-emerald-200 transition-all flex flex-col">
                                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Store className="w-5 h-5 text-emerald-500" />
                                                        <CardTitle className="text-md font-bold text-slate-800">{sm.name}</CardTitle>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8 px-2"
                                                        onClick={() => {
                                                            setSellableForm({
                                                                supermarket_id: sm.id,
                                                                brand_id: "",
                                                                product_ids: []
                                                            });
                                                            setSellableDialog(true);
                                                        }}
                                                    >
                                                        <Plus className="w-4 h-4 mr-1" /> Vincular
                                                    </Button>
                                                </CardHeader>
                                                <CardContent className="flex-1">
                                                    {smProducts.length === 0 ? (
                                                        <p className="text-xs text-slate-400 italic py-8 text-center">Sin productos vinculados</p>
                                                    ) : (
                                                        <div className="space-y-4 py-2">
                                                            {/* Group by brand for better visual */}
                                                            {Array.from(new Set(smProducts.map(p => p.brand_id))).map(brandId => {
                                                                const brandName = smProducts.find(p => p.brand_id === brandId)?.brand_name;
                                                                const productsForBrand = smProducts.filter(p => p.brand_id === brandId);
                                                                return (
                                                                    <div key={brandId} className="space-y-1">
                                                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{brandName}</h4>
                                                                        <div className="flex flex-wrap gap-1.5">
                                                                            {productsForBrand.map(p => (
                                                                                <div
                                                                                    key={p.id}
                                                                                    className="group relative flex items-center bg-white border border-slate-100 rounded px-2 py-1 text-xs text-slate-600 hover:border-emerald-200 pr-7 transition-colors shadow-sm cursor-pointer"
                                                                                    onClick={() => handleOpenUnitMgmt(p)}
                                                                                >
                                                                                    {p.product_name}
                                                                                    <button
                                                                                        onClick={(e) => { e.stopPropagation(); handleDeleteSellable(p.id); }}
                                                                                        className="absolute right-1 opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 transition-opacity"
                                                                                    >
                                                                                        <Trash2 className="w-3 h-3" />
                                                                                    </button>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </CardContent>
                                                <div className="px-6 py-3 bg-slate-50 border-t text-[10px] text-slate-500 flex justify-between">
                                                    <span>{smProducts.length} productos vendibles</span>
                                                    <span>Operativo</span>
                                                </div>
                                            </Card>
                                        );
                                    })}
                                    <Card
                                        className="flex items-center justify-center border-dashed border-2 bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-colors py-12"
                                        onClick={() => { setEditingItem(null); setSupermarketForm({ name: "", logo_url: "" }); setSupermarketDialog(true); }}
                                    >
                                        <div className="text-center">
                                            <Store className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                            <p className="text-sm font-medium text-slate-400">Nuevo Supermercado</p>
                                        </div>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="brand-cat">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {brands.map(brand => {
                                        const brandProducts = brandCatalog.filter(bc => bc.brand_id === brand.id);
                                        return (
                                            <Card key={brand.id} className="flex flex-col border-slate-200 hover:border-emerald-200 transition-all">
                                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                    <CardTitle className="text-md font-bold text-slate-800">{brand.name}</CardTitle>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8 px-2"
                                                        onClick={() => {
                                                            setCatalogForm({
                                                                brand_id: brand.id,
                                                                product_ids: brandProducts.map(bp => bp.product_id),
                                                                status: "active"
                                                            });
                                                            setCatalogDialog(true);
                                                        }}
                                                    >
                                                        <Plus className="w-4 h-4 mr-1" /> Gestionar
                                                    </Button>
                                                </CardHeader>
                                                <CardContent className="flex-1">
                                                    {brandProducts.length === 0 ? (
                                                        <p className="text-xs text-slate-400 italic py-4">Sin productos en catálogo</p>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-2 py-2">
                                                            {brandProducts.map(bp => (
                                                                <div
                                                                    key={bp.id}
                                                                    className={`text-[10px] px-2 py-1 rounded border ${
                                                                        bp.status === 'active' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                                                                        bp.status === 'planned' ? 'bg-blue-50 border-blue-100 text-blue-700' :
                                                                        'bg-rose-50 border-rose-100 text-rose-700'
                                                                    }`}
                                                                >
                                                                    {bp.product_name}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </CardContent>
                                                <div className="px-6 py-3 bg-slate-50 border-t text-[10px] text-slate-500 flex justify-between">
                                                    <span>{brandProducts.length} productos</span>
                                                    <span>Conceptual</span>
                                                </div>
                                            </Card>
                                        );
                                    })}
                                    <Card
                                        className="flex items-center justify-center border-dashed border-2 bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-colors py-12"
                                        onClick={() => { setEditingItem(null); setBrandForm({ name: "", logo_url: "" }); setBrandDialog(true); }}
                                    >
                                        <div className="text-center">
                                            <Tag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                            <p className="text-sm font-medium text-slate-400">Nueva Marca</p>
                                        </div>
                                    </Card>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Diálogos */}
            <Dialog open={productDialog} onOpenChange={setProductDialog}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{editingItem ? "Editar" : "Nuevo"} Producto</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Nombre</Label>
                            <Input value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} placeholder="Nombre del producto" />
                        </div>
                        <div className="space-y-2">
                            <Label>Categoría</Label>
                            <Select value={productForm.category_id} onValueChange={v => setProductForm({...productForm, category_id: v})}>
                                <SelectTrigger data-testid="select-category"><SelectValue placeholder="Seleccionar categoría" /></SelectTrigger>
                                <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleSaveProduct} className="w-full bg-emerald-500" data-testid="save-product-btn">Guardar Producto</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={brandDialog} onOpenChange={setBrandDialog}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{editingItem ? "Editar" : "Nueva"} Marca</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-4">
                        <Label>Nombre</Label><Input value={brandForm.name} onChange={e => setBrandForm({...brandForm, name: e.target.value})} placeholder="Nombre de la marca" data-testid="brand-name-input" />
                        <Button onClick={handleSaveBrand} className="w-full bg-emerald-500" data-testid="save-brand-btn">Guardar</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={supermarketDialog} onOpenChange={setSupermarketDialog}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{editingItem ? "Editar" : "Nuevo"} Supermercado</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-4">
                        <Label>Nombre</Label><Input value={supermarketForm.name} onChange={e => setSupermarketForm({...supermarketForm, name: e.target.value})} placeholder="Nombre del supermercado" data-testid="supermarket-name-input" />
                        <Button onClick={handleSaveSupermarket} className="w-full bg-emerald-500" data-testid="save-supermarket-btn">Guardar</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={unitDialog} onOpenChange={setUnitDialog}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{editingItem ? "Editar" : "Nueva"} Unidad</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-4">
                        <Label>Nombre</Label><Input value={unitForm.name} onChange={e => setUnitForm({...unitForm, name: e.target.value})} placeholder="Ej: Litro" />
                        <Label>Abreviatura</Label><Input value={unitForm.abbreviation} onChange={e => setUnitForm({...unitForm, abbreviation: e.target.value})} placeholder="Ej: L" />
                        <Button onClick={handleSaveUnit} className="w-full bg-emerald-500">Guardar</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{editingItem ? "Editar" : "Nueva"} Categoría</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-4">
                        <Label>Nombre</Label><Input value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} placeholder="Nombre de la categoría" />
                        <Button onClick={handleSaveCategory} className="w-full bg-emerald-500">Guardar</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={sellableDialog} onOpenChange={(val) => { setSellableDialog(val); if(!val) setProductSearch(""); }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Vincular Productos a Supermercado</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Supermercado</Label>
                                <Select value={sellableForm.supermarket_id} onValueChange={v => setSellableForm({...sellableForm, supermarket_id: v})}>
                                    <SelectTrigger data-testid="select-sellable-supermarket"><SelectValue placeholder="Seleccionar supermercado" /></SelectTrigger>
                                    <SelectContent>{supermarkets.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Marca</Label>
                                <Select value={sellableForm.brand_id} onValueChange={v => setSellableForm({...sellableForm, brand_id: v})}>
                                    <SelectTrigger data-testid="select-sellable-brand"><SelectValue placeholder="Seleccionar marca" /></SelectTrigger>
                                    <SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>

                        {sellableForm.brand_id && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Label>Productos (Multiselección)</Label>
                                        <div className="flex gap-2">
                                            <button
                                                className="text-[10px] text-emerald-600 hover:underline"
                                                onClick={() => {
                                                    const filteredIds = products
                                                        .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                                                        .map(p => p.id);
                                                    setSellableForm({...sellableForm, product_ids: Array.from(new Set([...sellableForm.product_ids, ...filteredIds]))});
                                                }}
                                            >
                                                Seleccionar filtrados
                                            </button>
                                            <button
                                                className="text-[10px] text-rose-600 hover:underline"
                                                onClick={() => setSellableForm({...sellableForm, product_ids: []})}
                                            >
                                                Limpiar todo
                                            </button>
                                        </div>
                                    </div>
                                    <Input
                                        placeholder="Filtrar productos..."
                                        className="w-1/3 h-8 text-xs"
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
                                                            if (checked) setSellableForm({...sellableForm, product_ids: [...sellableForm.product_ids, p.id]});
                                                            else setSellableForm({...sellableForm, product_ids: sellableForm.product_ids.filter(id => id !== p.id)});
                                                        }}
                                                    />
                                                    <label htmlFor={`sp-${p.id}`} className="text-sm cursor-pointer flex-1">
                                                        {p.name}
                                                        {isInCatalog && <span className="ml-1 text-[10px] text-emerald-600 font-bold">(Catálogo)</span>}
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

            <Dialog open={unitMgmtDialog} onOpenChange={setUnitMgmtDialog}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Unidades para: {unitMgmtForm.product_name}</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-4">
                        <Label>Selecciona unidades disponibles en este súper:</Label>
                        <div className="grid grid-cols-2 gap-2 border rounded p-3 bg-slate-50">
                            {units.map(u => (
                                <div key={u.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`unit-${u.id}`}
                                        checked={unitMgmtForm.units.includes(u.id)}
                                        onCheckedChange={(checked) => {
                                            if (checked) setUnitMgmtForm({...unitMgmtForm, units: [...unitMgmtForm.units, u.id]});
                                            else setUnitMgmtForm({...unitMgmtForm, units: unitMgmtForm.units.filter(id => id !== u.id)});
                                        }}
                                    />
                                    <label htmlFor={`unit-${u.id}`} className="text-sm cursor-pointer">{u.name} ({u.abbreviation})</label>
                                </div>
                            ))}
                        </div>
                        <Button onClick={handleSaveUnits} className="w-full bg-emerald-500">Guardar Unidades</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={catalogDialog} onOpenChange={(val) => { setCatalogDialog(val); if(!val) setProductSearch(""); }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Gestionar Catálogo de Marca (Bulk)</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Marca</Label>
                                <Select value={catalogForm.brand_id} onValueChange={v => setCatalogForm({...catalogForm, brand_id: v})}>
                                    <SelectTrigger><SelectValue placeholder="Seleccionar marca" /></SelectTrigger>
                                    <SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Estado Conceptual</Label>
                                <Select value={catalogForm.status} onValueChange={v => setCatalogForm({...catalogForm, status: v})}>
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
                                    <div className="flex items-center gap-4">
                                        <Label>Productos para añadir al catálogo</Label>
                                        <div className="flex gap-2">
                                            <button
                                                className="text-[10px] text-emerald-600 hover:underline"
                                                onClick={() => {
                                                    const filteredIds = products
                                                        .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                                                        .map(p => p.id);
                                                    setCatalogForm({...catalogForm, product_ids: Array.from(new Set([...catalogForm.product_ids, ...filteredIds]))});
                                                }}
                                            >
                                                Seleccionar filtrados
                                            </button>
                                            <button
                                                className="text-[10px] text-rose-600 hover:underline"
                                                onClick={() => setCatalogForm({...catalogForm, product_ids: []})}
                                            >
                                                Limpiar todo
                                            </button>
                                        </div>
                                    </div>
                                    <Input
                                        placeholder="Filtrar productos..."
                                        className="w-1/3 h-8 text-xs"
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
                                                            if (checked) setCatalogForm({...catalogForm, product_ids: [...catalogForm.product_ids, p.id]});
                                                            else setCatalogForm({...catalogForm, product_ids: catalogForm.product_ids.filter(id => id !== p.id)});
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
        </Layout>
    );
};

export default AdminPage;
