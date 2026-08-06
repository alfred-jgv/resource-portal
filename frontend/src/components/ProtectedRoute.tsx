import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useTokens } from '../hooks/useTokens';

/*
 * DOCU: Layout route guarding /captain-leads, /clubs,
 * /department-executives, /tasks. Waits for TokenContext to finish
 * reading localStorage before deciding (avoids flash-redirect on
 * refresh), then renders the child route via <Outlet/> if a token
 * exists, else redirects to /login and remembers the attempted path.
 *
 * Last Updated: 2026-08-06
 * Author: Alfred
 * Last Updated By: Alfred
 */
export default function ProtectedRoute() {
    const { isAuthenticated, isLoading } = useTokens();
    const location = useLocation();

    if (isLoading) return null;
    if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;

    return <Outlet />;
}