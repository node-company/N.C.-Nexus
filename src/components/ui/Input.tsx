"use client";

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input = ({ label, error, style, icon, ...props }: InputProps) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
            {label && (
                <label style={{
                    color: 'var(--color-text-muted)',
                    fontSize: '0.875rem',
                    fontWeight: 500
                }}>
                    {label}
                </label>
            )}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                {icon && (
                    <div style={{
                        position: 'absolute',
                        left: '1rem',
                        color: 'var(--color-text-muted)',
                        pointerEvents: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {icon}
                    </div>
                )}
                <input
                    style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: error ? '1px solid #ff4444' : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 'var(--radius-sm)',
                        padding: icon ? '0.75rem 1rem 0.75rem 2.75rem' : '0.75rem 1rem',
                        color: 'var(--color-text-main)',
                        fontSize: '1rem',
                        width: '100%',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        fontFamily: 'var(--font-main)',
                        ...style
                    }}
                    onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-primary)';
                        e.currentTarget.style.boxShadow = '0 0 15px var(--color-primary-glow)';
                    }}
                    onBlur={(e) => {
                        e.currentTarget.style.borderColor = error ? '#ff4444' : 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                    {...props}
                />
            </div>
            {error && (
                <span style={{ color: '#ff4444', fontSize: '0.75rem' }}>{error}</span>
            )}
        </div>
    );
};
