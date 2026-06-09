import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { favoriteApi } from '../api/endpoints.js';
import PaintingCard from '../components/PaintingCard.jsx';

export default function Favorites() {
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: favoriteApi.list,
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
            {favorites.map((p, i) => <PaintingCard key={p.id} painting={p} index={i} />)}
          </div>
        )}
      </section>
    </>
  );
}
