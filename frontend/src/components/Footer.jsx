import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: '#040404', color: 'var(--muted)', marginTop: 80, borderTop: '1px solid var(--border)' }}>
      <div className="container" style={{ padding: '56px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 32 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', color: 'var(--dark-gray)', fontSize: '1.2rem', marginBottom: 12, letterSpacing: '0.08em' }}>AURELIS</div>
          <p style={{ fontSize: '0.85rem', maxWidth: 260 }}>A curated digital gallery pairing fine art with intelligent discovery.</p>
        </div>
        <div>
          <h4 style={{ color: 'var(--navy)', fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 14 }}>Explore</h4>
          <ul style={{ listStyle: 'none', fontSize: '0.88rem', lineHeight: 2 }}>
            <li><Link to="/gallery" style={{ transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--navy)'} onMouseLeave={(e) => e.target.style.color = ''}>Gallery</Link></li>
            <li><Link to="/ai-search" style={{ transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--navy)'} onMouseLeave={(e) => e.target.style.color = ''}>AI Search</Link></li>
            <li><Link to="/ai-recognition" style={{ transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--navy)'} onMouseLeave={(e) => e.target.style.color = ''}>Recognition</Link></li>
          </ul>
        </div>
        <div>
          <h4 style={{ color: 'var(--navy)', fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 14 }}>Account</h4>
          <ul style={{ listStyle: 'none', fontSize: '0.88rem', lineHeight: 2 }}>
            <li><Link to="/login" style={{ transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--navy)'} onMouseLeave={(e) => e.target.style.color = ''}>Sign in</Link></li>
            <li><Link to="/register" style={{ transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--navy)'} onMouseLeave={(e) => e.target.style.color = ''}>Create account</Link></li>
            <li><Link to="/dashboard" style={{ transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--navy)'} onMouseLeave={(e) => e.target.style.color = ''}>Dashboard</Link></li>
          </ul>
        </div>
      </div>
      <div style={{ borderTop: '1px solid var(--border)', padding: '20px 0', textAlign: 'center', fontSize: '0.8rem', color: 'var(--muted)' }}>
        © {new Date().getFullYear()} Aurelis. All works shown for demonstration.
      </div>
    </footer>
  );
}
