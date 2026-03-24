import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import AppRouter from './router/AppRouter';
import { useThemeStore } from './store/themeStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 2 },
  },
});

function AppInner() {
  const dark = useThemeStore(s => s.dark);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <>
      <AppRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontSize: '13px', fontFamily: 'Inter, sans-serif' },
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  );
}
