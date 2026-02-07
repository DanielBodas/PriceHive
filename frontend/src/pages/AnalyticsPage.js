import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { toast } from "sonner";
import { 
    BarChart3, 
    TrendingUp, 
    TrendingDown,
    ArrowRight,
    Store,
    Package
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AnalyticsPage = () => {
    const [products, setProducts] = useState([]);
    const [supermarkets, setSupermarkets] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [selectedProduct, setSelectedProduct] = useState("");
    const [selectedSupermarket, setSelectedSupermarket] = useState("");
    const [productAnalytics, setProductAnalytics] = useState(null);
    const [comparison, setComparison] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

    useEffect(() => {
        fetchBaseData();
    }, []);

    const fetchBaseData = async () => {
        try {
            const [productsRes, supermarketsRes] = await Promise.all([
                axios.get(`${API}/public/products`),
                axios.get(`${API}/public/supermarkets`)
            ]);
            setProducts(productsRes.data);
            setSupermarkets(supermarketsRes.data);
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
        setAnalyticsLoading(true);
        try {
            const params = selectedSupermarket ? `?supermarket_id=${selectedSupermarket}` : '';
            const response = await axios.get(`${API}/analytics/product/${selectedProduct}${params}`);
            setProductAnalytics(response.data);
        } catch (error) {
            toast.error("Error al cargar análisis");
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const fetchComparison = async () => {
        if (!selectedProduct) {
            toast.error("Selecciona un producto");
            return;
        }
        setAnalyticsLoading(true);
        try {
            const response = await axios.get(`${API}/analytics/compare/${selectedProduct}`);
            setComparison(response.data);
        } catch (error) {
            toast.error("Error al cargar comparación");
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg p-3 shadow-lg">
                    <p className="text-sm text-slate-500">{formatDate(label)}</p>
                    <p className="font-mono font-semibold text-emerald-600">
                        {payload[0].value.toFixed(2)} €
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
                        Análisis de Precios
                    </h1>
                    <p className="text-slate-500 mt-1">Explora la evolución y compara precios</p>
                </div>

                {/* Filters */}
                <Card className="border-slate-200" data-testid="filters-card">
                    <CardContent className="p-6">
                        <div className="grid md:grid-cols-4 gap-4 items-end">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Producto</label>
                                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                                    <SelectTrigger data-testid="product-select">
                                        <SelectValue placeholder="Selecciona producto" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.map((p) => (
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
                                        <SelectItem value="">Todos</SelectItem>
                                        {supermarkets.map((sm) => (
                                            <SelectItem key={sm.id} value={sm.id}>{sm.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button 
                                onClick={fetchProductAnalytics}
                                disabled={analyticsLoading}
                                className="bg-emerald-500 hover:bg-emerald-600 gap-2"
                                data-testid="analyze-btn"
                            >
                                <TrendingUp className="w-4 h-4" />
                                Ver Evolución
                            </Button>
                            <Button 
                                onClick={fetchComparison}
                                disabled={analyticsLoading}
                                variant="outline"
                                className="gap-2"
                                data-testid="compare-btn"
                            >
                                <BarChart3 className="w-4 h-4" />
                                Comparar Supers
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Analytics Results */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Price Evolution Chart */}
                    {productAnalytics && (
                        <Card className="border-slate-200" data-testid="evolution-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                                    Evolución de Precio
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
                                        {/* Stats */}
                                        <div className="grid grid-cols-4 gap-4 mb-6">
                                            <div className="text-center p-3 bg-slate-50 rounded-lg">
                                                <p className="text-xs text-slate-500">Actual</p>
                                                <p className="font-mono font-semibold text-slate-900">
                                                    {productAnalytics.current_price?.toFixed(2)} €
                                                </p>
                                            </div>
                                            <div className="text-center p-3 bg-slate-50 rounded-lg">
                                                <p className="text-xs text-slate-500">Media</p>
                                                <p className="font-mono font-semibold text-slate-900">
                                                    {productAnalytics.avg_price?.toFixed(2)} €
                                                </p>
                                            </div>
                                            <div className="text-center p-3 bg-emerald-50 rounded-lg">
                                                <p className="text-xs text-emerald-600">Mínimo</p>
                                                <p className="font-mono font-semibold text-emerald-600">
                                                    {productAnalytics.min_price?.toFixed(2)} €
                                                </p>
                                            </div>
                                            <div className="text-center p-3 bg-rose-50 rounded-lg">
                                                <p className="text-xs text-rose-600">Máximo</p>
                                                <p className="font-mono font-semibold text-rose-600">
                                                    {productAnalytics.max_price?.toFixed(2)} €
                                                </p>
                                            </div>
                                        </div>

                                        {/* Chart */}
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={productAnalytics.price_history}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                    <XAxis 
                                                        dataKey="date" 
                                                        tickFormatter={formatDate}
                                                        tick={{ fontSize: 12, fill: '#64748b' }}
                                                    />
                                                    <YAxis 
                                                        tick={{ fontSize: 12, fill: '#64748b' }}
                                                        tickFormatter={(v) => `${v}€`}
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
                                    Comparación por Supermercado
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-4">
                                    <h3 className="font-semibold text-slate-900">{comparison.product_name}</h3>
                                </div>

                                {comparison.comparison?.length > 0 ? (
                                    <>
                                        {/* Best Price Highlight */}
                                        {comparison.best_price && (
                                            <div className="mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm text-emerald-600 font-medium">Mejor Precio</p>
                                                        <p className="font-semibold text-slate-900">{comparison.best_price.supermarket_name}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-mono text-2xl font-bold text-emerald-600">
                                                            {comparison.best_price.price.toFixed(2)} €
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Bar Chart */}
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={comparison.comparison} layout="vertical">
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                    <XAxis 
                                                        type="number" 
                                                        tick={{ fontSize: 12, fill: '#64748b' }}
                                                        tickFormatter={(v) => `${v}€`}
                                                    />
                                                    <YAxis 
                                                        type="category" 
                                                        dataKey="supermarket_name" 
                                                        tick={{ fontSize: 12, fill: '#64748b' }}
                                                        width={100}
                                                    />
                                                    <Tooltip 
                                                        formatter={(value) => [`${value.toFixed(2)} €`, 'Precio']}
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
                                            {comparison.comparison.map((item, index) => (
                                                <div 
                                                    key={index}
                                                    className={`flex items-center justify-between p-3 rounded-lg ${
                                                        index === 0 ? 'bg-emerald-50' : 'bg-slate-50'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {index === 0 && <TrendingDown className="w-4 h-4 text-emerald-600" />}
                                                        <span className="text-slate-700">{item.supermarket_name}</span>
                                                    </div>
                                                    <span className={`font-mono font-semibold ${
                                                        index === 0 ? 'text-emerald-600' : 'text-slate-900'
                                                    }`}>
                                                        {item.price.toFixed(2)} €
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

                {/* Empty State */}
                {!productAnalytics && !comparison && (
                    <Card className="border-slate-200">
                        <CardContent className="p-12 text-center">
                            <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 text-lg">Selecciona un producto</p>
                            <p className="text-sm text-slate-400 mt-1">Y pulsa en analizar para ver los datos</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </Layout>
    );
};

export default AnalyticsPage;
