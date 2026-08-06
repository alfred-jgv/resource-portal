import React, { createContext, useContext, useState, useEffect } from 'react';
import * as types from '../types';
import { authApi } from '../api/endpoints/auth';

interface AuthContextType {
    user: types.User | null;
    loading: boolean;
    login: (credentials: types.LoginCredentials) => Promise<void>;
    register: (credentials: types.RegisterCredentials) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<types.User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');

        if (storedUser && token) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                localStorage.removeItem('user');
                localStorage.removeItem('access_token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (credentials: types.LoginCredentials) => {
        const response = await authApi.login(credentials);
        const { access_token, user } = response.data;

        localStorage.setItem('access_token', access_token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
    };

    const register = async (credentials: types.RegisterCredentials) => {
        const response = await authApi.register(credentials);
        const { access_token, user } = response.data;

        localStorage.setItem('access_token', access_token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            register,
            logout,
            isAuthenticated: !!user,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};