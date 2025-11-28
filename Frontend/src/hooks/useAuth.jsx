import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { API_LOGIN_URL, API_AUTH_STATUS_URL } from '../config/api.jsx';

const TOKEN_STORAGE_KEY = 'dashboard_admin_token';

const getStoredToken = () => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(TOKEN_STORAGE_KEY) || '';
};

export const useAuth = () => {
    const [token, setToken] = useState(getStoredToken);
    const [isAdmin, setIsAdmin] = useState(false);
    const [authError, setAuthError] = useState(null);
    const [isChecking, setIsChecking] = useState(false);

    const verifyToken = useCallback(async (existingToken = token) => {
        if (!existingToken) {
            setIsAdmin(false);
            return false;
        }

        setIsChecking(true);
        try {
            const { data } = await axios.get(API_AUTH_STATUS_URL, {
                headers: { Authorization: `Bearer ${existingToken}` }
            });
            const isAuthenticated = Boolean(data?.authenticated);
            setIsAdmin(isAuthenticated);
            return isAuthenticated;
        } catch (err) {
            console.warn('Admin token verification failed', err?.message);
            setIsAdmin(false);
            return false;
        } finally {
            setIsChecking(false);
        }
    }, [token]);

    useEffect(() => {
        verifyToken(token);
    }, [token, verifyToken]);

    const login = useCallback(async (username, password) => {
        setAuthError(null);
        setIsChecking(true);
        try {
            const { data } = await axios.post(API_LOGIN_URL, { username, password });
            if (!data?.token) {
                setAuthError('Login failed: missing token in response.');
                setIsAdmin(false);
                return false;
            }

            if (typeof window !== 'undefined') {
                localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
            }
            setToken(data.token);
            setIsAdmin(true);
            return true;
        } catch (err) {
            const message = err?.response?.data?.error || 'Invalid credentials. Please try again.';
            setAuthError(message);
            setIsAdmin(false);
            return false;
        } finally {
            setIsChecking(false);
        }
    }, []);

    const logout = useCallback(() => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
        setToken('');
        setIsAdmin(false);
        setAuthError(null);
    }, []);

    const resetAuthError = useCallback(() => setAuthError(null), []);

    return {
        token,
        isAdmin,
        authError,
        isChecking,
        login,
        logout,
        verifyToken,
        resetAuthError
    };
};
