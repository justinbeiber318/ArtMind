import { Link } from 'react-router-dom';

export default function PaintingCard({ painting, index = 0 }) {
  const tag = painting.style?.name || painting.category?.name;

  return (
    <div className="painting-card" style={{ animationDelay: `${Math.min(index * 0.025, 0.2)}s` }}>
      <Link to={`/paintings/${painting.slug}`} className="painting-card__link">
        <div className="painting-card__media">
          <img
            src={painting.thumbnailUrl || painting.imageUrl}
            alt={painting.title}
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="painting-card__body">
          <h4>{painting.title}</h4>
          <p className="muted">{painting.artist?.name}</p>
          <div className="painting-card__meta">
            {tag ? <span className="tag">{tag}</span> : <span />}
            <span className="muted">{painting.viewCount?.toLocaleString()} views</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
