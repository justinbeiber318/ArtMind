import { useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, selectIsAdmin, logout } from '../features/auth/authSlice.js';
import { authApi } from '../api/endpoints.js';
import { gsap } from 'gsap';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

export default function Navbar() {
  const { t } = useTranslation();
  const user = useSelector(selectUser);
  const isAdmin = useSelector(selectIsAdmin);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoRef = useRef(null);
  const linksRef = useRef([]);

  const links = [
    { to: '/gallery', label: t('gallery') },
    { to: '/ai-search', label: t('ai_search') },
    { to: '/ai-recognition', label: t('recognition') },
  ];

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

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
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

        <nav style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          {links.map((link, index) => (
            <NavLink
              key={link.to}
              to={link.to}
              ref={(el) => (linksRef.current[index] = el)}
              style={({ isActive }) => ({
                fontSize: '0.85rem',
                letterSpacing: '0.04em',
                color: isActive ? 'var(--navy)' : 'var(--dark-gray)',
                borderBottom: isActive ? '2px solid var(--navy)' : '2px solid transparent',
                paddingBottom: 4,
                opacity: 0,
              })}
            >
              {link.label}
            </NavLink>
          ))}

          {user ? (
            <>
              <NavLink
                to="/dashboard"
                ref={(el) => (linksRef.current[links.length] = el)}
                style={({ isActive }) => ({
                  fontSize: '0.85rem',
                  color: isActive ? 'var(--navy)' : 'var(--dark-gray)',
                  opacity: 0,
                })}
              >
                {t('dashboard')}
              </NavLink>
              <NavLink
<<<<<<< HEAD
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
=======
                to="/favorites"
                ref={(el) => (linksRef.current[links.length + 1] = el)}
>>>>>>> 60bfa34 (Language)
                style={({ isActive }) => ({
                  fontSize: '0.85rem',
                  color: isActive ? 'var(--navy)' : 'var(--dark-gray)',
                  opacity: 0,
                })}
              >
                {t('favorites')}
              </NavLink>
              {isAdmin && (
<<<<<<< HEAD
                <NavLink 
                  to="/admin" 
                  ref={el => linksRef.current[links.length + 3] = el}
=======
                <NavLink
                  to="/admin"
                  ref={(el) => (linksRef.current[links.length + 2] = el)}
>>>>>>> 60bfa34 (Language)
                  style={({ isActive }) => ({
                    fontSize: '0.85rem',
                    color: isActive ? 'var(--navy)' : 'var(--dark-gray)',
                    opacity: 0,
                  })}
                >
                  {t('admin')}
                </NavLink>
              )}
<<<<<<< HEAD
              <div ref={el => linksRef.current[links.length + 4] = el} style={{ opacity: 0 }}>
                <button className="btn btn--ghost" style={{ padding: '8px 18px' }} onClick={handleLogout}>Sign out</button>
=======
              <div ref={(el) => (linksRef.current[links.length + 3] = el)} style={{ opacity: 0 }}>
                <button className="btn btn--ghost" style={{ padding: '8px 18px' }} onClick={handleLogout}>
                  {t('logout')}
                </button>
>>>>>>> 60bfa34 (Language)
              </div>
            </>
          ) : (
            <div ref={(el) => (linksRef.current[links.length] = el)} style={{ opacity: 0 }}>
              <Link to="/login" className="btn" style={{ padding: '8px 22px' }}>
                {t('login')}
              </Link>
            </div>
          )}

          <select
            value={i18n.language}
            onChange={(e) => changeLanguage(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #ddd', cursor: 'pointer' }}
          >
            <option value="vi">🇻🇳 VI</option>
            <option value="en">🇬🇧 EN</option>
            <option value="fr">🇫🇷 FR</option>
            <option value="ja">🇯🇵 JA</option>
            <option value="ko">🇰🇷 KO</option>
          </select>
        </nav>
      </div>
    </header>
  );
}
