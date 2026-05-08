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
    "bg-emerald-100 text-emerald-700",
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
    tip: { label: "Consejo", icon: Lightbulb, color: "text-emerald-600", bg: "bg-emerald-50" },
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
                        className="h-9 w-9 rounded-full bg-emerald-500 hover:bg-emerald-600"
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
        { key: "useful", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
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
        { key: "tip", label: "Consejo", icon: Lightbulb, color: "text-emerald-600", activeBg: "bg-emerald-500 text-white" },
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
                                    className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 text-xs h-9"
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

const DashboardLegacy = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [userData] = useState(null);
    const leaderboard = [];
    const notifications = [];
    const [posts, setPosts] = useState([]);
    const [trending, setTrending] = useState([]);
    const [bestDeals, setBestDeals] = useState([]);
    const [pulse, setPulse] = useState(null);
    const [generalStats, setGeneralStats] = useState(null);
    const [filter, setFilter] = useState("all"); // all | update | price_alert | tip
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

    const level = Math.floor((userData?.points || 0) / 100) + 1;
    const pointsForNext = level * 100;
    const progress = Math.min(100, ((userData?.points || 0) % 100));

    const filterTabs = [
        { key: "all", label: "Todo", icon: Sparkles },
        { key: "update", label: "General", icon: Megaphone },
        { key: "price_alert", label: "Alertas", icon: AlertTriangle },
        { key: "tip", label: "Consejos", icon: Lightbulb },
    ];

    return (
        <Layout>
            <div className="space-y-6" data-testid="dashboard-page">
                <PageHeader
                        tag="Resumen de comunidad"
                        title="Dashboard"
                        subtitle="Pulso de precios y conversación de la comunidad en un vistazo."
                        className="mb-6"
                    />

                    {/* ── 3-COLUMN LAYOUT ── */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                        {[
                            { label: "Precios 24h", value: pulse?.prices_24h || 0, icon: Tag, color: "text-emerald-600", bg: "bg-emerald-50" },
                            { label: "Usuarios 7d", value: pulse?.active_users_7d || 0, icon: Users, color: "text-sky-600", bg: "bg-sky-50" },
                            { label: "Posts 7d", value: pulse?.posts_7d || 0, icon: MessageCircle, color: "text-amber-600", bg: "bg-amber-50" },
                            { label: "Productos", value: generalStats?.total_products || 0, icon: Store, color: "text-indigo-600", bg: "bg-indigo-50" },
                        ].map((item) => (
                            <Card key={item.label} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                                <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center mb-3`}>
                                    <item.icon className={`w-4 h-4 ${item.color}`} />
                                </div>
                                <p className="text-2xl font-extrabold text-slate-900 tabular-nums">{item.value}</p>
                                <p className="text-xs font-semibold text-slate-500 mt-0.5">{item.label}</p>
                            </Card>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                        {/* LEFT SIDEBAR */}
                        {false && (
                        <aside className="hidden">
                            {/* Profile card */}
                            <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 border-none rounded-2xl p-5 text-white shadow-lg">
                                <div className="flex items-center gap-3">
                                    <Avatar name={user?.name} picture={user?.picture} size="lg" />
                                    <div className="min-w-0">
                                        <p className="font-bold truncate">{user?.name}</p>
                                        <p className="text-xs text-emerald-100 truncate">{user?.email}</p>
                                    </div>
                                </div>
                                <div className="mt-5 grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest text-emerald-100 font-bold">Puntos</p>
                                        <p className="text-2xl font-extrabold tabular-nums">{userData?.points || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest text-emerald-100 font-bold">Ranking</p>
                                        <p className="text-2xl font-extrabold tabular-nums">#{userData?.rank || "–"}</p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="flex items-center justify-between text-[10px] font-bold text-emerald-100 mb-1.5">
                                        <span>NIVEL {level}</span>
                                        <span>{pointsForNext - (userData?.points || 0)} para subir</span>
                                    </div>
                                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-white rounded-full transition-all duration-700"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            </Card>

                            {/* Points history */}
                            <Card className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                                <SectionTitle icon={Trophy} title="Tus últimos puntos" accent="text-amber-500" />
                                {!userData?.history?.length ? (
                                    <p className="text-xs text-slate-400 px-1 py-2">Aún no hay movimientos de puntos.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {userData.history.slice(0, 4).map((entry, idx) => (
                                            <div key={`${entry.created_at}-${idx}`} className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                                    +{entry.points}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-slate-700 leading-snug">{entry.reason}</p>
                                                    <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(entry.created_at)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        </aside>
                        )}

                        {/* CENTER FEED */}
                        <div className="lg:col-span-8 space-y-4">
                            <Composer onPosted={refreshPosts} />

                            {/* Filter tabs */}
                            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                                {filterTabs.map((t) => {
                                    const active = filter === t.key;
                                    return (
                                        <button
                                            key={t.key}
                                            onClick={() => setFilter(t.key)}
                                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                                                active
                                                    ? "bg-slate-900 text-white shadow-sm"
                                                    : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
                                            }`}
                                        >
                                            <t.icon className="w-3.5 h-3.5" />
                                            {t.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Posts */}
                            {loading ? (
                                <div className="py-20 text-center">
                                    <Sparkles className="w-8 h-8 text-emerald-300 animate-pulse mx-auto" />
                                    <p className="text-xs text-slate-400 mt-3 font-semibold uppercase tracking-widest">Cargando feed…</p>
                                </div>
                            ) : filteredPosts.length === 0 ? (
                                <Card className="bg-white border border-dashed border-slate-200 rounded-2xl p-10 text-center">
                                    <MessageCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                    <p className="font-bold text-slate-600">Nada por aquí todavía</p>
                                    <p className="text-sm text-slate-400 mt-1">Sé el primero en compartir un hallazgo</p>
                                </Card>
                            ) : (
                                <div className="space-y-4">
                                    {filteredPosts.map((post) => (
                                        <PostCard key={post.id} post={post} onReact={handleReact} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* RIGHT SIDEBAR */}
                        <aside className="lg:col-span-4 space-y-4">
                            {/* Real data summary */}
                            {generalStats && (
                                <Card className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                                    <SectionTitle icon={Tag} title="Datos registrados" accent="text-emerald-500" />
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { label: "Productos", value: generalStats.total_products },
                                            { label: "Precios", value: generalStats.total_prices },
                                            { label: "Tiendas", value: generalStats.total_supermarkets },
                                            { label: "Usuarios", value: generalStats.total_users },
                                        ].map((item) => (
                                            <div key={item.label} className="rounded-xl bg-slate-50 px-3 py-2">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.label}</p>
                                                <p className="text-lg font-extrabold text-slate-900 tabular-nums">{item.value || 0}</p>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            )}

                            {/* Recent prices */}
                            {generalStats?.recent_activity?.length > 0 && (
                                <Card className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                                    <SectionTitle icon={Clock} title="Últimos precios" accent="text-sky-500" />
                                    <div className="space-y-2.5">
                                        {generalStats.recent_activity.slice(0, 4).map((item, idx) => (
                                            <div key={`${item.created_at}-${idx}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                                                <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0">
                                                    <Tag className="w-4 h-4 text-sky-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-900 truncate">{item.product_name}</p>
                                                    <p className="text-[11px] text-slate-500 truncate">{item.supermarket_name} · {timeAgo(item.created_at)}</p>
                                                </div>
                                                <span className="text-sm font-extrabold text-slate-900 tabular-nums">{formatPrice(item.price)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            )}

                            {/* Trending */}
                            <Card className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                                <SectionTitle
                                    icon={Flame}
                                    title="Tendencias"
                                    accent="text-orange-500"
                                />
                                {trending.length === 0 ? (
                                    <p className="text-xs text-slate-400 px-1 py-2">Sin tendencias aún</p>
                                ) : (
                                    <div className="space-y-3">
                                        {trending.map((t, idx) => (
                                            <div key={idx} className="flex items-start gap-3 group cursor-default">
                                                <div className="w-6 h-6 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                                    {idx + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-900 truncate">{t.product_name}</p>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <Store className="w-3 h-3 text-slate-400" />
                                                        <span className="text-[11px] text-slate-500 truncate">{t.supermarket_name}</span>
                                                        <span className="text-slate-300">·</span>
                                                        <span className="text-[11px] font-bold text-slate-900">{t.last_price?.toFixed(2)}€</span>
                                                    </div>
                                                    <div className="mt-1 flex items-center gap-1">
                                                        <Activity className="w-3 h-3 text-orange-500" />
                                                        <span className="text-[10px] font-bold text-orange-500">{t.count} registros</span>
                                                        {t.delta_pct !== 0 && (
                                                            <>
                                                                <span className="text-slate-300">·</span>
                                                                <span className={`text-[10px] font-bold ${t.delta_pct < 0 ? "text-emerald-500" : "text-rose-500"}`}>
                                                                    {t.delta_pct > 0 ? "+" : ""}{t.delta_pct}%
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>

                            {/* Best deals */}
                            <Card className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                                <SectionTitle
                                    icon={TrendingDown}
                                    title="Mejores ofertas"
                                    accent="text-emerald-500"
                                    action={<span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Hoy</span>}
                                />
                                {bestDeals.length === 0 ? (
                                    <p className="text-xs text-slate-400 px-1 py-2">Sin ofertas detectadas</p>
                                ) : (
                                    <div className="space-y-2.5">
                                        {bestDeals.map((d, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                                                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                                    <ArrowDown className="w-4 h-4 text-emerald-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-900 truncate">{d.product_name}</p>
                                                    <p className="text-[11px] text-slate-500 truncate">{d.supermarket_name}</p>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className="text-sm font-extrabold text-emerald-600 tabular-nums">{d.current_price?.toFixed(2)}€</p>
                                                    <p className="text-[10px] font-bold text-emerald-500">{d.delta_pct}%</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>

                            {/* Leaderboard */}
                            <Card className="hidden">
                                <SectionTitle
                                    icon={Crown}
                                    title="Top contribuidores"
                                    accent="text-amber-500"
                                />
                                <div className="space-y-2.5">
                                    {leaderboard.map((u, idx) => {
                                        const medal = ["🥇", "🥈", "🥉"][idx];
                                        const isMe = u.user_id === user?.id;
                                        return (
                                            <div
                                                key={u.user_id}
                                                className={`flex items-center gap-3 p-2 rounded-xl ${
                                                    isMe ? "bg-emerald-50" : "hover:bg-slate-50"
                                                } transition-colors`}
                                            >
                                                <div className="w-7 flex items-center justify-center flex-shrink-0">
                                                    {medal ? (
                                                        <span className="text-lg">{medal}</span>
                                                    ) : (
                                                        <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                                                    )}
                                                </div>
                                                <Avatar name={u.user_name} size="sm" />
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-bold truncate ${isMe ? "text-emerald-700" : "text-slate-900"}`}>
                                                        {u.user_name} {isMe && <span className="text-[10px] text-emerald-600">(tú)</span>}
                                                    </p>
                                                </div>
                                                <span className="text-xs font-bold text-slate-700 tabular-nums">{u.points}pts</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>

                            {/* Notifications preview */}
                            {notifications.length > 0 && (
                                <Card className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                                    <SectionTitle
                                        icon={Bell}
                                        title="Notificaciones"
                                        accent="text-sky-500"
                                        action={
                                            <button
                                                onClick={() => navigate("/alerts")}
                                                className="text-[10px] font-bold text-sky-500 hover:underline uppercase tracking-widest"
                                            >
                                                Ver todo
                                            </button>
                                        }
                                    />
                                    <div className="space-y-2">
                                        {notifications.map((n) => (
                                            <div
                                                key={n.id}
                                                className={`flex items-start gap-2 p-2 rounded-xl ${
                                                    !n.read ? "bg-sky-50" : "hover:bg-slate-50"
                                                } transition-colors`}
                                            >
                                                <Clock className="w-3.5 h-3.5 text-sky-500 mt-0.5 flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold text-slate-700 leading-snug line-clamp-2">
                                                        {n.message || n.title}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(n.created_at)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            )}
                        </aside>
                </div>
            </div>
        </Layout>
    );
};

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
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                        {/* ── LEFT SIDEBAR ── */}
                        <aside className="hidden lg:block lg:col-span-3 space-y-4 sticky top-[3.5rem]">
                            {/* User card */}
                            <Card className="p-4 rounded-2xl border-slate-200 shadow-sm bg-white">
                                <div className="flex items-center gap-3">
                                    <Avatar name={user?.name} picture={user?.picture} size="md" />
                                    <div className="min-w-0">
                                        <p className="font-bold text-sm text-slate-900 truncate m-0">{user?.name}</p>
                                        <p className="text-[11px] text-slate-500 truncate m-0">{user?.email}</p>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-2 bg-primary/10 rounded-xl px-3 py-2 border border-primary/10">
                                    <Trophy className="w-4 h-4 text-primary shrink-0 fill-primary/20" />
                                    <span className="text-sm font-bold text-primary tabular-nums">{user?.points || 0}</span>
                                    <span className="text-[10px] font-bold text-primary/70 uppercase tracking-wider">puntos</span>
                                </div>
                            </Card>

                            {/* Quick nav */}
                            <Card className="p-2 rounded-2xl border-slate-200 shadow-sm bg-white">
                                {quickNavItems.map((item) => (
                                    <button
                                        key={item.path}
                                        onClick={() => navigate(item.path)}
                                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl border-none bg-transparent cursor-pointer text-slate-600 text-sm font-bold transition-all hover:bg-primary/5 hover:text-primary group"
                                    >
                                        <item.icon className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
                                        <span>{item.label}</span>
                                    </button>
                                ))}
                            </Card>

                            {/* Community pulse */}
                            {pulse && (
                                <Card className="p-4 rounded-2xl border-slate-200 shadow-sm bg-white">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="w-2 h-2 rounded-full bg-primary inline-block shadow-[0_0_0_3px_rgba(38,92,50,0.1)] animate-pulse" />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pulso en vivo</span>
                                    </div>
                                    <div className="space-y-1">
                                        {[
                                            { label: "Precios hoy", value: pulse.prices_24h || 0, color: "text-primary" },
                                            { label: "Usuarios activos (7d)", value: pulse.active_users_7d || 0, color: "text-sky-600" },
                                            { label: "Posts esta semana", value: pulse.posts_7d || 0, color: "text-amber-600" },
                                        ].map((s, idx) => (
                                            <div key={s.label} className={`flex justify-between items-center py-2 ${idx !== 2 ? "border-b border-slate-50" : ""}`}>
                                                <span className="text-xs text-slate-500 font-medium">{s.label}</span>
                                                <span className={`text-sm font-extrabold ${s.color} tabular-nums`}>{s.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            )}
                        </aside>

                        {/* ── CENTER FEED ── */}
                        <main className="col-span-1 lg:col-span-6 space-y-4">
                            {/* Feed header */}
                            <div className="sticky top-[3rem] z-10 bg-slate-50/90 backdrop-blur-md pb-3 mb-2">
                                <h1 className="text-xl font-black text-slate-900 mb-3 font-heading tracking-tight">Actividad reciente</h1>
                                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                    {filterTabs.map((t) => {
                                        const active = filter === t.key;
                                        return (
                                            <button
                                                key={t.key}
                                                onClick={() => setFilter(t.key)}
                                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-none font-bold text-xs whitespace-nowrap cursor-pointer transition-all ${
                                                    active ? "bg-slate-900 text-white shadow-md shadow-slate-900/20" : "bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 hover:ring-primary/30"
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
                            <div className="mb-6">
                                <Composer onPosted={refreshPosts} />
                            </div>

                            {/* Posts */}
                            {loading ? (
                                <div className="py-20 text-center">
                                    <Sparkles className="w-8 h-8 text-primary/40 animate-pulse mx-auto mb-3" />
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">Cargando feed…</p>
                                </div>
                            ) : filteredPosts.length === 0 ? (
                                <Card className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center bg-transparent shadow-none">
                                    <MessageCircle className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                                    <p className="font-bold text-slate-600 mb-1">Nada por aquí todavía</p>
                                    <p className="text-sm text-slate-400">Sé el primero en compartir un hallazgo</p>
                                </Card>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {filteredPosts.map((post) => (
                                        <PostCard key={post.id} post={post} onReact={handleReact} />
                                    ))}
                                </div>
                            )}
                        </main>

                        {/* ── RIGHT SIDEBAR ── */}
                        <aside className="hidden lg:block lg:col-span-3 space-y-4 sticky top-[3.5rem]">

                            {/* Trending */}
                            <Card className="p-4 rounded-2xl border-slate-200 shadow-sm bg-white">
                                <div className="flex items-center gap-2 mb-4">
                                    <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                                    <h2 className="text-sm font-black text-slate-900 m-0 font-heading">Tendencias</h2>
                                </div>
                                {trending.length === 0 ? (
                                    <p className="text-xs text-slate-400 m-0 font-medium">Sin tendencias aún</p>
                                ) : trending.map((t, idx) => (
                                    <div key={idx} className={`flex gap-3 items-start py-3 ${idx < trending.length - 1 ? "border-b border-slate-50" : ""}`}>
                                        <span className="min-w-[20px] h-5 rounded-lg bg-orange-50 text-orange-600 text-[10px] font-black flex items-center justify-center shrink-0">{idx + 1}</span>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-slate-900 mb-1 truncate leading-tight">{t.product_name}</p>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-[10px] text-slate-500 font-semibold">{t.supermarket_name}</span>
                                                <span className="text-[11px] font-black text-slate-900 tabular-nums">{t.last_price?.toFixed(2)}€</span>
                                                {t.delta_pct !== 0 && (
                                                    <span className={`text-[10px] font-black ${t.delta_pct < 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                                        {t.delta_pct > 0 ? "+" : ""}{t.delta_pct}%
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-1.5">
                                                <Activity className="w-3 h-3 text-orange-400" />
                                                <span className="text-[10px] font-bold text-orange-500">{t.count} registros</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </Card>

                            {/* Best deals */}
                            <Card className="p-4 rounded-2xl border-slate-200 shadow-sm bg-white">
                                <div className="flex items-center gap-2 mb-4">
                                    <TrendingDown className="w-4 h-4 text-primary" />
                                    <h2 className="text-sm font-black text-slate-900 m-0 font-heading flex-1">Mejores ofertas</h2>
                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Hoy</span>
                                </div>
                                {bestDeals.length === 0 ? (
                                    <p className="text-xs text-slate-400 m-0 font-medium">Sin ofertas detectadas</p>
                                ) : bestDeals.map((d, idx) => (
                                    <div key={idx} className={`flex items-center gap-3 py-3 ${idx < bestDeals.length - 1 ? "border-b border-slate-50" : ""}`}>
                                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                            <ArrowDown className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-bold text-slate-900 mb-0.5 truncate">{d.product_name}</p>
                                            <p className="text-[10px] text-slate-500 font-semibold truncate m-0">{d.supermarket_name}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-[13px] font-black text-primary tabular-nums m-0">{d.current_price?.toFixed(2)}€</p>
                                            <p className="text-[10px] font-black text-primary/70 m-0">{d.delta_pct}%</p>
                                        </div>
                                    </div>
                                ))}
                            </Card>

                            {/* Recent prices */}
                            {generalStats?.recent_activity?.length > 0 && (
                                <Card className="p-4 rounded-2xl border-slate-200 shadow-sm bg-white">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Clock className="w-4 h-4 text-sky-500" />
                                        <h2 className="text-sm font-black text-slate-900 m-0 font-heading">Últimos precios</h2>
                                    </div>
                                    {generalStats.recent_activity.slice(0, 5).map((item, idx) => (
                                        <div key={`${item.created_at}-${idx}`} className={`flex items-center gap-3 py-3 ${idx < 4 ? "border-b border-slate-50" : ""}`}>
                                            <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
                                                <Tag className="w-4 h-4 text-sky-500" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-bold text-slate-900 mb-0.5 truncate">{item.product_name}</p>
                                                <p className="text-[10px] text-slate-500 font-semibold m-0">{item.supermarket_name} · {timeAgo(item.created_at)}</p>
                                            </div>
                                            <span className="text-[13px] font-black text-slate-900 shrink-0 tabular-nums">{formatPrice(item.price)}</span>
                                        </div>
                                    ))}
                                </Card>
                            )}
                        </aside>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;

