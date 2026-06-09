import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--dark-gray)', color: '#cfcfcf', marginTop: 80 }}>
      <div className="container" style={{ padding: '56px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 32 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: '1.2rem', marginBottom: 12 }}>ARTMIND</div>
          <p style={{ fontSize: '0.85rem', maxWidth: 260 }}>A curated digital gallery pairing fine art with intelligent discovery.</p>
        </div>
        <div>
          <h4 style={{ color: '#fff', fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 14 }}>Explore</h4>
          <ul style={{ listStyle: 'none', fontSize: '0.88rem', lineHeight: 2 }}>
            <li><Link to="/gallery">Gallery</Link></li>
            <li><Link to="/ai-search">AI Search</Link></li>
            <li><Link to="/ai-recognition">Recognition</Link></li>
          </ul>
        </div>
        <div>
          <h4 style={{ color: '#fff', fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 14 }}>Account</h4>
          <ul style={{ listStyle: 'none', fontSize: '0.88rem', lineHeight: 2 }}>
            <li><Link to="/login">Sign in</Link></li>
            <li><Link to="/register">Create account</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
          </ul>
        </div>
      </div>
      <div style={{ borderTop: '1px solid #444', padding: '20px 0', textAlign: 'center', fontSize: '0.8rem' }}>
        © {new Date().getFullYear()} ArtMind. All works shown for demonstration.
      </div>
    </footer>
  );
}
