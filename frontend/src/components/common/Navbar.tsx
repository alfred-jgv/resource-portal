import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from './Button';
import './Navbar.css';

export const Navbar: React.FC = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="container navbar-container">
                <Link to="/" className="navbar-brand">
                    <span>AWS</span>
                    <span className="navbar-brand-sub">Student Builder</span>
                </Link>

                <div className="navbar-links">
                    {isAuthenticated ? (
                        <>
                            <span className="navbar-user">
                                <span className="navbar-user-role">{user?.role}</span>
                                <span className="navbar-user-name">{user?.name}</span>
                            </span>
                            <Button variant="secondary" size="sm" onClick={handleLogout}>
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">
                                <Button variant="secondary" size="sm">Login</Button>
                            </Link>
                            <Link to="/register">
                                <Button variant="primary" size="sm">Register</Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};