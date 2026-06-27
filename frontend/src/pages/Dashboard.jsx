import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { favoriteApi, paintingApi, recognitionApi, userApi } from '../api/endpoints.js';
import { selectUser } from '../features/auth/authSlice.js';
import PaintingCard from '../components/PaintingCard.jsx';

const dashboardMenu = [
  ['overview', 'Overview'],
  ['favorites', 'Favorites'],
  ['recently-viewed', 'Recently Viewed'],
  ['ai-recommendations', 'Recommendations'],
  ['my-uploads', 'My Uploads'],
  ['recognition-history', 'Recognition History'],
];

export default function Dashboard() {
  const user = useSelector(selectUser);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: userApi.dashboard });
  const uploads = useQuery({ queryKey: ['paintings', 'mine'], queryFn: paintingApi.mine });
  const recognitionHistory = useQuery({ queryKey: ['recognition-history'], queryFn: recognitionApi.history });
  const deleteRecognition = useMutation({
    mutationFn: (id) => recognitionApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recognition-history'] }),
  });
  const removeFavorite = useMutation({
    mutationFn: (paintingId) => favoriteApi.toggle(paintingId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  if (isLoading) return <div className="spinner" />;

  const {
    recentlyViewed = [],
    favorites = [],
    recommendations = [],
    collections = [],
    activity = [],
  } = data || {};
  const myUploads = uploads.data || [];

  return (
    <>
      <div className="page-head">
        <div className="container">
          <div className="eyebrow">Your space</div>
          <h1>Welcome back, {user?.name?.split(' ')[0] || 'collector'}</h1>
        </div>
      </div>

      <section className="section container dashboard-shell">
        <aside className="dashboard-menu" aria-label="Dashboard sections">
          {dashboardMenu.map(([id, label]) => (
            <a key={id} className="dashboard-menu__item" href={`#${id}`}>
              {label}
            </a>
          ))}
        </aside>

        <div className="dashboard-content">
          <section id="overview" className="dashboard-section">
            <div className="dashboard-section__head">
              <h2>Overview</h2>
            </div>
            <div className="dashboard-stats">
              <Stat label="Favorites" value={favorites.length} />
              <Stat label="Recently Viewed" value={recentlyViewed.length} />
              <Stat label="Recommendations" value={recommendations.length} />
              <Stat label="My Uploads" value={myUploads.length} />
            </div>

            <div className="dashboard-collections">
              <h3>Personal collections</h3>
              {collections.length === 0 ? (
                <p className="muted">No collections yet.</p>
              ) : (
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                  {collections.map((c) => (
                    <div key={c.id} style={{ border: '1px solid var(--border)', padding: 20 }}>
                      <h4 style={{ fontWeight: 500 }}>{c.name}</h4>
                      <p className="muted" style={{ fontSize: '0.85rem', marginTop: 4 }}>
                        {c._count?.items ?? 0} works
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section id="favorites" className="dashboard-section">
            <Row
              title="Favorites"
              items={favorites}
              empty="You haven't saved any favorites."
              link="/favorites"
              linkLabel="View all"
              renderAction={(painting) => (
                <button
                  type="button"
                  className="btn btn--ghost favorite-card__remove"
                  onClick={() => removeFavorite.mutate(painting.id)}
                  disabled={removeFavorite.isPending}
                >
                  Remove favorite
                </button>
              )}
            />
          </section>

          <section id="recently-viewed" className="dashboard-section">
            <Row title="Recently Viewed" items={recentlyViewed} empty="Nothing viewed yet." />
          </section>

          <section id="ai-recommendations" className="dashboard-section">
            <Row
              title="Recommendations"
              items={recommendations}
              empty="Browse and favorite a few works to seed your recommendations."
            />
          </section>

          <section id="my-uploads" className="dashboard-section">
            <Row
              title="My Uploads"
              items={myUploads}
              empty="You haven't uploaded any artworks yet."
              link="/upload"
              linkLabel="Upload artwork"
            />
          </section>

          <section id="recognition-history" className="dashboard-section">
            <div className="dashboard-section__head">
              <h2>Recognition History</h2>
              <Link to="/ai-recognition" className="muted">Run recognition -&gt;</Link>
            </div>
            <RecognitionHistory
              items={recognitionHistory.data || []}
              isLoading={recognitionHistory.isLoading}
              onDelete={(id) => deleteRecognition.mutate(id)}
              isDeleting={deleteRecognition.isPending}
            />
          </section>
        </div>

        <aside className="dashboard-activity">
          <h4 style={{ fontWeight: 500, marginBottom: 16 }}>Activity</h4>
          {activity.length === 0 ? (
            <p className="muted" style={{ fontSize: '0.85rem' }}>No recent activity.</p>
          ) : (
            <ul style={{ listStyle: 'none', borderLeft: '1px solid var(--border)', paddingLeft: 18 }}>
              {activity.map((a) => (
                <li key={a.id} style={{ marginBottom: 18, position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: -23,
                    top: 6,
                    width: 7,
                    height: 7,
                    background: 'var(--navy)',
                    borderRadius: '50%',
                  }}
                  />
                  <div style={{ fontSize: '0.88rem' }}>
                    Viewed <strong style={{ fontWeight: 500 }}>{a.painting?.title}</strong>
                  </div>
                  <div className="muted" style={{ fontSize: '0.74rem' }}>
                    {new Date(a.viewedAt).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </section>
    </>
  );
}

function Stat({ label, value }) {
  return (
    <div className="dashboard-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function RecognitionHistory({ items, isLoading, onDelete, isDeleting }) {
  if (isLoading) return <div className="spinner" />;
  if (items.length === 0) return <p className="muted">No recognition history yet.</p>;

  return (
    <div className="recognition-history-list">
      {items.map((item) => (
        <article key={item.id} className="recognition-history-row">
          <img src={item.thumbnailUrl || item.imageUrl} alt="" />
          <div>
            <h3>{item.style || 'Unknown style'}</h3>
            <p className="muted">{new Date(item.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <span className="tag">{item.category || 'Unknown category'}</span>
          </div>
          <div className="recognition-history-row__actions">
            <Link className="btn btn--ghost" to={`/ai-recognition?result=${item.id}`}>View Result</Link>
            <button className="btn btn--ghost" type="button" onClick={() => onDelete(item.id)} disabled={isDeleting}>
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

function Row({ title, items, empty, link, linkLabel, renderAction }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
        <h2>{title}</h2>
        {link && <Link to={link} className="muted" style={{ fontSize: '0.85rem' }}>{linkLabel} -&gt;</Link>}
      </div>
      {items.length === 0 ? (
        <p className="muted">{empty}</p>
      ) : (
        <div className="grid grid--cards">
          {items.slice(0, 4).map((p, i) => (
            <div key={p.id} className={renderAction ? 'favorite-card' : undefined}>
              <PaintingCard painting={p} index={i} />
              {renderAction?.(p)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
