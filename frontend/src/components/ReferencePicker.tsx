import { useState } from 'react';
import { apiRequest } from '../api/client';

interface ReferencePickerProps {
    endpoint: string;
    labelKeys: string[];
    value: string;
    onChange: (id: string) => void;
}

/*
 * DOCU: Lets you pick a foreign-key id (clubId, eventId, etc.) from a
 * live-fetched dropdown instead of pasting it manually. Click "load"
 * to fetch the referenced endpoint's full list (token auto-attached
 * by apiRequest), then pick an item — its id fills the underlying
 * text field. You can still type/paste an id directly instead.
 *
 * @param {string} endpoint - API path to fetch options from, e.g. '/clubs'
 * @param {string[]} labelKeys - Which fields to display per option, e.g. ['clubName']
 * @param {string} value - Current field value (the raw id)
 * @param {(id: string) => void} onChange - Called with the picked id
 *
 * Last Updated: 2026-08-06
 * Author: Alfred
 * Last Updated By: Alfred
 */
export default function ReferencePicker({ endpoint, labelKeys, value, onChange }: ReferencePickerProps) {
    const [options, setOptions] = useState<{ id: string; label: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState('');

    async function loadOptions() {
        setLoading(true);
        setError('');
        try {
            const res = await apiRequest('GET', endpoint);
            if (Array.isArray(res.data)) {
                setOptions(
                    res.data.map((item: any) => ({
                        id: item.id,
                        label: labelKeys.map((k) => item[k]).filter(Boolean).join(' — ') || item.id,
                    })),
                );
                setLoaded(true);
            } else {
                setError(`Unexpected response (status ${res.status}) — check the response below`);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <div className="row" style={{ marginBottom: 6 }}>
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="paste an id, or load + pick below"
                    style={{ flex: 1 }}
                />
                <button type="button" onClick={loadOptions} disabled={loading}>
                    {loading ? 'loading...' : loaded ? 'refresh' : `load ${endpoint}`}
                </button>
            </div>
            {error && <div style={{ color: '#cf222e', fontSize: 12, marginBottom: 6 }}>{error}</div>}
            {options.length > 0 && (
                <select
                    value=""
                    onChange={(e) => {
                        if (e.target.value) onChange(e.target.value);
                    }}
                >
                    <option value="">-- pick from {options.length} result{options.length === 1 ? '' : 's'} --</option>
                    {options.map((o) => (
                        <option key={o.id} value={o.id}>
                            {o.label} ({o.id.slice(0, 8)}...)
                        </option>
                    ))}
                </select>
            )}
            {loaded && options.length === 0 && !error && (
                <div style={{ color: '#999', fontSize: 12 }}>no records found — create one first</div>
            )}
        </div>
    );
}