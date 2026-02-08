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
    const [sellableForm, setSellableForm] = useState({ supermarket_id: "", product_id: "", brand_id: "" });
    const [catalogForm, setCatalogForm] = useState({ brand_id: "", product_id: "", status: "active" });

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
            const res = await axios.post(`${API}/admin/sellable-products`, sellableForm);
            if (res.data.warning) toast.warning(res.data.warning, { duration: 5000 });
            else toast.success("Producto vinculado correctamente");
            fetchAllData(); setSellableDialog(false); setSellableForm({ supermarket_id: "", product_id: "", brand_id: "" });
        } catch (e) { toast.error("Error al vincular"); }
    };

    const handleDeleteSellable = async (id) => {
        if (!window.confirm("¿Eliminar este producto del supermercado?")) return;
        try { await axios.delete(`${API}/admin/sellable-products/${id}`); fetchAllData(); toast.success("Eliminado"); } catch (e) { toast.error("Error"); }
    };

    const handleSaveCatalog = async () => {
        try {
            await axios.post(`${API}/admin/brand-catalog`, catalogForm);
            toast.success("Catálogo de marca actualizado");
            fetchAllData(); setCatalogDialog(false); setCatalogForm({ brand_id: "", product_id: "", status: "active" });
        } catch (e) { toast.error("Error al actualizar catálogo"); }
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
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle className="text-lg">Productos por Supermercado (Operativo)</CardTitle>
                                        <Button onClick={() => setSellableDialog(true)} className="bg-emerald-500" data-testid="new-sellable-btn"><Plus className="w-4 h-4 mr-2" /> Vincular Producto</Button>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader><TableRow><TableHead>Supermercado</TableHead><TableHead>Producto</TableHead><TableHead>Marca</TableHead><TableHead className="w-24 text-right pr-4">Acciones</TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {sellableProducts.map(sp => (
                                                    <TableRow key={sp.id}>
                                                        <TableCell className="font-medium">{sp.supermarket_name}</TableCell>
                                                        <TableCell>{sp.product_name}</TableCell>
                                                        <TableCell>{sp.brand_name}</TableCell>
                                                        <TableCell className="text-right pr-4">
                                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteSellable(sp.id)} className="text-rose-600"><Trash2 className="w-4 h-4" /></Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="brand-cat">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle className="text-lg">Catálogo Conceptual de Marca</CardTitle>
                                        <Button onClick={() => setCatalogDialog(true)} className="bg-emerald-500"><Plus className="w-4 h-4 mr-2" /> Actualizar Estado</Button>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader><TableRow><TableHead>Marca</TableHead><TableHead>Producto</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {brandCatalog.map(bc => (
                                                    <TableRow key={bc.id}>
                                                        <TableCell className="font-medium">{bc.brand_name}</TableCell>
                                                        <TableCell>{bc.product_name}</TableCell>
                                                        <TableCell>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                bc.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                                bc.status === 'planned' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
                                                            }`}>{bc.status}</span>
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

            <Dialog open={sellableDialog} onOpenChange={setSellableDialog}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Vincular Producto a Supermercado</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Supermercado</Label>
                            <Select value={sellableForm.supermarket_id} onValueChange={v => setSellableForm({...sellableForm, supermarket_id: v})}>
                                <SelectTrigger data-testid="select-sellable-supermarket"><SelectValue placeholder="Seleccionar supermercado" /></SelectTrigger>
                                <SelectContent>{supermarkets.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Producto</Label>
                            <Select value={sellableForm.product_id} onValueChange={v => setSellableForm({...sellableForm, product_id: v})}>
                                <SelectTrigger data-testid="select-sellable-product"><SelectValue placeholder="Seleccionar producto genérico" /></SelectTrigger>
                                <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Marca</Label>
                            <Select value={sellableForm.brand_id} onValueChange={v => setSellableForm({...sellableForm, brand_id: v})}>
                                <SelectTrigger data-testid="select-sellable-brand"><SelectValue placeholder="Seleccionar marca" /></SelectTrigger>
                                <SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        {sellableForm.brand_id && sellableForm.product_id && (
                            <div className={`p-2 rounded text-xs border ${brandCatalog.find(bc => bc.brand_id === sellableForm.brand_id && bc.product_id === sellableForm.product_id)?.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                Estado en catálogo de marca: {brandCatalog.find(bc => bc.brand_id === sellableForm.brand_id && bc.product_id === sellableForm.product_id)?.status || "No listado"}
                            </div>
                        )}
                        <Button onClick={handleSaveSellable} className="w-full bg-emerald-500 mt-4" data-testid="save-sellable-btn">Guardar Vinculación</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={catalogDialog} onOpenChange={setCatalogDialog}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Gestionar Catálogo de Marca</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Marca</Label>
                            <Select value={catalogForm.brand_id} onValueChange={v => setCatalogForm({...catalogForm, brand_id: v})}>
                                <SelectTrigger><SelectValue placeholder="Seleccionar marca" /></SelectTrigger>
                                <SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Producto</Label>
                            <Select value={catalogForm.product_id} onValueChange={v => setCatalogForm({...catalogForm, product_id: v})}>
                                <SelectTrigger><SelectValue placeholder="Seleccionar producto" /></SelectTrigger>
                                <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
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
                        <Button onClick={handleSaveCatalog} className="w-full bg-emerald-500 mt-4">Actualizar Catálogo</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Layout>
    );
};

export default AdminPage;
