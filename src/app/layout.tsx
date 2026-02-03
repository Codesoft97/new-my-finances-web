import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import GoogleAuthProvider from '@/providers/GoogleAuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'DuoFinance',
  description: 'Controle financeiro para casais',
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <GoogleAuthProvider>
          <QueryProvider>
            <ThemeProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </ThemeProvider>
          </QueryProvider>
        </GoogleAuthProvider>
      </body>
    </html>
  );
}