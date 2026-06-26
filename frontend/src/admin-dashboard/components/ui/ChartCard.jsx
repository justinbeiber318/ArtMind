import { AnimatePresence, motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { scaleIn } from '../../lib/animations';

export default function ChartCard({ title, subtitle, icon, children }) {
  const { ref, inView } = useInView({ triggerOnce: true });

  return (
    <div ref={ref}>
      <AnimatePresence>
        {inView && (
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="bg-[#121212]/90 backdrop-blur-sm border border-[#242424] rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 text-[#f0e6c8] font-semibold text-sm">
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

            <div className="h-64">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
