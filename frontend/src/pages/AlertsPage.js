import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { toast } from "sonner";
import { Bell, Plus, Trash2, Check, AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AlertsPage = () => {
    const [alerts, setAlerts] = useState([]);
    const [products, setProducts] = useState([]);
    const [supermarkets, setSupermarkets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Form state
    const [selectedProduct, setSelectedProduct] = useState("");
    const [selectedSupermarket, setSelectedSupermarket] = useState("");
    const [targetPrice, setTargetPrice] = useState("");
    const [alertType, setAlertType] = useState("below");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [alertsRes, productsRes, supermarketsRes] = await Promise.all([
                axios.get(`${API}/alerts`),
                axios.get(`${API}/public/products`),
                axios.get(`${API}/public/supermarkets`)
            ]);
            setAlerts(alertsRes.data);
            setProducts(productsRes.data);
            setSupermarkets(supermarketsRes.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAlert = async () => {
        if (!selectedProduct || !targetPrice) {
            toast.error("Selecciona un producto y precio objetivo");
            return;
        }

        try {
            await axios.post(`${API}/alerts`, {
                product_id: selectedProduct,
                supermarket_id: selectedSupermarket || null,
                target_price: parseFloat(targetPrice),
                alert_type: alertType
            });
            toast.success("Alerta creada");
            setDialogOpen(false);
            setSelectedProduct("");
            setSelectedSupermarket("");
            setTargetPrice("");
            setAlertType("below");
            fetchData();
        } catch (error) {
            toast.error("Error al crear alerta");
        }
    };

    const handleDeleteAlert = async (alertId) => {
        try {
            await axios.delete(`${API}/alerts/${alertId}`);
            setAlerts(alerts.filter(a => a.id !== alertId));
            toast.success("Alerta eliminada");
        } catch (error) {
            toast.error("Error al eliminar alerta");
        }
    };

    const getAlertTypeIcon = (type) => {
        switch (type) {
            case "below":
                return <TrendingDown className="w-4 h-4 text-emerald-500" />;
            case "above":
                return <TrendingUp className="w-4 h-4 text-rose-500" />;
            default:
                return <AlertTriangle className="w-4 h-4 text-amber-500" />;
        }
    };

    const getAlertTypeLabel = (type) => {
        switch (type) {
            case "below":
                return "Cuando baje de";
            case "above":
                return "Cuando suba de";
            default:
                return "Cualquier cambio";
        }
    };

    return (
        <Layout>
            <div className="space-y-6" data-testid="alerts-page">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                            Alertas de Precio
                        </h1>
                        <p className="text-slate-500 mt-1">Recibe notificaciones cuando cambien los precios</p>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-emerald-500 hover:bg-emerald-600 gap-2" data-testid="create-alert-btn">
                                <Plus className="w-4 h-4" />
                                Nueva Alerta
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle style={{ fontFamily: 'Manrope, sans-serif' }}>Crear Alerta de Precio</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label>Producto</Label>
                                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                                        <SelectTrigger data-testid="alert-product-select">
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
                                    <Label>Supermercado (opcional)</Label>
                                    <Select value={selectedSupermarket} onValueChange={setSelectedSupermarket}>
                                        <SelectTrigger data-testid="alert-supermarket-select">
                                            <SelectValue placeholder="Cualquier supermercado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="any">Cualquier supermercado</SelectItem>
                                            {supermarkets.map((sm) => (
                                                <SelectItem key={sm.id} value={sm.id}>{sm.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Tipo de Alerta</Label>
                                    <Select value={alertType} onValueChange={setAlertType}>
                                        <SelectTrigger data-testid="alert-type-select">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="below">Cuando baje de precio</SelectItem>
                                            <SelectItem value="above">Cuando suba de precio</SelectItem>
                                            <SelectItem value="any_change">Cualquier cambio</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {alertType !== "any_change" && (
                                    <div className="space-y-2">
                                        <Label>Precio Objetivo (€)</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={targetPrice}
                                            onChange={(e) => setTargetPrice(e.target.value)}
                                            data-testid="alert-price-input"
                                        />
                                    </div>
                                )}
                                <Button 
                                    onClick={handleCreateAlert} 
                                    className="w-full bg-emerald-500 hover:bg-emerald-600"
                                    data-testid="save-alert-btn"
                                >
                                    Crear Alerta
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Alerts List */}
                {loading ? (
                    <div className="text-center py-12 text-slate-500">Cargando alertas...</div>
                ) : alerts.length === 0 ? (
                    <Card className="border-slate-200">
                        <CardContent className="p-12 text-center">
                            <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 text-lg">No tienes alertas configuradas</p>
                            <p className="text-sm text-slate-400 mt-1">Crea una alerta para recibir notificaciones de cambios de precio</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {alerts.map((alert) => (
                            <Card 
                                key={alert.id} 
                                className={`border ${alert.triggered ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200'}`}
                                data-testid={`alert-card-${alert.id}`}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                {getAlertTypeIcon(alert.alert_type)}
                                                <span className="text-xs text-slate-500">
                                                    {getAlertTypeLabel(alert.alert_type)}
                                                </span>
                                                {alert.triggered && (
                                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full flex items-center gap-1">
                                                        <Check className="w-3 h-3" />
                                                        Activada
                                                    </span>
                                                )}
                                            </div>
                                            <p className="font-medium text-slate-900">{alert.product_name}</p>
                                            <p className="text-sm text-slate-500 mt-1">
                                                {alert.supermarket_name || "Cualquier supermercado"}
                                            </p>
                                            {alert.alert_type !== "any_change" && (
                                                <p className="font-mono font-semibold text-lg text-emerald-600 mt-2">
                                                    {alert.target_price.toFixed(2)} €
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteAlert(alert.id)}
                                            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                            data-testid={`delete-alert-${alert.id}`}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default AlertsPage;
