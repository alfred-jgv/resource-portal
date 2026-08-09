import { NavLink } from 'react-router-dom';
import { useTokens } from '../hooks/useTokens';
import LogoutButton from './LogoutButton';
import '../styles/Sidebar.css';

interface SidebarLink {
    to: string;
    label: string;
    roles?: string[]; // omit = visible to all authenticated roles
}

const LINKS: SidebarLink[] = [
    { to: '/tasks', label: 'Tasks' },
    { to: '/clubs', label: 'Clubs', roles: ['INFORMATION', 'ADMIN'] },
    { to: '/captain-leads', label: 'Captain & Leads', roles: ['INFORMATION', 'ADMIN'] },
    { to: '/department-executives', label: 'Department Executives', roles: ['WORKFORCE', 'ADMIN'] },
    { to: '/budget-requests', label: 'Budget Requests', roles: ['ALLOCATION', 'ADMIN'] },
    { to: '/venue-requests', label: 'Venue Requests', roles: ['WORKFORCE', 'ADMIN'] },
    { to: '/events', label: 'Events', roles: ['WORKFORCE', 'ADMIN'] },
];

/*
 * DOCU: Nav for protected pages, filtered per role so each office
 * only sees links relevant to it (ADMIN sees everything). This is a
 * UX convenience — the backend/ModuleForm still enforces actual
 * create/manage permissions regardless of what's shown here.
 *
 * Last Updated: 2026-08-08
 * Author: Alfred
 * Last Updated By: Alfred
 */
export default function Sidebar() {
    const { role } = useTokens();
    const visibleLinks = LINKS.filter((l) => !l.roles || (role !== null && l.roles.includes(role)));

    return (
        <aside className="rd-sidebar">
            <div className="rd-sidebar-header">
                <h1 className="rd-sidebar-title">RDMS</h1>
                <p className="rd-sidebar-role">Role: {role ?? 'unknown'}</p>
            </div>

            <nav className="rd-sidebar-nav">
                {visibleLinks.map((l) => (
                    <NavLink
                        key={l.to}
                        to={l.to}
                        className={({ isActive }) =>
                            isActive ? 'rd-sidebar-link rd-sidebar-link--active' : 'rd-sidebar-link'
                        }
                    >
                        {l.label}
                    </NavLink>
                ))}
            </nav>

            <div className="rd-sidebar-footer">
                <LogoutButton />
            </div>
        </aside>
    );
}