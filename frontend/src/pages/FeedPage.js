import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner";
import {
    MessageSquare,
    Heart,
    Hexagon,
    ThumbsUp,
    Lightbulb,
    AlertTriangle,
    Send,
    Clock,
    User,
    Trash2
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const FeedPage = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPost, setNewPost] = useState("");
    const [postType, setPostType] = useState("update");
    const [posting, setPosting] = useState(false);
    const [expandedComments, setExpandedComments] = useState({});
    const [comments, setComments] = useState({});
    const [newComments, setNewComments] = useState({});

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await axios.get(`${API}/posts`);
            setPosts(response.data);
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async () => {
        if (!newPost.trim()) return;
        setPosting(true);
        try {
            await axios.post(`${API}/posts`, { content: newPost, post_type: postType });
            toast.success("Publicación creada");
            setNewPost("");
            fetchPosts();
        } catch (error) {
            toast.error("Error al crear publicación");
        } finally {
            setPosting(false);
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

    const handleDeletePost = async (postId) => {
        if (!window.confirm("¿Seguro que quieres eliminar esta publicación?")) return;
        try {
            await axios.delete(`${API}/posts/${postId}`);
            toast.success("Publicación eliminada");
            fetchPosts();
        } catch (error) {
            toast.error("Error al eliminar");
        }
    };

    const toggleComments = async (postId) => {
        if (expandedComments[postId]) {
            setExpandedComments({ ...expandedComments, [postId]: false });
        } else {
            try {
                const response = await axios.get(`${API}/posts/${postId}/comments`);
                setComments({ ...comments, [postId]: response.data });
                setExpandedComments({ ...expandedComments, [postId]: true });
            } catch (error) {
                toast.error("Error al cargar comentarios");
            }
        }
    };

    const handleAddComment = async (postId) => {
        const content = newComments[postId];
        if (!content?.trim()) return;
        try {
            await axios.post(`${API}/posts/${postId}/comments`, { content });
            const response = await axios.get(`${API}/posts/${postId}/comments`);
            setComments({ ...comments, [postId]: response.data });
            setNewComments({ ...newComments, [postId]: "" });
            fetchPosts();
            toast.success("Comentario añadido");
        } catch (error) {
            toast.error("Error al comentar");
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

    const getPostTypeStyles = (type) => {
        switch (type) {
            case "price_alert":
                return "bg-rose-50 border-rose-200 text-rose-700";
            case "tip":
                return "bg-amber-50 border-amber-200 text-amber-700";
            default:
                return "bg-primary/10 border-primary/20 text-primary";
        }
    };

    const getPostTypeLabel = (type) => {
        switch (type) {
            case "price_alert": return "Alerta de Precio";
            case "tip": return "Consejo";
            default: return "Actualización";
        }
    };

    const reactionButtons = [
        { type: "like", icon: <ThumbsUp className="w-4 h-4" />, label: "Me gusta" },
        { type: "love", icon: <Heart className="w-4 h-4" />, label: "Me encanta" },
        { type: "useful", icon: <Lightbulb className="w-4 h-4" />, label: "Útil" },
        { type: "warning", icon: <AlertTriangle className="w-4 h-4" />, label: "Atención" },
    ];

    return (
        <Layout>
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up" data-testid="feed-page">
                {/* Header */}
                <div>
                    <h1 className="text-4xl font-extrabold text-secondary tracking-tight font-heading">
                        Muro de la Comunidad
                    </h1>
                    <p className="text-muted-foreground font-medium mt-1">Comparte y descubre inteligencia colectiva</p>
                </div>

                {/* New Post */}
                <Card className="border-border/50 shadow-sm rounded-[1.5rem]" data-testid="new-post-card">
                    <CardContent className="p-5 space-y-4">
                        <Textarea
                            placeholder="¿Qué información útil has encontrado para el enjambre?"
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                            className="min-h-[120px] resize-none bg-stone-50 border-border/60 focus:border-primary rounded-xl p-4 font-medium"
                            data-testid="new-post-textarea"
                        />
                        <div className="flex items-center justify-between">
                            <Select value={postType} onValueChange={setPostType}>
                                <SelectTrigger className="w-48 rounded-xl font-bold" data-testid="post-type-select">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="update">Actualización</SelectItem>
                                    <SelectItem value="price_alert">Alerta de Precio</SelectItem>
                                    <SelectItem value="tip">Consejo</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                onClick={handleCreatePost}
                                disabled={posting || !newPost.trim()}
                                className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-6 btn-lift shadow-lg shadow-primary/20 gap-2"
                                data-testid="create-post-btn"
                            >
                                <Send className="w-4 h-4" />
                                Publicar
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Posts Feed */}
                {loading ? (
                    <div className="text-center py-12 text-slate-500">Cargando publicaciones...</div>
                ) : posts.length === 0 ? (
                    <Card className="border-slate-200">
                        <CardContent className="p-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                <MessageSquare className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="text-slate-500">No hay publicaciones aún</p>
                            <p className="text-sm text-slate-400 mt-1">¡Sé el primero en compartir algo!</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {posts.map((post) => (
                            <Card key={post.id} className="border-border/50 shadow-sm rounded-[1.5rem]" data-testid={`post-${post.id}`}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <Hexagon className="w-12 h-12 text-primary/20 fill-primary/10" strokeWidth={1.5} />
                                                <div className="absolute inset-0 flex items-center justify-center text-primary font-black">
                                                    {post.user_name?.charAt(0).toUpperCase()}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-bold text-secondary">{post.user_name}</p>
                                                <p className="text-xs text-slate-400 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDate(post.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPostTypeStyles(post.post_type)}`}>
                                                {getPostTypeLabel(post.post_type)}
                                            </span>
                                            {(user?.id === post.user_id || user?.role === 'admin') && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeletePost(post.id)}
                                                    className="w-8 h-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                                    data-testid={`delete-post-${post.id}`}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <p className="text-slate-700 whitespace-pre-wrap mb-4">{post.content}</p>

                                    {/* Reactions */}
                                    <div className="flex items-center gap-2 flex-wrap border-t border-border/30 pt-4">
                                        {reactionButtons.map((btn) => (
                                            <Button
                                                key={btn.type}
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleReaction(post.id, btn.type)}
                                                className={`gap-1.5 rounded-xl font-bold ${post.reactions[btn.type] > 0 ? 'text-primary bg-primary/5' : 'text-muted-foreground'}`}
                                                data-testid={`reaction-${btn.type}-${post.id}`}
                                            >
                                                {btn.icon}
                                                <span className="font-mono text-xs">{post.reactions[btn.type] || 0}</span>
                                            </Button>
                                        ))}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleComments(post.id)}
                                            className="gap-1.5 text-slate-500 ml-auto"
                                            data-testid={`toggle-comments-${post.id}`}
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                            <span className="font-mono text-xs">{post.comments_count || 0}</span>
                                        </Button>
                                    </div>

                                    {/* Comments Section */}
                                    {expandedComments[post.id] && (
                                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                                            {comments[post.id]?.map((comment) => (
                                                <div key={comment.id} className="flex gap-3 bg-slate-50 rounded-lg p-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-medium flex-shrink-0">
                                                        {comment.user_name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-sm text-slate-900">{comment.user_name}</span>
                                                            <span className="text-xs text-slate-400">{formatDate(comment.created_at)}</span>
                                                        </div>
                                                        <p className="text-sm text-slate-600 mt-1">{comment.content}</p>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Add Comment */}
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Escribe un comentario..."
                                                    value={newComments[post.id] || ""}
                                                    onChange={(e) => setNewComments({ ...newComments, [post.id]: e.target.value })}
                                                    className="flex-1 px-4 py-2 text-sm bg-stone-50 border border-border/60 rounded-xl focus:outline-none focus:border-primary font-medium"
                                                    data-testid={`comment-input-${post.id}`}
                                                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                                                />
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleAddComment(post.id)}
                                                    className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-4"
                                                    data-testid={`submit-comment-${post.id}`}
                                                >
                                                    <Send className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default FeedPage;
