import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Set initial token from localStorage immediately
const initialToken = localStorage.getItem('token');
if (initialToken) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${initialToken}`;
}

// Configure axios to include credentials (cookies)
axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(initialToken);
    const [loading, setLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        try {
            const response = await axios.get(`${API}/auth/me`);
            setUser(response.data);
        } catch (error) {
            console.error('Error fetching user:', error);
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            setToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initialize auth state
    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    // Google OAuth login
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const loginWithGoogle = () => {
    // Esto redirige a tu backend de Python que configuramos en el puerto 10000
    window.location.href = `${process.env.REACT_APP_BACKEND_URL}/api/auth/google`;
    };

    // Process Google session
    const processGoogleSession = async (sessionId) => {
        try {
            // 1. Canjeamos el session_id por los datos reales
            const response = await axios.post(`${API}/auth/google/session`, { session_id: sessionId });
            
            // Extraemos el usuario y el nuevo token que genera tu backend
            const { user: userData, access_token } = response.data;

            // 2. ¡CRÍTICO!: Guardar el token en el navegador
            localStorage.setItem('token', access_token);
            
            // 3. Configurar axios para que todas las futuras peticiones lleven el token
            axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

            // 4. Actualizar el estado de React
            setToken(access_token);
            setUser(userData);
            
            return userData;
        } catch (error) {
            console.error('Error processing Google session:', error);
            throw error;
        }
    };

    // Legacy login (email/password)
    const login = async (email, password) => {
        const response = await axios.post(`${API}/auth/login`, { email, password });
        const { access_token, user: userData } = response.data;
        localStorage.setItem('token', access_token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        setToken(access_token);
        setUser(userData);
        return userData;
    };

    // Legacy register (email/password)
    const register = async (name, email, password) => {
        const response = await axios.post(`${API}/auth/register`, { name, email, password });
        const { access_token, user: userData } = response.data;
        localStorage.setItem('token', access_token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        setToken(access_token);
        setUser(userData);
        return userData;
    };

    const logout = async () => {
        try {
            await axios.post(`${API}/auth/logout`);
        } catch (error) {
            console.error('Logout error:', error);
        }
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);
    };

    const isAdmin = () => user?.role === 'admin';

    return (
        <AuthContext.Provider value={{ 
            user, 
            token, 
            loading, 
            login, 
            register, 
            logout, 
            isAdmin, 
            fetchUser,
            loginWithGoogle,
            processGoogleSession
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
