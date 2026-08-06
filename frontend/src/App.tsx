import { useState } from 'react';
import { TokenProvider } from './context/TokenContext';
import AuthPage from './pages/AuthPage';
import ClubsPage from './pages/ClubsPage';
import CaptainLeadsPage from './pages/CaptainLeadsPage';
import EventsPage from './pages/EventsPage';
import DepartmentExecutivesPage from './pages/DepartmentExecutivesPage';
import BudgetRequestsPage from './pages/BudgetRequestsPage';
import VenueRequestsPage from './pages/VenueRequestsPage';
import TasksPage from './pages/TasksPage';

const TABS = [
    { key: 'auth', label: 'Auth', Component: AuthPage },
    { key: 'clubs', label: 'Clubs', Component: ClubsPage },
    { key: 'captain-leads', label: 'Captain & Leads', Component: CaptainLeadsPage },
    { key: 'events', label: 'Events', Component: EventsPage },
    { key: 'department-executives', label: 'Dept. Executives', Component: DepartmentExecutivesPage },
    { key: 'budget-requests', label: 'Budget Requests', Component: BudgetRequestsPage },
    { key: 'venue-requests', label: 'Venue Requests', Component: VenueRequestsPage },
    { key: 'tasks', label: 'Tasks', Component: TasksPage },
];

/*
 * DOCU: Root component — sidebar nav across every module, plus the
 * TokenProvider so tokens grabbed on the Auth tab are available
 * everywhere else. This is intentionally undesigned: the point is to
 * exercise every endpoint (including file uploads and role checks)
 * before any real UI gets built on top of it.
 *
 * Last Updated: 2026-08-06
 * Author: Alfred
 * Last Updated By: Alfred
 */
export default function App() {
    const [active, setActive] = useState('auth');
    const ActiveComponent = TABS.find((t) => t.key === active)?.Component ?? AuthPage;

    return (
        <TokenProvider>
            <div className="app">
                <aside className="sidebar">
                    <h1>API Tester</h1>
                    {TABS.map((t) => (
                        <button key={t.key} className={t.key === active ? 'active' : ''} onClick={() => setActive(t.key)}>
                            {t.label}
                        </button>
                    ))}
                </aside>
                <main className="main">
                    <ActiveComponent />
                </main>
            </div>
        </TokenProvider>
    );
}
