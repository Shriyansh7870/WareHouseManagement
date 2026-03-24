import { useState, useCallback } from 'react';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning';
}

export function useConfirm() {
  const [state, setState] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ ...options, resolve });
    });
  }, []);

  const handleConfirm = () => { state?.resolve(true); setState(null); };
  const handleCancel = () => { state?.resolve(false); setState(null); };

  return { confirm, confirmState: state, handleConfirm, handleCancel };
}
