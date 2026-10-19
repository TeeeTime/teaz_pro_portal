import type { AgendaEvent, AppStat, ProgressRow, StatusRow } from '@teeetime/teaz-pro-ui'
import type { TransitBoard } from '@/data/transitBoard'

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
  variant?: 'stat' | 'agenda' | 'form' | 'search' | 'status' | 'progress' | 'transit'
  stat?: AppStat
  events?: AgendaEvent[]
  statuses?: StatusRow[]
  progress?: ProgressRow[]
  transit?: TransitBoard
  /**
   * Keycloak realm role needed to open the app. Purely cosmetic: the app
   * itself enforces the role.
   */
  requiredRole?: string
  /**
   * Without requiredRole: 'show' (default) keeps the tile's content, just not
   * clickable (Status: health is public). 'locked' replaces it with a
   * NoAccessTile (Study: the content is the user's own data in that app).
   */
  withoutRole?: 'show' | 'locked'
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
  /*
   * Live rows from Study's /api/overview in builds (see studyOverview.ts);
   * these mock rows only show in npm run dev.
   */
  {
    id: 'study',
    name: 'Study',
    description: 'Your courses and learning progress.',
    icon: 'study',
    href: 'https://study.teaz.pro',
    variant: 'progress',
    requiredRole: 'study-user',
    withoutRole: 'locked',
    progress: [
      { label: 'Operations Research', percent: 64 },
      { label: 'Lineare Algebra', percent: 12 },
      { label: 'Statistik II', percent: 0 },
    ],
  },
  /*
   * Placed right after study so dense flow puts it in the last column,
   * spanning the first two rows. Live rows come from Teaz Pulse in builds
   * (see pulseHealth.ts); these mock rows only show in npm run dev.
   */
  {
    id: 'status',
    name: 'Status',
    description: 'Service health and uptime.',
    icon: 'pulse',
    href: 'https://pulse.teaz.pro',
    // Pulse's container view needs it; the health rows here don't.
    requiredRole: 'pulse-admin',
    rowSpan: 2,
    variant: 'status',
    statuses: [
      { label: 'Demo', state: 'critical', detail: '(0/1)' },
      { label: 'Portal', state: 'warning', detail: '(2/2)' },
      { label: 'Keycloak', state: 'good', detail: '(2/2)' },
      { label: 'Pulse', state: 'good', detail: '(3/3)' },
      { label: 'Traefik', state: 'good' },
    ],
  },
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
  /*
   * Second row, fourth column: Scheduler (2 wide) doesn't fit there, so dense
   * flow fills the gap with this 1x1 tile. Live departures come from Teaz
   * Transit in builds (see transitBoard.ts); these mock rows only show in npm
   * run dev.
   */
  {
    id: 'transit',
    name: 'Transit',
    description: 'Next departures at your stop.',
    icon: 'calendar',
    href: 'https://transit.teaz.pro',
    variant: 'transit',
    transit: {
      station: 'Münster Hauptbahnhof',
      departures: [
        { key: '1', time: '08:04', line: 'RE 7', destination: 'Krefeld Hbf', delay: 3 },
        { key: '2', time: '08:06', line: '11', destination: 'Tannenhof' },
        { key: '3', time: '08:09', line: 'RB 66', destination: 'Osnabrück Hbf', canceled: true },
        { key: '4', time: '08:12', line: 'S75', destination: 'Bocholt, Bustreff' },
        { key: '5', time: '08:15', line: 'ICE 41', destination: 'Dortmund Hbf' },
      ],
      emptyText: 'Pick your stop in Transit.',
      attribution: 'Sample data',
    },
  },
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
    id: 'search',
    name: 'Search',
    description: 'Find anything across the ecosystem.',
    icon: 'search',
    href: '#',
    variant: 'search',
  },
]
