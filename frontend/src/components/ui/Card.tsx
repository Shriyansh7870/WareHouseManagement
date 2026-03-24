import React from 'react';

interface CardProps {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export default function Card({ title, action, children, className = '', noPadding }: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl ${className}`}
      style={{ boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          {title && <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
    </div>
  );
}
