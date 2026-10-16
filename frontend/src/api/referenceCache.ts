import { apiRequest } from './client';
import type { ApiResult } from '../types';

interface CacheEntry {
    timestamp: number;
    promise: Promise<ApiResult>;
}

// How long a fetched (or in-flight) list is considered fresh enough to
// reuse. Long enough to absorb a burst of components all asking for the
// same endpoint within a few seconds (tab switches, several reference
// fields on one form, React StrictMode's double effect invocation in
// dev) — short enough that newly created/edited/deleted records show up
// again quickly without a manual refresh.
const CACHE_TTL_MS = 30_000;

const cache = new Map<string, CacheEntry>();

function cacheKey(endpoint: string): string {
    // List responses can be role-scoped, so never reuse one user's response
    // for another authenticated session.
    const sessionToken = localStorage.getItem('rdms_token') ?? 'anonymous';
    return `${sessionToken}:${endpoint}`;
}

/*
 * DOCU: GET {endpoint} with session-scoped caching + in-flight
 * de-duplication. If another caller in the same session already requested
 * this endpoint within CACHE_TTL_MS (or a request to it is still in flight
 * right now), this returns that same promise instead of firing a new network
 * call.
 *
 * This is what stops many independent ReferencePickers/ModuleForm tabs
 * that all reference the same endpoint (e.g. several forms pointing at
 * /clubs) from each hammering the API on their own — previously every
 * mount/tab-switch fired its own uncached GET, which was enough
 * cumulative traffic to trip the backend's rate limiter (429s).
 *
 * Last Updated: 2026-08-09
 * Author: Alfred
 * Last Updated By: Alfred
 */
export function fetchReferenceList(endpoint: string): Promise<ApiResult> {
    const key = cacheKey(endpoint);
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.promise;
    }
    const promise = apiRequest('GET', endpoint);
    cache.set(key, { timestamp: Date.now(), promise });
    // If the request fails, don't leave a rejected promise cached — let
    // the next caller retry instead of replaying the same failure for
    // the rest of the TTL window.
    promise.catch(() => cache.delete(key));
    return promise;
}

/*
 * DOCU: Drops the current session's cached endpoint (or everything, if no endpoint given)
 * so the next fetchReferenceList call is forced to go to the network.
 * Call this after a create/update/delete against an endpoint so other
 * components referencing it (e.g. a picker for /clubs, after a club
 * was just edited) don't keep serving stale cached data for the rest
 * of the TTL window.
 *
 * Last Updated: 2026-08-09
 * Author: Alfred
 * Last Updated By: Alfred
 */
export function invalidateReferenceCache(endpoint?: string) {
    if (endpoint) {
        cache.delete(cacheKey(endpoint));
    } else {
        cache.clear();
    }
}