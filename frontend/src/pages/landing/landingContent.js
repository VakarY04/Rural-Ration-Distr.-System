import {
  ShieldCheck,
  Cpu,
  Users,
  ClipboardCheck,
  CalendarCheck,
  MessageSquareCode,
} from 'lucide-react';

// Layout-only data (icons, tiles, accents). All visible text is injected by
// LandingPage via t('landing.*') so the page is fully translatable — do NOT
// add English title/sub/heading/text fields here.
export const heroBadges = [
  {
    icon: ShieldCheck,
    tile: 'bg-orange-50 dark:bg-orange-950 text-[#FF9933] dark:text-orange-300 border border-orange-100',
    side: 'left',
  },
  {
    icon: Cpu,
    tile: 'bg-amber-50 dark:bg-amber-950 text-[#FF9933] dark:text-amber-300 border border-amber-100',
    side: 'neutral',
  },
  {
    icon: Users,
    tile: 'bg-blue-50 dark:bg-blue-950 text-[#000080] dark:text-blue-300 border border-blue-100',
    side: 'right',
  },
];

export const featureCards = [
  {
    icon: ClipboardCheck,
    accent: 'bg-[#FF9933]',
    iconTile: 'bg-orange-50 dark:bg-orange-950 text-[#FF9933] dark:text-orange-300 border border-orange-100',
    side: 'left',
  },
  {
    icon: CalendarCheck,
    accent: 'bg-[#138808]',
    iconTile: 'bg-green-50 dark:bg-green-950 text-[#138808] dark:text-green-300 border border-green-100',
    side: 'neutral',
  },
  {
    icon: MessageSquareCode,
    accent: 'bg-[#000080]',
    iconTile: 'bg-blue-50 dark:bg-blue-950 text-[#000080] dark:text-blue-300 border border-blue-100',
    side: 'right',
  },
];
