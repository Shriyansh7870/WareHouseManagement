import React from 'react';

interface SectionHeaderProps {
  title: string;
  actions?: React.ReactNode;
  className?: string;
}

export default function SectionHeader({ title, actions, className = '' }: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <h2 className="font-semibold text-base" style={{ color: 'var(--text)' }}>{title}</h2>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
