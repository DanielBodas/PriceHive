import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import { useAuth } from "../contexts/AuthContext";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { PageHeader } from "../components/ui/page-header";
import {
    Trophy,
    MessageCircle,
    Heart,
    Send,
    TrendingDown,
    Crown,
    Bell,
    Sparkles,
    Flame,
    Tag,
    AlertTriangle,
    Lightbulb,
    Megaphone,
    Activity,
    ThumbsUp,
    Users,
    Store,
    ArrowDown,
    CheckCircle2,
    Clock,
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/* ──────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────── */

const timeAgo = (iso) => {
    if (!iso) return "";
    const now = new Date();
    const d = new Date(iso);
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return "hace un momento";
    if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `hace ${Math.floor(diff / 86400)}d`;
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
};

const formatPrice = (value) => {
    if (value === null || value === undefined) return "-";
    return `${Number(value).toFixed(2)}€`;
};

const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
};

const avatarColors = [
    "bg-primary/10 text-primary",
    "bg-sky-100 text-sky-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-violet-100 text-violet-700",
    "bg-teal-100 text-teal-700",
    "bg-indigo-100 text-indigo-700",
];

const colorForName = (name = "") => {
    const code = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return avatarColors[code % avatarColors.length];
};

const postTypeConfig = {
    update: { label: "General", icon: Megaphone, color: "text-slate-600", bg: "bg-slate-100" },
    price_alert: { label: "Alerta", icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50" },
    tip: { label: "Consejo", icon: Lightbulb, color: "text-primary", bg: "bg-primary/10" },
};

/* ──────────────────────────────────────────────
   Small UI primitives
   ────────────────────────────────────────────── */

const Avatar = ({ name, picture, size = "md" }) => {
    const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base" };
    if (picture) {
        return (
            <img
                src={picture}
                alt={name}
                className={`${sizes[size]} rounded-full object-cover ring-2 ring-white`}
            />
        );
    }
    return (
        <div className={`${sizes[size]} rounded-full flex items-center justify-center font-bold ${colorForName(name)} ring-2 ring-white`}>
            {getInitials(name)}
        </div>
    );
};

const SectionTitle = ({ icon: Icon, title, action, accent = "text-slate-400" }) => (
    <div className="flex items-center justify-between px-1 mb-3">
        <div className="flex items-center gap-2">
            {Icon && <Icon className={`w-4 h-4 ${accent}`} />}
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
        </div>
        {action}
    </div>
);

/* ──────────────────────────────────────────────
   Comments section
   ────────────────────────────────────────────── */

const CommentsBox = ({ postId, onCountChange }) => {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await axios.get(`${API}/posts/${postId}/comments`);
                setComments(res.data);
            } catch {
                /* ignore */
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [postId]);

    const submit = async () => {
        if (!text.trim()) return;
        setSending(true);
        try {
            const res = await axios.post(`${API}/posts/${postId}/comments`, { content: text });
            setComments((c) => [...c, res.data]);
            setText("");
            onCountChange?.(comments.length + 1);
        } catch {
            toast.error("Error al comentar");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
            {loading ? (
                <p className="text-xs text-slate-400 px-1">Cargando comentarios…</p>
            ) : comments.length === 0 ? (
                <p className="text-xs text-slate-400 px-1">Sé el primero en comentar</p>
            ) : (
                comments.map((c) => (
                    <div key={c.id} className="flex gap-2">
                        <Avatar name={c.user_name} size="sm" />
                        <div className="flex-1 bg-slate-50 rounded-2xl px-3 py-2">
                            <div className="flex items-baseline gap-2">
                                <span className="text-xs font-bold text-slate-900">{c.user_name}</span>
                                <span className="text-[10px] text-slate-400">{timeAgo(c.created_at)}</span>
                            </div>
                            <p className="text-sm text-slate-700 leading-snug">{c.content}</p>
                        </div>
                    </div>
                ))
            )}
            <div className="flex gap-2 pt-1">
                <Avatar name={user?.name} picture={user?.picture} size="sm" />
                <div className="flex-1 flex gap-2">
                    <Input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && submit()}
                        placeholder="Escribe un comentario…"
                        className="h-9 rounded-full bg-slate-50 border-slate-200 text-sm"
                    />
                    <Button
                        onClick={submit}
                        disabled={sending || !text.trim()}
                        size="icon"
                        className="h-9 w-9 rounded-full bg-primary hover:bg-primary/90"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

/* ──────────────────────────────────────────────
   Post Card
   ────────────────────────────────────────────── */

const PostCard = ({ post, onReact }) => {
    const [showComments, setShowComments] = useState(false);
    const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);
    const typeCfg = postTypeConfig[post.post_type] || postTypeConfig.update;
    const TypeIcon = typeCfg.icon;

    const reactions = post.reactions || {};
    const totalReactions = Object.values(reactions).reduce((a, b) => a + b, 0);

    const reactionButtons = [
        { key: "like", icon: ThumbsUp, color: "text-sky-500", bg: "bg-sky-50" },
        { key: "love", icon: Heart, color: "text-rose-500", bg: "bg-rose-50" },
        { key: "useful", icon: CheckCircle2, color: "text-primary", bg: "bg-primary/10" },
        { key: "warning", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50" },
    ];

    return (
        <Card className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 hover:shadow-md transition-all">
            <div className="flex gap-3">
                <Avatar name={post.user_name} size="md" />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="font-bold text-slate-900 text-sm truncate">{post.user_name}</span>
                            <span className="text-slate-300">·</span>
                            <span className="text-xs text-slate-400">{timeAgo(post.created_at)}</span>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${typeCfg.bg} ${typeCfg.color}`}>
                            <TypeIcon className="w-3 h-3" />
                            {typeCfg.label}
                        </span>
                    </div>
                    <p className="mt-2 text-slate-700 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                        {post.content}
                    </p>

                    {/* Reactions summary */}
                    {totalReactions > 0 && (
                        <div className="mt-3 flex items-center gap-1 text-xs text-slate-500">
                            <div className="flex -space-x-1">
                                {reactionButtons
                                    .filter((r) => (reactions[r.key] || 0) > 0)
                                    .slice(0, 3)
                                    .map((r) => (
                                        <div key={r.key} className={`w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white ${r.bg}`}>
                                            <r.icon className={`w-3 h-3 ${r.color}`} />
                                        </div>
                                    ))}
                            </div>
                            <span>{totalReactions}</span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1">
                        {reactionButtons.map((r) => {
                            const count = reactions[r.key] || 0;
                            return (
                                <button
                                    key={r.key}
                                    onClick={() => onReact(post.id, r.key)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                        count > 0
                                            ? `${r.bg} ${r.color}`
                                            : "text-slate-500 hover:bg-slate-50"
                                    }`}
                                >
                                    <r.icon className="w-4 h-4" />
                                    {count > 0 && <span>{count}</span>}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => setShowComments((s) => !s)}
                            className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                showComments ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50"
                            }`}
                        >
                            <MessageCircle className="w-4 h-4" />
                            <span>{commentsCount}</span>
                        </button>
                    </div>

                    {showComments && (
                        <CommentsBox postId={post.id} onCountChange={setCommentsCount} />
                    )}
                </div>
            </div>
        </Card>
    );
};

/* ──────────────────────────────────────────────
   Composer
   ────────────────────────────────────────────── */

const Composer = ({ onPosted }) => {
    const { user } = useAuth();
    const [content, setContent] = useState("");
    const [type, setType] = useState("update");
    const [posting, setPosting] = useState(false);
    const [focused, setFocused] = useState(false);

    const submit = async () => {
        if (!content.trim()) return;
        setPosting(true);
        try {
            await axios.post(`${API}/posts`, { content, post_type: type });
            toast.success("Publicación enviada");
            setContent("");
            setFocused(false);
            onPosted?.();
        } catch {
            toast.error("Error al publicar");
        } finally {
            setPosting(false);
        }
    };

    const tabs = [
        { key: "update", label: "General", icon: Megaphone, color: "text-slate-600", activeBg: "bg-slate-900 text-white" },
        { key: "price_alert", label: "Alerta", icon: AlertTriangle, color: "text-rose-600", activeBg: "bg-rose-500 text-white" },
        { key: "tip", label: "Consejo", icon: Lightbulb, color: "text-primary", activeBg: "bg-primary text-white shadow-lg shadow-primary/20" },
    ];

    return (
        <Card className={`bg-white border border-slate-100 rounded-2xl p-4 transition-all ${focused ? "shadow-lg" : "shadow-sm"}`}>
            <div className="flex gap-3">
                <Avatar name={user?.name} picture={user?.picture} size="md" />
                <div className="flex-1">
                    <Textarea
                        placeholder={`¿Qué encontraste hoy, ${user?.name?.split(" ")[0] || "amigo"}?`}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onFocus={() => setFocused(true)}
                        className={`border-none focus-visible:ring-0 text-[15px] bg-transparent resize-none p-0 placeholder:text-slate-400 ${
                            focused ? "min-h-[80px]" : "min-h-[36px]"
                        }`}
                    />
                    {focused && (
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex gap-1.5">
                                {tabs.map((t) => {
                                    const Active = type === t.key;
                                    return (
                                        <button
                                            key={t.key}
                                            onClick={() => setType(t.key)}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                                                Active
                                                    ? t.activeBg
                                                    : `${t.color} bg-slate-50 hover:bg-slate-100`
                                            }`}
                                        >
                                            <t.icon className="w-3.5 h-3.5" />
                                            {t.label}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setContent("");
                                        setFocused(false);
                                    }}
                                    className="rounded-full text-xs"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={submit}
                                    disabled={posting || !content.trim()}
                                    className="rounded-full bg-primary hover:bg-primary/90 text-white font-bold px-5 text-xs h-9 shadow-lg shadow-primary/20"
                                >
                                    <Send className="w-3.5 h-3.5 mr-1.5" />
                                    Publicar
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

