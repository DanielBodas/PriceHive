import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Package, Tag, Store, Users, TrendingUp, Clock } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axios.get(`${API}/analytics/stats`);
            setStats(response.data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { 
            day: 'numeric', 
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const statCards = [
        { 
            label: "Productos", 
            value: stats?.total_products || 0, 
            icon: <Package className="w-6 h-6" />,
            color: "bg-emerald-500"
        },
        { 
            label: "Precios Registrados", 
            value: stats?.total_prices || 0, 
            icon: <Tag className="w-6 h-6" />,
            color: "bg-lime-500"
        },
        { 
            label: "Supermercados", 
            value: stats?.total_supermarkets || 0, 
            icon: <Store className="w-6 h-6" />,
            color: "bg-slate-700"
        },
        { 
            label: "Usuarios", 
            value: stats?.total_users || 0, 
            icon: <Users className="w-6 h-6" />,
            color: "bg-rose-500"
        },
    ];

    return (
        <Layout>
            <div className="space-y-8" data-testid="dashboard-page">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        Dashboard
                    </h1>
                    <p className="text-slate-500 mt-1">Resumen de la actividad de PriceHive</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((stat, index) => (
                        <Card 
                            key={index} 
                            className="border-slate-200 stats-card overflow-hidden"
                            data-testid={`stat-card-${index}`}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
                                        <p className="text-3xl font-bold text-slate-900 font-mono">
                                            {loading ? "..." : stat.value.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className={`${stat.color} text-white p-3 rounded-xl`}>
                                        {stat.icon}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Recent Activity */}
                <Card className="border-slate-200" data-testid="recent-activity-card">
                    <CardHeader className="border-b border-slate-100">
                        <CardTitle className="flex items-center gap-2 text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                            Actividad Reciente
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-8 text-center text-slate-500">Cargando...</div>
                        ) : stats?.recent_activity?.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {stats.recent_activity.map((activity, index) => (
                                    <div key={index} className="p-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                                    <Tag className="w-5 h-5 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">{activity.product_name}</p>
                                                    <p className="text-sm text-slate-500">{activity.supermarket_name}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-mono font-semibold text-slate-900">
                                                    {activity.price.toFixed(2)} €
                                                </p>
                                                <p className="text-xs text-slate-400 flex items-center gap-1 justify-end">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDate(activity.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                    <Tag className="w-8 h-8 text-slate-400" />
                                </div>
                                <p className="text-slate-500">No hay actividad reciente</p>
                                <p className="text-sm text-slate-400 mt-1">Los precios registrados aparecerán aquí</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
};

export default Dashboard;
