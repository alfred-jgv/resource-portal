import { useNavigate } from 'react-router-dom';
import { useTokens } from '../hooks/useTokens';

/*
 * DOCU: Clears the session token and returns to home. Drop this into
 * any page header/nav for protected routes.
 *
 * Last Updated: 2026-08-06
 * Author: Alfred
 * Last Updated By: Alfred
 */
export default function LogoutButton() {
    const { logout } = useTokens();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate('/', { replace: true });
    }

    return <button onClick={handleLogout}>Logout</button>;
}