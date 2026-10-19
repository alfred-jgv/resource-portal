import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    Building2,
    CalendarDays,
    ClipboardList,
    Coins,
    ContactRound,
    FileText,
    PanelLeftClose,
    PanelLeftOpen,
    UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTokens } from '../hooks/useTokens';
import LogoutButton from './LogoutButton';
import '../styles/Sidebar.css';

interface SidebarLink {
    to: string;
    label: string;
    icon: LucideIcon;
    roles?: string[]; // omit = visible to all authenticated roles
}

const LINKS: SidebarLink[] = [
    { to: '/tasks', label: 'Tasks', icon: ClipboardList },
    { to: '/clubs', label: 'Clubs', icon: Building2, roles: ['INFORMATION', 'ADMIN'] },
    { to: '/captain-leads', label: 'Captain & Leads', icon: ContactRound, roles: ['INFORMATION', 'ADMIN'] },
    { to: '/department-executives', label: 'Department Executives', icon: UsersRound, roles: ['WORKFORCE', 'ADMIN'] },
    { to: '/budget-requests', label: 'Budget Requests', icon: Coins, roles: ['ALLOCATION', 'ADMIN'] },
    { to: '/venue-requests', label: 'Venue Requests', icon: FileText, roles: ['WORKFORCE', 'ADMIN'] },
    { to: '/events', label: 'Events', icon: CalendarDays, roles: ['WORKFORCE', 'ADMIN'] },
    { to: '/admin/register', label: 'Officers', icon: UsersRound, roles: ['ADMIN'] },
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
    const { name, role } = useTokens();
    const [collapsed, setCollapsed] = useState(() => localStorage.getItem('rd_sidebar_collapsed') === 'true');
    const visibleLinks = LINKS.filter((l) => !l.roles || (role !== null && l.roles.includes(role)));

    function toggleCollapsed() {
        setCollapsed((value) => {
            const nextValue = !value;
            localStorage.setItem('rd_sidebar_collapsed', String(nextValue));
            return nextValue;
        });
    }

    return (
        <aside className={`rd-sidebar${collapsed ? ' rd-sidebar--collapsed' : ''}`}>
            <div className="rd-sidebar-header">
                <div className="rd-sidebar-brand-row">
                    <img className="rd-sidebar-logo" src="/AWSSUG-logo.jpg" alt="AWS Student User Group Philippines" />
                    <div className="rd-sidebar-brand-copy">
                        <strong>AWSSUG PH</strong>
                        <span>Resource Portal</span>
                    </div>
                    <button className="rd-sidebar-toggle" type="button" onClick={toggleCollapsed} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
                        {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                    </button>
                </div>
                <div className="rd-sidebar-user">
                    <p className="rd-sidebar-name">
                        {name ?? 'Resource Officer'}
                        <span className="rd-sidebar-role"> · {role ?? 'unknown'}</span>
                    </p>
                </div>
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
                        <l.icon size={18} strokeWidth={1.8} aria-hidden="true" />
                        <span className="rd-sidebar-link-label">{l.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="rd-sidebar-footer">
                <LogoutButton />
            </div>
        </aside>
    );
}