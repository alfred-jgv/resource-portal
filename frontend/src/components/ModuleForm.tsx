import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api/client';
import type { FieldConfig, ApiResult } from '../types';
import ReferencePicker from './ReferencePicker';
import { useTokens } from '../hooks/useTokens';
import { useToast } from '../context/ToastContext';
import { fetchReferenceList, invalidateReferenceCache } from '../api/referenceCache';
import ModuleDashboard, { type DashboardModule } from './ModuleDashboard';
import ModuleIntro from './ModuleIntro';
import '../styles/ModuleForm.css';

interface ModuleFormProps {
	title: string;
	endpoint: string;
	fields: FieldConfig[];
	multipart?: boolean;
	supportsDelete?: boolean;
	createRoles?: string[]; // roles allowed to POST create; omit = public, anyone can create
	manageRoles?: string[]; // roles allowed to GET all / PATCH / DELETE; omit = any authenticated user
	dashboardModule?: DashboardModule;
}

type TabKey = 'dashboard' | 'table' | 'create' | 'manage';
const TABLE_PAGE_SIZE = 25;

function humanizeOptionLabel(value: string): string {
	return value
		.toLowerCase()
		.split('_')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}

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
function toApiValue(field: FieldConfig, raw: string, formValues: Record<string, string> = {}): string {
	if (field.type === 'time' && raw && formValues.reservationDate) {
		return new Date(`${formValues.reservationDate}T${raw}`).toISOString();
	}
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
	if ((field.type === 'date' || field.type === 'datetime' || field.type === 'time') && value) {
		const d = new Date(value as string);
		if (isNaN(d.getTime())) return '';
		const iso = d.toISOString();
		if (field.type === 'date') return iso.slice(0, 10);
		if (field.type === 'time') {
			return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
		}
		return iso.slice(0, 16);
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
	if (field.type === 'time') {
		const d = new Date(value as string);
		if (isNaN(d.getTime())) return String(value);
		return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
	}
	if (field.type === 'select' && typeof value === 'string') return humanizeOptionLabel(value);
	if (typeof value === 'object') return JSON.stringify(value);
	return String(value);
}

function getRecordFieldValue(field: FieldConfig, record: Record<string, any>): unknown {
	if (field.type === 'file') return record[field.name] ?? record[`${field.name}Url`];
	return record[field.name];
}

function renderRecordValue(field: FieldConfig, record: Record<string, any>, resolvedLabel?: string) {
	const value = getRecordFieldValue(field, record);
	if (field.type === 'file' && typeof value === 'string' && value) {
		return (
			<a className="rd-table-file-link" href={value} target="_blank" rel="noreferrer">
				View document
			</a>
		);
	}
	return formatCellValue(field, value, resolvedLabel);
}

function getRecordDisplayValue(field: FieldConfig, record: Record<string, any>, resolvedLabel?: string): string {
	return formatCellValue(field, getRecordFieldValue(field, record), resolvedLabel);
}

function renderFieldLabel(label: string) {
	const hintMatch = label.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
	if (!hintMatch) return label;

	return (
		<>
			<span>{hintMatch[1].trim()}</span>
			<span
				className="rd-field-hint"
				tabIndex={0}
				title={hintMatch[2]}
				aria-label={`Reminder: ${hintMatch[2]}`}
			>
				<span aria-hidden="true">i</span>
				<span className="rd-field-hint-tooltip" role="tooltip">
					{hintMatch[2]}
				</span>
			</span>
		</>
	);
}

function getApiErrorMessage(data: unknown, fallback: string): string {
	if (typeof data === 'object' && data !== null && 'message' in data) {
		const message = (data as { message?: unknown }).message;
		if (typeof message === 'string' && message.trim()) return message;
		if (Array.isArray(message) && message.every((item) => typeof item === 'string')) {
			return message.join(' ');
		}
	}
	return fallback;
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
	formValues: Record<string, string>,
	onChange: (name: string, val: string) => void,
	onFileChange: (name: string, file: File | null) => void,
) {
	switch (f.type) {
		case 'select':
			return (
				<select value={currentValue} onChange={(e) => onChange(f.name, e.target.value)}>
					<option value="">Select an option</option>
					{f.options!.map((o) => (
						<option key={o} value={o}>
							{humanizeOptionLabel(o)}
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
					filterKey={f.refFilterKey}
					filterValue={f.refFilterField ? formValues[f.refFilterField] : undefined}
					autoSelectFirst={f.autoSelectFirst}
				/>
			);
		case 'date':
			return <input type="date" value={currentValue} onChange={(e) => onChange(f.name, e.target.value)} />;
		case 'datetime':
			return <input type="datetime-local" value={currentValue} onChange={(e) => onChange(f.name, e.target.value)} />;
		case 'time':
			return <input type="time" value={currentValue} onChange={(e) => onChange(f.name, e.target.value)} />;
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
	dashboardModule,
}: ModuleFormProps) {
	const { role, isAuthenticated, isLoading: tokensLoading } = useTokens();
	const toast = useToast();
	const canCreate = !createRoles || (role !== null && createRoles.includes(role));
	const canManage = !manageRoles || (role !== null && manageRoles.includes(role));

	const [activeTab, setActiveTab] = useState<TabKey>(canManage ? 'dashboard' : canCreate ? 'create' : 'dashboard');

	// If role changes after mount (login/logout without a remount) and the
	// current tab is no longer permitted, fall back to a valid one.
	useEffect(() => {
		const stillValid =
			(activeTab === 'dashboard' && canManage) ||
			(activeTab === 'table' && canManage) ||
			(activeTab === 'create' && canCreate) ||
			(activeTab === 'manage' && canManage);
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
		setValues((v) => {
			const next = { ...v, [name]: val };
			fields.forEach((field) => {
				if (field.refFilterField === name) next[field.name] = '';
			});
			return next;
		});
	}
	function updateFile(name: string, file: File | null) {
		setFiles((v) => ({ ...v, [name]: file }));
	}

	// —— Shared records (Dashboard + Manage) ——
	const [records, setRecords] = useState<Record<string, any>[]>([]);
	const [recordsLoading, setRecordsLoading] = useState(false);
	const [recordsError, setRecordsError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [tablePage, setTablePage] = useState(1);

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

	const filteredRecords = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();
		if (!query) return records;

		return records.filter((record) =>
			fields.some((field) => {
				const resolvedLabel = field.type === 'reference' ? refOptions[field.name]?.[record[field.name]] : undefined;
				return formatCellValue(field, record[field.name], resolvedLabel).toLowerCase().includes(query);
			}),
		);
	}, [fields, records, refOptions, searchQuery]);

	const totalTablePages = Math.max(1, Math.ceil(filteredRecords.length / TABLE_PAGE_SIZE));
	const paginatedRecords = useMemo(() => {
		const start = (tablePage - 1) * TABLE_PAGE_SIZE;
		return filteredRecords.slice(start, start + TABLE_PAGE_SIZE);
	}, [filteredRecords, tablePage]);

	useEffect(() => {
		setTablePage(1);
	}, [searchQuery]);

	useEffect(() => {
		if (tablePage > totalTablePages) setTablePage(totalTablePages);
	}, [tablePage, totalTablePages]);

	function renderTablePagination() {
		if (filteredRecords.length <= TABLE_PAGE_SIZE) return null;

		return (
			<nav className="rd-table-pagination" aria-label={`${title} table pages`}>
				<span>
					Showing {(tablePage - 1) * TABLE_PAGE_SIZE + 1}–{Math.min(tablePage * TABLE_PAGE_SIZE, filteredRecords.length)} of {filteredRecords.length}
				</span>
				<div className="rd-table-pagination-actions">
					<button type="button" className="rd-btn-ghost rd-btn-sm" onClick={() => setTablePage((page) => Math.max(1, page - 1))} disabled={tablePage === 1}>
						Previous
					</button>
					<span aria-current="page">Page {tablePage} of {totalTablePages}</span>
					<button type="button" className="rd-btn-ghost rd-btn-sm" onClick={() => setTablePage((page) => Math.min(totalTablePages, page + 1))} disabled={tablePage === totalTablePages}>
						Next
					</button>
				</div>
			</nav>
		);
	}

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
		if (tokensLoading || !canManage) return;
		if (activeTab === 'dashboard' || activeTab === 'table' || activeTab === 'manage') {
			fetchRecords();
			fetchRefOptions();
		}
	}, [activeTab, canManage, fetchRecords, fetchRefOptions, tokensLoading]);

	// —— Manage tab: edit / delete ——
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editValues, setEditValues] = useState<Record<string, string>>({});
	const [editFiles, setEditFiles] = useState<Record<string, File | null>>({});
	const [editErrors, setEditErrors] = useState<Record<string, string>>({});
	const [deleteRecord, setDeleteRecord] = useState<Record<string, any> | null>(null);
	const [manageLoading, setManageLoading] = useState(false);

	function updateEditValue(name: string, val: string) {
		setEditValues((v) => {
			const next = { ...v, [name]: val };
			fields.forEach((field) => {
				if (field.refFilterField === name) next[field.name] = '';
			});
			return next;
		});
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
		setEditErrors({});
		setEditingId(String(record.id));
	}

	function cancelEdit() {
		setEditingId(null);
		setEditValues({});
		setEditFiles({});
		setEditErrors({});
	}

	function validateEditValues() {
		const errors: Record<string, string> = {};
		fields.forEach((field) => {
			const value = editValues[field.name]?.trim() ?? '';
			if (field.type === 'number' && value && !Number.isFinite(Number(value))) {
				errors[field.name] = 'Enter a valid number.';
			}
			if ((field.type === 'date' || field.type === 'datetime') && value && Number.isNaN(new Date(value).getTime())) {
				errors[field.name] = 'Enter a valid date.';
			}
			if (field.type === 'time' && value && !/^\d{2}:\d{2}$/.test(value)) {
				errors[field.name] = 'Enter a valid time.';
			}
		});
		setEditErrors(errors);
		return Object.keys(errors).length === 0;
	}

	function validateCreateValues() {
		const referenceFields = fields.filter((field) => field.type === 'reference');
		for (const field of referenceFields) {
			if (!values[field.name]?.trim()) {
				toast.error(`${field.label.replace(/\s*\([^)]*\)\s*$/, '')} must be selected.`);
				return false;
			}
		}
		const numberFields = fields.filter((field) => field.type === 'number');
		for (const field of numberFields) {
			const raw = values[field.name]?.trim() ?? '';
			const numericValue = Number(raw);
			if (!raw || !Number.isInteger(numericValue) || numericValue < 1) {
				toast.error(`${field.label.replace(/\s*\([^)]*\)\s*$/, '')} must be a whole number of at least 1.`);
				return false;
			}
		}
		const automaticReference = fields.find((field) => field.autoSelectFirst && !values[field.name]);
		if (automaticReference) {
			toast.error(`${automaticReference.label} is unavailable for the selected record. Choose another option or contact an administrator.`);
			return false;
		}
		return true;
	}

	async function handleCreate() {
		if (createLoading || !validateCreateValues()) return;
		setCreateLoading(true);
		try {
			let r: ApiResult;
			if (multipart) {
				const fd = new FormData();
				fields.forEach((f) => {
					if (f.type === 'file') {
						if (files[f.name]) fd.append(f.name, files[f.name] as File);
					} else {
						const raw = values[f.name] ?? '';
						if (raw !== '') fd.append(f.name, toApiValue(f, raw, values));
					}
				});
				r = await apiRequest('POST', endpoint, fd, true);
			} else {
				const body: Record<string, any> = {};
				fields.forEach((f) => {
					const raw = values[f.name] ?? '';
					body[f.name] = f.type === 'number' ? Number(raw || 0) : toApiValue(f, raw, values);
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
				toast.error(getApiErrorMessage(r.data, `Couldn't create ${title.toLowerCase()} (status ${r.status}).`));
			}
		} catch {
			toast.error(`Couldn't create ${title.toLowerCase()}. Check your connection and try again.`);
		} finally {
			setCreateLoading(false);
		}
	}

	async function handleUpdate() {
		if (!editingId || manageLoading || !validateEditValues()) return;
		setManageLoading(true);
		try {
			let r: ApiResult;
			if (multipart) {
				const fd = new FormData();
				fields.forEach((f) => {
					if (f.type === 'file') {
						if (editFiles[f.name]) fd.append(f.name, editFiles[f.name] as File);
					} else {
						fd.append(f.name, toApiValue(f, editValues[f.name] ?? '', editValues));
					}
				});
				r = await apiRequest('PATCH', `${endpoint}/${editingId}`, fd, true);
			} else {
				const body: Record<string, any> = {};
				fields.forEach((f) => {
					const raw = editValues[f.name] ?? '';
					body[f.name] = f.type === 'number' ? Number(raw || 0) : toApiValue(f, raw, editValues);
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

	async function handleDeleteRecord(record: Record<string, any>) {
		if (manageLoading) return;
		const id = String(record.id);
		setManageLoading(true);
		try {
			const r = await apiRequest('DELETE', `${endpoint}/${id}`);
			if (r.status >= 200 && r.status < 300) {
				toast.success('Deleted.');
				if (editingId === id) cancelEdit();
				setDeleteRecord(null);
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
				{canManage && (
					<button
						type="button"
						role="tab"
						aria-selected={activeTab === 'table'}
						className={`rd-tab ${activeTab === 'table' ? 'rd-tab-active' : ''}`}
						onClick={() => setActiveTab('table')}
					>
						Table
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
					{recordsLoading ? (
						<>
							<ModuleIntro title={`${title} dashboard`} description={`View summaries and distributions for the current ${title.toLowerCase()} records.`} />
							<p className="rd-moduleform-note">Loading dashboard data…</p>
						</>
					) : dashboardModule ? (
						<ModuleDashboard module={dashboardModule} title={title} records={records} refOptions={refOptions} />
					) : (
						<>
							<ModuleIntro title={`${title} dashboard`} description="Dashboard metrics are not configured for this module." />
							<p className="rd-empty-state">No dashboard configuration is available for this module.</p>
						</>
					)}
				</div>
			)}

			{activeTab === 'table' && canManage && (
				<div className="rd-tab-panel">
					<ModuleIntro
						title={`${title} table`}
						description={`Browse and search the current ${title.toLowerCase()} records.`}
						count={`${filteredRecords.length} of ${records.length} records`}
					/>
					{recordsError && <div className="rd-error-banner">{recordsError}</div>}
					{recordsLoading && <p className="rd-moduleform-note">Loading…</p>}
					{!recordsLoading &&
						!recordsError &&
						(records.length === 0 ? (
							<p className="rd-empty-state">No {title.toLowerCase()} yet.</p>
						) : (
							<>
								<div className="rd-table-toolbar">
									<label className="rd-table-search">
										<span>Search {title.toLowerCase()}</span>
										<div className="rd-table-search-control">
											<svg aria-hidden="true" viewBox="0 0 24 24">
												<circle cx="11" cy="11" r="6.5" />
												<path d="m16 16 4.5 4.5" />
											</svg>
											<input
												type="search"
												value={searchQuery}
												onChange={(e) => setSearchQuery(e.target.value)}
												placeholder="Search records"
											/>
										</div>
									</label>
								</div>
								{filteredRecords.length === 0 ? (
									<p className="rd-empty-state">No matching {title.toLowerCase()} found.</p>
								) : (
									<div className="rd-table-wrap">
								<table className="rd-table">
									<colgroup>
										{fields.map((f) => (
											<col key={f.name} className="rd-table-data-column" />
										))}
									</colgroup>
									<thead>
										<tr>
											{fields.map((f) => (
												<th key={f.name} className="rd-table-heading">
													<div className="rd-table-heading-content">{renderFieldLabel(f.label)}</div>
												</th>
											))}
									</tr>
								</thead>
								<tbody>
									{paginatedRecords.map((r) => (
										<tr key={r.id}>
											{fields.map((f) => (
												<td key={f.name}>
													<span
														className="rd-table-cell-value"
														title={getRecordDisplayValue(f, r, f.type === 'reference' ? refOptions[f.name]?.[r[f.name]] : undefined) === '—'
															? undefined
															: getRecordDisplayValue(f, r, f.type === 'reference' ? refOptions[f.name]?.[r[f.name]] : undefined)}
													>
															{renderRecordValue(f, r, f.type === 'reference' ? refOptions[f.name]?.[r[f.name]] : undefined)}
													</span>
												</td>
											))}
										</tr>
									))}
								</tbody>
								</table>
									</div>
								)}
								{renderTablePagination()}
							</>
						))}
				</div>
			)}

			{activeTab === 'create' && canCreate && (
				<div className="rd-tab-panel">
					<ModuleIntro
						title={`Create ${title.replace(/s$/, '')}`}
						description={`Add a new ${title.replace(/s$/, '').toLowerCase()} using the fields below.`}
					/>
					{fields.map((f) => (
						<div className="rd-field" key={f.name}>
							<label>{renderFieldLabel(f.label)}</label>
							{renderFieldInput(f, values[f.name] ?? '', values, updateValue, updateFile)}
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
					<ModuleIntro
						title={`Manage ${title.toLowerCase()}`}
						description={`Search, edit, or permanently delete ${title.toLowerCase()} records.`}
						count={`${filteredRecords.length} of ${records.length} records`}
					/>
					{recordsError && <div className="rd-error-banner">{recordsError}</div>}
					{recordsLoading && <p className="rd-moduleform-note">Loading…</p>}
					{!recordsLoading && !recordsError && records.length === 0 && <p className="rd-empty-state">No {title.toLowerCase()} yet.</p>}

					{!recordsLoading && !recordsError && records.length > 0 && editingId === null && (
						<>
							<div className="rd-table-toolbar rd-manage-toolbar">
								<label className="rd-table-search">
									<span>Search {title.toLowerCase()}</span>
									<div className="rd-table-search-control">
										<svg aria-hidden="true" viewBox="0 0 24 24">
											<circle cx="11" cy="11" r="6.5" />
											<path d="m16 16 4.5 4.5" />
										</svg>
										<input
											type="search"
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											placeholder="Search records"
										/>
									</div>
								</label>
							</div>
							{filteredRecords.length === 0 ? (
								<p className="rd-empty-state">No matching {title.toLowerCase()} found.</p>
							) : (
								<div className="rd-table-wrap">
							<table className="rd-table">
							<colgroup>
								{fields.map((f) => (
									<col key={f.name} className="rd-table-data-column" />
								))}
								<col className="rd-table-actions-column" />
							</colgroup>
							<thead>
								<tr>
									{fields.map((f) => (
										<th key={f.name} className="rd-table-heading">
											<div className="rd-table-heading-content">{renderFieldLabel(f.label)}</div>
										</th>
									))}
									<th className="rd-table-actions-heading">Actions</th>
								</tr>
							</thead>
							<tbody>
								{paginatedRecords.map((r) => (
									<tr key={r.id}>
										{fields.map((f) => (
											<td key={f.name}>
												<span
													className="rd-table-cell-value"
												title={getRecordDisplayValue(f, r, f.type === 'reference' ? refOptions[f.name]?.[r[f.name]] : undefined) === '—'
														? undefined
													: getRecordDisplayValue(f, r, f.type === 'reference' ? refOptions[f.name]?.[r[f.name]] : undefined)}
												>
													{renderRecordValue(f, r, f.type === 'reference' ? refOptions[f.name]?.[r[f.name]] : undefined)}
												</span>
											</td>
										))}
										<td>
											<div className="rd-moduleform-row-actions">
												<button className="rd-btn-ghost rd-btn-sm" onClick={() => startEdit(r)} disabled={manageLoading}>
													Edit
												</button>
												{supportsDelete && (
													<button
														className="rd-btn-ghost rd-btn-sm rd-btn-danger"
														onClick={() => setDeleteRecord(r)}
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
								</div>
							)}
							{renderTablePagination()}
						</>
					)}

					{editingId !== null && (
						<div className="rd-modal-backdrop" role="presentation">
							<div className="rd-moduleform-edit rd-modal" role="dialog" aria-modal="true" aria-labelledby="edit-record-title">
								<div className="rd-modal-header">
									<div>
										<p className="rd-eyebrow">Editing record</p>
										<h3 id="edit-record-title">Update {title.replace(/s$/, '')}</h3>
										<p>Review the existing values below, make your changes, then save when ready.</p>
									</div>
									<button className="rd-modal-close" type="button" onClick={cancelEdit} disabled={manageLoading} aria-label="Close edit dialog">
										×
									</button>
								</div>
								{Object.keys(editErrors).length > 0 && (
									<div className="rd-error-banner" role="alert">Please correct the highlighted fields before saving.</div>
								)}
								<div className="rd-modal-fields">
									{fields.map((f) => (
										<div className="rd-field" key={f.name}>
											<label>{renderFieldLabel(f.label)}</label>
											{renderFieldInput(f, editValues[f.name] ?? '', editValues, updateEditValue, updateEditFile)}
											{editErrors[f.name] && <span className="rd-field-error">{editErrors[f.name]}</span>}
										</div>
									))}
								</div>
							<div className="rd-form-actions">
								<button className="rd-btn-ghost" onClick={cancelEdit} disabled={manageLoading}>
									Cancel
								</button>
								<button className="rd-btn" onClick={handleUpdate} disabled={manageLoading}>
									{manageLoading ? 'Saving…' : 'Save changes'}
								</button>
							</div>
							</div>
						</div>
					)}
				</div>
			)}

			{deleteRecord && (
				<div className="rd-modal-backdrop" role="presentation">
					<div className="rd-modal rd-delete-modal" role="dialog" aria-modal="true" aria-labelledby="delete-record-title">
						<p className="rd-eyebrow rd-eyebrow-danger">Permanent action</p>
						<h3 id="delete-record-title">Delete this {title.replace(/s$/, '')}?</h3>
						<p>This action cannot be undone. The selected record will be permanently removed.</p>
						<div className="rd-delete-preview">
							{fields.slice(0, 2).map((field) => (
								<div key={field.name}>
									<span>{field.label}</span>
									<strong>{formatCellValue(field, deleteRecord[field.name], field.type === 'reference' ? refOptions[field.name]?.[deleteRecord[field.name]] : undefined)}</strong>
								</div>
							))}
						</div>
						<div className="rd-form-actions">
							<button className="rd-btn-ghost" type="button" onClick={() => setDeleteRecord(null)} disabled={manageLoading}>
								Cancel
							</button>
							<button className="rd-btn-danger-solid" type="button" onClick={() => handleDeleteRecord(deleteRecord)} disabled={manageLoading}>
								{manageLoading ? 'Deleting…' : 'Delete permanently'}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}