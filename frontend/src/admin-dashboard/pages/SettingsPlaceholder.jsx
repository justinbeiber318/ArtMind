import { Settings } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';

export default function SettingsPlaceholder() {
  return (
    <GlassCard className="flex flex-col items-center justify-center py-20 text-center">
      <Settings size={40} className="text-[#5f5f5f] mb-4" />
      <div className="text-[#b8aa7a] font-medium">Settings</div>
      <div className="text-[#8a8a8a] text-sm mt-1">
        Configuration panel coming soon.
      </div>
    </GlassCard>
  );
}
