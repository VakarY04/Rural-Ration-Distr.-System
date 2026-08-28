import {
  ShieldCheck,
  Cpu,
  Users,
  ClipboardCheck,
  CalendarCheck,
  MessageSquareCode,
} from 'lucide-react';

export const heroBadges = [
  {
    icon: ShieldCheck,
    title: 'Transparent',
    sub: 'End-to-end trace tracking',
    tile: 'bg-orange-50 text-[#FF9933] border border-orange-100',
    side: 'left',
  },
  {
    icon: Cpu,
    title: 'Technology Driven',
    sub: 'Smart dynamic matching',
    tile: 'bg-amber-50 text-[#FF9933] border border-amber-100',
    side: 'neutral',
  },
  {
    icon: Users,
    title: 'People First',
    sub: 'Citizen-centric workflows',
    tile: 'bg-blue-50 text-[#000080] border border-blue-100',
    side: 'right',
  },
];

export const featureCards = [
  {
    icon: ClipboardCheck,
    heading: 'Smart Quota Allocations',
    accent: 'bg-[#FF9933]',
    iconTile: 'bg-orange-50 text-[#FF9933] border border-orange-100',
    text:
      'AI-powered allocation engine ensures accurate and fair distribution of ration based on eligibility, priority, and availability.',
    side: 'left',
  },
  {
    icon: CalendarCheck,
    heading: 'Secure Slot Booking',
    accent: 'bg-[#138808]',
    iconTile: 'bg-green-50 text-[#138808] border border-green-100',
    text:
      'Book your ration collection slot online and skip long queues. Choose your preferred time, hassle-free.',
    side: 'neutral',
  },
  {
    icon: MessageSquareCode,
    heading: 'Multilingual AI Grievance Bridge',
    accent: 'bg-[#000080]',
    iconTile: 'bg-blue-50 text-[#000080] border border-blue-100',
    text:
      'Report issues or get help in your language. Our AI assistant understands and resolves your concerns, 24/7.',
    side: 'right',
  },
];
