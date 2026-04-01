import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Package, Hexagon, Store, Users, TrendingUp, Clock, ArrowUpRight, Plus } from "lucide-react";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";

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
            color: "text-primary",
            bg: "bg-primary/10"
        },
        { 
            label: "Precios",
            value: stats?.total_prices || 0, 
            icon: <Hexagon className="w-6 h-6" />,
            color: "text-primary",
            bg: "bg-primary/10"
        },
        { 
            label: "Supermercados", 
            value: stats?.total_supermarkets || 0, 
            icon: <Store className="w-6 h-6" />,
            color: "text-secondary",
            bg: "bg-secondary/5"
        },
        { 
            label: "Comunidad",
            value: stats?.total_users || 0, 
            icon: <Users className="w-6 h-6" />,
            color: "text-secondary",
            bg: "bg-secondary/5"
        },
    ];

    return (
        <Layout>
            <div className="space-y-8 animate-fade-in-up" data-testid="dashboard-page">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-heading">
                            Dashboard
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">Estado actual del ecosistema PriceHive</p>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/shopping-list">
                            <Button className="rounded-xl px-6 btn-lift shadow-lg shadow-primary/20">
                                <Plus className="w-5 h-5 mr-2" />
                                Nueva Lista
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {statCards.map((stat, index) => (
                        <Card 
                            key={index} 
                            className="border-border/50 shadow-sm overflow-hidden group hover:border-primary/30 transition-all duration-300"
                            data-testid={`stat-card-${index}`}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">{stat.label}</p>
                                        <p className="text-4xl font-black text-secondary tracking-tighter">
                                            {loading ? "..." : stat.value.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl transition-transform group-hover:scale-110 duration-300`}>
                                        {stat.icon}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Recent Activity */}
                <div className="grid lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-2 border-border/50 shadow-sm" data-testid="recent-activity-card">
                        <CardHeader className="border-b border-border/40 bg-stone-50/50">
                            <CardTitle className="flex items-center justify-between text-xl font-bold text-secondary font-heading">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-primary" />
                                    Actividad de la Comunidad
                                </div>
                                <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/5 font-bold">
                                    Ver todo
                                    <ArrowUpRight className="w-4 h-4 ml-1" />
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="p-12 text-center text-muted-foreground font-medium animate-pulse">Analizando datos...</div>
                            ) : stats?.recent_activity?.length > 0 ? (
                                <div className="divide-y divide-border/30">
                                    {stats.recent_activity.map((activity, index) => (
                                        <div key={index} className="p-5 hover:bg-stone-50/80 transition-colors group">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary">
                                            <Package className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-secondary text-lg">{activity.product_name}</p>
                                                        <p className="text-sm font-semibold text-muted-foreground">{activity.supermarket_name}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-black text-secondary tracking-tight">
                                                        {activity.price.toFixed(2)} <span className="text-sm font-bold text-muted-foreground">€</span>
                                                    </p>
                                                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase flex items-center gap-1 justify-end mt-1">
                                                        <Clock className="w-3 h-3" />
                                                        {formatDate(activity.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-16 text-center">
                                    <div className="w-20 h-20 rounded-[2rem] bg-stone-100 flex items-center justify-center mx-auto mb-6">
                                        <Hexagon className="w-10 h-10 text-muted-foreground/30" />
                                    </div>
                                    <p className="text-secondary font-bold text-lg">No hay actividad reciente</p>
                                    <p className="text-muted-foreground font-medium mt-1">Los precios registrados por la comunidad aparecerán aquí</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Tips / Sidebar */}
                    <div className="space-y-6">
                        <Card className="border-slate-200 bg-white overflow-hidden relative">
                            <CardContent className="p-6 relative">
                                <h3 className="text-primary font-bold text-sm mb-2 uppercase tracking-tight">Tip de Ahorro</h3>
                                <p className="text-slate-600 font-medium leading-relaxed text-sm">
                                    Los precios de los productos básicos suelen fluctuar más los martes. ¡Atento a los cambios!
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-border/50 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-bold text-secondary">Tu Impacto</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-border/40">
                                    <span className="text-sm font-bold text-muted-foreground">Precios aportados</span>
                                    <span className="font-black text-primary">12</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-border/40">
                                    <span className="text-sm font-bold text-muted-foreground">Ranking comunidad</span>
                                    <span className="font-black text-secondary">#432</span>
                                </div>
                                <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl py-6">
                                    Ver Perfil Completo
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
