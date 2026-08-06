import { useContext } from 'react';
import { TokenContext } from '../context/TokenContext';

/*
 * DOCU: Access point for TokenContext — every module form and the
 * Auth page use this instead of importing the context directly.
 * @returns {TokenContextValue} - tokens array plus add/removeToken
 * @throws {Error} - If used outside a <TokenProvider>
 *
 * Last Updated: 2026-08-06
 * Author: Alfred
 * Last Updated By: Alfred
 */
export function useTokens() {
    const ctx = useContext(TokenContext);
    if (!ctx) throw new Error('useTokens must be used inside TokenProvider');
    return ctx;
}
