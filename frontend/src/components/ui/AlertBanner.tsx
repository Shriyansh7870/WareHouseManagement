import React from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

type AlertType = 'warn' | 'info' | 'success' | 'danger';

interface AlertBannerProps {
  type: AlertType;
  message: string;
  className?: string;
}

const STYLES: Record<AlertType, { bg: string; text: string; border: string; Icon: React.ComponentType<{size?: number; className?: string}> }> = {
  warn: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', Icon: AlertTriangle },
  info: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', Icon: Info },
  success: { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200', Icon: CheckCircle },
  danger: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200', Icon: XCircle },
};

export default function AlertBanner({ type, message, className = '' }: AlertBannerProps) {
  const { bg, text, border, Icon } = STYLES[type];
  return (
    <div className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border text-sm font-medium ${bg} ${text} ${border} ${className}`}>
      <Icon size={14} className="flex-shrink-0" />
      {message}
    </div>
  );
}
