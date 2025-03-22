import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
            try {
                const userData = JSON.parse(userStr);
                setUser(userData);
            } catch (error) {
                console.error('Failed to parse user data:', error);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, token) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    const isAuthenticated = () => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        return Boolean(token && userStr);
    };

    return (
        <AuthContext.Provider value={{
            user,
            setUser,
            login,
            logout,
            isAuthenticated,
            loading
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