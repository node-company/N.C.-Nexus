import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    glass?: boolean;
}

export const Card = ({ children, className = '', glass = true, style }: CardProps) => {
    return (
        <div
            className={glass ? 'glass-panel' : ''}
            style={{
                borderRadius: 'var(--radius-md)',
                padding: '2rem',
                background: glass ? undefined : 'var(--color-surface-200)',
                border: glass ? undefined : '1px solid rgba(255, 255, 255, 0.05)',
                ...style
            }}
        >
            {children}
        </div>
    );
};
