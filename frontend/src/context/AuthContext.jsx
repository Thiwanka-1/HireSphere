import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Configure axios defaults to always send cookies to the Gateway
axios.defaults.withCredentials = true;
const API_BASE = "http://localhost:5000/api/auth";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on page refresh
    useEffect(() => {
        const checkLoggedIn = async () => {
            try {
                const res = await axios.get(`${API_BASE}/profile`);
                setUser(res.data);
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkLoggedIn();
    }, []);

    const logout = async () => {
        try {
            await axios.post(`${API_BASE}/logout`);
            setUser(null);
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);