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
            <div className="-mt-8 -mx-4 sm:-mx-6 bg-gradient-to-b from-slate-50 to-white min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

                    {/* ── HEADER WELCOME ── */}
                    <div className="flex flex-col gap-2 mb-5">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                                Dashboard
                            </h1>
                            <p className="text-slate-500 text-sm mt-1">Pulso de precios y conversación de la comunidad en un vistazo.</p>
                        </div>
                        {pulse && (
                            <div className="hidden">
                                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-xs font-bold text-slate-500">DATOS REALES</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                    <Tag className="w-4 h-4 text-emerald-500" />
                                    <span className="text-xs font-bold text-slate-900">{pulse.prices_24h}</span>
                                    <span className="text-xs text-slate-500">precios 24h</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                    <Users className="w-4 h-4 text-sky-500" />
                                    <span className="text-xs font-bold text-slate-900">{pulse.active_users_7d}</span>
                                    <span className="text-xs text-slate-500">usuarios 7d</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                    <MessageCircle className="w-4 h-4 text-amber-500" />
                                    <span className="text-xs font-bold text-slate-900">{pulse.posts_7d}</span>
                                    <span className="text-xs text-slate-500">posts 7d</span>
                                </div>
                            </div>
                        )}
                    </div>

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
            <div style={{ margin: "-2rem -1rem 0", minHeight: "100vh", background: "#f8fafc" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem 1rem" }}>
                    
                    {/* Slim Brand Banner */}
                    <div style={{ 
                        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", 
                        borderRadius: 24, 
                        padding: "1rem 2rem", 
                        color: "white", 
                        marginBottom: "1.5rem", 
                        position: "relative", 
                        overflow: "hidden", 
                        boxShadow: "0 10px 15px -3px rgba(16, 185, 129, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                    }}>
                        <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
                        <div style={{ position: "relative", zIndex: 1 }}>
                            <p style={{ margin: 0, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.8 }}>Comunidad</p>
                            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, fontFamily: "Manrope, sans-serif" }}>Dashboard</h1>
                        </div>
                        <div style={{ position: "relative", zIndex: 1, textAlign: "right" }}>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 500, opacity: 0.9 }}>Pulso de precios y conversación real de PriceHive.</p>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 280px", gap: "1.5rem", alignItems: "start" }}>

                        {/* ── LEFT SIDEBAR ── */}
                        <aside style={{ position: "sticky", top: "3.5rem" }}>
                            {/* User card */}
                            <div style={{ background: "white", borderRadius: 20, padding: "1rem", border: "1px solid #e2e8f0", marginBottom: "0.75rem" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                    <Avatar name={user?.name} picture={user?.picture} size="md" />
                                    <div style={{ minWidth: 0 }}>
                                        <p style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</p>
                                        <p style={{ fontSize: 11, color: "#94a3b8", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</p>
                                    </div>
                                </div>
                                <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem", background: "#f0fdf4", borderRadius: 12, padding: "0.5rem 0.75rem" }}>
                                    <Trophy style={{ width: 14, height: 14, color: "#f59e0b", flexShrink: 0 }} />
                                    <span style={{ fontSize: 13, fontWeight: 700, color: "#065f46", fontVariantNumeric: "tabular-nums" }}>{user?.points || 0}</span>
                                    <span style={{ fontSize: 11, color: "#6ee7b7" }}>puntos</span>
                                </div>
                            </div>

                            {/* Quick nav */}
                            <div style={{ background: "white", borderRadius: 20, padding: "0.5rem", border: "1px solid #e2e8f0", marginBottom: "0.75rem" }}>
                                {quickNavItems.map((item) => (
                                    <button
                                        key={item.path}
                                        onClick={() => navigate(item.path)}
                                        style={{ display: "flex", alignItems: "center", gap: "0.75rem", width: "100%", padding: "0.625rem 0.75rem", borderRadius: 14, border: "none", background: "transparent", cursor: "pointer", color: "#475569", fontSize: 13, fontWeight: 600, transition: "all 0.15s" }}
                                        onMouseEnter={e => { e.currentTarget.style.background = "#f0fdf4"; e.currentTarget.style.color = "#059669"; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#475569"; }}
                                    >
                                        <item.icon style={{ width: 16, height: 16, flexShrink: 0 }} />
                                        <span>{item.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Community pulse */}
                            {pulse && (
                                <div style={{ background: "white", borderRadius: 20, padding: "0.875rem", border: "1px solid #e2e8f0" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", display: "inline-block", boxShadow: "0 0 0 3px #d1fae5", animation: "pulse 2s infinite" }} />
                                        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b" }}>Pulso en vivo</span>
                                    </div>
                                    {[
                                        { label: "Precios hoy", value: pulse.prices_24h || 0, color: "#059669" },
                                        { label: "Usuarios activos (7d)", value: pulse.active_users_7d || 0, color: "#0284c7" },
                                        { label: "Posts esta semana", value: pulse.posts_7d || 0, color: "#d97706" },
                                    ].map((s) => (
                                        <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.375rem 0", borderBottom: "1px solid #f1f5f9" }}>
                                            <span style={{ fontSize: 12, color: "#64748b" }}>{s.label}</span>
                                            <span style={{ fontSize: 14, fontWeight: 800, color: s.color, fontVariantNumeric: "tabular-nums" }}>{s.value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </aside>

                        {/* ── CENTER FEED ── */}
                        <main>
                            {/* Feed header */}
                            <div style={{ position: "sticky", top: "3rem", zIndex: 10, background: "rgba(248,250,252,0.92)", backdropFilter: "blur(12px)", paddingBottom: "0.75rem", marginBottom: "0.5rem" }}>
                                <h1 style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", margin: "0 0 0.75rem", fontFamily: "Manrope, sans-serif" }}>Actividad reciente</h1>
                                <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "2px" }}>
                                    {filterTabs.map((t) => {
                                        const active = filter === t.key;
                                        return (
                                            <button
                                                key={t.key}
                                                onClick={() => setFilter(t.key)}
                                                style={{
                                                    display: "inline-flex", alignItems: "center", gap: "0.375rem",
                                                    padding: "0.375rem 0.875rem", borderRadius: 999, border: "none",
                                                    fontWeight: 700, fontSize: 12, whiteSpace: "nowrap", cursor: "pointer", transition: "all 0.15s",
                                                    background: active ? "#0f172a" : "white",
                                                    color: active ? "white" : "#475569",
                                                    boxShadow: active ? "0 2px 8px rgba(15,23,42,0.18)" : "0 0 0 1px #e2e8f0",
                                                }}
                                            >
                                                <t.icon style={{ width: 13, height: 13 }} />
                                                {t.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Composer */}
                            <div style={{ marginBottom: "1rem" }}>
                                <Composer onPosted={refreshPosts} />
                            </div>

                            {/* Posts */}
                            {loading ? (
                                <div style={{ padding: "5rem 0", textAlign: "center" }}>
                                    <Sparkles style={{ width: 32, height: 32, color: "#6ee7b7", margin: "0 auto 0.75rem" }} />
                                    <p style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>Cargando publicaciones…</p>
                                </div>
                            ) : filteredPosts.length === 0 ? (
                                <div style={{ background: "white", borderRadius: 20, border: "2px dashed #e2e8f0", padding: "3rem", textAlign: "center" }}>
                                    <MessageCircle style={{ width: 40, height: 40, color: "#cbd5e1", margin: "0 auto 0.75rem" }} />
                                    <p style={{ fontWeight: 700, color: "#475569", margin: "0 0 0.25rem" }}>Nada por aquí todavía</p>
                                    <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Sé el primero en compartir un hallazgo</p>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    {filteredPosts.map((post) => (
                                        <PostCard key={post.id} post={post} onReact={handleReact} />
                                    ))}
                                </div>
                            )}
                        </main>

                        {/* ── RIGHT SIDEBAR ── */}
                        <aside style={{ position: "sticky", top: "3.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>

                            {/* Trending */}
                            <div style={{ background: "white", borderRadius: 20, padding: "1rem", border: "1px solid #e2e8f0" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.875rem" }}>
                                    <Flame style={{ width: 15, height: 15, color: "#f97316" }} />
                                    <h2 style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", margin: 0 }}>Tendencias</h2>
                                </div>
                                {trending.length === 0 ? (
                                    <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>Sin tendencias aún</p>
                                ) : trending.map((t, idx) => (
                                    <div key={idx} style={{ display: "flex", gap: "0.625rem", alignItems: "flex-start", padding: "0.5rem 0", borderBottom: idx < trending.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                                        <span style={{ minWidth: 20, height: 20, borderRadius: 8, background: "#fff7ed", color: "#f97316", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{idx + 1}</span>
                                        <div style={{ minWidth: 0 }}>
                                            <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: "0 0 0.125rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.product_name}</p>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", flexWrap: "wrap" }}>
                                                <span style={{ fontSize: 11, color: "#64748b" }}>{t.supermarket_name}</span>
                                                <span style={{ fontSize: 11, fontWeight: 700, color: "#0f172a" }}>{t.last_price?.toFixed(2)}€</span>
                                                {t.delta_pct !== 0 && (
                                                    <span style={{ fontSize: 10, fontWeight: 700, color: t.delta_pct < 0 ? "#059669" : "#e11d48" }}>
                                                        {t.delta_pct > 0 ? "+" : ""}{t.delta_pct}%
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.125rem" }}>
                                                <Activity style={{ width: 10, height: 10, color: "#f97316" }} />
                                                <span style={{ fontSize: 10, fontWeight: 700, color: "#f97316" }}>{t.count} registros</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Best deals */}
                            <div style={{ background: "white", borderRadius: 20, padding: "1rem", border: "1px solid #e2e8f0" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.875rem" }}>
                                    <TrendingDown style={{ width: 15, height: 15, color: "#10b981" }} />
                                    <h2 style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", margin: 0, flex: 1 }}>Mejores ofertas</h2>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.08em" }}>Hoy</span>
                                </div>
                                {bestDeals.length === 0 ? (
                                    <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>Sin ofertas detectadas</p>
                                ) : bestDeals.map((d, idx) => (
                                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.5rem 0", borderBottom: idx < bestDeals.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                                        <div style={{ width: 32, height: 32, borderRadius: 10, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                            <ArrowDown style={{ width: 14, height: 14, color: "#10b981" }} />
                                        </div>
                                        <div style={{ minWidth: 0, flex: 1 }}>
                                            <p style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.product_name}</p>
                                            <p style={{ fontSize: 11, color: "#64748b", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.supermarket_name}</p>
                                        </div>
                                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                                            <p style={{ fontSize: 13, fontWeight: 800, color: "#059669", margin: 0, fontVariantNumeric: "tabular-nums" }}>{d.current_price?.toFixed(2)}€</p>
                                            <p style={{ fontSize: 10, fontWeight: 700, color: "#10b981", margin: 0 }}>{d.delta_pct}%</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Recent prices */}
                            {generalStats?.recent_activity?.length > 0 && (
                                <div style={{ background: "white", borderRadius: 20, padding: "1rem", border: "1px solid #e2e8f0" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.875rem" }}>
                                        <Clock style={{ width: 15, height: 15, color: "#0284c7" }} />
                                        <h2 style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", margin: 0 }}>Últimos precios</h2>
                                    </div>
                                    {generalStats.recent_activity.slice(0, 5).map((item, idx) => (
                                        <div key={`${item.created_at}-${idx}`} style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.5rem 0", borderBottom: idx < 4 ? "1px solid #f1f5f9" : "none" }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 10, background: "#f0f9ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                <Tag style={{ width: 14, height: 14, color: "#0284c7" }} />
                                            </div>
                                            <div style={{ minWidth: 0, flex: 1 }}>
                                                <p style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.product_name}</p>
                                                <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>{item.supermarket_name} · {timeAgo(item.created_at)}</p>
                                            </div>
                                            <span style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>{formatPrice(item.price)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </aside>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;

