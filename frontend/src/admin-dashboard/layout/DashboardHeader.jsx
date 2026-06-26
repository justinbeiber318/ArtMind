import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { BarChart2, Zap } from 'lucide-react';

import { fadeUp } from '../lib/animations';
import GlassButton from '../components/ui/GlassButton';

export default function DashboardHeader() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const today = format(new Date(), 'EEEE, MMMM d, yyyy');

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-xs text-[#8a8a8a] uppercase tracking-widest mb-1">
            {today}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#f0e6c8] tracking-tight">
            {greeting}, Admin{' '}
            <span className="inline-block animate-wave origin-[70%_70%]">👋</span>
          </h1>

          <p className="text-[#8a8a8a] text-sm mt-1">
            Manage your museum archive efficiently.
          </p>
        </div>

        <div className="flex gap-2">
          <GlassButton icon={<Zap size={14} />}>Quick Actions</GlassButton>
          <GlassButton icon={<BarChart2 size={14} />} primary>
            Export Report
          </GlassButton>
        </div>
      </div>
    </motion.div>
  );
}
