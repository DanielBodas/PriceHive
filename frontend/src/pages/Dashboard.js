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
    ShoppingCart,
    MessageCircle,
    BarChart3,
    Heart,
    Send,
    TrendingUp,
    TrendingDown,
    ChevronRight,
    Crown,
    Bell,
    Sparkles,
    Flame,
    Tag,
    AlertTriangle,
    Lightbulb,
    Megaphone,
    Zap,
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

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [userData, setUserData] = useState(null);
    const [posts, setPosts] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [trending, setTrending] = useState([]);
    const [bestDeals, setBestDeals] = useState([]);
    const [pulse, setPulse] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState("all"); // all | update | price_alert | tip
    const [loading, setLoading] = useState(true);

    const fetchAll = async () => {
        try {
            const [userRes, postsRes, lbRes, trRes, bdRes, pulseRes, notifRes] = await Promise.all([
                axios.get(`${API}/my-points`),
                axios.get(`${API}/posts`),
                axios.get(`${API}/leaderboard?limit=5`),
                axios.get(`${API}/community/trending?limit=5`).catch(() => ({ data: [] })),
                axios.get(`${API}/community/best-deals?limit=5`).catch(() => ({ data: [] })),
                axios.get(`${API}/community/pulse`).catch(() => ({ data: null })),
                axios.get(`${API}/notifications`).catch(() => ({ data: [] })),
            ]);
            setUserData(userRes.data);
            setPosts(postsRes.data);
            setLeaderboard(lbRes.data);
            setTrending(trRes.data);
            setBestDeals(bdRes.data);
            setPulse(pulseRes.data);
            setNotifications((notifRes.data || []).slice(0, 4));
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
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                                Hola, <span className="text-emerald-500">{user?.name?.split(" ")[0]}</span> 👋
                            </h1>
                            <p className="text-slate-500 text-sm mt-1">Descubre qué está pasando en la comunidad</p>
                        </div>
                        {pulse && (
                            <div className="flex items-center gap-2 flex-wrap">
                                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-xs font-bold text-slate-500">EN VIVO</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                    <Tag className="w-4 h-4 text-emerald-500" />
                                    <span className="text-xs font-bold text-slate-900">{pulse.prices_24h}</span>
                                    <span className="text-xs text-slate-500">precios hoy</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                    <Users className="w-4 h-4 text-sky-500" />
                                    <span className="text-xs font-bold text-slate-900">{pulse.active_users_7d}</span>
                                    <span className="text-xs text-slate-500">activos</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── 3-COLUMN LAYOUT ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                        {/* LEFT SIDEBAR */}
                        <aside className="lg:col-span-3 space-y-4 order-2 lg:order-1">
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
                                <Button
                                    onClick={() => navigate("/profile")}
                                    className="w-full mt-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-none rounded-full text-xs font-bold h-9"
                                >
                                    Ver mi perfil
                                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                </Button>
                            </Card>

                            {/* Quick nav */}
                            <Card className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm">
                                <SectionTitle icon={Zap} title="Acceso rápido" />
                                <div className="space-y-1">
                                    {[
                                        { icon: ShoppingCart, label: "Mi Lista", color: "text-emerald-600", bg: "bg-emerald-50", to: "/shopping-list" },
                                        { icon: BarChart3, label: "Análisis", color: "text-indigo-600", bg: "bg-indigo-50", to: "/analytics" },
                                        { icon: Bell, label: "Alertas", color: "text-rose-600", bg: "bg-rose-50", to: "/alerts" },
                                        { icon: Trophy, label: "Mi Perfil", color: "text-amber-600", bg: "bg-amber-50", to: "/profile" },
                                    ].map((item) => (
                                        <button
                                            key={item.to}
                                            onClick={() => navigate(item.to)}
                                            className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-50 transition-colors group text-left"
                                        >
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.bg}`}>
                                                <item.icon className={`w-4 h-4 ${item.color}`} />
                                            </div>
                                            <span className="text-sm font-semibold text-slate-700 flex-1">{item.label}</span>
                                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                                        </button>
                                    ))}
                                </div>
                            </Card>
                        </aside>

                        {/* CENTER FEED */}
                        <div className="lg:col-span-6 space-y-4 order-1 lg:order-2">
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
                        <aside className="lg:col-span-3 space-y-4 order-3">
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
                            <Card className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
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

export default Dashboard;
