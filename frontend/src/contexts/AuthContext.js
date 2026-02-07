import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Configuración inicial de Axios
const initialToken = localStorage.getItem('token');
if (initialToken) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${initialToken}`;
}
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

    // Procesa la sesión de Google (intercambia ID por Token JWT)
    const processGoogleSession = useCallback(async (sessionId) => {
        try {
            const response = await axios.post(`${API}/auth/google/session`, { session_id: sessionId });
            const { user: userData, access_token } = response.data;

            localStorage.setItem('token', access_token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

            setToken(access_token);
            setUser(userData);
            return userData;
        } catch (error) {
            console.error('Error processing Google session:', error);
            throw error;
        }
    }, []);

    // Orquestador de autenticación al cargar la App
    useEffect(() => {
        const initializeAuth = async () => {
            const hash = window.location.hash;

            // 1. ¿Venimos de una redirección de Google?
            if (hash.includes('session_id=')) {
                const sessionId = hash.split('session_id=')[1];
                try {
                    await processGoogleSession(sessionId);
                    // Limpiamos la URL para que no quede el session_id a la vista
                    window.history.replaceState(null, '', window.location.pathname);
                } catch (err) {
                    console.error("Fallo al inicializar sesión de Google");
                } finally {
                    setLoading(false);
                }
                return; // Evitamos que siga al paso 2
            }

            // 2. Si no es Google, ¿tenemos un token guardado de antes?
            if (token) {
                await fetchUser();
            } else {
                setLoading(false);
            }
        };

        initializeAuth();
    }, [token, fetchUser, processGoogleSession]);

    const loginWithGoogle = () => {
        window.location.href = `${process.env.REACT_APP_BACKEND_URL}/api/auth/google`;
    };

    const login = async (email, password) => {
        const response = await axios.post(`${API}/auth/login`, { email, password });
        const { access_token, user: userData } = response.data;
        localStorage.setItem('token', access_token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        setToken(access_token);
        setUser(userData);
        return userData;
    };

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