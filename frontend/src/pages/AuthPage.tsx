import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTokens } from '../hooks/useTokens';
import { apiRequest } from '../api/client';
import '../styles/AuthPage.css';

/*
 * DOCU: Login screen (register hidden for now). On success, stores
 * the returned access_token via TokenContext.login() and navigates
 * to wherever ProtectedRoute redirected from (default /tasks).
 *
 * Last Updated: 2026-08-09
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

    async function handleSubmit(e: FormEvent) {
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
        <div className="rd-auth-page">
            <Link to="/" className="rd-login rd-auth-back">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to home
            </Link>

            <div className="rd-module rd-auth-card">
                <p className="rd-eyebrow">Member Access</p>
                <h1>Login</h1>
                <p className="rd-lead">Sign in with your office credentials to manage requests, tasks, and records.</p>

                <form className="rd-auth-form" onSubmit={handleSubmit}>
                    <div className="rd-field">
                        <label>Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="rd-field">
                        <label>Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>

                    {error && <div className="rd-error-banner">{error}</div>}

                    <div className="rd-form-actions">
                        <button className="rd-btn" type="submit" disabled={loading}>
                            {loading ? 'Please wait…' : 'Login'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}