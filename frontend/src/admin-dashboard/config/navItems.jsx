import {
  Bot,
  ImageIcon,
  LayoutDashboard,
  Palette,
  Settings,
  Users,
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'Overview', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'Paintings', label: 'Paintings', Icon: ImageIcon },
  { id: 'Artists', label: 'Artists', Icon: Palette },
  { id: 'Users', label: 'Users', Icon: Users },
  { id: 'AI Logs', label: 'AI Logs', Icon: Bot },
  { id: 'Settings', label: 'Settings', Icon: Settings },
];
