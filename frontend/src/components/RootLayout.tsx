import { Outlet } from 'react-router-dom';
import { useTokens } from '../hooks/useTokens';
import Sidebar from './Sidebar';

/*
 * DOCU: Wraps every route. Shows the sidebar whenever a session
 * exists, regardless of whether the current route is public or
 * protected — so an authenticated ALLOCATION user still sees their
 * nav while on /budget-requests, which is a public route.
 *
 * Last Updated: 2026-08-06
 * Author: Alfred
 * Last Updated By: Alfred
 */
export default function RootLayout() {
    const { isAuthenticated, isLoading } = useTokens();

    if (isLoading) return null;

    if (!isAuthenticated) {
        return <Outlet />; // public, unauthenticated view — no sidebar
    }

    return (
        <div className="app">
            <Sidebar />
            <main className="main">
                <Outlet />
            </main>
        </div>
    );
}