/* ──────────────────────────────────────────────
   Main Dashboard
   ────────────────────────────────────────────── */

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [trending, setTrending] = useState([]);
    const [bestDeals, setBestDeals] = useState([]);
    const [pulse, setPulse] = useState(null);
    const [generalStats, setGeneralStats] = useState(null);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);

    const fetchAll = async () => {
        try {
            const [postsRes, trRes, bdRes, pulseRes, statsRes] = await Promise.all([
                axios.get(`${API}/posts`),
                axios.get(`${API}/community/trending?limit=5`).catch(() => ({ data: [] })),
                axios.get(`${API}/community/best-deals?limit=5`).catch(() => ({ data: [] })),
                axios.get(`${API}/community/pulse`).catch(() => ({ data: null })),
                axios.get(`${API}/analytics/stats`).catch(() => ({ data: null })),
            ]);
            setPosts(postsRes.data);
            setTrending(trRes.data);
            setBestDeals(bdRes.data);
            setPulse(pulseRes.data);
            setGeneralStats(statsRes.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const handleReact = async (postId, reactionType) => {
        try {
            const res = await axios.post(`${API}/posts/${postId}/react`, { reaction_type: reactionType });
            setPosts((ps) => ps.map((p) => (p.id === postId ? { ...p, reactions: res.data.reactions } : p)));
        } catch {
            toast.error("Error al reaccionar");
        }
    };

    const refreshPosts = async () => {
        try {
            const res = await axios.get(`${API}/posts`);
            setPosts(res.data);
        } catch { /* ignore */ }
    };

    const filteredPosts = filter === "all" ? posts : posts.filter((p) => p.post_type === filter);

    const filterTabs = [
        { key: "all", label: "Todo", icon: Sparkles },
        { key: "update", label: "General", icon: Megaphone },
        { key: "price_alert", label: "Alertas", icon: AlertTriangle },
        { key: "tip", label: "Consejos", icon: Lightbulb },
    ];

    const quickNavItems = [
        { path: "/dashboard", label: "Inicio", icon: Activity },
        { path: "/shopping-list", label: "Lista de Compra", icon: Tag },
        { path: "/analytics", label: "Análisis", icon: TrendingDown },
        { path: "/alerts", label: "Notificaciones", icon: Bell },
        { path: "/profile", label: "Mi Perfil", icon: Crown },
    ];

    return (
        <Layout>
            <div className="space-y-6" data-testid="dashboard-page">
                <PageHeader
                    tag="Resumen de comunidad"
                    title="Dashboard"
                    subtitle="Pulso de precios y conversación real de la comunidad en un vistazo."
                    actions={
                        pulse && (
                            <div className="hidden sm:flex gap-4 items-center bg-black/20 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/10 shadow-inner">
                                <div className="flex flex-col items-center">
                                    <span className="text-[9px] font-bold text-white/70 uppercase tracking-widest">Precios hoy</span>
                                    <span className="text-sm font-black text-white">{pulse.prices_24h || 0}</span>
                                </div>
                                <div className="w-px h-6 bg-white/20"></div>
                                <div className="flex flex-col items-center">
                                    <span className="text-[9px] font-bold text-white/70 uppercase tracking-widest">Posts (7d)</span>
                                    <span className="text-sm font-black text-white">{pulse.posts_7d || 0}</span>
                                </div>
                                <div className="w-px h-6 bg-white/20"></div>
                                <div className="flex flex-col items-center">
                                    <span className="text-[9px] font-bold text-white/70 uppercase tracking-widest">Usuarios (7d)</span>
                                    <span className="text-sm font-black text-white">{pulse.active_users_7d || 0}</span>
                                </div>
                            </div>
                        )
                    }
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto">


                        {/* ── CENTER FEED ── */}
                        <main className="col-span-1 lg:col-span-8 space-y-4">
                            {/* Feed header */}
                            <div className="sticky top-12 z-10 bg-slate-50/90 backdrop-blur-md pb-3 mb-2">
                                <h1 className="text-lg font-black text-slate-900 m-0 mb-3 font-heading">Actividad reciente</h1>
                                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
                                    {filterTabs.map((t) => {
                                        const active = filter === t.key;
                                        return (
                                            <button
                                                key={t.key}
                                                onClick={() => setFilter(t.key)}
                                                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-none font-bold text-[12px] white-space-nowrap cursor-pointer transition-all ${
                                                    active
                                                        ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                                                        : "bg-white text-slate-600 shadow-[0_0_0_1px_#e2e8f0]"
                                                }`}
                                            >
                                                <t.icon className="w-3.5 h-3.5" />
                                                {t.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Composer */}
                            <div className="mb-4">
                                <Composer onPosted={refreshPosts} />
                            </div>

                            {/* Posts */}
                            {loading ? (
                                <div className="py-20 text-center">
                                    <Sparkles className="w-8 h-8 text-amber-300 mx-auto mb-3 animate-pulse" />
                                    <p className="text-[12px] text-slate-400 font-semibold uppercase tracking-widest">Cargando publicaciones…</p>
                                </div>
                            ) : filteredPosts.length === 0 ? (
                                <div className="bg-white rounded-[20px] border-2 border-dashed border-slate-200 p-12 text-center">
                                    <MessageCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                    <p className="font-bold text-slate-600 m-0 mb-1">Nada por aquí todavía</p>
                                    <p className="text-[13px] text-slate-400 m-0">Sé el primero en compartir un hallazgo</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {filteredPosts.map((post) => (
                                        <PostCard key={post.id} post={post} onReact={handleReact} />
                                    ))}
                                </div>
                            )}
                        </main>

                        {/* ── RIGHT SIDEBAR ── */}
                        <aside className="col-span-1 lg:col-span-4 space-y-4 lg:sticky lg:top-14">
                            {/* User card (Moved from left) */}
                            <div className="bg-white rounded-[20px] p-4 border border-slate-200">
                                <div className="flex items-center gap-3">
                                    <Avatar name={user?.name} picture={user?.picture} size="md" />
                                    <div className="min-w-0">
                                        <p className="font-bold text-sm text-slate-900 m-0 truncate">{user?.name}</p>
                                        <p className="text-[11px] text-slate-400 m-0 truncate">{user?.email}</p>
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center gap-2 bg-amber-50 rounded-xl p-2 px-3">
                                    <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                    <span className="text-sm font-bold text-amber-800 tabular-nums">{user?.points || 0}</span>
                                    <span className="text-[11px] text-amber-600">puntos</span>
                                </div>
                            </div>

                            {/* Trending */}
                            <div className="bg-white rounded-[20px] p-4 border border-slate-200">
                                <div className="flex items-center gap-2 mb-3.5">
                                    <Flame className="w-4 h-4 text-orange-500" />
                                    <h2 className="text-[13px] font-extrabold text-slate-900 m-0">Tendencias</h2>
                                </div>
                                {trending.length === 0 ? (
                                    <p className="text-[12px] text-slate-400 m-0">Sin tendencias aún</p>
                                ) : trending.map((t, idx) => (
                                    <div key={idx} className={`flex gap-2.5 items-start py-2 ${idx < trending.length - 1 ? "border-b border-slate-100" : ""}`}>
                                        <span className="min-w-[20px] h-5 rounded-lg bg-orange-50 text-orange-500 text-[11px] font-extrabold flex items-center justify-center shrink-0">{idx + 1}</span>
                                        <div className="min-w-0">
                                            <p className="text-[13px] font-bold text-slate-900 m-0 mb-0.5 truncate">{t.product_name}</p>
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-[11px] text-slate-500">{t.supermarket_name}</span>
                                                <span className="text-[11px] font-bold text-slate-900">{t.last_price?.toFixed(2)}€</span>
                                                {t.delta_pct !== 0 && (
                                                    <span className={`text-[10px] font-bold ${t.delta_pct < 0 ? "text-amber-600" : "text-rose-600"}`}>
                                                        {t.delta_pct > 0 ? "+" : ""}{t.delta_pct}%
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 mt-0.5">
                                                <Activity className="w-2.5 h-2.5 text-orange-500" />
                                                <span className="text-[10px] font-bold text-orange-500">{t.count} registros</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Best deals */}
                            <div className="bg-white rounded-[20px] p-4 border border-slate-200">
                                <div className="flex items-center gap-2 mb-3.5">
                                    <TrendingDown className="w-4 h-4 text-primary" />
                                    <h2 className="text-[13px] font-extrabold text-slate-900 m-0 flex-1">Mejores ofertas</h2>
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Hoy</span>
                                </div>
                                {bestDeals.length === 0 ? (
                                    <p className="text-[12px] text-slate-400 m-0">Sin ofertas detectadas</p>
                                ) : bestDeals.map((d, idx) => (
                                    <div key={idx} className={`flex items-center gap-2.5 py-2 ${idx < bestDeals.length - 1 ? "border-b border-slate-100" : ""}`}>
                                        <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                                            <ArrowDown className="w-3.5 h-3.5 text-primary" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[12px] font-bold text-slate-900 m-0 truncate">{d.product_name}</p>
                                            <p className="text-[11px] text-slate-500 m-0 truncate">{d.supermarket_name}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-[13px] font-extrabold text-primary m-0 tabular-nums">{d.current_price?.toFixed(2)}€</p>
                                            <p className="text-[10px] font-bold text-amber-500 m-0">{d.delta_pct}%</p>
                                        </div>
                                    </div>
                                ))}
                            </div>



                            {/* Recent prices */}
                            {generalStats?.recent_activity?.length > 0 && (
                                <div className="bg-white rounded-[20px] p-4 border border-slate-200">
                                    <div className="flex items-center gap-2 mb-3.5">
                                        <Clock className="w-4 h-4 text-sky-500" />
                                        <h2 className="text-[13px] font-extrabold text-slate-900 m-0">Últimos precios</h2>
                                    </div>
                                    {generalStats.recent_activity.slice(0, 5).map((item, idx) => (
                                        <div key={`${item.created_at}-${idx}`} className={`flex items-center gap-2.5 py-2 ${idx < 4 ? "border-b border-slate-100" : ""}`}>
                                            <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
                                                <Tag className="w-3.5 h-3.5 text-sky-500" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[12px] font-bold text-slate-900 m-0 truncate">{item.product_name}</p>
                                                <p className="text-[11px] text-slate-500 m-0">{item.supermarket_name} · {timeAgo(item.created_at)}</p>
                                            </div>
                                            <span className="text-[13px] font-extrabold text-slate-900 shrink-0 tabular-nums">{formatPrice(item.price)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </aside>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;

