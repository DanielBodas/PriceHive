import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { toast } from "sonner";
import { 
    BarChart3, 
    TrendingUp, 
    TrendingDown,
    Store,
    Package,
    Search,
    Tag,
    Layers,
    Download
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AnalyticsPage = () => {
    const [products, setProducts] = useState([]);
    const [supermarkets, setSupermarkets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [sellableProducts, setSellableProducts] = useState([]);
    const [productUnits, setProductUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    
    const [selectedProduct, setSelectedProduct] = useState("");
    const [selectedSupermarket, setSelectedSupermarket] = useState("all");
    const [selectedBrand, setSelectedBrand] = useState("all");
    const [productAnalytics, setProductAnalytics] = useState(null);
    const [comparison, setComparison] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

    useEffect(() => {
        fetchBaseData();
    }, []);

    useEffect(() => {
        setProductAnalytics(null);
        setComparison(null);
    }, [selectedProduct, selectedSupermarket, selectedBrand]);

    const fetchBaseData = async () => {
        try {
            const [productsRes, supermarketsRes, categoriesRes, brandsRes, sellableRes, unitsRes] = await Promise.all([
                axios.get(`${API}/admin/products`),
                axios.get(`${API}/admin/supermarkets`),
                axios.get(`${API}/public/categories`),
                axios.get(`${API}/admin/brands`),
                axios.get(`${API}/admin/sellable-products`),
                axios.get(`${API}/admin/product-units`)
            ]);
            setProducts(productsRes.data);
            setSupermarkets(supermarketsRes.data);
            setCategories(categoriesRes.data);
            setBrands(brandsRes.data);
            setSellableProducts(sellableRes.data);
            setProductUnits(unitsRes.data);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Error al cargar datos");
        } finally {
            setLoading(false);
        }
    };

    // Filter base products only (those that have sellable entries) for the selector
    const filteredProducts = useMemo(() => {
        let filtered = products;

        // Only show products that have at least one sellable product entry
        const productsWithSellable = new Set(sellableProducts.map(sp => sp.product_id));
        filtered = filtered.filter(p => productsWithSellable.has(p.id));

        if (searchQuery) {
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.category_name?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        if (selectedCategory && selectedCategory !== "all") {
            filtered = filtered.filter(p => p.category_id === selectedCategory);
        }

        return filtered;
    }, [searchQuery, selectedCategory, products, sellableProducts]);

    // Brands available for selected product
    const availableBrandsForProduct = useMemo(() => {
        if (!selectedProduct) return [];
        const brandIds = new Set(
            sellableProducts
                .filter(sp => sp.product_id === selectedProduct)
                .map(sp => sp.brand_id)
        );
        return brands.filter(b => brandIds.has(b.id));
    }, [selectedProduct, sellableProducts, brands]);

    // Supermarkets available for selected product (and optionally brand)
    const availableSupermarketsForProduct = useMemo(() => {
        if (!selectedProduct) return supermarkets;
        let sps = sellableProducts.filter(sp => sp.product_id === selectedProduct);
        if (selectedBrand && selectedBrand !== "all") {
            sps = sps.filter(sp => sp.brand_id === selectedBrand);
        }
        const smIds = new Set(sps.map(sp => sp.supermarket_id));
        return supermarkets.filter(sm => smIds.has(sm.id));
    }, [selectedProduct, selectedBrand, sellableProducts, supermarkets]);

    const fetchProductAnalytics = async () => {
        if (!selectedProduct) {
            toast.error("Selecciona un producto");
            return;
        }
        const params = new URLSearchParams();
        if (selectedSupermarket && selectedSupermarket !== "all") {
            params.append("supermarket_id", selectedSupermarket);
        }
        const queryStr = params.toString() ? `?${params.toString()}` : "";
        const response = await axios.get(`${API}/analytics/product/${selectedProduct}${queryStr}`);
        return response.data;
    };

    const fetchComparison = async () => {
        if (!selectedProduct) {
            toast.error("Selecciona un producto");
            return;
        }
        const response = await axios.get(`${API}/analytics/compare/${selectedProduct}`);
        return response.data;
    };

    const runAnalysis = async () => {
        if (!selectedProduct) {
            toast.error("Selecciona un producto");
            return;
        }
        setAnalyticsLoading(true);
        try {
            const [analyticsRes, comparisonRes] = await Promise.all([
                fetchProductAnalytics(),
                fetchComparison()
            ]);
            setProductAnalytics(analyticsRes);
            setComparison(comparisonRes);
        } catch (error) {
            toast.error("Error al cargar analisis");
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const handleExportAnalytics = async (format) => {
        if (!selectedProduct) return;
        try {
            setAnalyticsLoading(true);
            const response = await axios({
                url: `${API}/analytics/export/${selectedProduct}?format=${format}`,
                method: 'GET',
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `analisis_${selectedProductData?.name.replace(/ /g, '_')}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success(`Análisis exportado en formato ${format.toUpperCase()}`);
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Error al exportar los datos analíticos");
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const formatCurrency = (value) => `${Number(value || 0).toFixed(2)}€`;
    const formatUnitPrice = (value, unit) => `${Number(value || 0).toFixed(2)}€${unit ? `/${unit}` : ''}`;

    const daysBetween = (fromDateString, toDate = new Date()) => {
        if (!fromDateString) return null;
        const fromDate = new Date(fromDateString);
        const ms = toDate.getTime() - fromDate.getTime();
        return Math.floor(ms / (1000 * 60 * 60 * 24));
    };

    const historyData = useMemo(
        () => (productAnalytics?.price_history || []).map((row) => ({
            ...row,
            price: Number(row.price),
            unit_price: Number(row.unit_price || row.price)
        })),
        [productAnalytics]
    );

    const trend = useMemo(() => {
        if (historyData.length < 2) return null;
        const first = historyData[0].unit_price;
        const last = historyData[historyData.length - 1].unit_price;
        const delta = last - first;
        const deltaPct = first > 0 ? (delta / first) * 100 : 0;
        return {
            delta,
            deltaPct,
            direction: delta > 0 ? "up" : delta < 0 ? "down" : "flat"
        };
    }, [historyData]);

    const historySpanDays = useMemo(() => {
        if (historyData.length < 2) return null;
        return daysBetween(historyData[0].date, new Date(historyData[historyData.length - 1].date));
    }, [historyData]);

    // Build enriched comparison: add brand info from sellable products
    const comparisonEnriched = useMemo(() => {
        if (!comparison?.comparison) return [];
        return comparison.comparison.map(item => {
            // Find a matching sellable product to get brand info
            const sp = sellableProducts.find(
                sp => sp.supermarket_id === item.supermarket_id &&
                    sp.product_id === selectedProduct &&
                    (selectedBrand === "all" || sp.brand_id === selectedBrand)
            );
            const brand = brands.find(b => b.id === sp?.brand_id);
            return {
                ...item,
                brand_id: sp?.brand_id,
                brand_name: brand?.name || sp?.brand_name || null,
                label: brand?.name 
                    ? `${item.supermarket_name} · ${brand.name}`
                    : item.supermarket_name
            };
        });
    }, [comparison, sellableProducts, brands, selectedProduct, selectedBrand]);

    const comparisonSorted = useMemo(() => {
        // Filter by brand if selected
        let rows = [...comparisonEnriched];
        if (selectedBrand && selectedBrand !== "all") {
            rows = rows.filter(r => r.brand_id === selectedBrand);
        }
        // Use unit_price for sorting and analysis
        return rows.sort((a, b) => (a.unit_price || a.price) - (b.unit_price || b.price));
    }, [comparisonEnriched, selectedBrand]);

    const bestPrice = comparisonSorted.length > 0 ? comparisonSorted[0] : null;
    const worstPrice = comparisonSorted.length > 0 ? comparisonSorted[comparisonSorted.length - 1] : null;

    const priceSpread = useMemo(() => {
        if (!bestPrice || !worstPrice || comparisonSorted.length < 2) return null;
        const bestUP = bestPrice.unit_price || bestPrice.price;
        const worstUP = worstPrice.unit_price || worstPrice.price;
        const delta = worstUP - bestUP;
        const deltaPct = bestUP > 0 ? (delta / bestUP) * 100 : 0;
        return { delta, deltaPct };
    }, [bestPrice, worstPrice, comparisonSorted]);

    const selectedSupermarketRow = useMemo(() => {
        if (selectedSupermarket === "all") return null;
        return comparisonSorted.find((row) => row.supermarket_id === selectedSupermarket) || null;
    }, [comparisonSorted, selectedSupermarket]);

    const selectedVsBest = useMemo(() => {
        if (!selectedSupermarketRow || !bestPrice) return null;
        const selectedUP = selectedSupermarketRow.unit_price || selectedSupermarketRow.price;
        const bestUP = bestPrice.unit_price || bestPrice.price;
        const delta = selectedUP - bestUP;
        const deltaPct = bestUP > 0 ? (delta / bestUP) * 100 : 0;
        return { delta, deltaPct };
    }, [selectedSupermarketRow, bestPrice]);

    const recommendations = useMemo(() => {
        const items = [];

        if (trend?.deltaPct >= 5) {
            items.push(`Tendencia alcista: +${trend.deltaPct.toFixed(1)}% desde el primer registro.`);
        } else if (trend?.deltaPct <= -5) {
            items.push(`Tendencia bajista: ${trend.deltaPct.toFixed(1)}% desde el primer registro.`);
        }

        if (productAnalytics?.avg_price && productAnalytics?.current_price) {
            const diff = productAnalytics.current_price - productAnalytics.avg_price;
            const diffPct = productAnalytics.avg_price > 0 ? (diff / productAnalytics.avg_price) * 100 : 0;
            if (diffPct >= 8) {
                items.push(`Precio actual +${diffPct.toFixed(1)}% sobre su media historica.`);
            } else if (diffPct <= -8) {
                items.push(`Precio actual ${diffPct.toFixed(1)}% bajo su media historica.`);
            }
        }

        if (priceSpread?.delta >= 0.05) {
            items.push(`Cambiar de super puede ahorrar ${formatUnitPrice(priceSpread.delta, productAnalytics?.unit_name || comparison?.unit_name)} (${priceSpread.deltaPct.toFixed(1)}%).`);
        }

        const bestAge = daysBetween(bestPrice?.updated_at);
        if (bestAge !== null && bestAge > 30) {
            items.push(`El mejor precio tiene ${bestAge} dias. Conviene revalidarlo.`);
        }

        if (historyData.length > 0 && historyData.length < 4) {
            items.push("Hay pocos registros historicos. Interpretar con cautela.");
        }

        return items;
    }, [trend, productAnalytics, priceSpread, bestPrice, historyData, comparison]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg p-3 shadow-lg">
                    <p className="text-sm text-slate-500 mb-1">{formatDateTime(label)}</p>
                    <p className="font-mono font-semibold text-emerald-600">
                        {formatUnitPrice(data.unit_price, productAnalytics?.unit_name)}
                    </p>
                    {data.quantity && data.quantity !== 1 && (
                        <p className="text-[10px] text-slate-400 mt-0.5">
                            Precio final: {formatCurrency(data.price)} por {data.quantity} {productAnalytics?.unit_name || "unidades"}
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    const selectedProductData = useMemo(() => {
        return products.find(p => p.id === selectedProduct);
    }, [products, selectedProduct]);

    const selectedProductUnits = useMemo(() => {
        if (!selectedProduct) return [];
        return productUnits.filter(pu => pu.product_id === selectedProduct);
    }, [selectedProduct, productUnits]);

    // Color palette for bar chart
    const BAR_COLORS = ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#059669", "#047857"];

    return (
        <Layout>
            <div className="space-y-6" data-testid="analytics-page">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        Analisis de Precios
                    </h1>
                    <p className="text-slate-500 mt-1">Explora evolucion, comparativas y oportunidades de ahorro</p>
                </div>

                {/* Search & Filters */}
                <Card className="border-slate-200" data-testid="search-card">
                    <CardContent className="p-6">
                        {/* Row 1: Search + Category */}
                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Buscar producto..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                    data-testid="search-input"
                                />
                            </div>
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger data-testid="category-filter-select">
                                    <SelectValue placeholder="Todas las categorias" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas las categorias</SelectItem>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="text-sm text-slate-500 flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                {filteredProducts.length} productos con datos
                            </div>
                        </div>
                        
                        {/* Row 2: Product + Brand + Supermarket + Action buttons */}
                        <div className="grid md:grid-cols-4 gap-4 items-end">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                                    <Package className="w-3.5 h-3.5" />
                                    Producto
                                </label>
                                <Select value={selectedProduct} onValueChange={(v) => {
                                    setSelectedProduct(v);
                                    setSelectedBrand("all");
                                    setSelectedSupermarket("all");
                                }}>
                                    <SelectTrigger data-testid="product-select">
                                        <SelectValue placeholder="Selecciona producto" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredProducts.map((p) => (
                                            <SelectItem key={p.id} value={p.id}>
                                                <span className="font-medium">{p.name}</span>
                                                {p.category_name && (
                                                    <span className="text-slate-400 ml-1.5 text-xs">({p.category_name})</span>
                                                )}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                                    <Tag className="w-3.5 h-3.5" />
                                    Marca (opcional)
                                </label>
                                <Select 
                                    value={selectedBrand} 
                                    onValueChange={setSelectedBrand}
                                    disabled={!selectedProduct || availableBrandsForProduct.length === 0}
                                >
                                    <SelectTrigger data-testid="brand-select">
                                        <SelectValue placeholder="Todas las marcas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas las marcas</SelectItem>
                                        {availableBrandsForProduct.map((b) => (
                                            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                                    <Store className="w-3.5 h-3.5" />
                                    Supermercado (opcional)
                                </label>
                                <Select 
                                    value={selectedSupermarket} 
                                    onValueChange={setSelectedSupermarket}
                                    disabled={!selectedProduct}
                                >
                                    <SelectTrigger data-testid="supermarket-select">
                                        <SelectValue placeholder="Todos" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        {availableSupermarketsForProduct.map((sm) => (
                                            <SelectItem key={sm.id} value={sm.id}>{sm.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex gap-2">
                                <Button 
                                    onClick={runAnalysis}
                                    disabled={analyticsLoading || !selectedProduct}
                                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 gap-2"
                                    data-testid="analyze-btn"
                                >
                                    <TrendingUp className="w-4 h-4" />
                                    Ver Análisis Completo
                                </Button>
                            </div>
                        </div>

                        {/* Selected product info banner */}
                        {selectedProductData && (
                            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3 text-sm text-slate-600">
                                <Layers className="w-4 h-4 text-slate-400 shrink-0" />
                                <span className="font-medium text-slate-800">{selectedProductData.name}</span>
                                {selectedProductData.category_name && (
                                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{selectedProductData.category_name}</span>
                                )}
                                <span className="text-slate-400">·</span>
                                <span className="text-slate-500">
                                    {availableBrandsForProduct.length} marca{availableBrandsForProduct.length !== 1 ? 's' : ''} disponible{availableBrandsForProduct.length !== 1 ? 's' : ''}
                                </span>
                                <span className="text-slate-500">
                                    {availableSupermarketsForProduct.length} supermercado{availableSupermarketsForProduct.length !== 1 ? 's' : ''}
                                </span>
                                {selectedProductUnits.length > 0 && (
                                    <>
                                        <span className="text-slate-400">·</span>
                                        <div className="flex items-center gap-1">
                                            <span className="text-[11px] text-slate-400 mr-1">Unidades:</span>
                                            {selectedProductUnits.map(u => (
                                                <Badge key={u.id} variant="secondary" className="text-[10px] h-5 px-1.5 bg-slate-100 text-slate-600 border-none font-normal">
                                                    {u.unit_name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </>
                                )}
                                <div className="ml-auto">
                                    {(productAnalytics || comparison) && (
                                        <Select onValueChange={handleExportAnalytics}>
                                            <SelectTrigger className="w-auto gap-2 bg-white text-slate-700 border-slate-200 h-8 text-xs px-3" data-testid="export-analytics-select">
                                                <Download className="w-3.5 h-3.5" />
                                                <SelectValue placeholder="Exportar Análisis" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                                                <SelectItem value="ods">OpenOffice (.ods)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {(productAnalytics || comparison) && (
                    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600">Precio Actual</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold text-slate-900">
                            {productAnalytics?.current_unit_price != null
                                ? formatUnitPrice(productAnalytics.current_unit_price, productAnalytics.unit_name)
                                : productAnalytics?.current_price != null
                                    ? formatCurrency(productAnalytics.current_price)
                                    : "-"
                            }
                                </p>
                                {productAnalytics?.supermarket_name && (
                                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                        <Store className="w-3 h-3" />
                                        {productAnalytics.supermarket_name}
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600">Tendencia</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {trend ? (
                                    <div className="flex items-center gap-2">
                                        {trend.direction === "up" ? (
                                            <TrendingUp className="w-5 h-5 text-rose-600" />
                                        ) : trend.direction === "down" ? (
                                            <TrendingDown className="w-5 h-5 text-emerald-600" />
                                        ) : (
                                            <BarChart3 className="w-5 h-5 text-slate-500" />
                                        )}
                                        <p className={`text-2xl font-bold ${trend.direction === "up" ? "text-rose-600" : trend.direction === "down" ? "text-emerald-600" : "text-slate-700"}`}>
                                            {trend.deltaPct > 0 ? "+" : ""}{trend.deltaPct.toFixed(1)}%
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500">Sin datos suficientes</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600">Rango Unitario</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {productAnalytics?.min_unit_price != null && productAnalytics?.max_unit_price != null ? (
                                    <p className="text-sm font-mono text-slate-900">
                                        {formatUnitPrice(productAnalytics.min_unit_price, productAnalytics.unit_name)} — {formatUnitPrice(productAnalytics.max_unit_price, productAnalytics.unit_name)}
                                    </p>
                                ) : (
                                    <p className="text-sm text-slate-500">Sin datos</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600">Ahorro Potencial</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {priceSpread ? (
                                    <>
                                        <p className="text-2xl font-bold text-emerald-600">
                                            {formatUnitPrice(priceSpread.delta, productAnalytics?.unit_name || comparison?.unit_name)}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">entre el más barato y más caro (unitario)</p>
                                    </>
                                ) : (
                                    <p className="text-sm text-slate-500">Sin comparativa</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Analytics Results */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Price Evolution Chart */}
                    {productAnalytics && (
                        <Card className="border-slate-200" data-testid="evolution-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                                    Evolucion de Precio
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-4">
                                    <h3 className="font-semibold text-slate-900">{productAnalytics.product_name}</h3>
                                    {productAnalytics.supermarket_name && (
                                        <p className="text-sm text-slate-500 flex items-center gap-1">
                                            <Store className="w-3 h-3" />
                                            {productAnalytics.supermarket_name}
                                        </p>
                                    )}
                                </div>

                                {productAnalytics.price_history?.length > 0 ? (
                                    <>
                                        <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                                            <span>{historyData.length} registros</span>
                                            <span>{historySpanDays != null ? `${historySpanDays} dias de ventana` : "Ventana corta"}</span>
                                        </div>
                                        {/* Stats */}
                                        <div className="grid grid-cols-4 gap-4 mb-6">
                                            <div className="text-center p-3 bg-slate-50 rounded-lg">
                                                <p className="text-xs text-slate-500">Actual</p>
                                                <p className="font-mono font-semibold text-slate-900">
                                                    {formatUnitPrice(productAnalytics.current_unit_price, productAnalytics.unit_name)}
                                                </p>
                                            </div>
                                            <div className="text-center p-3 bg-slate-50 rounded-lg">
                                                <p className="text-xs text-slate-500">Media</p>
                                                <p className="font-mono font-semibold text-slate-900">
                                                    {formatUnitPrice(productAnalytics.avg_unit_price, productAnalytics.unit_name)}
                                                </p>
                                            </div>
                                            <div className="text-center p-3 bg-emerald-50 rounded-lg">
                                                <p className="text-xs text-emerald-600">Minimo</p>
                                                <p className="font-mono font-semibold text-emerald-600">
                                                    {formatUnitPrice(productAnalytics.min_unit_price, productAnalytics.unit_name)}
                                                </p>
                                            </div>
                                            <div className="text-center p-3 bg-rose-50 rounded-lg">
                                                <p className="text-xs text-rose-600">Maximo</p>
                                                <p className="font-mono font-semibold text-rose-600">
                                                    {formatUnitPrice(productAnalytics.max_unit_price, productAnalytics.unit_name)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Chart */}
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={historyData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                    <XAxis 
                                                        dataKey="date" 
                                                        tickFormatter={formatDate}
                                                        tick={{ fontSize: 12, fill: '#64748b' }}
                                                    />
                                                    <YAxis 
                                                        tick={{ fontSize: 12, fill: '#64748b' }}
                                                        tickFormatter={(v) => `${v} €`}
                                                    />
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="unit_price"
                                                        stroke="#10b981" 
                                                        strokeWidth={2}
                                                        dot={{ fill: '#10b981', strokeWidth: 2 }}
                                                        activeDot={{ r: 6, fill: '#10b981' }}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-64 flex items-center justify-center">
                                        <div className="text-center">
                                            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                            <p className="text-slate-500">Sin datos de precios</p>
                                            <p className="text-xs text-slate-400 mt-1">Registra precios desde la lista de compra</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Comparison Chart */}
                    {comparison && (
                        <Card className="border-slate-200" data-testid="comparison-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                                    <BarChart3 className="w-5 h-5 text-emerald-500" />
                                    Comparacion por Supermercado
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="font-semibold text-slate-900">{comparison.product_name}</h3>
                                    {selectedBrand !== "all" && (
                                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full flex items-center gap-1">
                                            <Tag className="w-3 h-3" />
                                            {brands.find(b => b.id === selectedBrand)?.name}
                                        </span>
                                    )}
                                </div>

                                {comparisonSorted.length > 0 ? (
                                    <>
                                        {/* Best Price Highlight */}
                                        {bestPrice && (
                                            <div className="mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm text-emerald-600 font-medium">Mejor Precio</p>
                                                        <p className="font-semibold text-slate-900">{bestPrice.supermarket_name}</p>
                                                        {bestPrice.brand_name && (
                                                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                                <Tag className="w-3 h-3" />
                                                                {bestPrice.brand_name}
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-slate-500">Actualizado: {formatDateTime(bestPrice.updated_at)}</p>
                                                        {priceSpread && (
                                                            <p className="text-xs text-slate-500 mt-1">
                                                                Diferencia máx: {formatUnitPrice(priceSpread.delta, comparison.unit_name)} ({priceSpread.deltaPct.toFixed(1)}%)
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-mono text-2xl font-bold text-emerald-600">
                                                            {formatUnitPrice(bestPrice.unit_price || bestPrice.price, comparison.unit_name)}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400">
                                                            Precio final: {formatCurrency(bestPrice.price)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Bar Chart */}
                                        <div className="h-56">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart 
                                                    data={comparisonSorted} 
                                                    layout="vertical"
                                                    margin={{ right: 16 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                    <XAxis 
                                                        type="number" 
                                                        tick={{ fontSize: 11, fill: '#64748b' }}
                                                        tickFormatter={(v) => `${v} €`}
                                                    />
                                                    <YAxis 
                                                        type="category" 
                                                        dataKey="label" 
                                                        tick={{ fontSize: 11, fill: '#64748b' }}
                                                        width={130}
                                                    />
                                                    <Tooltip 
                                                        formatter={(value, name, props) => [
                                                            formatUnitPrice(value, comparison.unit_name),
                                                            "Precio Unitario"
                                                        ]}
                                                        labelFormatter={(label) => label}
                                                        contentStyle={{ 
                                                            backgroundColor: 'rgba(255,255,255,0.95)',
                                                            border: '1px solid #e2e8f0',
                                                            borderRadius: '8px',
                                                            fontSize: '12px'
                                                        }}
                                                    />
                                                    <Bar 
                                                        dataKey="unit_price"
                                                        radius={[0, 4, 4, 0]}
                                                    >
                                                        {comparisonSorted.map((entry, index) => (
                                                            <Cell 
                                                                key={`cell-${index}`} 
                                                                fill={index === 0 ? "#10b981" : BAR_COLORS[index % BAR_COLORS.length]}
                                                                opacity={index === 0 ? 1 : 0.8}
                                                            />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>

                                        {/* Price List */}
                                        <div className="mt-4 space-y-2">
                                            {comparisonSorted.map((item, index) => (
                                                <div 
                                                    key={index}
                                                    className={`flex items-center justify-between p-3 rounded-lg ${
                                                        index === 0 ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-50'
                                                    }`}
                                                >
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2">
                                                            {index === 0 && <TrendingDown className="w-4 h-4 text-emerald-600" />}
                                                            <span className="text-slate-700 font-medium">{item.supermarket_name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            {item.brand_name && (
                                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                                    <Tag className="w-2.5 h-2.5" />
                                                                    {item.brand_name}
                                                                </span>
                                                            )}
                                                            <span className="text-xs text-slate-400">
                                                                {index === 0 ? "Referencia más barata" : `+${formatUnitPrice(item.unit_price - bestPrice.unit_price, comparison.unit_name)} vs mejor`}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={`font-mono font-semibold ${
                                                            index === 0 ? 'text-emerald-600' : 'text-slate-900'
                                                        }`}>
                                                            {formatUnitPrice(item.unit_price || item.price, comparison.unit_name)}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400">
                                                            Total: {formatCurrency(item.price)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-64 flex items-center justify-center">
                                        <div className="text-center">
                                            <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                            <p className="text-slate-500">Sin datos comparativos</p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {selectedBrand !== "all" ? "Prueba sin filtrar por marca" : "Registra precios desde la lista de compra"}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {(productAnalytics || comparison) && (recommendations.length > 0 || (selectedVsBest && selectedSupermarketRow)) && (
                    <Card className="border-slate-200">
                        <CardHeader>
                            <CardTitle className="text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>Recomendaciones y Hallazgos</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {selectedVsBest && selectedSupermarketRow && (
                                <div className="rounded-lg border p-3 bg-slate-50 text-sm">
                                    En {selectedSupermarketRow.supermarket_name}, el producto esta{" "}
                                    <span className={selectedVsBest.delta > 0 ? "text-rose-600 font-semibold" : "text-emerald-600 font-semibold"}>
                                        {selectedVsBest.delta > 0 ? "+" : ""}{formatUnitPrice(selectedVsBest.delta, productAnalytics?.unit_name || comparison?.unit_name)}
                                    </span>{" "}
                                    frente al mejor precio disponible (unitario).
                                </div>
                            )}

                            {recommendations.length > 0 ? (
                                recommendations.map((message, idx) => (
                                    <div key={idx} className="rounded-lg border p-3 text-sm text-slate-700 bg-white">
                                        {message}
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-500">Aun no hay suficientes datos para recomendaciones avanzadas.</p>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Empty State */}
                {!productAnalytics && !comparison && (
                    <Card className="border-slate-200">
                        <CardContent className="p-12 text-center">
                            <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 text-lg font-semibold">Selecciona un producto</p>
                            <p className="text-sm text-slate-400 mt-1">
                                Elige un producto arriba para visualizar su comparativa de precios entre supermercados y su evolución histórica.
                            </p>
                            {!loading && products.length === 0 && (
                                <p className="text-xs text-amber-500 mt-3 bg-amber-50 border border-amber-100 rounded-lg p-3 max-w-sm mx-auto">
                                    No hay productos con datos operativos. Configura el catálogo desde el Panel de Administración.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </Layout>
    );
};

export default AnalyticsPage;
