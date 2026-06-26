import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { selectIsAdmin, selectIsAuthed } from '../features/auth/authSlice.js';

export default function Footer() {
  const { t } = useTranslation();
  const authed = useSelector(selectIsAuthed);
  const isAdmin = useSelector(selectIsAdmin);

  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div>
          <div className="site-footer__brand">AURELIS</div>
          <p className="site-footer__description">{t('footer_description')}</p>
        </div>

        <div>
          <h4 className="site-footer__title">{t('explore')}</h4>
          <ul className="site-footer__list">
            <li><Link to="/gallery">{t('gallery')}</Link></li>
            <li><Link to="/ai-search">{t('ai_search')}</Link></li>
            <li><Link to="/ai-recognition">{t('recognition')}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="site-footer__title">{t('account')}</h4>
          <ul className="site-footer__list">
            {!authed && (
              <>
                <li><Link to="/login">{t('sign_in')}</Link></li>
                <li><Link to="/register">{t('create_account')}</Link></li>
              </>
            )}

            {authed && isAdmin && (
              <li><Link to="/admin/dashboard">{t('admin')}</Link></li>
            )}

            {authed && !isAdmin && (
              <li><Link to="/dashboard">{t('dashboard')}</Link></li>
            )}
          </ul>
        </div>
      </div>

      <div className="site-footer__bottom">
        © {new Date().getFullYear()} Aurelis. {t('footer_copyright')}
      </div>
    </footer>
  );
}
