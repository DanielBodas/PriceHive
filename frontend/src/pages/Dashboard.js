import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import { 
    Trophy, 
    ShoppingCart, 
    Plus, 
    MessageSquare, 
    BarChart2,
    Heart,
    Send,
    User,
    TrendingUp,
    Store,
    Tag,
    ChevronRight,
    Crown,
    Search,
    Bell,
    ArrowUpRight,
    Sparkles
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [stats, setStats] = useState(null);
    const [userData, setUserData] = useState(null);
    const [recentList, setRecentList] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState("");
    const [postType, setPostType] = useState("update");
    const [posting, setPosting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [statsRes, userRes, listsRes, postsRes, lbRes] = await Promise.all([
                axios.get(`${API}/analytics/stats`),
                axios.get(`${API}/my-points`),
                axios.get(`${API}/shopping-lists`),
                axios.get(`${API}/posts`),
                axios.get(`${API}/leaderboard?limit=5`)
            ]);
            
            setStats(statsRes.data);
            setUserData(userRes.data);
            setLeaderboard(lbRes.data);
            setPosts(postsRes.data);
            if (listsRes.data?.length > 0) setRecentList(listsRes.data[0]);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReaction = async (postId, reactionType) => {
        try {
            const response = await axios.post(`${API}/posts/${postId}/react`, { reaction_type: reactionType });
            setPosts(posts.map(p => p.id === postId ? { ...p, reactions: response.data.reactions } : p));
        } catch (error) {
            toast.error("Error al reaccionar");
        }
    };

    const handleCreatePost = async () => {
        if (!newPost.trim()) return;
        setPosting(true);
        try {
            await axios.post(`${API}/posts`, { content: newPost, post_type: postType });
            toast.success("Publicación enviada");
            setNewPost("");
            const response = await axios.get(`${API}/posts`);
            setPosts(response.data);
        } catch (error) {
            toast.error("Error al publicar");
        } finally {
            setPosting(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString('es-ES', { 
            day: 'numeric', month: 'short'
        });
    };

    return (
        <Layout>
            <div className="min-h-screen bg-slate-50/50 -mt-8 pt-12">
                <div className="max-w-7xl mx-auto px-6 pb-20 space-y-12">
                    
                    {/* ── HEADER ARQUITECTÓNICO (Estilo Apple) ── */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-1">
                            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-600">Overview</p>
                            <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
                                Hola, {user?.name?.split(' ')[0]}.
                            </h1>
                            <p className="text-lg text-slate-400 font-medium tracking-tight">Esto es lo que está pasando hoy en PriceHive.</p>
                        </div>
                        <div className="flex gap-3">
                            <button className="p-4 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow border border-slate-100"><Bell className="w-5 h-5 text-slate-400" /></button>
                            <button className="p-4 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow border border-slate-100"><Search className="w-5 h-5 text-slate-400" /></button>
                        </div>
                    </div>

                    {/* ── GRID DE ESTADO (Modular Clean) ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="bg-white border-none shadow-sm rounded-[2rem] p-8 group hover:shadow-xl transition-all duration-500">
                            <div className="flex flex-col h-full justify-between gap-8">
                                <div className="flex justify-between items-start">
                                    <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600"><Sparkles className="w-6 h-6" /></div>
                                    <ArrowUpRight className="w-5 h-5 text-slate-200 group-hover:text-emerald-500 transition-colors" />
                                </div>
                                <div>
                                    <p className="text-4xl font-black text-slate-900 tabular-nums tracking-tighter">{userData?.points || 0}</p>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Puntos Acumulados</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="bg-white border-none shadow-sm rounded-[2rem] p-8 group hover:shadow-xl transition-all duration-500">
                            <div className="flex flex-col h-full justify-between gap-8">
                                <div className="flex justify-between items-start">
                                    <div className="p-4 bg-amber-50 rounded-2xl text-amber-600"><Crown className="w-6 h-6" /></div>
                                    <ArrowUpRight className="w-5 h-5 text-slate-200 group-hover:text-amber-500 transition-colors" />
                                </div>
                                <div>
                                    <p className="text-4xl font-black text-slate-900 tabular-nums tracking-tighter">#{userData?.rank || '-'}</p>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Ranking Global</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="bg-slate-900 text-white border-none shadow-2xl rounded-[2.5rem] p-8 md:col-span-2 overflow-hidden relative group">
                            <div className="absolute right-0 top-0 p-12 opacity-5 scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                                <TrendingUp className="w-32 h-32" />
                            </div>
                            <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Live Community Pulse</p>
                                </div>
                                <div className="grid grid-cols-2 gap-12">
                                    <div>
                                        <p className="text-5xl font-black text-white tracking-tighter">{stats?.total_prices || 0}</p>
                                        <p className="text-xs font-bold text-white/30 uppercase tracking-widest mt-2">Precios hoy</p>
                                    </div>
                                    <div>
                                        <p className="text-5xl font-black text-white tracking-tighter">{stats?.total_supermarkets || 0}</p>
                                        <p className="text-xs font-bold text-white/30 uppercase tracking-widest mt-2">Tiendas activas</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* ── CUERPO PRINCIPAL (Layout Google/Apple Split) ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        
                        {/* Feed Social (Arquitectura de Timeline Limpio) */}
                        <div className="lg:col-span-8 space-y-8">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Social Pulse</h3>
                                <button className="text-xs font-bold text-emerald-600 hover:underline">Ver todo</button>
                            </div>
                            
                            {/* Publicador Minimalista */}
                            <Card className="bg-white border-none shadow-sm rounded-[2rem] p-6 focus-within:shadow-xl transition-all duration-300">
                                <div className="flex gap-5">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-sm border-2 border-white shadow-sm">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <Textarea
                                            placeholder={`Cuéntanos un hallazgo, ${user?.name?.split(' ')[0]}...`}
                                            value={newPost}
                                            onChange={(e) => setNewPost(e.target.value)}
                                            className="min-h-[80px] border-none focus-visible:ring-0 text-xl bg-transparent resize-none p-0 placeholder:text-slate-200 font-medium"
                                        />
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                            <div className="flex gap-4">
                                                <button onClick={() => setPostType('update')} className={`text-[10px] font-black uppercase tracking-widest ${postType === 'update' ? 'text-slate-900' : 'text-slate-300'}`}>General</button>
                                                <button onClick={() => setPostType('price_alert')} className={`text-[10px] font-black uppercase tracking-widest ${postType === 'price_alert' ? 'text-rose-500' : 'text-slate-300'}`}>Alerta</button>
                                                <button onClick={() => setPostType('tip')} className={`text-[10px] font-black uppercase tracking-widest ${postType === 'tip' ? 'text-emerald-500' : 'text-slate-300'}`}>Consejo</button>
                                            </div>
                                            <Button 
                                                onClick={handleCreatePost} 
                                                disabled={posting || !newPost.trim()}
                                                className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-8 font-black text-xs h-10 shadow-lg shadow-slate-900/20"
                                            >
                                                Publicar
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Stream de Posts */}
                            <div className="space-y-6">
                                {loading ? (
                                    <div className="py-20 text-center"><Sparkles className="w-8 h-8 text-slate-200 animate-spin mx-auto" /></div>
                                ) : posts.map((post) => (
                                    <Card key={post.id} className="bg-white border-none shadow-sm rounded-[2rem] p-8 hover:shadow-md transition-all group">
                                        <div className="flex gap-6">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center font-black text-slate-300 text-sm border-2 border-white shadow-sm">
                                                    {post.user_name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="w-px h-full bg-slate-50"></div>
                                            </div>
                                            <div className="flex-1 space-y-4 pb-2">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-black text-slate-900 text-sm">{post.user_name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formatDate(post.created_at)}</p>
                                                    </div>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${post.post_type === 'price_alert' ? 'bg-rose-50 text-rose-500' : post.post_type === 'tip' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                                        {post.post_type.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <p className="text-slate-600 text-base leading-relaxed font-medium">{post.content}</p>
                                                <div className="flex gap-6 pt-2">
                                                    <button onClick={() => handleReaction(post.id, 'like')} className="flex items-center gap-1.5 group/btn">
                                                        <Heart className={`w-5 h-5 transition-colors ${post.reactions.like > 0 ? 'fill-rose-500 text-rose-500' : 'text-slate-200 group-hover/btn:text-rose-500'}`} />
                                                        <span className={`text-[10px] font-black ${post.reactions.like > 0 ? 'text-rose-500' : 'text-slate-300'}`}>{post.reactions.like || 0}</span>
                                                    </button>
                                                    <button className="flex items-center gap-1.5 group/btn">
                                                        <MessageSquare className="w-5 h-5 text-slate-200 group-hover/btn:text-slate-900 transition-colors" />
                                                        <span className="text-[10px] font-black text-slate-300">{post.comments_count || 0}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Widgets Laterales (Estilo Modular Clean) */}
                        <div className="lg:col-span-4 space-y-8">
                            
                            {/* Compra Inteligente */}
                            <div className="space-y-4 px-2">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Tu Compra</h3>
                                <Card className="bg-white border-none shadow-sm rounded-[2rem] overflow-hidden group">
                                    <div className="p-8 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="p-4 bg-slate-900 text-white rounded-2xl"><ShoppingCart className="w-5 h-5" /></div>
                                            <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest">Activa</div>
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-slate-900 leading-tight">{recentList ? recentList.name : "Nueva Lista"}</h4>
                                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{recentList ? `${recentList.items?.length || 0} productos seleccionados` : "Organiza tu ahorro"}</p>
                                        </div>
                                        {recentList && (
                                            <div className="space-y-3">
                                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                    <div className="bg-slate-900 h-full rounded-full transition-all duration-1000" style={{ width: `${(recentList.items?.filter(i => i.purchased).length / (recentList.items?.length || 1)) * 100}%` }} />
                                                </div>
                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                    <span>Completado</span>
                                                    <span className="text-slate-900">{Math.round((recentList.items?.filter(i => i.purchased).length / (recentList.items?.length || 1)) * 100)}%</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <button onClick={() => navigate('/shopping-list')} className="w-full py-5 bg-slate-50 group-hover:bg-slate-900 group-hover:text-white transition-all text-xs font-black uppercase tracking-[0.2em]">
                                        Continuar Compra
                                    </button>
                                </Card>
                            </div>

                            {/* Herramientas Rápidas */}
                            <div className="space-y-4 px-2">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Acceso Rápido</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <button onClick={() => navigate('/analytics')} className="w-full flex items-center justify-between p-6 bg-white border-none shadow-sm rounded-3xl hover:shadow-md transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors"><BarChart2 className="w-5 h-5" /></div>
                                            <span className="font-black text-slate-900 text-sm">Comparador</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-200" />
                                    </button>
                                    <button onClick={() => navigate('/profile')} className="w-full flex items-center justify-between p-6 bg-white border-none shadow-sm rounded-3xl hover:shadow-md transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl group-hover:bg-rose-600 group-hover:text-white transition-colors"><Trophy className="w-5 h-5" /></div>
                                            <span className="font-black text-slate-900 text-sm">Mi Perfil</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-200" />
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;

