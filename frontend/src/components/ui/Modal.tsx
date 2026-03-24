import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  width?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
}

export default function Modal({ title, width = '560px', children, footer, onClose }: ModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh] w-full"
        style={{ maxWidth: width }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1 hover:bg-gray-100"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && (
          <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
