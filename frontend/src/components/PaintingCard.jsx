import { Link } from 'react-router-dom';
import { memo } from 'react';

function cloudinaryImage(url, width) {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,c_fill,w_${width}/`);
}

function PaintingCard({ painting, index = 0 }) {
  const tag = painting.style?.name || painting.category?.name;
  const source = painting.thumbnailUrl || painting.imageUrl;
  const image = cloudinaryImage(source, 520);
  const imageSet = source?.includes('res.cloudinary.com')
    ? `${cloudinaryImage(source, 360)} 360w, ${cloudinaryImage(source, 520)} 520w, ${cloudinaryImage(source, 720)} 720w`
    : undefined;
  const isPriority = index < 4;

  return (
    <div className="painting-card">
      <Link to={`/paintings/${painting.slug}`} className="painting-card__link">
        <div className="painting-card__media">
          <img
            src={image}
            srcSet={imageSet}
            sizes="(max-width: 640px) 92vw, (max-width: 1100px) 42vw, 320px"
            alt={painting.title}
            width="520"
            height="650"
            loading={isPriority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={isPriority ? 'high' : 'auto'}
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

export default memo(PaintingCard);
