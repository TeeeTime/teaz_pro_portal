import type { AgendaEvent, AppStat, StatusRow } from '@teeetime/teaz-pro-ui'

export interface EcosystemApp {
  id: string
  name: string
  description: string
  /** Name of an icon from teaz_pro_ui's Icon component — never an emoji. */
  icon: string
  href: string
  colSpan?: number
  rowSpan?: number
  /**
   * Which widget renders this tile's content. Unset = the default simple
   * launcher (AppTile: icon, name, description). Every variant beyond that
   * is a preview of the kind of richer content a real app might surface on
   * its dashboard tile — still presentational only, no logic/fetching.
   */
  variant?: 'stat' | 'agenda' | 'form' | 'search' | 'status'
  stat?: AppStat
  events?: AgendaEvent[]
  statuses?: StatusRow[]
}

/**
 * Placeholder entry points until real ecosystem apps are wired up.
 * `href` targets are not live yet.
 */
export const mockApps: EcosystemApp[] = [
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Usage trends and reporting across the ecosystem.',
    icon: 'analytics',
    href: '#',
    colSpan: 2,
    rowSpan: 2,
    variant: 'stat',
    stat: {
      value: '12.9K',
      deltaLabel: '+8.2% vs last week',
      deltaGood: true,
      trend: [20, 22, 19, 25, 28, 26, 30, 29, 33, 31, 35, 38],
    },
  },
  { id: 'inventory', name: 'Inventory', description: 'Stock and warehouse tracking.', icon: 'box', href: '#' },
  { id: 'billing', name: 'Billing', description: 'Invoices and payment history.', icon: 'card', href: '#' },
  { id: 'crm', name: 'CRM', description: 'Customer relationships and leads.', icon: 'person', href: '#' },
  {
    id: 'scheduler',
    name: 'Scheduler',
    description: 'Shared calendars and bookings.',
    icon: 'calendar',
    href: '#',
    colSpan: 2,
    variant: 'agenda',
    events: [
      { time: '10:00', title: 'Team sync' },
      { time: '14:30', title: 'Client call' },
    ],
  },
  { id: 'support', name: 'Support Desk', description: 'Customer support tickets.', icon: 'headset', href: '#' },
  { id: 'docs', name: 'Docs', description: 'Internal documentation.', icon: 'docs', href: '#' },
  { id: 'messaging', name: 'Messaging', description: 'Team chat and notifications.', icon: 'chat', href: '#' },
  {
    id: 'reports',
    name: 'Reports',
    description: 'Exportable business reports.',
    icon: 'report',
    href: '#',
    rowSpan: 2,
    variant: 'form',
  },
  { id: 'files', name: 'File Vault', description: 'Shared document storage.', icon: 'archive', href: '#' },
  { id: 'admin', name: 'Admin', description: 'User and role management.', icon: 'shield', href: '#' },
  { id: 'settings', name: 'Settings', description: 'Ecosystem-wide configuration.', icon: 'gear', href: '#' },
  {
    id: 'status',
    name: 'Status',
    description: 'Service health and uptime.',
    icon: 'pulse',
    href: 'https://pulse.teaz.pro',
    variant: 'status',
    statuses: [
      { label: 'API', state: 'good' },
      { label: 'Database', state: 'good' },
      { label: 'Queue', state: 'warning' },
    ],
  },
  {
    id: 'search',
    name: 'Search',
    description: 'Find anything across the ecosystem.',
    icon: 'search',
    href: '#',
    variant: 'search',
  },
  {
    id: 'notifications',
    name: 'Notifications',
    description: 'Cross-app alerts and activity.',
    icon: 'bell',
    href: '#',
  },
]
