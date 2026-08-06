import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import { useTokens } from '../hooks/useTokens';

interface Task {
    id: string;
    taskName: string;
    taskDetails: string;
    assignedDate: string;
    deadline: string;
    assignedOffice: string;
}

const OFFICES = ['INFORMATION', 'ALLOCATION', 'WORKFORCE', 'ADMIN'];

/*
 * DOCU: Task dashboard — lists tasks from GET /tasks (backend should
 * scope by assignedOffice per role, ADMIN sees all) and a create
 * panel for POST /tasks. Token is auto-attached by apiRequest.
 *
 * Last Updated: 2026-08-06
 * Author: Alfred
 * Last Updated By: Alfred
 */
export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ taskName: '', taskDetails: '', assignedDate: '', deadline: '', assignedOffice: 'ADMIN' });
    const [error, setError] = useState<string | null>(null);
    const { role } = useTokens();

    async function loadTasks() {
        setLoading(true);
        const res = await apiRequest('GET', '/tasks');
        if (res.status < 300) setTasks(res.data ?? []);
        else setError(res.data?.message ?? 'Failed to load tasks');
        setLoading(false);
    }

    useEffect(() => {
        loadTasks();
    }, []);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        const body = {
            ...form,
            assignedDate: form.assignedDate ? new Date(form.assignedDate).toISOString() : undefined,
            deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
        };
        const res = await apiRequest('POST', '/tasks', body);
        if (res.status < 300) {
            setForm({ taskName: '', taskDetails: '', assignedDate: '', deadline: '', assignedOffice: 'ADMIN' });
            setShowForm(false);
            loadTasks();
        } else {
            setError(res.data?.message ?? 'Failed to create task');
        }
    }

    return (
        <div className="module">
            <h2>Tasks</h2>
            {error && <p style={{ color: 'crimson' }}>{error}</p>}

            {role === 'ADMIN' && (
                <button onClick={() => setShowForm((s) => !s)}>{showForm ? 'Cancel' : '+ New Task'}</button>
            )}

            {showForm && (
                <form onSubmit={handleCreate} style={{ margin: '12px 0' }}>
                    <div className="field">
                        <label>Task Name</label>
                        <input value={form.taskName} onChange={(e) => setForm((f) => ({ ...f, taskName: e.target.value }))} required />
                    </div>
                    <div className="field">
                        <label>Details</label>
                        <input value={form.taskDetails} onChange={(e) => setForm((f) => ({ ...f, taskDetails: e.target.value }))} />
                    </div>
                    <div className="field">
                        <label>Assigned Date</label>
                        <input type="date" value={form.assignedDate} onChange={(e) => setForm((f) => ({ ...f, assignedDate: e.target.value }))} />
                    </div>
                    <div className="field">
                        <label>Deadline</label>
                        <input type="date" value={form.deadline} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))} />
                    </div>
                    <div className="field">
                        <label>Assigned Office</label>
                        <select value={form.assignedOffice} onChange={(e) => setForm((f) => ({ ...f, assignedOffice: e.target.value }))}>
                            {OFFICES.map((o) => (
                                <option key={o} value={o}>{o}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit">Create</button>
                </form>
            )}

            {loading ? (
                <p>Loading…</p>
            ) : tasks.length === 0 ? (
                <p>No tasks.</p>
            ) : (
                <table>
                    <thead>
                        <tr><th>Task</th><th>Office</th><th>Deadline</th></tr>
                    </thead>
                    <tbody>
                        {tasks.map((t) => (
                            <tr key={t.id}>
                                <td>{t.taskName}</td>
                                <td>{t.assignedOffice}</td>
                                <td>{new Date(t.deadline).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}