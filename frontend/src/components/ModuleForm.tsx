import { useState } from 'react';
import { useTokens } from '../hooks/useTokens';
import { apiRequest } from '../api/client';
import type { FieldConfig, ApiResult } from '../types';

interface ModuleFormProps {
	title: string;
	endpoint: string;
	fields: FieldConfig[];
	multipart?: boolean;
	supportsDelete?: boolean;
}

/*
 * DOCU: Converts a raw form value to what the API expects. Date/datetime
 * fields come out of native <input type="date"|"datetime-local"> as
 * "2026-01-15" or "2026-01-15T08:00", neither of which is a valid
 * Prisma DateTime — this turns them into full ISO strings
 * ("2026-01-15T00:00:00.000Z") right before the request is sent.
 * @param {FieldConfig} field - The field definition (checks .type)
 * @param {string} raw - The raw value currently in form state
 * @returns {string} - The value to actually send to the API
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
 * DOCU: Generic test form for one API module. Renders an input per
 * field (text/number/select/file/date/datetime), a token dropdown
 * pulled from TokenContext, and three actions: POST create, GET all,
 * and (optionally) DELETE by id. Every response is dumped raw as JSON.
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
}: ModuleFormProps) {
	const { tokens } = useTokens();
	const [selectedLabel, setSelectedLabel] = useState('');
	const [values, setValues] = useState<Record<string, string>>({});
	const [files, setFiles] = useState<Record<string, File | null>>({});
	const [deleteId, setDeleteId] = useState('');
	const [result, setResult] = useState<ApiResult | null>(null);
	const [loading, setLoading] = useState(false);

	const activeToken = tokens.find((t) => t.label === selectedLabel)?.token;

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
				return apiRequest('POST', endpoint, activeToken, fd, true);
			}
			const body: Record<string, any> = {};
			fields.forEach((f) => {
				const raw = values[f.name] ?? '';
				body[f.name] = f.type === 'number' ? Number(raw || 0) : toApiValue(f, raw);
			});
			return apiRequest('POST', endpoint, activeToken, body, false);
		});
	}

	function handleGetAll() {
		run(() => apiRequest('GET', endpoint, activeToken));
	}

	function handleDelete() {
		run(() => apiRequest('DELETE', `${endpoint}/${deleteId}`, activeToken));
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

			<div className="token-bar">
				<label>Send as:</label>
				<select value={selectedLabel} onChange={(e) => setSelectedLabel(e.target.value)}>
					<option value="">-- no token (test 401) --</option>
					{tokens.map((t) => (
						<option key={t.label} value={t.label}>
							{t.label}
						</option>
					))}
				</select>
				{tokens.length === 0 && <span style={{ color: '#999' }}>(register/login on the Auth tab first)</span>}
			</div>

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
					<button onClick={handleCreate} disabled={loading}>
						POST Create
					</button>
				</div>
			</fieldset>

			<div className="actions">
				<button onClick={handleGetAll} disabled={loading}>
					GET All
				</button>
			</div>

			{supportsDelete && (
				<div className="row">
					<input placeholder="id to delete" value={deleteId} onChange={(e) => setDeleteId(e.target.value)} />
					<button onClick={handleDelete} disabled={loading || !deleteId}>
						DELETE
					</button>
				</div>
			)}

			<div className="response">
				{result && <span className={`status-badge ${statusClass}`}>{result.status}</span>}
				<pre>{result ? JSON.stringify(result.data, null, 2) : loading ? 'loading...' : '(no request sent yet)'}</pre>
			</div>
		</div>
	);
}