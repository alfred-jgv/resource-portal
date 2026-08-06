import { useState } from 'react';
import { apiRequest } from '../api/client';
import type { FieldConfig, ApiResult } from '../types';
import ReferencePicker from './ReferencePicker';
import { useTokens } from '../hooks/useTokens';

interface ModuleFormProps {
	title: string;
	endpoint: string;
	fields: FieldConfig[];
	multipart?: boolean;
	supportsDelete?: boolean;
	createRoles?: string[]; // roles allowed to POST create; omit = public, anyone can create
	manageRoles?: string[]; // roles allowed to GET all / DELETE; omit = any authenticated user
}

/*
 * DOCU: Converts a raw form value to what the API expects. Date/datetime
 * fields come out of native <input type="date"|"datetime-local"> as
 * "2026-01-15" or "2026-01-15T08:00", neither of which is a valid
 * Prisma DateTime — this turns them into full ISO strings
 * ("2026-01-15T00:00:00.000Z") right before the request is sent.
 *
 * Last Updated: 2026-08-06
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
 * DOCU: Generic form for one API module, with two independent
 * permission gates:
 * - canCreate: controls the Create fieldset + POST button.
 *   Omit createRoles for public create (e.g. Budget/Venue Requests).
 * - canManage: controls GET All + Delete. Omit manageRoles to allow
 *   any authenticated user; still requires login since role is null
 *   when logged out.
 *
 * Last Updated: 2026-08-06
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
	const { role } = useTokens();
	const canCreate = !createRoles || (role !== null && createRoles.includes(role));
	const canManage = !manageRoles || (role !== null && manageRoles.includes(role));

	const [values, setValues] = useState<Record<string, string>>({});
	const [files, setFiles] = useState<Record<string, File | null>>({});
	const [deleteId, setDeleteId] = useState('');
	const [result, setResult] = useState<ApiResult | null>(null);
	const [loading, setLoading] = useState(false);

	function updateValue(name: string, val: string) {
		setValues((v) => ({ ...v, [name]: val }));
	}

	async function run(fn: () => Promise<ApiResult>) {
		setLoading(true);
		try {
			const r = await fn();
			setResult(r);
		} finally {
			setLoading(false);
		}
	}

	function handleCreate() {
		run(() => {
			if (multipart) {
				const fd = new FormData();
				fields.forEach((f) => {
					if (f.type === 'file') {
						if (files[f.name]) fd.append(f.name, files[f.name] as File);
					} else {
						fd.append(f.name, toApiValue(f, values[f.name] ?? ''));
					}
				});
				return apiRequest('POST', endpoint, fd, true);
			}
			const body: Record<string, any> = {};
			fields.forEach((f) => {
				const raw = values[f.name] ?? '';
				body[f.name] = f.type === 'number' ? Number(raw || 0) : toApiValue(f, raw);
			});
			return apiRequest('POST', endpoint, body, false);
		});
	}

	function handleGetAll() {
		run(() => apiRequest('GET', endpoint));
	}

	function handleDelete() {
		run(() => apiRequest('DELETE', `${endpoint}/${deleteId}`));
	}

	const statusClass = !result
		? ''
		: result.status < 300
			? 'status-2xx'
			: result.status < 500
				? 'status-4xx'
				: 'status-other';

	return (
		<div className="module">
			<h2>{title}</h2>
			<p style={{ color: '#666', marginTop: -8 }}>{endpoint}</p>

			{canCreate && (
				<fieldset>
					<legend>Create</legend>
					{fields.map((f) => (
						<div className="field" key={f.name}>
							<label>{f.label}</label>
							{f.type === 'select' ? (
								<select value={values[f.name] ?? ''} onChange={(e) => updateValue(f.name, e.target.value)}>
									<option value="">-- select --</option>
									{f.options!.map((o) => (
										<option key={o} value={o}>
											{o}
										</option>
									))}
								</select>
							) : f.type === 'file' ? (
								<input
									type="file"
									onChange={(e) => setFiles((v) => ({ ...v, [f.name]: e.target.files?.[0] ?? null }))}
								/>
							) : f.type === 'reference' ? (
								<ReferencePicker
									endpoint={f.refEndpoint!}
									labelKeys={f.refLabelKeys ?? ['id']}
									value={values[f.name] ?? ''}
									onChange={(id) => updateValue(f.name, id)}
								/>
							) : f.type === 'date' ? (
								<input
									type="date"
									value={values[f.name] ?? ''}
									onChange={(e) => updateValue(f.name, e.target.value)}
								/>
							) : f.type === 'datetime' ? (
								<input
									type="datetime-local"
									value={values[f.name] ?? ''}
									onChange={(e) => updateValue(f.name, e.target.value)}
								/>
							) : (
								<input
									type={f.type === 'number' ? 'number' : 'text'}
									placeholder={f.placeholder}
									value={values[f.name] ?? ''}
									onChange={(e) => updateValue(f.name, e.target.value)}
								/>
							)}
						</div>
					))}
					<div className="actions">
						<button onClick={handleCreate} disabled={loading}>POST Create</button>
					</div>
				</fieldset>
			)}
			{!canCreate && <p style={{ color: '#999', fontSize: 13 }}>You don't have permission to create here.</p>}

			{canManage ? (
				<>
					<div className="actions">
						<button onClick={handleGetAll} disabled={loading}>GET All</button>
					</div>
					{supportsDelete && (
						<div className="row">
							<input placeholder="id to delete" value={deleteId} onChange={(e) => setDeleteId(e.target.value)} />
							<button onClick={handleDelete} disabled={loading || !deleteId}>DELETE</button>
						</div>
					)}
				</>
			) : (
				<p style={{ color: '#999', fontSize: 13 }}>Login with the appropriate office role to view or manage records.</p>
			)}

			<div className="response">
				{result && <span className={`status-badge ${statusClass}`}>{result.status}</span>}
				<pre>{result ? JSON.stringify(result.data, null, 2) : loading ? 'loading...' : '(no request sent yet)'}</pre>
			</div>
		</div>
	);
}