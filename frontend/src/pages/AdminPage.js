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
    Settings, 
    Plus, 
    Pencil, 
    Trash2,
    Package,
    Tag,
    Store,
    Layers,
    Scale
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminPage = () => {
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [supermarkets, setSupermarkets] = useState([]);
    const [units, setUnits] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Dialog states
    const [categoryDialog, setCategoryDialog] = useState(false);
    const [brandDialog, setBrandDialog] = useState(false);
    const [supermarketDialog, setSupermarketDialog] = useState(false);
    const [unitDialog, setUnitDialog] = useState(false);
    const [productDialog, setProductDialog] = useState(false);

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

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            const [catsRes, brandsRes, smsRes, unitsRes, prodsRes] = await Promise.all([
                axios.get(`${API}/admin/categories`),
                axios.get(`${API}/admin/brands`),
                axios.get(`${API}/admin/supermarkets`),
                axios.get(`${API}/admin/units`),
                axios.get(`${API}/admin/products`)
            ]);
            setCategories(catsRes.data);
            setBrands(brandsRes.data);
            setSupermarkets(smsRes.data);
            setUnits(unitsRes.data);
            setProducts(prodsRes.data);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Error al cargar datos");
        } finally {
            setLoading(false);
        }
    };

    // Category CRUD
    const handleSaveCategory = async () => {
        try {
            if (editingItem) {
                await axios.put(`${API}/admin/categories/${editingItem.id}`, categoryForm);
                toast.success("Categoría actualizada");
            } else {
                await axios.post(`${API}/admin/categories`, categoryForm);
                toast.success("Categoría creada");
            }
            fetchAllData();
            setCategoryDialog(false);
            setCategoryForm({ name: "", description: "" });
            setEditingItem(null);
        } catch (error) {
            toast.error("Error al guardar categoría");
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm("¿Eliminar esta categoría?")) return;
        try {
            await axios.delete(`${API}/admin/categories/${id}`);
            toast.success("Categoría eliminada");
            fetchAllData();
        } catch (error) {
            toast.error("Error al eliminar");
        }
    };

    // Brand CRUD
    const handleSaveBrand = async () => {
        try {
            if (editingItem) {
                await axios.put(`${API}/admin/brands/${editingItem.id}`, brandForm);
                toast.success("Marca actualizada");
            } else {
                await axios.post(`${API}/admin/brands`, brandForm);
                toast.success("Marca creada");
            }
            fetchAllData();
            setBrandDialog(false);
            setBrandForm({ name: "", logo_url: "" });
            setEditingItem(null);
        } catch (error) {
            toast.error("Error al guardar marca");
        }
    };

    const handleDeleteBrand = async (id) => {
        if (!window.confirm("¿Eliminar esta marca?")) return;
        try {
            await axios.delete(`${API}/admin/brands/${id}`);
            toast.success("Marca eliminada");
            fetchAllData();
        } catch (error) {
            toast.error("Error al eliminar");
        }
    };

    // Supermarket CRUD
    const handleSaveSupermarket = async () => {
        try {
            if (editingItem) {
                await axios.put(`${API}/admin/supermarkets/${editingItem.id}`, supermarketForm);
                toast.success("Supermercado actualizado");
            } else {
                await axios.post(`${API}/admin/supermarkets`, supermarketForm);
                toast.success("Supermercado creado");
            }
            fetchAllData();
            setSupermarketDialog(false);
            setSupermarketForm({ name: "", logo_url: "" });
            setEditingItem(null);
        } catch (error) {
            toast.error("Error al guardar supermercado");
        }
    };

    const handleDeleteSupermarket = async (id) => {
        if (!window.confirm("¿Eliminar este supermercado?")) return;
        try {
            await axios.delete(`${API}/admin/supermarkets/${id}`);
            toast.success("Supermercado eliminado");
            fetchAllData();
        } catch (error) {
            toast.error("Error al eliminar");
        }
    };

    // Unit CRUD
    const handleSaveUnit = async () => {
        try {
            if (editingItem) {
                await axios.put(`${API}/admin/units/${editingItem.id}`, unitForm);
                toast.success("Unidad actualizada");
            } else {
                await axios.post(`${API}/admin/units`, unitForm);
                toast.success("Unidad creada");
            }
            fetchAllData();
            setUnitDialog(false);
            setUnitForm({ name: "", abbreviation: "" });
            setEditingItem(null);
        } catch (error) {
            toast.error("Error al guardar unidad");
        }
    };

    const handleDeleteUnit = async (id) => {
        if (!window.confirm("¿Eliminar esta unidad?")) return;
        try {
            await axios.delete(`${API}/admin/units/${id}`);
            toast.success("Unidad eliminada");
            fetchAllData();
        } catch (error) {
            toast.error("Error al eliminar");
        }
    };

    // Product CRUD
    const handleSaveProduct = async () => {
        try {
            if (editingItem) {
                await axios.put(`${API}/admin/products/${editingItem.id}`, productForm);
                toast.success("Producto actualizado");
            } else {
                await axios.post(`${API}/admin/products`, productForm);
                toast.success("Producto creado");
            }
            fetchAllData();
            setProductDialog(false);
            setProductForm({ name: "", brand_id: "", category_id: "", unit_id: "", barcode: "", image_url: "" });
            setEditingItem(null);
        } catch (error) {
            toast.error("Error al guardar producto");
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm("¿Eliminar este producto?")) return;
        try {
            await axios.delete(`${API}/admin/products/${id}`);
            toast.success("Producto eliminado");
            fetchAllData();
        } catch (error) {
            toast.error("Error al eliminar");
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <p className="text-slate-500">Cargando panel de administración...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6" data-testid="admin-page">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        Panel de Administración
                    </h1>
                    <p className="text-slate-500 mt-1">Gestiona los datos base del sistema</p>
                </div>

                <Tabs defaultValue="products" className="space-y-6">
                    <TabsList className="bg-slate-100 p-1">
                        <TabsTrigger value="products" className="gap-2 data-[state=active]:bg-white">
                            <Package className="w-4 h-4" /> Productos
                        </TabsTrigger>
                        <TabsTrigger value="categories" className="gap-2 data-[state=active]:bg-white">
                            <Layers className="w-4 h-4" /> Categorías
                        </TabsTrigger>
                        <TabsTrigger value="brands" className="gap-2 data-[state=active]:bg-white">
                            <Tag className="w-4 h-4" /> Marcas
                        </TabsTrigger>
                        <TabsTrigger value="supermarkets" className="gap-2 data-[state=active]:bg-white">
                            <Store className="w-4 h-4" /> Supermercados
                        </TabsTrigger>
                        <TabsTrigger value="units" className="gap-2 data-[state=active]:bg-white">
                            <Scale className="w-4 h-4" /> Unidades
                        </TabsTrigger>
                    </TabsList>

                    {/* Products Tab */}
                    <TabsContent value="products">
                        <Card className="border-slate-200">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100">
                                <CardTitle style={{ fontFamily: 'Manrope, sans-serif' }}>Productos</CardTitle>
                                <Dialog open={productDialog} onOpenChange={setProductDialog}>
                                    <DialogTrigger asChild>
                                        <Button 
                                            className="bg-emerald-500 hover:bg-emerald-600 gap-2"
                                            onClick={() => {
                                                setEditingItem(null);
                                                setProductForm({ name: "", brand_id: "", category_id: "", unit_id: "", barcode: "", image_url: "" });
                                            }}
                                            data-testid="add-product-btn"
                                        >
                                            <Plus className="w-4 h-4" /> Añadir Producto
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-lg">
                                        <DialogHeader>
                                            <DialogTitle>{editingItem ? "Editar" : "Nuevo"} Producto</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 pt-4">
                                            <div className="space-y-2">
                                                <Label>Nombre</Label>
                                                <Input
                                                    value={productForm.name}
                                                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                                    placeholder="Nombre del producto"
                                                    data-testid="product-name-input"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Marca</Label>
                                                    <Select value={productForm.brand_id} onValueChange={(v) => setProductForm({ ...productForm, brand_id: v })}>
                                                        <SelectTrigger data-testid="product-brand-select">
                                                            <SelectValue placeholder="Seleccionar" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {brands.map((b) => (
                                                                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Categoría</Label>
                                                    <Select value={productForm.category_id} onValueChange={(v) => setProductForm({ ...productForm, category_id: v })}>
                                                        <SelectTrigger data-testid="product-category-select">
                                                            <SelectValue placeholder="Seleccionar" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {categories.map((c) => (
                                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Unidad</Label>
                                                    <Select value={productForm.unit_id} onValueChange={(v) => setProductForm({ ...productForm, unit_id: v })}>
                                                        <SelectTrigger data-testid="product-unit-select">
                                                            <SelectValue placeholder="Seleccionar" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {units.map((u) => (
                                                                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Código de barras</Label>
                                                    <Input
                                                        value={productForm.barcode}
                                                        onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
                                                        placeholder="Opcional"
                                                        data-testid="product-barcode-input"
                                                    />
                                                </div>
                                            </div>
                                            <Button onClick={handleSaveProduct} className="w-full bg-emerald-500 hover:bg-emerald-600" data-testid="save-product-btn">
                                                Guardar Producto
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead>Marca</TableHead>
                                            <TableHead>Categoría</TableHead>
                                            <TableHead>Unidad</TableHead>
                                            <TableHead className="w-24">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {products.map((product) => (
                                            <TableRow key={product.id} data-testid={`product-row-${product.id}`}>
                                                <TableCell className="font-medium">{product.name}</TableCell>
                                                <TableCell>{product.brand_name}</TableCell>
                                                <TableCell>{product.category_name}</TableCell>
                                                <TableCell>{product.unit_name}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                setEditingItem(product);
                                                                setProductForm({
                                                                    name: product.name,
                                                                    brand_id: product.brand_id,
                                                                    category_id: product.category_id,
                                                                    unit_id: product.unit_id,
                                                                    barcode: product.barcode || "",
                                                                    image_url: product.image_url || ""
                                                                });
                                                                setProductDialog(true);
                                                            }}
                                                            data-testid={`edit-product-${product.id}`}
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeleteProduct(product.id)}
                                                            className="text-rose-600 hover:bg-rose-50"
                                                            data-testid={`delete-product-${product.id}`}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {products.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                                    No hay productos. Añade el primero.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Categories Tab */}
                    <TabsContent value="categories">
                        <Card className="border-slate-200">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100">
                                <CardTitle style={{ fontFamily: 'Manrope, sans-serif' }}>Categorías</CardTitle>
                                <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
                                    <DialogTrigger asChild>
                                        <Button 
                                            className="bg-emerald-500 hover:bg-emerald-600 gap-2"
                                            onClick={() => {
                                                setEditingItem(null);
                                                setCategoryForm({ name: "", description: "" });
                                            }}
                                            data-testid="add-category-btn"
                                        >
                                            <Plus className="w-4 h-4" /> Añadir Categoría
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>{editingItem ? "Editar" : "Nueva"} Categoría</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 pt-4">
                                            <div className="space-y-2">
                                                <Label>Nombre</Label>
                                                <Input
                                                    value={categoryForm.name}
                                                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                                    placeholder="Nombre de la categoría"
                                                    data-testid="category-name-input"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Descripción</Label>
                                                <Input
                                                    value={categoryForm.description}
                                                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                                                    placeholder="Descripción opcional"
                                                    data-testid="category-description-input"
                                                />
                                            </div>
                                            <Button onClick={handleSaveCategory} className="w-full bg-emerald-500 hover:bg-emerald-600" data-testid="save-category-btn">
                                                Guardar
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead>Descripción</TableHead>
                                            <TableHead className="w-24">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {categories.map((cat) => (
                                            <TableRow key={cat.id}>
                                                <TableCell className="font-medium">{cat.name}</TableCell>
                                                <TableCell className="text-slate-500">{cat.description || "-"}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                setEditingItem(cat);
                                                                setCategoryForm({ name: cat.name, description: cat.description || "" });
                                                                setCategoryDialog(true);
                                                            }}
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeleteCategory(cat.id)}
                                                            className="text-rose-600 hover:bg-rose-50"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {categories.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                                                    No hay categorías.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Brands Tab */}
                    <TabsContent value="brands">
                        <Card className="border-slate-200">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100">
                                <CardTitle style={{ fontFamily: 'Manrope, sans-serif' }}>Marcas</CardTitle>
                                <Dialog open={brandDialog} onOpenChange={setBrandDialog}>
                                    <DialogTrigger asChild>
                                        <Button 
                                            className="bg-emerald-500 hover:bg-emerald-600 gap-2"
                                            onClick={() => {
                                                setEditingItem(null);
                                                setBrandForm({ name: "", logo_url: "" });
                                            }}
                                            data-testid="add-brand-btn"
                                        >
                                            <Plus className="w-4 h-4" /> Añadir Marca
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>{editingItem ? "Editar" : "Nueva"} Marca</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 pt-4">
                                            <div className="space-y-2">
                                                <Label>Nombre</Label>
                                                <Input
                                                    value={brandForm.name}
                                                    onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                                                    placeholder="Nombre de la marca"
                                                    data-testid="brand-name-input"
                                                />
                                            </div>
                                            <Button onClick={handleSaveBrand} className="w-full bg-emerald-500 hover:bg-emerald-600" data-testid="save-brand-btn">
                                                Guardar
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead className="w-24">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {brands.map((brand) => (
                                            <TableRow key={brand.id}>
                                                <TableCell className="font-medium">{brand.name}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                setEditingItem(brand);
                                                                setBrandForm({ name: brand.name, logo_url: brand.logo_url || "" });
                                                                setBrandDialog(true);
                                                            }}
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeleteBrand(brand.id)}
                                                            className="text-rose-600 hover:bg-rose-50"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {brands.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={2} className="text-center py-8 text-slate-500">
                                                    No hay marcas.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Supermarkets Tab */}
                    <TabsContent value="supermarkets">
                        <Card className="border-slate-200">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100">
                                <CardTitle style={{ fontFamily: 'Manrope, sans-serif' }}>Supermercados</CardTitle>
                                <Dialog open={supermarketDialog} onOpenChange={setSupermarketDialog}>
                                    <DialogTrigger asChild>
                                        <Button 
                                            className="bg-emerald-500 hover:bg-emerald-600 gap-2"
                                            onClick={() => {
                                                setEditingItem(null);
                                                setSupermarketForm({ name: "", logo_url: "" });
                                            }}
                                            data-testid="add-supermarket-btn"
                                        >
                                            <Plus className="w-4 h-4" /> Añadir Supermercado
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>{editingItem ? "Editar" : "Nuevo"} Supermercado</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 pt-4">
                                            <div className="space-y-2">
                                                <Label>Nombre</Label>
                                                <Input
                                                    value={supermarketForm.name}
                                                    onChange={(e) => setSupermarketForm({ ...supermarketForm, name: e.target.value })}
                                                    placeholder="Nombre del supermercado"
                                                    data-testid="supermarket-name-input"
                                                />
                                            </div>
                                            <Button onClick={handleSaveSupermarket} className="w-full bg-emerald-500 hover:bg-emerald-600" data-testid="save-supermarket-btn">
                                                Guardar
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead className="w-24">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {supermarkets.map((sm) => (
                                            <TableRow key={sm.id}>
                                                <TableCell className="font-medium">{sm.name}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                setEditingItem(sm);
                                                                setSupermarketForm({ name: sm.name, logo_url: sm.logo_url || "" });
                                                                setSupermarketDialog(true);
                                                            }}
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeleteSupermarket(sm.id)}
                                                            className="text-rose-600 hover:bg-rose-50"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {supermarkets.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={2} className="text-center py-8 text-slate-500">
                                                    No hay supermercados.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Units Tab */}
                    <TabsContent value="units">
                        <Card className="border-slate-200">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100">
                                <CardTitle style={{ fontFamily: 'Manrope, sans-serif' }}>Unidades de Medida</CardTitle>
                                <Dialog open={unitDialog} onOpenChange={setUnitDialog}>
                                    <DialogTrigger asChild>
                                        <Button 
                                            className="bg-emerald-500 hover:bg-emerald-600 gap-2"
                                            onClick={() => {
                                                setEditingItem(null);
                                                setUnitForm({ name: "", abbreviation: "" });
                                            }}
                                            data-testid="add-unit-btn"
                                        >
                                            <Plus className="w-4 h-4" /> Añadir Unidad
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>{editingItem ? "Editar" : "Nueva"} Unidad</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 pt-4">
                                            <div className="space-y-2">
                                                <Label>Nombre</Label>
                                                <Input
                                                    value={unitForm.name}
                                                    onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })}
                                                    placeholder="Ej: Kilogramo"
                                                    data-testid="unit-name-input"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Abreviatura</Label>
                                                <Input
                                                    value={unitForm.abbreviation}
                                                    onChange={(e) => setUnitForm({ ...unitForm, abbreviation: e.target.value })}
                                                    placeholder="Ej: kg"
                                                    data-testid="unit-abbreviation-input"
                                                />
                                            </div>
                                            <Button onClick={handleSaveUnit} className="w-full bg-emerald-500 hover:bg-emerald-600" data-testid="save-unit-btn">
                                                Guardar
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead>Abreviatura</TableHead>
                                            <TableHead className="w-24">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {units.map((unit) => (
                                            <TableRow key={unit.id}>
                                                <TableCell className="font-medium">{unit.name}</TableCell>
                                                <TableCell className="font-mono">{unit.abbreviation}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                setEditingItem(unit);
                                                                setUnitForm({ name: unit.name, abbreviation: unit.abbreviation });
                                                                setUnitDialog(true);
                                                            }}
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeleteUnit(unit.id)}
                                                            className="text-rose-600 hover:bg-rose-50"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {units.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                                                    No hay unidades.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </Layout>
    );
};

export default AdminPage;
