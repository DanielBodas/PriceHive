import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('token'));
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

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            setToken(storedToken);
            fetchUser();
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
