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

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* User Card */}
                    <Card className="border-slate-200 lg:col-span-1">
                        <CardContent className="p-6 text-center">
                            <Avatar className="w-24 h-24 mx-auto mb-4">
                                <AvatarImage src={user?.picture} />
                                <AvatarFallback className="bg-emerald-100 text-emerald-600 text-2xl">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                                {user?.name}
                            </h2>
                            <p className="text-slate-500 text-sm">{user?.email}</p>
                            
                            {user?.role === 'admin' && (
                                <Badge className="mt-2 bg-emerald-500">Administrador</Badge>
                            )}

                            {/* Points Display */}
                            <div className="mt-6 p-4 bg-emerald-50 rounded-xl">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Star className="w-6 h-6 text-emerald-500" />
                                    <span className="text-3xl font-bold text-emerald-600 font-mono">
                                        {pointsData?.points || user?.points || 0}
                                    </span>
                                </div>
                                <p className="text-sm text-emerald-600">Puntos totales</p>
                                {pointsData?.rank && (
                                    <div className="flex items-center justify-center gap-2 mt-3">
                                        <Trophy className="w-4 h-4 text-amber-500" />
                                        <span className="text-sm text-slate-600">
                                            Posición #{pointsData.rank} en el ranking
                                        </span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Points History & Leaderboard */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Leaderboard */}
                        <Card className="border-slate-200">
                            <CardHeader className="border-b border-slate-100">
                                <CardTitle className="flex items-center gap-2 text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>
                                    <Trophy className="w-5 h-5 text-amber-500" />
                                    Top Contribuidores
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {loading ? (
                                    <div className="p-6 text-center text-slate-500">Cargando...</div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {leaderboard.map((entry) => (
                                            <div 
                                                key={entry.user_id} 
                                                className={`p-4 flex items-center justify-between ${
                                                    entry.user_id === user?.id ? 'bg-emerald-50' : ''
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {getRankBadge(entry.rank)}
                                                    <span className={`font-medium ${
                                                        entry.user_id === user?.id ? 'text-emerald-600' : 'text-slate-900'
                                                    }`}>
                                                        {entry.user_name}
                                                        {entry.user_id === user?.id && " (Tú)"}
                                                    </span>
                                                </div>
                                                <span className="font-mono font-semibold text-slate-700">
                                                    {entry.points} pts
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Points */}
                        <Card className="border-slate-200">
                            <CardHeader className="border-b border-slate-100">
                                <CardTitle className="flex items-center gap-2 text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>
                                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                                    Historial de Puntos
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {loading ? (
                                    <div className="p-6 text-center text-slate-500">Cargando...</div>
                                ) : pointsData?.history?.length > 0 ? (
                                    <div className="divide-y divide-slate-100">
                                        {pointsData.history.map((entry, index) => (
                                            <div key={index} className="p-4 flex items-center justify-between">
                                                <div>
                                                    <p className="text-slate-900">{entry.reason}</p>
                                                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                                        <Clock className="w-3 h-3" />
                                                        {formatDate(entry.created_at)}
                                                    </p>
                                                </div>
                                                <span className="font-mono font-semibold text-emerald-600">
                                                    +{entry.points}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-6 text-center text-slate-500">
                                        No hay historial de puntos
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Notifications */}
                <Card className="border-slate-200">
                    <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>
                            <Bell className="w-5 h-5 text-emerald-500" />
                            Notificaciones
                        </CardTitle>
                        {notifications.some(n => !n.read) && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={handleMarkAllRead}
                                className="text-slate-500 hover:text-emerald-600"
                            >
                                Marcar todas como leídas
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-6 text-center text-slate-500">Cargando...</div>
                        ) : notifications.length > 0 ? (
                            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                                {notifications.map((notification) => (
                                    <div 
                                        key={notification.id} 
                                        className={`p-4 flex items-start justify-between ${
                                            !notification.read ? 'bg-emerald-50' : ''
                                        }`}
                                    >
                                        <div className="flex-1">
                                            <p className={`font-medium ${
                                                !notification.read ? 'text-slate-900' : 'text-slate-600'
                                            }`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-sm text-slate-500 mt-1">{notification.message}</p>
                                            <p className="text-xs text-slate-400 mt-2">
                                                {formatDate(notification.created_at)}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleMarkRead(notification.id)}
                                                className="text-emerald-600 hover:bg-emerald-100"
                                            >
                                                <Check className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center">
                                <BellOff className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500">No hay notificaciones</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
};

export default ProfilePage;
