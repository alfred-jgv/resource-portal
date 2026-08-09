import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import { useTokens } from '../hooks/useTokens';
import '../styles/TasksPage.css';

type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE';

interface Task {
    id: string;
    taskName: string;
    taskDetails: string;
    assignedDate: string;
    deadline: string;
    assignedOffice: string;
    status: TaskStatus;
}

const OFFICES = ['INFORMATION', 'ALLOCATION', 'WORKFORCE', 'ADMIN'];
const STATUSES: TaskStatus[] = ['PENDING', 'IN_PROGRESS', 'DONE'];

const STATUS_LABEL: Record<TaskStatus, string> = {
    PENDING: 'Pending',
    IN_PROGRESS: 'In Progress',
    DONE: 'Done',
};

const STATUS_CLASS: Record<TaskStatus, string> = {
    PENDING: 'rd-task-status--pending',
    IN_PROGRESS: 'rd-task-status--in-progress',
    DONE: 'rd-task-status--done',
};

const CARD_CLASS: Record<TaskStatus, string> = {
    PENDING: 'rd-task-card--pending',
    IN_PROGRESS: 'rd-task-card--in-progress',
    DONE: 'rd-task-card--done',
};

const EMPTY_FORM = { taskName: '', taskDetails: '', assignedDate: '', deadline: '', assignedOffice: 'ADMIN', status: 'PENDING' as TaskStatus };

/** "2026-05-02T..." -> "May 2, 2026" */
function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

/** Past its deadline and not yet marked done. */
function isOverdue(deadline: string, status: TaskStatus) {
    return status !== 'DONE' && new Date(deadline).getTime() < Date.now();
}

/** "2026-05-02T..." -> "2026-05-02" for <input type="date"> */
function toDateInputValue(iso: string) {
    return iso ? iso.slice(0, 10) : '';
}

/*
 * DOCU: Task dashboard — lists tasks from GET /tasks as an expandable
 * card list (status-colored left edge, deadline always visible in the
 * header, click-to-expand details), a create panel for POST /tasks,
 * a quick admin status dropdown, and an admin-only inline edit form —
 * both call PATCH /tasks/:id.
 *
 * Last Updated: 2026-08-08
 * Author: Alfred
 * Last Updated By: Alfred
 */
