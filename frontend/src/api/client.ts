import type { ApiResult } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

/*
 * DOCU: Generic fetch wrapper used by every module form. Sends either
 * JSON or multipart/form-data depending on `isMultipart`, attaches a
 * Bearer token if provided, and always resolves to a normalized
 * { status, data } shape — even on non-2xx responses — so the UI can
 * show the raw result instead of throwing on 4xx/5xx.
 *
 * @param {string} method - HTTP method, e.g. 'GET' | 'POST' | 'DELETE'
 * @param {string} path - API path starting with '/', e.g. '/clubs'
 * @param {string} [token] - Bearer token to attach, omit for anonymous requests
 * @param {Record<string, any> | FormData} [body] - Request body
 * @param {boolean} [isMultipart] - If true, body is sent as FormData (for file uploads)
 * @returns {Promise<ApiResult>} - The response status and parsed body
 *
 * Last Updated: 2026-08-06
 * Author: Alfred
 * Last Updated By: Alfred
 */
export async function apiRequest(
    method: string,
    path: string,
    token?: string,
    body?: Record<string, any> | FormData,
    isMultipart = false,
): Promise<ApiResult> {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

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
    const text = await res.text();
    let data: any;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = text;
    }
    return { status: res.status, data };
}
