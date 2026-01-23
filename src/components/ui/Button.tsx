"use client";

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
}

export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading,
    className = '',
    style,
    ...props
}: ButtonProps) => {

    const baseStyles = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-sm)',
        fontWeight: 600,
        cursor: props.disabled || isLoading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        fontFamily: 'var(--font-main)',
        border: '1px solid transparent',
        outline: 'none',
        opacity: props.disabled ? 0.6 : 1,
        position: 'relative' as const,
    };

    const variants = {
        primary: {
            background: 'var(--color-primary)',
            color: 'white',
            boxShadow: '0 0 20px var(--color-primary-glow)',
            border: 'none',
        },
        secondary: {
            background: 'var(--color-secondary)',
            color: 'var(--color-background)',
        },
        outline: {
            background: 'transparent',
            borderColor: 'var(--color-primary)',
            color: 'var(--color-primary)',
        },
        ghost: {
            background: 'transparent',
            color: 'var(--color-text-main)',
        }
    };

    const sizes = {
        sm: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
        md: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
        lg: { padding: '1rem 2rem', fontSize: '1.25rem' },
        icon: { padding: '0.5rem', fontSize: '1rem', width: '2.5rem', height: '2.5rem' }
    };

    const hoverStyles = `
    .btn-${variant}:hover {
      transform: translateY(-2px);
      filter: brightness(1.1);
    }
    .btn-${variant}:active {
      transform: translateY(0);
    }
  `;

    return (
        <>
            <style>{hoverStyles}</style>
            <button
                className={`btn-${variant} ${className}`}
                style={{
                    ...baseStyles,
                    ...variants[variant],
                    ...sizes[size],
                    ...style
                }}
                {...props}
            >
                {isLoading ? (
                    <span style={{ marginRight: '0.5rem' }}>⌛</span> // Placeholder for Spinner
                ) : null}
                {children}
            </button>
        </>
    );
};
