import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api/client';
import type { FieldConfig, ApiResult } from '../types';
import ReferencePicker from './ReferencePicker';
import { useTokens } from '../hooks/useTokens';
import { useToast } from '../context/ToastContext';
import { fetchReferenceList, invalidateReferenceCache } from '../api/referenceCache';
import '../styles/ModuleForm.css';

interface ModuleFormProps {
	title: string;
	endpoint: string;
	fields: FieldConfig[];
	multipart?: boolean;
	supportsDelete?: boolean;
	createRoles?: string[]; // roles allowed to POST create; omit = public, anyone can create
	manageRoles?: string[]; // roles allowed to GET all / PATCH / DELETE; omit = any authenticated user
}

type TabKey = 'dashboard' | 'create' | 'manage';

/*
 * DOCU: Converts a raw form value to what the API expects. Date/datetime
 * fields come out of native <input type="date"|"datetime-local"> as
 * "2026-01-15" or "2026-01-15T08:00", neither of which is a valid
 * Prisma DateTime — this turns them into full ISO strings
 * ("2026-01-15T00:00:00.000Z") right before the request is sent.
 *
 * Last Updated: 2026-08-08
 * Author: Alfred
 * Last Updated By: Alfred
 */
function toApiValue(field: FieldConfig, raw: string): string {
	if ((field.type === 'date' || field.type === 'datetime') && raw) {
		return new Date(raw).toISOString();
	}
	return raw;
}

/*
 * DOCU: Reverse of toApiValue — turns an ISO string coming back from the
 * API into whatever native <input> expects, so the Edit form can be
 * pre-filled from an existing record.
 *
 * Last Updated: 2026-08-08
 * Author: Alfred
 * Last Updated By: Alfred
 */
function fromApiValue(field: FieldConfig, value: unknown): string {
	if (value === null || value === undefined) return '';
	if ((field.type === 'date' || field.type === 'datetime') && value) {
		const d = new Date(value as string);
		if (isNaN(d.getTime())) return '';
		const iso = d.toISOString();
		return field.type === 'date' ? iso.slice(0, 10) : iso.slice(0, 16);
	}
	if (field.type === 'file') return '';
	return String(value);
}

/*
 * DOCU: Renders a record's value for a field in the Dashboard / Manage
 * tables — human-readable, not raw API shape.
 *
 * Last Updated: 2026-08-08
 * Author: Alfred
 * Last Updated By: Alfred
 */
function formatCellValue(field: FieldConfig, value: unknown, resolvedLabel?: string): string {
	if (value === null || value === undefined || value === '') return '—';
	if (field.type === 'reference') return resolvedLabel ?? String(value);
	if (field.type === 'file') return typeof value === 'string' && value ? 'Attached' : '—';
	if (field.type === 'date' || field.type === 'datetime') {
		const d = new Date(value as string);
		if (isNaN(d.getTime())) return String(value);
		return field.type === 'date' ? d.toLocaleDateString() : d.toLocaleString();
	}
	if (typeof value === 'object') return JSON.stringify(value);
	return String(value);
}

/*
 * DOCU: Shared input renderer for both the Create form and the inline
 * Edit form — same field types, different state buckets passed in.
 *
 * Last Updated: 2026-08-08
 * Author: Alfred
 * Last Updated By: Alfred
 */
function renderFieldInput(
	f: FieldConfig,
	currentValue: string,
	onChange: (name: string, val: string) => void,
	onFileChange: (name: string, file: File | null) => void,
) {
	switch (f.type) {
		case 'select':
			return (
				<select value={currentValue} onChange={(e) => onChange(f.name, e.target.value)}>
					<option value="">select an option</option>
					{f.options!.map((o) => (
						<option key={o} value={o}>
							{o}
						</option>
					))}
				</select>
			);
		case 'file':
			return <input type="file" onChange={(e) => onFileChange(f.name, e.target.files?.[0] ?? null)} />;
		case 'reference':
			return (
				<ReferencePicker
					endpoint={f.refEndpoint!}
					labelKeys={f.refLabelKeys ?? ['id']}
					value={currentValue}
					onChange={(id) => onChange(f.name, id)}
				/>
			);
		case 'date':
			return <input type="date" value={currentValue} onChange={(e) => onChange(f.name, e.target.value)} />;
		case 'datetime':
			return <input type="datetime-local" value={currentValue} onChange={(e) => onChange(f.name, e.target.value)} />;
		default:
			return (
				<input
					type={f.type === 'number' ? 'number' : 'text'}
					placeholder={f.placeholder}
					value={currentValue}
					onChange={(e) => onChange(f.name, e.target.value)}
				/>
			);
	}
}

