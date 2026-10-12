'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  ListTree,
  Table2,
  Settings2,
  FolderKanban,
  ClipboardCheck,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react'
import type { Plan } from '@/lib/types'
import type { FindingReport } from '@/lib/findings'
import { resolveFindingReportId } from '@/lib/findings'
import { cn } from '@/lib/utils'

const PANEL_NAV = { href: '/', label: 'Panel', icon: LayoutDashboard }
const POA_NAV = [
  { href: '/estructura', label: 'Estructura', icon: ListTree },
  { href: '/reporte', label: 'Reporte', icon: Table2 },
  { href: '/configuracion', label: 'Configuración', icon: Settings2 },
]
const FINDINGS_NAV = [
  { href: '/hallazgos/estructura', label: 'Estructura', icon: ListTree },
  { href: '/hallazgos/reporte', label: 'Reporte', icon: Table2 },
  { href: '/hallazgos/configuracion', label: 'Configuración', icon: Settings2 },
]

export function AppShell({
  plans,
  findingReports,
  children,
}: {
  plans: Plan[]
  findingReports: FindingReport[]
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const poaActive = POA_NAV.some((item) => pathname.startsWith(item.href))
  const findingsActive = pathname.startsWith('/hallazgos')
  const [poaOpen, setPoaOpen] = React.useState(poaActive)
  const [findingsOpen, setFindingsOpen] = React.useState(findingsActive)

  const currentPlanId =
    searchParams.get('plan') ??
    (plans.length ? String(plans[plans.length - 1].id) : '')
  const resolvedFindingReportId = resolveFindingReportId(findingReports, searchParams.get('informe') ?? undefined)
  const currentFindingReportId = resolvedFindingReportId ? String(resolvedFindingReportId) : ''

  const withPlan = React.useCallback(
    (href: string) =>
      currentPlanId ? `${href}?plan=${currentPlanId}` : href,
    [currentPlanId],
  )

  const withFindingReport = (href: string) =>
    currentFindingReportId ? `${href}?informe=${currentFindingReportId}` : href

  function onPlanChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(Array.from(searchParams.entries()))
    params.set('plan', e.target.value)
    router.push(`${pathname}?${params.toString()}`)
  }

  function onFindingReportChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(Array.from(searchParams.entries()))
    params.set('informe', e.target.value)
    router.push(`${pathname}?${params.toString()}`)
  }

  React.useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  React.useEffect(() => {
    if (poaActive) setPoaOpen(true)
  }, [poaActive])

  React.useEffect(() => {
    if (findingsActive) setFindingsOpen(true)
  }, [findingsActive])

  const navLink = (item: typeof PANEL_NAV) => {
    const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
    const Icon = item.icon
    return (
      <Link
        key={item.href}
        href={item.href.startsWith('/hallazgos') ? withFindingReport(item.href) : withPlan(item.href)}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500',
          active
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
        )}
        aria-current={active ? 'page' : undefined}
      >
        <Icon size={18} className={active ? 'text-teal-500' : ''} aria-hidden="true" />
        {item.label}
      </Link>
    )
  }

  const nav = (id: 'desktop' | 'mobile') => (
    <nav className="flex flex-col gap-1" aria-label="Navegación principal">
      {navLink(PANEL_NAV)}
      <div>
        <button
          type="button"
          onClick={() => setPoaOpen((open) => !open)}
          aria-expanded={poaOpen}
          aria-controls={`poa-subnav-${id}`}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500',
            poaActive ? 'text-sidebar-accent-foreground' : 'text-muted-foreground',
          )}
        >
          <FolderKanban size={18} className={poaActive ? 'text-teal-500' : ''} aria-hidden="true" />
          <span className="flex-1">POA</span>
          <ChevronDown size={16} className={cn('transition-transform', poaOpen && 'rotate-180')} aria-hidden="true" />
        </button>
        <div id={`poa-subnav-${id}`} hidden={!poaOpen} className="ml-5 mt-1 space-y-1 border-l border-sidebar-border pl-3">
          {POA_NAV.map(navLink)}
        </div>
      </div>
      <div>
        <button
          type="button"
          onClick={() => setFindingsOpen((open) => !open)}
          aria-expanded={findingsOpen}
          aria-controls={`findings-subnav-${id}`}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500',
            findingsActive ? 'text-sidebar-accent-foreground' : 'text-muted-foreground',
          )}
        >
          <ClipboardCheck size={18} className={findingsActive ? 'text-teal-500' : ''} aria-hidden="true" />
          <span className="flex-1">Hallazgos</span>
          <ChevronDown size={16} className={cn('transition-transform', findingsOpen && 'rotate-180')} aria-hidden="true" />
        </button>
        <div id={`findings-subnav-${id}`} hidden={!findingsOpen} className="ml-5 mt-1 space-y-1 border-l border-sidebar-border pl-3">
          {FINDINGS_NAV.map(navLink)}
        </div>
      </div>
    </nav>
  )

  const brand = (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-700 via-cyan-600 to-teal-500 text-sm font-bold text-white shadow-sm">
        A
      </div>
      <div className="leading-tight">
        <p className="text-sm font-bold text-foreground">Informes de gestión</p>
        <p className="text-[11px] text-muted-foreground">Acredicom R.L.</p>
      </div>
    </div>
  )

  const planSelect = plans.length > 0 && !findingsActive && (
    <div className="relative">
      <select
        value={currentPlanId}
        onChange={onPlanChange}
        aria-label="Seleccionar Plan Operativo Anual"
        className="h-10 w-full appearance-none rounded-lg border border-input bg-card px-3 pr-8 text-sm font-medium text-foreground focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
      >
        {plans.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  )

  const findingReportSelect = findingReports.length > 0 && findingsActive && (
    <div className="relative">
      <select
        value={currentFindingReportId}
        onChange={onFindingReportChange}
        aria-label="Seleccionar informe de hallazgos"
        className="h-10 w-full appearance-none rounded-lg border border-input bg-card px-3 pr-8 text-sm font-medium text-foreground focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
      >
        {findingReports.map((report) => <option key={report.id} value={report.id}>{report.name}</option>)}
      </select>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex h-16 items-center border-b border-sidebar-border px-5">
          {brand}
        </div>
        <div className="border-b border-sidebar-border px-4 py-4">
          <p className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {findingsActive ? 'Informe vigente' : 'Plan vigente'}
          </p>
          {findingsActive ? findingReports.length ? findingReportSelect : <p className="px-1 text-xs text-muted-foreground">Sin informes registrados</p> : planSelect}
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">{nav('desktop')}</div>
        <div className="border-t border-sidebar-border px-5 py-4">
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Plan Operativo Anual y seguimiento de hallazgos
          </p>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-sidebar shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
              {brand}
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Cerrar menú"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
              >
                <X size={18} />
              </button>
            </div>
            <div className="border-b border-sidebar-border px-4 py-4">
              <p className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {findingsActive ? 'Informe vigente' : 'Plan vigente'}
              </p>
              {findingsActive ? findingReports.length ? findingReportSelect : <p className="px-1 text-xs text-muted-foreground">Sin informes registrados</p> : planSelect}
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">{nav('mobile')}</div>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
            className="rounded-lg p-2 text-foreground hover:bg-muted"
          >
            <Menu size={20} />
          </button>
          {brand}
        </header>
        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  )
}
