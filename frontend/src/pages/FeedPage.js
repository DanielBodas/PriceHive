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
    ThumbsUp, 
    Lightbulb, 
    AlertTriangle,
    Send,
    Clock,
    User
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const FeedPage = () => {
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
                return "bg-lime-50 border-lime-200 text-lime-700";
            default:
                return "bg-emerald-50 border-emerald-200 text-emerald-700";
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
            <div className="max-w-2xl mx-auto space-y-6" data-testid="feed-page">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        Muro
                    </h1>
                    <p className="text-slate-500 mt-1">Comparte y descubre información de la comunidad</p>
                </div>

                {/* New Post */}
                <Card className="border-slate-200" data-testid="new-post-card">
                    <CardContent className="p-4 space-y-4">
                        <Textarea
                            placeholder="¿Qué quieres compartir con la comunidad?"
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                            className="min-h-[100px] resize-none bg-slate-50 border-slate-200 focus:border-emerald-500"
                            data-testid="new-post-textarea"
                        />
                        <div className="flex items-center justify-between">
                            <Select value={postType} onValueChange={setPostType}>
                                <SelectTrigger className="w-48" data-testid="post-type-select">
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
                                className="bg-emerald-500 hover:bg-emerald-600 gap-2"
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
                            <Card key={post.id} className="border-slate-200" data-testid={`post-${post.id}`}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-medium">
                                                {post.user_name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{post.user_name}</p>
                                                <p className="text-xs text-slate-400 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDate(post.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPostTypeStyles(post.post_type)}`}>
                                            {getPostTypeLabel(post.post_type)}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <p className="text-slate-700 whitespace-pre-wrap mb-4">{post.content}</p>
                                    
                                    {/* Reactions */}
                                    <div className="flex items-center gap-2 flex-wrap border-t border-slate-100 pt-4">
                                        {reactionButtons.map((btn) => (
                                            <Button
                                                key={btn.type}
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleReaction(post.id, btn.type)}
                                                className={`gap-1.5 ${post.reactions[btn.type] > 0 ? 'text-emerald-600' : 'text-slate-500'}`}
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
                                                    className="flex-1 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                                                    data-testid={`comment-input-${post.id}`}
                                                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                                                />
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleAddComment(post.id)}
                                                    className="bg-emerald-500 hover:bg-emerald-600"
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
