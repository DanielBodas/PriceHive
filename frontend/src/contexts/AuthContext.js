import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const initialized = useRef(false);

    const fetchUser = useCallback(async (currentToken) => {
        if (!currentToken) {
            setLoading(false);
            return;
        }
        
        try {
            axios.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
            const response = await axios.get(`${API}/auth/me`);
            setUser(response.data);
            setToken(currentToken);
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

    // Initialize auth state from localStorage on mount
    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;
        
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            // Set the header immediately
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            setToken(storedToken);
            fetchUser(storedToken);
        } else {
            setLoading(false);
        }
    }, [fetchUser]);

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

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);
    };

    const isAdmin = () => user?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAdmin, fetchUser }}>
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
