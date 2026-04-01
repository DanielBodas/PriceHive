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
    Check,
    Hexagon
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
        if (rank === 1) return <Badge className="bg-primary text-white border-none font-bold">🥇 1º</Badge>;
        if (rank === 2) return <Badge className="bg-slate-400 text-white border-none font-bold">🥈 2º</Badge>;
        if (rank === 3) return <Badge className="bg-amber-700 text-white border-none font-bold">🥉 3º</Badge>;
        return <Badge variant="outline" className="font-bold border-border">{rank}º</Badge>;
    };

    return (
        <Layout>
            <div className="space-y-8 animate-fade-in-up" data-testid="profile-page">
                {/* Header */}
                <div>
                    <h1 className="text-4xl font-extrabold text-secondary tracking-tight font-heading">
                        Mi Perfil
                    </h1>
                    <p className="text-muted-foreground font-medium mt-1">Gestiona tu identidad y tus contribuciones a la comunidad</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* User Card */}
                    <Card className="border-border/50 shadow-sm lg:col-span-1 rounded-[2rem] overflow-hidden">
                        <div className="h-32 bg-primary/10 relative">
                            <div className="absolute inset-0 hive-pattern opacity-20" />
                        </div>
                        <CardContent className="p-8 pt-0 text-center relative">
                            <div className="relative -mt-16 mb-6 inline-block">
                                <Avatar className="w-32 h-32 mx-auto border-4 border-white shadow-xl">
                                    <AvatarImage src={user?.picture} />
                                    <AvatarFallback className="bg-primary text-white text-3xl font-black">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-2 -right-2 bg-secondary text-white p-2 rounded-xl shadow-lg border-2 border-white">
                                    <Hexagon className="w-5 h-5 fill-primary text-primary" />
                                </div>
                            </div>

                            <h2 className="text-2xl font-black text-secondary tracking-tight font-heading">
                                {user?.name}
                            </h2>
                            <p className="text-muted-foreground font-semibold text-sm mb-4">{user?.email}</p>
                            
                            {user?.role === 'admin' && (
                                <Badge className="bg-secondary text-white font-bold uppercase tracking-widest text-[10px] px-3 py-1">Administrador</Badge>
                            )}

                            {/* Points Display */}
                            <div className="mt-8 p-6 bg-stone-50 rounded-[1.5rem] border border-border/60 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-2 opacity-5 transition-transform group-hover:rotate-12">
                                    <Hexagon className="w-16 h-16 text-primary fill-primary" />
                                </div>
                                <div className="flex items-center justify-center gap-3 mb-2 relative">
                                    <Star className="w-8 h-8 text-primary fill-primary" />
                                    <span className="text-4xl font-black text-secondary tracking-tighter">
                                        {pointsData?.points || user?.points || 0}
                                    </span>
                                </div>
                                <p className="text-xs font-black text-primary uppercase tracking-[0.2em]">Puntos de Colmena</p>
                                {pointsData?.rank && (
                                    <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-border/40">
                                        <Trophy className="w-4 h-4 text-amber-500" />
                                        <span className="text-sm font-bold text-secondary">
                                            Posición <span className="text-primary font-black">#{pointsData.rank}</span> global
                                        </span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Points History & Leaderboard */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Leaderboard */}
                        <Card className="border-border/50 shadow-sm rounded-[1.5rem] overflow-hidden">
                            <CardHeader className="border-b border-border/40 bg-stone-50/50">
                                <CardTitle className="flex items-center gap-2 text-xl font-bold text-secondary font-heading">
                                    <Trophy className="w-5 h-5 text-primary" />
                                    Top Contribuidores
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {loading ? (
                                    <div className="p-8 text-center text-muted-foreground animate-pulse">Consultando ranking...</div>
                                ) : (
                                    <div className="divide-y divide-border/30">
                                        {leaderboard.map((entry) => (
                                            <div 
                                                key={entry.user_id} 
                                                className={`p-5 flex items-center justify-between transition-colors ${
                                                    entry.user_id === user?.id ? 'bg-primary/5' : 'hover:bg-stone-50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 flex justify-center">
                                                        {getRankBadge(entry.rank)}
                                                    </div>
                                                    <span className={`font-bold ${
                                                        entry.user_id === user?.id ? 'text-primary' : 'text-secondary'
                                                    }`}>
                                                        {entry.user_name}
                                                        {entry.user_id === user?.id && <span className="ml-2 text-[10px] bg-primary text-white px-1.5 py-0.5 rounded-md uppercase font-black tracking-tighter">Tú</span>}
                                                    </span>
                                                </div>
                                                <span className="font-mono font-black text-secondary">
                                                    {entry.points} <span className="text-[10px] text-muted-foreground uppercase font-bold">pts</span>
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Points */}
                        <Card className="border-border/50 shadow-sm rounded-[1.5rem] overflow-hidden">
                            <CardHeader className="border-b border-border/40 bg-stone-50/50">
                                <CardTitle className="flex items-center gap-2 text-xl font-bold text-secondary font-heading">
                                    <TrendingUp className="w-5 h-5 text-primary" />
                                    Historial de Impacto
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {loading ? (
                                    <div className="p-8 text-center text-muted-foreground animate-pulse">Analizando contribuciones...</div>
                                ) : pointsData?.history?.length > 0 ? (
                                    <div className="divide-y divide-border/30">
                                        {pointsData.history.map((entry, index) => (
                                            <div key={index} className="p-5 flex items-center justify-between hover:bg-stone-50 transition-colors">
                                                <div>
                                                    <p className="text-secondary font-bold">{entry.reason}</p>
                                                    <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1 mt-1">
                                                        <Clock className="w-3 h-3" />
                                                        {formatDate(entry.created_at)}
                                                    </p>
                                                </div>
                                                <span className="text-xl font-black text-primary tracking-tighter">
                                                    +{entry.points}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center">
                                        <Star className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                                        <p className="text-muted-foreground font-medium">Aún no has aportado datos a la comunidad</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Notifications */}
                <Card className="border-border/50 shadow-sm rounded-[2rem] overflow-hidden">
                    <CardHeader className="border-b border-border/40 bg-stone-50/50 flex flex-row items-center justify-between py-6 px-8">
                        <CardTitle className="flex items-center gap-3 text-xl font-bold text-secondary font-heading">
                            <Bell className="w-6 h-6 text-primary" />
                            Notificaciones
                        </CardTitle>
                        {notifications.some(n => !n.read) && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={handleMarkAllRead}
                                className="text-primary hover:text-primary hover:bg-primary/5 font-black uppercase text-[10px] tracking-widest"
                            >
                                Marcar todas como leídas
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-12 text-center text-muted-foreground animate-pulse">Sincronizando...</div>
                        ) : notifications.length > 0 ? (
                            <div className="divide-y divide-border/30 max-h-96 overflow-y-auto">
                                {notifications.map((notification) => (
                                    <div 
                                        key={notification.id} 
                                        className={`p-6 flex items-start justify-between transition-colors ${
                                            !notification.read ? 'bg-primary/5' : 'hover:bg-stone-50/50'
                                        }`}
                                    >
                                        <div className="flex-1">
                                            <p className={`font-bold ${
                                                !notification.read ? 'text-secondary' : 'text-muted-foreground'
                                            }`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-sm text-muted-foreground font-medium mt-1">{notification.message}</p>
                                            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase mt-3 tracking-wider">
                                                {formatDate(notification.created_at)}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleMarkRead(notification.id)}
                                                className="text-primary hover:bg-primary/10 rounded-xl"
                                            >
                                                <Check className="w-5 h-5" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-16 text-center">
                                <BellOff className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                                <p className="text-muted-foreground font-bold">Silencio en la colmena. No hay notificaciones.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
};

export default ProfilePage;
