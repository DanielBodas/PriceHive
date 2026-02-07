import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

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
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600 text-lg">Iniciando sesión...</p>
            </div>
        </div>
    );
};

export default AuthCallback;
