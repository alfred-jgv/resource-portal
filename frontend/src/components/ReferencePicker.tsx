import { useEffect, useState } from 'react';
import { fetchReferenceList } from '../api/referenceCache';
import '../styles/ReferencePicker.css';

interface ReferencePickerProps {
	endpoint: string;
	labelKeys: string[];
	value: string;
	onChange: (id: string) => void;
}

/*
 * DOCU: Lets you pick a foreign-key id (clubId, eventId, etc.) from a
 * dropdown that's fetched automatically as soon as the field mounts —
 * no manual "load" step, and no manual id entry; selection only.
 *
 * @param {string} endpoint - API path to fetch options from, e.g. '/clubs'
 * @param {string[]} labelKeys - Which fields to display per option, e.g. ['clubName']
 * @param {string} value - Current field value (the raw id)
 * @param {(id: string) => void} onChange - Called with the picked id
 *
 * Last Updated: 2026-08-08
 * Author: Alfred
 * Last Updated By: Alfred
 */
export default function ReferencePicker({ endpoint, labelKeys, value, onChange }: ReferencePickerProps) {
	const [options, setOptions] = useState<{ id: string; label: string }[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const labelKeysKey = labelKeys.join('|');

	useEffect(() => {
		let cancelled = false;

		async function loadOptions() {
			setLoading(true);
			setError('');
			try {
				const res = await fetchReferenceList(endpoint);
				if (cancelled) return;
				if (Array.isArray(res.data)) {
					setOptions(
						res.data.map((item: any) => ({
							id: item.id,
							label: labelKeysKey
								.split('|')
								.map((k) => item[k])
								.filter(Boolean)
								.join(' — ') || item.id,
						})),
					);
				} else {
					setError(`Couldn't load options (status ${res.status}).`);
				}
			} catch {
				if (!cancelled) setError("Couldn't load options. Check your connection.");
			} finally {
				if (!cancelled) setLoading(false);
			}
		}

		loadOptions();
		return () => {
			cancelled = true;
		};
	}, [endpoint, labelKeysKey]);

	const selectValue = options.some((o) => o.id === value) ? value : '';

	return (
		<div className="rd-refpicker">
			<select value={selectValue} disabled={loading} onChange={(e) => onChange(e.target.value)}>
				<option value="">
					{loading ? 'Loading…' : options.length === 0 ? 'No records found — create one first' : `select an option (${options.length})`}
				</option>
				{options.map((o) => (
					<option key={o.id} value={o.id}>
						{o.label}
					</option>
				))}
			</select>
			{error && <p className="rd-refpicker-error">{error}</p>}
		</div>
	);
}