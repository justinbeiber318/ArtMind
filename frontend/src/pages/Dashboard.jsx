import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { favoriteApi, paintingApi, recognitionApi, userApi } from '../api/endpoints.js';
import { selectUser } from '../features/auth/authSlice.js';
import PaintingCard from '../components/PaintingCard.jsx';

const dashboardMenu = [
  ['overview', 'overview'],
  ['favorites', 'favorites'],
  ['recently-viewed', 'recently_viewed'],
  ['ai-recommendations', 'recommendations'],
  ['my-uploads', 'my_uploads'],
  ['recognition-history', 'recognition_history'],
];

export default function Dashboard() {
  const { t } = useTranslation();
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
          <div className="eyebrow">{t('your_space')}</div>
          <h1>{t('welcome_back_user', { name: user?.name?.split(' ')[0] || t('collector') })}</h1>
        </div>
      </div>

      <section className="section container dashboard-shell">
        <aside className="dashboard-menu" aria-label="Dashboard sections">
          {dashboardMenu.map(([id, label]) => (
            <a key={id} className="dashboard-menu__item" href={`#${id}`}>
              {t(label)}
            </a>
          ))}
        </aside>

        <div className="dashboard-content">
          <section id="overview" className="dashboard-section">
            <div className="dashboard-section__head">
              <h2>{t('overview')}</h2>
            </div>
            <div className="dashboard-stats">
              <Stat label={t('favorites')} value={favorites.length} />
              <Stat label={t('recently_viewed')} value={recentlyViewed.length} />
              <Stat label={t('recommendations')} value={recommendations.length} />
              <Stat label={t('my_uploads')} value={myUploads.length} />
            </div>

            <div className="dashboard-collections">
              <h3>{t('personal_collections')}</h3>
              {collections.length === 0 ? (
                <p className="muted">{t('no_collections')}</p>
              ) : (
                <div className="dashboard-collection-grid">
                  {collections.map((c) => (
                    <div key={c.id} className="dashboard-collection-card">
                      <h4 style={{ fontWeight: 500 }}>{c.name}</h4>
                      <p className="muted" style={{ fontSize: '0.85rem', marginTop: 4 }}>
                        {t('works_count', { count: c._count?.items ?? 0 })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section id="favorites" className="dashboard-section">
            <Row
              title={t('favorites')}
              items={favorites}
              empty={t('no_favorites_saved')}
              link="/favorites"
              linkLabel={t('view_all')}
              renderAction={(painting) => (
                <button
                  type="button"
                  className="btn btn--ghost favorite-card__remove"
                  onClick={() => removeFavorite.mutate(painting.id)}
                  disabled={removeFavorite.isPending}
                >
                  {t('remove_favorite')}
                </button>
              )}
            />
          </section>

          <section id="recently-viewed" className="dashboard-section">
            <Row title={t('recently_viewed')} items={recentlyViewed} empty={t('nothing_viewed_yet')} />
          </section>

          <section id="ai-recommendations" className="dashboard-section">
            <Row
              title={t('recommendations')}
              items={recommendations}
              empty={t('recommendations_empty')}
            />
          </section>

          <section id="my-uploads" className="dashboard-section">
            <Row
              title={t('my_uploads')}
              items={myUploads}
              empty={t('no_uploads_yet')}
              link="/upload"
              linkLabel={t('upload_artwork')}
            />
          </section>

          <section id="recognition-history" className="dashboard-section">
            <div className="dashboard-section__head">
              <h2>{t('recognition_history')}</h2>
              <Link to="/ai-recognition" className="muted">{t('run_recognition')} -&gt;</Link>
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
          <h4 style={{ fontWeight: 500, marginBottom: 16 }}>{t('activity')}</h4>
          {activity.length === 0 ? (
            <p className="muted" style={{ fontSize: '0.85rem' }}>{t('no_recent_activity')}</p>
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
                    {t('viewed_work')} <strong style={{ fontWeight: 500 }}>{a.painting?.title}</strong>
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
  const { t } = useTranslation();
  if (isLoading) return <div className="spinner" />;
  if (items.length === 0) return <p className="muted">{t('no_recognition_history')}</p>;

  return (
    <div className="recognition-history-list">
      {items.map((item) => (
        <article key={item.id} className="recognition-history-row">
          <img src={item.thumbnailUrl || item.imageUrl} alt="" />
          <div>
            <h3>{item.style || t('unknown_style')}</h3>
            <p className="muted">{new Date(item.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <span className="tag">{item.category || t('unknown_category')}</span>
          </div>
          <div className="recognition-history-row__actions">
            <Link className="btn btn--ghost" to={`/ai-recognition?result=${item.id}`}>{t('view_result')}</Link>
            <button className="btn btn--ghost" type="button" onClick={() => onDelete(item.id)} disabled={isDeleting}>
              {t('delete')}
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
      <div className="dashboard-row-head">
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
