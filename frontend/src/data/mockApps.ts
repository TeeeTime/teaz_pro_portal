import type { AppStat, ProgressRow, StatusRow } from '@teeetime/teaz-pro-ui'
import type { CalendarToday } from '@/data/calendarToday'
import type { FitnessLatestRun, FitnessWeekly } from '@/data/fitnessRuns'
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
  variant?: 'stat' | 'calendar' | 'form' | 'search' | 'status' | 'progress' | 'transit' | 'fitness-latest' | 'fitness-weekly'
  stat?: AppStat
  calendar?: CalendarToday
  statuses?: StatusRow[]
  progress?: ProgressRow[]
  transit?: TransitBoard
  fitnessLatest?: FitnessLatestRun
  fitnessWeekly?: FitnessWeekly
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

/*
 * The grid fills in this order (dense flow, 5 columns), which gives, at full
 * width:
 *
 *   row 1  Latest run | Weekly km (2x2) . | Study     | Status (1x2)
 *   row 2  Inventory  | .               . | Transit   | .
 *   row 3  Analytics (2x2)  . | CRM       | Calendar (2x1)    .
 *   row 4  .                . | Docs      | Messaging | Reports (1x2)
 *   row 5  File Vault | Admin | Settings  | Search    | .
 *
 * Changing the order or a span moves the tiles after it; check the layout.
 */

// Twelve Mondays up to the current week, for the Weekly km mock bars.
const MOCK_WEEK_KM = [32.4, 35.1, 28.0, 38.6, 41.2, 22.5, 36.8, 40.1, 43.0, 34.7, 37.3, 8.4]
const mockWeeks = MOCK_WEEK_KM.map((km, i) => ({
  weekStart: new Date(Date.UTC(2026, 6, 27 + i * 7)).toISOString().slice(0, 10),
  km,
}))

/**
 * Placeholder entry points until real ecosystem apps are wired up.
 * `href` targets are not live yet.
 */
export const mockApps: EcosystemApp[] = [
  /*
   * Live from Fitness's /api/runs/latest and /api/runs/weekly in builds (see
   * fitnessRuns.ts); this mock data only shows in npm run dev.
   */
  {
    id: 'fitness-latest',
    name: 'Latest run',
    description: 'Your latest run from Strava.',
    icon: 'run',
    href: 'https://fitness.teaz.pro',
    variant: 'fitness-latest',
    fitnessLatest: {
      run: { name: 'Long Run', date: 'Sun 18 Oct', distance: '17.8', detail: '5:33 /km · 1:38:32' },
      emptyText: 'Connect Strava in Fitness.',
      attribution: 'Sample data',
    },
  },
  {
    id: 'fitness-weekly',
    name: 'Weekly km',
    description: 'Kilometers per week from Strava.',
    icon: 'run',
    href: 'https://fitness.teaz.pro',
    colSpan: 2,
    rowSpan: 2,
    variant: 'fitness-weekly',
    fitnessWeekly: {
      weeks: mockWeeks,
      thisWeek: '8.4',
      lastWeek: '37.3',
      emptyText: 'Connect Strava in Fitness.',
      attribution: 'Sample data',
    },
  },
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
   * Last column, first two rows. Live rows come from Teaz Pulse in builds
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
  { id: 'inventory', name: 'Inventory', description: 'Stock and warehouse tracking.', icon: 'box', href: '#' },
  /*
   * Second row, fourth column. Live departures come from Teaz Transit in
   * builds (see transitBoard.ts); these mock rows only show in npm run dev.
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
  { id: 'crm', name: 'CRM', description: 'Customer relationships and leads.', icon: 'person', href: '#' },
  /*
   * Third row, fourth and fifth column (2x1). Live from Calendar's
   * /api/events/today in builds (see calendarToday.ts); this mock data only
   * shows in npm run dev.
   */
  {
    id: 'calendar',
    name: 'Calendar',
    description: 'Your events today.',
    icon: 'calendar',
    href: 'https://calendar.teaz.pro',
    colSpan: 2,
    variant: 'calendar',
    calendar: {
      date: 'Fri 23 Oct',
      events: [
        { key: '1', title: 'Team offsite', allDay: true, time: '', color: '#f59e0b', start: 0, end: 1440 },
        { key: '2', title: 'Standup', allDay: false, time: '09:00–09:15', color: '#f59e0b', start: 540, end: 555 },
        { key: '3', title: 'Retro', allDay: false, time: '15:00–16:00', color: '#f59e0b', start: 900, end: 960 },
        { key: '4', title: 'Dinner with friends', allDay: false, time: '19:30–22:30', color: '#10b981', start: 1170, end: 1350 },
      ],
      emptyText: 'Connect your Apple calendar in Calendar.',
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