/*
 * DOCU: Generic Create / Dashboard / Edit & Delete tabbed view for one API
 * module, with two independent permission gates:
 * - canCreate: controls the "New Entry" tab. Omit createRoles for public
 *   create (e.g. Budget/Venue Requests).
 * - canManage: controls the "Dashboard" and "Edit & Delete" tabs (GET all,
 *   PATCH, DELETE). Omit manageRoles to allow any authenticated user;
 *   still requires login since role is null when logged out.
 *
 * IDs are never shown or typed by the user — Edit/Delete act on the
 * record the user clicked, tracked internally via record.id.
 *
 * Last Updated: 2026-08-08
 * Author: Alfred
 * Last Updated By: Alfred
 */
export default function ModuleForm({
	title,
	endpoint,
	fields,
	multipart = false,
	supportsDelete = true,
	createRoles,
	manageRoles,
}: ModuleFormProps) {
	const { role, isAuthenticated } = useTokens();
	const toast = useToast();
	const canCreate = !createRoles || (role !== null && createRoles.includes(role));
	const canManage = !manageRoles || (role !== null && manageRoles.includes(role));

	const [activeTab, setActiveTab] = useState<TabKey>(canManage ? 'dashboard' : canCreate ? 'create' : 'dashboard');

	// If role changes after mount (login/logout without a remount) and the
	// current tab is no longer permitted, fall back to a valid one.
	useEffect(() => {
		const stillValid =
			(activeTab === 'dashboard' && canManage) || (activeTab === 'create' && canCreate) || (activeTab === 'manage' && canManage);
		if (!stillValid) {
			setActiveTab(canManage ? 'dashboard' : canCreate ? 'create' : 'dashboard');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [canManage, canCreate]);

	// —— Create tab ——
	const [values, setValues] = useState<Record<string, string>>({});
	const [files, setFiles] = useState<Record<string, File | null>>({});
	const [createLoading, setCreateLoading] = useState(false);

	function updateValue(name: string, val: string) {
		setValues((v) => ({ ...v, [name]: val }));
	}
	function updateFile(name: string, file: File | null) {
		setFiles((v) => ({ ...v, [name]: file }));
	}

	// —— Shared records (Dashboard + Manage) ——
	const [records, setRecords] = useState<Record<string, any>[]>([]);
	const [recordsLoading, setRecordsLoading] = useState(false);
	const [recordsError, setRecordsError] = useState<string | null>(null);

	const fetchRecords = useCallback(async () => {
		setRecordsLoading(true);
		setRecordsError(null);
		try {
			const r = await fetchReferenceList(endpoint);
			if (r.status >= 200 && r.status < 300) {
				setRecords(Array.isArray(r.data) ? r.data : []);
			} else {
				const msg = `Couldn't load ${title.toLowerCase()} (status ${r.status}).`;
				setRecordsError(msg);
				toast.error(msg);
			}
		} catch {
			const msg = `Couldn't load ${title.toLowerCase()}. Check your connection and try again.`;
			setRecordsError(msg);
			toast.error(msg);
		} finally {
			setRecordsLoading(false);
		}
	}, [endpoint, title, toast]);

	// —— Reference field labels (id -> display name), for table cells ——
	const [refOptions, setRefOptions] = useState<Record<string, Record<string, string>>>({});

	// Stable primitive key derived from field configs — used as the effect
	// dependency instead of the `fields` array itself, since pages commonly
	// pass `fields` as an inline array literal (a new reference every render).
	// Depending on the array directly caused fetchRefOptions to be recreated
	// on every render, which reran the effect below, which called
	// fetchRecords()/fetchRefOptions() again — an infinite fetch loop that
	// could starve or race out the actual "get clubs" request.
	const fieldsKey = fields.map((f) => `${f.name}:${f.type}:${f.refEndpoint ?? ''}:${(f.refLabelKeys ?? []).join(',')}`).join('|');

	const fetchRefOptions = useCallback(async () => {
		const referenceFields = fields.filter((f) => f.type === 'reference' && f.refEndpoint);
		if (referenceFields.length === 0) return;
		const entries = await Promise.all(
			referenceFields.map(async (f) => {
				try {
					const r = await fetchReferenceList(f.refEndpoint as string);
					if (Array.isArray(r.data)) {
						const map: Record<string, string> = {};
						r.data.forEach((item: any) => {
							map[item.id] = (f.refLabelKeys ?? ['id']).map((k) => item[k]).filter(Boolean).join(' — ') || item.id;
						});
						return [f.name, map] as const;
					}
				} catch {
					// leave this field's map unset; cells fall back to the raw id
				}
				return [f.name, null] as const;
			}),
		);
		setRefOptions((prev) => {
			const next = { ...prev };
			entries.forEach(([name, map]) => {
				if (map) next[name] = map;
			});
			return next;
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fieldsKey]);

	useEffect(() => {
		if (!canManage) return;
		if (activeTab === 'dashboard' || activeTab === 'manage') {
			fetchRecords();
			fetchRefOptions();
		}
	}, [activeTab, canManage, fetchRecords, fetchRefOptions]);

	// —— Manage tab: edit / delete ——
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editValues, setEditValues] = useState<Record<string, string>>({});
	const [editFiles, setEditFiles] = useState<Record<string, File | null>>({});
	const [manageLoading, setManageLoading] = useState(false);

	function updateEditValue(name: string, val: string) {
		setEditValues((v) => ({ ...v, [name]: val }));
	}
	function updateEditFile(name: string, file: File | null) {
		setEditFiles((v) => ({ ...v, [name]: file }));
	}

	function startEdit(record: Record<string, any>) {
		const initial: Record<string, string> = {};
		fields.forEach((f) => {
			initial[f.name] = fromApiValue(f, record[f.name]);
		});
		setEditValues(initial);
		setEditFiles({});
		setEditingId(String(record.id));
	}

	function cancelEdit() {
		setEditingId(null);
		setEditValues({});
		setEditFiles({});
	}

	async function handleCreate() {
		setCreateLoading(true);
		try {
			let r: ApiResult;
			if (multipart) {
				const fd = new FormData();
				fields.forEach((f) => {
					if (f.type === 'file') {
						if (files[f.name]) fd.append(f.name, files[f.name] as File);
					} else {
						fd.append(f.name, toApiValue(f, values[f.name] ?? ''));
					}
				});
				r = await apiRequest('POST', endpoint, fd, true);
			} else {
				const body: Record<string, any> = {};
				fields.forEach((f) => {
					const raw = values[f.name] ?? '';
					body[f.name] = f.type === 'number' ? Number(raw || 0) : toApiValue(f, raw);
				});
				r = await apiRequest('POST', endpoint, body, false);
			}
			if (r.status >= 200 && r.status < 300) {
				toast.success(`${title} created.`);
				setValues({});
				setFiles({});
				invalidateReferenceCache(endpoint);
				if (canManage) fetchRecords();
			} else {
				toast.error(`Couldn't create ${title.toLowerCase()} (status ${r.status}).`);
			}
		} catch {
			toast.error(`Couldn't create ${title.toLowerCase()}. Check your connection and try again.`);
		} finally {
			setCreateLoading(false);
		}
	}

	async function handleUpdate() {
		if (!editingId) return;
		setManageLoading(true);
		try {
			let r: ApiResult;
			if (multipart) {
				const fd = new FormData();
				fields.forEach((f) => {
					if (f.type === 'file') {
						if (editFiles[f.name]) fd.append(f.name, editFiles[f.name] as File);
					} else {
						fd.append(f.name, toApiValue(f, editValues[f.name] ?? ''));
					}
				});
				r = await apiRequest('PATCH', `${endpoint}/${editingId}`, fd, true);
			} else {
				const body: Record<string, any> = {};
				fields.forEach((f) => {
					const raw = editValues[f.name] ?? '';
					body[f.name] = f.type === 'number' ? Number(raw || 0) : toApiValue(f, raw);
				});
				r = await apiRequest('PATCH', `${endpoint}/${editingId}`, body, false);
			}
			if (r.status >= 200 && r.status < 300) {
				toast.success('Saved.');
				cancelEdit();
				invalidateReferenceCache(endpoint);
				fetchRecords();
			} else {
				toast.error(`Couldn't save (status ${r.status}).`);
			}
		} catch {
			toast.error("Couldn't save. Check your connection and try again.");
		} finally {
			setManageLoading(false);
		}
	}

	async function handleDeleteRecord(id: string) {
		const confirmed = window.confirm(`Delete this ${title.replace(/s$/, '')} entry? This can't be undone.`);
		if (!confirmed) return;
		setManageLoading(true);
		try {
			const r = await apiRequest('DELETE', `${endpoint}/${id}`);
			if (r.status >= 200 && r.status < 300) {
				toast.success('Deleted.');
				if (editingId === id) cancelEdit();
				invalidateReferenceCache(endpoint);
				fetchRecords();
			} else {
				toast.error(`Couldn't delete (status ${r.status}).`);
			}
		} catch {
			toast.error("Couldn't delete. Check your connection and try again.");
		} finally {
			setManageLoading(false);
		}
	}

	if (!canCreate && !canManage) {
		return (
			<div className="rd-module rd-moduleform">
				<div className="rd-moduleform-header">
					<h2>{title}</h2>
				</div>
				<p className="rd-moduleform-note">Login with the appropriate office role to access {title.toLowerCase()}.</p>
			</div>
		);
	}

	return (
		<div className="rd-module rd-moduleform">
			{!isAuthenticated && (
				<Link to="/" className="rd-login rd-moduleform-back">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<path d="M19 12H5M12 19l-7-7 7-7" />
					</svg>
					Back to home
				</Link>
			)}

			<div className="rd-moduleform-header">
				<h2>{title}</h2>
			</div>

			<div className="rd-tabs" role="tablist">
				{canManage && (
					<button
						type="button"
						role="tab"
						aria-selected={activeTab === 'dashboard'}
						className={`rd-tab ${activeTab === 'dashboard' ? 'rd-tab-active' : ''}`}
						onClick={() => setActiveTab('dashboard')}
					>
						Dashboard
					</button>
				)}
				{canCreate && (
					<button
						type="button"
						role="tab"
						aria-selected={activeTab === 'create'}
						className={`rd-tab ${activeTab === 'create' ? 'rd-tab-active' : ''}`}
						onClick={() => setActiveTab('create')}
					>
						New Entry
					</button>
				)}
				{canManage && (
					<button
						type="button"
						role="tab"
						aria-selected={activeTab === 'manage'}
						className={`rd-tab ${activeTab === 'manage' ? 'rd-tab-active' : ''}`}
						onClick={() => setActiveTab('manage')}
					>
						Edit &amp; Delete
					</button>
				)}
			</div>

			{activeTab === 'dashboard' && canManage && (
				<div className="rd-tab-panel">
					{recordsError && <div className="rd-error-banner">{recordsError}</div>}
					{recordsLoading && <p className="rd-moduleform-note">Loading…</p>}
					{!recordsLoading &&
						!recordsError &&
						(records.length === 0 ? (
							<p className="rd-empty-state">No {title.toLowerCase()} yet.</p>
						) : (
							<table className="rd-table">
								<thead>
									<tr>
										{fields.map((f) => (
											<th key={f.name}>{f.label}</th>
										))}
									</tr>
								</thead>
								<tbody>
									{records.map((r) => (
										<tr key={r.id}>
											{fields.map((f) => (
												<td key={f.name}>{formatCellValue(f, r[f.name], f.type === 'reference' ? refOptions[f.name]?.[r[f.name]] : undefined)}</td>
											))}
										</tr>
									))}
								</tbody>
							</table>
						))}
				</div>
			)}

			{activeTab === 'create' && canCreate && (
				<div className="rd-tab-panel">
					{fields.map((f) => (
						<div className="rd-field" key={f.name}>
							<label>{f.label}</label>
							{renderFieldInput(f, values[f.name] ?? '', updateValue, updateFile)}
						</div>
					))}
					<div className="rd-form-actions">
						<button className="rd-btn" onClick={handleCreate} disabled={createLoading}>
							{createLoading ? 'Submitting…' : 'Submit'}
						</button>
					</div>
				</div>
			)}

			{activeTab === 'manage' && canManage && (
				<div className="rd-tab-panel">
					{recordsError && <div className="rd-error-banner">{recordsError}</div>}
					{recordsLoading && <p className="rd-moduleform-note">Loading…</p>}
					{!recordsLoading && !recordsError && records.length === 0 && <p className="rd-empty-state">No {title.toLowerCase()} yet.</p>}

					{!recordsLoading && !recordsError && records.length > 0 && editingId === null && (
						<table className="rd-table">
							<thead>
								<tr>
									{fields.map((f) => (
										<th key={f.name}>{f.label}</th>
									))}
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{records.map((r) => (
									<tr key={r.id}>
										{fields.map((f) => (
											<td key={f.name}>{formatCellValue(f, r[f.name], f.type === 'reference' ? refOptions[f.name]?.[r[f.name]] : undefined)}</td>
										))}
										<td>
											<div className="rd-moduleform-row-actions">
												<button className="rd-btn-ghost rd-btn-sm" onClick={() => startEdit(r)} disabled={manageLoading}>
													Edit
												</button>
												{supportsDelete && (
													<button
														className="rd-btn-ghost rd-btn-sm rd-btn-danger"
														onClick={() => handleDeleteRecord(String(r.id))}
														disabled={manageLoading}
													>
														Delete
													</button>
												)}
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					)}

					{editingId !== null && (
						<div className="rd-moduleform-edit">
							{fields.map((f) => (
								<div className="rd-field" key={f.name}>
									<label>{f.label}</label>
									{renderFieldInput(f, editValues[f.name] ?? '', updateEditValue, updateEditFile)}
								</div>
							))}
							<div className="rd-form-actions">
								<button className="rd-btn-ghost" onClick={cancelEdit} disabled={manageLoading}>
									Cancel
								</button>
								<button className="rd-btn" onClick={handleUpdate} disabled={manageLoading}>
									{manageLoading ? 'Saving…' : 'Save changes'}
								</button>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}