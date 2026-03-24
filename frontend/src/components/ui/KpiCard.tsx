import React from 'react';

type AccentColor = 'purple' | 'orange' | 'green' | 'blue' | 'red' | 'teal';

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: 'up' | 'down' | 'warn' | 'neutral';
  accentColor?: AccentColor;
  className?: string;
  onClick?: () => void;
}

const ACCENT_VARS: Record<AccentColor, string> = {
  purple: 'var(--accent-gold)',
  orange: 'var(--accent-orange)',
  green: 'var(--accent-green)',
  blue: 'var(--accent-blue)',
  red: 'var(--accent-red)',
  teal: 'var(--accent-teal)',
};

const TREND_STYLES: Record<string, { icon: string; class: string }> = {
  up: { icon: '↑', class: 'text-green-600' },
  down: { icon: '↓', class: 'text-red-600' },
  warn: { icon: '⚠', class: 'text-amber-600' },
  neutral: { icon: '→', class: 'text-gray-500' },
};

export default function KpiCard({ label, value, sub, trend, accentColor = 'purple', className = '', onClick }: KpiCardProps) {
  const trendInfo = trend ? TREND_STYLES[trend] : null;

  return (
    <div
      className={`bg-white rounded-xl overflow-hidden hover:-translate-y-px transition-transform ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}
      onClick={onClick}
    >
      <div className="h-[3px]" style={{ background: ACCENT_VARS[accentColor] }} />
      <div className="p-4">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</div>
        <div className="font-mono font-bold text-[28px] leading-tight" style={{ color: 'var(--text)' }}>
          {value}
        </div>
        {sub && trendInfo && (
          <div className={`text-xs mt-1 font-medium flex items-center gap-1 ${trendInfo.class}`}>
            <span>{trendInfo.icon}</span>
            <span>{sub}</span>
          </div>
        )}
        {sub && !trendInfo && (
          <div className="text-xs mt-1 text-gray-500">{sub}</div>
        )}
      </div>
    </div>
  );
}
