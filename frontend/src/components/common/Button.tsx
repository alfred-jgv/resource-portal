import React from 'react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    fullWidth?: boolean;
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    children,
    className = '',
    disabled,
    ...props
}) => {
    return (
        <button
            className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <span className="btn-loader">
                    <span className="spinner"></span>
                </span>
            ) : (
                children
            )}
        </button>
    );
};