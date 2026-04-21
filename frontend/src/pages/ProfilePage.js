import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { 
    User, 
    Trophy, 
    Star, 
    TrendingUp, 
    Clock,
    Bell,
    BellOff,
    Check
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProfilePage = () => {
    const { user } = useAuth();
    const [pointsData, setPointsData] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [pointsRes, notificationsRes, leaderboardRes] = await Promise.all([
                axios.get(`${API}/my-points`),
                axios.get(`${API}/notifications`),
                axios.get(`${API}/leaderboard?limit=5`)
            ]);
            setPointsData(pointsRes.data);
            setNotifications(notificationsRes.data);
            setLeaderboard(leaderboardRes.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRead = async (notificationId) => {
        try {
            await axios.put(`${API}/notifications/${notificationId}/read`);
            setNotifications(notifications.map(n => 
                n.id === notificationId ? { ...n, read: true } : n
            ));
        } catch (error) {
            toast.error("Error al marcar como leída");
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await axios.put(`${API}/notifications/read-all`);
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            toast.success("Todas las notificaciones marcadas como leídas");
        } catch (error) {
            toast.error("Error al marcar notificaciones");
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

    const getRankBadge = (rank) => {
        if (rank === 1) return <Badge className="bg-amber-500">🥇 1º</Badge>;
        if (rank === 2) return <Badge className="bg-slate-400">🥈 2º</Badge>;
        if (rank === 3) return <Badge className="bg-amber-700">🥉 3º</Badge>;
        return <Badge variant="outline">{rank}º</Badge>;
    };

    return (
        <Layout>
            <div className="space-y-6" data-testid="profile-page">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        Mi Perfil
                    </h1>
                    <p className="text-slate-500 mt-1">Tu actividad y puntuación en PriceHive</p>
                </div>

                <div className="grid lg:grid-cols-12 gap-6">
                    {/* Lateral Izquierda: Perfil y Ranking */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="border-slate-200 shadow-sm overflow-hidden">
                            <div className="h-24 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
                            <CardContent className="p-6 -mt-12 text-center">
                                <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-white shadow-lg">
                                    <AvatarImage src={user?.picture} />
                                    <AvatarFallback className="bg-emerald-100 text-emerald-600 text-2xl font-bold">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                                    {user?.name}
                                </h2>
                                <p className="text-slate-500 text-sm">{user?.email}</p>
                                
                                {user?.role === 'admin' && (
                                    <Badge className="mt-2 bg-slate-900">ADMIN</Badge>
                                )}

                                <div className="mt-8 grid grid-cols-2 gap-4 border-t pt-6">
                                    <div className="text-center border-r">
                                        <p className="text-2xl font-bold text-emerald-600">{pointsData?.points || user?.points || 0}</p>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Puntos</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-amber-500">#{pointsData?.rank || "-"}</p>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Ranking</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Leaderboard en el lateral */}
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-widest font-bold text-slate-500">
                                    <Trophy className="w-4 h-4 text-amber-500" />
                                    Top Contribuidores
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {loading ? (
                                    <div className="p-4 text-center text-xs text-slate-400">Cargando...</div>
                                ) : (
                                    <div className="divide-y divide-slate-50">
                                        {leaderboard.map((entry) => (
                                            <div 
                                                key={entry.user_id} 
                                                className={`p-3 px-4 flex items-center justify-between text-sm ${
                                                    entry.user_id === user?.id ? 'bg-emerald-50/50' : ''
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="w-5 text-xs font-bold text-slate-400">{entry.rank}º</span>
                                                    <span className={`font-medium ${
                                                        entry.user_id === user?.id ? 'text-emerald-700' : 'text-slate-700'
                                                    }`}>
                                                        {entry.user_name}
                                                    </span>
                                                </div>
                                                <span className="font-mono text-xs font-bold text-slate-500">
                                                    {entry.points}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Contenido Principal: Actividad y Notificaciones */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Notificaciones (Prioridad) */}
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-50">
                                <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
                                    <Bell className="w-5 h-5 text-emerald-500" />
                                    Avisos y Notificaciones
                                </CardTitle>
                                {notifications.some(n => !n.read) && (
                                    <Button 
                                        variant="link" 
                                        size="sm" 
                                        onClick={handleMarkAllRead}
                                        className="text-emerald-600 text-xs h-auto p-0"
                                    >
                                        Marcar todo como leído
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="p-0">
                                {loading ? (
                                    <div className="p-6 text-center text-slate-400">Cargando...</div>
                                ) : notifications.length > 0 ? (
                                    <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
                                        {notifications.map((notification) => (
                                            <div 
                                                key={notification.id} 
                                                className={`p-4 flex items-start gap-4 transition-colors ${
                                                    !notification.read ? 'bg-emerald-50/30' : ''
                                                }`}
                                            >
                                                <div className={`mt-1 p-2 rounded-full ${notification.notification_type === 'warning' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                    {notification.notification_type === 'warning' ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className={`font-bold text-sm ${!notification.read ? 'text-slate-900' : 'text-slate-700'}`}>
                                                            {notification.title}
                                                        </p>
                                                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                                            {formatDate(notification.created_at)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{notification.message}</p>
                                                </div>
                                                {!notification.read && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleMarkRead(notification.id)}
                                                        className="h-8 w-8 text-emerald-600 hover:bg-emerald-100"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center">
                                        <BellOff className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                                        <p className="text-sm text-slate-500 font-medium">No tienes notificaciones pendientes</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Historial de Puntos */}
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="pb-3 border-b border-slate-50">
                                <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
                                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                                    Actividad de Puntos
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {loading ? (
                                    <div className="p-6 text-center text-slate-400 text-xs">Cargando...</div>
                                ) : pointsData?.history?.length > 0 ? (
                                    <div className="divide-y divide-slate-50">
                                        {pointsData.history.map((entry, index) => (
                                            <div key={index} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${entry.points >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                        <Clock className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-800">{entry.reason}</p>
                                                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                                            {formatDate(entry.created_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className={`font-mono font-bold text-sm ${entry.points >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {entry.points >= 0 ? `+${entry.points}` : entry.points}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center text-slate-500 text-sm">
                                        Aún no has ganado puntos. ¡Empieza a reportar precios!
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

            </div>
        </Layout>
    );
};

export default ProfilePage;
