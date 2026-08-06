import { createContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { SavedToken } from '../types';

export interface TokenContextValue {
    tokens: SavedToken[];
    addToken: (label: string, token: string) => void;
    removeToken: (label: string) => void;
}

export const TokenContext = createContext<TokenContextValue | null>(null);

/*
 * DOCU: Holds every Bearer token grabbed during this session (from
 * register/login, or pasted manually), labeled so any module form can
 * offer "send as INFORMATION" / "send as ADMIN" etc. via a dropdown.
 * In-memory only — refreshing the page clears it.
 *
 * Last Updated: 2026-08-06
 * Author: Alfred
 * Last Updated By: Alfred
 */
export function TokenProvider({ children }: { children: ReactNode }) {
    const [tokens, setTokens] = useState<SavedToken[]>([]);

    function addToken(label: string, token: string) {
        setTokens((prev) => [...prev.filter((t) => t.label !== label), { label, token }]);
    }

    function removeToken(label: string) {
        setTokens((prev) => prev.filter((t) => t.label !== label));
    }

    return (
        <TokenContext.Provider value={{ tokens, addToken, removeToken }}>
            {children}
        </TokenContext.Provider>
    );
}
