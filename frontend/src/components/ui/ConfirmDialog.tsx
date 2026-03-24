import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from './Button';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  variant = 'danger', onConfirm, onCancel
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm p-6" style={{ boxShadow: 'var(--shadow-lg)' }}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${variant === 'danger' ? 'bg-red-100' : 'bg-amber-100'}`}>
          <AlertTriangle size={22} className={variant === 'danger' ? 'text-red-600' : 'text-amber-600'} />
        </div>
        <h3 className="text-base font-bold text-center text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-center text-gray-500 mb-6">{message}</p>
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={onCancel}>{cancelLabel}</Button>
          <Button variant={variant === 'danger' ? 'danger' : 'primary'} className="flex-1" onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
