import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
);

export const chartOptionsBase = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(7,7,7,0.95)',
      titleColor: '#f0e6c8',
      bodyColor: '#8a8a8a',
      borderColor: 'rgba(212,175,95,0.35)',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 10,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#8a8a8a', font: { size: 11 } },
    },
    y: {
      grid: { color: 'rgba(212,175,95,0.10)' },
      ticks: { color: '#8a8a8a', font: { size: 11 } },
      beginAtZero: true,
    },
  },
};
