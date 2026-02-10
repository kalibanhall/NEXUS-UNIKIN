import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { QueryProvider } from '@/components/providers/query-provider'
import { AuthProvider } from '@/lib/auth/auth-context'

export const metadata: Metadata = {
  title: {
    default: 'NEXUS UNIKIN - Système de Gestion Universitaire',
    template: '%s | NEXUS UNIKIN',
  },
  description: 'Le cœur numérique de l\'Université de Kinshasa - Système de gestion universitaire intégré',
  keywords: ['UNIKIN', 'Université de Kinshasa', 'Gestion universitaire', 'Système académique', 'RDC'],
  authors: [{ name: 'UNIKIN IT Department' }],
  creator: 'Université de Kinshasa',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
            <Toaster position="top-right" richColors />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
