import Skeleton from 'react-loading-skeleton';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeUp } from '../../lib/animations';
import GlassCard from './GlassCard';

export default function DataTable({ title, subtitle, icon, head, rows, loading, error }) {
  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-[#f0e6c8] font-semibold">
            {icon}
            {title}
          </div>
          {subtitle && (
            <div className="text-xs text-[#8a8a8a] mt-0.5">
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-[#8b2e2e]/15 border border-[#8b2e2e]/40 text-[#e28b8b] text-sm">
          <X size={16} className="flex-shrink-0" />
          {error}
        </div>
      )}

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#242424]">
                {head.map((h, i) => (
                  <th
                    key={i}
                    className="text-left px-5 py-3.5 text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-[#1a1a1a]">
                      {head.map((_, j) => (
                        <td key={j} className="px-5 py-3.5">
                          <Skeleton height={14} />
                        </td>
                      ))}
                    </tr>
                  ))
                : rows}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </motion.div>
  );
}
