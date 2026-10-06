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
    tile: 'bg-orange-50 text-[#FF9933] border border-orange-100',
    side: 'left',
  },
  {
    icon: Cpu,
    tile: 'bg-amber-50 text-[#FF9933] border border-amber-100',
    side: 'neutral',
  },
  {
    icon: Users,
    tile: 'bg-blue-50 text-[#000080] border border-blue-100',
    side: 'right',
  },
];

export const featureCards = [
  {
    icon: ClipboardCheck,
    accent: 'bg-[#FF9933]',
    iconTile: 'bg-orange-50 text-[#FF9933] border border-orange-100',
    side: 'left',
  },
  {
    icon: CalendarCheck,
    accent: 'bg-[#138808]',
    iconTile: 'bg-green-50 text-[#138808] border border-green-100',
    side: 'neutral',
  },
  {
    icon: MessageSquareCode,
    accent: 'bg-[#000080]',
    iconTile: 'bg-blue-50 text-[#000080] border border-blue-100',
    side: 'right',
  },
];
