import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { toast } from "sonner";
import { 
    BarChart3, 
    TrendingUp, 
    TrendingDown,
    Store,
    Package,
    Search
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AnalyticsPage = () => {
    const [products, setProducts] = useState([]);
    const [supermarkets, setSupermarkets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [filteredProducts, setFilteredProducts] = useState([]);
    
    const [selectedProduct, setSelectedProduct] = useState("");
    const [selectedSupermarket, setSelectedSupermarket] = useState("all");
    const [productAnalytics, setProductAnalytics] = useState(null);
    const [comparison, setComparison] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

    useEffect(() => {
        fetchBaseData();
    }, []);

    useEffect(() => {
        setProductAnalytics(null);
        setComparison(null);
    }, [selectedProduct, selectedSupermarket]);

    useEffect(() => {
        // Filter products based on search and category
        let filtered = products;
        
        if (searchQuery) {
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.brand_name?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        if (selectedCategory && selectedCategory !== "all") {
            filtered = filtered.filter(p => p.category_id === selectedCategory);
        }
        
        setFilteredProducts(filtered);
    }, [searchQuery, selectedCategory, products]);

    const fetchBaseData = async () => {
        try {
            const [productsRes, supermarketsRes, categoriesRes] = await Promise.all([
                axios.get(`${API}/public/products`),
                axios.get(`${API}/public/supermarkets`),
                axios.get(`${API}/public/categories`)
            ]);
            setProducts(productsRes.data);
            setFilteredProducts(productsRes.data);
            setSupermarkets(supermarketsRes.data);
            setCategories(categoriesRes.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProductAnalytics = async () => {
        if (!selectedProduct) {
            toast.error("Selecciona un producto");
            return;
        }
        const params = selectedSupermarket && selectedSupermarket !== "all"
            ? `?supermarket_id=${selectedSupermarket}`
            : "";
        const response = await axios.get(`${API}/analytics/product/${selectedProduct}${params}`);
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

    const runComparisonOnly = async () => {
        if (!selectedProduct) {
            toast.error("Selecciona un producto");
            return;
        }
        setAnalyticsLoading(true);
        try {
            const comparisonRes = await fetchComparison();
            setComparison(comparisonRes);
        } catch (error) {
            toast.error("Error al cargar comparacion");
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

    const formatCurrency = (value) => `${Number(value || 0).toFixed(2)} EUR`;

    const daysBetween = (fromDateString, toDate = new Date()) => {
        if (!fromDateString) return null;
        const fromDate = new Date(fromDateString);
        const ms = toDate.getTime() - fromDate.getTime();
        return Math.floor(ms / (1000 * 60 * 60 * 24));
    };

    const historyData = useMemo(
        () => (productAnalytics?.price_history || []).map((row) => ({ ...row, price: Number(row.price) })),
        [productAnalytics]
    );

    const trend = useMemo(() => {
        if (historyData.length < 2) return null;
        const first = historyData[0].price;
        const last = historyData[historyData.length - 1].price;
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

    const comparisonSorted = useMemo(() => {
        const rows = [...(comparison?.comparison || [])];
        return rows.sort((a, b) => a.price - b.price);
    }, [comparison]);

    const bestPrice = comparisonSorted.length > 0 ? comparisonSorted[0] : null;
    const worstPrice = comparisonSorted.length > 0 ? comparisonSorted[comparisonSorted.length - 1] : null;

    const priceSpread = useMemo(() => {
        if (!bestPrice || !worstPrice) return null;
        const delta = worstPrice.price - bestPrice.price;
        const deltaPct = bestPrice.price > 0 ? (delta / bestPrice.price) * 100 : 0;
        return { delta, deltaPct };
    }, [bestPrice, worstPrice]);

    const selectedSupermarketRow = useMemo(() => {
        if (selectedSupermarket === "all") return null;
        return comparisonSorted.find((row) => row.supermarket_id === selectedSupermarket) || null;
    }, [comparisonSorted, selectedSupermarket]);

    const selectedVsBest = useMemo(() => {
        if (!selectedSupermarketRow || !bestPrice) return null;
        const delta = selectedSupermarketRow.price - bestPrice.price;
        const deltaPct = bestPrice.price > 0 ? (delta / bestPrice.price) * 100 : 0;
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

        if (priceSpread?.delta >= 0.2) {
            items.push(`Cambiar de super puede ahorrar ${formatCurrency(priceSpread.delta)} (${priceSpread.deltaPct.toFixed(1)}%).`);
        }

        const bestAge = daysBetween(bestPrice?.updated_at);
        if (bestAge !== null && bestAge > 30) {
            items.push(`El mejor precio tiene ${bestAge} dias. Conviene revalidarlo.`);
        }

        if (historyData.length > 0 && historyData.length < 4) {
            items.push("Hay pocos registros historicos. Interpretar con cautela.");
        }

        return items;
    }, [trend, productAnalytics, priceSpread, bestPrice, historyData]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg p-3 shadow-lg">
                    <p className="text-sm text-slate-500">{formatDateTime(label)}</p>
                    <p className="font-mono font-semibold text-emerald-600">
                        {formatCurrency(payload[0].value)}
                    </p>
                </div>
            );
        }
        return null;
    };

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
                            <div className="text-sm text-slate-500 flex items-center">
                                {filteredProducts.length} productos encontrados
                            </div>
                        </div>
                        
                        <div className="grid md:grid-cols-4 gap-4 items-end">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Producto</label>
                                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                                    <SelectTrigger data-testid="product-select">
                                        <SelectValue placeholder="Selecciona producto" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredProducts.map((p) => (
                                            <SelectItem key={p.id} value={p.id}>
                                                {p.name} ({p.brand_name})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Supermercado (opcional)</label>
                                <Select value={selectedSupermarket} onValueChange={setSelectedSupermarket}>
                                    <SelectTrigger data-testid="supermarket-select">
                                        <SelectValue placeholder="Todos" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        {supermarkets.map((sm) => (
                                            <SelectItem key={sm.id} value={sm.id}>{sm.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button 
                                onClick={runAnalysis}
                                disabled={analyticsLoading || !selectedProduct}
                                className="bg-emerald-500 hover:bg-emerald-600 gap-2"
                                data-testid="analyze-btn"
                            >
                                <TrendingUp className="w-4 h-4" />
                                Analizar
                            </Button>
                            <Button 
                                onClick={runComparisonOnly}
                                disabled={analyticsLoading || !selectedProduct}
                                variant="outline"
                                className="gap-2"
                                data-testid="compare-btn"
                            >
                                <BarChart3 className="w-4 h-4" />
                                Solo Comparativa
                            </Button>
                        </div>
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
                                    {productAnalytics?.current_price != null ? formatCurrency(productAnalytics.current_price) : "-"}
                                </p>
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
                                <CardTitle className="text-sm text-slate-600">Rango Historico</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {productAnalytics?.min_price != null && productAnalytics?.max_price != null ? (
                                    <p className="text-sm font-mono text-slate-900">
                                        {formatCurrency(productAnalytics.min_price)} - {formatCurrency(productAnalytics.max_price)}
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
                                    <p className="text-2xl font-bold text-emerald-600">{formatCurrency(priceSpread.delta)}</p>
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
                                                    {formatCurrency(productAnalytics.current_price)}
                                                </p>
                                            </div>
                                            <div className="text-center p-3 bg-slate-50 rounded-lg">
                                                <p className="text-xs text-slate-500">Media</p>
                                                <p className="font-mono font-semibold text-slate-900">
                                                    {formatCurrency(productAnalytics.avg_price)}
                                                </p>
                                            </div>
                                            <div className="text-center p-3 bg-emerald-50 rounded-lg">
                                                <p className="text-xs text-emerald-600">Minimo</p>
                                                <p className="font-mono font-semibold text-emerald-600">
                                                    {formatCurrency(productAnalytics.min_price)}
                                                </p>
                                            </div>
                                            <div className="text-center p-3 bg-rose-50 rounded-lg">
                                                <p className="text-xs text-rose-600">Maximo</p>
                                                <p className="font-mono font-semibold text-rose-600">
                                                    {formatCurrency(productAnalytics.max_price)}
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
                                                        tickFormatter={(v) => `${v} EUR`}
                                                    />
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="price" 
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
                                <div className="mb-4">
                                    <h3 className="font-semibold text-slate-900">{comparison.product_name}</h3>
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
                                                        <p className="text-xs text-slate-500">Actualizado: {formatDateTime(bestPrice.updated_at)}</p>
                                                        {priceSpread && (
                                                            <p className="text-xs text-slate-500 mt-1">
                                                                Brecha entre supers: {formatCurrency(priceSpread.delta)} ({priceSpread.deltaPct.toFixed(1)}%)
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-mono text-2xl font-bold text-emerald-600">
                                                            {formatCurrency(bestPrice.price)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Bar Chart */}
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={comparisonSorted} layout="vertical">
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                    <XAxis 
                                                        type="number" 
                                                        tick={{ fontSize: 12, fill: '#64748b' }}
                                                        tickFormatter={(v) => `${v} EUR`}
                                                    />
                                                    <YAxis 
                                                        type="category" 
                                                        dataKey="supermarket_name" 
                                                        tick={{ fontSize: 12, fill: '#64748b' }}
                                                        width={100}
                                                    />
                                                    <Tooltip 
                                                        formatter={(value) => [formatCurrency(value), "Precio"]}
                                                        contentStyle={{ 
                                                            backgroundColor: 'rgba(255,255,255,0.95)',
                                                            border: '1px solid #e2e8f0',
                                                            borderRadius: '8px'
                                                        }}
                                                    />
                                                    <Bar 
                                                        dataKey="price" 
                                                        fill="#10b981"
                                                        radius={[0, 4, 4, 0]}
                                                    />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>

                                        {/* Price List */}
                                        <div className="mt-4 space-y-2">
                                            {comparisonSorted.map((item, index) => (
                                                <div 
                                                    key={index}
                                                    className={`flex items-center justify-between p-3 rounded-lg ${
                                                        index === 0 ? 'bg-emerald-50' : 'bg-slate-50'
                                                    }`}
                                                >
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2">
                                                            {index === 0 && <TrendingDown className="w-4 h-4 text-emerald-600" />}
                                                            <span className="text-slate-700">{item.supermarket_name}</span>
                                                        </div>
                                                        <span className="text-xs text-slate-500">
                                                            {index === 0 ? "Referencia mas barata" : `+${formatCurrency(item.price - bestPrice.price)} vs mejor`}
                                                        </span>
                                                    </div>
                                                    <span className={`font-mono font-semibold ${
                                                        index === 0 ? 'text-emerald-600' : 'text-slate-900'
                                                    }`}>
                                                        {formatCurrency(item.price)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-64 flex items-center justify-center">
                                        <div className="text-center">
                                            <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                            <p className="text-slate-500">Sin datos comparativos</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {(productAnalytics || comparison) && (
                    <Card className="border-slate-200">
                        <CardHeader>
                            <CardTitle className="text-lg">Recomendaciones utiles</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {selectedVsBest && selectedSupermarketRow && (
                                <div className="rounded-lg border p-3 bg-slate-50 text-sm">
                                    En {selectedSupermarketRow.supermarket_name}, el producto esta{" "}
                                    <span className={selectedVsBest.delta > 0 ? "text-rose-600 font-semibold" : "text-emerald-600 font-semibold"}>
                                        {selectedVsBest.delta > 0 ? "+" : ""}{formatCurrency(selectedVsBest.delta)}
                                    </span>{" "}
                                    frente al mejor precio disponible.
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
                            <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 text-lg">Selecciona un producto</p>
                            <p className="text-sm text-slate-400 mt-1">Pulsa en Analizar para ver evolucion y comparativa</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </Layout>
    );
};

export default AnalyticsPage;
