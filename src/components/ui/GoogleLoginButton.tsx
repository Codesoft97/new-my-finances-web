'use client';

import { useTheme } from '@/contexts/ThemeProvider';
import { useState, useEffect, useCallback, useRef } from 'react';

interface GoogleLoginButtonProps {
  onSuccess: (credential: string) => void;
  onError: (message: string) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          disableAutoSelect: () => void;
        };
        oauth2: {
          initCodeClient: (config: any) => any;
          initTokenClient: (config: any) => any;
        };
      };
    };
  }
}

export default function GoogleLoginButton({ onSuccess, onError }: GoogleLoginButtonProps) {
  const { resolvedTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleCredentialResponse = useCallback((response: any) => {
    console.log('Google credential response received');
    if (response.credential) {
      onSuccess(response.credential);
    } else {
      onError('Erro ao obter credenciais do Google');
    }
    setIsLoading(false);
  }, [onSuccess, onError]);

  useEffect(() => {
    // Check if script already loaded
    if (window.google?.accounts?.id) {
      setScriptLoaded(true);
      return;
    }

    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('Google GSI script loaded');
      setScriptLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load Google Identity Services script');
      onError('Erro ao carregar serviços do Google');
    };
    document.body.appendChild(script);
  }, [onError]);

  useEffect(() => {
    if (!scriptLoaded || !window.google?.accounts?.id || !buttonRef.current) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error('NEXT_PUBLIC_GOOGLE_CLIENT_ID not set');
      return;
    }

    try {
      console.log('Initializing Google Sign-In with client ID:', clientId.substring(0, 20) + '...');

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: false, // Disable FedCM to avoid issues
      });

      // Render the official Google button
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: resolvedTheme === 'dark' ? 'filled_black' : 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        width: buttonRef.current.offsetWidth || 300,
      });

      console.log('Google button rendered');
    } catch (error) {
      console.error('Error initializing Google Sign-In:', error);
    }
  }, [scriptLoaded, handleCredentialResponse, resolvedTheme]);

  if (!scriptLoaded) {
    return (
      <div className={`
        w-full flex items-center justify-center gap-3
        px-3 py-2 rounded-md font-medium
        border animate-pulse
        ${resolvedTheme === 'dark'
          ? 'bg-[#131314] border-[#8e918f] text-[#e3e3e3]'
          : 'bg-white border-[#747775] text-[#1f1f1f]'
        }
      `}>
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Carregando...
      </div>
    );
  }

  return (
    <div
      ref={buttonRef}
      className="w-full flex justify-center [&>div]:w-full [&>div>div]:w-full"
      style={{ minHeight: '44px' }}
    />
  );
}
