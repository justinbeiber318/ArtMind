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

  const navLinkStyle = ({ isActive }) => ({
    color: isActive ? 'var(--navy)' : 'var(--dark-gray)',
    borderBottomColor: isActive ? 'var(--navy)' : 'transparent',
    opacity: 0,
  });

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link
          ref={logoRef}
          to="/"
          className="site-header__logo"
          style={{ opacity: 0 }}
        >
          AURE<span style={{ color: 'var(--navy)' }}>LIS</span>
        </Link>

        <nav className="site-header__nav" aria-label="Primary navigation">
          {links.map((link, index) => (
            <NavLink
              key={link.to}
              to={link.to}
              ref={(el) => (linksRef.current[index] = el)}
              className="site-header__link"
              style={navLinkStyle}
            >
              {link.label}
            </NavLink>
          ))}

          {user && !isAdmin && (
            <>
              <NavLink
                to="/dashboard"
                ref={(el) => (linksRef.current[links.length] = el)}
                className="site-header__link"
                style={navLinkStyle}
              >
                {t('dashboard')}
              </NavLink>
              <NavLink
                to="/upload"
                ref={(el) => (linksRef.current[links.length + 1] = el)}
                className="site-header__link"
                style={navLinkStyle}
              >
                {t('upload')}
              </NavLink>
              <NavLink
                to="/favorites"
                ref={(el) => (linksRef.current[links.length + 2] = el)}
                className="site-header__link"
                style={navLinkStyle}
              >
                {t('favorites')}
              </NavLink>
              <NavLink
                to="/profile"
                ref={(el) => (linksRef.current[links.length + 3] = el)}
                className="site-header__link"
                style={navLinkStyle}
              >
                {t('profile')}
              </NavLink>
            </>
          )}
          {isAdmin && (
            <NavLink
              to="/admin/dashboard"
              ref={(el) => (linksRef.current[links.length] = el)}
              className="site-header__link"
              style={navLinkStyle}
            >
              {t('admin')}
            </NavLink>
          )}
        </nav>

        <div className="site-header__actions">
          {user ? (
            <div ref={(el) => (linksRef.current[links.length + 4] = el)} style={{ opacity: 0 }}>
              <button className="btn btn--ghost site-header__button" onClick={handleLogout}>{t('logout')}</button>
            </div>
          ) : (
            <div ref={(el) => (linksRef.current[links.length] = el)} style={{ opacity: 0 }}>
              <Link to="/login" className="btn site-header__button">
                {t('login')}
              </Link>
            </div>
          )}

          <select
            value={i18n.language}
            onChange={(e) => changeLanguage(e.target.value)}
            className="site-header__language"
          >
            <option value="vi">VI</option>
            <option value="en">EN</option>
            <option value="fr">FR</option>
            <option value="ja">JA</option>
            <option value="ko">KO</option>
          </select>
        </div>
      </div>
    </header>
  );
}
