import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Skip if in input/textarea/select
      const tag = (e.target as HTMLElement).tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key) {
        case 'd': navigate('/'); break;
        case 'i': navigate('/inventory'); break;
        case 'g': navigate('/grn'); break;
        case 'q': navigate('/qa'); break;
        case 'c': navigate('/cold-chain'); break;
        case 'p': navigate('/dispatch'); break;
        case 'v': navigate('/vendors'); break;
        case 'r': navigate('/reports'); break;
        case 'a': navigate('/audit'); break;
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [navigate]);
}
