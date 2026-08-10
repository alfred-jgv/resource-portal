import { Link } from 'react-router-dom';
import '../styles/HomePage.css';
/*
 * DOCU: Public landing page. Lets anonymous (and logged-in) visitors
 * jump to the public request forms. Member navigation now lives in
 * the sidebar (via RootLayout), which shows automatically for any
 * authenticated user on every page — no need to duplicate it here.
 *
 * Last Updated: 2026-08-08
 * Author: Alfred
 * Last Updated By: Alfred
 */
export default function HomePage() {
    return (
        <div className="rd-page">
            <div className="rd-module">
                <div className="rd-topbar">
                    <Link to="/login" className="rd-login">
                        Login
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>

                <p className="rd-eyebrow">AWSSUG Resource Portal</p>
                <h1>Resource Department</h1>
                <p className="rd-lead">
                    Submit and track organizational requests. Select a requisition form below to begin.
                </p>

                <hr className="rd-divider" />

                <ul className="rd-ticket-list">
                    <li>
                        <Link to="/budget-requests" className="rd-ticket">
                            <span className="rd-punch" aria-hidden="true" />
                            <div className="rd-ticket-body">
                                <div className="rd-ticket-meta">
                                    <span className="rd-ticket-ref">REQ-BUDGET</span>
                                    <span className="rd-status">Open</span>
                                </div>
                                <h2 className="rd-ticket-title">Budget Request</h2>
                                <p className="rd-ticket-desc">
                                    Submit a new budget allocation, reimbursement, or expenditure approval for departmental review and finance clearance.
                                </p>
                                <div className="rd-ticket-footer">
                                    <span className="rd-btn">Open Form</span>
                                </div>
                            </div>
                        </Link>
                    </li>

                    <li>
                        <Link to="/venue-requests" className="rd-ticket">
                            <span className="rd-punch" aria-hidden="true" />
                            <div className="rd-ticket-body">
                                <div className="rd-ticket-meta">
                                    <span className="rd-ticket-ref">REQ-VENUE</span>
                                    <span className="rd-status">Open</span>
                                </div>
                                <h2 className="rd-ticket-title">Venue Request</h2>
                                <p className="rd-ticket-desc">
                                    Reserve meeting rooms, event halls, or shared facilities for team activities, workshops, and external engagements.
                                </p>
                                <div className="rd-ticket-footer">
                                    <span className="rd-btn">Open Form</span>
                                </div>
                            </div>
                        </Link>
                    </li>
                </ul>
            </div>

            <footer className="rd-footer">
                <div className="rd-module">
                    <span className="rd-footer-text">AWS Student Builder Group · Resource Department</span>
                    <span className="rd-footer-text">© 2026</span>
                </div>
            </footer>
        </div>
    );
}