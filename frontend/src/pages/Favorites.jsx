import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { favoriteApi } from '../api/endpoints.js';
import PaintingCard from '../components/PaintingCard.jsx';

export default function Favorites() {
  const qc = useQueryClient();
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: favoriteApi.list,
  });
  const removeFavorite = useMutation({
    mutationFn: (paintingId) => favoriteApi.toggle(paintingId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['favorites'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return (
    <>
      <div className="page-head">
        <div className="container">
          <div className="eyebrow">Saved works</div>
          <h1>Your favorites</h1>
        </div>
      </div>

      <section className="section container">
        {isLoading ? (
          <div className="spinner" />
        ) : favorites.length === 0 ? (
          <div className="center" style={{ padding: '48px 0' }}>
            <p className="muted" style={{ marginBottom: 20 }}>You haven't saved any works yet.</p>
            <Link to="/gallery" className="btn">Explore the gallery</Link>
          </div>
        ) : (
          <div className="grid grid--cards">
            {favorites.map((p, i) => (
              <div key={p.id} className="favorite-card">
                <PaintingCard painting={p} index={i} />
                <button
                  type="button"
                  className="btn btn--ghost favorite-card__remove"
                  onClick={() => removeFavorite.mutate(p.id)}
                  disabled={removeFavorite.isPending}
                >
                  Remove favorite
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
