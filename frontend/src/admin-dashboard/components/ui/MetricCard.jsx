import CountUp from 'react-countup';
import Skeleton from 'react-loading-skeleton';
import Tilt from 'react-parallax-tilt';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

import { cn } from '../../lib/cn';
import { colorMap } from '../../theme/dashboardTheme';

export default function MetricCard({ label, value, icon: Icon, color = 'blue', trend, loading }) {
  const { ref, inView } = useInView({ triggerOnce: true });
  const c = colorMap[color] || colorMap.blue;

  return (
    <div ref={ref}>
      <Tilt
        tiltMaxAngleX={8}
        tiltMaxAngleY={8}
        glareEnable
        glareMaxOpacity={0.06}
        scale={1.02}
        transitionSpeed={600}
      >
        <motion.div
          whileHover={{ y: -3, boxShadow: '0 20px 40px rgba(0,0,0,0.35)' }}
          className="relative bg-[#121212]/90 backdrop-blur-sm border border-[#242424] rounded-2xl p-4 shadow-sm overflow-hidden group cursor-default"
        >
          <div
            className={cn(
              'absolute -top-6 -right-6 w-16 h-16 rounded-full opacity-20 bg-gradient-to-br',
              c.grad,
            )}
          />

          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', c.bg)}>
            <Icon size={18} className={c.icon} />
          </div>

          <div className="text-2xl font-bold text-[#f0e6c8] leading-none mb-1">
            {loading ? (
              <Skeleton width={60} />
            ) : inView && value != null ? (
              <CountUp end={Number(value)} duration={1.8} separator="," />
            ) : value != null ? (
              Number(value).toLocaleString()
            ) : (
              '—'
            )}
          </div>

          <div className="text-xs text-[#8a8a8a] mb-2">{label}</div>

          {trend != null && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs font-medium',
                trend >= 0 ? 'text-[#6fbf73]' : 'text-[#e28b8b]',
              )}
            >
              {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {trend > 0 ? '+' : ''}
              {trend}% this month
            </div>
          )}
        </motion.div>
      </Tilt>
    </div>
  );
}
