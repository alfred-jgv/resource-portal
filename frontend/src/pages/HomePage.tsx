import { Link } from 'react-router-dom';

/*
 * DOCU: Public landing page. Lets anonymous (and logged-in) visitors
 * jump to the public request forms. Member navigation now lives in
 * the sidebar (via RootLayout), which shows automatically for any
 * authenticated user on every page — no need to duplicate it here.
 *
 * Last Updated: 2026-08-06
 * Author: Alfred
 * Last Updated By: Alfred
 */
export default function HomePage() {
    return (
        <div className="module">
            <h1>Resource Department</h1>
            <p>Submit a request below.</p>

            <nav style={{ display: 'flex', gap: 12, margin: '16px 0' }}>
                <Link to="/budget-requests">Budget Requests</Link>
                <Link to="/venue-requests">Venue Requests</Link>
                <Link to="/login">Member Login</Link>
            </nav>
        </div>
    );
}