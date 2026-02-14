'use client';

import { Toaster } from 'sonner';
import { useTheme } from '@/contexts/ThemeProvider';

export default function AppToaster() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      position="top-right"
      theme={resolvedTheme}
      richColors
      closeButton
      toastOptions={{ duration: 5000 }}
    />
  );
}
