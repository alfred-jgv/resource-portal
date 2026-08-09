import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTokens } from '../hooks/useTokens';
import { apiRequest } from '../api/client';

/*
 * DOCU: Login screen (register hidden for now). On success, stores
 * the returned access_token via TokenContext.login() and navigates
 * to wherever ProtectedRoute redirected from (default /tasks).
 *
 * Last Updated: 2026-08-06
 * Author: Alfred
 * Last Updated By: Alfred
 */
export default function AuthPage() {
    const { login } = useTokens();
    const navigate = useNavigate();
    const location = useLocation();
    const redirectTo = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/tasks';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await apiRequest('POST', '/auth/login', { email, password });
            if (res.status >= 300 || !res.data?.access_token) {
                setError(res.data?.message ?? 'Login failed');
                return;
            }
            login(res.data.access_token);
            navigate(redirectTo, { replace: true });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="module">
            <h2>Login</h2>

            <form onSubmit={handleSubmit}>
                <div className="field">
                    <label>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="field">
                    <label>Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>

                {error && <p style={{ color: 'crimson' }}>{error}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? 'Please wait…' : 'Login'}
                </button>
            </form>
        </div>
    );
}