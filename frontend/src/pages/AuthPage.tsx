import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTokens } from '../hooks/useTokens';
import { apiRequest } from '../api/client';
import '../styles/AuthPage.css';

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
            <div className="rd-auth-col rd-auth-col-left">
                <Link to="/" className="rd-login rd-auth-back">
                    <ArrowLeft size={14} aria-hidden="true" />
                    Back to home
                </Link>

                <div className="rd-auth-card">
                    <p className="rd-eyebrow">Resource Officer Access</p>
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
                            <button className="rd-btn" type="submit" disabled={loading} aria-busy={loading} aria-label={loading ? 'Signing in' : undefined}>
                                {loading ? (
                                    <>
                                        <span className="rd-button-spinner" aria-hidden="true" />
                                        Signing in...
                                    </>
                                ) : 'Login'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="rd-auth-col rd-auth-col-right">
                <div className="rd-auth-brand-panel">
                    <img src="/AWSSUG-branding.jpg" alt="AWS Student User Group Philippines branding" />
                    <span>This is a test environment :3</span>
                </div>
            </div>
        </div>
    );
}