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
    { to: '/gallery', label: t('gallery'), icon: 'gallery' },
    { to: '/virtual-gallery', label: t('virtual_gallery', { defaultValue: 'Virtual Museum' }), icon: 'museum' },
    { to: '/ai-search', label: t('ai_search'), icon: 'spark-search' },
    { to: '/ai-recognition', label: t('recognition'), icon: 'scan' },
  ];

  const userLinks = [
    { to: '/upload', label: t('upload'), icon: 'upload' },
    { to: '/dashboard', label: t('dashboard'), icon: 'dashboard' },
    { to: '/profile', label: t('profile'), icon: 'profile' },
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
    try {
      await authApi.logout();
    } catch {
      /* ignore: clear local session even if the server request fails */
    } finally {
      dispatch(logout());
      navigate('/', { replace: true });
    }
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
              <Icon name={link.icon} />
              <span>{link.label}</span>
            </NavLink>
          ))}

          {user && !isAdmin && (
            <>
              {userLinks.map((link, index) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  ref={(el) => (linksRef.current[links.length + index] = el)}
                  className="site-header__link"
                  style={navLinkStyle}
                >
                  <Icon name={link.icon} />
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </>
          )}
          {isAdmin && (
            <NavLink
              to="/admin/dashboard"
              ref={(el) => (linksRef.current[links.length] = el)}
              className="site-header__link"
              style={navLinkStyle}
            >
              <Icon name="dashboard" />
              <span>{t('admin')}</span>
            </NavLink>
          )}
        </nav>

        <div className="site-header__actions">
          {user ? (
            <div ref={(el) => (linksRef.current[links.length + 4] = el)} style={{ opacity: 0 }}>
              <button type="button" className="btn btn--ghost site-header__button" onClick={handleLogout}>
                <Icon name="logout" />
                <span>{t('logout')}</span>
              </button>
            </div>
          ) : (
            <div ref={(el) => (linksRef.current[links.length] = el)} style={{ opacity: 0 }}>
              <Link to="/login" className="btn site-header__button">
                <Icon name="login" />
                <span>{t('login')}</span>
              </Link>
            </div>
          )}

          <label className="site-header__language-wrap">
            <Icon name="globe" />
            <span className="site-header__language-current">{i18n.language.toUpperCase()}</span>
            <Icon name="chevron-down" />
            <select
              value={i18n.language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="site-header__language"
              aria-label="Language"
            >
              <option value="vi">VI</option>
              <option value="en">EN</option>
              <option value="fr">FR</option>
              <option value="ja">JA</option>
              <option value="ko">KO</option>
            </select>
          </label>
        </div>
      </div>
    </header>
  );
}

function Icon({ name }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
  };

  const paths = {
    gallery: <><rect x="4" y="5" width="16" height="14" rx="1.5" /><path d="M8 13l2.5-2.5L15 15l1.5-1.5L20 17" /><circle cx="15.5" cy="9.5" r="1" /></>,
    museum: <><path d="M4 9.5l8-4.5 8 4.5" /><path d="M5 9.5h14" /><rect x="5.5" y="9.5" width="13" height="9.5" rx="1.2" /><path d="M8 9.5v9.5M12 9.5v9.5M16 9.5v9.5" /></>,
    'spark-search': <><circle cx="10.5" cy="10.5" r="5.5" /><path d="M16 16l4 4" /><path d="M19 3v4" /><path d="M21 5h-4" /></>,
    scan: <><path d="M4 8V5a1 1 0 0 1 1-1h3" /><path d="M16 4h3a1 1 0 0 1 1 1v3" /><path d="M20 16v3a1 1 0 0 1-1 1h-3" /><path d="M8 20H5a1 1 0 0 1-1-1v-3" /><path d="M8 12h8" /></>,
    upload: <><path d="M12 16V4" /><path d="M7 9l5-5 5 5" /><path d="M5 20h14" /></>,
    dashboard: <><rect x="4" y="4" width="6" height="7" rx="1" /><rect x="14" y="4" width="6" height="5" rx="1" /><rect x="14" y="13" width="6" height="7" rx="1" /><rect x="4" y="15" width="6" height="5" rx="1" /></>,
    profile: <><circle cx="12" cy="8" r="4" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
    logout: <><path d="M10 6H6v12h4" /><path d="M13 16l4-4-4-4" /><path d="M17 12H9" /></>,
    login: <><path d="M14 6h4v12h-4" /><path d="M11 16l4-4-4-4" /><path d="M15 12H5" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a13.5 13.5 0 0 1 0 18" /><path d="M12 3a13.5 13.5 0 0 0 0 18" /></>,
    'chevron-down': <path d="M6 9l6 6 6-6" />,
  };

  return <svg {...common}>{paths[name]}</svg>;
}
