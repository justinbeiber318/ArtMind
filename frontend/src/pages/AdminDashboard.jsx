import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, ArcElement, Tooltip, Legend,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { analyticsApi, userApi, paintingApi } from '../api/endpoints.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend);

const NAVY = '#1e3a5f';
const GRAYS = ['#1e3a5f', '#2c4a73', '#46638c', '#6b829f', '#9aabbf', '#c2ccd8'];

const baseOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { x: { grid: { display: false } }, y: { grid: { color: '#eee' }, beginAtZero: true } },
};

const TABS = ['Overview', 'Paintings', 'Users', 'AI Logs'];

export default function AdminDashboard() {
  const [tab, setTab] = useState('Overview');

  return (
    <>
      <div className="page-head">
        <div className="container">
          <div className="eyebrow">Administration</div>
          <h1>Admin dashboard</h1>
        </div>
      </div>

      <div className="container" style={{ borderBottom: '1px solid var(--border)', display: 'flex', gap: 4, marginTop: 24 }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              padding: '12px 18px', cursor: 'pointer', background: 'transparent',
              border: 'none', borderBottom: `2px solid ${tab === t ? NAVY : 'transparent'}`,
              color: tab === t ? NAVY : 'var(--muted)', fontWeight: tab === t ? 600 : 400,
              fontFamily: 'var(--font-body)', fontSize: '0.92rem',
            }}>{t}</button>
        ))}
      </div>

      <section className="section container">
        {tab === 'Overview' && <Overview />}
        {tab === 'Paintings' && <PaintingsTable />}
        {tab === 'Users' && <UsersTable />}
        {tab === 'AI Logs' && <AiLogs />}
      </section>
    </>
  );
}

function Overview() {
  const overview = useQuery({ queryKey: ['an', 'overview'], queryFn: analyticsApi.overview });
  const mostViewed = useQuery({ queryKey: ['an', 'mostViewed'], queryFn: analyticsApi.mostViewed });
  const categories = useQuery({ queryKey: ['an', 'categories'], queryFn: analyticsApi.categories });
  const styles = useQuery({ queryKey: ['an', 'styles'], queryFn: analyticsApi.styles });
  const growth = useQuery({ queryKey: ['an', 'growth'], queryFn: analyticsApi.userGrowth });

  const o = overview.data;

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 44 }}>
        <Metric label="Users" value={o?.users} />
        <Metric label="Paintings" value={o?.paintings} />
        <Metric label="Artists" value={o?.artists} />
        <Metric label="Total views" value={o?.totalViews} />
        <Metric label="AI searches" value={o?.searches} />
        <Metric label="Recognitions" value={o?.recognitions} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        <ChartCard title="Most viewed paintings">
          <Bar data={{
            labels: (mostViewed.data || []).map((p) => p.title),
            datasets: [{ data: (mostViewed.data || []).map((p) => p.viewCount), backgroundColor: NAVY }],
          }} options={{ ...baseOpts, indexAxis: 'y' }} />
        </ChartCard>

        <ChartCard title="User growth (30 days)">
          <Line data={{
            labels: (growth.data || []).map((d) => d.date.slice(5)),
            datasets: [{ data: (growth.data || []).map((d) => d.count), borderColor: NAVY, backgroundColor: NAVY, tension: 0.3, pointRadius: 0 }],
          }} options={baseOpts} />
        </ChartCard>

        <ChartCard title="Popular categories">
          <Doughnut data={{
            labels: (categories.data || []).map((c) => c.category),
            datasets: [{ data: (categories.data || []).map((c) => c.views), backgroundColor: GRAYS }],
          }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} />
        </ChartCard>

        <ChartCard title="Trending styles (avg score)">
          <Bar data={{
            labels: (styles.data || []).map((s) => s.style),
            datasets: [{ data: (styles.data || []).map((s) => s.avgTrending), backgroundColor: NAVY }],
          }} options={baseOpts} />
        </ChartCard>
      </div>
    </>
  );
}

function PaintingsTable() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'paintings'],
    queryFn: () => paintingApi.list({ limit: 25, sort: 'newest' }),
  });
  if (isLoading) return <div className="spinner" />;
  return (
    <Table head={['Title', 'Artist', 'Category', 'Style', 'Views']}>
      {(data?.data || []).map((p) => (
        <tr key={p.id}>
          <Td>{p.title}</Td><Td>{p.artist?.name}</Td><Td>{p.category?.name}</Td>
          <Td>{p.style?.name || '—'}</Td><Td>{p.viewCount?.toLocaleString()}</Td>
        </tr>
      ))}
    </Table>
  );
}

function UsersTable() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => userApi.list({ limit: 25 }),
  });
  if (isLoading) return <div className="spinner" />;
  return (
    <Table head={['Name', 'Email', 'Role', 'Joined']}>
      {(data?.data || []).map((u) => (
        <tr key={u.id}>
          <Td>{u.name}</Td><Td>{u.email}</Td>
          <Td><span className="tag">{u.role}</span></Td>
          <Td>{new Date(u.createdAt).toLocaleDateString()}</Td>
        </tr>
      ))}
    </Table>
  );
}

function AiLogs() {
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'ailogs'], queryFn: analyticsApi.aiLogs });
  if (isLoading) return <div className="spinner" />;
  return (
    <Table head={['User', 'Prompt', 'Response', 'Tokens', 'When']}>
      {(data || []).map((l) => (
        <tr key={l.id}>
          <Td>{l.user?.email || 'guest'}</Td>
          <Td style={{ maxWidth: 240 }}>{truncate(l.prompt, 90)}</Td>
          <Td style={{ maxWidth: 280 }}>{truncate(l.response, 110)}</Td>
          <Td>{l.tokensUsed ?? '—'}</Td>
          <Td>{new Date(l.createdAt).toLocaleString()}</Td>
        </tr>
      ))}
    </Table>
  );
}

const truncate = (s, n) => (s && s.length > n ? `${s.slice(0, n)}…` : s || '');

function Metric({ label, value }) {
  return (
    <div style={{ border: '1px solid var(--border)', padding: '20px 22px' }}>
      <div className="muted" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', marginTop: 6 }}>
        {value != null ? Number(value).toLocaleString() : '—'}
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div style={{ border: '1px solid var(--border)', padding: 24 }}>
      <h4 style={{ fontWeight: 500, marginBottom: 18 }}>{title}</h4>
      <div style={{ height: 280 }}>{children}</div>
    </div>
  );
}

function Table({ head, children }) {
  return (
    <div style={{ overflowX: 'auto', border: '1px solid var(--border)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
        <thead>
          <tr style={{ background: 'var(--light-gray)' }}>
            {head.map((h) => (
              <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: '0.74rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Td({ children, style }) {
  return <td style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', verticalAlign: 'top', ...style }}>{children}</td>;
}
