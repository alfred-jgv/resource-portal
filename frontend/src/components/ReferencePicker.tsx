import { useEffect, useState } from 'react';
import { fetchReferenceList } from '../api/referenceCache';
import '../styles/ReferencePicker.css';

interface ReferencePickerProps {
	endpoint: string;
	labelKeys: string[];
	value: string;
	onChange: (id: string) => void;
	filterKey?: string;
	filterValue?: string;
	autoSelectFirst?: boolean;
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
export default function ReferencePicker({ endpoint, labelKeys, value, onChange, filterKey, filterValue, autoSelectFirst = false }: ReferencePickerProps) {
	const [options, setOptions] = useState<{ id: string; label: string }[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [retryToken, setRetryToken] = useState(0);
	const [loadedFilterValue, setLoadedFilterValue] = useState<string | undefined>(undefined);

	const labelKeysKey = labelKeys.join('|');

	useEffect(() => {
		let cancelled = false;

		async function loadOptions() {
			setLoading(true);
			setError('');
			setOptions([]);
			setLoadedFilterValue(undefined);
			try {
				const res = await fetchReferenceList(endpoint);
				if (cancelled) return;
				if (res.status >= 200 && res.status < 300 && Array.isArray(res.data)) {
					const filteredData = filterKey && filterValue
						? res.data.filter((item: any) => String(item[filterKey]) === filterValue)
						: [];
					setOptions(
						(filterKey ? filteredData : res.data).map((item: any) => ({
							id: item.id,
							label: labelKeysKey
								.split('|')
								.map((k) => item[k])
								.filter(Boolean)
								.join(' — ') || item.id,
						})),
					);
					setLoadedFilterValue(filterValue);
				} else {
					setOptions([]);
					setError(
						res.status === 401 || res.status === 403
							? 'These options are unavailable right now. Please try again.'
							: `Couldn’t load options (status ${res.status}).`,
					);
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
	}, [endpoint, labelKeysKey, filterKey, filterValue, retryToken]);

	const selectValue = options.some((o) => o.id === value) ? value : '';
	const selectedOption = options.find((option) => option.id === selectValue);

	useEffect(() => {
		if (autoSelectFirst && filterValue && loadedFilterValue === filterValue && !value && !loading && options.length > 0) {
			onChange(options[0].id);
		}
	}, [autoSelectFirst, filterValue, loadedFilterValue, loading, onChange, options, value]);

	return (
		<div className="rd-refpicker">
			{autoSelectFirst ? (
				<div className="rd-refpicker-readonly" aria-live="polite">
					{loading ? 'Loading club head…' : error ? 'Club head unavailable' : selectedOption?.label ?? (filterValue ? 'No club head available' : 'Select a club first')}
				</div>
			) : (
				<select
					value={selectValue}
					disabled={loading || (!!filterKey && !filterValue)}
					onChange={(e) => onChange(e.target.value)}
				>
					<option value="">
						{loading ? 'Loading…' : error ? 'Options unavailable' : filterKey && !filterValue ? 'Select a club first' : options.length === 0 ? 'No records available' : `Select an option (${options.length})`}
					</option>
					{options.map((o) => (
						<option key={o.id} value={o.id}>
							{o.label}
						</option>
					))}
				</select>
			)}
			{error && (
				<div className="rd-refpicker-error">
					<p>{error}</p>
					<button type="button" onClick={() => setRetryToken((value) => value + 1)} disabled={loading}>
						Retry
					</button>
				</div>
			)}
		</div>
	);
}