import type { ApiResult } from '../types';
import { TOKEN_KEY } from '../context/TokenContext';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

/*
 * DOCU: Fetch wrapper used by every module page. Auto-attaches the
 * active session token from localStorage (no need to pass one), and
 * on 401 dispatches 'auth:logout' (TokenContext clears state) then
 * hard-redirects to /login. Manual `token` param still works if ever
 * needed, but normal calls should omit it.
 *
 * @param {string} method - HTTP method
 * @param {string} path - API path starting with '/'
 * @param {Record<string, any> | FormData} [body]
 * @param {boolean} [isMultipart]
 * @param {string} [token] - override the stored token; usually omit
 * @returns {Promise<ApiResult>}
 *
 * Last Updated: 2026-08-06
 * Author: Alfred
 * Last Updated By: Alfred
 */
export async function apiRequest(
    method: string,
    path: string,
    body?: Record<string, any> | FormData,
    isMultipart = false,
    token?: string,
): Promise<ApiResult> {
    const activeToken = token ?? localStorage.getItem(TOKEN_KEY) ?? undefined;

    const headers: Record<string, string> = {};
    if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

    let fetchBody: BodyInit | undefined;
    if (body) {
        if (isMultipart) {
            fetchBody = body as FormData;
        } else {
            headers['Content-Type'] = 'application/json';
            fetchBody = JSON.stringify(body);
        }
    }

    const res = await fetch(`${BASE_URL}${path}`, { method, headers, body: fetchBody });

    if (res.status === 401 && activeToken) {
        window.dispatchEvent(new Event('auth:logout'));
        if (window.location.pathname !== '/login') window.location.href = '/login';
    }

    const text = await res.text();
    let data: any;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = text;
    }
    return { status: res.status, data };
}