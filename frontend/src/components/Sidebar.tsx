import { NavLink } from 'react-router-dom';
import { useTokens } from '../hooks/useTokens';
import LogoutButton from './LogoutButton';

interface SidebarLink {
    to: string;
    label: string;
    roles?: string[]; // omit = visible to all authenticated roles
}

const LINKS: SidebarLink[] = [
    { to: '/tasks', label: 'Tasks', roles: ['ADMIN'] },
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
 * Last Updated: 2026-08-06
 * Author: Alfred
 * Last Updated By: Alfred
 */
export default function Sidebar() {
    const { role } = useTokens();
    const visibleLinks = LINKS.filter((l) => !l.roles || (role !== null && l.roles.includes(role)));

    return (
        <aside className="sidebar">
            <h1>RDMS</h1>
            <p style={{ color: '#999', fontSize: 12 }}>Role: {role ?? 'unknown'}</p>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {visibleLinks.map((l) => (
                    <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? 'active' : '')}>
                        {l.label}
                    </NavLink>
                ))}
            </nav>
            <LogoutButton />
        </aside>
    );
}