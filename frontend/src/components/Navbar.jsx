import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, selectIsAdmin, logout } from '../features/auth/authSlice.js';
import { authApi } from '../api/endpoints.js';

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

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    dispatch(logout());
    navigate('/');
  };

  return (
    <header style={{ borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'var(--white)', zIndex: 50 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
        <Link to="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1.3rem', letterSpacing: '0.04em' }}>
          ART<span style={{ color: 'var(--navy)' }}>MIND</span>
        </Link>
        <nav style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} style={({ isActive }) => ({
              fontSize: '0.85rem', letterSpacing: '0.04em',
              color: isActive ? 'var(--navy)' : 'var(--dark-gray)',
              borderBottom: isActive ? '2px solid var(--navy)' : '2px solid transparent', paddingBottom: 4,
            })}>{l.label}</NavLink>
          ))}
          {user ? (
            <>
              <NavLink to="/dashboard" style={{ fontSize: '0.85rem' }}>Dashboard</NavLink>
              <NavLink to="/favorites" style={{ fontSize: '0.85rem' }}>Favorites</NavLink>
              {isAdmin && <NavLink to="/admin" style={{ fontSize: '0.85rem', color: 'var(--navy)' }}>Admin</NavLink>}
              <button className="btn btn--ghost" style={{ padding: '8px 18px' }} onClick={handleLogout}>Sign out</button>
            </>
          ) : (
            <Link to="/login" className="btn" style={{ padding: '8px 22px' }}>Sign in</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
