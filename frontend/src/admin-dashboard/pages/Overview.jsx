import { useQuery } from '@tanstack/react-query';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import {
  Activity,
  BarChart2,
  Bot,
  Eye,
  ImageIcon,
  Palette,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';

import { analyticsApi } from '../../api/endpoints';
import { chartOptionsBase } from '../lib/chartConfig';
import { chartGradientGold } from '../theme/dashboardTheme';
import { fadeUp, scaleIn, stagger } from '../lib/animations';
import { truncate } from '../lib/cn';
import ChartCard from '../components/ui/ChartCard';
import MetricCard from '../components/ui/MetricCard';

const buildMetrics = overview => [
  { label: 'Total Users', value: overview?.users, icon: Users, color: 'blue', trend: +12 },
  { label: 'Paintings', value: overview?.paintings, icon: ImageIcon, color: 'indigo', trend: +8 },
  { label: 'Artists', value: overview?.artists, icon: Palette, color: 'violet', trend: +3 },
  { label: 'Total Views', value: overview?.totalViews, icon: Eye, color: 'cyan', trend: +24 },
  { label: 'AI Searches', value: overview?.searches, icon: Bot, color: 'emerald', trend: +31 },
  { label: 'Recognitions', value: overview?.recognitions, icon: Zap, color: 'amber', trend: +17 },
];

export default function Overview() {
  const overview = useQuery({ queryKey: ['an', 'overview'], queryFn: analyticsApi.overview });
  const mostViewed = useQuery({ queryKey: ['an', 'mostViewed'], queryFn: analyticsApi.mostViewed });
  const categories = useQuery({ queryKey: ['an', 'categories'], queryFn: analyticsApi.categories });
  const styles = useQuery({ queryKey: ['an', 'styles'], queryFn: analyticsApi.styles });
  const growth = useQuery({ queryKey: ['an', 'growth'], queryFn: analyticsApi.userGrowth });
  const metrics = buildMetrics(overview.data);

  return (
    <>
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8"
      >
        {metrics.map((metric, i) => (
          <motion.div key={metric.label} variants={fadeUp} custom={i}>
            <MetricCard {...metric} loading={overview.isLoading} />
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <motion.div variants={scaleIn}>
          <ChartCard
            title="Most Viewed Paintings"
            subtitle="Top paintings by view count"
            icon={<Eye size={16} />}
          >
            <Bar
              data={{
                labels: (mostViewed.data || []).map(p => truncate(p.title, 18)),
                datasets: [
                  {
                    data: (mostViewed.data || []).map(p => p.viewCount),
                    backgroundColor: 'rgba(212,175,95,0.88)',
                    borderRadius: 6,
                    borderSkipped: false,
                  },
                ],
              }}
              options={{ ...chartOptionsBase, indexAxis: 'y' }}
            />
          </ChartCard>
        </motion.div>

        <motion.div variants={scaleIn}>
          <ChartCard
            title="User Growth"
            subtitle="New registrations over 30 days"
            icon={<TrendingUp size={16} />}
          >
            <Line
              data={{
                labels: (growth.data || []).map(d => d.date.slice(5)),
                datasets: [
                  {
                    data: (growth.data || []).map(d => d.count),
                    borderColor: '#d4af5f',
                    backgroundColor: 'rgba(212,175,95,0.10)',
                    tension: 0.4,
                    pointRadius: 0,
                    fill: true,
                    borderWidth: 2,
                  },
                ],
              }}
              options={chartOptionsBase}
            />
          </ChartCard>
        </motion.div>

        <motion.div variants={scaleIn}>
          <ChartCard
            title="Popular Categories"
            subtitle="Distribution by view count"
            icon={<BarChart2 size={16} />}
          >
            <Doughnut
              data={{
                labels: (categories.data || []).map(c => c.category),
                datasets: [
                  {
                    data: (categories.data || []).map(c => c.views),
                    backgroundColor: chartGradientGold,
                    borderWidth: 0,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: { color: '#8a8a8a', font: { size: 11 }, padding: 16 },
                  },
                  tooltip: chartOptionsBase.plugins.tooltip,
                },
              }}
            />
          </ChartCard>
        </motion.div>

        <motion.div variants={scaleIn}>
          <ChartCard
            title="Trending Styles"
            subtitle="Average trending score by style"
            icon={<Activity size={16} />}
          >
            <Bar
              data={{
                labels: (styles.data || []).map(s => s.style),
                datasets: [
                  {
                    data: (styles.data || []).map(s => s.avgTrending),
                    backgroundColor: chartGradientGold,
                    borderRadius: 6,
                    borderSkipped: false,
                  },
                ],
              }}
              options={chartOptionsBase}
            />
          </ChartCard>
        </motion.div>
      </motion.div>
    </>
  );
}
