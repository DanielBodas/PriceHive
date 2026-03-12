import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { Hexagon } from "lucide-react";

const AuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { processGoogleSession } = useAuth();
    const hasProcessed = useRef(false);

    useEffect(() => {
        // Prevent double processing in StrictMode
        if (hasProcessed.current) return;
        hasProcessed.current = true;

        const processSession = async () => {
            const hash = location.hash;
            const sessionIdMatch = hash.match(/session_id=([^&]+)/);
            
            if (sessionIdMatch) {
                const sessionId = sessionIdMatch[1];
                try {
                    const user = await processGoogleSession(sessionId);
                    toast.success(`¡Bienvenido, ${user.name}!`);
                    // Clear the hash and navigate to dashboard
                    window.history.replaceState(null, '', '/dashboard');
                    navigate('/dashboard', { replace: true, state: { user } });
                } catch (error) {
                    console.error('Auth callback error:', error);
                    toast.error("Error al iniciar sesión con Google");
                    navigate('/login', { replace: true });
                }
            } else {
                navigate('/login', { replace: true });
            }
        };

        processSession();
    }, [location.hash, navigate, processGoogleSession]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background hive-pattern">
            <div className="text-center p-12 glass rounded-[2.5rem] border border-primary/20 shadow-2xl animate-fade-in-up">
                <div className="relative w-20 h-20 mx-auto mb-6">
                    <Hexagon className="w-20 h-20 text-primary fill-primary/10 animate-pulse" strokeWidth={1.5} />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 bg-primary rounded-full animate-ping" />
                    </div>
                </div>
                <h2 className="text-2xl font-extrabold text-secondary tracking-tight font-heading">Entrando a PriceHive</h2>
                <p className="text-muted-foreground font-medium mt-2">Sincronizando precios en tiempo real...</p>
            </div>
        </div>
    );
};

export default AuthCallback;
