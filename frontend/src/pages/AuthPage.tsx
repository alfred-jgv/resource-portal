import { useState } from 'react';
import { useTokens } from '../hooks/useTokens';
import { apiRequest } from '../api/client';
import type { ApiResult } from '../types';

const ROLES = ['INFORMATION', 'ALLOCATION', 'WORKFORCE', 'ADMIN'];

/*
 * DOCU: Register/login screen. Successful requests prompt for a label
 * (e.g. "admin", "info-officer") and save the returned access_token
 * into TokenContext, so every other module page can pick it from a
 * dropdown. Also includes a raw "paste an existing token" option and
 * a one-click /auth/me check to confirm what role a token actually
 * carries — useful whenever a test result looks unexpected.
 *
 * Last Updated: 2026-08-06
 * Author: Alfred
 * Last Updated By: Alfred
 */
export default function AuthPage() {
    const { tokens, addToken, removeToken } = useTokens();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('password123');
    const [name, setName] = useState('');
    const [role, setRole] = useState('ADMIN');
    const [label, setLabel] = useState('');

    const [manualLabel, setManualLabel] = useState('');
    const [manualToken, setManualToken] = useState('');

    const [meLabel, setMeLabel] = useState('');

    const [result, setResult] = useState<ApiResult | null>(null);
    const [loading, setLoading] = useState(false);

    async function run(fn: () => Promise<ApiResult>, onSuccess?: (data: any) => void) {
        setLoading(true);
        try {
            const r = await fn();
            setResult(r);
            if (r.status < 300 && onSuccess) onSuccess(r.data);
        } finally {
            setLoading(false);
        }
    }

    function handleRegister() {
        run(
            () => apiRequest('POST', '/auth/register', undefined, { email, password, name: name || undefined, role }),
            (data) => {
                if (data?.access_token && label) addToken(label, data.access_token);
            },
        );
    }

    function handleLogin() {
        run(
            () => apiRequest('POST', '/auth/login', undefined, { email, password }),
            (data) => {
                if (data?.access_token && label) addToken(label, data.access_token);
            },
        );
    }

    function handleAddManualToken() {
        if (manualLabel && manualToken) {
            addToken(manualLabel, manualToken);
            setManualLabel('');
            setManualToken('');
        }
    }

    function handleCheckMe() {
        const token = tokens.find((t) => t.label === meLabel)?.token;
        run(() => apiRequest('GET', '/auth/me', token));
    }

    const statusClass = !result ? '' : result.status < 300 ? 'status-2xx' : result.status < 500 ? 'status-4xx' : 'status-other';

    return (
        <div className="module">
            <h2>Auth</h2>
            <p style={{ color: '#666', marginTop: -8 }}>/auth/register · /auth/login · /auth/me</p>

            <fieldset>
                <legend>Register or Login</legend>
                <div className="field">
                    <label>Email</label>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@test.com" />
                </div>
                <div className="field">
                    <label>Password</label>
                    <input value={password} onChange={(e) => setPassword(e.target.value)} type="text" />
                </div>
                <div className="field">
                    <label>Name (register only, optional)</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="field">
                    <label>Role (register only)</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                        {ROLES.map((r) => (
                            <option key={r} value={r}>
                                {r}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="field">
                    <label>Save resulting token as (e.g. "admin", "info-officer")</label>
                    <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="admin" />
                </div>
                <div className="actions">
                    <button onClick={handleRegister} disabled={loading}>
                        POST /auth/register
                    </button>
                    <button onClick={handleLogin} disabled={loading}>
                        POST /auth/login
                    </button>
                </div>
            </fieldset>

            <fieldset>
                <legend>Add an existing token manually</legend>
                <div className="field">
                    <label>Label</label>
                    <input value={manualLabel} onChange={(e) => setManualLabel(e.target.value)} placeholder="admin" />
                </div>
                <div className="field">
                    <label>Token</label>
                    <input value={manualToken} onChange={(e) => setManualToken(e.target.value)} placeholder="eyJhbGc..." />
                </div>
                <div className="actions">
                    <button onClick={handleAddManualToken}>Save token</button>
                </div>
            </fieldset>

            <fieldset>
                <legend>Saved tokens ({tokens.length})</legend>
                <div className="token-list">
                    {tokens.length === 0 && <div style={{ color: '#999' }}>none yet — register/login above</div>}
                    {tokens.map((t) => (
                        <div key={t.label}>
                            <strong>{t.label}</strong> — {t.token.slice(0, 24)}...{' '}
                            <button onClick={() => removeToken(t.label)}>remove</button>
                        </div>
                    ))}
                </div>
                <div className="row" style={{ marginTop: 10 }}>
                    <select value={meLabel} onChange={(e) => setMeLabel(e.target.value)}>
                        <option value="">-- pick a token --</option>
                        {tokens.map((t) => (
                            <option key={t.label} value={t.label}>
                                {t.label}
                            </option>
                        ))}
                    </select>
                    <button onClick={handleCheckMe} disabled={!meLabel || loading}>
                        GET /auth/me (verify role)
                    </button>
                </div>
            </fieldset>

            <div className="response">
                {result && <span className={`status-badge ${statusClass}`}>{result.status}</span>}
                <pre>{result ? JSON.stringify(result.data, null, 2) : loading ? 'loading...' : '(no request sent yet)'}</pre>
            </div>
        </div>
    );
}
