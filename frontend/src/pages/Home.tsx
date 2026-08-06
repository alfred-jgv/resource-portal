import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import './Home.css';

export const Home: React.FC = () => {
    const { user } = useAuth();

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="container">
                    <div className="hero-content animate-fade-in-up">
                        <div className="hero-badge">Resource Department</div>
                        <h1 className="hero-title">
                            <span className="highlight">AWS Student Builder</span>
                            <br />
                            <span className="hero-subtitle">Group Philippines</span>
                        </h1>
                        <p className="hero-description">
                            Manage clubs, events, budgets, and tasks for the AWS Student Builder
                            community across the Philippines. Built for efficiency and scale.
                        </p>
                        {!user && (
                            <div className="hero-actions">
                                <a href="/register">
                                    <Button variant="primary" size="lg">Get Started</Button>
                                </a>
                                <a href="/login">
                                    <Button variant="secondary" size="lg">Sign In</Button>
                                </a>
                            </div>
                        )}
                        {user && (
                            <div className="hero-actions">
                                <div className="welcome-message">
                                    Welcome back, <strong>{user.name}</strong>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="container">
                    <div className="stats-grid animate-fade-in-up">
                        <div className="stat-item glass">
                            <div className="stat-number">50+</div>
                            <div className="stat-label">Active Clubs</div>
                        </div>
                        <div className="stat-item glass">
                            <div className="stat-number">200+</div>
                            <div className="stat-label">Student Builders</div>
                        </div>
                        <div className="stat-item glass">
                            <div className="stat-number">100+</div>
                            <div className="stat-label">Events Hosted</div>
                        </div>
                        <div className="stat-item glass">
                            <div className="stat-number">15+</div>
                            <div className="stat-label">Universities</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <div className="features-header animate-fade-in-up">
                        <h2 className="features-title">
                            Everything You Need to <span className="highlight">Manage</span>
                        </h2>
                        <p className="features-subtitle">
                            Comprehensive tools for the AWS Student Builder PH community
                        </p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card glass animate-fade-in-up">
                            <div className="feature-icon">🏛️</div>
                            <h3 className="feature-title">Clubs Management</h3>
                            <p className="feature-description">
                                Create and manage AWS student clubs across the Philippines
                            </p>
                            <div className="feature-role">
                                <span className="feature-role-badge">INFORMATION • ADMIN</span>
                            </div>
                        </div>

                        <div className="feature-card glass animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                            <div className="feature-icon">👥</div>
                            <h3 className="feature-title">Captain Leads</h3>
                            <p className="feature-description">
                                Track club captains and their leadership roles
                            </p>
                            <div className="feature-role">
                                <span className="feature-role-badge">INFORMATION • ADMIN</span>
                            </div>
                        </div>

                        <div className="feature-card glass animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            <div className="feature-icon">🎪</div>
                            <h3 className="feature-title">Events & Activities</h3>
                            <p className="feature-description">
                                Plan and organize technical events and workshops
                            </p>
                            <div className="feature-role">
                                <span className="feature-role-badge">WORKFORCE • ADMIN</span>
                            </div>
                        </div>

                        <div className="feature-card glass animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                            <div className="feature-icon">💰</div>
                            <h3 className="feature-title">Budget Allocation</h3>
                            <p className="feature-description">
                                Submit and track budget requests for your events
                            </p>
                            <div className="feature-role">
                                <span className="feature-role-badge">ALLOCATION • ADMIN</span>
                            </div>
                        </div>

                        <div className="feature-card glass animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                            <div className="feature-icon">📋</div>
                            <h3 className="feature-title">Venue Requests</h3>
                            <p className="feature-description">
                                Book AWS offices and event spaces
                            </p>
                            <div className="feature-role">
                                <span className="feature-role-badge">WORKFORCE • ADMIN</span>
                            </div>
                        </div>

                        <div className="feature-card glass animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                            <div className="feature-icon">✅</div>
                            <h3 className="feature-title">Task Management</h3>
                            <p className="feature-description">
                                Assign and track department tasks efficiently
                            </p>
                            <div className="feature-role">
                                <span className="feature-role-badge">ADMIN ONLY</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content glass animate-fade-in-up">
                        <h2 className="cta-title">
                            Ready to Build the Future?
                        </h2>
                        <p className="cta-description">
                            Join the AWS Student Builder Group PH and be part of the cloud revolution.
                        </p>
                        <div className="cta-actions">
                            <a href="/register">
                                <Button variant="primary" size="lg">
                                    Join Now
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};