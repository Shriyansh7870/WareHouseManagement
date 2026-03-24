import React from 'react';

type BadgeVariant = 'ok' | 'warn' | 'danger' | 'purple' | 'blue' | 'gray' | 'orange' | 'teal';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  ok: 'bg-green-50 text-green-700 border-green-200',
  warn: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  gray: 'bg-gray-100 text-gray-600 border-gray-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  teal: 'bg-teal-50 text-teal-700 border-teal-200',
};

const DOT_COLORS: Record<BadgeVariant, string> = {
  ok: 'bg-green-500',
  warn: 'bg-amber-500',
  danger: 'bg-red-500',
  purple: 'bg-purple-500',
  blue: 'bg-blue-500',
  gray: 'bg-gray-400',
  orange: 'bg-orange-500',
  teal: 'bg-teal-500',
};

export default function Badge({ variant, children, dot, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${VARIANT_STYLES[variant]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${DOT_COLORS[variant]}`} />}
      {children}
    </span>
  );
}