export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [editForm, setEditForm] = useState(EMPTY_FORM);
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

    function toggleExpanded(id: string) {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        const body = {
            ...form,
            assignedDate: form.assignedDate ? new Date(form.assignedDate).toISOString() : undefined,
            deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
        };
        const res = await apiRequest('POST', '/tasks', body);
        if (res.status < 300) {
            setForm(EMPTY_FORM);
            setShowForm(false);
            loadTasks();
        } else {
            setError(res.data?.message ?? 'Failed to create task');
        }
    }

    function startEdit(t: Task) {
        setEditForm({
            taskName: t.taskName,
            taskDetails: t.taskDetails,
            assignedDate: toDateInputValue(t.assignedDate),
            deadline: toDateInputValue(t.deadline),
            assignedOffice: t.assignedOffice,
            status: t.status,
        });
        setEditingId(t.id);
        setExpandedIds((prev) => new Set(prev).add(t.id));
    }

    function cancelEdit() {
        setEditingId(null);
    }

    async function handleUpdate(e: React.FormEvent, id: string) {
        e.preventDefault();
        const body = {
            ...editForm,
            assignedDate: editForm.assignedDate ? new Date(editForm.assignedDate).toISOString() : undefined,
            deadline: editForm.deadline ? new Date(editForm.deadline).toISOString() : undefined,
        };
        const res = await apiRequest('PATCH', `/tasks/${id}`, body);
        if (res.status < 300) {
            setEditingId(null);
            loadTasks();
        } else {
            setError(res.data?.message ?? 'Failed to update task');
        }
    }

    async function handleStatusChange(id: string, status: TaskStatus) {
        const res = await apiRequest('PATCH', `/tasks/${id}`, { status });
        if (res.status < 300) {
            setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
        } else {
            setError(res.data?.message ?? 'Failed to update status');
        }
    }

    return (
        <div className="rd-module">
            <div className="rd-tasks-header">
                <h2>Tasks</h2>
                {role === 'ADMIN' && (
                    <button className="rd-btn-ghost" onClick={() => setShowForm((s) => !s)}>
                        {showForm ? 'Cancel' : '+ New Task'}
                    </button>
                )}
            </div>

            {error && <p className="rd-error-banner">{error}</p>}

            {showForm && (
                <form onSubmit={handleCreate} className="rd-task-form">
                    <div className="rd-task-form-grid">
                        <div className="rd-field">
                            <label>Task Name</label>
                            <input value={form.taskName} onChange={(e) => setForm((f) => ({ ...f, taskName: e.target.value }))} required />
                        </div>
                        <div className="rd-field">
                            <label>Assigned Office</label>
                            <select value={form.assignedOffice} onChange={(e) => setForm((f) => ({ ...f, assignedOffice: e.target.value }))}>
                                {OFFICES.map((o) => (
                                    <option key={o} value={o}>{o}</option>
                                ))}
                            </select>
                        </div>
                        <div className="rd-field">
                            <label>Assigned Date</label>
                            <input type="date" value={form.assignedDate} onChange={(e) => setForm((f) => ({ ...f, assignedDate: e.target.value }))} />
                        </div>
                        <div className="rd-field">
                            <label>Deadline</label>
                            <input type="date" value={form.deadline} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))} />
                        </div>
                    </div>

                    <div className="rd-field">
                        <label>Details</label>
                        <textarea rows={3} value={form.taskDetails} onChange={(e) => setForm((f) => ({ ...f, taskDetails: e.target.value }))} />
                    </div>

                    <div className="rd-form-actions">
                        <button type="submit" className="rd-btn">Create</button>
                    </div>
                </form>
            )}

            {loading ? (
                <p className="rd-empty-state">Loading…</p>
            ) : tasks.length === 0 ? (
                <p className="rd-empty-state">No tasks.</p>
            ) : (
                <ul className="rd-task-list">
                    {tasks.map((t) => {
                        const isOpen = expandedIds.has(t.id);
                        const isEditing = editingId === t.id;
                        const overdue = isOverdue(t.deadline, t.status);
                        return (
                            <li key={t.id} className={`rd-task-card ${CARD_CLASS[t.status]} ${overdue ? 'rd-task-card--overdue' : ''}`}>
                                <div className="rd-task-header">
                                    <button
                                        type="button"
                                        className="rd-task-toggle"
                                        aria-expanded={isOpen}
                                        onClick={() => toggleExpanded(t.id)}
                                    >
                                        <span className="rd-task-toggle-main">
                                            <span className="rd-task-ref-row">
                                                <span className="rd-task-ref">{t.assignedOffice}</span>
                                                <span className={`rd-task-deadline ${overdue ? 'rd-task-deadline--overdue' : ''}`}>
                                                    {overdue ? 'Overdue — was due' : 'Due'} {formatDate(t.deadline)}
                                                </span>
                                            </span>
                                            <span className="rd-task-title">{t.taskName}</span>
                                        </span>
                                    </button>

                                    <div className="rd-task-status-control">
                                        {role === 'ADMIN' ? (
                                            <select
                                                className={`rd-task-status rd-task-status-select ${STATUS_CLASS[t.status]}`}
                                                value={t.status}
                                                onChange={(e) => handleStatusChange(t.id, e.target.value as TaskStatus)}
                                                aria-label={`Change status for ${t.taskName}`}
                                            >
                                                {STATUSES.map((s) => (
                                                    <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className={`rd-task-status ${STATUS_CLASS[t.status]}`}>
                                                {STATUS_LABEL[t.status]}
                                            </span>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        className="rd-task-chevron-btn"
                                        aria-expanded={isOpen}
                                        aria-label={isOpen ? 'Collapse details' : 'Expand details'}
                                        onClick={() => toggleExpanded(t.id)}
                                    >
                                        <svg
                                            className={`rd-task-chevron ${isOpen ? 'rd-task-chevron--open' : ''}`}
                                            width="16"
                                            height="16"
                                            viewBox="0 0 16 16"
                                            fill="none"
                                            aria-hidden="true"
                                        >
                                            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </div>

                                {isOpen && !isEditing && (
                                    <div className="rd-task-details">
                                        <p>{t.taskDetails || 'No additional details.'}</p>
                                        {role === 'ADMIN' && (
                                            <div className="rd-task-edit-trigger">
                                                <button type="button" className="rd-btn-ghost" onClick={() => startEdit(t)}>
                                                    Edit
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {isOpen && isEditing && (
                                    <form onSubmit={(e) => handleUpdate(e, t.id)} className="rd-task-edit-form">
                                        <div className="rd-task-form-grid">
                                            <div className="rd-field">
                                                <label>Task Name</label>
                                                <input
                                                    value={editForm.taskName}
                                                    onChange={(e) => setEditForm((f) => ({ ...f, taskName: e.target.value }))}
                                                    required
                                                />
                                            </div>
                                            <div className="rd-field">
                                                <label>Assigned Office</label>
                                                <select
                                                    value={editForm.assignedOffice}
                                                    onChange={(e) => setEditForm((f) => ({ ...f, assignedOffice: e.target.value }))}
                                                >
                                                    {OFFICES.map((o) => (
                                                        <option key={o} value={o}>{o}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="rd-field">
                                                <label>Status</label>
                                                <select
                                                    value={editForm.status}
                                                    onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value as TaskStatus }))}
                                                >
                                                    {STATUSES.map((s) => (
                                                        <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="rd-field">
                                                <label>Deadline</label>
                                                <input
                                                    type="date"
                                                    value={editForm.deadline}
                                                    onChange={(e) => setEditForm((f) => ({ ...f, deadline: e.target.value }))}
                                                />
                                            </div>
                                            <div className="rd-field">
                                                <label>Assigned Date</label>
                                                <input
                                                    type="date"
                                                    value={editForm.assignedDate}
                                                    onChange={(e) => setEditForm((f) => ({ ...f, assignedDate: e.target.value }))}
                                                />
                                            </div>
                                        </div>

                                        <div className="rd-field">
                                            <label>Details</label>
                                            <textarea
                                                rows={3}
                                                value={editForm.taskDetails}
                                                onChange={(e) => setEditForm((f) => ({ ...f, taskDetails: e.target.value }))}
                                            />
                                        </div>

                                        <div className="rd-form-actions">
                                            <button type="button" className="rd-btn-ghost" onClick={cancelEdit}>
                                                Cancel
                                            </button>
                                            <button type="submit" className="rd-btn">Save</button>
                                        </div>
                                    </form>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}