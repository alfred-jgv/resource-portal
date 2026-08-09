import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import '../styles/Toast.css';

export type ToastType = 'success' | 'error';

interface ToastEntry {
	id: number;
	type: ToastType;
	message: string;
}

interface ToastContextValue {
	showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 5000;

/*
 * DOCU: App-wide toast notifications — fixed top-right stack, rendered
 * above everything else via a high z-index (no portal needed since it's
 * position:fixed). Mount this ONCE, wrapping the whole app (in main.tsx,
 * outside/above the router), so it works on public pages too, not just
 * pages inside RootLayout's authenticated shell.
 *
 * `showToast` is kept referentially stable across re-renders (useCallback
 * + useMemo'd context value) so components that call it from inside a
 * useCallback/useEffect dependency array don't get an unstable reference
 * that triggers unnecessary re-runs.
 *
 * Last Updated: 2026-08-08
 * Author: Alfred
 * Last Updated By: Alfred
 */
export function ToastProvider({ children }: { children: ReactNode }) {
	const [toasts, setToasts] = useState<ToastEntry[]>([]);
	const nextId = useRef(0);

	const dismiss = useCallback((id: number) => {
		setToasts((t) => t.filter((toast) => toast.id !== id));
	}, []);

	const showToast = useCallback(
		(type: ToastType, message: string) => {
			const id = nextId.current++;
			setToasts((t) => [...t, { id, type, message }]);
			window.setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
		},
		[dismiss],
	);

	const value = useMemo(() => ({ showToast }), [showToast]);

	return (
		<ToastContext.Provider value={value}>
			{children}
			<div className="rd-toast-stack" role="status" aria-live="polite">
				{toasts.map((toast) => (
					<div key={toast.id} className={`rd-toast rd-toast-${toast.type}`}>
						<span className="rd-toast-message">{toast.message}</span>
						<button type="button" className="rd-toast-close" onClick={() => dismiss(toast.id)} aria-label="Dismiss">
							×
						</button>
					</div>
				))}
			</div>
		</ToastContext.Provider>
	);
}

/*
 * DOCU: Hook for firing toasts from anywhere under <ToastProvider>.
 * Usage: const toast = useToast(); toast.success('Saved.'); toast.error('Nope.');
 *
 * Last Updated: 2026-08-08
 * Author: Alfred
 * Last Updated By: Alfred
 */
export function useToast() {
	const ctx = useContext(ToastContext);
	if (!ctx) {
		throw new Error('useToast must be used within a <ToastProvider>');
	}
	return useMemo(
		() => ({
			success: (message: string) => ctx.showToast('success', message),
			error: (message: string) => ctx.showToast('error', message),
		}),
		[ctx],
	);
}