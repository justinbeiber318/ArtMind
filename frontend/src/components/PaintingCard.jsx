import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function PaintingCard({ painting, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.4) }}
    >
      <Link to={`/paintings/${painting.slug}`} style={{ display: 'block' }}>
        <div style={{ overflow: 'hidden', background: 'var(--light-gray)', aspectRatio: '4/5' }}>
          <motion.img
            src={painting.thumbnailUrl || painting.imageUrl}
            alt={painting.title}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div style={{ paddingTop: 14 }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 500 }}>{painting.title}</h4>
          <p className="muted" style={{ fontSize: '0.85rem' }}>{painting.artist?.name}</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
            <span className="tag">{painting.style?.name || painting.category?.name}</span>
            <span className="muted" style={{ fontSize: '0.78rem' }}>{painting.viewCount?.toLocaleString()} views</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
