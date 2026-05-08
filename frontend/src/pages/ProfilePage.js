import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { toast } from "sonner";
import {
    Trophy,
    TrendingUp,
    TrendingDown,
    Clock,
    Bell,
    BellOff,
    Check,
    Sparkles,
    Shield,
    Activity,
    ChevronDown,
    ChevronUp,
    Coins,
    CreditCard,
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ─── helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const RANK_META = [
    { min: 1,  max: 1,    emoji: "🥇", label: "Oro",     color: "text-amber-500",  bg: "bg-amber-50",   border: "border-amber-200" },
    { min: 2,  max: 2,    emoji: "🥈", label: "Plata",   color: "text-slate-400",  bg: "bg-slate-100",  border: "border-slate-200" },
    { min: 3,  max: 3,    emoji: "🥉", label: "Bronce",  color: "text-orange-600", bg: "bg-orange-50",  border: "border-orange-200" },
    { min: 4,  max: 10,   emoji: "⭐", label: "Top 10",  color: "text-primary",   bg: "bg-primary/10", border: "border-primary/20" },
    { min: 11, max: 9999, emoji: "👤", label: "Miembro", color: "text-slate-500",  bg: "bg-slate-50",   border: "border-slate-100" },
];
const getRankMeta = (rank) =>
    RANK_META.find((r) => rank >= r.min && rank <= r.max) ?? RANK_META[RANK_META.length - 1];

const PAGE_SIZE = 5;

const LEVELS = [
    { min: 0, label: "Nivel 1", perk: "Base: puedes subir precios y ganar creditos." },
    { min: 100, label: "Nivel 2", perk: "Tus aportes pesan mas en la comunidad." },
    { min: 300, label: "Nivel 3", perk: "Acceso visible a insignia de contribuidor fiable." },
    { min: 700, label: "Nivel 4", perk: "Prioridad futura para revisar precios dudosos." },
    { min: 1500, label: "Nivel Elite", perk: "Feature especial futura: acceso anticipado a herramientas pro." },
];

const getLevelMeta = (points) => {
    const current = [...LEVELS].reverse().find((level) => points >= level.min) || LEVELS[0];
    const currentIndex = LEVELS.findIndex((level) => level.label === current.label);
    const next = LEVELS[currentIndex + 1] || null;
    const progress = next ? Math.min(100, Math.round(((points - current.min) / (next.min - current.min)) * 100)) : 100;
    return { current, next, progress };
};

// ─── small components ─────────────────────────────────────────────────────────

const Skeleton = ({ className = "" }) => (
    <div className={`animate-pulse rounded-lg bg-slate-100 ${className}`} />
);

const EmptyState = ({ icon: Icon, message }) => (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
            <Icon className="w-5 h-5 text-slate-300" />
        </div>
        <p className="text-sm text-slate-400 max-w-[200px] leading-relaxed">{message}</p>
    </div>
);

const ShowMoreBtn = ({ shown, total, expanded, onToggle }) => {
    if (total <= PAGE_SIZE) return null;
    return (
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-slate-500 hover:text-primary border-t border-slate-100 hover:bg-slate-50 transition-colors"
        >
            {expanded ? (
                <><ChevronUp className="w-3.5 h-3.5" /> Ver menos</>
            ) : (
                <><ChevronDown className="w-3.5 h-3.5" /> Ver {total - shown} más</>
            )}
        </button>
    );
};

// ─── main ─────────────────────────────────────────────────────────────────────

const ProfilePage = () => {
    const { user } = useAuth();
    const [pointsData, setPointsData]     = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [leaderboard, setLeaderboard]   = useState([]);
    const [loading, setLoading]           = useState(true);
    const [activeTab, setActiveTab]       = useState("profile");
    const [notiExpanded, setNotiExpanded] = useState(false);
    const [pointsExpanded, setPointsExpanded] = useState(false);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [pointsRes, notifRes, lbRes] = await Promise.all([
                axios.get(`${API}/my-points`),
                axios.get(`${API}/notifications`),
                axios.get(`${API}/leaderboard?limit=10`),
            ]);
            setPointsData(pointsRes.data);
            setNotifications(notifRes.data);
            setLeaderboard(lbRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await axios.put(`${API}/notifications/${id}/read`);
            setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
        } catch {
            toast.error("Error al marcar como leída");
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await axios.put(`${API}/notifications/read-all`);
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            toast.success("Todas las notificaciones leídas");
        } catch {
            toast.error("Error al marcar notificaciones");
        }
    };

    // derived
    const points      = pointsData?.points ?? user?.points ?? 0;
    const credits     = pointsData?.credits ?? user?.credits ?? 0;
    const rank        = pointsData?.rank ?? null;
    const rankMeta    = rank ? getRankMeta(rank) : null;
    const levelMeta   = getLevelMeta(points);
    const unreadCount = notifications.filter((n) => !n.read).length;
    const history     = pointsData?.history ?? [];

    const visibleNotifs  = notiExpanded   ? notifications : notifications.slice(0, PAGE_SIZE);
    const visibleHistory = pointsExpanded ? history       : history.slice(0, PAGE_SIZE);

    const TABS = [
        { id: "profile",       label: "Mi Perfil",      badge: null },
        { id: "notifications", label: "Notificaciones", badge: unreadCount > 0 ? unreadCount : null },
        { id: "points",        label: "Historial",      badge: null },
    ];

    return (
        <Layout>
            <div className="max-w-5xl mx-auto space-y-5 pb-16" data-testid="profile-page">

                {/* ── HERO ─────────────────────────────────────────────────── */}
                <div className="relative overflow-hidden rounded-[24px] honeycomb-header p-6 sm:p-8 text-white shadow-md">
                    {/* Decorative elements */}
                    <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/40" />
                    <div className="absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-white/20" />
                    <img 
                        src="/icon.png" 
                        alt="" 
                        className="absolute -right-4 -bottom-4 w-32 h-32 object-contain opacity-10 pointer-events-none rotate-12" 
                    />

                    <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-end gap-5">
                        {/* avatar */}
                        <div className="relative shrink-0">
                            <Avatar className="w-20 h-20 border-4 border-white/20 shadow-xl ring-4 ring-primary/20">
                                <AvatarFallback className="bg-primary text-white text-2xl font-black font-heading">
                                    {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
                                </AvatarFallback>
                                <AvatarImage src={user?.picture} />
                            </Avatar>
                            {rankMeta && (
                                <span className="absolute -bottom-1 -right-1 text-lg leading-none drop-shadow">
                                    {rankMeta.emoji}
                                </span>
                            )}
                        </div>

                        {/* name */}
                        <div className="flex-1 text-center sm:text-left min-w-0 z-10">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-0.5">
                                <h1 className="text-xl sm:text-2xl font-black text-white truncate font-heading">
                                    {user?.name ?? "Usuario"}
                                </h1>
                                {user?.role === "admin" && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 border border-white/30 text-white text-[10px] font-bold uppercase tracking-widest">
                                        <Shield className="w-3 h-3" /> Admin
                                    </span>
                                )}
                            </div>
                            <p className="text-white/80 text-sm truncate">{user?.email}</p>
                            {rank && (
                                <p className="mt-0.5 text-xs text-white/80">
                                    {rankMeta?.label} · Posición <span className="text-white font-bold">#{rank}</span>
                                </p>
                            )}
                        </div>

                        {/* stat pills */}
                        <div className="w-full sm:w-auto shrink-0 flex divide-x divide-white/20 rounded-2xl bg-white/20 border border-white/20 backdrop-blur-md z-10 overflow-x-auto">
                            {[
                                { icon: Sparkles, label: "Puntos",      val: loading ? "—" : points.toLocaleString("es-ES"), color: "text-white" },
                                { icon: Coins,    label: "Créditos",    val: loading ? "—" : credits.toLocaleString("es-ES"), color: "text-white" },
                                { icon: Trophy,   label: "Ranking",     val: loading ? "—" : rank ? `#${rank}` : "—",        color: "text-white"  },
                                { icon: Activity, label: "Movimientos", val: loading ? "—" : history.length,                 color: "text-white"  },
                            ].map(({ icon: Icon, label, val, color }) => (
                                <div key={label} className="flex-1 sm:flex-none flex flex-col items-center gap-1 px-3 sm:px-5 py-3">
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/80 flex items-center gap-1 whitespace-nowrap">
                                        <Icon className={`w-3 h-3 ${color}`} />{label}
                                    </span>
                                    <span className={`text-base sm:text-xl font-black ${color} font-heading`}>
                                        {val}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── BODY GRID ─────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* ── Left: tabbed content (2/3) ───────────────────────── */}
                    <div className="lg:col-span-2 rounded-[24px] border border-slate-200 bg-white shadow-sm overflow-hidden order-2 lg:order-1">

                        {/* tab bar */}
                        <div className="flex items-center border-b border-slate-100 bg-slate-50/60">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.id}
                                    data-testid={`tab-${tab.id}`}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-colors whitespace-nowrap
                                        ${activeTab === tab.id
                                            ? "text-primary border-b-2 border-primary bg-white -mb-px"
                                            : "text-slate-500 hover:text-slate-700"
                                        }`}
                                >
                                    {tab.label}
                                    {tab.badge && (
                                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold">
                                            {tab.badge}
                                        </span>
                                    )}
                                </button>
                            ))}

                            {activeTab === "notifications" && unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    data-testid="mark-all-read-btn"
                                    className="ml-auto mr-4 text-xs text-primary hover:text-primary/80 font-bold flex items-center gap-1"
                                >
                                    <Check className="w-3 h-3" />
                                    <span className="hidden sm:inline">Marcar leídas</span>
                                    <span className="sm:hidden">Leído</span>
                                </button>
                            )}
                        </div>

                        {/* ── Notifications ──────────────────────────────────── */}
                        {activeTab === "profile" && (
                            <div className="p-6 space-y-8 animate-in fade-in duration-300">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Información Personal</h3>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-500">Nombre de usuario</label>
                                            <input type="text" className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all" defaultValue={user?.name || ""} disabled />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-500">Correo electrónico</label>
                                            <input type="email" className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all" defaultValue={user?.email || ""} disabled />
                                        </div>
                                    </div>
                                    <button className="h-9 px-4 rounded-xl bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 transition-colors">
                                        Editar Perfil
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Saldo y Facturación</h3>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                                <Coins className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Créditos Disponibles</p>
                                                <p className="text-xl font-black text-slate-900 font-heading tabular-nums">{loading ? "—" : credits.toLocaleString("es-ES")}</p>
                                            </div>
                                        </div>
                                        <button className="w-full sm:w-auto h-10 px-4 rounded-xl bg-slate-900 text-white text-sm font-bold shadow-lg hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2">
                                            <CreditCard className="w-4 h-4" />
                                            Comprar Créditos
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-medium">
                                        Los créditos se utilizan para revelar información premium y realizar estimaciones precisas de precios en las listas de compra.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Preferencias de cuenta</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">Recibir Correos</p>
                                                <p className="text-xs text-slate-500">Novedades y promociones semanales.</p>
                                            </div>
                                            <div className="w-11 h-6 rounded-full bg-primary relative cursor-pointer shadow-sm">
                                                <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <button className="h-10 px-4 rounded-xl text-rose-500 bg-rose-50 hover:bg-rose-100 text-sm font-bold transition-colors">
                                        Cerrar Sesión
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === "notifications" && (
                            <>
                                {loading ? (
                                    <div className="p-5 space-y-4">
                                        {[...Array(4)].map((_, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
                                                <div className="flex-1 space-y-2">
                                                    <Skeleton className="h-3 w-2/5" />
                                                    <Skeleton className="h-3 w-3/4" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <EmptyState icon={BellOff} message="No tienes notificaciones pendientes" />
                                ) : (
                                    <div className="divide-y divide-slate-50">
                                        {visibleNotifs.map((n) => {
                                            const isWarning = n.notification_type === "warning";
                                            return (
                                                <div
                                                    key={n.id}
                                                    data-testid={`notification-${n.id}`}
                                                    className={`flex items-start gap-3 px-5 py-4 transition-colors ${!n.read ? "bg-primary/5" : "hover:bg-slate-50/50"}`}
                                                >
                                                    <div className={`shrink-0 mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center ${isWarning ? "bg-rose-100 text-rose-500" : "bg-primary/10 text-primary"}`}>
                                                        {isWarning ? <BellOff className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <p className={`text-sm font-semibold leading-snug ${!n.read ? "text-slate-900" : "text-slate-600"}`}>
                                                                {n.title}
                                                            </p>
                                                            <span className="shrink-0 text-[10px] text-slate-400 tabular-nums mt-0.5">
                                                                {formatDate(n.created_at)}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                                            {n.message}
                                                        </p>
                                                    </div>
                                                    {!n.read && (
                                                        <button
                                                            onClick={() => handleMarkRead(n.id)}
                                                            title="Marcar como leída"
                                                            className="shrink-0 mt-0.5 w-7 h-7 rounded-full flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
                                                        >
                                                            <Check className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                <ShowMoreBtn
                                    shown={visibleNotifs.length}
                                    total={notifications.length}
                                    expanded={notiExpanded}
                                    onToggle={() => setNotiExpanded((v) => !v)}
                                />
                            </>
                        )}

                        {/* ── Points history ─────────────────────────────────── */}
                        {activeTab === "points" && (
                            <>
                                {loading ? (
                                    <div className="p-5 space-y-4">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
                                                    <div className="space-y-2">
                                                        <Skeleton className="h-3 w-36" />
                                                        <Skeleton className="h-2 w-20" />
                                                    </div>
                                                </div>
                                                <Skeleton className="h-4 w-10" />
                                            </div>
                                        ))}
                                    </div>
                                ) : history.length === 0 ? (
                                    <EmptyState icon={TrendingUp} message="Aún no has ganado puntos. ¡Reporta precios para empezar!" />
                                ) : (
                                    <div className="divide-y divide-slate-50">
                                        {visibleHistory.map((entry, i) => {
                                            const positive = entry.points >= 0;
                                            return (
                                                <div key={i} className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${positive ? "bg-primary/10 text-primary" : "bg-rose-50 text-rose-500"}`}>
                                                            {positive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-slate-800 truncate">{entry.reason}</p>
                                                            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                                                <Clock className="w-3 h-3" />
                                                                {formatDate(entry.created_at)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className={`shrink-0 text-sm font-black tabular-nums ${positive ? "text-primary" : "text-rose-500"}`}>
                                                        {positive ? `+${entry.points}` : entry.points}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                <ShowMoreBtn
                                    shown={visibleHistory.length}
                                    total={history.length}
                                    expanded={pointsExpanded}
                                    onToggle={() => setPointsExpanded((v) => !v)}
                                />
                            </>
                        )}
                    </div>

                    {/* ── Right: leaderboard (1/3) ─────────────────────────── */}
                    <div className="space-y-5 order-1 lg:order-2">
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
                            <Trophy className="w-4 h-4 text-amber-500" />
                            <h3 className="text-sm font-bold text-slate-800">Top Contribuidores</h3>
                        </div>

                        <div className="divide-y divide-slate-50">
                            {loading ? (
                                <div className="p-4 space-y-3">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                                            <Skeleton className="h-3 flex-1" />
                                            <Skeleton className="h-3 w-10" />
                                        </div>
                                    ))}
                                </div>
                            ) : leaderboard.length === 0 ? (
                                <EmptyState icon={Trophy} message="Sin datos de ranking aún" />
                            ) : (
                                leaderboard.map((entry) => {
                                    const isMe = entry.user_id === user?.id;
                                    const meta = getRankMeta(entry.rank);
                                    return (
                                        <div
                                            key={entry.user_id}
                                            data-testid={`leaderboard-entry-${entry.rank}`}
                                            className={`flex items-center gap-3 px-4 py-3 transition-colors ${isMe ? "bg-primary/10" : "hover:bg-slate-50/50"}`}
                                        >
                                            <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border ${meta.bg} ${meta.border} ${meta.color}`}>
                                                {entry.rank <= 3 ? meta.emoji : entry.rank}
                                            </div>
                                            <span className={`flex-1 text-sm truncate ${isMe ? "text-primary font-bold" : "text-slate-700 font-medium"}`}>
                                                {entry.user_name}
                                                {isMe && <span className="ml-1 text-[10px] text-primary/60 font-normal">(tú)</span>}
                                            </span>
                                            <span className="shrink-0 text-xs font-bold text-slate-500 tabular-nums">
                                                {entry.points.toLocaleString("es-ES")}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* my rank footer if not in top list */}
                        {!loading && rank && !leaderboard.some((e) => e.user_id === user?.id) && (() => {
                            const meta = getRankMeta(rank);
                            return (
                                <div className="border-t border-slate-100 px-4 py-3 bg-primary/5 flex items-center gap-3">
                                    <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border ${meta.bg} ${meta.border} ${meta.color}`}>
                                        {rank}
                                    </div>
                                    <span className="flex-1 text-sm font-bold text-primary truncate">
                                        {user?.name}
                                        <span className="ml-1 text-[10px] text-primary/60 font-normal">(tú)</span>
                                    </span>
                                    <span className="shrink-0 text-xs font-bold text-slate-500 tabular-nums">
                                        {points.toLocaleString("es-ES")}
                                    </span>
                                </div>
                            );
                        })()}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <h3 className="text-sm font-bold text-slate-800">Niveles de reputacion</h3>
                        </div>
                        <div className="mt-4 rounded-2xl bg-primary/10 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Tu nivel</p>
                                    <p className="text-xl font-black text-secondary font-heading">{levelMeta.current.label}</p>
                                </div>
                                <p className="text-sm font-bold text-primary tabular-nums">{points.toLocaleString("es-ES")} pts</p>
                            </div>
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                                <div className="h-full rounded-full bg-primary" style={{ width: `${levelMeta.progress}%` }} />
                            </div>
                            <p className="mt-2 text-xs text-primary">
                                {levelMeta.next ? `${levelMeta.next.min - points} puntos para ${levelMeta.next.label}` : "Nivel maximo alcanzado."}
                            </p>
                        </div>
                        <details className="mt-3 group">
                            <summary className="list-none cursor-pointer p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 select-none outline-none focus-visible:ring-2 focus-visible:ring-primary">
                                <span>Ver todos los niveles</span>
                                <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                            </summary>
                            <div className="mt-2 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300 px-1">
                                {LEVELS.map((level) => (
                                    <div key={level.label} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-sm font-bold text-slate-800">{level.label}</p>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{level.min}+ pts</span>
                                        </div>
                                        <p className="mt-0.5 text-xs text-slate-500">{level.perk}</p>
                                    </div>
                                ))}
                            </div>
                        </details>
                        <p className="mt-3 text-[11px] text-slate-400">
                            Creditos y reputacion son distintos: los creditos se gastan para consultar/estimar precios; la reputacion mide confianza y progreso.
                        </p>
                    </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ProfilePage;
