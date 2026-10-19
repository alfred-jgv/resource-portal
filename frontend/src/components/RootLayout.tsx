import { Outlet } from 'react-router-dom';
import { useTokens } from '../hooks/useTokens';
import Sidebar from './Sidebar';
import { AppShellSkeleton } from './Skeletons';
import '../styles/RootLayout.css';

/*
 * DOCU: Wraps every route. Shows the sidebar whenever a session
 * exists, regardless of whether the current route is public or
 * protected — so an authenticated ALLOCATION user still sees their
 * nav while on /budget-requests, which is a public route.
 *
 * Last Updated: 2026-08-09
 * Author: Alfred
 * Last Updated By: Alfred
 */
export default function RootLayout() {
    const { isAuthenticated, isLoading } = useTokens();

    if (isLoading) return <AppShellSkeleton />;

    if (!isAuthenticated) {
        return (
            <div className="rd-main">
                <Outlet />
            </div>
        );
    }

    return (
        <div className="rd-app">
            <Sidebar />
            <main className="rd-main">
                <Outlet />
            </main>
        </div>
    );
}