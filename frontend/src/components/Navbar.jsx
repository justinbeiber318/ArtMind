import { useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, selectIsAdmin, logout } from '../features/auth/authSlice.js';
import { authApi } from '../api/endpoints.js';
import { gsap } from 'gsap';

const links = [
  { to: '/gallery', label: 'Gallery' },
  { to: '/ai-search', label: 'AI Search' },
  { to: '/ai-recognition', label: 'Recognition' },
];

export default function Navbar() {
  const user = useSelector(selectUser);
  const isAdmin = useSelector(selectIsAdmin);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoRef = useRef(null);
  const linksRef = useRef([]);

  useEffect(() => {
    gsap.fromTo(logoRef.current, 
      { opacity: 0, x: -30 }, 
      { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' }
    );
    gsap.fromTo(linksRef.current.filter(Boolean), 
      { opacity: 0, y: -15 }, 
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08, delay: 0.15 }
    );
  }, [user, isAdmin]);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    dispatch(logout());
    navigate('/');
  };

  return (
    <header style={{ borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'var(--white)', zIndex: 50 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
        <Link 
          ref={logoRef}
          to="/" 
          style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1.3rem', letterSpacing: '0.04em', opacity: 0 }}
        >
          AURE<span style={{ color: 'var(--navy)' }}>LIS</span>
        </Link>
        <nav style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          {links.map((l, index) => (
            <NavLink 
              key={l.to} 
              to={l.to} 
              ref={el => linksRef.current[index] = el}
              style={({ isActive }) => ({
                fontSize: '0.85rem', letterSpacing: '0.04em',
                color: isActive ? 'var(--navy)' : 'var(--dark-gray)',
                borderBottom: isActive ? '2px solid var(--navy)' : '2px solid transparent', paddingBottom: 4,
                opacity: 0,
              })}
            >
              {l.label}
            </NavLink>
          ))}
          {user ? (
            <>
              <NavLink 
                to="/dashboard" 
                ref={el => linksRef.current[links.length] = el}
                style={({ isActive }) => ({
                  fontSize: '0.85rem',
                  color: isActive ? 'var(--navy)' : 'var(--dark-gray)',
                  opacity: 0,
                })}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/upload"
                ref={el => linksRef.current[links.length + 1] = el}
                style={({ isActive }) => ({
                  fontSize: '0.85rem',
                  color: isActive ? 'var(--navy)' : 'var(--dark-gray)',
                  opacity: 0,
                })}
              >
                Upload
              </NavLink>
              <NavLink 
                to="/favorites" 
                ref={el => linksRef.current[links.length + 2] = el}
                style={({ isActive }) => ({
                  fontSize: '0.85rem',
                  color: isActive ? 'var(--navy)' : 'var(--dark-gray)',
                  opacity: 0,
                })}
              >
                Favorites
              </NavLink>
              {isAdmin && (
                <NavLink 
                  to="/admin" 
                  ref={el => linksRef.current[links.length + 3] = el}
                  style={({ isActive }) => ({
                    fontSize: '0.85rem',
                    color: isActive ? 'var(--navy)' : 'var(--dark-gray)',
                    opacity: 0,
                  })}
                >
                  Admin
                </NavLink>
              )}
              <div ref={el => linksRef.current[links.length + 4] = el} style={{ opacity: 0 }}>
                <button className="btn btn--ghost" style={{ padding: '8px 18px' }} onClick={handleLogout}>Sign out</button>
              </div>
            </>
          ) : (
            <div ref={el => linksRef.current[links.length] = el} style={{ opacity: 0 }}>
              <Link to="/login" className="btn" style={{ padding: '8px 22px' }}>Sign in</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
