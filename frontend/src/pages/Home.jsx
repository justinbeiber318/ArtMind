import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { paintingApi, categoryApi, artistApi, recommendationApi } from '../api/endpoints.js';
import PaintingCard from '../components/PaintingCard.jsx';

const testimonials = [
  { quote: 'ArtMind reads my taste better than any gallery assistant I have worked with.', name: 'Beatrice Hahn', role: 'Private Collector' },
  { quote: 'The recognition tool helped me catalogue an entire estate in an afternoon.', name: 'Daniel Osei', role: 'Estate Curator' },
  { quote: 'A quietly intelligent platform. The recommendations are genuinely useful.', name: 'Yuki Sato', role: 'Designer' },
];

export default function Home() {
  const featured = useQuery({ queryKey: ['paintings', 'featured'], queryFn: () => paintingApi.list({ sort: 'trending', limit: 8 }) });
  const categories = useQuery({ queryKey: ['categories'], queryFn: categoryApi.list });
  const artists = useQuery({ queryKey: ['artists', 'popular'], queryFn: artistApi.popular });
  const recs = useQuery({ queryKey: ['recs', 'preview'], queryFn: recommendationApi.preview });

  return (
    <>
      {/* Hero */}
      <section style={{ background: 'var(--light-gray)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center', minHeight: 520, padding: '64px 24px' }}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="eyebrow">A Curated Digital Gallery</div>
            <h1>Discover fine art, guided by intelligence.</h1>
            <p style={{ fontSize: '1.05rem', color: 'var(--muted)', margin: '20px 0 32px', maxWidth: 460 }}>
              Browse a considered collection of paintings, search in plain language, and let ArtMind surface the works that speak to you.
            </p>
            <div style={{ display: 'flex', gap: 14 }}>
              <Link to="/gallery" className="btn">Enter the Gallery</Link>
              <Link to="/ai-search" className="btn btn--ghost">Try AI Search</Link>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {(featured.data?.data || []).slice(0, 4).map((p) => (
              <img key={p.id} src={p.thumbnailUrl || p.imageUrl} alt={p.title}
                style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover' }} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured */}
      <section className="section container">
        <div className="eyebrow">Featured</div>
        <h2 style={{ marginBottom: 32 }}>Trending this week</h2>
        <div className="grid grid--cards">
          {(featured.data?.data || []).map((p, i) => <PaintingCard key={p.id} painting={p} index={i} />)}
        </div>
      </section>

      {/* Trending categories */}
      <section className="section--tight" style={{ background: 'var(--light-gray)' }}>
        <div className="container">
          <div className="eyebrow">Browse</div>
          <h2 style={{ marginBottom: 28 }}>Trending categories</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
            {(categories.data || []).map((c) => (
              <Link key={c.id} to={`/gallery?category=${c.slug}`}
                style={{ padding: '16px 26px', background: '#fff', border: '1px solid var(--border)', minWidth: 180 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem' }}>{c.name}</div>
                <div className="muted" style={{ fontSize: '0.82rem' }}>{c._count?.paintings ?? 0} works</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular artists */}
      <section className="section container">
        <div className="eyebrow">Makers</div>
        <h2 style={{ marginBottom: 28 }}>Popular artists</h2>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          {(artists.data || []).map((a) => (
            <Link key={a.id} to={`/gallery?artist=${a.slug}`} style={{ textAlign: 'center' }}>
              <img src={a.portraitUrl} alt={a.name} style={{ width: 110, height: 110, objectFit: 'cover', borderRadius: '50%', margin: '0 auto 12px' }} />
              <div style={{ fontFamily: 'var(--font-display)' }}>{a.name}</div>
              <div className="muted" style={{ fontSize: '0.8rem' }}>{a.nationality}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* AI recommendation preview */}
      <section className="section--tight" style={{ background: 'var(--navy)', color: '#fff' }}>
        <div className="container">
          <div className="eyebrow" style={{ color: '#9fc1e6' }}>Powered by AI</div>
          <h2 style={{ color: '#fff', marginBottom: 28 }}>Curated for discovery</h2>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {(recs.data || []).map((p) => (
              <Link key={p.id} to={`/paintings/${p.slug}`}>
                <img src={p.thumbnailUrl || p.imageUrl} alt={p.title} style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover' }} />
                <div style={{ paddingTop: 10, color: '#fff' }}>{p.title}</div>
                <div style={{ fontSize: '0.82rem', color: '#9fc1e6' }}>{p.artist?.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section container">
        <div className="eyebrow center">Voices</div>
        <h2 className="center" style={{ marginBottom: 40 }}>What collectors say</h2>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {testimonials.map((t) => (
            <blockquote key={t.name} style={{ borderLeft: '2px solid var(--navy)', paddingLeft: 20 }}>
              <p style={{ fontSize: '1.02rem', fontStyle: 'italic' }}>“{t.quote}”</p>
              <footer style={{ marginTop: 14 }}>
                <strong>{t.name}</strong><br /><span className="muted" style={{ fontSize: '0.85rem' }}>{t.role}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>
    </>
  );
}
