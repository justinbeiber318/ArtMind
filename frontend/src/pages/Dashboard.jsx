import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { userApi } from '../api/endpoints.js';
import { selectUser } from '../features/auth/authSlice.js';
import PaintingCard from '../components/PaintingCard.jsx';

export default function Dashboard() {
  const user = useSelector(selectUser);
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: userApi.dashboard });

  if (isLoading) return <div className="spinner" />;

  const { recentlyViewed = [], favorites = [], recommendations = [], collections = [], activity = [] } = data || {};

  return (
    <>
      <div className="page-head">
        <div className="container">
          <div className="eyebrow">Your space</div>
          <h1>Welcome back, {user?.name?.split(' ')[0] || 'collector'}</h1>
        </div>
      </div>

      <section className="section container" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 56, alignItems: 'start' }}>
        <div>
          <Row title="Recommended for you" items={recommendations} empty="Browse and favorite a few works to seed your recommendations." />
          <Row title="Recently viewed" items={recentlyViewed} empty="Nothing viewed yet." />
          <Row title="Your favorites" items={favorites} empty="You haven't saved any favorites." link="/favorites" linkLabel="View all" />

          <div style={{ marginTop: 8 }}>
            <h2 style={{ marginBottom: 18 }}>Personal collections</h2>
            {collections.length === 0 ? (
              <p className="muted">No collections yet.</p>
            ) : (
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                {collections.map((c) => (
                  <div key={c.id} style={{ border: '1px solid var(--border)', padding: 20 }}>
                    <h4 style={{ fontWeight: 500 }}>{c.name}</h4>
                    <p className="muted" style={{ fontSize: '0.85rem', marginTop: 4 }}>{c._count?.items ?? 0} works</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Activity timeline */}
        <aside>
          <h4 style={{ fontWeight: 500, marginBottom: 16 }}>Activity</h4>
          {activity.length === 0 ? (
            <p className="muted" style={{ fontSize: '0.85rem' }}>No recent activity.</p>
          ) : (
            <ul style={{ listStyle: 'none', borderLeft: '1px solid var(--border)', paddingLeft: 18 }}>
              {activity.map((a) => (
                <li key={a.id} style={{ marginBottom: 18, position: 'relative' }}>
                  <span style={{ position: 'absolute', left: -23, top: 6, width: 7, height: 7, background: 'var(--navy)', borderRadius: '50%' }} />
                  <div style={{ fontSize: '0.88rem' }}>Viewed <strong style={{ fontWeight: 500 }}>{a.painting?.title}</strong></div>
                  <div className="muted" style={{ fontSize: '0.74rem' }}>{new Date(a.viewedAt).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </section>
    </>
  );
}

function Row({ title, items, empty, link, linkLabel }) {
  return (
    <div style={{ marginBottom: 44 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
        <h2>{title}</h2>
        {link && <Link to={link} className="muted" style={{ fontSize: '0.85rem' }}>{linkLabel} →</Link>}
      </div>
      {items.length === 0 ? (
        <p className="muted">{empty}</p>
      ) : (
        <div className="grid grid--cards">
          {items.slice(0, 4).map((p, i) => <PaintingCard key={p.id} painting={p} index={i} />)}
        </div>
      )}
    </div>
  );
}
