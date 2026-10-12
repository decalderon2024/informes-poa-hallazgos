import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import './globals.css'
import { getPlans } from '@/lib/queries'
import { getFindingReports } from '@/lib/findings-queries'
import { AppShell } from '@/components/app-shell'

export const metadata: Metadata = {
  title: 'Informes de gestión · Acredicom R.L.',
  description:
    'Registro y seguimiento del Plan Operativo Anual de Cooperativa Acredicom R.L.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#07598a' },
    { media: '(prefers-color-scheme: dark)', color: '#061a2b' },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [plans, findingReports] = await Promise.all([getPlans(), getFindingReports()])
  return (
    <html lang="es">
      <body className="antialiased">
        <Suspense fallback={null}>
          <AppShell plans={plans} findingReports={findingReports}>{children}</AppShell>
        </Suspense>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
