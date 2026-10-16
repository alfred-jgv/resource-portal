import { createContext, useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export const TOKEN_KEY = 'rdms_token';

export interface TokenContextValue {
    token: string | null;
    name: string | null;
    role: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string) => void;
    logout: () => void;
}

export const TokenContext = createContext<TokenContextValue | null>(null);

/*
 * DOCU: Decodes the JWT payload client-side to read `role` — no
 * signature verification needed here, the backend already validates
 * the token on every request; this is purely for UI gating.
 */
function decodeUser(token: string): { name: string | null; role: string | null } {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return { name: payload.name ?? null, role: payload.role ?? null };
    } catch {
        return { name: null, role: null };
    }
}

/*
 * DOCU: Reads the JWT's `exp` claim (seconds since epoch) and reports
 * whether the token has already expired. A token can be well-formed
 * and still stale — this is what stops a leftover localStorage token
 * from a past session silently granting sidebar/session access after
 * it's actually expired server-side.
 */
function isExpired(token: string): boolean {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (typeof payload.exp !== 'number') return false; // no exp claim — nothing to check client-side
        return Date.now() >= payload.exp * 1000;
    } catch {
        return true; // unparsable token can't be trusted
    }
}

export function TokenProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [name, setName] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem(TOKEN_KEY);
        if (stored) {
            if (isExpired(stored)) {
                // Stale session from a previous visit — drop it instead of
                // treating its mere presence as "logged in".
                localStorage.removeItem(TOKEN_KEY);
            } else {
                setToken(stored);
                const user = decodeUser(stored);
                setName(user.name);
                setRole(user.role);
                fetch(`${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api'}/auth/me`, {
                    headers: { Authorization: `Bearer ${stored}` },
                })
                    .then(async (response) => {
                        if (!response.ok) return null;
                        return response.json();
                    })
                    .then((profile: { name?: string | null; role?: string | null } | null) => {
                        if (!profile) return;
                        setName(profile.name ?? null);
                        setRole(profile.role ?? user.role);
                    })
                    .catch((error) => {
                        console.error('Unable to refresh the authenticated officer profile.', error);
                    });
            }
        }
        setIsLoading(false);
    }, []);

    const login = useCallback((t: string) => {
        localStorage.setItem(TOKEN_KEY, t);
        setToken(t);
        const user = decodeUser(t);
        setName(user.name);
        setRole(user.role);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setName(null);
        setRole(null);
    }, []);

    useEffect(() => {
        window.addEventListener('auth:logout', logout);
        return () => window.removeEventListener('auth:logout', logout);
    }, [logout]);

    return (
        <TokenContext.Provider value={{ token, name, role, isAuthenticated: !!token, isLoading, login, logout }}>
            {children}
        </TokenContext.Provider>
    );
}