import { useEffect, useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { useTokens } from '../hooks/useTokens';
import '../styles/RegisterOfficerPage.css';

const ROLES = ['INFORMATION', 'ALLOCATION', 'WORKFORCE', 'ADMIN'];

interface Officer {
    id: string;
    email: string;
    name: string | null;
    role: string;
    createdAt: string;
}

interface OfficerForm {
    email: string;
    name: string;
    password: string;
    role: string;
}

const EMPTY_FORM: OfficerForm = { email: '', name: '', password: '', role: 'INFORMATION' };

function formatRole(role: string) {
    return role
        .toLowerCase()
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

export default function RegisterOfficerPage() {
    const { role } = useTokens();
    const [activeTab, setActiveTab] = useState<'register' | 'manage'>('register');
    const [officers, setOfficers] = useState<Officer[]>([]);
    const [form, setForm] = useState(EMPTY_FORM);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        if (role !== 'ADMIN') return;
        void loadOfficers();
    }, [role]);

    if (role !== 'ADMIN') return <Navigate to="/tasks" replace />;

    async function loadOfficers() {
        setLoading(true);
        const response = await apiRequest('GET', '/auth/officers');
        if (response.status < 300) setOfficers(response.data ?? []);
        else setError(response.data?.message ?? 'Could not load officers.');
        setLoading(false);
    }

    function updateForm(name: keyof OfficerForm, value: string) {
        setForm((current) => ({ ...current, [name]: value }));
    }

    function startEdit(officer: Officer) {
        setActiveTab('manage');
        setEditingId(officer.id);
        setForm({ email: officer.email, name: officer.name ?? '', password: '', role: officer.role });
        setMessage(null);
        setError(null);
    }

    function resetForm() {
        setEditingId(null);
        setForm(EMPTY_FORM);
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setSaving(true);
        setMessage(null);
        setError(null);
        const body = {
            email: form.email,
            name: form.name || undefined,
            role: form.role,
            ...(form.password ? { password: form.password } : {}),
        };
        const response = editingId
            ? await apiRequest('PATCH', `/auth/officers/${editingId}`, body)
            : await apiRequest('POST', '/auth/register', { ...body, password: form.password });

        if (response.status < 300) {
            resetForm();
            setMessage(editingId ? 'Officer updated successfully.' : 'Officer registered successfully.');
            await loadOfficers();
        } else {
            setError(response.data?.message ?? 'Could not save officer.');
        }
        setSaving(false);
    }

    async function handleDelete(officer: Officer) {
        if (!window.confirm(`Delete ${officer.name || officer.email}? This cannot be undone.`)) return;
        setError(null);
        const response = await apiRequest('DELETE', `/auth/officers/${officer.id}`);
        if (response.status < 300) {
            setMessage('Officer deleted successfully.');
            setOfficers((current) => current.filter((item) => item.id !== officer.id));
        } else {
            setError(response.data?.message ?? 'Could not delete officer.');
        }
    }

    return (
        <div className="rd-module rd-officers-page">
            <div className="rd-register-header">
                <p className="rd-eyebrow">Administration</p>
                <h2>Officers</h2>
                <p>Register, update, and remove Resource Department officer accounts.</p>
            </div>

            <div className="rd-tabs rd-officer-tabs" role="tablist" aria-label="Officer actions">
                <button type="button" role="tab" aria-selected={activeTab === 'register'} className={`rd-tab ${activeTab === 'register' ? 'rd-tab-active' : ''}`} onClick={() => { setActiveTab('register'); resetForm(); }}>
                    Register Officer
                </button>
                <button type="button" role="tab" aria-selected={activeTab === 'manage'} className={`rd-tab ${activeTab === 'manage' ? 'rd-tab-active' : ''}`} onClick={() => setActiveTab('manage')}>
                    Manage Officers
                </button>
            </div>

            {(activeTab === 'register' || editingId) && (
                <form className="rd-register-form" onSubmit={handleSubmit}>
                    <h3>{editingId ? 'Edit officer' : 'Register officer'}</h3>
                    <div className="rd-officer-form-grid">
                        <div className="rd-field">
                            <label htmlFor="officer-name">Name</label>
                            <input id="officer-name" value={form.name} onChange={(event) => updateForm('name', event.target.value)} />
                        </div>
                        <div className="rd-field">
                            <label htmlFor="officer-email">Email</label>
                            <input id="officer-email" type="email" value={form.email} onChange={(event) => updateForm('email', event.target.value)} required />
                        </div>
                        <div className="rd-field">
                            <label htmlFor="officer-password">{editingId ? 'New password (optional)' : 'Password'}</label>
                            <input id="officer-password" type="password" minLength={6} value={form.password} onChange={(event) => updateForm('password', event.target.value)} required={!editingId} />
                        </div>
                        <div className="rd-field">
                            <label htmlFor="officer-role">Office role</label>
                            <select id="officer-role" value={form.role} onChange={(event) => updateForm('role', event.target.value)}>
                                {ROLES.filter((value) => editingId || value !== 'ADMIN').map((value) => <option key={value} value={value}>{formatRole(value)}</option>)}
                            </select>
                        </div>
                    </div>
                    {error && <div className="rd-error-banner" role="alert">{error}</div>}
                    {message && <div className="rd-register-success" role="status">{message}</div>}
                    <div className="rd-form-actions">
                        {editingId && <button type="button" className="rd-btn-ghost" onClick={resetForm}>Cancel</button>}
                        <button className="rd-btn" type="submit" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save changes' : 'Register officer'}</button>
                    </div>
                </form>
            )}

            {activeTab === 'manage' && <section className="rd-officer-list" aria-labelledby="officer-list-title">
                <div className="rd-officer-list-header">
                    <h3 id="officer-list-title">Officer accounts</h3>
                    <span>{officers.length} officers</span>
                </div>
                {error && <div className="rd-error-banner" role="alert">{error}</div>}
                {message && <div className="rd-register-success" role="status">{message}</div>}
                {loading ? <p className="rd-empty-state">Loading officers…</p> : officers.length === 0 ? <p className="rd-empty-state">No officers registered.</p> : (
                    <div className="rd-table-wrap">
                        <table className="rd-table">
                            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
                            <tbody>
                                {officers.map((officer) => (
                                    <tr key={officer.id}>
                                        <td>{officer.name || '—'}</td>
                                        <td>{officer.email}</td>
                                        <td>{formatRole(officer.role)}</td>
                                        <td>
                                            <div className="rd-moduleform-row-actions">
                                                <button type="button" className="rd-btn-ghost rd-btn-sm" onClick={() => startEdit(officer)}>Edit</button>
                                                <button
                                                    type="button"
                                                    className="rd-btn-ghost rd-btn-sm rd-btn-danger"
                                                    onClick={() => void handleDelete(officer)}
                                                    disabled={officer.role === 'ADMIN'}
                                                    title={officer.role === 'ADMIN' ? 'The Admin account cannot be deleted.' : undefined}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>}
        </div>
    );
}
